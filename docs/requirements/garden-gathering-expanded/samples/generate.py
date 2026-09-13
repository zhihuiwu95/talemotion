"""E1 isolated samples only. No production collection or publication."""
import sys, json, os, importlib.util, hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4]
sys.path.insert(0,str(ROOT/'scripts'))
from voice_director import load_config, direct, validate_line, digest
spec=importlib.util.spec_from_file_location('generation',ROOT/'scripts/generate-audio.py')
generation=importlib.util.module_from_spec(spec); spec.loader.exec_module(generation)
OUT=Path(__file__).resolve().parent
lines=json.loads((OUT/'narration-input.json').read_text())
reviews={x['source']:x for x in json.loads((OUT/'pronunciation-review.json').read_text())['entries']}
for line in lines:
    validate_line(line)
    r=reviews[line['source']]
    assert r['text']==line['text'] and r['speaker']==line['speaker']
    assert r['pronunciations']==line['segments'][0].get('pronunciations',[])
key=os.environ.get('AZURE_SPEECH_KEY','').strip().strip('“”')
if not key: raise SystemExit('Azure key missing; nothing published.')
config=load_config(); voices=generation.query_voices(config,key)
records=[]
for line in lines:
    settings=direct(line,config,voices)
    path=OUT/('A-'+line['source'].split(':')[-1]+'.mp3')
    data=generation.synthesize(settings,path,key)
    records.append({'source':line['source'],'lineId':line['id'],'text':line['text'],'file':path.name,'voice':settings['voice'],'generation':settings,'sha256':hashlib.sha256(data).hexdigest()})
    print('Generated',path.name,flush=True)
generation.write_json(OUT/'audio-records.json',{'scope':'E1 A: TTS only; no SFX; unpublished','configHash':digest(config),'records':records})
print('Isolated pronunciation coverage and generation passed; listening pending.')
