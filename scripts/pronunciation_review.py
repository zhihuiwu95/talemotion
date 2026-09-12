"""Offline full-corpus pronunciation review gate; never guesses a reading."""
import json
from voice_director import ROOT, pronunciation_spans, validate_line


def identity(line):
    return (line['source'], line['speaker'], line['text'])


def verify_pronunciation(lines, review):
    entries = review['entries']
    indexed = {identity(entry): entry for entry in entries}
    if len(indexed) != len(entries):
        raise ValueError('Duplicate pronunciation review identity')
    current = {identity(line) for line in lines}
    if current != set(indexed):
        raise ValueError('Pronunciation review missing or stale: review every new/changed line before synthesis')
    annotated = 0
    for line in lines:
        validate_line(line)
        entry = indexed[identity(line)]
        if entry.get('status') != 'reviewed' or not entry.get('reviewer'):
            raise ValueError('Pronunciation review is not completed')
        expected = pronunciation_spans({'text': line['text'], **({'pronunciations': entry['pronunciations']} if entry['pronunciations'] else {})})
        actual, offset = [], 0
        for segment in line.get('segments', [{'text': line['text']}]):
            if 'text' not in segment:
                continue
            actual.extend((start + offset, end + offset, phoneme) for start, end, phoneme in pronunciation_spans(segment))
            offset += len(segment['text'])
        if actual != expected:
            raise ValueError(f'Pronunciation annotations differ from reviewed reading: {line["source"]}')
        annotated += bool(expected)
    return annotated


def check_current(lines):
    review = json.loads((ROOT / 'scripts/pronunciation-review.json').read_text())
    return verify_pronunciation(lines, review)


def main():
    lines = json.loads((ROOT / 'scripts/narration-input.json').read_text())
    count = check_current(lines)
    print(f'Pronunciation review passed: {len(lines)} lines, {count} annotated; context review is not listening certification.')


if __name__ == '__main__':
    try:
        main()
    except ValueError as error:
        raise SystemExit(str(error)) from None
