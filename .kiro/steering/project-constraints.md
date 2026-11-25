# Project Constraints — Expense & Budget Visualizer

## Project Overview

A mobile-friendly web app for tracking daily spending. Users can log expenses, set budgets, and visualize their spending — all in the browser with no server required.

---

## Technical Constraints

**TC-1: Vanilla stack only.**
Use HTML for structure, CSS for styling, and plain JavaScript for behavior. No frameworks (React, Vue, Angular, etc.), no build tools, no transpilers.

**TC-2: Client-side storage only.**
All data is persisted using the browser's `localStorage` API. There is no backend, no database, and no network requests for data.

**TC-3: Cross-browser compatibility.**
The app must work correctly in modern versions of Chrome, Firefox, Edge, and Safari.

---

## Non-Functional Requirements

- **Simple** — clean, minimal interface. No complex setup, no test framework, no tooling configuration.
- **Fast** — fast initial load, no perceptible lag when adding or updating expense data.
- **Visual** — user-friendly appearance with clear visual hierarchy and readable typography.

---

## Folder & File Rules

```
project-root/
├── index.html          # single HTML entry point
├── css/
│   └── style.css       # exactly one CSS file — do not add others
└── js/
    └── script.js       # exactly one JS file — do not add others
```

- There must be **exactly one CSS file**: `css/style.css`.
- There must be **exactly one JavaScript file**: `js/script.js`.
- Do not create additional stylesheets, script files, or subdirectories unless explicitly instructed.
- Keep all code clean, readable, and well-commented.
