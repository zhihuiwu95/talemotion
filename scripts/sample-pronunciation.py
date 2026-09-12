"""Controlled pronunciation comparison; never publishes production audio."""
import importlib.util
import json
import os
import shutil
from voice_director import ROOT, digest, direct, legacy_settings, load_config

spec = importlib.util.spec_from_file_location('generation', ROOT / 'scripts/generate-audio.py')
generation = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generation)
OUTPUT = ROOT / 'tmp/tts-samples/pronunciation'


def main():
    key = os.environ.get('AZURE_SPEECH_KEY')
    if not key:
        raise SystemExit('AZURE_SPEECH_KEY is missing in the generation environment.')
    config = load_config()
    voices = generation.query_voices(config, key)
    lines = json.loads((ROOT / 'scripts/narration-input.json').read_text())
    line = next(line for line in lines if line['text'] == '小熊少了一只手套。点点它，问问怎么啦？')
    archive = json.loads((ROOT / 'scripts/tts-legacy-manifest.json').read_text())
    OUTPUT.mkdir(parents=True, exist_ok=True)
    records = []
    for name in ['A-original', 'B-unmarked', 'C-shao3']:
        candidate = {**line, 'id': f'sample:pronunciation:{name}', 'segmentation': 'none'}
        if name in ('B-unmarked', 'C-shao3'):
            marks = [m for s in line.get('segments', []) for m in s.get('pronunciations', []) if m['text'] != '少']
            if name == 'C-shao3': marks.append({'text': '少', 'phoneme': 'shao3'})
            candidate['segments'] = [{'text': line['text'], **({'pronunciations': marks} if marks else {})}]
        settings = legacy_settings(line, archive) if name == 'A-original' else direct(candidate, config, voices)
        path = OUTPUT / f'{name}.mp3'
        if name == 'A-original':
            shutil.copyfile(ROOT / 'public' / archive['clips'][line['text']], path)
            data = path.read_bytes()
        else:
            data = generation.synthesize(settings, path, key)
        record = generation.clip_record(candidate, settings, path.name, data, 'sample-only')
        generation.write_json(path.with_suffix('.json'), record)
        path.with_suffix('.ssml').write_text(settings['ssml'])
        records.append(record)
        print(f'Ready pronunciation/{path.name}', flush=True)
    generation.write_json(OUTPUT / 'manifest.json', {'clips': records, 'voices': voices, 'configHash': digest(config)})
    (OUTPUT / 'README.md').write_text('# 少（shao3）发音对照\n\n原句：' + line['text'] + '\n\n'
        'A-original：原正式 MP3 副本。B-unmarked：当前朵朵声线，仅少不标注，其他已审读音保留。C-shao3：与 B 相同参数，仅指定少读 shao3。\n'
        '字幕不改；标注范围限定此句。样本尚待人工听感确认；未替换正式音频。\n'
        '重跑：npm run audio:sample:pronunciation。每个文件旁的 JSON/SSML 保留真实生成参数。\n')


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, ValueError) as error:
        raise SystemExit(str(error)) from None
