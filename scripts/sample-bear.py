"""Same-text bear identity audition. Candidate controls never alter production config."""
import importlib.util
import json
import os
import shutil
from datetime import datetime, timezone
from voice_director import ROOT, digest, direct, load_config

spec = importlib.util.spec_from_file_location('generation', ROOT / 'scripts/generate-audio.py')
generation = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generation)
OUTPUT = ROOT / 'tmp/tts-samples/bear-identity'
VARIANTS = [
    ('01-warm-reference', 'warm', {}, '温和参照：原 warm 参数，用同一句话建立音色参照'),
    ('02-original-excited', 'excited', {'style': 'cheerful', 'styleDegree': 1.35, 'rate': '+5%', 'pitch': '+0Hz'}, '上一轮 excited：cheerful 1.35，+5%，+0Hz'),
    ('03-stable-style', 'excited', {'style': 'narration-relaxed', 'styleDegree': 1.1, 'rate': '-2%', 'pitch': '-3Hz'},
     '调整一：沿用 warm 的 style、强度和音高，只把语速从 -8% 调到 -2%'),
    ('04-gentle-cheerful', 'excited', {'style': 'cheerful', 'styleDegree': 1.1, 'rate': '-2%', 'pitch': '-3Hz'},
     '调整二：与调整一仅 style 不同，使用低强度 cheerful'),
]


def main():
    key = os.environ.get('AZURE_SPEECH_KEY')
    if not key:
        raise SystemExit('AZURE_SPEECH_KEY is missing in the generation environment.')
    config = load_config()
    # Audition keeps both historical styles available even after production selects one.
    config['voiceProfiles']['bear']['styleMap']['cheerful'] = 'cheerful'
    voices = generation.query_voices(config, key)
    lines = json.loads((ROOT / 'scripts/narration-input.json').read_text())
    original = next(line for line in lines if line['source'] == 'adventure:ending-snowman')
    OUTPUT.mkdir(parents=True, exist_ok=True)
    records = []
    readme = ['# 小熊同句声线对照', '', original['text'], '',
              '四版同一 voice、同一文本、无额外分句或停顿。全部仅供试听，不修改正式配置或清单。', '',
              '| 文件 | 说明 | style | degree | rate | pitch |', '|---|---|---|---|---|---|']
    for name, emotion, overrides, description in VARIANTS:
        candidate = {**original, 'intent': 'success', 'emotion': emotion, 'segmentation': 'none', **overrides}
        candidate['id'] = f'sample:bear:{name}:{digest(candidate)[:20]}'
        settings = direct(candidate, config, voices)
        path = OUTPUT / f'{name}.mp3'
        previous = ROOT / 'tmp/tts-samples/B-speaker-aware/06-bear-excited.json'
        reference = json.loads(previous.read_text()) if previous.exists() else None
        # Preserve the exact waveform already heard when its generation settings match.
        if name == '02-original-excited' and reference and digest(reference['generation']) == digest(settings):
            source = previous.with_suffix('.mp3')
            if generation.hashlib.sha256(source.read_bytes()).hexdigest() != reference['audioSha256']:
                raise ValueError('Previous bear sample checksum mismatch')
            shutil.copyfile(source, path)
            data = path.read_bytes()
        else:
            data = generation.synthesize(settings, path, key)
        record = generation.clip_record(candidate, settings, path.name, data, 'sample-only')
        record['comparisonDescription'] = description
        generation.write_json(path.with_suffix('.json'), record)
        path.with_suffix('.ssml').write_text(settings['ssml'])
        records.append(record)
        readme.append(f'| {path.name} | {description} | {settings["style"]} | {settings["styleDegree"]} | {settings["rate"]} | {settings["pitch"]} |')
        print(f'Ready bear-identity/{path.name}', flush=True)
    generation.write_json(OUTPUT / 'manifest.json', {'status': 'awaiting-listening',
        'queriedAt': datetime.now(timezone.utc).isoformat(), 'region': config['region'],
        'voiceCapabilities': [v for v in voices if v['ShortName'] == config['voiceProfiles']['bear']['voice']],
        'clips': records})
    readme += ['', '运行 npm run audio:sample:bear 可重现。先听 01，再比较 02/03/04 是否像同一角色，以及是否保留自然兴奋感。',
               '01/03 只改变语速（emotion 标签不同但最终其余声音控制相同）；03/04 只改变 style。02 是上一轮参数参照。',
               '角色稳定性和情绪强弱由用户试听验收，生成成功不代表听感通过。']
    (OUTPUT / 'README.md').write_text('\n'.join(readme) + '\n')


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, ValueError) as error:
        raise SystemExit(str(error)) from None
