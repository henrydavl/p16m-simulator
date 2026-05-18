# P16-M Simulator — Version 1.1 Handoff

**Live URL:** https://p16-simulator.cloud  
**Repo:** https://github.com/henrydavl/p16m-simulator  
**Created by:** Henry David Lie

---

## What This Is

A browser-based interactive training simulator for the Behringer Powerplay P16-M 16-channel digital personal mixer. Target users are musicians who need to understand the device before using it live or in rehearsal. It is not a pixel-perfect hardware clone — it is a functional training tool.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite` plugin) |
| Audio | Web Audio API (no external libraries) |
| Deployment | GitHub Pages via `gh-pages` package |
| Domain | Custom domain: `p16-simulator.cloud` |

---

## Project Structure

```
src/
  components/
    MixerBoard.jsx      — Root UI component; holds all state and reducer
    ChannelStrip.jsx    — Single channel strip (select button, meter, label)
    Knob.jsx            — Reusable SVG rotary knob with pointer-capture drag
    LevelMeter.jsx      — 8-segment LED meter; real audio level or fake sine
    Button.jsx          — Reusable LED button (unused in current layout)
    MasterSection.jsx   — Unused; logic absorbed into MixerBoard
  audio/
    audioEngine.js      — All Web Audio API logic; singleton module
  data/
    channels.js         — Channel definitions + initial state constants
  index.css             — Minimal resets + Tailwind import
  main.jsx              — React root mount
public/
  CNAME                 — Custom domain (prevents GitHub Pages reset on deploy)
  favicon.jpg           — HD.jpg used as favicon
```

---

## State Architecture

All mixer state lives in a single `useReducer` inside `MixerBoard`. There is no external state library.

### Per-channel state (×16)
```js
{ volume: 75, pan: 0, mute: false, solo: false, selected: false,
  bass: 50, mid: 50, freq: 50, treble: 50 }
```

Stereo pair channels override the default `pan` at initialisation:
- L channels (ids 1, 3, 5): `pan: -50` (hard left)
- R channels (ids 2, 4, 6): `pan: +50` (hard right)

### Master state
```js
{ volume: 75, limiter: 100, outputLevel: 75, selected: false }
```

### Reducer actions

| Action | Effect |
|---|---|
| `SELECT_CHANNEL` | Selects channel; stereo pairs (1-2, 3-4, 5-6) always select together |
| `SELECT_MAIN` | Selects master; deselects all channels |
| `UPDATE_CHANNEL` | Updates one channel; stereo pairs mirror each other automatically |
| `UPDATE_SELECTED_PAN` | For mono: sets pan directly. For stereo pairs: treats value as balance (0 = natural L/R), computing L and R pans from the offset |
| `UPDATE_SELECTED_EQ` | Sets EQ on all currently selected channels |
| `UPDATE_MASTER` | Updates master volume / limiter / output level |
| `TOGGLE_SELECTED_SOLO` | Toggles solo on all selected channels |
| `TOGGLE_SELECTED_MUTE` | Toggles mute on all selected channels |

### Context-sensitive controls
The **VOLUME**, **PAN/BAL**, and **EQUALIZER** knobs all act on whichever channel is currently selected — same as the physical hardware. When MAIN is selected, the VOLUME knob controls master volume. When nothing is selected, knobs are inert.

### Stereo pair PAN/BAL behaviour
When a stereo pair is selected, the PAN knob operates as a **balance** control:
- Value 0 = natural stereo (L hard-left, R hard-right) — this is the default
- Positive value: shifts image right (L moves toward centre, R stays at hard-right)
- Negative value: shifts image left (L stays at hard-left, R moves toward centre)
- Formula: `L_pan = clamp(-50 + B, -50, 50)`, `R_pan = clamp(50 + B, -50, 50)`
- The displayed knob value is the derived balance, so it always reads 0 at the natural stereo position. Centering the knob restores full stereo.

---

## Audio Engine (`src/audio/audioEngine.js`)

### Signal chain (per channel)
```
AudioBufferSourceNode
  → AnalyserNode              (level metering tap)
  → [MonoMixGainNode]         (mono files only — downmixes stereo MP3s to true mono)
  → [ChannelSplitterNode]     (stereo pairs only — routes L to ch-odd, R to ch-even)
  → GainNode                  (channel volume + mute)
  → BiquadFilter (lowshelf, bass 200 Hz)
  → BiquadFilter (peaking, mid 200–8000 Hz log)
  → BiquadFilter (highshelf, treble 4000 Hz)
  → StereoPannerNode
  → masterGain
  → DynamicsCompressor        (LIMITER knob — threshold 0 to -20 dB, ratio 20:1)
  → postLimiterGain           (cancels DynamicsCompressor automatic makeup gain)
  → outputGain                (LEVEL knob)
  → AudioContext.destination
