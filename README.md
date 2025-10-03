# SV Composer UI

A comprehensive web interface for the **SV Composer** poetic composition platform. This application provides a modern, interactive frontend for browsing Bible banks, performing RAG retrieval, composing poetry, generating content, blending semantic concepts, and evaluating compositions.

## Overview

SV Composer UI is a React-based single-page application that interfaces with the SV Composer FastAPI backend. It implements the complete UI/UX concept specified in the design document, featuring:

- **Bible Browser**: Explore and validate schemas, metaphors, frames, and blend rules
- **Retrieval Sandbox**: Query the knowledge base and manage active selections
- **Composition Tools**: Plan and compose poetic pieces beat by beat
- **Generation Orchestrator**: End-to-end generation with LLM integration
- **Blending Engine**: Test semantic blending with mental spaces
- **Evaluation Suite**: Evaluate compositions and check frame conformance
- **Control Panel**: Visualize expectation curves and analyze attention
- **Gold Corpus**: View gold-standard evaluation metrics
- **Film Planner**: Generate film production plans from prompts
- **Banks Management**: Inspect and manage available banks
- **System Status**: Monitor runtime information and health

## Features

### Global Layout

- **Top Bar**: 
  - Bankset selector (multi-select dropdown with persistence)
  - Harness state indicator (OpenAI/Echo)
  - Health status badge
  
- **Left Navigation**: 
  - Fixed sidebar with all major sections
  - Active route highlighting
  - Icon-based navigation

### Bankset Management

The application supports **multi-bank selection** for schemas, metaphors, frames, and gold labels:

- Select one or more banks from the top bar dropdown
- Selection persists across sessions (localStorage)
- All API requests include the `X-SV-Banks` header
- Banks can also be specified via `?banks=` query parameter

### Bible Section

#### Schemas Browser
- List and search all schemas
- Toggle validation mode
- Switch between current and normalized sources
- View detailed schema information including:
  - English and Farsi lexemes
  - Allowed/disallowed schemas
  - Compatibility matrix
  - Lexicon mappings

#### Metaphors Browser
- Browse and search metaphors
- View source and target domains
- Validation support

#### Frames Browser
- Explore available frames
- View beats and structure

#### Blend Rules Viewer
- View vital relations and operators
- Inspect raw blend rules JSON

### Retrieval Section

- **Query Interface**: Search the knowledge base with customizable parameters
- **Kind Filters**: Filter by schema, metaphor, frame, or exemplar
- **Results Table**: View ranked results with scores and tags
- **Active Selections Panel**: 
  - Add promising results to active selections
  - Manage schemas, metaphors, frames, and gates
  - Sticky sidebar for easy access

### Compose Section

#### Plan Tab
- Select frame and beats
- Configure query and result count (K)
- Generate composition plan
- View active selections and thresholds

#### Beat Workspace Tab
- Work on individual beats
- View prompts (system, context, compose)
- Draft and refine per-beat content

#### Trace Auditor Tab
- Visualize expectation curves
- Inspect attention and selections
- Export trace data as JSON

### Generate Section

- **Configuration Panel**:
  - Frame ID selection
  - Query input
  - Beat selection (comma-separated)
  - LLM harness selection (Echo/OpenAI/Custom)

- **Results Display**:
  - Final assembled piece
  - Per-beat results (candidate, revision, final)
  - Critique summary
  - Downloadable trace JSON

### Blend Section

- **Input Editor**: JSON editor for active state
- **Explosion Toggle**: Control explosion firing
- **Results Panel**:
  - Blend output visualization
  - Audit log inspection
  - Penalty warnings

### Evaluate Section

- **Single Evaluate**: Evaluate individual pieces with optional trace
- **Batch Evaluate**: Upload and evaluate multiple pieces
- **Frame Check**: Validate active state or trace against frames

### Control Section

- **Expectation Curves**: Plot and visualize expectation over beats
- **Viewpoint**: Infer narrative viewpoint from prompts
- **Attention**: Analyze attention peaks

### Additional Sections

- **Gold**: View gold corpus statistics and SHA-256 digest
- **Film Plan**: Generate film production plans with scene-by-scene prompts
- **Banks**: Inspect available banks from registry
- **Status**: Monitor system health, SDK version, and uptime

## Technology Stack

- **React 19.1.0**: Modern React with hooks
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: High-quality UI components
- **Lucide Icons**: Beautiful icon library
- **Vite**: Fast build tool and dev server

## Project Structure

```
sv-composer-ui/
├── src/
│   ├── assets/              # Static assets
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── TopBar.jsx      # Top navigation bar
│   │   └── LeftNav.jsx     # Left sidebar navigation
│   ├── contexts/           # React contexts
│   │   └── AppContext.jsx  # Global state management
│   ├── lib/                # Utilities
│   │   └── api.js          # API client and endpoints
│   ├── pages/              # Page components
│   │   ├── bible/          # Bible section components
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
│   ├── App.jsx             # Main application component
│   ├── App.css             # Application styles
│   └── main.jsx            # Entry point
├── public/                 # Public assets
├── index.html             # HTML template
├── package.json           # Dependencies
└── vite.config.js         # Vite configuration
```

## Installation

### Prerequisites

- Node.js 22.13.0 or higher
- pnpm package manager

### Setup

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd sv-composer-ui
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure API endpoint** (optional):
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```
   
   If not specified, the default is `http://localhost:8000`.

## Development

### Start Development Server

```bash
pnpm run dev
```

The application will be available at `http://localhost:5173`.

