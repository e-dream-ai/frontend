# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
pnpm install                # Install dependencies
pnpm run dev                # Dev server on http://localhost:5173
pnpm run build              # Production build (tsc + vite build --mode prod)
pnpm run build:stage        # Staging build (tsc + vite build --mode stage)
pnpm run serve              # Preview production build on :4173
pnpm run test               # Run tests (vitest, single run)
pnpm run test:watch         # Run tests in watch mode
pnpm run type-check         # TypeScript check (tsc --noEmit)
pnpm run lint               # ESLint (js/ts only)
pnpm run lint:fix           # ESLint with auto-fix
pnpm run prettier:check     # Check formatting
pnpm run prettier            # Fix formatting
```

## Quality Gates (CI)

These checks run on every push. All must pass before merging:

1. **ESLint** — `pnpm run lint`
2. **Type check** — `pnpm run type-check`
3. **Prettier** — `pnpm run prettier:check`
4. **Build** — `pnpm run build`
5. **Smoke test** — `pnpm run serve` + curl homepage on :4173

Run locally before pushing:

```bash
pnpm run type-check && pnpm run prettier:check && pnpm run lint && pnpm run build
```

## Pre-commit Hook

Husky + lint-staged runs on commit:

- `*.{js,jsx,ts,tsx}` → `eslint --cache --fix`
- `*.{js,jsx,ts,tsx,css,md,json}` → `prettier --write`

## Architecture

**React 18 SPA** with Vite, TypeScript (strict), and React Router v7.

### State Management (three layers)

| Layer               | Tool                                     | Purpose                                                                    |
| ------------------- | ---------------------------------------- | -------------------------------------------------------------------------- |
| Server state        | React Query v4 (`@tanstack/react-query`) | API data fetching, caching, mutations                                      |
| Global client state | React Context (8 contexts)               | Auth, socket, modals, permissions, video-js, desktop/web client, highlight |
| Local client state  | Zustand (2 stores)                       | Studio session, playback sync                                              |

### API Layer (`src/api/`)

Each domain (dream, auth, user, playlist, etc.) has:

- `query/` — React Query `useQuery` hooks for reads
- `mutation/` — React Query `useMutation` hooks for writes

All use the shared Axios client (`src/client/axios.client.ts`) with cookie-based auth (`withCredentials: true`). HTTP interceptors handle 401 → logout.

### Provider Composition (`src/providers/providers.tsx`)

Uses a `withProviders()` HOC to compose ~12 providers in order. New providers go in this array.

### Component Pattern

```
src/components/pages/[page-name]/
├── [page-name].tsx            # Component + logic
├── [page-name].styled.tsx     # Styled-components
├── index.ts                   # Re-export
├── components/                # Page-specific sub-components
└── hooks/                     # Page-specific hooks

src/components/shared/[component-name]/
├── [component-name].tsx
├── [component-name].styled.tsx
└── index.ts
```

### Routing (`src/routes/`)

- `createBrowserRouter` with `ProtectedRoute` (auth-gated) and `PublicRoute` (login/signup) wrappers
- Role-based access: `ADMIN_GROUP`, `CREATOR_GROUP`, `USER_GROUP`
- Route constants in `src/constants/routes.constants.ts`

### Real-time (`src/context/socket.context.tsx`)

Socket.io client on namespace `/remote-control`. Cookie-based auth, 2 reconnect attempts. Ref-based listener management to avoid re-renders.

### Forms

React Hook Form + Yup schemas (`src/schemas/`). Schemas are co-located by feature name.

## Code Style

- **Prettier**: 2-space indent, semicolons, double quotes
- **ESLint**: react, react-hooks, import, jsx-a11y, @typescript-eslint, prettier integration
- **Unused vars**: error (args prefixed with `_` are exempt)
- **Path alias**: `@/*` maps to `src/*`

## Environment Variables

All browser-accessible env vars use the `VITE_` prefix:

| Variable                 | Purpose                                             |
| ------------------------ | --------------------------------------------------- |
| `VITE_BACKEND_URL`       | API base URL (e.g., `http://localhost:8080/api/v1`) |
| `VITE_SOCKET_URL`        | WebSocket URL (e.g., `ws://localhost:8080`)         |
| `VITE_WORKER`            | Worker service URL                                  |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics                                    |
| `VITE_GTM_ID`            | Google Tag Manager                                  |
| `VITE_BUGSNAG_API_KEY`   | Bugsnag error tracking                              |

Build modes: `development`, `stage`, `prod` (not "production" — Netlify strips devDependencies in "production" mode).

## Deployment

Netlify with two environments:

- **Staging**: `stage` branch → manual deploy trigger
- **Production**: `main` branch → manual deploy trigger

Git info injected at build time via `generate-git-info.js` → `VITE_COMMIT_REF`, `VITE_BRANCH`, `VITE_BUILD_DATE`.

## Full Stack Local Development

Requires three services running:

1. `presign-service` (Go) — `go run main.go`
2. `backend` (Node) — `pnpm dev`
3. `frontend` (this repo) — `pnpm dev`
