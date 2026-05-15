# MTG Wheel

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

A Nuxt app for randomly distributing Magic: The Gathering (MTG) packs to players using a virtual wheel.

## Features

This app consists of three pages:

1. **Selection Page**: Players enter which MTG packs will be included in the wheel, the number of players, and choose whether packs should deplete (removed after selection) or replenish (stay in the wheel).

2. **Wheel Page**: Interactive wheel spinning to randomly assign packs to players.

3. **Summary Page**: Displays a summary of the players and which packs each received.

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Renovate integration

Install [Renovate GitHub app](https://github.com/apps/renovate/installations/select_target) on your repository and you are good to go.
