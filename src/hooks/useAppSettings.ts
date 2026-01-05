import { useState, useCallback } from 'react';

export function useAppSettings() {
  const [zoomLevel, setZoomLevel] = useState(100);

  const zoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(100);
  }, []);

  return {
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
  };
}