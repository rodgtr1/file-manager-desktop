import { Loader2 } from "lucide-react";
import { DeletionProgress } from "@/hooks/useNodeModulesManager";

interface ProgressIndicatorsProps {
  error?: string | null;
  successMessage?: string;
  isDeleting?: boolean;
  currentlyDeleting?: string;
  deletionProgress?: DeletionProgress;
}

export function ProgressIndicators({
  error,
  successMessage,
  isDeleting,
  currentlyDeleting,
  deletionProgress
}: ProgressIndicatorsProps) {
  return (
    <>
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg border border-destructive">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 text-green-800 p-4 rounded-lg border border-green-200">
          {successMessage}
        </div>
      )}

      {isDeleting && (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <div className="flex-1">
              <p className="font-medium">{currentlyDeleting}</p>
              {deletionProgress && deletionProgress.total > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-blue-600 mb-1">
                    <span>Progress: {deletionProgress.current} of {deletionProgress.total}</span>
                    <span>{Math.round((deletionProgress.current / deletionProgress.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(deletionProgress.current / deletionProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}