"use client";

import { useChatContext } from "@/contexts/ChatContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export default function ModelSelector() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { state, dispatch, loadAvailableModels } = useChatContext();
  const { availableModels, selectedModel, isLoadingModels } = state;

  // Find the currently selected model object
  const currentModel = availableModels.find(
    (model) => model.id === selectedModel,
  );

  if (isLoadingModels) {
    return <div className="p-2 text-sm text-gray-500">Loading models...</div>;
  }

  if (availableModels.length === 0) {
    return (
      <div className="p-2 text-sm text-red-500">
        No models available. Please add API keys in settings.
      </div>
    );
  }

  return (
    <div className="flex gap-2  p-4">
      {/* <label className="text-sm font-medium text-gray-700">Select Model</label> */}
      <div className="relative">
        <Select
          value={selectedModel}
          onValueChange={(value) => {
            dispatch({ type: "SET_SELECTED_MODEL", payload: value });
          }}
        >
          <SelectTrigger className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-border">
            {/* Custom display for selected value */}
            <div className="flex items-center gap-2">
              {currentModel ? (
                <>
                  <span className="font-medium text-white truncate">
                    {currentModel.name.length > 20
                      ? currentModel.name.slice(0, 20) + '…'
                      : currentModel.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({currentModel.provider})
                  </span>
                </>
              ) : (
                <span>Select a model</span>
              )}
            </div>
          </SelectTrigger>
          <SelectContent className="dark border-border max-w-[280px] md:max-w-[350px]">
            {availableModels.map((model) => (
              <SelectItem
                key={model.id}
                value={model.id}
                className="hover:dark focus:dark"
              >
                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-white">
                      {model.name}
                    </span>
                    {model.keySource && (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${model.keySource === "user"
                          ? "bg-green-800 text-green-100"
                          : "bg-blue-800 text-blue-100"
                          }`}
                      >
                        {model.keySource === "user" ? "user" : "Server"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-xs text-white">
                      {model.provider}
                    </span>
                    {model.description && (
                      <span
                        className="text-xs text-white truncate max-w-[180px] inline-block"
                        title={model.description}
                      >
                        • {model.description}
                      </span>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
