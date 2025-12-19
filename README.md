# 🐝 Beehive - OpenAPI Documentation Viewer

A beautiful, interactive OpenAPI/Swagger documentation viewer built with Next.js, React, TypeScript, and Mantine UI.

![Beehive Banner](https://img.shields.io/badge/OpenAPI-3.0-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![Mantine](https://img.shields.io/badge/Mantine-8-339af0.svg)

## ✨ Features

- 📖 **Beautiful Documentation Display** - Render OpenAPI specifications with a clean, modern interface
- 🎨 **Mantine UI Components** - Leveraging the power of Mantine for a polished user experience
- 🔍 **Smart Search & Navigation** - Quickly find endpoints with intelligent search and sidebar navigation
- 📊 **Comprehensive API Details** - View parameters, request bodies, responses, schemas, and more
- 🏷️ **Tag-based Organization** - Automatically groups endpoints by tags for better organization
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- 🎯 **Type-Safe** - Fully typed with TypeScript for better development experience
- 🚀 **Fast & Performant** - Built with Next.js for optimal performance
- 🎭 **Multiple Content Types** - Supports JSON, YAML, and various content types
- 🔐 **Security Schemes Display** - Shows authentication requirements for each endpoint
- 📝 **Example Generation** - Automatically generates examples from schemas
- 🎨 **Syntax Highlighting** - Code examples with proper formatting
- 🔗 **Deep Linking** - Share direct links to specific endpoints

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd beehive
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Usage

### Loading API Documentation

1. Navigate to the API Docs page (`/api-docs`)
2. Enter your OpenAPI specification URL in the input field
3. Click "Load Specification" or press Enter
4. Browse your beautiful API documentation!

### Try Example APIs

The application comes with pre-configured example APIs:

- **Petstore API** - Classic OpenAPI example
- **GitHub API** - Real-world API example
- **Stripe API** - Complex API with extensive documentation

### URL Format

The OpenAPI specification URL should point to a valid JSON or YAML file:

- `https://api.example.com/openapi.json`
- `https://api.example.com/swagger.yaml`
- `https://raw.githubusercontent.com/user/repo/openapi.json`

## 📁 Project Structure

```
beehive/
├── app/                      # Next.js app directory
│   ├── api-docs/            # API documentation page
│   │   └── page.tsx         # Main documentation viewer page
│   ├── layout.tsx           # Root layout with Mantine provider
│   ├── page.tsx             # Home page
│   └── theme.ts             # Mantine theme configuration
├── components/              # React components
│   └── api-docs/           # API documentation components
│       ├── ApiDocumentation.tsx    # Main container component
│       ├── ApiHeader.tsx           # API info header
│       ├── ApiNavigation.tsx       # Sidebar navigation
│       ├── MethodBadge.tsx         # HTTP method badge
│       ├── OperationCard.tsx       # Endpoint details card
│       ├── ParametersTable.tsx     # Parameters table
│       ├── RequestBodySection.tsx  # Request body viewer
│       ├── ResponsesSection.tsx    # Responses viewer
│       ├── SchemaViewer.tsx        # JSON schema viewer
│       ├── StatusCodeBadge.tsx     # HTTP status badge
│       └── index.ts                # Component exports
├── hooks/                   # Custom React hooks
│   └── useOpenAPISpec.ts    # Hook for fetching OpenAPI specs
├── types/                   # TypeScript type definitions
│   └── openapi.ts          # OpenAPI 3.0 types
├── utils/                   # Utility functions
│   └── openapi-helpers.ts  # Helper functions for OpenAPI
└── public/                  # Static assets
```

## 🧩 Component Architecture

### Core Components

#### `ApiDocumentation`

Main container component that orchestrates the entire documentation display. Handles loading states, errors, and tab navigation.

#### `ApiHeader`

Displays API metadata including title, description, version, contact information, and server URLs.

#### `ApiNavigation`

Sidebar navigation with search functionality. Groups endpoints by tags and provides quick access.

#### `OperationCard`

Individual endpoint display showing method, path, parameters, request body, responses, and security requirements.

#### `SchemaViewer`

Recursive component for displaying JSON schemas with collapsible object properties.

### Utility Components

- **MethodBadge** - Color-coded HTTP method badges (GET, POST, PUT, DELETE, etc.)
- **StatusCodeBadge** - Color-coded HTTP status code badges
- **ParametersTable** - Tabular display of endpoint parameters
- **RequestBodySection** - Request body schema and examples
- **ResponsesSection** - Response schemas and examples with accordion display

## 🎨 Styling

The project uses Mantine UI for consistent, beautiful styling:

- **Theme Configuration** - Customize in `app/theme.ts`
- **Color Schemes** - Automatic dark/light mode support
- **Responsive Design** - Mobile-first approach with breakpoints
- **Custom Styles** - Component-level style overrides

### Color Coding

- **GET** - Blue
- **POST** - Green
- **PUT** - Orange
- **DELETE** - Red
- **PATCH** - Violet
- **2xx Status** - Green (Success)
- **3xx Status** - Blue (Redirect)
- **4xx Status** - Orange (Client Error)
- **5xx Status** - Red (Server Error)

## 🔧 Configuration

### Mantine Theme

Customize the Mantine theme in `app/theme.ts`:

```typescript
export default createTheme({
  primaryColor: "blue",
  fontFamily: "var(--font-geist-sans)",
  // Add your customizations
});
```

### TypeScript Configuration

The project uses strict TypeScript settings for type safety. Configure in `tsconfig.json`.

## 🛠️ Technologies

- **[Next.js 16](https://nextjs.org/)** - React framework for production
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Mantine UI 8](https://mantine.dev/)** - React component library
- **[Tabler Icons](https://tabler.io/icons)** - Beautiful icon set
- **[Swagger Parser](https://github.com/APIDevTools/swagger-parser)** - OpenAPI parsing

## 📝 OpenAPI Support

Beehive supports OpenAPI 3.0 specifications with the following features:

### Supported Features

- ✅ API Info (title, description, version, contact, license)
- ✅ Servers
- ✅ Paths and Operations
- ✅ Parameters (query, header, path, cookie)
- ✅ Request Bodies (all content types)
- ✅ Responses (all status codes)
- ✅ Schemas (objects, arrays, primitives)
- ✅ Examples
- ✅ Tags and Tag Descriptions
- ✅ Security Requirements
- ✅ Deprecated Endpoints
- ✅ Schema References ($ref)
- ✅ Component Schemas

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Deploy with one click

### Docker

```bash
# Build
docker build -t beehive .

# Run
docker run -p 3000:3000 beehive
```

### Manual Build

```bash
npm run build
npm start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Mantine UI](https://mantine.dev/) for the amazing component library
- [OpenAPI Initiative](https://www.openapis.org/) for the specification standard
- [Next.js Team](https://nextjs.org/) for the incredible framework
- All the amazing open source contributors

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Made with ❤️ by developers, for developers
