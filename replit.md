# Meta2 — MetaState Realty Intelligence Platform

## Overview

Full-stack intelligence tool for MetaState Realty combining real-time Allegiant Air flight tracking with real estate buyer analytics for Southwest Florida markets.

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
- **HTTP client**: axios
- **Excel processing**: xlsx

## Key Pages

- `/app.html` — METASTATE Command Center (main dashboard with map, listings, inventory)
- `/tracker.html` — Allegiant flight tracker + buyer heatmap
- `/listings.html` — Property listings browser
- `/` — Root (redirects to app.html or serves static files)

## API Endpoints

### Flight Tracking
- `GET /api/flights?dep_iata=&arr_iata=` — AviationStack flight data
- `GET /api/inbound?airport=PGD|SRQ` — Allegiant inbound flights (airline G4)

### Real Estate — Parcl Labs
- `GET /api/parcl/markets` — Search markets
- `GET /api/parcl/housing-stock/:parclId` — Housing stock data
- `GET /api/parcl/inventory/:parclId` — For-sale inventory

### Real Estate — IDX Broker (MLS)
- `GET /api/idx/cities` — MLS cities
- `GET /api/idx/listings` — Active listings (by cityId)
- `GET /api/idx/sold` — Sold/pending listings
- `GET /api/idx/saved-links` — Saved search links
- `GET /api/idx/saved-link/:id/results` — Results for a saved link

### Inventory
- `GET /api/inventory/pulte` — Pulte/House Cube spec tracker (reads Excel workbook)

### Utility
- `GET /api/route-cities` — Allegiant route cities (Excel or cities.json fallback)
- `GET /api/config/markets` — Parcl and IDX city IDs

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Environment Variables (API Keys)

These have hardcoded fallback values from the original codebase but should be overridden with real keys:

- `AVIATION_API_KEY` — AviationStack API key
- `PARCL_API_KEY` — Parcl Labs API key
- `IDX_API_KEY` — IDX Broker API key

## External Data Files (not in repo)

These Excel files are read at runtime and must be placed in `artifacts/api-server/`:
- `Marketing - Closed SW.xlsx` — Buyer/closed sales data (for `/api/buyers`)
- `Spec Tracker (House Cube) 4.14.2026 - SC Version.xlsx` — Pulte inventory (for `/api/inventory/pulte`)

## Static Assets

All files in `artifacts/api-server/public/` are served as static assets:
- `airports.json` — US airport coordinates (9MB)
- `area-codes.json` — US area code data
- `cities.json` — Allegiant route cities fallback
- `us-zip-code-latitude-and-longitude.json` — ZIP code geo data
- `MetaLogo60923.png`, `meta-logo.png`, `meta-logo-cropped.png` — Brand logos
- `ryan-realtor.png` — Agent photo

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
