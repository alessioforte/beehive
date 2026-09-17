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

| Route                    | Purpose                |
| ------------------------ | ---------------------- |
| `/`                      | Landing page           |
| `/api-docs`              | Specification picker   |
| `/api-docs/viewer?url=…` | Documentation viewer   |
| `/api-docs/test`         | Local format test page |

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
