# The Watching World

A pixel-art RPG adventure built with Next.js + TypeScript where Leo explores a world that reacts to his journey.

## What This Game Is About

Leo's grandmother is falling to a mysterious illness called the Watching Blight.  
To save her, Leo must travel beyond his village and search for the Heart of Aether while uncovering what is truly watching the world.

The game blends:

- top-down exploration
- narrative NPC encounters
- chapter-based progression
- atmospheric pixel-art presentation

## Chapters

- Chapter 1: **The Watching Forest**
- Chapter 2: **The Watching Deep**
- Future chapters: naming to be decided later

## Project Overview

The game currently focuses on Chapter 1 gameplay flow and progression systems:

- Story-driven intro and chapter transition flow
- Tile-based village + house maps
- Objective system and scripted NPC dialogue
- Interaction overlays, loaders, pause menu, and chapter music
- Zustand-powered game state with modular slices (core + chapter-specific)

## Current Development Status

Current implementation is in active Chapter 1 production:

- Landing flow: start button -> loader -> intro video -> loader -> Chapter 1
- Chapter 1 questline is playable (Finn objective flow + Elder Rowan bridge gate)
- Bridge crossing transitions into Chapter 2 route
- Pause/restart/music systems are functional
- Pixel-style UI pass is applied across major overlays/HUD components

Chapter 2 is scaffolded but still placeholder content:

- chapter module files for dialogue/objectives/routes exist
- Chapter 2 music component template exists (not mounted yet)
- gameplay systems and map progression for Chapter 2 are next implementation steps

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Zustand (state management with persistence)
- Tailwind CSS
- Cloudflare deployment tooling (`@opennextjs/cloudflare`, Wrangler)

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Useful Scripts

```bash
npm run dev        # local development
npm run typecheck  # TypeScript checks
npm run lint       # ESLint
npm run build      # production build
npm run deploy     # Cloudflare deploy flow
```

## Important Directories

- `src/app` - routes/pages
- `src/components` - game UI and overlays
- `src/data/maps` - map data
- `src/chapters` - chapter-scoped content modules (dialogue/objectives/routes)
- `src/store` - Zustand root store + slices
- `public` - sprites, audio, video, PWA assets

## Notes

- Chapter 2 scaffolding exists and is ready for implementation.
- The UI theme is aligned to a pixel-art RPG vibe.
