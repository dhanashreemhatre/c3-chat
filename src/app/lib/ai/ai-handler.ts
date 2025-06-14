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
  provider: string;
  model: string;
  apiKey?: string;
}

export class AIHandler {
  private provider: string;
  private model: string;
  private apiKey?: string;
  private chatModel:
    | ChatOpenAI
    | ChatAnthropic
    | ChatGoogleGenerativeAI;

  constructor(options: AIHandlerOptions) {
    this.provider = options.provider;
    this.model = options.model;
    this.apiKey = options.apiKey;

    switch (this.provider) {
      case "openai":
        this.chatModel = new ChatOpenAI({
          openAIApiKey: this.apiKey || process.env.OPENAI_API_KEY!,
          modelName: this.model || "gpt-4o",
          temperature: 0.5,
        });
        break;

      case "claude":
        this.chatModel = new ChatAnthropic({
          anthropicApiKey: this.apiKey || process.env.ANTHROPIC_API_KEY!,
          modelName: this.model || "claude-3-opus-20240229",
          temperature: 0.5,
        });
        break;

      case "gemini":
        this.chatModel = new ChatGoogleGenerativeAI({
          apiKey: this.apiKey || process.env.GOOGLE_API_KEY!,
          model: this.model || "gemini-2.0-flash-lite",
          temperature: 0.5,
        });
        break;

      default:
        throw new Error(`Provider "${this.provider}" not supported.`);
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
