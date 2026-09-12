"""Eight controlled A/B/C comparisons; never touches the production manifest."""
import concurrent.futures
import html
import importlib.util
import json
import os
import shutil
from datetime import datetime, timezone
from voice_director import ROOT, digest, direct, legacy_settings, load_config, segment_text, pronunciation_spans

spec = importlib.util.spec_from_file_location('generation', ROOT / 'scripts/generate-audio.py')
generation = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generation)
OUTPUT = ROOT / 'tmp/tts-samples'


def main():
    config = load_config()
    key = os.environ.get('AZURE_SPEECH_KEY', '').strip().strip('“”')
    if not key:
        raise SystemExit('AZURE_SPEECH_KEY is missing in the generation environment.')
    lines = json.loads((ROOT / 'scripts/narration-input.json').read_text())
    archive = json.loads((ROOT / 'scripts/tts-legacy-manifest.json').read_text())
    voices = generation.query_voices(config, key)
    generation.write_json(OUTPUT / 'voices-eastus.json', {
        'queriedAt': datetime.now(timezone.utc).isoformat(), 'region': config['region'],
        'voices': [v for v in voices if v.get('Locale', '').startswith('zh') and v.get('VoiceType') == 'Neural'],
    })
    by_source = {line['source']: line for line in lines if line['source'] != 'legacy'}
    narrator = next(line for line in lines if line['speaker'] == 'narrator')
    samples = [
        ('01-narrator-story', narrator, 'narration', 'neutral'),
        ('02-duoduo-prompt', by_source['adventure:search-after-bird'], 'prompt', 'neutral'),
        ('03-duoduo-curious', by_source['adventure:meet'], 'question', 'curious'),
        ('04-duoduo-excited', by_source['adventure:bird'], 'success', 'excited'),
        ('05-bear-warm', by_source['adventure:search'], 'dialogue', 'warm'),
        ('06-bear-excited', by_source['adventure:ending-snowman'], 'success', 'excited'),
        ('07-duoduo-empathetic-hint', by_source['adventure:hint'], 'hint', 'empathetic'),
        ('08-fox-warm-ending', by_source['pack:garden-gathering:flower-end'], 'ending', 'warm'),
    ]
    jobs = []
    for name, original, intent, emotion in samples:
        line = {**original, 'intent': intent, 'emotion': emotion}
        for group in ['A-current', 'B-speaker-aware', 'C-speaker-aware-segmented']:
            candidate = {**line, 'segmentation': 'sentences' if group.startswith('C') else 'none'}
            if group.startswith('C') and line.get('segments'):
                # Keep exact reviewed pronunciation spans while isolating added sentence pauses.
                absolute, offset = [], 0
                for segment in line['segments']:
                    if 'text' not in segment: continue
                    if set(segment) - {'text', 'pronunciations'}:
                        raise ValueError('C auto comparison requires annotation-only source segments')
                    absolute.extend((a + offset, b + offset, ph) for a, b, ph in pronunciation_spans(segment))
                    offset += len(segment['text'])
                plain = {k: v for k, v in candidate.items() if k != 'segments'}
                split = segment_text(plain, config)
                offset = 0
                for segment in split:
                    if 'text' not in segment: continue
                    marks = []
                    for a, b, ph in absolute:
                        if offset <= a < offset + len(segment['text']):
                            if b > offset + len(segment['text']): raise ValueError('Pronunciation crosses sentence boundary')
                            word = line['text'][a:b]
                            marks.append({'text': word, 'phoneme': ph, 'occurrence': segment['text'][:a-offset].count(word) + 1})
                    if marks: segment['pronunciations'] = marks
                    offset += len(segment['text'])
                candidate = {**candidate, 'segmentation': 'none', 'segments': split}
            candidate['id'] = f'sample:{name}:{group}:{digest(candidate)[:20]}'
            settings = legacy_settings(original, archive) if group.startswith('A') else direct(candidate, config, voices)
            jobs.append((name, group, candidate, settings))
    def generate(job):
        name, group, line, settings = job
        path = OUTPUT / group / f'{name}.mp3'
        path.parent.mkdir(parents=True, exist_ok=True)
        if group.startswith('A'):
            # Exact production waveform, not a newly synthesized approximation.
            shutil.copyfile(ROOT / 'public' / archive['clips'][line['text']], path)
            data = path.read_bytes()
        else:
            data = generation.synthesize(settings, path, key)
        record = generation.clip_record(line, settings, str(path.relative_to(OUTPUT)), data,
                                        'current-reference' if group.startswith('A') else 'sample-only')
        path.with_suffix('.ssml').write_text(settings['ssml'])
        generation.write_json(path.with_suffix('.json'), record)
        print(f'Ready {group}/{name}.mp3 ({settings["voice"]})', flush=True)
        return record
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        records = list(pool.map(generate, jobs))
    generation.write_json(OUTPUT / 'manifest.json', {'status': 'samples-only-awaiting-listening', 'clips': records})
    readme = ['# Azure Voice A/B/C samples', '',
              'A 是冻结正式录音的逐字节副本；B 是角色声线+intent/emotion；C 在 B 上只增加确定性分句/停顿。',
              '本轮 8×3=24 文件，其中仅 B/C 16 次候选合成；缓存命中不收费请求。未替换正式音频。',
              '先打开 index.html 手动对比；同音量盲听并记录角色、情绪、自然度、停顿与刺耳感。生成成功不是听感通过。',
              'speaker 是目标角色；A 的 generation.speaker=unspecified、voiceProfile=legacy-single 表示实际旧参数。',
              '', '| 文件 | speaker | voice | style / degree | rate / pitch | segmentation |', '|---|---|---|---|---|---|']
    for r in records:
        g = r['generation']
        readme.append(f'| {r["src"]} | {r["speaker"]} | {g["voice"]} | {g["style"]} / {g["styleDegree"]} | {g["rate"]} / {g["pitch"]} | {json.dumps(g["segments"], ensure_ascii=False)} |')
    (OUTPUT / 'README.md').write_text('\n'.join(readme) + '\n')
    cards = []
    for name, original, _, _ in samples:
        controls = ''.join(f'<div><button type="button" data-src="{group}/{name}.mp3">播放 {group}</button></div>' for group in ['A-current','B-speaker-aware','C-speaker-aware-segmented'])
        cards.append(f'<section><h2>{name}</h2><p>{html.escape(original["text"])}</p><div class="row">{controls}</div></section>')
    (OUTPUT / 'index.html').write_text('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TaleMotion 配音试听</title><style>body{font:16px system-ui;background:#fffdf5;color:#294e57;max-width:1100px;margin:32px auto;padding:16px}section{padding:18px;border-bottom:1px solid #abc}.row{display:flex;flex-wrap:wrap;gap:20px}audio{max-width:100%}</style><h1>TaleMotion 配音 A/B/C</h1><p>A：当前录音；B：角色声线与情绪；C：增加停顿。请手动播放，正式故事仍使用旧录音。</p>' + '<audio id="player" controls preload="none"></audio><p id="status" role="status">选择一个样本开始试听</p>' + ''.join(cards) + '''<script>
const player = document.getElementById('player');
const status = document.getElementById('status');
document.querySelectorAll('button[data-src]').forEach(button => button.addEventListener('click', () => {
  player.pause();
  player.src = button.dataset.src;
  status.textContent = button.dataset.src;
  player.play().catch(() => { status.textContent = '播放失败，请使用本地 MP3 文件试听。'; });
}));
</script></html>''')
    print('Samples complete: tmp/tts-samples/index.html; production manifest unchanged.')


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, ValueError) as error:
        raise SystemExit(str(error)) from None
