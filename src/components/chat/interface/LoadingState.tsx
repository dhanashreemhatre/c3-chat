interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading chat..." }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-slate-400 rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-slate-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 bg-slate-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
        <span className="text-slate-400 text-sm">{message}</span>
      </div>
    </div>
  );
}