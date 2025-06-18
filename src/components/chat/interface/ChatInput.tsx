import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Globe, GlobeLock, Share2 } from "lucide-react";
import ModelSelector from "../../ModelSelector";

interface ChatInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  searchEnabled: boolean;
  onToggleSearch: () => void;
  onFileUpload: () => void;
  onShareChat?: () => Promise<string | null>; // Change from string | undefined to string | null
  currentChatId?: string;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function ChatInput({
  inputValue,
  onInputChange,
  onSubmit,
  onKeyDown,
  isLoading,
  searchEnabled,
  onToggleSearch,
  onFileUpload,
  onShareChat,
  currentChatId,
  inputRef
}: ChatInputProps) {
  return (
    <div
      className="sticky inset-x-0 bottom-0 z-20 transition-all duration-200 ease-in-out w-full"
      style={{
        paddingBottom: "env(keyboard-inset-height, 0px)",
      }}
    >
      <div className="p-4 sm:p-4 pb-2 sm:pb-2 border-t border-border dark flex-shrink-0 w-full">
        <div className="flex gap-2 w-full">
          <div className="flex-1 relative min-w-0">
            <Textarea
              autoFocus
              ref={inputRef}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={
                searchEnabled
                  ? "Ask me anything... (Web search enabled)"
                  : "Type your message..."
              }
              disabled={isLoading}
              className="dark border-border text-slate-100 placeholder-slate-400 pr-12 h-8 sm:h-10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all w-full"
            />
          </div>

          <Button
            onClick={onSubmit}
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="h-10 sm:h-12 w-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex items-center justify-start mt-1 text-xs text-slate-500 flex-wrap gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onFileUpload}
            className="text-slate-400 hover:text-slate-100 hover:bg-slate-800 flex-shrink-0"
            title="Upload Files"
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSearch}
            className={`text-slate-400 hover:text-slate-100 hover:bg-slate-800 flex-shrink-0 ${
              searchEnabled ? "text-green-400" : ""
            }`}
            title={searchEnabled ? "Disable Web Search" : "Enable Web Search"}
          >
            {searchEnabled ? (
              <Globe className="w-4 h-4" />
            ) : (
              <GlobeLock className="w-4 h-4" />
            )}
          </Button>
          
          {currentChatId && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onShareChat}
              className="text-slate-400 hover:text-slate-100 hover:bg-slate-800 flex-shrink-0"
              title="Share Chat"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          )}

          <div className="flex-1 min-w-0">
            <ModelSelector />
          </div>

          {currentChatId && (
            <div className="hidden sm:block text-center text-xs text-slate-500 mt-1 truncate">
              Chat ID: {currentChatId}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}