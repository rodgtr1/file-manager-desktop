import { useState, useRef } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { readDir, size } from "@tauri-apps/plugin-fs";
import { revealItemInDir } from "@tauri-apps/plugin-opener";
import { join } from "@tauri-apps/api/path";
import { Button } from "@/components/ui/button";
import { Upload, Folder, File, Loader2 } from "lucide-react";
import { FileSystemItem, formatFileSize } from "@/lib/utils";

function App() {
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scannedCount, setScannedCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sortItems = (itemsToSort: FileSystemItem[]) => {
    return [...itemsToSort].sort((a, b) => {
      // First, sort by type (directories first)
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      // Then sort by size (largest first)
      return b.size - a.size;
    });
  };

  const scanFolder = async () => {
    try {
      setError(null);
      
      // Abort any existing scan
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      const selected = await open({
        directory: true,
        multiple: false,
      });

      if (!selected || typeof selected !== "string") {
        return;
      }

      setSelectedFolder(selected);
      setIsLoading(true);
      setItems([]);
      setScannedCount(0);
      
      // Create new abort controller for this scan
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const entries = await readDir(selected);
      const newItems: FileSystemItem[] = [];
      
      // Batch size for progressive updates
      const BATCH_SIZE = 50;
      let processedCount = 0;
      let failedCount = 0;

      for (const entry of entries) {
        // Check if scan was aborted
        if (abortController.signal.aborted) {
          return;
        }
        
        // Skip hidden dotfiles (e.g., .DS_Store) to avoid denied scope errors
        if (entry.name?.startsWith(".")) {
          continue;
        }
        
        try {
          // Secure path construction using Tauri path API
          const fullPath = await join(selected, entry.name);
          const itemSize = await size(fullPath);

          newItems.push({
            name: entry.name,
            path: fullPath,
            size: itemSize,
            isDirectory: entry.isDirectory,
          });
          
          processedCount++;
          setScannedCount(processedCount);

          // Update UI in batches to reduce re-renders
          if (processedCount % BATCH_SIZE === 0 || processedCount === entries.length) {
            setItems(sortItems([...newItems]));
          }
        } catch (err) {
          failedCount++;
          console.error(`Error reading ${entry.name}:`, err);
        }
      }

      // Ensure final state is set after loop completes
      setItems(sortItems(newItems));
      
      // If we scanned entries but could not read any sizes, surface a helpful error
      if (entries.length > 0 && newItems.length === 0 && failedCount === entries.length) {
        setError(
          "Couldn't read item metadata. Check permissions or path construction. If this persists, ensure the app can access your Desktop paths."
        );
      }

      setIsLoading(false);
      abortControllerRef.current = null;
    } catch (err) {
      setError(`Failed to scan folder: ${err}`);
      setIsLoading(false);
      abortControllerRef.current = null;
      console.error(err);
    }
  };

  const handleReveal = async (path: string) => {
    try {
      await revealItemInDir(path);
    } catch (err) {
      setError(`Failed to reveal item: ${err}`);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Folder Size Analyzer</h1>
          <p className="text-muted-foreground">
            Select a folder to view all files and folders sorted by size
          </p>
        </div>

        <div className="flex justify-center">
          <Button onClick={scanFolder} size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Scanning... ({scannedCount} items)
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Select Folder
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg border border-destructive">
            {error}
          </div>
        )}

        {selectedFolder && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Selected:</span> {selectedFolder}
          </div>
        )}

        {items.length > 0 && (
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-4 border-b bg-muted/50">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">
                  {items.length} items found
                </h2>
                <p className="text-sm text-muted-foreground">
                  Double-click to reveal in Finder
                </p>
              </div>
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {items.map((item, index) => (
                <div
                  key={`${item.path}-${index}`}
                  className="flex items-center justify-between p-4 hover:bg-accent cursor-pointer transition-colors"
                  onDoubleClick={() => handleReveal(item.path)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item.isDirectory ? (
                      <Folder className="h-5 w-5 text-blue-500 shrink-0" />
                    ) : (
                      <File className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                    <span className="font-medium truncate">{item.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground ml-4 shrink-0">
                    {formatFileSize(item.size)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && !error && items.length === 0 && selectedFolder && (
          <div className="text-center text-muted-foreground py-12">
            No items found in the selected folder
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
