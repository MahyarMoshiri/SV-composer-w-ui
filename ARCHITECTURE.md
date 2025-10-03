# SV Composer UI - Architecture Documentation

This document provides a comprehensive overview of the SV Composer UI architecture, design decisions, and implementation details.

## Table of Contents

1. [Overview](#overview)
2. [Architecture Principles](#architecture-principles)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Component Architecture](#component-architecture)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Routing](#routing)
9. [Styling System](#styling-system)
10. [Data Flow](#data-flow)
11. [Design Patterns](#design-patterns)

## Overview

SV Composer UI is a React-based single-page application (SPA) that provides a comprehensive interface for the SV Composer poetic composition platform. The application follows modern React best practices and leverages a component-based architecture for maintainability and scalability.

### Key Features

- **Multi-bank support** with persistent selection
- **Real-time API integration** with the FastAPI backend
- **Responsive design** with dark mode support
- **Modular component architecture**
- **Type-safe API client**
- **Global state management** with React Context

## Architecture Principles

### 1. Separation of Concerns

- **Components**: UI presentation logic
- **Pages**: Route-level components
- **Contexts**: Global state management
- **API Layer**: Backend communication
- **Utilities**: Shared helper functions

### 2. Component Composition

Components are designed to be:
- **Reusable**: Shared UI components in `components/ui/`
- **Composable**: Complex UIs built from simple components
- **Self-contained**: Each component manages its own local state

### 3. Single Source of Truth

- Global state managed in `AppContext`
- API responses as the source of data
- LocalStorage for persistence only

### 4. Unidirectional Data Flow

```
User Action → Component → Context/API → State Update → Re-render
```

## Technology Stack

### Core

- **React 19.1.0**: UI library with hooks
- **React Router 7.1.3**: Client-side routing
- **Axios 1.12.2**: HTTP client

### UI & Styling

- **Tailwind CSS 4.0.0**: Utility-first CSS framework
- **shadcn/ui**: Pre-built accessible components
- **Lucide React**: Icon library
- **Recharts**: Data visualization

### Build Tools

- **Vite 6.3.5**: Fast build tool and dev server
- **PostCSS**: CSS processing
- **ESLint**: Code linting

## Project Structure

```
sv-composer-ui/
├── src/
│   ├── assets/              # Static assets (images, fonts)
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components (buttons, cards, etc.)
│   │   ├── TopBar.jsx      # Global top navigation
│   │   └── LeftNav.jsx     # Sidebar navigation
│   ├── contexts/           # React Context providers
│   │   └── AppContext.jsx  # Global application state
│   ├── lib/                # Utility functions
│   │   └── api.js          # API client and endpoints
│   ├── pages/              # Page-level components
│   │   ├── bible/          # Bible section sub-components
│   │   │   ├── SchemasBrowser.jsx
│   │   │   ├── MetaphorsBrowser.jsx
│   │   │   ├── FramesBrowser.jsx
│   │   │   └── BlendRulesViewer.jsx
│   │   ├── BiblePage.jsx
│   │   ├── RetrievalPage.jsx
│   │   ├── ComposePage.jsx
│   │   ├── GeneratePage.jsx
│   │   ├── BlendPage.jsx
│   │   ├── EvaluatePage.jsx
│   │   ├── ControlPage.jsx
│   │   ├── GoldPage.jsx
│   │   ├── FilmPlanPage.jsx
│   │   ├── BanksPage.jsx
│   │   └── StatusPage.jsx
│   ├── App.jsx             # Root component with routing
│   ├── App.css             # Global styles
│   ├── main.jsx            # Application entry point
│   └── index.css           # Base CSS
├── public/                 # Public static files
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
└── package.json           # Dependencies and scripts
```

### Directory Conventions

- **components/**: Reusable UI components
- **pages/**: Route-level components (one per route)
- **contexts/**: React Context providers for global state
- **lib/**: Utility functions and API client
- **assets/**: Static assets (images, fonts, etc.)

## Component Architecture

### Component Hierarchy

```
App (Router + AppProvider)
├── TopBar (Global navigation)
├── LeftNav (Sidebar)
└── Routes
    ├── BiblePage
    │   ├── SchemasBrowser
    │   ├── MetaphorsBrowser
    │   ├── FramesBrowser
    │   └── BlendRulesViewer
    ├── RetrievalPage
    ├── ComposePage
    ├── GeneratePage
    ├── BlendPage
    ├── EvaluatePage
    ├── ControlPage
    ├── GoldPage
    ├── FilmPlanPage
    ├── BanksPage
    └── StatusPage
```

### Component Types

#### 1. Layout Components

**TopBar** (`components/TopBar.jsx`)
- Global navigation bar
- Bankset selector with multi-select
- Harness indicator
- Health status badge

**LeftNav** (`components/LeftNav.jsx`)
- Fixed sidebar navigation
- Route highlighting
- Icon-based menu items

#### 2. Page Components

Each page component represents a major section:
- Self-contained functionality
- Manages local state
- Fetches data from API
- Uses shadcn/ui components

#### 3. UI Components

Located in `components/ui/`, these are shadcn/ui components:
- Button, Card, Input, Badge, etc.
- Accessible and customizable
- Styled with Tailwind CSS

## State Management

### Global State (AppContext)

The `AppContext` provides global state accessible throughout the app:

```javascript
{
  bankset: string[],              // Selected banks
  updateBankset: (banks) => void, // Update bankset
  availableBanks: Bank[],         // Available banks from registry
  harness: string,                // LLM harness state
  setHarness: (harness) => void,  // Update harness
  health: object,                 // System health status
  activeSelections: {             // Active retrieval selections
    schemas: [],
    metaphors: [],
    frames: [],
    gates: []
  },
  addToActive: (type, item) => void,
  removeFromActive: (type, id) => void,
  clearActive: (type?) => void
}
```

### Local State

Each component manages its own local state using `useState`:
- Form inputs
- Loading states
- Modal visibility
- Search filters

### Persistence

- **Bankset**: Stored in `localStorage` as JSON
- **Active Selections**: In-memory only (cleared on refresh)

### State Flow

```
User Action
    ↓
Component Handler
    ↓
Context Update / API Call
    ↓
State Update
    ↓
Component Re-render
```

## API Integration

### API Client (`lib/api.js`)

The API client provides:
- Axios instance with base configuration
- Request interceptor for bankset header
- Response interceptor for error handling
- Typed endpoint functions

### Request Interceptor

Automatically adds the `X-SV-Banks` header:

```javascript
api.interceptors.request.use((config) => {
  const bankset = localStorage.getItem('sv-bankset');
  if (bankset) {
    config.headers['X-SV-Banks'] = bankset;
  }
  return config;
});
```

### API Endpoints

All endpoints are defined in `apiEndpoints` object:

```javascript
apiEndpoints.getSchemas(params)
apiEndpoints.search(data)
apiEndpoints.generate(data)
// ... etc
```

### Error Handling

Errors are caught at the component level:

```javascript
try {
  const response = await apiEndpoints.search(data);
  // Handle success
} catch (error) {
  console.error('Search failed:', error);
  // Handle error
}
```

## Routing

### Route Configuration

Routes are defined in `App.jsx` using React Router:

```javascript
<Routes>
  <Route path="/" element={<Navigate to="/bible" replace />} />
  <Route path="/bible" element={<BiblePage />} />
  <Route path="/retrieval" element={<RetrievalPage />} />
  // ... etc
</Routes>
```

### Navigation

Navigation is handled by:
- **LeftNav**: `NavLink` components with active state
- **Programmatic**: `useNavigate()` hook

### Route Guards

Currently no authentication, but can be added:

```javascript
<Route path="/admin" element={
  <RequireAuth>
    <AdminPage />
  </RequireAuth>
} />
```

## Styling System

### Tailwind CSS

Utility-first CSS framework with custom configuration:

```css
/* App.css */
@import "tailwindcss";
@import "tw-animate-css";
```

### Theme System

Custom CSS variables for theming:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  // ... etc
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  // ... etc
}
```

### Component Styling

Components use Tailwind classes:

```jsx
<div className="p-6 bg-card rounded-lg border">
  <h2 className="text-2xl font-bold">Title</h2>
</div>
```

### Responsive Design

Tailwind breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Data Flow

### Retrieval Flow

```
User enters query
    ↓
RetrievalPage calls apiEndpoints.search()
    ↓
API returns hits
    ↓
Hits displayed in table
    ↓
User clicks "Add to Active"
    ↓
addToActive() updates context
    ↓
Active panel re-renders
```

### Bankset Flow

```
User opens bankset selector
    ↓
Displays availableBanks from context
    ↓
User toggles banks
    ↓
User clicks "Apply"
    ↓
updateBankset() updates context + localStorage
    ↓
All subsequent API requests include new bankset
```

### Generation Flow

```
User configures generation
    ↓
GeneratePage calls apiEndpoints.generate()
    ↓
API processes request
    ↓
Response includes beats, final, trace
    ↓
Results displayed in cards
    ↓
User can copy or download
```

## Design Patterns

### 1. Container/Presenter Pattern

**Container** (Page components):
- Fetch data
- Manage state
- Handle business logic

**Presenter** (UI components):
- Render UI
- Receive props
- Emit events

### 2. Composition Pattern

Complex UIs built from simple components:

```jsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

### 3. Custom Hooks Pattern

Reusable logic extracted to hooks:

```javascript
// Example custom hook
function useSchemas() {
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchSchemas();
  }, []);
  
  return { schemas, loading };
}
```

### 4. Provider Pattern

Global state via Context:

```jsx
<AppProvider>
  <App />
</AppProvider>
```

### 5. Render Props Pattern

Used in shadcn/ui components:

```jsx
<Popover>
  <PopoverTrigger asChild>
    <Button>Open</Button>
  </PopoverTrigger>
  <PopoverContent>
    Content
  </PopoverContent>
</Popover>
```

## Performance Considerations

### 1. Code Splitting

React Router automatically code-splits routes.

### 2. Lazy Loading

Can be added for heavy components:

```javascript
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### 3. Memoization

Use `useMemo` and `useCallback` for expensive operations:

```javascript
const filteredData = useMemo(
  () => data.filter(item => item.active),
  [data]
);
```

### 4. Virtualization

For large lists, consider react-window or react-virtual.

## Security Considerations

### 1. XSS Prevention

- React escapes content by default
- Use `dangerouslySetInnerHTML` sparingly

### 2. API Security

- No API keys in frontend code
- CORS configured on backend
- HTTPS in production

### 3. Input Validation

- Validate user input before API calls
- Sanitize JSON input

## Testing Strategy

### Unit Tests

Test individual components:

```javascript
import { render, screen } from '@testing-library/react';
import TopBar from './TopBar';

test('renders bankset selector', () => {
  render(<TopBar />);
  expect(screen.getByText(/Bankset/i)).toBeInTheDocument();
});
```

### Integration Tests

Test component interactions:

```javascript
test('adds item to active selections', async () => {
  // Test user flow
});
```

### E2E Tests

Use Playwright or Cypress for full user flows.

## Future Enhancements

### 1. TypeScript Migration

Convert from JavaScript to TypeScript for better type safety.

### 2. Advanced Visualizations

- Expectation curve charts with Recharts
- Attention heatmaps
- Schema compatibility matrices

### 3. Real-time Updates

- WebSocket integration for live updates
- Real-time collaboration features

### 4. Offline Support

- Service workers for offline functionality
- IndexedDB for local caching

### 5. Advanced Features

- Saved sessions and compositions
- Export/import functionality
- User preferences
- Keyboard shortcuts

## Maintenance Guidelines

### Code Style

- Use functional components with hooks
- Prefer arrow functions
- Use destructuring for props
- Keep components small and focused

### File Naming

- Components: PascalCase (e.g., `TopBar.jsx`)
- Utilities: camelCase (e.g., `api.js`)
- Pages: PascalCase with "Page" suffix (e.g., `BiblePage.jsx`)

### Component Structure

```jsx
import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';

const MyComponent = () => {
  // Hooks
  const { state } = useApp();
  const [localState, setLocalState] = useState();
  
  // Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // Handlers
  const handleClick = () => {
    // Handle event
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default MyComponent;
```

### Git Workflow

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Commit with descriptive message
5. Create pull request
6. Code review
7. Merge to main

## Conclusion

The SV Composer UI is built with modern React best practices, focusing on maintainability, performance, and user experience. The architecture is designed to be scalable and extensible, allowing for future enhancements while maintaining code quality.

For questions or contributions, please refer to the main README.md or contact the development team.

---

**Document Version**: 1.0.0
**Last Updated**: October 2025
