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
    this.provider = options.provider.toLowerCase();
    this.model = options.model;
    this.apiKey = options.apiKey;

    console.log(`AI Handler initializing with provider: ${this.provider}, model: ${this.model}`);

    switch (this.provider) {
      case "openai":
        console.log(`Using OpenAI model: ${this.model}`);
        this.chatModel = new ChatOpenAI({
          openAIApiKey: this.apiKey || process.env.OPENAI_API_KEY!,
          modelName: this.model,
          temperature: 0.5,
          streaming: true,
        });
        break;

      case "claude":
        console.log(`Using Claude model: ${this.model}`);
        this.chatModel = new ChatAnthropic({
          anthropicApiKey: this.apiKey || process.env.ANTHROPIC_API_KEY!,
          modelName: this.model,
          temperature: 0.5,
          streaming: true,
        });
        break;

      case "google":
        console.log(`Using Google model: ${this.model}`);
        this.chatModel = new ChatGoogleGenerativeAI({
          apiKey: this.apiKey || process.env.GOOGLE_API_KEY!,
          model: this.model,
          temperature: 0.5,
          streaming: true,
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

  // Real streaming implementation using LangChain's streaming
  async *chatStream(messages: ChatCompletionRequestMessage[]): AsyncIterable<string> {
    console.log("AI Handler chatStream called with real streaming:", {
      provider: this.provider,
      model: this.model,
      messagesCount: messages.length
    });

    const langchainMessages = messages.map((msg) => {
      if (msg.role === "system") return new SystemMessage(msg.content);
      if (msg.role === "user") return new HumanMessage(msg.content);
      return new HumanMessage(msg.content);
    });

    try {
      // Use LangChain's streaming capability
      const stream = await this.chatModel.stream(langchainMessages);

      for await (const chunk of stream) {
        // Extract the content from the chunk
        const content = chunk.content;
        if (content && typeof content === 'string') {
          console.log("Streaming chunk:", content);
          yield content;
        }
      }
    } catch (error) {
      console.error("Error in chatStream:", error);
      throw error;
    }
  }

  async generateImage(prompt: string) {
    const executor = await initializeAgentExecutorWithOptions(
      [imageGenTool],
      this.chatModel,
      {
        agentType: "openai-functions",
        verbose: true,
      }
    );

    const result = await executor.call({
      input: prompt,
    });
    return result.output;
  }

  async runTool(toolName: string, input: string) {
    const executor = await initializeAgentExecutorWithOptions(
      [imageGenTool],
      this.chatModel,
      {
        agentType: "openai-functions",
        verbose: true,
      }
    );

    const result = await executor.call({
      input,
      toolName,
    });
    return result.output;
  }
}
