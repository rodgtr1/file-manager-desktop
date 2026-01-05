import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { FileSystemItem, formatFileSize } from "@/lib/utils";
import { DeletionProgress } from "@/hooks/useNodeModulesManager";

interface DeleteControlsProps {
  items: FileSystemItem[];
  selectedItems: Set<string>;
  isDeleting: boolean;
  deletionProgress: DeletionProgress;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
}

export function DeleteControls({
  items,
  selectedItems,
  isDeleting,
  deletionProgress,
  onSelectAll,
  onDeleteSelected
}: DeleteControlsProps) {
  if (items.length === 0) return null;

  const selectedSize = Array.from(selectedItems).reduce((sum, path) => {
    const item = items.find(i => i.path === path);
    return sum + (item?.size || 0);
  }, 0);

  return (
    <div className="flex justify-center gap-2">
      <Button
        onClick={onSelectAll}
        variant="outline"
        size="sm"
        disabled={isDeleting}
      >
        {selectedItems.size === items.length ? 'Deselect All' : 'Select All'}
      </Button>
      <Button
        onClick={onDeleteSelected}
        variant="destructive"
        size="sm"
        disabled={selectedItems.size === 0 || isDeleting}
      >
        {isDeleting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Deleting ({deletionProgress.current}/{deletionProgress.total})...
          </>
        ) : (
          <>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected ({selectedItems.size})
            {selectedItems.size > 0 && (
              <span className="ml-1 text-xs opacity-75">
                ({formatFileSize(selectedSize)})
              </span>
            )}
          </>
        )}
      </Button>
    </div>
  );
}