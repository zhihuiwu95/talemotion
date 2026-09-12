"""Deterministic, offline voice direction. No credentials or network in this module."""
import hashlib
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FIELDS = ('style', 'styleDegree', 'rate', 'pitch')
INTENTS = {'narration', 'dialogue', 'prompt', 'hint', 'success', 'comfort', 'question', 'ending'}
EMOTIONS = {'neutral', 'warm', 'gentle', 'curious', 'cheerful', 'excited', 'empathetic', 'sad', 'surprised'}


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'), allow_nan=False)


def digest(value):
    return hashlib.sha256(canonical(value).encode()).hexdigest()


def load_config():
    return json.loads((ROOT / 'scripts/tts-config.json').read_text())


def input_hash(line):
    return digest(line)


def validate_controls(value):
    if 'style' in value and not re.fullmatch(r'[a-z][a-z-]{0,39}', value['style']):
        raise ValueError('Invalid style')
    degree = value.get('styleDegree', 1)
    if isinstance(degree, bool) or not isinstance(degree, (float, int)) or not 0.01 <= degree <= 2:
        raise ValueError('styleDegree must be 0.01..2')
    for field, pattern in [('rate', r'[+-](?:[0-9]|[12][0-9]|30)%'), ('pitch', r'[+-](?:[0-9]|10)Hz')]:
        if field in value and not re.fullmatch(pattern, value[field]):
            raise ValueError(f'Invalid {field}')


def validate_line(line):
    if not isinstance(line.get('text'), str) or not 1 <= len(line['text']) <= 300:
        raise ValueError('Invalid text length')
    if any(ord(c) < 32 and c not in '\n\t\r' for c in line['text']):
        raise ValueError('Invalid XML control character')
    if line.get('intent') not in INTENTS or line.get('emotion') not in EMOTIONS:
        raise ValueError('Unknown intent or emotion')
    if not isinstance(line.get('speaker'), str) or not line['speaker']:
        raise ValueError('Missing speaker')
    validate_controls(line)
    if line.get('segmentation', 'none') not in ('none', 'sentences'):
        raise ValueError('Unknown segmentation mode')
    segments = line.get('segments')
    if segments is None:
        return
    if line.get('segmentation') == 'sentences':
        raise ValueError('Explicit segments cannot also enable automatic segmentation')
    validate_segments(segments, line['text'])


def validate_segments(segments, text):
    if not isinstance(segments, list) or not 1 <= len(segments) <= 24:
        raise ValueError('Expected 1..24 segments')
    spoken, total = '', 0
    for segment in segments:
        if not isinstance(segment, dict):
            raise ValueError('Segment must be an object')
        if 'pauseMs' in segment:
            pause = segment['pauseMs']
            if set(segment) != {'pauseMs'} or type(pause) is not int or not 0 <= pause <= 1000:
                raise ValueError('pauseMs must be an integer in 0..1000')
            total += pause
        else:
            if set(segment) - {'text', 'emotion', 'pronunciations', *FIELDS}:
                raise ValueError('Unsupported speech segment field')
            if not isinstance(segment.get('text'), str) or not segment['text']:
                raise ValueError('Empty speech segment')
            if segment.get('emotion', 'neutral') not in EMOTIONS:
                raise ValueError('Unknown segment emotion')
            validate_controls(segment)
            pronunciation_spans(segment)
            spoken += segment['text']
    if spoken != text:
        raise ValueError('Segment text must exactly match subtitle text')
    if total > 3000:
        raise ValueError('Total pauses exceed 3000ms')


def pronunciation_spans(segment):
    marks = segment.get('pronunciations')
    if marks is None:
        return []
    if not isinstance(marks, list) or not 1 <= len(marks) <= 32:
        raise ValueError('Expected 1..32 pronunciation annotations')
    spans = []
    text = segment['text']
    for mark in marks:
        if not isinstance(mark, dict) or set(mark) - {'text', 'phoneme', 'occurrence'} or not {'text', 'phoneme'} <= set(mark):
            raise ValueError('Unsupported pronunciation field')
        word, phoneme = mark['text'], mark['phoneme']
        if not isinstance(word, str) or not 1 <= len(word) <= 40:
            raise ValueError('Invalid pronunciation text')
        if not isinstance(phoneme, str) or len(phoneme) > 240 or not re.fullmatch(r'[a-zv]+[1-5]( [a-zv]+[1-5])*', phoneme):
            raise ValueError('Expected tone-number Mandarin SAPI syllables')
        occurrence = mark.get('occurrence')
        if occurrence is not None and (type(occurrence) is not int or not 1 <= occurrence <= 300):
            raise ValueError('Invalid pronunciation occurrence')
        start = text.find(word)
        for _ in range(1, occurrence or 1):
            if start >= 0:
                start = text.find(word, start + 1)
        if start < 0 or (occurrence is None and text.find(word, start + 1) >= 0):
            raise ValueError('Pronunciation text must occur exactly once in its segment')
        spans.append((start, start + len(word), phoneme))
    spans.sort()
    if any(left[1] > right[0] for left, right in zip(spans, spans[1:])):
        raise ValueError('Pronunciation spans cannot overlap')
    return spans


def render_text(segment):
    output, offset = [], 0
    for start, end, phoneme in pronunciation_spans(segment):
        output.append(html.escape(segment['text'][offset:start], quote=True))
        sapi = re.sub(r'([a-zv]+)([1-5])', r'\1 \2', phoneme)
        output.append(f'<phoneme alphabet="sapi" ph="{html.escape(sapi, quote=True)}">'
                      f'{html.escape(segment["text"][start:end], quote=True)}</phoneme>')
        offset = end
    output.append(html.escape(segment['text'][offset:], quote=True))
    return ''.join(output)


