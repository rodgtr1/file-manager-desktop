# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Tauri v2 desktop application that analyzes folder sizes. It combines a Rust backend (using Tauri) with a React + TypeScript frontend built with Vite. The app allows users to select folders and view all files/folders sorted by size.

## Architecture

### Frontend (React + TypeScript)
- **UI Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4 (using the Vite plugin) + shadcn/ui components
- **Build Tool**: Vite (configured to run on port 1420)
- **Main Application**: `src/App.tsx` - handles folder selection, file scanning, and display
- **Utilities**: `src/lib/utils.ts` - contains `FileSystemItem` interface and formatting helpers

### Backend (Rust + Tauri)
- **Framework**: Tauri v2
- **Entry Point**: `src-tauri/src/lib.rs` - initializes plugins and command handlers
- **Plugins Used**:
  - `tauri-plugin-dialog` - for folder selection dialogs
  - `tauri-plugin-fs` - for file system access (reading directories, getting file sizes)
  - `tauri-plugin-opener` - for revealing items in system file manager
- **Configuration**: `src-tauri/tauri.conf.json`

### Key Integration Points
- Frontend uses `@tauri-apps/api` and plugin packages to invoke Rust functionality
- File system operations happen on the Rust side for security and performance
- Progressive UI updates as files are scanned (items update in real-time)

## Development Commands

### Start Development Server
```bash
npm run tauri dev
```
This starts both the Vite dev server (frontend on port 1420) and the Tauri app.

### Frontend Only Development
```bash
npm run dev
```
Starts just the Vite dev server without Tauri (limited functionality).

### Build Application
```bash
npm run tauri build
```
Creates production bundles for the target platform. Frontend is built first, then Tauri bundles it with the Rust binary.

### TypeScript Type Checking
```bash
npx tsc --noEmit
```
The project uses TypeScript with `tsc` for type checking.

### Build Frontend Only
```bash
npm run build
```
Compiles TypeScript and builds the frontend (outputs to `dist/`).

## Working with Tauri

### Adding New Rust Commands
1. Define the command in `src-tauri/src/lib.rs` with `#[tauri::command]`
2. Add it to the `invoke_handler` in the `run()` function
3. Import and use from frontend via `import { invoke } from '@tauri-apps/api/core'`

### Adding New Tauri Plugins
1. Add to `src-tauri/Cargo.toml` dependencies
2. Install frontend package: `npm install @tauri-apps/plugin-<name>`
3. Initialize in `src-tauri/src/lib.rs` using `.plugin(tauri_plugin_<name>::init())`

### Tauri Permissions
Permissions are managed in `src-tauri/capabilities/`. The current app uses dialog, fs, and opener plugins which require appropriate permissions.

## Component Management

### shadcn/ui Components
This project uses shadcn/ui for UI components. Components are installed in `src/components/ui/`.

To add new components:
```bash
npx shadcn@latest add <component-name>
```

Configuration is in `components.json`.

## Path Aliasing

The project uses `@/` as an alias for the `src/` directory. This is configured in:
- `vite.config.ts` (for Vite)
- `tsconfig.json` (for TypeScript)

Example: `import { Button } from "@/components/ui/button"`

## Port Configuration

- **Vite Dev Server**: Port 1420 (strictPort: true - will fail if unavailable)
- **HMR**: Port 1421 (when using custom host)

These are configured in `vite.config.ts` and `src-tauri/tauri.conf.json`.
