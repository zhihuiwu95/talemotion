"""Pre-generate expressive Azure narration. Key stays in the environment only."""
import concurrent.futures
import hashlib
import html
import json
import os
from pathlib import Path
import time
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
CONFIG = json.loads((ROOT / 'scripts/tts-config.json').read_text())
OUTPUT = ROOT / 'public/audio'


def clip_key(line):
    parts = [CONFIG['version'], CONFIG['voice'], CONFIG['format'], line['text'],
             line['style'], line['styleDegree'], line['rate'], line['pitch']]
    return hashlib.sha256(json.dumps(parts, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()[:20]


def ssml(line):
    return ('<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" '
            'xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">'
            f'<voice name="{CONFIG["voice"]}"><mstts:express-as style="{line["style"]}" '
            f'styledegree="{line["styleDegree"]}"><prosody rate="{line["rate"]}" pitch="{line["pitch"]}">'
            f'{html.escape(line["text"])}'
            '</prosody></mstts:express-as></voice></speak>')


def is_mp3(data):
    return len(data) > 1024 and (data.startswith(b'ID3') or (data[0] == 0xff and data[1] & 0xe0 == 0xe0))


def main():
    key = os.environ.get('AZURE_SPEECH_KEY', '').strip().strip('“”')
    if not key:
        raise SystemExit('AZURE_SPEECH_KEY is missing; export it in the generation shell.')
    lines = json.loads((ROOT / 'scripts/narration-input.json').read_text())
    base = f'https://{CONFIG["region"]}.tts.speech.microsoft.com'
    headers = {'Ocp-Apim-Subscription-Key': key}
    # Validate this resource's actual capabilities before a paid synthesis request.
    with urllib.request.urlopen(urllib.request.Request(base + '/cognitiveservices/voices/list', headers=headers), timeout=30) as response:
        voices = json.load(response)
    voice = next((v for v in voices if v['ShortName'] == CONFIG['voice']), None)
    required = {line['style'] for line in lines}
    if not voice or not required.issubset(set(voice.get('StyleList', []))):
        raise SystemExit('The configured voice or required styles are unavailable in this region.')
    OUTPUT.mkdir(parents=True, exist_ok=True)
    headers.update({'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': CONFIG['format'], 'User-Agent': 'TaleMotion-Narration'})

    def generate(line):
        digest = clip_key(line)
        path = OUTPUT / f'{digest}.mp3'
        if path.exists() and is_mp3(path.read_bytes()):
            return line['text'], f'audio/{digest}.mp3'
        for attempt in range(4):
            try:
                request = urllib.request.Request(base + '/cognitiveservices/v1', data=ssml(line).encode(), headers=headers, method='POST')
                with urllib.request.urlopen(request, timeout=40) as response:
                    data = response.read()
                if not is_mp3(data):
                    raise ValueError('Synthesis returned invalid audio')
                temporary = path.with_suffix('.tmp')
                temporary.write_bytes(data)
                temporary.replace(path)
                print(f'Generated {digest} ({line["style"]})', flush=True)
                return line['text'], f'audio/{digest}.mp3'
            except urllib.error.HTTPError as error:
                if error.code not in (429, 500, 502, 503, 504) or attempt == 3:
                    raise RuntimeError(f'Azure synthesis failed with HTTP {error.code}; manifest unchanged') from None
            except (urllib.error.URLError, TimeoutError, ValueError):
                if attempt == 3:
                    raise RuntimeError('Synthesis failed after retries; manifest unchanged') from None
            time.sleep(2 ** (attempt + 1))
        raise RuntimeError('Unreachable synthesis state')

    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        clips = dict(pool.map(generate, lines))
    manifest = {**CONFIG, 'clips': clips, 'settings': {line['text']: {k:v for k,v in line.items() if k != 'text'} for line in lines}}
    target = ROOT / 'src/generated/narration.json'
    temporary = target.with_suffix('.tmp')
    temporary.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(target)
    print(f'Published {len(clips)} Azure narration clips.', flush=True)


if __name__ == '__main__':
    main()
