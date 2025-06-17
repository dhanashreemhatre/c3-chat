import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Globe } from "lucide-react";

interface EmptyStateProps {
  currentModel?: { name: string };
  onStartChat: () => void;
  searchEnabled: boolean;
  onSuggestionClick: (suggestion: string) => void;
}

export function EmptyState({
  currentModel,
  searchEnabled,
  onSuggestionClick,
}: EmptyStateProps) {
  const suggestions = [
    "What's the weather like today?",
    "Explain quantum computing",
    "Write a Python function to sort a list",
    "What are the latest AI developments?",
    "Help me plan a trip to Japan",
    "Explain blockchain technology",
  ];

  return (
    <ScrollArea className="min-h-0 sm:h-full w-full flex">
      <div className="flex items-center justify-center text-slate-400">
        <div className="text-center max-w-2xl px-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/10">
            <Bot className="w-10 h-10 text-blue-400" />
          </div>

          <h3 className="text-xl font-semibold text-slate-200 mb-2">
            Ready to Chat
          </h3>

          <p className="text-slate-400 leading-relaxed mb-6">
            Start a conversation with{" "}
            <span className="text-blue-400 font-medium">
              {currentModel?.name}
            </span>
            . Ask questions, get help, or just have a friendly chat!
            {searchEnabled && (
              <span className="block mt-2 text-green-400">
                <Globe className="w-4 h-4 inline mr-1" />
                Web search is enabled for real-time information
              </span>
            )}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => onSuggestionClick(suggestion)}
                className="text-left text-slate-300 border-slate-600 hover:bg-slate-800 hover:border-slate-500 p-3 h-auto whitespace-normal"
              >
                {suggestion}
              </Button>
            ))}
          </div>

          <div className="text-xs text-slate-500">
            <p>
              Tip: Use web search for current events and real-time information
            </p>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}