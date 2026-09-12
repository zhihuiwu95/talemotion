"""Azure build-time generation; sample and retained-production paths are isolated."""
import argparse
import concurrent.futures
import hashlib
import json
import os
from pathlib import Path
import time
import urllib.error
import urllib.request

from voice_director import ROOT, digest, direct, input_hash, is_mp3, legacy_settings, load_config


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(path)


def query_voices(config, key):
    base = f'https://{config["region"]}.tts.speech.microsoft.com'
    request = urllib.request.Request(base + '/cognitiveservices/voices/list', headers={'Ocp-Apim-Subscription-Key': key})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        raise RuntimeError(f'Azure voice query failed: HTTP {error.code}') from None
    except (urllib.error.URLError, TimeoutError, ValueError):
        raise RuntimeError('Azure voice query failed; check network and resource configuration') from None


def synthesize(settings, path, key):
    cache = path.with_suffix('.cache.json')
    fingerprint = digest(settings)
    if path.exists() and cache.exists():
        try:
            data = path.read_bytes()
            record = json.loads(cache.read_text())
            if record == {'hash': fingerprint, 'sha256': hashlib.sha256(data).hexdigest()} and is_mp3(data):
                return data
        except (ValueError, OSError):
            pass
    headers = {'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/ssml+xml',
               'X-Microsoft-OutputFormat': settings['outputFormat'], 'User-Agent': 'TaleMotion-Narration'}
    url = f'https://{settings["region"]}.tts.speech.microsoft.com/cognitiveservices/v1'
    for attempt in range(4):
        try:
            request = urllib.request.Request(url, data=settings['ssml'].encode(), headers=headers, method='POST')
            with urllib.request.urlopen(request, timeout=40) as response:
                data = response.read()
            if not is_mp3(data):
                raise ValueError('Invalid MP3')
            path.parent.mkdir(parents=True, exist_ok=True)
            temporary = path.with_suffix('.mp3.tmp')
            temporary.write_bytes(data)
            temporary.replace(path)
            write_json(cache, {'hash': fingerprint, 'sha256': hashlib.sha256(data).hexdigest()})
            return data
        except urllib.error.HTTPError as error:
            if error.code not in (429, 500, 502, 503, 504) or attempt == 3:
                raise RuntimeError(f'Azure synthesis failed: HTTP {error.code}; production manifest unchanged') from None
        except (urllib.error.URLError, TimeoutError, ValueError):
            if attempt == 3:
                raise RuntimeError('Azure synthesis failed after retries; production manifest unchanged') from None
        time.sleep(2 ** (attempt + 1))
    raise RuntimeError('Synthesis failed')


def clip_record(line, settings, src, data, status='speaker-aware'):
    return {'id': line['id'], 'src': src, 'text': line['text'], 'speaker': line['speaker'],
            'voiceProfile': settings['voiceProfile'], 'voice': settings['voice'],
            'emotion': line['emotion'], 'intent': line['intent'],
            **{k: settings[k] for k in ('style', 'styleDegree', 'rate', 'pitch')},
            'status': status, 'inputHash': input_hash(line), 'generationHash': digest(settings),
            'audioSha256': hashlib.sha256(data).hexdigest(), 'generation': settings}


def migrate_legacy(lines, archive, config):
    clips = {}
    for line in lines:
        old = archive['settings'].get(line['text'])
        if not old or old['style'] != line['legacyStyle']:
            raise ValueError('Legacy migration requires unchanged published text/style')
        settings = legacy_settings(line, archive)
        src = archive['clips'][line['text']]
        data = (ROOT / 'public' / src).read_bytes()
        if not is_mp3(data):
            raise ValueError('Invalid retained MP3')
        clips[line['id']] = clip_record(line, settings, src, data, 'legacy-retained')
    return {'schemaVersion': 2, 'release': 'legacy-retained-awaiting-listening',
            'targetConfigHash': digest(config), 'clips': clips}


def publish(lines, config, voices, key, target):
    # Resolve every input before spending synthesis requests; invalid config cannot partially publish.
    resolved = [(line, direct(line, config, voices)) for line in lines]
    # Identical requests share a cache file and must not race on its temporary path.
    unique = {digest(settings): settings for _, settings in resolved}
    def generate(item):
        fingerprint, settings = item
        path = ROOT / 'public/audio' / f'{fingerprint}.mp3'
        return fingerprint, synthesize(settings, path, key)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        files = dict(pool.map(generate, unique.items()))
    clips = {line['id']: clip_record(line, settings, f'audio/{digest(settings)}.mp3', files[digest(settings)])
             for line, settings in resolved}
    write_json(target, {'schemaVersion': 2, 'release': 'speaker-aware', 'targetConfigHash': digest(config), 'voices': voices, 'clips': clips})


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--publish', action='store_true', help='Explicit full production generation, only after listening approval')
    parser.add_argument('--migrate-legacy', action='store_true', help='One-time metadata bridge; no synthesis')
    args = parser.parse_args()
    if args.publish == args.migrate_legacy:
        raise SystemExit('Choose --publish AFTER listening, or --migrate-legacy for the one-time metadata bridge. Use npm run audio:sample first.')
    config = load_config()
    lines = json.loads((ROOT / 'scripts/narration-input.json').read_text())
    target = ROOT / 'src/generated/narration.json'
    if args.migrate_legacy:
        if json.loads(target.read_text()).get('schemaVersion') == 2:
            raise SystemExit('Manifest already migrated; refusing to re-label changed inputs as retained recordings.')
        archive = json.loads((ROOT / 'scripts/tts-legacy-manifest.json').read_text())
        write_json(target, migrate_legacy(lines, archive, config))
        print(f'Migrated {len(lines)} clip identities; all original MP3 files retained.')
        return
    key = os.environ.get('AZURE_SPEECH_KEY', '').strip().strip('“”')
    if not key:
        raise SystemExit('AZURE_SPEECH_KEY is missing in the generation environment.')
    from pronunciation_review import check_current
    check_current(lines)
    voices = query_voices(config, key)
    publish(lines, config, voices, key, target)
    print(f'Published {len(lines)} speaker-aware clips.')


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, ValueError) as error:
        raise SystemExit(str(error)) from None
