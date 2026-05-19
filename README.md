# Behringer Powerplay P16-M Simulator

A browser-based interactive training simulator for the Behringer Powerplay P16-M 16-channel digital personal mixer.

**Live:** https://p16-simulator.cloud

---

## What It Is

A functional training tool for musicians who need to understand the P16-M before using it in a live or rehearsal context. It is not a pixel-perfect hardware clone — the goal is learning by doing.

Features:
- Two skins: **P16-M** (classic hardware layout) and **P16-HQ** (modern layout)
- Full Web Audio API mixing engine — real stereo/mono signal chains, EQ, pan, limiter
- 16-channel mixer with per-channel mute, solo, EQ (bass/mid/freq/treble), pan/balance
- Master output section with EQ, pan, limiter, and output level
- Multi-track audio streamed from Cloudflare R2 — no bundled audio files
- Song selector — add new songs by uploading to R2, no code changes needed
- Interactive training panel with 4 modules, 11 milestones, a quiz, and a completion certificate
- Light/dark theme toggle; skin and theme persisted in `localStorage`

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Audio | Web Audio API (no external libraries) |
| Audio hosting | Cloudflare R2 (`cdn.p16-simulator.cloud`) |
| Deployment | GitHub Pages via `gh-pages` |

---

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173. Audio requires an internet connection (tracks stream from Cloudflare R2).

```bash
npm run build    # production build → dist/
npm run deploy   # build + push to gh-pages branch
```

---

## Adding Songs

1. Upload MP3 files to R2 under `songs/<Song Title>/`. Filenames must match channel labels exactly: `DRUM.mp3`, `BASS.mp3`, `GTR 1.mp3`, etc.
2. Add an entry to `songs.json` at the bucket root:

```json
{
  "id": "my-song-id",
  "title": "Artist - Song Title",
  "folder": "songs/Artist - Song Title",
  "tracks": {
    "DRUM": "DRUM.mp3",
    "BASS": "BASS.mp3"
  }
}
```

Only include keys for tracks that are actually uploaded. Missing keys produce silent channels — no code changes required.

---

## Channel Layout

| Channels | Label | Type |
|---|---|---|
| 1–2 | DRUM | Stereo |
| 3–4 | KEYS | Stereo |
| 5–6 | SEQ | Stereo |
| 7 | SYNTH | Mono |
| 8 | BASS | Mono |
| 9 | GTR 1 | Mono |
| 10 | GTR 2 | Mono |
| 11 | VIO | Mono |
| 12 | SAXO | Mono |
| 13 | ALL VCL | Mono |
| 14 | MD | Mono |
| 15 | CLICK | Mono |
| 16 | ACC | Mono |

---

## Created By

Henry David Lie & Kevin Award Armeldo
