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
- **AI**: OpenAI via Replit AI Integrations (gpt-5-mini)

## Artifacts

### SniperSheet — Excel Add-in (`artifacts/excel-addin`)
- React + Vite frontend styled as an Excel task pane (400px wide)
- Three tabs: **Smart Hub** (AI), **Commands** (arithmetic), **Dimensions** (cell sizing)
- Full bilingual support: Arabic + English (RTL/LTR)
- Preview path: `/`

### API Server (`artifacts/api-server`)
- Express 5 backend serving `/api`
- Routes:
  - `POST /api/smart/analyze` — AI natural language → Excel formula (gpt-5-mini)
  - `GET /api/smart/history` — Last 20 smart analyses
  - `POST /api/commands/execute` — Arithmetic commands (Sum/جمع, Multiply/ضرب, Average/متوسط, Min/أقل, Max/أكبر, Subtract/طرح, Divide/قسمة) — supports Arabic aliases
  - `GET /api/commands/history` — Last 20 executed commands
  - `POST /api/cells/dimensions` — Cell width/height from text (Arabic-aware character widths)
  - `POST /api/cells/batch-dimensions` — Batch cell dimension calculation

## Architecture Notes

- **Smart Hub AI**: Uses `@workspace/integrations-openai-ai-server` → single-shot JSON structured response from `gpt-5-mini`. System prompt forces bilingual reasoning + styleHints for formatting commands.
- **Arabic command support**: `ARABIC_COMMAND_MAP` in `commands.ts` maps ~40 Arabic variants to normalized English commands.
- **Arabic cell dimensions**: `cells.ts` uses per-character width detection (Arabic chars use `0.9x` factor vs `0.6x` for Latin).
- **Command history**: In-memory only (not persisted), max 20 entries.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `cd lib/api-client-react && npx tsc -p tsconfig.json` — rebuild api-client-react dist after codegen
- `cd artifacts/api-server && node ./build.mjs` — rebuild API server (required after every backend change)
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
