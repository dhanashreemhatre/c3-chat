import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatContext } from "@/contexts/ChatContext";

interface DataTabProps {
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
}

export function DataTab({ onError, onSuccess }: DataTabProps) {
  const { state, deleteAllChats, loadUserChats } = useChatContext();

  const handleDeleteAllChats = async () => {
    if (!window.confirm("Are you sure you want to delete all chats? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteAllChats();
      await loadUserChats();
      onSuccess("All chats deleted successfully!");
    } catch (error) {
      onError(error instanceof Error ? error.message : "Failed to delete chats");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Data Management
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Manage your chat data and history
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 dark rounded-lg border border-slate-600">
          <h4 className="text-sm font-medium text-slate-200 mb-2">Chat History</h4>
          <p className="text-sm text-slate-400 mb-4">
            You currently have {state.chats.length} chat(s) saved.
          </p>
          <Button
            variant="destructive"
            onClick={handleDeleteAllChats}
            disabled={state.chats.length === 0}
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete All Chats
          </Button>
          <p className="text-xs text-slate-500 mt-2">
            This action cannot be undone. All your chat history will be permanently deleted.
          </p>
        </div>
      </div>
    </div>
  );
}