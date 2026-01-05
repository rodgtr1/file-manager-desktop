import { useState, useRef, useCallback } from 'react';
import { FileSystemItem } from '@/lib/utils';
import { FileService } from '@/services/fileService';

export type ScanMode = 'folders' | 'node_modules';

export function useFileScanner() {
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scannedCount, setScannedCount] = useState(0);
  const [scanMode, setScanMode] = useState<ScanMode>('folders');
  const abortControllerRef = useRef<AbortController | null>(null);

  const sortItems = useCallback((itemsToSort: FileSystemItem[]) => {
    return [...itemsToSort].sort((a, b) => {
      // First, sort by type (directories first)
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      // Then sort by size (largest first)
      return b.size - a.size;
    });
  }, []);

  const scanFolder = useCallback(async () => {
    try {
      setError(null);

      // Abort any existing scan
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const selected = await FileService.selectDirectory();
      if (!selected) return;

      setSelectedFolder(selected);
      setIsLoading(true);
      setItems([]);
      setScannedCount(0);

      // Create new abort controller for this scan
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      if (scanMode === 'node_modules') {
        const nodeModulesItems: FileSystemItem[] = [];

        await FileService.scanForNodeModules(
          selected,
          abortController,
          (newItem) => {
            nodeModulesItems.push(newItem);
            setScannedCount(nodeModulesItems.length);

            // Batch UI updates every 5 items for performance
            if (nodeModulesItems.length % 5 === 0 || nodeModulesItems.length === 1) {
              setItems(sortItems([...nodeModulesItems]));
            }
          }
        );

        if (abortController.signal.aborted) return;

        setItems(sortItems(nodeModulesItems));

        if (nodeModulesItems.length === 0) {
          setError("No node_modules folders found in the selected directory or its subdirectories.");
        }
      } else {
        const allItems = await FileService.scanDirectory(selected, abortController);

        if (abortController.signal.aborted) return;

        // Simulate progressive updates for consistency
        const BATCH_SIZE = 50;
        for (let i = 0; i < allItems.length; i += BATCH_SIZE) {
          if (abortController.signal.aborted) break;

          const batch = allItems.slice(0, i + BATCH_SIZE);
          setItems(sortItems(batch));
          setScannedCount(batch.length);

          // Small delay to show progress
          if (i + BATCH_SIZE < allItems.length) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }

        if (allItems.length === 0) {
          setError("Couldn't read item metadata. Check permissions or path construction.");
        }
      }

      setIsLoading(false);
      abortControllerRef.current = null;
    } catch (err) {
      setError(`Failed to scan folder: ${err}`);
      setIsLoading(false);
      abortControllerRef.current = null;
      console.error(err);
    }
  }, [scanMode, sortItems]);

  const handleReveal = useCallback(async (path: string) => {
    try {
      await FileService.revealInFinder(path);
    } catch (err) {
      setError(`Failed to reveal item: ${err}`);
      console.error(err);
    }
  }, []);

  return {
    // State
    items,
    isLoading,
    selectedFolder,
    error,
    scannedCount,
    scanMode,

    // Actions
    setScanMode,
    scanFolder,
    handleReveal,
    setError,
    setItems,
  };
}