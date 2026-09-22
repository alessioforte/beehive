# 🐝 Beehive

Beehive is a client-side OpenAPI and Swagger documentation viewer built with Vite, React, TypeScript, React Router, and Mantine.

## Features

- Load OpenAPI specifications from a URL or the bundled samples
- Parse JSON and YAML specifications in the browser
- Convert Swagger 2.0 documents for display as OpenAPI 3
- Browse endpoints by tag and search the API navigation
- Inspect parameters, request bodies, responses, schemas, and security schemes
- Send API requests directly from the browser
- Switch between light and dark color schemes

## Client-only architecture

Beehive does not include an API server or request proxy. Specifications and API requests are fetched directly by the browser.

Remote servers must therefore permit cross-origin requests from the origin where Beehive is running. If a specification or API cannot be loaded, check its CORS response headers. Authentication credentials entered in the request drawer are sent directly to the selected API and do not pass through Beehive infrastructure.

## Getting started

Requirements:

- Node.js 20.19+ or 22.12+
- npm

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3021](http://localhost:3021).

## Optional OAuth authentication

Authentication is disabled by default, so the application behaves exactly as
the public API documentation viewer. Enable it with the following Vite build
variables:

```text
VITE_BASE_PATH=/
VITE_AUTH_ENABLED=true
VITE_API_URL=https://localhost:5050
VITE_AUTH_URL=https://localhost:5050/auth
VITE_OAUTH_CLIENT_ID=beehive
VITE_OAUTH_REDIRECT_URI=http://localhost:3021/auth/callback
VITE_OPENAPI_CATALOG_URL=https://localhost:5050/openapi/catalog
VITE_OPENAPI_AUTHORIZED_ORIGINS=
```

Set `VITE_BASE_PATH` to the URL path where the application is mounted. For
example, use `/beehive` when the application is served from
`http://localhost:3021/beehive`. Include the same path in the registered OAuth
redirect URI: `http://localhost:3021/beehive/auth/callback`.

The enabled flow uses OAuth Authorization Code with PKCE. The OAuth client must
be a public client, must allow the exact redirect URI above, and must support
the `authorization_code` and `refresh_token` grants. No client secret belongs
in this browser application.

With authentication enabled, all application routes are protected. After the
callback succeeds, `/` renders the blank authenticated home page. With the flag
disabled, `/` continues to render the existing Beehive landing page.

The catalog endpoint receives the OAuth access token as a Bearer token and can
return either an array or an object with an `items` array. Each item uses this
shape:

```json
{
  "id": "payments",
  "title": "Payments API",
  "description": "Create and manage payments.",
  "specUrl": "https://api.example.com/openapi.json",
  "version": "2.4.0",
  "specification": "OpenAPI 3.1",
  "format": "json",
  "owner": "Payments Platform",
  "tags": ["public", "payments"],
  "updatedAt": "2026-09-18T10:00:00Z"
}
```

Only `id`, `title`, and `specUrl` are required. Relative specification URLs are
resolved against the catalog endpoint. The viewer sends the OAuth Bearer token
when the specification has the same origin as `VITE_API_URL` or
`VITE_OPENAPI_CATALOG_URL`. For protected specifications on additional trusted
origins, add a comma-separated allowlist to `VITE_OPENAPI_AUTHORIZED_ORIGINS`.
Tokens are never sent to specification origins outside this allowlist.

The reusable implementation lives in `lib/auth`. It accepts configuration
rather than reading Vite variables directly; `src/auth.ts` is the small
Beehive-specific environment adapter.

## Scripts

```bash
npm run dev      # Start Vite on port 3021
npm run build    # Type-check and create a production build
npm run preview  # Preview the production build on port 3021
npm run lint     # Run ESLint
npm run format   # Format TypeScript, TSX, and Markdown files
npm run clean    # Remove the production build
```

## Routes

| Route                    | Purpose                                         |
| ------------------------ | ----------------------------------------------- |
| `/`                      | Landing page                                    |
| `/auth/callback`         | OAuth callback (when authentication is enabled) |
| `/api-docs`              | Specification picker                            |
| `/api-docs/viewer?url=…` | Documentation viewer                            |

The app uses React Router with browser history. In production, configure the host to serve `index.html` for unknown paths so direct navigation to these routes works.

## Project structure

```text
beehive/
├── components/            # Shared UI and documentation components
│   └── api-docs/          # Viewer, navigation, schemas, and API tester
├── pages/                 # React Router route components and CSS modules
├── public/                # Bundled OpenAPI samples
├── src/
│   ├── App.tsx            # Route table
│   └── main.tsx           # React and Mantine application entry point
├── store/                 # Zustand application state
├── types/                 # OpenAPI and API tester types
├── utils/                 # Parsing, conversion, and request helpers
├── global.css             # Minimal global styles and font variables
├── theme.ts               # Mantine theme
├── index.html             # Vite HTML entry point
└── vite.config.ts         # Vite and import alias configuration
```

## Styling

Mantine provides the component system and theme. Layout-specific custom styling is kept in colocated CSS modules. The project does not use Tailwind CSS.

## Production build

```bash
npm run build
```

The static application is emitted to `dist/` and can be deployed to any static host that supports a single-page application fallback.
