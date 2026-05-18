# Behringer Powerplay P16-M Simulator — CLAUDE.md

## Project Overview

A web-based training simulator for the Behringer Powerplay P16-M 16-channel Digital Personal Mixer.
Target users: Musicians who need to understand the device before using it in a live/rehearsal context.
Primary goal: Interactive training tool, not a 1:1 hardware clone.

---

## Tech Stack

- **Framework:** React
- **Styling:** Tailwind CSS
- **Audio:** Web Audio API (deferred — placeholder until multitrack audio files are provided)
- **Target browsers:** To be specified by developer (app is browser-specific by design)
- **Target devices:** Desktop and tablet (landscape), mobile landscape considered for later phase

---

## Channel Layout

16 channels arranged in a **horizontal strip**, faithful to the real P16-M hardware layout.
Channels scroll horizontally if needed on smaller screens.

| Channel | Label | Type |
|---------|-------|------|
| 1–2 | DRUM | Stereo (1 audio track) |
| 3–4 | KEYS | Stereo (1 audio track) |
| 5–6 | SEQ | Stereo (1 audio track) |
| 7 | SYNTH | Mono |
| 8 | BASS | Mono |
| 9 | GTR 1 | Mono |
| 10 | GTR 2 | Mono |
| 11 | VIO | Mono |
| 12 | SAXO | Mono |
| 13 | ALL VOCAL | Mono |
| 14 | MD | Mono |
| 15 | CLICK | Mono |
| 16 | ACC | Mono |

**Total audio tracks: 13** (stereo channels share one track each)

---

## UI Components

### Per Channel Strip (×16)
Each channel strip contains, top to bottom:

1. **Channel Label** — instrument name (e.g. DRUM, BASS, GTR 1)
2. **PAN knob** — applies to all channels including stereo (labeled PAN for simplicity)
3. **Channel Volume knob** — individual level for this channel
4. **Channel Select button** — selects the channel (highlights active channel, future: encoder control)
5. **SOLO button** — standard solo (only this channel audible, others muted)
6. **MUTE button** — silences this channel
7. **Level meter / indicator** — visual activity indicator (placeholder until audio phase)

### Master Section (right side)
1. **MAIN button** — selects overall mix; controls master mix volume when active
2. **Master Volume knob** — controls overall mix output level
3. **LIMITER knob** — visual only (Phase 1); sets limiter ceiling (will use `DynamicsCompressorNode` in audio phase)
4. **LEVEL (Output) knob** — controls headphone/monitor output gain

---

## Interaction Model

### Channel Selection (Phase 1 — all knobs visible)
- All 16 channel volume knobs are visible simultaneously on screen
- Each channel has its own independent volume knob
- Pressing a channel's Select button highlights it as active

### Channel Selection (Phase 2 — optional, keep architecture open)
- Pressing a channel button selects it
- A single main encoder then controls that channel's level
- Phase 1 layout must not block this refactor — keep channel level state decoupled from UI knob count

### Solo Behavior
- Standard solo: only the soloed channel is audible
- Multiple channels can be soloed simultaneously
- Solo overrides mute

### Mute Behavior
- Mute silences the channel
- Mute does not affect solo (if channel is soloed, solo wins)

### MAIN Button
- Pressing MAIN selects the master mix
- Master Volume knob controls the overall mix output
- Deselects any active channel selection

---

## Audio Architecture (Deferred — Phase 2)

> Audio implementation begins only after UI is stable and tested.

- 13 separate audio files, one per track (stereo channels use a stereo file)
- All tracks loaded and started simultaneously to stay in sync
- Each track routed through its own `GainNode` (channel volume) → `StereoPannerNode` (pan) → master `GainNode`
- Solo: mutes all `GainNode`s except soloed channel(s)
- Mute: sets channel `GainNode` gain to 0
- Limiter: `DynamicsCompressorNode` on master output chain
  - High ratio (20:1), fast attack (~1ms), release (~250ms), threshold set by Limiter knob
- Output Level: final `GainNode` before `AudioContext.destination`
- Browser target to be confirmed before audio implementation (affects API compatibility)

---

## Guided Training Scenarios (Deferred — Phase 3)

> Implemented after audio phase is stable.

- App secretly applies a "broken" state (e.g. BASS muted, wrong channel level, master at zero)
- Musician must identify and fix the problem
- Scenario prompt shown on screen (text description of the symptom, not the cause)
- Example scenarios:
  - "You can't hear the bass guitar" → BASS channel muted
  - "Everything sounds too quiet" → Master volume at minimum
  - "The click track is drowning everything" → CLICK level too high
  - "You hear everything except the guitar" → GTR 1 muted or level at zero
  - "The mix sounds unbalanced left" → PAN on a key channel hard left

---

## State Management

Use React `useState` / `useReducer` for:
- Per-channel: volume (0–100), pan (-50 to +50), mute (bool), solo (bool), selected (bool)
- Master: volume (0–100), limiter threshold (0–100, visual only), output level (0–100)
- Active selection: which channel (or MAIN) is currently selected

Keep audio state (GainNode values) decoupled from UI state — bridge them in a separate audio engine module when audio phase begins.

---

## File Structure (Suggested)

```
src/
  components/
    ChannelStrip.jsx       # Single channel strip component
    MasterSection.jsx      # MAIN, limiter, output level
    Knob.jsx               # Reusable rotary knob component
    Button.jsx             # Reusable button (mute, solo, select)
    LevelMeter.jsx         # Visual level indicator
    MixerBoard.jsx         # Full horizontal layout, renders all 16 strips
  audio/
    audioEngine.js         # Web Audio API setup (stubbed in Phase 1)
    trackLoader.js         # Loads and syncs 13 audio files (Phase 2)
  data/
    channels.js            # Channel definitions (label, type, index)
  App.jsx
  main.jsx
```

---

## Design Notes

- Color scheme: dark hardware aesthetic (dark gray/black background, amber/orange accents for active states)
- Knobs: rotary style, draggable (mouse drag up/down to change value)
- Active channel: highlighted with distinct border or backlight effect
- SOLO active: yellow indicator
- MUTE active: red indicator
- Horizontal scroll on tablet if all 16 strips don't fit viewport width
- Do not implement mobile portrait layout — landscape only when mobile is added

---

## Out of Scope (This Version)

- MIDI or network protocol communication with real P16-M hardware
- Per-channel EQ
- Preset/scene save and recall
- Mobile portrait layout
- Pixel-perfect P16-M skin/skeuomorphic design
