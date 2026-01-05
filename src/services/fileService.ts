import { readDir, size, remove } from "@tauri-apps/plugin-fs";
import { open } from "@tauri-apps/plugin-dialog";
import { join, basename } from "@tauri-apps/api/path";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { FileSystemItem } from "@/lib/utils";

export interface ScanProgress {
  current: number;
  total: number;
}

export class FileService {
  static async selectDirectory(): Promise<string | null> {
    const selected = await open({
      directory: true,
      multiple: false,
    });

    return typeof selected === "string" ? selected : null;
  }

  static async revealInFinder(path: string): Promise<void> {
    await revealItemInDir(path);
  }

  static async deleteFiles(paths: string[]): Promise<void> {
    for (const path of paths) {
      await remove(path, { recursive: true });
    }
  }

  static async getSecureFolderName(path: string): Promise<string> {
    try {
      return await basename(path);
    } catch {
      return 'node_modules'; // fallback
    }
  }

  static async scanDirectory(
    dirPath: string,
    abortController: AbortController
  ): Promise<FileSystemItem[]> {
    if (abortController.signal.aborted) return [];

    try {
      const entries = await readDir(dirPath);
      const items: FileSystemItem[] = [];

      for (const entry of entries) {
        if (abortController.signal.aborted) break;

        // Skip hidden dotfiles
        if (entry.name?.startsWith(".")) continue;

        try {
          const fullPath = await join(dirPath, entry.name);
          const itemSize = await size(fullPath);

          items.push({
            name: entry.name,
            path: fullPath,
            size: itemSize,
            isDirectory: entry.isDirectory,
          });
        } catch (err) {
          console.error(`Error reading ${entry.name}:`, err);
        }
      }

      return items;
    } catch (err) {
      console.error(`Error scanning directory ${dirPath}:`, err);
      return [];
    }
  }

  static async scanForNodeModules(
    dirPath: string,
    abortController: AbortController,
    onProgress?: (item: FileSystemItem) => void,
    depth = 0
  ): Promise<FileSystemItem[]> {
    // Safety limits: abort if too deep or scan was cancelled
    if (abortController.signal.aborted || depth > 20) return [];

    const nodeModulesItems: FileSystemItem[] = [];

    try {
      const entries = await readDir(dirPath);

      for (const entry of entries) {
        if (abortController.signal.aborted) break;

        if (entry.name?.startsWith(".")) continue;

        const fullPath = await join(dirPath, entry.name);

        if (entry.isDirectory) {
          if (entry.name === "node_modules") {
            try {
              const moduleSize = await size(fullPath);
              const newItem = {
                name: entry.name,
                path: fullPath,
                size: moduleSize,
                isDirectory: true,
              };

              nodeModulesItems.push(newItem);
              onProgress?.(newItem);
            } catch (err) {
              console.error(`Error reading node_modules at ${fullPath}:`, err);
            }
          } else {
            const subItems = await this.scanForNodeModules(
              fullPath,
              abortController,
              onProgress,
              depth + 1
            );
            nodeModulesItems.push(...subItems);
          }
        }
      }
    } catch (err) {
      console.error(`Error scanning directory ${dirPath}:`, err);
    }

    return nodeModulesItems;
  }
}