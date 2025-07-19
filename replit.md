# Educational RPG Game - Modernized

## Overview

This is a web-based educational RPG game that has been successfully modernized from a legacy PHP/SQL architecture to a modern React/JSON/TypeScript stack. The game combines educational content (questions and quizzes) with RPG mechanics, featuring a top-down 2D Phaser 3 game world where players answer questions to unlock treasures, defeat enemies, and progress through multiple dungeons.

**Recent Major Update (July 19, 2025)**: Successfully converted the entire game from PHP/SQL backend to React/JSON frontend while preserving all original functionality and significantly enhancing gameplay mechanics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18+ with TypeScript**: Modern React application using functional components and hooks
- **Phaser 3 Game Engine**: Professional 2D game engine for RPG mechanics with proper scene management
- **Educational System**: JSON-based question system replacing original PHP/SQL structure
- **Styling**: Tailwind CSS with custom UI components for consistent design
- **State Management**: LocalStorage-based save system with GameStateManager for persistence

### Backend Architecture
- **Express.js Server**: Minimal Node.js backend for development server
- **JSON Data Storage**: Educational content and game configuration in TypeScript modules
- **Client-Side State**: LocalStorage-based save system eliminating need for database
- **Asset Serving**: Static file serving for game assets (sprites, audio, tilemaps)

### Build System
- **Vite**: Modern build tool with React plugin and TypeScript support
- **GLSL Shader Support**: Built-in support for shader files
- **Asset Optimization**: Configured for 3D models, audio files, and game assets
- **Development Server**: Hot reload with error overlay for development

## Key Components

### Game Engine Components
1. **Scene Management**: Multi-scene Phaser 3 system (Menu, Game, Dungeon, Boss, Pause, GameOver)
2. **Entity System**: Enhanced Player and Enemy classes with improved AI and pathfinding
3. **Audio System**: Complete audio integration with MP3/OGG fallback support
4. **Question Management**: 20+ educational questions across multiple categories and difficulties
5. **Asset Management**: All original sprites, tilemaps (CSV), and audio files preserved and organized

### Educational Features
1. **Question System**: 20+ multiple-choice questions across Math, Science, Geography, History
2. **Progressive Difficulty**: 5 difficulty levels scaling from basic to advanced concepts
3. **Interactive Elements**: Treasure chests requiring correct answers, level-gated doors
4. **Reward Mechanics**: Score bonuses, experience points, and accuracy tracking

### UI Components
1. **Game HUD**: Health bars, score display, progress indicators
2. **Loading Screens**: Asset loading with progress feedback
3. **Interface Components**: Radix UI-based components for consistent design
4. **Responsive Design**: Mobile-friendly interface with touch controls

## Data Flow

### Game State Flow
1. **Initialization**: React interface loads with GameStateManager for save/load functionality
2. **Asset Loading**: Phaser 3 preloads all sprites, audio, and tilemap data
3. **Game Loop**: Enhanced entity system with improved AI and collision detection
4. **Question Integration**: Interactive chest system requiring educational content completion
5. **State Persistence**: LocalStorage-based save system with high score tracking

### Modernization Changes (July 2025)
1. **Architecture**: Converted from PHP/SQL to React/JSON/TypeScript
2. **AI Enhancement**: Implemented state machine AI with pathfinding for enemies
3. **Scene Separation**: Created individual dungeon scenes with proper progression
4. **Save System**: Replaced database with LocalStorage-based save/load functionality
5. **Asset Preservation**: All original game assets copied and properly organized

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

### Data Storage Configuration
- **Game Saves**: LocalStorage-based persistence system
- **High Scores**: Client-side leaderboard with import/export capability
- **Educational Content**: JSON-based question system with TypeScript interfaces
- **Asset Management**: Static file serving for all game resources

## Recent Major Accomplishments (July 19, 2025)

✅ **Complete Architecture Modernization**: Successfully converted from PHP/SQL to React/JSON
✅ **Enhanced Enemy AI**: Implemented state machine with pathfinding around obstacles  
✅ **Dungeon Scene Separation**: Created 5 distinct scenes with proper progression system
✅ **Educational System**: 20+ questions across 4 categories with difficulty scaling
✅ **Save System**: Full game state persistence with high score tracking
✅ **Asset Preservation**: All original sprites, audio, and tilemaps preserved
✅ **Code Quality**: TypeScript, modular design, proper error handling

The architecture now supports modern development practices with a clear separation between game logic, educational content, and web infrastructure. The modular design allows for easy extension of game features and educational content while maintaining the original game's charm and functionality.