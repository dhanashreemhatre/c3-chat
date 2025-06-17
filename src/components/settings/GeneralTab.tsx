import { Globe } from "lucide-react";
import { CHAT_MODELS } from "@/constants/models";
import { useChatContext } from "@/contexts/ChatContext";

export function GeneralTab() {
  const { state, dispatch } = useChatContext();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          General Settings
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Configure your AI model and search preferences
        </p>
      </div>

      {/* Model Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200">AI Model</label>
        <select
          value={state.selectedModel}
          onChange={(e) =>
            dispatch({
              type: "SET_SELECTED_MODEL",
              payload: e.target.value,
            })
          }
          className="w-full p-3 rounded-lg dark border border-slate-600 text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          {CHAT_MODELS.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name} ({model.provider})
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-400">
          Choose the AI model for your conversations
        </p>
      </div>

      {/* Search Toggle */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200">Web Search</label>
        <div className="flex items-center gap-3 p-3 dark rounded-lg border border-slate-600">
          <input
            type="checkbox"
            id="web-search"
            checked={state.searchEnabled}
            onChange={(e) =>
              dispatch({
                type: "SET_SEARCH_ENABLED",
                payload: e.target.checked,
              })
            }
            className="w-4 h-4 text-blue-600 dark:border-slate-500 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="web-search"
            className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            Enable Web Search
          </label>
        </div>
        <p className="text-xs text-slate-400">
          Allow the AI to search the web for up-to-date information
        </p>
      </div>
    </div>
  );
}