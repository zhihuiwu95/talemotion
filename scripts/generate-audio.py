"""Generate versioned Edge TTS MP3s; atomic manifest, resumable cache, bounded retry."""
import asyncio
import hashlib
import json
import os
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parent.parent
VOICE = 'zh-CN-XiaoxiaoNeural'
RATE = '-15%'
PITCH = '+0Hz'

async def main():
    lines = json.loads((ROOT / 'scripts/narration-input.json').read_text())
    output = ROOT / 'public/audio'
    output.mkdir(parents=True, exist_ok=True)
    manifest = {}
    semaphore = asyncio.Semaphore(3)
    async def generate(text):
        key = hashlib.sha256(f'{VOICE}|{RATE}|{PITCH}|{text}'.encode()).hexdigest()[:20]
        path = output / f'{key}.mp3'
        manifest[text] = f'audio/{key}.mp3'
        if path.exists() and path.stat().st_size > 1024:
            return
        async with semaphore:
            for attempt in range(4):
                temporary = path.with_suffix('.tmp')
                try:
                    await asyncio.wait_for(edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH, proxy=os.getenv('HTTPS_PROXY') or os.getenv('https_proxy')).save(str(temporary)), timeout=65)
                    if temporary.stat().st_size < 1024:
                        raise RuntimeError('Empty audio')
                    temporary.replace(path)
                    print(f'Generated {key}: {text[:18]}', flush=True)
                    return
                except Exception as error:
                    temporary.unlink(missing_ok=True)
                    print(f'Retry {attempt+1}: {type(error).__name__}: {error}', flush=True)
                    if attempt == 3:
                        raise
                    await asyncio.sleep(2 ** attempt)
    await asyncio.gather(*(generate(text) for text in lines))
    target = ROOT / 'src/generated/narration.json'
    temp = target.with_suffix('.tmp')
    temp.write_text(json.dumps({'voice': VOICE, 'rate': RATE, 'pitch': PITCH, 'clips': manifest}, ensure_ascii=False, indent=2) + '\n')
    temp.replace(target)
    print(f'Ready: {len(manifest)} clips', flush=True)

if __name__ == '__main__':
    asyncio.run(main())
