# Contributing

Thanks for your interest in improving the P16-M Simulator.

## Getting Started

```bash
git clone https://github.com/henrydavl/p16m-simulator.git
cd p16m-simulator
npm install
cp .env.example .env
# Set VITE_CDN_BASE in .env to your own audio CDN URL
npm run dev
```

## What You'll Need

- Node.js 18+
- A Cloudflare R2 bucket (or any HTTP file server) with audio tracks for local testing — see the [Adding Songs](README.md#adding-songs) section in the README

## Making Changes

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Test in both skins (P16-M and P16-HQ) and both themes (dark and light)
4. Open a pull request with a clear description of what changed and why

## Areas Welcome for Contribution

- New songs (upload audio to your own CDN and share the `songs.json` entry)
- Training module content improvements
- Bug fixes
- Accessibility improvements
- Additional language support for training text

## What to Avoid

- Don't commit `.env` or any file containing your CDN URL
- Don't add external audio libraries — the Web Audio API is intentional
- Don't break the classic skin while working on the HQ skin (or vice versa)

## Questions

Open a GitHub issue and tag it `question`.
