import copy
import hashlib
import importlib.util
import json
import shutil
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import audio_composite as mix
import scoped_publication as scope
import verify_audio as verifier
from voice_director import ROOT, load_config
spec=importlib.util.spec_from_file_location('generation',ROOT/'scripts/generate-audio.py')
generation=importlib.util.module_from_spec(spec);spec.loader.exec_module(generation)


class ScopedAudioTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(); self.root=Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)
        self.config=load_config()
        baseline=json.loads((ROOT/'docs/requirements/garden-gathering-expanded/e4/before.json').read_text())['manifest']
        inputs=json.loads((ROOT/'scripts/narration-input.json').read_text())
        self.old=next(line for line in inputs if line['id'] in baseline['clips'])
        self.new=next(line for line in inputs if line['source']=='pack:garden-gathering-party:f04c')
        self.lines=[self.old,self.new]
        self.prior={**baseline,'clips':{self.old['id']:baseline['clips'][self.old['id']]}}
        self.voices=baseline['voices']
        self.target=self.root/'manifest.json'
        self.target.write_text(json.dumps(self.prior))
        self.directions={self.new['source']:'drum-short'}
        for file in ['scripts/tts-legacy-manifest.json','scripts/sound-cues.json',
                     'scripts/sound-cues/drum-short.wav','scripts/sound-cues/drum-clap-short.wav',
                     'public/'+baseline['clips'][self.old['id']]['src']]:
            target=self.root/file;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(ROOT/file,target)
        self.sample=(ROOT/'docs/requirements/garden-gathering-expanded/samples/B-speech-x04c.mp3').read_bytes()
        for module in [mix,scope,verifier]:
            patcher=patch.object(module,'ROOT',self.root);patcher.start();self.addCleanup(patcher.stop)
        self.calls=0
    def generate(self,settings,path,key):
        # Offline fixture, not a claim of real Azure synthesis.
        self.calls+=1;path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(self.sample);return self.sample
    def publish(self,**kw):
        return scope.publish_scoped(self.lines,self.config,self.voices,'test',self.target,
              kw.get('prefix','pack:garden-gathering-party:'),kw.get('directions',self.directions),
              self.generate,generation.clip_record,generation.write_json)
    def test_scoped_composite_preserves_old_speech_and_repeat_projection(self):
        result=self.publish();self.assertEqual(result['selectedSources'],1)
        published=json.loads(self.target.read_text())
        self.assertEqual(published['clips'][self.old['id']]['speech'],self.prior['clips'][self.old['id']])
        self.assertEqual(published['clips'][self.new['id']]['output']['kind'],'composite')
        self.assertNotEqual(published['clips'][self.new['id']]['output']['src'],published['clips'][self.new['id']]['speech']['src'])
        self.assertEqual(verifier.playback_projection(published)[self.old['id']],self.prior['clips'][self.old['id']]['src'])
        first=verifier.playback_projection(published)
        self.publish()
        self.assertEqual(first,verifier.playback_projection(json.loads(self.target.read_text())))
    def test_failure_never_changes_published_manifest(self):
        before=self.target.read_bytes()
        with patch.object(scope,'compose',side_effect=ValueError('mix failed')):
            with self.assertRaises(ValueError):self.publish()
        self.assertEqual(self.target.read_bytes(),before)
    def test_rejects_bad_scope_missing_cue_and_missing_tools_before_generation(self):
        for prefix in ['pack:','pack:missing:','']:
            with self.assertRaises(ValueError):self.publish(prefix=prefix)
        with self.assertRaises(ValueError):self.publish(directions={self.new['source']:'missing'})
        with patch.object(mix.shutil,'which',return_value=None):
            with self.assertRaisesRegex(ValueError,'FFmpeg'):self.publish()
        self.assertEqual(self.calls,0)
    def test_audio_only_stays_v2(self):
        self.publish(directions={})
        published=json.loads(self.target.read_text())
        self.assertEqual(published['schemaVersion'],2)
        self.assertEqual(published['clips'][self.old['id']],self.prior['clips'][self.old['id']])
    def test_mix_parameter_change_reuses_raw_and_rejects_stale_output(self):
        self.publish();published=json.loads(self.target.read_text());entry=published['clips'][self.new['id']]
        before_raw=(self.root/'public'/entry['speech']['src']).read_bytes()
        config=mix.registry();config['mixParameters']['cueGain']=.8
        (self.root/'scripts/sound-cues.json').write_text(json.dumps(config))
        with self.assertRaisesRegex(ValueError,'Stale composite'):mix.verify_output(entry['speech'],entry['output'],'drum-short')
        # Recompose directly; no speech generation function is involved.
        calls=self.calls;output=mix.compose(entry['speech'],'drum-short')
        self.assertEqual(self.calls,calls)
        self.assertNotEqual(output['src'],entry['output']['src'])
        self.assertEqual(before_raw,(self.root/'public'/entry['speech']['src']).read_bytes())
        (self.root/'public'/output['src']).write_bytes(b'corrupt')
        with self.assertRaisesRegex(ValueError,'Invalid composite'):mix.verify_output(entry['speech'],output,'drum-short')
    def test_invalid_old_record_cannot_be_blessed_by_migration(self):
        self.prior['clips'][self.old['id']]['voice']='wrong'
        self.target.write_text(json.dumps(self.prior))
        with self.assertRaises(ValueError):self.publish()
        self.assertEqual(self.calls,0)
