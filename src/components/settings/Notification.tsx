import { AlertCircle, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationMessagesProps {
  error: string | null;
  success: string | null;
  onClearError: () => void;
}

export function NotificationMessages({
  error,
  success,
  onClearError,
}: NotificationMessagesProps) {
  if (!error && !success) return null;

  return (
    <>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearError}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-lg bg-green-900/20 border border-green-500/30">
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">{success}</span>
          </div>
        </div>
      )}
    </>
  );
}