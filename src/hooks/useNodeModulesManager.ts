import { useState, useRef, useEffect, useCallback } from 'react';
import { FileSystemItem } from '@/lib/utils';
import { FileService } from '@/services/fileService';

export interface DeletionProgress {
  current: number;
  total: number;
}

export function useNodeModulesManager() {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentlyDeleting, setCurrentlyDeleting] = useState<string>('');
  const [deletionProgress, setDeletionProgress] = useState<DeletionProgress>({ current: 0, total: 0 });
  const [successMessage, setSuccessMessage] = useState<string>('');
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup effect for timer
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const handleItemSelect = useCallback((path: string, isSelected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(path);
      } else {
        newSet.delete(path);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback((items: FileSystemItem[]) => {
    setSelectedItems(prev => {
      if (prev.size === items.length) {
        return new Set();
      } else {
        return new Set(items.map(item => item.path));
      }
    });
  }, []);

  const handleDelete = useCallback(async (
    paths: string[],
    items: FileSystemItem[],
    onItemsUpdate: (updater: (prev: FileSystemItem[]) => FileSystemItem[]) => void,
    onError: (error: string) => void
  ) => {
    try {
      setIsDeleting(true);
      setSuccessMessage('');
      setDeletionProgress({ current: 0, total: paths.length });

      // Pre-calculate file sizes to avoid race conditions with stale state
      const itemSizes = new Map(paths.map(path => {
        const item = items.find(i => i.path === path);
        return [path, item?.size || 0];
      }));

      let deletedCount = 0;
      const failedPaths: string[] = [];

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const folderName = await FileService.getSecureFolderName(path);

        setCurrentlyDeleting(`Deleting ${folderName}...`);
        setDeletionProgress({ current: i + 1, total: paths.length });

        try {
          await FileService.deleteFiles([path]);
          deletedCount++;

          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
          console.error(`Failed to delete ${path}:`, err);
          failedPaths.push(path);
        }
      }

      // Remove successfully deleted items from the list
      const successfullyDeleted = paths.filter(path => !failedPaths.includes(path));
      onItemsUpdate(prev => prev.filter(item => !successfullyDeleted.includes(item.path)));
      setSelectedItems(new Set());

      // Set success message using pre-calculated sizes
      if (deletedCount > 0) {
        const totalSizeMB = successfullyDeleted.reduce((sum, path) =>
          sum + (itemSizes.get(path) || 0), 0) / (1024 * 1024);

        setSuccessMessage(`✅ Successfully deleted ${deletedCount} folder(s), freeing up ${totalSizeMB.toFixed(1)} MB of space!`);

        // Clear existing timeout and set new one with proper cleanup
        if (successTimeoutRef.current) {
          clearTimeout(successTimeoutRef.current);
        }
        successTimeoutRef.current = setTimeout(() => setSuccessMessage(''), 5000);
      }

      if (failedPaths.length > 0) {
        onError(`Failed to delete ${failedPaths.length} folder(s). Check console for details.`);
      }

      setIsDeleting(false);
      setCurrentlyDeleting('');
      setDeletionProgress({ current: 0, total: 0 });
    } catch (err) {
      onError(`Failed to delete items: ${err}`);
      setIsDeleting(false);
      setCurrentlyDeleting('');
      setDeletionProgress({ current: 0, total: 0 });
      console.error(err);
    }
  }, []);

  const handleDeleteSelected = useCallback((
    items: FileSystemItem[],
    onItemsUpdate: (updater: (prev: FileSystemItem[]) => FileSystemItem[]) => void,
    onError: (error: string) => void
  ) => {
    if (selectedItems.size === 0) return;

    const pathsToDelete = Array.from(selectedItems);
    if (confirm(`Are you sure you want to delete ${pathsToDelete.length} node_modules folder(s)? This cannot be undone.`)) {
      handleDelete(pathsToDelete, items, onItemsUpdate, onError);
    }
  }, [selectedItems, handleDelete]);

  const handleDeleteSingle = useCallback((
    path: string,
    items: FileSystemItem[],
    onItemsUpdate: (updater: (prev: FileSystemItem[]) => FileSystemItem[]) => void,
    onError: (error: string) => void
  ) => {
    if (confirm(`Are you sure you want to delete this node_modules folder? This cannot be undone.`)) {
      handleDelete([path], items, onItemsUpdate, onError);
    }
  }, [handleDelete]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  return {
    // State
    selectedItems,
    isDeleting,
    currentlyDeleting,
    deletionProgress,
    successMessage,

    // Actions
    handleItemSelect,
    handleSelectAll,
    handleDeleteSelected,
    handleDeleteSingle,
    clearSelection,
  };
}