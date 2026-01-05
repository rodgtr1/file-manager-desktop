import { Button } from "@/components/ui/button";
import { Folder, File, Trash2 } from "lucide-react";
import { FileSystemItem, formatFileSize } from "@/lib/utils";
import { ScanMode } from "@/hooks/useFileScanner";

interface FileListProps {
  items: FileSystemItem[];
  scanMode: ScanMode;
  selectedItems?: Set<string>;
  isDeleting?: boolean;
  onItemSelect?: (path: string, isSelected: boolean) => void;
  onItemReveal: (path: string) => void;
  onItemDelete?: (path: string) => void;
}

export function FileList({
  items,
  scanMode,
  selectedItems,
  isDeleting,
  onItemSelect,
  onItemReveal,
  onItemDelete
}: FileListProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="p-4 border-b bg-muted/50">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {items.length} {scanMode === 'node_modules' ? 'node_modules folders' : 'items'} found
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
            className="flex items-center justify-between p-4 hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {scanMode === 'node_modules' && onItemSelect && selectedItems && (
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.path)}
                  onChange={(e) => onItemSelect(item.path, e.target.checked)}
                  className="h-4 w-4"
                  disabled={isDeleting}
                />
              )}
              {item.isDirectory ? (
                <Folder className="h-5 w-5 text-blue-500 shrink-0" />
              ) : (
                <File className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
              <span
                className="font-medium truncate cursor-pointer"
                onDoubleClick={() => onItemReveal(item.path)}
              >
                {scanMode === 'node_modules' ? item.path : item.name}
              </span>
            </div>
            <div className="flex items-center gap-2 ml-4 shrink-0">
              <div className="text-sm text-muted-foreground">
                {formatFileSize(item.size)}
              </div>
              {scanMode === 'node_modules' && onItemDelete && (
                <Button
                  onClick={() => onItemDelete(item.path)}
                  variant="outline"
                  size="sm"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}