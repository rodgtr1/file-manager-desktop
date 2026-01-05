# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Tauri v2 desktop application that manages disk space by analyzing folder sizes and cleaning up node_modules directories. It combines a Rust backend (using Tauri) with a React + TypeScript frontend built with Vite. The app has two main modes: folder size analysis and node_modules cleanup with bulk deletion capabilities.

## Architecture

### Frontend (React + TypeScript)
- **UI Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4 (using the Vite plugin) + shadcn/ui components
- **Build Tool**: Vite (configured to run on port 1420)
- **Architecture**: Modular hook-based architecture with service layer

#### Code Organization:
- **Main App**: `src/App.tsx` - clean component using custom hooks
- **Custom Hooks**:
  - `src/hooks/useFileScanner.ts` - folder scanning logic and state
  - `src/hooks/useNodeModulesManager.ts` - deletion and selection management
  - `src/hooks/useAppSettings.ts` - UI settings (zoom controls)
- **Service Layer**: `src/services/fileService.ts` - all Tauri file operations
- **UI Components**: `src/components/` - reusable components (ScanModeToggle, FileList, etc.)
- **Utilities**: `src/lib/utils.ts` - contains `FileSystemItem` interface and formatting helpers

### Backend (Rust + Tauri)
- **Framework**: Tauri v2
- **Entry Point**: `src-tauri/src/lib.rs` - initializes plugins and command handlers
- **Plugins Used**:
  - `tauri-plugin-dialog` - for folder selection dialogs
  - `tauri-plugin-fs` - for file system access (reading directories, getting file sizes, recursive deletion)
  - `tauri-plugin-opener` - for revealing items in system file manager
- **Configuration**: `src-tauri/tauri.conf.json`

### Key Integration Points
- Frontend uses `@tauri-apps/api` and plugin packages to invoke Rust functionality
- File system operations happen on the Rust side for security and performance
- Progressive UI updates as files are scanned (items update in real-time)
- Custom hooks manage complex state and business logic
- Service layer abstracts all Tauri API calls for better testability

### Features
- **Folder Size Analysis**: Scan any directory to view files/folders sorted by size
- **Node Modules Cleanup**: Recursively find and delete node_modules folders
- **Bulk Operations**: Multi-select with "Select All" functionality
- **Real-time Progress**: Live updates during scanning and deletion
- **Safety Features**: Confirmation dialogs and detailed progress feedback
- **Performance**: Batched updates and recursion limits prevent UI freezing

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

## Working with the Modular Architecture

### Adding New Features
1. **Business Logic**: Create or extend custom hooks in `src/hooks/`
2. **UI Components**: Add reusable components in `src/components/`
3. **File Operations**: Extend `src/services/fileService.ts`
4. **Integration**: Update `src/App.tsx` to use new hooks/components

### Custom Hooks Pattern
Each hook follows this pattern:
- State management with `useState`
- Callback functions with `useCallback` for performance
- Cleanup with `useEffect` when needed
- Clear return object separating state and actions

### Testing Strategy
- **Hooks**: Test with `@testing-library/react-hooks`
- **Components**: Test with `@testing-library/react`
- **Services**: Mock Tauri APIs for unit tests
- **Integration**: Test full user flows

### Performance Considerations
- Batched UI updates (every 5 items) prevent render thrashing
- `useCallback` on all event handlers to prevent re-renders
- Abort controllers for cancelling long-running operations
- Recursion depth limits (20 levels) prevent stack overflow

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
