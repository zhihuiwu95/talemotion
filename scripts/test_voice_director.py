import copy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import xml.etree.ElementTree as ET

from voice_director import ROOT, direct, digest, load_config, segment_text
from verify_audio import verify

spec = importlib.util.spec_from_file_location('generation', ROOT / 'scripts/generate-audio.py')
generation = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generation)


class DirectorTests(unittest.TestCase):
    def setUp(self):
        self.config = load_config()
        self.voices = json.loads((ROOT / 'scripts/azure-voices.snapshot.json').read_text())['voices']
        self.line = {'id': 'test:bear', 'source': 'test', 'speaker': 'bear', 'voiceProfile': 'bear',
                     'intent': 'dialogue', 'emotion': 'warm', 'text': '你好！一起玩吧。', 'legacyStyle': 'affectionate'}

    def direct(self, **changes):
        return direct({**self.line, **changes}, self.config, self.voices)

    def test_voice_resolution_and_unknowns(self):
        voices = set()
        for profile in ('narrator', 'duoduo', 'bear', 'fox'):
            result = self.direct(speaker=profile, voiceProfile=profile)
            self.assertEqual(result['voice'], self.config['voiceProfiles'][profile]['voice'])
            voices.add(result['voice'])
        self.assertEqual(len(voices), 4)
        for changes in ({'speaker': 'unknown'}, {'voiceProfile': 'unknown'}):
            with self.assertRaises(ValueError):
                self.direct(**changes)
        with self.assertRaises(ValueError):
            direct(self.line, self.config, [])

    def test_emotion_intent_and_override_precedence(self):
        warm, excited = self.direct(), self.direct(emotion='excited')
        self.assertEqual(warm['rate'], '-8%')
        self.assertEqual(warm['pitch'], '-3Hz')
        self.assertEqual(excited['style'], 'narration-relaxed')
        self.assertEqual(excited['rate'], '-2%')
        self.assertEqual(excited['pitch'], '-3Hz')
        self.assertEqual(excited['styleDegree'], 1.1)
        self.assertEqual(self.direct(emotion='neutral', intent='hint')['rate'], '-10%')
        override = self.direct(emotion='excited', rate='-6%', pitch='-1Hz', styleDegree=1.2)
        self.assertEqual((override['rate'], override['pitch'], override['styleDegree']), ('-6%', '-1Hz', 1.2))
        self.assertNotEqual(digest(warm), digest(excited))

    def test_xml_escape_break_prosody_and_express_as(self):
        result = self.direct(text='你好<&"！一起玩。', segments=[
            {'text': '你好<&"！', 'emotion': 'excited'}, {'pauseMs': 180},
            {'text': '一起玩。', 'emotion': 'warm', 'rate': '-6%'}])
        root = ET.fromstring(result['ssml'])
        self.assertIn('&lt;&amp;&quot;', result['ssml'])
        self.assertIn('<break time="180ms"/>', result['ssml'])
        self.assertIn('rate="-6%"', result['ssml'])
        self.assertIn('mstts:express-as', result['ssml'])
        self.assertEqual(''.join(root.itertext()), '你好<&"！一起玩。')
        self.assertEqual(result['segments'][0]['settings']['emotion'], 'excited')
        self.assertEqual(result['segments'][2]['settings']['emotion'], 'warm')

    def test_pronunciation_preserves_text_and_invalidates_hash(self):
        text = '小熊少了一只手套。'
        plain = self.direct(text=text)
        marked = self.direct(text=text, segments=[{'text': text, 'pronunciations': [{'text': '少', 'phoneme': 'shao3'}]}])
        self.assertIn('<phoneme alphabet="sapi" ph="shao 3">少</phoneme>', marked['ssml'])
        self.assertEqual(''.join(ET.fromstring(marked['ssml']).itertext()), text)
        self.assertNotEqual(digest(plain), digest(marked))
        self.assertEqual(plain['voice'], marked['voice'])
        for marks in ([{'text': '少', 'phoneme': '\"/><audio/>'}],
                      [{'text': '没有', 'phoneme': 'shao3'}],
                      [{'text': '少', 'phoneme': 'shao3', 'ssml': 'bad'}],
                      [{'text': '少', 'phoneme': 'shao3'}, {'text': '少了', 'phoneme': 'shao3 le5'}]):
            with self.assertRaises(ValueError):
                self.direct(text=text, segments=[{'text': text, 'pronunciations': marks}])
        with self.assertRaises(ValueError):
            self.direct(text='少少', segments=[{'text': '少少', 'pronunciations': [{'text': '少', 'phoneme': 'shao3'}]}])

    def test_unsupported_style_does_not_change_voice(self):
        voices = copy.deepcopy(self.voices)
        for v in voices: v['StyleList'] = []
        result = direct(self.line, self.config, voices)
        self.assertNotIn('express-as', result['ssml'])
        self.assertIn('<prosody', result['ssml'])
        self.assertTrue(result['warnings'])
        self.assertEqual(result['voice'], self.config['voiceProfiles']['bear']['voice'])

    def test_invalid_controls_segments_and_pause(self):
        for pause in (-1, 1001, True, 1.5):
            with self.assertRaises(ValueError):
                self.direct(segments=[{'text': self.line['text']}, {'pauseMs': pause}])
        for changes in ({'pitch': '"/><audio/>'}, {'rate': '+99%'}, {'styleDegree': 9},
                        {'style': '"/><audio/>'}, {'emotion': 'unknown'},
                        {'text': '\x01'}, {'segments': [{'text': 'different'}]},
                        {'segments': [{'text': self.line['text'], 'ssml': '<audio/>'}]}):
            with self.assertRaises(ValueError): self.direct(**changes)
        with self.assertRaises(ValueError):
            self.direct(segments=[{'text': self.line['text']}] + [{'pauseMs': 1000}] * 4)

    def test_segmentation_is_opt_in_and_deterministic(self):
        self.assertEqual(segment_text(self.line, self.config), [{'text': self.line['text']}])
        result = self.direct(segmentation='sentences')
        self.assertEqual(result['segments'][1], {'pauseMs': 180})
        self.assertEqual([s['settings']['emotion'] for s in result['segments'] if 'text' in s], ['warm', 'warm'])
        self.assertEqual(result, self.direct(segmentation='sentences'))
        ellipsis = self.direct(text='咦……是你吗？你好。', segmentation='sentences')
        self.assertEqual([s['pauseMs'] for s in ellipsis['segments'] if 'pauseMs' in s], [260, 220])

    def test_every_generation_dimension_invalidates_cache(self):
        original = digest(self.direct())
        for change in ({'text': '另一句'}, {'emotion': 'cheerful'}, {'intent': 'hint'},
                       {'speaker': 'fox', 'voiceProfile': 'fox'}, {'rate': '-1%'},
                       {'pitch': '+1Hz'}, {'styleDegree': 1.4}, {'style': 'sad'},
                       {'segmentation': 'sentences'}):
            self.assertNotEqual(original, digest(self.direct(**change)))
        for field, value in [('version', 'next'), ('format', 'other'), ('provider', 'other')]:
            config = {**self.config, field: value}
            self.assertNotEqual(original, digest(direct(self.line, config, self.voices)))

    def test_published_manifest_bridge_and_corruption_detection(self):
        lines = json.loads((ROOT / 'scripts/narration-input.json').read_text())
        manifest = json.loads((ROOT / 'src/generated/narration.json').read_text())
        archive = json.loads((ROOT / 'scripts/tts-legacy-manifest.json').read_text())
        self.assertEqual(verify(lines, manifest, self.config, archive), sum(r.get('speech', r)['status'] == 'legacy-retained' for r in manifest['clips'].values()))
        for field, value in [('speaker', 'wrong'), ('voice', 'wrong'), ('audioSha256', 'bad'), ('inputHash', 'bad')]:
            bad = copy.deepcopy(manifest)
            entry = bad['clips'][lines[0]['id']]
            entry.get('speech', entry)[field] = value
            with self.assertRaises(ValueError): verify(lines, bad, self.config, archive)

    def test_cache_reuses_exact_bytes_and_rejects_changed_parameters_or_corruption(self):
        settings = self.direct()
        data = b'ID3' + b'0' * 1100
        class Response:
            def __enter__(self): return self
            def __exit__(self, *_): pass
            def read(self): return data
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'sample.mp3'
            with patch.object(generation.urllib.request, 'urlopen', return_value=Response()) as request:
                generation.synthesize(settings, path, 'unused-test-token')
                generation.synthesize(settings, path, 'unused-test-token')
                self.assertEqual(request.call_count, 1)
                changed = self.direct(rate='+1%')
                generation.synthesize(changed, path, 'unused-test-token')
                self.assertEqual(request.call_count, 2)
                path.write_bytes(b'ID3' + b'corrupt' * 200)
                generation.synthesize(changed, path, 'unused-test-token')
                self.assertEqual(request.call_count, 3)
                self.assertEqual(path.read_bytes(), data)

    def test_failed_generation_never_publishes(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / 'manifest.json'
            target.write_text('previous manifest')
            with patch.object(generation, 'synthesize', side_effect=RuntimeError('safe failure')):
                with self.assertRaises(RuntimeError):
                    generation.publish([self.line], self.config, self.voices, 'unused-test-token', target)
            self.assertEqual(target.read_text(), 'previous manifest')

    def test_generation_manifest_has_actual_settings_and_content_hash(self):
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / 'manifest.json'
            data = b'ID3' + b'0' * 1100
            with patch.object(generation, 'synthesize', return_value=data):
                generation.publish([self.line], self.config, self.voices, 'unused-test-token', target)
            manifest = json.loads(target.read_text())
            record = manifest['clips'][self.line['id']]
            self.assertEqual(record['speaker'], 'bear')
            self.assertEqual(record['voice'], self.config['voiceProfiles']['bear']['voice'])
            self.assertEqual(record['text'], self.line['text'])
            self.assertEqual(record['src'], f'audio/{digest(record["generation"])}.mp3')
            self.assertIn('ssml', record['generation'])
            self.assertNotIn('unused-test-token', target.read_text())


class PronunciationReviewTests(unittest.TestCase):
    def test_occurrence_and_context_readings(self):
        from voice_director import pronunciation_spans, render_text
        segment = {'text': '一只手套，只要找到它。', 'pronunciations': [
            {'text': '只', 'phoneme': 'zhi1', 'occurrence': 1},
            {'text': '只', 'phoneme': 'zhi3', 'occurrence': 2}]}
        self.assertEqual(pronunciation_spans(segment), [(1, 2, 'zhi1'), (5, 6, 'zhi3')])
        self.assertIn('ph="zhi 1"', render_text(segment))
        self.assertIn('ph="zhi 3"', render_text(segment))
        for occurrence in (0, -1, True, 3, 1.5):
            with self.assertRaises(ValueError):
                pronunciation_spans({'text': segment['text'], 'pronunciations': [{'text': '只', 'phoneme': 'zhi1', 'occurrence': occurrence}]})

    def test_missing_stale_and_mismatched_review_blocks_generation(self):
        from pronunciation_review import verify_pronunciation
        line = {'source': 'test', 'speaker': 'bear', 'text': '少了。', 'intent': 'dialogue', 'emotion': 'warm',
                'segments': [{'text': '少了。', 'pronunciations': [{'text': '少', 'phoneme': 'shao3'}]}]}
        entry = {'source': 'test', 'speaker': 'bear', 'text': line['text'], 'status': 'reviewed',
                 'reviewer': 'AI-context-review', 'pronunciations': [{'text': '少', 'phoneme': 'shao3'}]}
        self.assertEqual(verify_pronunciation([line], {'entries': [entry]}), 1)
        for entries in ([], [entry, entry], [{**entry, 'status': 'pending'}],
                        [{**entry, 'text': '改了。'}], [{**entry, 'pronunciations': [{'text': '少', 'phoneme': 'shao4'}]}]):
            with self.assertRaises(ValueError):
                verify_pronunciation([line], {'entries': entries})

    def test_current_corpus_review_and_context_contrasts(self):
        from pronunciation_review import check_current
        lines = json.loads((ROOT / 'scripts/narration-input.json').read_text())
        self.assertEqual(check_current(lines), sum(any(s.get('pronunciations') for s in line.get('segments', [])) for line in lines))
        marks = [m for line in lines for s in line.get('segments', []) for m in s.get('pronunciations', [])]
        for word, readings in [('和', {'he2', 'huo5'}), ('空', {'kong1', 'kong4'}), ('只', {'zhi1', 'zhi3'})]:
            self.assertTrue(readings <= {m['phoneme'] for m in marks if m['text'] == word})

if __name__ == '__main__':
    unittest.main()
