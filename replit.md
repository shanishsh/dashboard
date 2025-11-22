# Sales & Purchasing Analytics Dashboard

## Overview

This is a professional data analytics dashboard application for visualizing and analyzing sales and purchasing data. Users can upload Excel (.xlsx, .xls) or CSV files, which are parsed and stored in-memory. The application provides interactive dashboards, data tables, and analytics visualizations to help users understand their business metrics through charts and KPIs.

The application is built as a full-stack TypeScript solution with a React frontend and Express backend, following a monorepo structure with shared type definitions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool and development server.

**Routing**: Client-side routing implemented with Wouter, a lightweight React router. Routes include:
- `/` - Main dashboard with key metrics and charts
- `/tables` - Interactive data table viewer with pagination and sorting
- `/analytics` - Advanced analytics and visualizations
- `/upload` - File upload interface

**State Management**: TanStack Query (React Query) for server state management, providing caching, background refetching, and optimistic updates. No global state library is used; component state is managed locally with React hooks.

**UI Component Library**: Shadcn UI (New York style variant) built on Radix UI primitives. Components follow a consistent design system with:
- Tailwind CSS for styling with custom theme tokens
- CSS variables for theme customization (light/dark mode support)
- Typography system using Inter for UI text and JetBrains Mono for data/numbers
- Carbon Design System principles adapted for data visualization

**Data Visualization**: Recharts library for creating line charts, bar charts, and pie charts with responsive containers and consistent theming.

**Form Handling**: React Hook Form with Zod validation resolvers for type-safe form validation.

**File Upload**: Custom drag-and-drop file upload component using native browser APIs and Multer for server-side processing.

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js.

**Development vs Production**:
- Development mode (`index-dev.ts`): Vite middleware integration for HMR and development server
- Production mode (`index-prod.ts`): Serves pre-built static assets from dist/public

**API Design**: RESTful endpoints for dataset management:
- `GET /api/datasets` - List all uploaded datasets (summaries)
- `GET /api/datasets/:id` - Retrieve full dataset with data
- `POST /api/datasets` - Upload and parse new dataset file
- `DELETE /api/datasets/:id` - Remove dataset

**File Processing**: Server-side Excel/CSV parsing using XLSX library. Files are parsed into JSON format with column headers and row data extracted from the first worksheet.

**Data Storage**: In-memory storage implementation (`MemStorage` class) that maintains datasets in a Map data structure. Datasets include:
- Unique ID (UUID)
- File name
- Upload timestamp
- Row/column counts
- Column names array
- Full data as array of records

**Rationale**: In-memory storage was chosen for simplicity and fast prototyping. This approach eliminates database setup complexity but data is lost on server restart. For production, this should be replaced with a persistent database solution.

### Shared Schema & Type Safety

**Shared Types**: Common TypeScript interfaces and Zod schemas defined in `shared/schema.ts` and used across both frontend and backend:
- `DatasetFile` - Complete dataset with metadata and data
- `DatasetSummary` - Lightweight dataset metadata for listings
- `SalesMetrics` - Calculated business metrics
- `ChartDataPoint` - Standardized chart data structure

**Validation**: Zod schemas provide runtime validation and type inference, ensuring type safety across the client-server boundary.

### Build & Deployment Architecture

**Build Process**:
1. Frontend: Vite builds React app to `dist/public`
2. Backend: esbuild bundles server code to `dist/index.js` with ESM format

**Module System**: ESNext modules throughout with `"type": "module"` in package.json.

**Path Aliases**: TypeScript path mapping configured for clean imports:
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

**Development Workflow**: 
- Hot module replacement in development via Vite
- TypeScript compilation checking without emit
- Replit-specific plugins for development experience (error modal, dev banner, cartographer)

## External Dependencies

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Radix UI**: Headless component primitives for accessible UI components
- **Shadcn UI**: Pre-built component library using Radix UI and Tailwind
- **Lucide React**: Icon library for consistent iconography
- **class-variance-authority**: Type-safe variant management for components
- **Google Fonts**: Inter and JetBrains Mono fonts loaded via CDN

### Data Visualization
- **Recharts**: Composable charting library built on React and D3

### Data Processing
- **XLSX**: Excel file parsing and manipulation (SheetJS)
- **Multer**: Multipart form data handling for file uploads
- **date-fns**: Date utility library for formatting and manipulation

### State & API Management
- **TanStack Query**: Async state management and data fetching
- **Wouter**: Lightweight client-side routing
- **React Hook Form**: Performant form state management
- **Zod**: Schema validation and type inference

### Database (Configured but Not Currently Used)
- **Drizzle ORM**: TypeScript ORM configured with PostgreSQL dialect
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **connect-pg-simple**: PostgreSQL session store (for future use)

**Note**: Database configuration exists in `drizzle.config.ts` and schema files, but the application currently uses in-memory storage. The database infrastructure is ready for implementation when persistence is needed.

### Build Tools
- **Vite**: Frontend build tool and dev server
- **esbuild**: Fast JavaScript bundler for backend
- **TypeScript**: Type system and compiler
- **PostCSS & Autoprefixer**: CSS processing

### Development Tools
- **tsx**: TypeScript execution engine for Node.js
- **Replit Plugins**: Development experience enhancements (runtime error modal, dev banner, cartographer for code intelligence)