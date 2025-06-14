# Janusz Values App

A web application that helps users discover and prioritize their personal values through an interactive card sorting exercise, particularly designed for meditation practitioners and changemakers.

## Overview

The Janusz Values App guides users through a thoughtful process of value discovery using a "hot or not" style comparison system. Users compare pairs of values, customize their top selections, rate how well they're living according to each value, and export their final values list as an image.

## Features

- **Interactive Value Comparison**: Compare pairs of values through 25-45 rounds
- **Smart Algorithm**: Uses an Elo-like rating system to efficiently determine your value rankings
- **Customization**: Edit names and descriptions of your top 10 values
- **Self-Assessment**: Rate how well you've lived according to each value (1-10 scale)
- **Export Functionality**: Save your final values list as a PNG image
- **93 Curated Values**: Including both standard values and specialized values for meditators/changemakers

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui components
- Zustand for state management
- Wouter for routing
- Framer Motion for animations

### Backend
- Express with TypeScript
- Drizzle ORM
- Session management

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd janusz-values-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or the port specified by the PORT environment variable)

## Project Structure

```
/client/                # Frontend React application
  ├── src/
  │   ├── pages/       # Main application pages
  │   ├── components/  # Reusable UI components
  │   ├── lib/         # Core logic and utilities
  │   └── hooks/       # Custom React hooks
/server/               # Backend Express server
  ├── index.ts         # Server entry point
  └── routes.ts        # API routes
/shared/               # Shared types and schemas
```

## How It Works

1. **Introduction**: Users start at the home page and learn about the Values Compass Exercise
2. **Comparison Phase**: Users compare pairs of values, selecting which resonates more
3. **Refinement**: The algorithm focuses on top contenders to determine final rankings
4. **Customization**: Users can edit their top 10 values to better reflect personal interpretations
5. **Rating**: Users rate how well they've been living according to each value
6. **Export**: Final values list can be exported as an image for future reference

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Key Components

- **ValueCard**: Displays individual values with descriptions
- **ComparisonCard**: Handles the value comparison interface
- **Elo Algorithm**: Modified Elo rating system for value ranking
- **State Management**: Zustand store managing the entire user journey

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Add license information here]

## Acknowledgments

Designed specifically for meditation practitioners and changemakers seeking to align their actions with their deepest values.