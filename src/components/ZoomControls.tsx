import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function ZoomControls({ zoomLevel, onZoomIn, onZoomOut, onResetZoom }: ZoomControlsProps) {
  return (
    <div className="flex gap-2">
      <Button onClick={onZoomOut} size="sm" variant="outline" disabled={zoomLevel <= 50}>
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button onClick={onResetZoom} size="sm" variant="outline">
        {zoomLevel}%
      </Button>
      <Button onClick={onZoomIn} size="sm" variant="outline" disabled={zoomLevel >= 200}>
        <ZoomIn className="h-4 w-4" />
      </Button>
    </div>
  );
}