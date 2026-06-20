# Catalog Admin UI

React admin interface for the **catalog microservice** (product management).

## Tech stack

- **React 18** + **Vite** — fast dev experience, component model fits admin forms well
- **React Router** — protected routes for auth/authorization
- Responsive layout inspired by OFBiz Catalog Manager (Helveticus emerald theme)

## Prerequisites

- Node.js 18+ and npm
- Catalog service running at `http://localhost:8080`

## Setup

```bash
cd C:\vivek\catalog-admin
npm install
npm run dev
```

Open http://localhost:5173

## Authentication

| Username     | Password    | Role            | Can create products? |
|-------------|-------------|-----------------|----------------------|
| admin       | admin123    | ADMIN           | Yes                  |
| catalog_mgr | catalog123  | CATALOG_MANAGER | Yes                  |
| viewer      | viewer123   | VIEWER          | No (read-only API)   |

Login calls `POST /catalog/auth/login`. The UI stores the `X-User` auth header and sends it on every API request.

## Features (current)

- Login page with route protection
- Role-based access: only `ADMIN`, `CATALOG_MANAGER`, `MERCHANDISER` can open admin pages
- **Create Product** page — OFBiz EditProduct-inspired sections:
  - Identification (product ID, SKU, type, category, virtual/variant flags)
  - Names & descriptions
  - Dates
  - Physical / shipping dimensions
  - Miscellaneous flags (returnable, taxable, etc.)

## API proxy

Vite dev server proxies `/catalog/*` to the backend (see `vite.config.js`).

## Build for production

```bash
npm run build
npm run preview
```

Set `VITE_API_BASE` if the API is on a different host.
"# catalog-admin" 