### Build for Production

```bash
pnpm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
pnpm run preview
```

## API Integration

The application communicates with the SV Composer FastAPI backend through the following endpoints:

### Health & Status
- `GET /health` - Health check
- `GET /status` - System status and runtime info

### Banks
- `GET /banks` - List available banks

### Bible
- `GET /bible/schemas` - List schemas
- `GET /bible/schemas/compat` - Schema compatibility
- `GET /bible/schemas/lexicon` - Schema lexicon
- `GET /bible/metaphors` - List metaphors
- `GET /bible/frames` - List frames
- `GET /bible/blend_rules` - Blend rules

### Retrieval
- `POST /retrieval/search` - Search knowledge base

### Compose
- `POST /compose/plan` - Generate composition plan
- `POST /compose/beat` - Compose single beat
- `POST /compose` - Full composition

### Generate
- `POST /generate` - End-to-end generation

### Blend
- `POST /blend` - Semantic blending

### Evaluate
- `POST /evaluate` - Single evaluation
- `POST /evaluate/batch` - Batch evaluation
- `POST /eval/framecheck` - Frame conformance check

### Control
- `POST /control/expectation` - Expectation curves
- `POST /control/viewpoint` - Viewpoint inference
- `POST /control/attention` - Attention analysis

### Gold
- `GET /gold/stats` - Gold corpus statistics

### P12 Film Plan
- `POST /p12/filmplan` - Generate film plan

## Configuration

### Bankset Selection

Banks are selected via the top bar dropdown and stored in localStorage. The selected bankset is automatically included in all API requests via the `X-SV-Banks` header.

Example:
```javascript
// Stored in localStorage as:
localStorage.setItem('sv-bankset', JSON.stringify(['default', 'noir']));

// Sent in API requests as:
headers: {
  'X-SV-Banks': 'default,noir'
}
```

### API Client

The API client (`src/lib/api.js`) includes:
- Automatic bankset header injection
- Base URL configuration
- Error handling
- Request/response interceptors

## State Management

The application uses React Context (`AppContext`) for global state:

- **Bankset**: Currently selected banks
- **Available Banks**: List of banks from registry
- **Harness**: LLM harness state (echo/openai)
- **Health**: System health status
- **Active Selections**: Selected schemas, metaphors, frames, gates

## Design System

### Colors

- **Primary**: Neutral blues for UI elements
- **Accent**: Teal for bankset-related highlights
- **Warning**: Amber for warnings
- **Error**: Red for errors
- **Dark Mode**: Full support with automatic theme switching

### Typography

- **UI Text**: Inter/Roboto
- **Code Blocks**: Monospace (Menlo/Consolas)

### Components

All UI components are built with shadcn/ui and Tailwind CSS, featuring:
- Hover states and transitions
- Keyboard accessibility
- WCAG AA contrast compliance
- Responsive design

## Deployment

### Using Manus Deploy

```bash
# From the project root
manus-deploy frontend
```

### Manual Deployment

1. Build the application:
   ```bash
   pnpm run build
   ```

2. Serve the `dist/` directory using any static file server:
   ```bash
   # Example with Python
   cd dist && python -m http.server 8080
   
   # Example with Node.js serve
   npx serve dist
   ```

## Backend Setup

The UI requires the SV Composer FastAPI backend to be running. To start the backend:

```bash
cd /path/to/sv-composer
poetry install
poetry run uvicorn sv_api.main:app --reload
```

Or without Poetry:

```bash
cd /path/to/sv-composer
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn sv_api.main:app --reload --env-file sv-composer/.env
```

The backend will be available at `http://localhost:8000`.

## Features Roadmap

### Completed ✅
- Global layout with top bar and left navigation
- Bankset selector with multi-select and persistence
- Bible section with all four browsers
- Retrieval sandbox with active selections
- Compose plan interface
- Generate orchestrator
- Blend runner
- Gold stats viewer
- Banks registry viewer
- Status dashboard

### In Progress 🚧
- Beat workspace with per-beat composition
- Trace auditor with visualization
- Evaluation interfaces (single, batch, framecheck)
- Control tools (expectation curves, viewpoint, attention)
- Film plan interface with LLM enrichment

### Planned 📋
- Real-time trace visualization with charts
- Advanced schema compatibility matrix
- Lexicon mapping visualization
- Batch operations for retrieval
- Export/import functionality for compositions
- User preferences and saved sessions

## Troubleshooting

### API Connection Issues

If the UI cannot connect to the backend:

1. Ensure the backend is running on `http://localhost:8000`
2. Check the `VITE_API_BASE_URL` environment variable
3. Verify CORS is enabled in the backend (set `SV_API_ENABLE_CORS=1`)

### Build Errors

If you encounter build errors:

1. Clear node_modules and reinstall:
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

2. Clear Vite cache:
   ```bash
   rm -rf .vite
   ```

### Bankset Not Persisting

If bankset selection doesn't persist:

1. Check browser localStorage is enabled
2. Clear localStorage and try again:
   ```javascript
   localStorage.clear()
   ```

## Contributing

When adding new features:

1. Follow the existing component structure
2. Use shadcn/ui components where possible
3. Maintain TypeScript-style JSDoc comments
4. Ensure responsive design
5. Test with both light and dark themes
6. Update this README with new features

## License

This project is part of the SV Composer platform. See the main repository for license information.

## Support

For issues, questions, or contributions, please refer to the main SV Composer repository.

---

**Built with ❤️ for poetic AI composition**
