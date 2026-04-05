# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Excel Add-in (`artifacts/excel-addin`)
- React + Vite frontend styled as an Excel task pane
- Side-panel UI with two tabs: **Commands** and **Dimensions**
- Preview path: `/`

### API Server (`artifacts/api-server`)
- Express 5 backend serving `/api`
- Routes:
  - `POST /api/commands/execute` — Interprets commands (Sum, Multiply, Average, Min, Max, Subtract, Divide) on provided values
  - `GET /api/commands/history` — Returns last 20 executed commands
  - `POST /api/cells/dimensions` — Calculates cell width/height from text content and font settings
  - `POST /api/cells/batch-dimensions` — Batch cell dimension calculation

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
