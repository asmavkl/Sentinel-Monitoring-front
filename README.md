# Sentinel.Web

Frontend foundation for the Sentinel Monitoring Platform.

## Tech stack

- React + Vite + TypeScript
- Material UI (MUI)
- TanStack Query
- Zustand
- Apache ECharts
- Axios
- Vitest + React Testing Library

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and production build |
| `npm run test` | Run unit tests |
| `npm run lint` | Run ESLint |
| `npm run format` | Format source with Prettier |

## Environment

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Monitoring API base URL |
| `VITE_AUTH_TOKEN_KEY` | Local storage key for portal JWT |
| `VITE_PORTAL_URL` | Optional external portal URL |

## Authentication

Sentinel.Web does not implement username/password login. The external portal issues a JWT that is stored in browser storage and attached to API requests as `Authorization: Bearer <token>`.

## Project structure

```
src/
├── api/           # Axios HTTP client
├── app/           # App shell, providers, query client
├── auth/          # Token provider abstraction
├── components/    # Shared UI and chart foundations
├── features/      # Feature-based pages
├── hooks/         # Shared hooks
├── layouts/       # Application layout
├── routes/        # Routing and guards
├── store/         # Zustand UI state
├── theme/         # MUI theme system
├── types/         # API and domain types
└── utils/         # Utilities
```
# Sentinel-Monitoring-front
# Sentinel-Monitoring-front
