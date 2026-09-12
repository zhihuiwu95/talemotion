> **TaleMotion — An AI-native animated storybook engine that turns stories into structured scenes, generated assets, synchronized voices, and interactive animation.**

# TaleMotion

## Current production validation: 三种样板与第四篇试产

Four **data-driven story packs** now run through one shared SVG/CSS/React player:

- `/?story=snow-mittens` — 雪松下的小手套: exploration, perceptual retry, helping, and two free endings.
- `/?story=rain-shelter` — 一起搭个小雨棚: collaborative sequence and a choice of canopy color.
- `/?story=little-drum` — 小鼓咚咚响: listening to both wishes, voluntary turn-taking or joining by clapping.
- `/?story=garden-gathering` — 雨后的花园小聚会: a two-round revised production trial; local engineering passes, while content approval and revised visual/device review remain pending.

These packs target approximately ages 3–4 with adult support. Add a validated `src/stories/packs/*.json` to register another story; the gallery, narration collector, and acceptance-path UI tests discover it automatically. There are no per-story branches in the new player. Existing activities and the first mitten sample remain intact.

**Start here: [Story production kit](docs/production/README.md).** It contains the authoring contract, assets/actions catalog, machine-readable schema, evidence register, reviewed sample storyboards, evaluation rubric, and a copyable task for a cheaper model. The fourth story, `/?story=garden-gathering`, has completed two content-revision rounds and passes local engineering checks; its content score, revised visual/playback review, real-device and family acceptance remain pending. See the [review](docs/production/runs/fourth-story-review.md) and [revision record](docs/production/runs/fourth-story-revision.md). The three original samples and this fourth trial establish an engineering workflow, not proof of cheaper-model reliability or child learning outcomes.

```bash
npm run stories:validate
npm run stories:review
npm run audio:generate
npm run quality
```

## Current product prototype: 森林故事小屋

A mobile-first parent-child story collection for approximately ages 2.5–4, starring original rabbit officer 朵朵. Four curated activities cover matching mittens, comparing picnic item sizes, finding a ball by position, and watering a flower in order. Each has two large choices, descriptive retries, pause/mute/repeat, and an off-screen activity ending. The flower activity is marked as a slightly more advanced parent-assisted option.

Narration now uses **102 pre-generated Azure Speech MP3 clips**, with Xiaoxiao Multilingual and scene-specific storytelling, warm, cheerful, excited, and empathetic styles. End users play local website audio; they do not need Edge, Python, or a system Chinese voice. No live generation is performed during play. There are no timers, scores, ads, accounts, or recorded child voices.

A new short story, **雪地里的手套** (`/?story=mittens-story`), lets children ask the bear for help, explore the snow and an optional bird clue, return a mitten, then choose to build a snowman or make footprints. The original four activities remain available for comparison. Game text cannot be selected, and cross-screen touch guards preserve feedback before accepting the next action. See [the sample and comparison protocol](docs/MITTEN_STORY_SAMPLE.md).

Parents can explicitly save observations about understanding, replay interest, and willingness to reuse. Records stay in this browser's local storage; the homepage offers viewing, JSON export, and confirmed clearing. Current game progress remains in memory. This is a curated product experiment, not a validated cognitive assessment.

- Run `npm run dev -- --host 0.0.0.0`; open the printed Network URL on a phone on the same Wi-Fi.
- Story library: `/`; individual links: `/?story=mittens`, `/?story=picnic`, `/?story=hide`, `/?story=garden`.
- Original two-minute Pixi/GSAP demonstration: `/?demo=classic` (lazy loaded, also uses recorded narration).
- [Scope, parent testing protocol, and verification](docs/INTERACTIVE_DEMO.md).
- [Regenerating audio and mobile playback boundaries](docs/TTS_DECISION.md).

The prototype is local, not publicly deployed. A complete `dist/` can be hosted as a static website for families to access from home.

## Animation engine baseline

Phase 0 and Phase 1 are implemented, and the winter-cottage golden scene now runs for two minutes as a long-timeline proof:

- PixiJS renders a background, cottage, separate door, character expressions, and procedural snow.
- GSAP schedules every animation from Scene JSON.
- Zod validates the complete scene and its cross-references before rendering.
- An allowlisted Action Registry supports `move`, `scale`, `rotate`, `fade`, `show`, `hide`, `camera.pan`, `camera.zoom`, `effect.start`, `effect.stop`, `expression`, and `audio.play`.
- Play, pause, replay, restart, stage-only fullscreen, Chinese captions, timeline cues, and segmented pre-generated Mandarin narration are available.
- Restart restores object transforms, visibility, opacity, textures, camera state, effects, and audio before replaying.
- The renderer contains no rabbit, cottage, or story-specific behavior.

No online AI API is called during playback. Azure Speech is used only when regenerating audio; the key is read from the local shell environment. All visual assets in the demo are local SVG files.

## Run locally

Requirements: Node.js 20.19+ (Node.js 22+ recommended) and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

## Quality checks

