"""Verify actual published generation, not the unapproved candidate configuration."""
import hashlib
import json
import re
from voice_director import ROOT, digest, input_hash, is_mp3, legacy_settings, load_config, direct


def verify_v2(lines, manifest, config, archive):
    if manifest.get('schemaVersion') != 2 or (manifest.get('release') == 'speaker-aware' and manifest.get('targetConfigHash') != digest(config)):
        raise ValueError('Stale manifest configuration; retain release or explicitly publish after listening')
    if set(manifest['clips']) != {line['id'] for line in lines}:
        raise ValueError('Manifest clip IDs do not match narration inputs')
    retained = 0
    for line in lines:
        record = manifest['clips'][line['id']]
        if record['id'] != line['id'] or record['inputHash'] != input_hash(line):
            raise ValueError('Stale narration input')
        settings = record['generation']
        for field in ('text', 'speaker', 'emotion', 'intent'):
            if record[field] != line[field]:
                raise ValueError(f'Stale {field}')
        for field in ('voice', 'voiceProfile', 'style', 'styleDegree', 'rate', 'pitch'):
            if record[field] != settings[field]:
                raise ValueError(f'Manifest differs from actual generation: {field}')
        if record['status'] == 'legacy-retained':
            if manifest.get('release') != 'legacy-retained-awaiting-listening':
                raise ValueError('Retained recording in a speaker-aware release')
            if settings != legacy_settings(line, archive) or record['src'] != archive['clips'][line['text']]:
                raise ValueError('Retained recording differs from frozen legacy archive')
            if line['legacyStyle'] != archive['settings'][line['text']]['style']:
                raise ValueError('Retained style mismatch')
            old = archive['settings'][line['text']]
            old_key = [archive['version'], archive['voice'], archive['format'], line['text'],
                       old['style'], old['styleDegree'], old['rate'], old['pitch']]
            old_hash = hashlib.sha256(json.dumps(old_key, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()[:20]
            if record['src'] != f'audio/{old_hash}.mp3':
                raise ValueError('Invalid legacy cache identity')
            retained += 1
        elif record['status'] == 'speaker-aware':
            # Use the exact synthesis-time capability list. Verification is offline;
            # generation always obtains a fresh list before requests.
            voices = manifest.get('voices', [])
            if settings != direct(line, config, voices):
                raise ValueError('Stale voice direction')
            if record['src'] != f'audio/{digest(settings)}.mp3':
                raise ValueError('Stale generation path')
        else:
            raise ValueError('Unknown publication status')
        if record['generationHash'] != digest(settings):
            raise ValueError('Generation hash mismatch')
        if not re.fullmatch(r'audio/[a-f0-9]{20,64}\.mp3', record['src']):
            raise ValueError('Unsafe audio path')
        data = (ROOT / 'public' / record['src']).read_bytes()
        if not is_mp3(data) or record['audioSha256'] != hashlib.sha256(data).hexdigest():
            raise ValueError('Invalid or modified MP3')
    return retained


def verify(lines, manifest, config, archive, directions=None):
    if manifest.get('schemaVersion') == 2:
        if directions and any(line['source'] in directions for line in lines):
            raise ValueError('Authored sound cues require composite publication')
        return verify_v2(lines, manifest, config, archive)
    if manifest.get('schemaVersion') != 3:
        raise ValueError('Unknown narration manifest version')
    from audio_composite import verify_output
    if directions is None:
        directions = json.loads((ROOT / 'scripts/narration-directions.json').read_text())['soundCues']
    if set(manifest['clips']) != {line['id'] for line in lines}:
        raise ValueError('Manifest clip IDs do not match narration inputs')
    retained = 0
    for line in lines:
        entry = manifest['clips'][line['id']]
        if entry['id'] != line['id'] or entry['inputHash'] != input_hash(line):
            raise ValueError('Stale logical narration identity')
        context = manifest['contexts'][entry['contextId']]
        if digest(context) != entry['contextId']:
            raise ValueError('Invalid speech verification context')
        speech = entry['speech']
        # Each unchanged recording retains the configuration actually used to
        # produce it. No global relabeling of old audio during a scoped publish.
        view = {'schemaVersion': 2, 'release': context['release'],
                'targetConfigHash': context['targetConfigHash'], 'voices': context['voices'],
                'clips': {line['id']: speech}}
        retained += verify_v2([line], view, context['config'], archive)
        verify_output(speech, entry['output'], directions.get(line['source']))
    return retained


def playback_projection(manifest):
    return {key: record['output']['src'] if manifest['schemaVersion'] == 3 else record['src']
            for key, record in manifest['clips'].items()}


def main():
    lines = json.loads((ROOT / 'scripts/narration-input.json').read_text())
    from pronunciation_review import check_current
    check_current(lines)
    manifest = json.loads((ROOT / 'src/generated/narration.json').read_text())
    archive = json.loads((ROOT / 'scripts/tts-legacy-manifest.json').read_text())
    directions = json.loads((ROOT / 'scripts/narration-directions.json').read_text())['soundCues']
    retained = verify(lines, manifest, load_config(), archive, directions)
    playback = json.loads((ROOT / 'src/generated/narration-playback.json').read_text())
    if playback != playback_projection(manifest):
        raise ValueError('Stale playback projection; run audio:collect before building')
    print(f'Verified {len(lines)} clip identities and MP3 checksums; {retained} explicitly retained legacy recordings.' + (' Candidate voices are NOT published.' if retained else ' Speaker-aware release.'))


if __name__ == '__main__':
    main()
