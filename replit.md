# Educational RPG Game

## Overview

This is a web-based educational RPG game built with a modern full-stack architecture. The game combines educational content (questions and quizzes) with RPG mechanics, featuring a top-down 2D game world where players answer questions to unlock treasures, defeat enemies, and progress through the game.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18+ with TypeScript**: Modern React application using functional components and hooks
- **Three.js Integration**: Uses `@react-three/fiber` and `@react-three/drei` for 3D graphics capabilities
- **Game Engine**: Custom Phaser.js-based game engine for 2D RPG mechanics
- **Styling**: Tailwind CSS with Radix UI components for consistent UI design
- **State Management**: Custom game state management with React context and stores

### Backend Architecture
- **Express.js Server**: Node.js backend with TypeScript
- **RESTful API Structure**: Routes organized under `/api` prefix
- **Middleware Stack**: Request logging, JSON parsing, error handling
- **Development Support**: Vite integration for hot module replacement

### Build System
- **Vite**: Modern build tool with React plugin and TypeScript support
- **GLSL Shader Support**: Built-in support for shader files
- **Asset Optimization**: Configured for 3D models, audio files, and game assets
- **Development Server**: Hot reload with error overlay for development

## Key Components

### Game Engine Components
1. **Scene Management**: Phaser.js-based scene system with game state management
2. **Entity System**: Player, enemies (skeleton, zombie, bat, boss), bullets, doors, chests
3. **Audio System**: Background music and sound effects with fallback support
4. **Question Management**: Educational content integration with game mechanics
5. **Asset Management**: Sprite sheets, tile maps, audio files, and 3D models

### Educational Features
1. **Question System**: Multiple-choice questions integrated into gameplay
2. **Progressive Difficulty**: Questions and enemies scale with game progression
3. **Interactive Elements**: Chests and doors that require correct answers to unlock
4. **Reward Mechanics**: Players earn progress by answering questions correctly

### UI Components
1. **Game HUD**: Health bars, score display, progress indicators
2. **Loading Screens**: Asset loading with progress feedback
3. **Interface Components**: Radix UI-based components for consistent design
4. **Responsive Design**: Mobile-friendly interface with touch controls

## Data Flow

### Game State Flow
1. **Initialization**: Game managers (Audio, Asset, GameState, Question) are initialized
2. **Asset Loading**: Game assets are preloaded with progress tracking
3. **Game Loop**: Phaser.js manages the main game loop with entity updates
4. **Question Integration**: Educational content is seamlessly integrated into gameplay mechanics
5. **State Persistence**: Game progress and player stats are maintained across sessions

### Client-Server Communication
1. **API Requests**: Frontend communicates with backend via REST API
2. **User Management**: Basic user system with in-memory storage (development setup)
3. **Query Management**: TanStack Query for efficient data fetching and caching

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React, Three.js, Phaser.js
- **Component Library**: Radix UI for accessible components
- **Styling**: Tailwind CSS, PostCSS
- **State Management**: TanStack Query for server state
- **Audio/Video**: Built-in Web Audio API support

### Backend Dependencies
- **Server Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (configured but not actively used in current implementation)
- **Session Management**: Built-in session handling
- **Development Tools**: Hot reload, error handling, logging

### Build Dependencies
- **Build Tool**: Vite with React and TypeScript plugins
- **Code Quality**: ESLint, TypeScript compiler
- **Asset Processing**: Support for various file formats (GLTF, GLB, audio files)

## Deployment Strategy

### Development Environment
1. **Local Development**: `npm run dev` starts both client and server with hot reload
2. **Type Checking**: `npm run check` for TypeScript validation
3. **Database Management**: `npm run db:push` for schema updates

### Production Build
1. **Client Build**: Vite builds optimized React application
2. **Server Build**: esbuild bundles Node.js server for production
3. **Static Assets**: Built client files served from `dist/public`
4. **Environment Variables**: Database URL and other config via environment variables

### Database Configuration
- **ORM**: Drizzle with PostgreSQL dialect
- **Migrations**: Managed through `drizzle-kit`
- **Schema**: User management with extensible design
- **Fallback**: In-memory storage for development without database

The architecture supports both development flexibility and production scalability, with a clear separation between game logic, educational content, and web infrastructure. The modular design allows for easy extension of game features and educational content.