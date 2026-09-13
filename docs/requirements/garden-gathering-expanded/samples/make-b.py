"""E1 B: locally authored percussion + independently reviewed dialogue. Unpublished."""
from pathlib import Path
import sys, json, hashlib, math, random, wave, struct, subprocess, importlib.util
OUT=Path(__file__).resolve().parent
ROOT=OUT.parents[3]
sys.path.insert(0,str(ROOT/'scripts'))
from voice_director import direct, load_config, digest, validate_line
spec=importlib.util.spec_from_file_location('sample_generation',OUT/'generate.py')
# Import only existing production generation helpers, never publish/collect.
spec=importlib.util.spec_from_file_location('generation',ROOT/'scripts/generate-audio.py')
generation=importlib.util.module_from_spec(spec); spec.loader.exec_module(generation)
import os
SR=24000
before={str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in OUT.glob('A-*')}
texts={
 'x04c':'听，我先敲起来啦！',
 'x06c':'我跟上鼓声啦！',
 'x04d':'这一小段敲完啦，接下来请你和小狐狸一起！',
 'x06d':'我们的鼓声也响起来啦！'
}
lines=json.loads((OUT/'narration-input.json').read_text())
reviews=[]; candidates=[]
for original in lines:
 node=original['source'].split(':')[-1]; line=dict(original)
 line['source']='sample:garden-party:B:'+node; line['text']=texts[node]
 marks=original['segments'][0].get('pronunciations',[])
 line['segments']=[{'text':line['text'],**({'pronunciations':marks} if marks else {})}]
 line['id']=line['source']+':'+digest({k:v for k,v in line.items() if k!='id'})[:20]
 validate_line(line)
 reviews.append({'source':line['source'],'speaker':line['speaker'],'text':line['text'],'pronunciations':marks,'reviewer':'AI-context-review','note':'整句已读；仅去掉拟声词，保留原角色及声音方向；实际听感待用户对比。'})
 candidates.append(line)
generation.write_json(OUT/'B-pronunciation-review.json',{'scope':'Isolated E1 candidate','entries':reviews})
generation.write_json(OUT/'B-narration-input.json',candidates)
key=os.environ.get('AZURE_SPEECH_KEY','').strip().strip('“”')
if not key: raise SystemExit('Azure key missing; no production changes.')
config=load_config(); voices=generation.query_voices(config,key)

def writewav(path,samples):
 with wave.open(str(path),'wb') as w:
  w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
  w.writeframes(struct.pack('<'+'h'*len(samples),*[round(max(-1,min(1,x))*32767) for x in samples]))

def percussion(clap=False):
 rng=random.Random(20260913); arr=[0.0]*int(1.22*SR)
 # Three short toy-drum-like hits, final accented higher hit. No external samples.
 for k,start in enumerate([0,.34,.68]):
  freq=155 if k<2 else 220
  for i in range(int(.31*SR)):
   t=i/SR; phase=2*math.pi*(freq*t+55*.025*(1-math.exp(-t/.025)))
   env=(1-math.exp(-t/.002))*math.exp(-t/.075)
   v=.48*env*math.sin(phase)+.07*math.exp(-t/.013)*rng.uniform(-1,1)
   arr[int(start*SR)+i]+=v
 if clap:
  # A pair of procedural handclap-like noise bursts between drum accents.
  for start in [.17,.51,.85]:
   prev=0.0
   for i in range(int(.19*SR)):
    t=i/SR; noise=rng.uniform(-1,1); high=noise-prev*.65; prev=noise
    env=(1-math.exp(-t/.001))*math.exp(-t/.034)
    arr[int(start*SR)+i]+=.23*high*env
 return arr
cue_paths={}
for name,clap in [('drum-short',False),('drum-clap-short',True)]:
 path=OUT/(name+'.wav');writewav(path,percussion(clap));cue_paths[name]=path
records=[]
for line in candidates:
 node=line['source'].split(':')[-1]; settings=direct(line,config,voices)
 raw=OUT/('B-speech-'+node+'.mp3'); generation.synthesize(settings,raw,key)
 decoded=OUT/('B-speech-'+node+'.wav')
 subprocess.run(['/usr/bin/afconvert','-f','WAVE','-d','LEI16@24000','-c','1',str(raw),str(decoded)],check=True,capture_output=True)
 with wave.open(str(decoded),'rb') as w:
  assert w.getframerate()==SR and w.getsampwidth()==2 and w.getnchannels()==1
  speech=[v[0]/32768 for v in struct.iter_unpack('<h',w.readframes(w.getnframes()))]
 cue='drum-clap-short' if node=='x06c' else 'drum-short'
 samples=percussion(node=='x06c')+[0.0]*int(.10*SR)+speech
 peak=max(abs(x) for x in samples); gain=min(1,.92/peak) if peak else 1
 samples=[x*gain for x in samples]
 path=OUT/('B-'+node+'.wav'); writewav(path,samples)
 records.append({'source':line['source'],'text':line['text'],'file':path.name,'speechFile':raw.name,'speechSha256':hashlib.sha256(raw.read_bytes()).hexdigest(),'cue':cue,'cueSha256':hashlib.sha256(cue_paths[cue].read_bytes()).hexdigest(),'mixVersion':'E1-prefix-v1','mixParameters':{'cueSeconds':1.22,'gapSeconds':.10,'speechGain':gain,'sampleRate':SR},'durationSeconds':round(len(samples)/SR,3),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'generation':settings})
 print('Generated',path.name,flush=True)
for p,h in before.items(): assert hashlib.sha256((ROOT/p).read_bytes()).hexdigest()==h,p
generation.write_json(OUT/'B-audio-records.json',{'scope':'E1 B candidate only; no runtime or publication changes','provenance':{'source':'Procedurally synthesized in make-b.py by Codex for this project','externalRecordings':False,'description':'Decaying sine/noise drum and noise-burst clap; synthetic approximations, not real instrument recordings','seed':20260913},'records':records,'A_files_unchanged':True})
