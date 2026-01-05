import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useFileScanner } from "@/hooks/useFileScanner";
import { useNodeModulesManager } from "@/hooks/useNodeModulesManager";
import { useAppSettings } from "@/hooks/useAppSettings";
import { ScanModeToggle } from "@/components/ScanModeToggle";
import { ZoomControls } from "@/components/ZoomControls";
import { ProgressIndicators } from "@/components/ProgressIndicators";
import { DeleteControls } from "@/components/DeleteControls";
import { FileList } from "@/components/FileList";

function App() {
  // Custom hooks for state management
  const scanner = useFileScanner();
  const nodeModulesManager = useNodeModulesManager();
  const appSettings = useAppSettings();

  // Clear selection when scan mode changes
  const handleScanModeChange = (mode: typeof scanner.scanMode) => {
    scanner.setScanMode(mode);
    nodeModulesManager.clearSelection();
  };

  return (
    <div
      className="min-h-screen bg-background p-8 transition-all duration-200"
      style={{
        fontSize: `${appSettings.zoomLevel}%`
      }}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-between items-center">
            <ZoomControls
              zoomLevel={appSettings.zoomLevel}
              onZoomIn={appSettings.zoomIn}
              onZoomOut={appSettings.zoomOut}
              onResetZoom={appSettings.resetZoom}
            />
            <h1 className="text-4xl font-bold">
              {scanner.scanMode === 'folders' ? 'Folder Size Analyzer' : 'Node Modules Cleaner'}
            </h1>
            <div className="w-[120px]"></div>
          </div>

          <ScanModeToggle
            scanMode={scanner.scanMode}
            onScanModeChange={handleScanModeChange}
          />

          <p className="text-muted-foreground">
            {scanner.scanMode === 'folders'
              ? 'Select a folder to view all files and folders sorted by size'
              : 'Select a root directory to find and manage all node_modules folders'
            }
          </p>
        </div>

        <div className="flex justify-center">
          <Button onClick={scanner.scanFolder} size="lg" disabled={scanner.isLoading}>
            {scanner.isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {scanner.scanMode === 'node_modules' ? 'Scanning for node_modules...' : 'Scanning...'} ({scanner.scannedCount} {scanner.scanMode === 'node_modules' ? 'found' : 'items'})
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                {scanner.scanMode === 'node_modules' ? 'Select Root Directory' : 'Select Folder'}
              </>
            )}
          </Button>
        </div>

        <ProgressIndicators
          error={scanner.error}
          successMessage={nodeModulesManager.successMessage}
          isDeleting={nodeModulesManager.isDeleting}
          currentlyDeleting={nodeModulesManager.currentlyDeleting}
          deletionProgress={nodeModulesManager.deletionProgress}
        />

        {scanner.selectedFolder && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Selected:</span> {scanner.selectedFolder}
          </div>
        )}

        {scanner.scanMode === 'node_modules' && (
          <DeleteControls
            items={scanner.items}
            selectedItems={nodeModulesManager.selectedItems}
            isDeleting={nodeModulesManager.isDeleting}
            deletionProgress={nodeModulesManager.deletionProgress}
            onSelectAll={() => nodeModulesManager.handleSelectAll(scanner.items)}
            onDeleteSelected={() => nodeModulesManager.handleDeleteSelected(
              scanner.items,
              scanner.setItems,
              scanner.setError
            )}
          />
        )}

        <FileList
          items={scanner.items}
          scanMode={scanner.scanMode}
          selectedItems={scanner.scanMode === 'node_modules' ? nodeModulesManager.selectedItems : undefined}
          isDeleting={nodeModulesManager.isDeleting}
          onItemSelect={scanner.scanMode === 'node_modules' ? nodeModulesManager.handleItemSelect : undefined}
          onItemReveal={scanner.handleReveal}
          onItemDelete={scanner.scanMode === 'node_modules'
            ? (path) => nodeModulesManager.handleDeleteSingle(
                path,
                scanner.items,
                scanner.setItems,
                scanner.setError
              )
            : undefined
          }
        />

        {!scanner.isLoading && !scanner.error && scanner.items.length === 0 && scanner.selectedFolder && (
          <div className="text-center text-muted-foreground py-12">
            No items found in the selected folder
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