```

### Audio files (7 of 13 tracks available)

| File | Channels | Type |
|---|---|---|
| DRUM.mp3 | 1 (L), 2 (R) | Stereo pair |
| KEYS.mp3 | 3 (L), 4 (R) | Stereo pair |
| SEQ.mp3  | 5 (L), 6 (R) | Stereo pair |
| SYNTH.mp3 | 7 | Mono |
| BASS.mp3 | 8 | Mono |
| GTR 1.mp3 | 9 | Mono |
| ALL VCL.mp3 | 13 | Mono |

Channels 10 (GTR 2), 11 (VIO), 12 (SAXO), 14 (MD), 15 (CLICK), 16 (ACC) have no audio file yet — their level meters stay dark and their gain nodes are silent.

**Adding a new track:** add the `.mp3` to `src/assets/audio/`, add an entry to `STEREO_FILE_MAP` or `MONO_FILE_MAP` in `audioEngine.js`. Everything else (meter activation, source map) updates automatically.

### Synchronisation
All `AudioBufferSourceNode`s start at the same `AudioContext` timestamp (`currentTime + 0.05s`). They loop indefinitely.

### Limiter design
The LIMITER knob controls a `DynamicsCompressorNode` (ratio 20:1, attack 3 ms, release 250 ms, knee 0).

- Knob 100 → threshold 0 dB → compressor is transparent, no limiting
- Knob 0 → threshold −20 dB → aggressive peak limiting
- Mapping: `threshold_dB = -(100 - value) * 0.2`

Web Audio's `DynamicsCompressorNode` applies automatic makeup gain (`-threshold * (1 - 1/ratio)` dB) which would make lower-threshold settings sound louder. A `postLimiterGain` node cancels this exactly:

```js
const compensation = Math.pow(10, threshold_dB * (1 - 1 / ratio) / 20)
postLimiterGain.gain.value = compensation
```

This keeps signals below the threshold at their original level; only peaks above the threshold are attenuated. No waveform distortion occurs (unlike a WaveShaperNode/clipper approach).

### Mono channel downmix
Mono-mapped audio files may be encoded as stereo MP3s (with stereo reverb or effects). A `GainNode` with `channelCount = 1` and `channelCountMode = 'explicit'` is inserted between the `AnalyserNode` and the channel's gain chain, downmixing to true mono before the `StereoPannerNode` positions it.

### Level metering
Each source file has an `AnalyserNode` (fftSize 256, smoothingTimeConstant 0.75) tapped before the channel gain. Stereo pairs share one analyser, guaranteeing cohesive L/R meter movement. `getSourceLevel(fileKey)` computes RMS × 7, clamped to 0–1.

---

## UI Behaviour Notes

- **Solo:** global SOLO button acts on selected channel(s); multiple channels can be soloed simultaneously
- **Mute:** global MUTE button acts on selected channel(s); solo overrides mute
- **Stereo pairs:** selecting, soloing, muting, volume, EQ, and pan/bal all affect both channels in a stereo pair simultaneously
- **Stereo imaging:** stereo pair channels default to L hard-left / R hard-right, preserving the source's stereo image. The PAN/BAL knob shifts the image as a balance control (center = natural stereo).
- **Mono integrity:** mono channel files are downmixed to a single channel before processing, ensuring they behave as point sources in the stereo field regardless of their MP3 encoding.
- **Level meters:** dark when audio is not started, dark on channels without audio files, and react to actual signal content (go flat on silent bars)
- **Mobile:** landscape-only; portrait shows a rotate overlay; mixer scales to fit viewport with a minimum scale of 0.65 to keep controls readable; scrolls if viewport is too small even at minimum scale

---

## Deployment

```bash
npm run dev          # local dev server
npm run build        # production build → dist/
npm run deploy       # build + push dist/ to gh-pages branch
```

`public/CNAME` ensures the custom domain `p16-simulator.cloud` is preserved on every deploy and never reset by GitHub Pages.

---

## Known Gaps (Phase 3 targets)

- **6 missing audio tracks:** GTR 2, VIO, SAXO, MD, CLICK, ACC — add MP3s and map them in `audioEngine.js`
- **SETUP section** (LINK, GROUP, RECALL, STORE buttons) — visually present but non-functional (opacity 0.2)
- **Guided training scenarios** — app secretly applies a broken state; user must diagnose and fix
- **Preset save / recall** — serialise reducer state to localStorage or URL
- **MIDI integration** — out of scope for this version
- **Mobile portrait layout** — intentionally excluded; landscape only

---

## EQ Parameter Reference

| Knob | Filter type | Frequency | Range |
|---|---|---|---|
| BASS | Low shelf | 200 Hz | ±12 dB |
| MID | Peaking | 200–8000 Hz (log, set by FREQ) | ±12 dB |
| FREQ | — | center frequency for MID band | 200 Hz (0) → 8000 Hz (100) |
| TREBLE | High shelf | 4000 Hz | ±12 dB |

All knobs use the range 0–100, where 50 = neutral (0 dB / default frequency).

---

## Changelog

### v1.1
- **Limiter fixed:** replaced WaveShaperNode (hard clipper, caused distortion/robotic sound) and the pre-compressor-gain approach (behaved like a volume knob) with a properly configured `DynamicsCompressorNode`. Threshold range narrowed to 0 to −20 dB; `postLimiterGain` cancels the automatic makeup gain so quiet parts stay at the same level while only peaks above the threshold are limited.
- **Stereo pair imaging fixed:** stereo L/R channels now default to hard-left / hard-right pan, correctly preserving the stereo image of DRUM, KEYS, and SEQ source files.
- **PAN/BAL control redesigned for stereo pairs:** knob now acts as a balance control (0 = natural stereo, centre always restores full L/R imaging). Previously it set the same pan on both channels, collapsing stereo.
- **Mono channel downmix added:** a single-channel `GainNode` downmixes mono-mapped files to true mono before the signal chain, preventing stereo-encoded MP3s from leaking stereo width into nominally mono channels.
