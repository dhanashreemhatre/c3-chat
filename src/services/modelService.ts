import { ChatModel } from "../types/chat";

interface ProviderInfo {
  name: string;
  hasApiKey: boolean;
  models: string[];
}

interface ModelResponse {
  models: (ChatModel & { keySource: "user" | "server" })[];
  providers: Record<string, ProviderInfo>;
}

interface ModelMapping {
  actualModelName: string;
  normalizedProvider: string;
}

export const modelService = {
  /**
   * Fetches available models based on user's API keys and server keys
   */
  async getAvailableModels(): Promise<ModelResponse> {
    try {
      const response = await fetch("/api/models", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch models");
      }

      return await response.json();
    } catch (error) {
      console.error("Error in getAvailableModels:", error);
      throw error;
    }
  },

  /**
   * Updates a user's API key for a specific provider
   */
  async updateApiKey(provider: string, apiKey: string): Promise<void> {
    try {
      const response = await fetch("/api/user-api-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider, apiKey }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update API key");
      }
    } catch (error) {
      console.error("Error in updateApiKey:", error);
      throw error;
    }
  },

  /**
   * Gets the correct model information for API requests
   * @param modelId The ID of the model selected in the UI
   * @returns Object with properly formatted model name and provider
   */
  async getModelRequestParams(modelId: string): Promise<ModelMapping> {
    try {
      // Fetch the model details from the API to ensure we have the latest info
      const { models } = await this.getAvailableModels();

      // Find the selected model
      console.log(
        `Fetching model details for ID: ${modelId},models available:`,
        models,
      );
      const model = models.find((m) => m.id === modelId);

      if (!model) {
        throw new Error(`Model with ID "${modelId}" not found`);
      }

      // Normalize the provider name for the AI Handler
      let normalizedProvider = model.provider.toLowerCase();
      if (normalizedProvider === "anthropic") {
        normalizedProvider = "claude";
      }

      // Map model IDs to actual provider-specific model names
      const modelMappings: Record<string, Record<string, string>> = {
        openai: {
          "gpt-4-turbo": "gpt-4-turbo-preview",
          "gpt-4o": "gpt-4o",
          // Keep original IDs as fallback
        },
        claude: {
          "claude-3-opus": "claude-3-opus-20240229",
          "claude-3-sonnet": "claude-3-sonnet-20240229",
          "claude-3-haiku": "claude-3-haiku-20240307",
          // Keep original IDs as fallback
        },
        google: {
          "gemini-2-flash": "gemini-1.5-flash-latest",
          "gemini-pro": "gemini-pro",
          // Keep original IDs as fallback
        },
      };

      // Get the provider-specific mapping or use original model ID if not found
      const providerMappings = modelMappings[normalizedProvider] || {};
      const actualModelName = providerMappings[model.id] || model.id;

      console.log(
        `Model mapping: ${model.id} → ${actualModelName} (${normalizedProvider})`,
      );

      return {
        actualModelName,
        normalizedProvider,
      };
    } catch (error) {
      console.error("Error in getModelRequestParams:", error);
      throw error;
    }
  },
};
