# AGENT.md — frontend

## Overview

Web UI for infinidream.ai. Dream creation, playback, playlists, and user management.

## Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite (with PWA plugin)
- **State:** Zustand (stores in `src/stores/`)
- **Data fetching:** TanStack React Query + Axios
- **Routing:** React Router DOM
- **Styling:** styled-components + styled-system
- **Real-time:** socket.io-client
- **Testing:** Vitest
- **Package manager:** pnpm

## Project Structure

```
src/
  api/           # API client functions and React Query hooks
  components/    # Reusable UI components
  routes/        # Page-level route components
  stores/        # Zustand state stores
  hooks/         # Custom React hooks
  context/       # React context providers
  providers/     # App-level providers
  styles/        # Global styles and theme
  constants/     # App constants
  schemas/       # Validation schemas
  types/         # TypeScript type definitions
  i18n/          # Internationalization
  utils/         # Utility functions
  icons/         # Icon components
```

## Commands

```bash
pnpm run dev           # Vite dev server (localhost:5173)
pnpm run build         # Production build
pnpm run build:stage   # Staging build
pnpm run type-check    # TypeScript validation
pnpm run lint          # ESLint check
pnpm run lint:fix      # Auto-fix lint issues
pnpm run test          # Run Vitest tests
```

## Key Patterns

- API hooks in `src/api/` use TanStack React Query for caching/fetching
- Zustand stores manage client-side state (auth, dreams, playlists, etc.)
- Socket.IO connects to backend for real-time progress updates
- styled-components for component-level styling with theme support

## Deployment

Netlify — push to `stage` or `main` branch.