def segment_text(line, config):
    if 'segments' in line:
        return line['segments']
    if line.get('segmentation', config['segmentation']['default']) != 'sentences':
        return [{'text': line['text']}]
    # Punctuation is retained. No semantic/emotion inference, no trailing pause.
    parts = re.findall(r'.+?(?:[。！？]+|…{2,}|$)', line['text'], flags=re.S)
    segments = []
    for index, part in enumerate(parts):
        segments.append({'text': part})
        if index < len(parts) - 1:
            punctuation = '……' if part.endswith('……') else part[-1]
            segments.append({'pauseMs': config['segmentation']['pauseMs'].get(punctuation, 220)})
    validate_segments(segments, line['text'])
    return segments


def resolve_controls(line, profile, config, styles, segment=None):
    emotion = (segment or {}).get('emotion', line['emotion'])
    result = {'style': profile.get('defaultStyle'), 'styleDegree': profile.get('styleDegree', 1),
              'rate': profile.get('rate', '-5%'), 'pitch': profile.get('pitch', '+0Hz')}
    result.update(config['intentPresets'][line['intent']])
    result.update(config['emotionPresets'][emotion])
    result.update(profile.get('emotionOverrides', {}).get(emotion, {}))
    result.update({k: line[k] for k in FIELDS if k in line})
    result.update({k: segment[k] for k in FIELDS if k in (segment or {})})
    requested_style = result.pop('style')
    validate_controls(result)
    if requested_style is not None:
        validate_controls({'style': requested_style})
    style = profile.get('styleMap', {}).get(requested_style, requested_style)
    warning = None
    if style and style not in styles:
        warning = f'Unsupported style {style}; using prosody only'
        style = None
    elif requested_style != style:
        warning = f'Mapped style {requested_style} to {style}'
    return {**result, 'style': style, 'requestedStyle': requested_style, 'emotion': emotion}, warning


def render_ssml(voice, segments):
    if not re.fullmatch(r'[A-Za-z0-9:-]{1,120}', voice):
        raise ValueError('Invalid voice name')
    output = []
    for segment in segments:
        if 'pauseMs' in segment:
            pause = segment['pauseMs']
            if type(pause) is not int or not 0 <= pause <= 1000:
                raise ValueError('Invalid pause')
            output.append(f'<break time="{pause}ms"/>')
            continue
        settings = segment['settings']
        validate_controls({k: v for k, v in settings.items() if v is not None})
        spoken = (f'<prosody rate="{settings["rate"]}" pitch="{settings["pitch"]}">'
                  f'{render_text(segment)}</prosody>')
        if settings.get('style'):
            spoken = (f'<mstts:express-as style="{settings["style"]}" styledegree="{settings["styleDegree"]}">'
                      f'{spoken}</mstts:express-as>')
        output.append(spoken)
    return ('<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" '
            'xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">'
            f'<voice name="{voice}">{"".join(output)}</voice></speak>')


def direct(line, config, voices):
    validate_line(line)
    registration = config['speakers'].get(line['speaker'])
    if not registration:
        raise ValueError('Unknown speaker; register a voice profile first')
    profile_id = line.get('voiceProfile', registration['voiceProfile'])
    if profile_id not in config['voiceProfiles']:
        raise ValueError('Unknown voice profile')
    profile = config['voiceProfiles'][profile_id]
    voice = next((v for v in voices if v['ShortName'] == profile['voice']), None)
    if not voice or voice.get('VoiceType') != 'Neural' or not voice.get('Locale', '').startswith('zh'):
        raise ValueError(f'Configured Chinese Neural voice unavailable: {profile_id}')
    styles = set(voice.get('StyleList') or [])
    controls, warning = resolve_controls(line, profile, config, styles)
    warnings = [warning] if warning else []
    segments = []
    for segment in segment_text(line, config):
        if 'pauseMs' in segment:
            segments.append(segment)
        else:
            resolved, warning = resolve_controls(line, profile, config, styles, segment)
            segments.append({'text': segment['text'], 'settings': resolved,
                             **({'pronunciations': segment['pronunciations']} if 'pronunciations' in segment else {})})
            if warning and warning not in warnings:
                warnings.append(warning)
    settings = {
        'ttsConfigVersion': config['version'], 'provider': config['provider'], 'region': config['region'],
        'outputFormat': config['format'], 'voice': profile['voice'], 'voiceProfile': profile_id,
        'speaker': registration['speaker'], 'intent': line['intent'], 'emotion': line['emotion'],
        'text': line['text'], **controls, 'segments': segments,
        'ssml': render_ssml(profile['voice'], segments), 'warnings': warnings,
    }
    return settings


def legacy_settings(line, archive):
    old = archive['settings'][line['text']]
    controls = {**old, 'styleDegree': float(old['styleDegree'])}
    segments = [{'text': line['text'], 'settings': controls}]
    return {'ttsConfigVersion': archive['version'], 'provider': archive['provider'], 'region': archive['region'],
            'outputFormat': archive['format'], 'voice': archive['voice'], 'voiceProfile': 'legacy-single',
            'speaker': 'unspecified', 'text': line['text'], **controls, 'segments': segments,
            'ssml': render_ssml(archive['voice'], segments), 'warnings': []}


def is_mp3(data):
    return len(data) > 1024 and (data.startswith(b'ID3') or (data[0] == 0xff and data[1] & 0xe0 == 0xe0))
