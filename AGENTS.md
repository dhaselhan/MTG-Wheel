# AI Agent Guidelines for mtg_wheel

## Architecture Overview
This is a Nuxt 4 application using Nuxt UI for components and Tailwind CSS for styling. The app follows Nuxt's file-based routing with pages in `app/pages/` and components in `app/components/`. The main layout is defined in `app/app.vue` using Nuxt UI's `UApp`, `UHeader`, `UMain`, and `UFooter` components.

Key files:
- `nuxt.config.ts`: Configures modules (`@nuxt/eslint`, `@nuxt/ui`), CSS imports, route rules (home page prerendered), and ESLint stylistic rules.
- `app.config.ts`: Sets UI theme colors (primary: green, neutral: slate).
- `app/assets/css/main.css`: Imports Tailwind and Nuxt UI, defines Public Sans font and green color palette.

## Development Workflow
- **Start dev server**: `pnpm dev` (runs on http://localhost:3000)
- **Build for production**: `pnpm build`
- **Preview build**: `pnpm preview`
- **Lint code**: `pnpm lint` (uses ESLint with Nuxt config)
- **Type check**: `pnpm typecheck` (Nuxt's TypeScript checking)
- **Install deps**: `pnpm install` (triggers `nuxt prepare` postinstall)

Dependencies are managed with pnpm; Renovate handles automated updates via `renovate.json`.

## Coding Conventions
- **ESLint rules**: No trailing commas, 1TBS brace style (configured in `nuxt.config.ts`).
- **Components**: Use Nuxt UI components (e.g., `UButton`, `UDropdownMenu`) with auto-imports. Prefix icons with `i-` (e.g., `i-lucide-arrow-right`).
- **Styling**: Tailwind classes; custom colors via CSS variables (e.g., `--ui-primary`).
- **TypeScript**: Strict mode via Nuxt's referenced tsconfigs.
- **File structure**: Place pages in `app/pages/`, components in `app/components/`, assets in `app/assets/`.

## Patterns and Examples
- **Layout usage**: In `app.vue`, wrap content with `UApp` and use slots like `#left` and `#right` in `UHeader`.
- **Page structure**: Use `UPageHero` and `UPageSection` for landing pages (see `app/pages/index.vue`).
- **Navigation**: `NuxtLink` for internal routes, `UButton` with `to` prop for links.
- **SEO**: Use `useHead` and `useSeoMeta` in script setup for meta tags.

Avoid generic practices; follow Nuxt UI's component API and this app's green-themed design.</content>
<parameter name="filePath">/Users/panda/WebstormProjects/mtg_wheel/AGENTS.md
