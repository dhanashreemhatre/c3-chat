import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CHAT_MODELS } from "../constants/models";

interface ModelSelectorProps {
    selectedModel: string;
    onModelChange: (model: string) => void;
}

export function ModelSelector({
    selectedModel,
    onModelChange,
}: ModelSelectorProps) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 font-medium">Model:</span>
            <Select value={selectedModel} onValueChange={onModelChange}>
                <SelectTrigger className="w-52 bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                    {CHAT_MODELS.map((model) => (
                        <SelectItem
                            key={model.id}
                            value={model.id}
                            className="hover:bg-slate-700 focus:bg-slate-700"
                        >
                            <div className="flex flex-col items-start">
                                <span className="font-medium text-slate-100">
                                    {model.name}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400">
                                        {model.provider}
                                    </span>
                                    {model.description && (
                                        <span className="text-xs text-slate-500">
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
    );
}
