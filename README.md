# File Manager Desktop

A powerful desktop application built with Tauri, React, and TypeScript that helps you manage disk space by analyzing folder sizes and cleaning up node_modules directories.

## Features

### 📁 **Folder Size Analyzer**
- Scan any directory to view all files and folders sorted by size
- Real-time progress updates during scanning
- Zoom controls for better accessibility
- Double-click to reveal items in Finder/Explorer

### 🧹 **Node Modules Cleaner**
- Recursively finds all `node_modules` folders in your projects
- Displays folder sizes sorted from largest to smallest
- **Bulk deletion** with multi-select checkboxes
- **Individual deletion** with dedicated delete buttons
- **Real-time progress** during deletion with folder names
- **Success feedback** showing total space freed
- **Safety confirmations** before any deletion

## Usage

### Folder Analysis Mode
1. Click **"Scan Folders"** button
2. Select any directory
3. View all contents sorted by size
4. Double-click any item to reveal in system file manager

### Node Modules Cleanup Mode
1. Click **"Find node_modules"** button
2. Select your code projects root directory
3. Watch as the app recursively finds all node_modules folders
4. **Select individual folders** or use **"Select All"**
5. Click **"Delete Selected"** to free up space
6. Confirm deletion and watch real-time progress
7. See success message with total space freed!

## Development

### Prerequisites
- [Node.js](https://nodejs.org/)
- [Rust](https://rustup.rs/)

### Setup
```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri:build
```

### IDE Setup
- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Security & Performance

- ✅ **Secure file operations** using Tauri's permission system
- ✅ **Path traversal protection** with Tauri's secure path APIs
- ✅ **Performance optimized** with batched UI updates
- ✅ **Memory leak prevention** with proper cleanup
- ✅ **Recursion depth limits** to prevent stack overflow
- ✅ **Abort controllers** for cancellable operations

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Tauri (Rust)
- **UI Components**: shadcn/ui + Lucide React
- **Build Tool**: Vite
