# Local B audio production

FFmpeg and ffprobe are local production tools, explicitly approved for this task. They are not npm/frontend dependencies, are not bundled into the browser, and their binaries must not be committed. Scripts check both executables on PATH and fail with an explicit error if unavailable; there is no silent WAV or TTS-only fallback.

FFmpeg 9.0.1 installed on this machine with Homebrew (`brew install ffmpeg`); the formula installs its required local codec libraries. No other production service was added. Cue WAVs in scripts/sound-cues are project-authored E1 B samples, not FFmpeg binaries or third-party recordings.

## Publication

After pronunciation review and content approval:

```sh
npm run audio:generate -- --publish --source-prefix pack:garden-gathering-party:
npm run audio:collect
npm run audio:verify
```

The prefix must identify an exact story. Other current sources must already have valid publication records. A without mixing stays manifest v2; B uses v3 speech/output records. Browser source→line ID binding is unchanged. The collector projects published output paths and never substitutes raw speech for a published composite.

v3 contexts retain actual synthesis configuration and voice capabilities for each group of recordings. Old speech records remain unchanged inside their wrappers. Prior manifests are retained in scripts/audio-history using content hashes. New MP3s are added before an atomic manifest replacement; failed synthesis, mixing or verification leaves the formal manifest unchanged. Playback is rebuilt and verified before building. Do not deploy partially generated state.

Mixing uses one fixed registered cue prefix, 100ms separation and human speech; outputs remain mono 24kHz/96kbps MP3. Composite identity includes raw speech bytes, cue bytes, parameters, mix version and FFmpeg version. Changing cue gain reuses raw speech and remixes only the composite. Corrupt existing composites are rejected, not overwritten. Runtime playback remains one existing audio element with its original cancellation and interaction guard.

Cue metadata validates source path, hash and duration. Output verification checks identity, dependency hashes, MP3 bytes and decoded duration, with an 18-second production ceiling below the existing 20-second watchdog. This is a production limit, not story pacing. FFmpeg is also required locally to verify composite duration; it is never required by visitors.
