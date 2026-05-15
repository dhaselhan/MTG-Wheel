# MTG Wheel

A Nuxt 4 app for randomly assigning Magic: The Gathering packs to players with a spinning pack wheel.

## Features

- Select packs from `public/mtg_sets.csv`.
- Configure player count and packs per player.
- Choose deplete mode, where selected packs are removed after each spin, or replenish mode, where packs can repeat.
- Spin through a visual pack wheel and track picks as players receive packs.
- Deploy as a static site on GitHub Pages.

## Tech Stack

- Nuxt 4
- Nuxt UI
- Tailwind CSS
- pnpm

## Setup

Install dependencies:

```bash
pnpm install
```

Start the local dev server:

```bash
pnpm dev
```

Run checks:

```bash
pnpm run lint
pnpm run typecheck
```

Build for production:

```bash
pnpm run build
```

Generate the static GitHub Pages build:

```bash
pnpm run generate
```

## GitHub Pages

This repo includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml`.

To deploy:

1. Push to the `main` branch.
2. In the GitHub repository settings, set Pages source to **GitHub Actions**.
3. The deploy workflow builds with Nuxt's `github_pages` preset and publishes `.output/public`.

For project Pages, the workflow automatically sets `NUXT_APP_BASE_URL` to `/<repo-name>/`. For a root `<owner>.github.io` repository, it uses `/`.

## Data

Pack data is loaded from `public/mtg_sets.csv`. Keep the first row as the header, then add one set per line:

```csv
set,code
Tarkir: Dragonstorm,TDM
```
