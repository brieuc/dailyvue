# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Project Setup
```bash
npm install
```

### Development Server
```bash
npm run serve
```
Starts the Vue development server with hot-reload at http://localhost:8080

### Production Build
```bash
npm run build
```
Compiles and minifies the application for production

### Code Quality
```bash
npm run lint
```
Runs ESLint to check and fix code style issues

## Architecture Overview

This is a Vue 3 application called "dailymon" (v0.6.0) that serves as a daily monitoring/tracking system with food, sport, and free-form entry models.

### Core Technologies
- **Vue 3** with Composition API
- **Pinia** for state management
- **Vue Router 4** for routing
- **Vue CLI** for build tooling and development

### Project Structure

#### State Management
- **Pinia Store**: `src/dailyStore.js` - Central store managing:
  - `foodModels`, `sportModels`, `freeModels` arrays
  - `errorMessage` for global error handling
  - `getModelsMap()` function to create unified model lookup

#### Authentication System
- **Authentication Composable**: `src/composables/useAuth.js` - Provides reactive `isLoggedIn` state and auth methods
- **Auth Service**: `src/services/auth.js` - Handles login/logout with token management
- **Login Component**: `src/components/LoginEntry.vue` - Authentication UI

#### API Layer
- **API Client**: `src/services/api.js` - HTTP client with automatic Bearer token injection
- **API Composable**: `src/composables/useApi.js` - Wrapper for loading states and error handling
- **Entry Service**: `src/services/entries.js` - Entry CRUD operations
- **Models Service**: `src/services/models.js` - Model data management

#### Data Models
The application works with three types of entry models:
- **Food Models** (`src/modelfood.js`) - Food/nutrition tracking
- **Sport Models** (`src/modelsport.js`) - Exercise/activity tracking  
- **Free Models** (`src/modelfree.js`) - General purpose entries

#### Time-based Organization
- **Period Management**: `src/oneperiod.js` - Handles week-long periods
- **Day Management**: `src/oneday.js` - Individual day data handling
- **Date Utilities**: Entry service provides `getMinDate()` and `getRelevantDates()` for chronological organization

#### Component Architecture
- **App.vue** - Main app component handling authentication state and period loading
- **OnePeriod.vue** - Week-long period display (7 days)
- **OneDay.vue** - Single day entry management
- **DayEntries.vue** - Day's entry list display
- **Model Components** - Specialized forms for each model type:
  - `ModelFood.vue`, `ModelFoodSingle.vue`
  - `ModelSport.vue` 
  - `ModelFree.vue`
  - `ModelSelection.vue`

### Key Patterns

#### Composables Pattern
The app extensively uses Vue 3 composables for business logic:
- `useAuth()` - Authentication state and methods
- `useApi()` - HTTP request handling with loading states
- `useEntries()` - Entry CRUD operations
- `useModels()` - Model data loading

#### Promise-based Data Loading
The main app uses Promise.all() to load models and dates in parallel during initialization, with proper error handling throughout the chain.

#### Reactive State Management
Global reactive state via Pinia with automatic cleanup on logout. The app watches `isLoggedIn` to trigger data initialization or cleanup.

### Environment Configuration
- Base API URL configured via `process.env.VUE_APP_URL`
- Token stored in localStorage for persistence
- Responsive design with mobile breakpoints at 393px