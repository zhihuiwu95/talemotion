"""Offline approved cue prefixing. FFmpeg is a local tool, never a browser dependency."""
import hashlib
import json
import math
import re
import shutil
import subprocess
import tempfile
import wave
from pathlib import Path
from voice_director import ROOT, digest, is_mp3


def tools():
    ffmpeg, ffprobe = shutil.which('ffmpeg'), shutil.which('ffprobe')
    if not ffmpeg or not ffprobe:
        raise ValueError('FFmpeg/ffprobe required for local B audio production; install FFmpeg. No silent fallback.')
    return ffmpeg, ffprobe


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def registry():
    data = json.loads((ROOT / 'scripts/sound-cues.json').read_text())
    p = data['mixParameters']
    if set(p) != {'cueGain', 'speechGain', 'gapSeconds', 'sampleRate', 'bitrateKbps'}:
        raise ValueError('Unsupported mix parameters')
    for key in ['cueGain', 'speechGain']:
        if type(p[key]) not in (int, float) or not math.isfinite(p[key]) or not 0 < p[key] <= 1:
            raise ValueError('Invalid mix gain')
    if type(p['gapSeconds']) not in (int, float) or not 0 <= p['gapSeconds'] <= .5 or p['sampleRate'] != 24000 or p['bitrateKbps'] != 96:
        raise ValueError('Unsupported mix timing or encoding')
    if data['mixVersion'] != 'prefix-mp3-v1':
        raise ValueError('Unsupported mix version')
    return data


def cue_asset(cue_id, data):
    if cue_id not in data['cues']:
        raise ValueError('Unknown sound cue')
    entry = data['cues'][cue_id]
    if entry['path'] != f'scripts/sound-cues/{cue_id}.wav' or not re.fullmatch(r'[a-z][a-z0-9-]+', cue_id):
        raise ValueError('Unsafe cue path')
    path = ROOT / entry['path']
    if not path.is_file() or sha(path) != entry['sha256']:
        raise ValueError('Cue missing or checksum changed')
    with wave.open(str(path)) as audio:
        duration = audio.getnframes() / audio.getframerate()
        if audio.getnchannels() != 1 or audio.getsampwidth() != 2 or audio.getframerate() != 24000:
            raise ValueError('Cue must be 24kHz mono PCM16')
    if not .6 <= duration <= 1.5 or abs(duration-entry['durationSeconds']) > .001:
        raise ValueError('Invalid cue duration')
    return path


def duration(path):
    _, probe = tools()
    result = subprocess.run([probe, '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', str(path)], capture_output=True, text=True, check=True)
    value = float(result.stdout.strip())
    if not math.isfinite(value) or not 0 < value < 18:
        raise ValueError('Audio must be nonempty and shorter than 18 seconds (20s watchdog)')
    return value


def recipe(speech, cue_id, data):
    cue_asset(cue_id, data)
    return {'speechSha256': speech['audioSha256'], 'cue': cue_id,
            'cueSha256': data['cues'][cue_id]['sha256'],
            'mixParameters': data['mixParameters'], 'mixVersion': data['mixVersion']}


def compose(speech, cue_id):
    ffmpeg, _ = tools()
    data = registry()
    cue = cue_asset(cue_id, data)
    raw = ROOT / speech['src'] if speech['src'].startswith('public/') else ROOT / 'public' / speech['src']
    if sha(raw) != speech['audioSha256']:
        raise ValueError('Raw speech checksum mismatch')
    identity = recipe(speech, cue_id, data)
    identity['encoderVersion'] = subprocess.run([ffmpeg, '-version'], capture_output=True, text=True, check=True).stdout.splitlines()[0]
    key = digest(identity)
    target = ROOT / 'public/audio' / f'{key}.mp3'
    cache = target.with_suffix('.mix.json')
    if target.exists():
        if not cache.exists(): raise ValueError('Composite already exists without provenance; refusing overwrite')
        output = json.loads(cache.read_text())
        if output.get('compositeId') != key or output.get('audioSha256') != sha(target) or not is_mp3(target.read_bytes()):
            raise ValueError('Composite cache corrupted; refusing overwrite')
        return output
    params = data['mixParameters']
    with tempfile.TemporaryDirectory(prefix='talemotion-mix-') as folder:
        tmp = Path(folder) / 'mixed.mp3'
        graph = (f"[0:a]volume={params['cueGain']},apad=pad_dur={params['gapSeconds']}[cue];"
                 f"[1:a]volume={params['speechGain']}[speech];[cue][speech]concat=n=2:v=0:a=1[out]")
        subprocess.run([ffmpeg, '-v', 'error', '-nostdin', '-i', str(cue), '-i', str(raw),
                        '-filter_complex', graph, '-map', '[out]', '-ar', '24000', '-ac', '1',
                        '-codec:a', 'libmp3lame', '-b:a', '96k', str(tmp)], check=True, capture_output=True)
        actual = duration(tmp)
        expected = duration(raw) + data['cues'][cue_id]['durationSeconds'] + params['gapSeconds']
        if abs(actual-expected) > .15 or not is_mp3(tmp.read_bytes()):
            raise ValueError('Composite duration mismatch or invalid MP3')
        output = {'kind': 'composite', 'src': f'audio/{key}.mp3', 'audioSha256': sha(tmp),
                  'compositeId': key, 'durationSeconds': actual, **identity}
        target.parent.mkdir(parents=True, exist_ok=True)
        # Content addressed assets are added; the publication manifest is updated later.
        with target.open('xb') as dest: dest.write(tmp.read_bytes())
        cache.write_text(json.dumps(output, indent=2)+'\n')
        return output


def verify_output(speech, output, cue_id):
    if output['kind'] == 'speech':
        if cue_id or output['src'] != speech['src'] or output['audioSha256'] != speech['audioSha256']:
            raise ValueError('Speech output does not match authored sound direction')
        return
    if output['kind'] != 'composite' or not cue_id:
        raise ValueError('Unexpected composite output')
    expected = recipe(speech, cue_id, registry())
    if any(output.get(k) != v for k, v in expected.items()):
        raise ValueError('Stale composite dependency')
    identity = {**expected, 'encoderVersion': output['encoderVersion']}
    if output['compositeId'] != digest(identity) or output['src'] != f"audio/{digest(identity)}.mp3":
        raise ValueError('Composite identity mismatch')
    path = ROOT / 'public' / output['src']
    if not path.is_file() or sha(path) != output['audioSha256'] or not is_mp3(path.read_bytes()):
        raise ValueError('Invalid composite file')
    actual = duration(path)
    expected_duration = duration(ROOT / 'public' / speech['src']) + registry()['cues'][cue_id]['durationSeconds'] + expected['mixParameters']['gapSeconds']
    if abs(actual-output['durationSeconds']) > .01 or abs(actual-expected_duration) > .15:
        raise ValueError('Composite truncated or duration mismatch')
