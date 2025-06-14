# Values Compass Exercise

## Overview

This is a single-page React application designed for meditation practitioners and changemakers to identify their personal values through a structured comparison exercise. The app guides users through a series of value comparisons, followed by customization and self-assessment, creating a personalized framework for transformation and purpose.

## System Architecture

The application follows a client-side only architecture with no backend dependencies. It's built as a modern React SPA using Vite as the build tool and development server.

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: Zustand for global state management
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Query Management**: TanStack Query for future API integration

### Backend Architecture
- **Server**: Express.js with TypeScript (currently minimal setup)
- **Database**: PostgreSQL with Drizzle ORM configured
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: Hot reloading with Vite middleware integration

## Key Components

### Core Application Flow
1. **Home Page** (`/`) - Introduction and exercise explanation
2. **Comparison Phase** (`/comparison`) - Value pair comparisons with intelligent sorting
3. **Customization Phase** (`/customize`) - Edit and personalize top values
4. **Rating Phase** (`/rating`) - Self-assessment and export functionality

### Value Sorting Algorithm
- Custom sorting algorithm in `ValueSortingAlgorithm` class
- Tracks comparison history, presentation counts, and value relationships
- Implements intelligent pair selection to minimize comparisons while maximizing accuracy
- Handles "undecided" responses by tracking value relationships
- Uses completion criteria (25-45 rounds) with early termination based on clear separation

### State Management
- Centralized store using Zustand (`useValuesStore`)
- Manages 93 predefined values (83 standard + 10 meditation/changemaker specific)
- Tracks current comparison state, completion status, and user customizations
- Handles value scoring, editing, and rating functionality

### UI Components
- **ComparisonCard**: Presents value pairs for user selection
- **ValueCard**: Displays individual values with editing capabilities
- Custom UI components built on Radix primitives for accessibility
- Progress tracking and responsive design

## Data Flow

1. **Initialization**: Load 93 predefined values into store
2. **Comparison Phase**: 
   - Algorithm selects optimal value pairs
   - User selections update value scores
   - Progress tracked until completion criteria met
3. **Customization Phase**:
   - Display top values based on scoring
   - Allow name/description editing
   - Mark customized values with `isCustom` flag
4. **Rating Phase**:
   - Users rate alignment with each value (1-10 scale)
   - Export functionality for final results

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React, React DOM, React Router (Wouter)
- **UI Libraries**: Radix UI primitives, Lucide React icons
- **State/Query**: Zustand, TanStack Query
- **Styling**: Tailwind CSS, Class Variance Authority
- **Utilities**: date-fns, clsx, html2canvas (for export)

### Backend Dependencies (Configured but Minimal)
- **Database**: Drizzle ORM, @neondatabase/serverless
- **Server**: Express.js, session management
- **Development**: tsx, esbuild for production builds

### Development Dependencies
- **Build Tools**: Vite, TypeScript, PostCSS
- **Replit Integration**: Various Replit-specific plugins for development environment

## Deployment Strategy

### Development Environment
- Runs on Replit with Node.js 20
- PostgreSQL 16 module available
- Hot reloading with Vite dev server on port 5000
- Auto-installs dependencies on startup

### Production Deployment
- **Target**: Google Cloud Run
- **Build Process**: 
  1. `npm run build` - Builds React app and bundles server
  2. Vite builds client to `dist/public`
  3. esbuild bundles server to `dist/index.js`
- **Runtime**: Node.js production mode serving static files and API

### Configuration
- Environment variables for database connection
- Drizzle migrations in `./migrations` directory
- Database schema defined in `shared/schema.ts`

## Changelog

```
Changelog:
- June 13, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```