```bash
npm test
npm run lint
npm run build
npm run scene:validate
npm run stories:validate
npm run audio:verify
# Or run all checks:
npm run quality
```

`npm test` runs the schema, timeline scheduling, closed action registry, playback/restart, player time formatting, effect lifecycle, and speech/audio fallback tests. `npm run scene:validate` validates every demo Scene JSON and verifies its local asset files exist.

## Product and production decisions

- [`docs/sdd/README.md`](docs/sdd/README.md) is the project-level SDD entry: reusable PRD template, design constraints, and architecture constraints. Feature changes use requirement instances; JSON-only story production keeps the existing production workflow.
- [`docs/PRODUCT_VISION.md`](docs/PRODUCT_VISION.md) explains the final product shape and why production two-minute stories should use multiple scenes.
- [`docs/production/README.md`](docs/production/README.md) is the current workflow for making new interactive story packs.
- [`docs/ANIMATION_WORKFLOW.md`](docs/ANIMATION_WORKFLOW.md) preserves the earlier Pixi/GSAP animation workflow, separate from story-pack v1.
- [`docs/TTS_DECISION.md`](docs/TTS_DECISION.md) records the current Azure Speech generation and playback workflow.
- [`templates/story-brief.template.md`](templates/story-brief.template.md) is the earlier animation brief. New story-pack authors use the production kit above.

## Project structure

```text
talemotion/
├── public/assets/                     # Local demo artwork
├── src/
│   ├── demo/
│   │   └── winter-cottage.scene.json # Golden scene: objects, cues, captions
│   ├── player/
│   │   └── StoryPlayer.tsx            # React controls and presentation
│   ├── runtime/
│   │   ├── audio/                     # SpeechProvider + graceful audio fallback
│   │   ├── effects/                   # Disposable effect contracts + snow
│   │   ├── timeline/                  # GSAP adapter behind TimelinePort
│   │   ├── ActionRegistry.ts          # Closed action dispatch
│   │   ├── PlaybackController.ts      # Play/pause/restart state transitions
│   │   ├── SceneRuntime.ts            # Runtime composition and reset
│   │   └── TimelineEngine.ts          # Decides when registered actions run
│   ├── schema/
│   │   └── scene.ts                   # Zod schema and cross-reference validation
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
└── README.md
```

The responsibility boundary is intentional:

```text
Scene JSON ──validate──> TimelineEngine ──schedule──> Action Registry
                                                        │
                                                        ▼
                                  Pixi renderer / effects / audio adapter
```

`TimelineEngine` knows when an action occurs. Individual handlers know what an allowed action does. The renderer only manages generic scene objects and never evaluates code from a scene.

## Scene contract

Scenes use version `1.0`. In addition to structural Zod checks, validation rejects:

- unknown action types;
- duplicate object IDs;
- missing object, expression, or audio asset references;
- actions targeting unknown objects;
- expression values not declared by that object;
- actions and captions extending beyond scene duration.

Add or change the demo in [`src/demo/winter-cottage.scene.json`](src/demo/winter-cottage.scene.json). A new executable action requires both an explicit schema entry and a registered handler; arbitrary JavaScript and `eval` are not accepted.

## First-stage acceptance

- [x] React + TypeScript + Vite project
- [x] PixiJS scene renderer and GSAP timeline
- [x] Local-only demo resources; no AI or backend calls
- [x] Two-minute winter-cottage demo with staged movement, door, snow, camera work, captions, controls, and segmented recorded narration
- [x] Animation fully driven by Scene JSON
- [x] Zod validation before runtime creation
- [x] Allowlisted Action Registry; no dynamic script execution
- [x] Effect start, stop, reset, and dispose lifecycle
- [x] Missing narration/audio degrades without stopping animation
- [x] Tests for schema, timeline, unknown actions, restart/reset, effects, and audio fallback
- [x] Repeat playback uses absolute targets and resets runtime state
- [x] Stage-only fullscreen view with button and Escape-key exit
- [x] Reusable story workflow, brief template, and scene validation command

## Known limitations and debt before Phase 2

1. Add a browser-level visual/interaction regression test. Unit tests cover contracts and lifecycle, but do not yet compare rendered frames.
2. Keep measuring bundle size as content grows. The classic Pixi/GSAP demo is lazy loaded; story-pack data and schema currently load with the main application.
3. Define a formal Scene JSON compatibility and migration policy before an LLM starts producing contract version `1.0` at scale.
4. Add asset load timeouts, cancellation, and per-asset diagnostics before remote generated assets are allowed.
5. Recorded narration now has a consistent Azure voice. Word-level timestamps, subtitle alignment, and music ducking remain deferred; device/browser audio acceptance still requires real-device testing.
6. Seek/scrub is not exposed yet; introducing it requires deterministic reconstruction of call-based effects, expressions, and audio at arbitrary timestamps.

This section describes the earlier animation-engine roadmap. Current interactive story production uses the separate story-pack contract and shared player in `src/stories/`; neither path accepts arbitrary runtime code from content.
