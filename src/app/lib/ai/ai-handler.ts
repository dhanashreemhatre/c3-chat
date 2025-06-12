import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { imageGenTool } from "./tools/imageGenTool";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export type SupportedModels = "openai" | "claude" | "gemini";

export type ChatCompletionRequestMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

interface AIHandlerOptions {
  modelName?: string;
  temperature?: number;
  apiKey?: string;
  provider: SupportedModels;
}

export class AIHandler {
  private chatModel:
    | ChatOpenAI
    | ChatAnthropic
    | ChatGoogleGenerativeAI;

  constructor(options: AIHandlerOptions) {
    const { provider, modelName, temperature, apiKey } = options;

    switch (provider) {
      case "openai":
        this.chatModel = new ChatOpenAI({
          openAIApiKey: apiKey || process.env.OPENAI_API_KEY!,
          modelName: modelName || "gpt-4o",
          temperature: temperature ?? 0.5,
        });
        break;

      case "claude":
        this.chatModel = new ChatAnthropic({
          anthropicApiKey: apiKey || process.env.ANTHROPIC_API_KEY!,
          modelName: modelName || "claude-3-opus-20240229",
          temperature: temperature ?? 0.5,
        });
        break;

      case "gemini":
        this.chatModel = new ChatGoogleGenerativeAI({
          apiKey: apiKey || process.env.GOOGLE_API_KEY!,
          model: modelName || "gemini-2.0-flash-lite",
          temperature: temperature ?? 0.5,
        });
        break;

      default:
        throw new Error(`Provider "${provider}" not supported.`);
    }
  }

  async chat(messages: ChatCompletionRequestMessage[]) {
    const langchainMessages = messages.map((msg) => {
      if (msg.role === "system") return new SystemMessage(msg.content);
      if (msg.role === "user") return new HumanMessage(msg.content);
      return new HumanMessage(msg.content);
    });

    const response = await this.chatModel.call(langchainMessages);
    return response.text;
  }

  async generateImage(prompt: string) {
    const executor = await initializeAgentExecutorWithOptions(
      [imageGenTool], // Add more tools as needed
      this.chatModel,
      {
        agentType: "openai-functions", // or "openai-tools"
        verbose: true,
      }
    );

    const result = await executor.call({
      input: prompt,
    });
    return result.output; // Will include the image URL if tool was used
  }
  async runTool(toolName: string, input: string) {
    const executor = await initializeAgentExecutorWithOptions(
      [imageGenTool], // Add more tools as needed
      this.chatModel,
      {
        agentType: "openai-functions", // or "openai-tools"
        verbose: true,
      }
    );

    const result = await executor.call({
      input,
      toolName,
    });
    return result.output; // Will include the tool's output
  }
}
