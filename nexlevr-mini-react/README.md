# MiniReact

A high-performance custom UI library and Virtual DOM renderer built entirely from scratch using native Web APIs and ES modules. No external packages, compilers, or bundlers.

## Features

- **Virtual DOM Representer**: Structured JSON descriptors created via `createElement`.
- **Fiber Reconciler**: Non-blocking scheduling work-loop with `requestIdleCallback` (and timeout fallback).
- **Differential Updates (Diffing)**: Compares the work-in-progress fiber tree with the active DOM tree and issues `PLACEMENT`, `UPDATE`, or `DELETION` mutations.
- **Hook Registry**: State management via `useState` and life-cycle handler `useEffect` scoped per active Fiber node.
- **Dynamic visual debugger**: A built-in live Fiber Tree structural visualizer updating dynamically as interaction occurs.
- **Premium Aesthetics**: Obsidian dark styling featuring high quality typography and smooth CSS layout transitions.

## Project Structure

```
nexlevr-mini-react/
├── index.html                  # Application Entry Document
├── app.js                      # Root Coordinator
├── framework/                  # Framework Engine Core
│   ├── createElement.js        # VDOM elements Normalizer
│   ├── scheduler.js            # Cooperative loop & DOM update coordinator
│   ├── diff.js                 # Reconciler & Child differential analyzer
│   ├── state.js                # State hooks (useState & useEffect)
│   ├── render.js               # Root renderer mounting entry point
│   └── index.js                # Unified Framework interface
├── components/                 # Stateful App Views
│   ├── Navbar.js               # Switch dashboard sections
│   ├── Counter.js              # Increment/decrement/reset counter
│   ├── Todo.js                 # List filter, add, complete planner
│   ├── Weather.js              # Async fetch simulation component
│   └── Visualizer.js           # Structural Fiber Tree debugger
├── styles/
│   └── style.css               # Obsidian Glassmorphic styling rules
├── docs/
│   └── technical-breakdown.md  # Detailed inner framework mechanics
└── package.json                # Local static dev script
```

## Running Locally

Because the framework uses standard **ES Modules**, you must serve it over HTTP (browsers restrict loading local modules via `file://` protocol due to CORS policy).

1. Install dependencies (only dev-dependency `serve` to launch static pages):
   ```bash
   npm install
   ```
   *Alternatively, if you already have a global static server like `http-server` or `live-server` installed, or python, you can use those directly!*

2. Run the development script:
   ```bash
   npm run dev
   ```

3. Open your browser to the URL printed in the terminal.
