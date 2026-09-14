"""Atomic source-scoped publication. Raw speech and final output stay distinct."""
import concurrent.futures
import copy
import json
import re
from voice_director import ROOT, digest, direct, input_hash, load_config
from audio_composite import compose, tools, registry, cue_asset, duration
from verify_audio import verify, verify_v2


def publish_scoped(lines, config, voices, key, target, prefix, directions, generate, make_record, write_json):
    if not re.fullmatch(r'pack:[a-z][a-z0-9-]{0,47}:', prefix or ''):
        raise ValueError('Scoped publication requires an exact pack:<story-id>: source prefix')
    selected = [line for line in lines if line['source'].startswith(prefix)]
    if not selected: raise ValueError('Source prefix matches no narration inputs')
    if set(directions) - {line['source'] for line in lines}:
        raise ValueError('Unknown source in sound directions')
    has_cues = any(line['source'] in directions for line in selected)
    if has_cues:
        tools()
        data = registry()
        for line in selected:
            if line['source'] in directions: cue_asset(directions[line['source']], data)
    prior = json.loads(target.read_text())
    archive = json.loads((ROOT / 'scripts/tts-legacy-manifest.json').read_text())
    untouched = [line for line in lines if not line['source'].startswith(prefix)]
    untouched_ids = {line['id'] for line in untouched}
    if not untouched_ids <= set(prior['clips']):
        raise ValueError('Missing or changed inputs outside publication scope')
    prior_subset = {**prior, 'clips': {id: prior['clips'][id] for id in untouched_ids}}
    verify(untouched, prior_subset, config, archive, directions)
    # Resolve all selected voices before any generation or publication.
    resolved = [(line, direct(line, config, voices)) for line in selected]
    unique = {digest(settings): settings for _, settings in resolved}
    def synthesize(item):
        fingerprint, settings = item
        return fingerprint, generate(settings, ROOT / 'public/audio' / f'{fingerprint}.mp3', key)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        files = dict(pool.map(synthesize, unique.items()))
    speeches = {line['id']: make_record(line, settings, f'audio/{digest(settings)}.mp3', files[digest(settings)])
                for line, settings in resolved}
    # A stays v2. A pre-existing v3 stays v3; never silently downgrade.
    use_v3 = has_cues or prior['schemaVersion'] == 3
    if not use_v3:
        if prior['release'] != 'speaker-aware' or prior['targetConfigHash'] != digest(config):
            raise ValueError('A v2 context mismatch: return to architecture review, do not silently migrate')
        result = {**prior, 'voices': voices, 'clips': {**prior_subset['clips'], **speeches}}
    else:
        contexts = copy.deepcopy(prior.get('contexts', {}))
        clips = {}
        if prior['schemaVersion'] == 2:
            context = {'release': prior['release'], 'targetConfigHash': prior['targetConfigHash'],
                       'config': config, 'voices': prior.get('voices', [])}
            if prior['targetConfigHash'] != digest(config):
                raise ValueError('Cannot reconstruct old configuration for v3 migration')
            context_id = digest(context)
            contexts[context_id] = context
            for line in untouched:
                speech = prior['clips'][line['id']]
                clips[line['id']] = {'id': line['id'], 'inputHash': input_hash(line),
                    'contextId': context_id, 'speech': speech,
                    'output': {'kind': 'speech', 'src': speech['src'], 'audioSha256': speech['audioSha256']}}
        else:
            clips.update(prior_subset['clips'])
        context = {'release': 'speaker-aware', 'targetConfigHash': digest(config), 'config': config, 'voices': voices}
        context_id = digest(context)
        contexts[context_id] = context
        for line in selected:
            speech = speeches[line['id']]
            duration(ROOT / 'public' / speech['src'])
            cue = directions.get(line['source'])
            output = compose(speech, cue) if cue else {'kind': 'speech', 'src': speech['src'], 'audioSha256': speech['audioSha256']}
            clips[line['id']] = {'id': line['id'], 'inputHash': input_hash(line), 'contextId': context_id,
                                'speech': speech, 'output': output}
        used = {entry['contextId'] for entry in clips.values()}
        result = {'schemaVersion': 3, 'release': 'scoped', 'contexts': {id: contexts[id] for id in used}, 'clips': clips}
    verify(lines, result, config, archive, directions)
    # Preserve the prior manifest before the only mutation of the live manifest.
    history = ROOT / 'scripts/audio-history' / f'{digest(prior)}.json'
    if not history.exists(): write_json(history, prior)
    write_json(target, result)
    return {'selectedSources': len(selected), 'unchangedSources': len(untouched),
            'compositeSources': sum(line['source'] in directions for line in selected),
            'manifestVersion': result['schemaVersion']}
