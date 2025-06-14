import { CHAT_MODELS } from "../constants/models";
import { ChatModel } from "../types/chat";

/**
 * Gets model details required for API calls
 * @param modelId The ID of the model to use
 * @returns Object containing model ID and provider
 */
export function getModelRequestParams(modelId: string): { modelId: string; provider: string } {
    const model = CHAT_MODELS.find((m: ChatModel) => m.id === modelId);

    if (!model) {
        throw new Error(`Model with ID "${modelId}" not found`);
    }

    return {
        modelId: model.id,
        provider: model.provider
    };
}