import { Button } from "@/components/ui/button";
import { FolderSearch, HardDrive } from "lucide-react";
import { ScanMode } from "@/hooks/useFileScanner";

interface ScanModeToggleProps {
  scanMode: ScanMode;
  onScanModeChange: (mode: ScanMode) => void;
}

export function ScanModeToggle({ scanMode, onScanModeChange }: ScanModeToggleProps) {
  return (
    <div className="flex justify-center gap-2 mb-4">
      <Button
        onClick={() => onScanModeChange('folders')}
        variant={scanMode === 'folders' ? 'default' : 'outline'}
        size="sm"
      >
        <FolderSearch className="mr-2 h-4 w-4" />
        Scan Folders
      </Button>
      <Button
        onClick={() => onScanModeChange('node_modules')}
        variant={scanMode === 'node_modules' ? 'default' : 'outline'}
        size="sm"
      >
        <HardDrive className="mr-2 h-4 w-4" />
        Find node_modules
      </Button>
    </div>
  );
}