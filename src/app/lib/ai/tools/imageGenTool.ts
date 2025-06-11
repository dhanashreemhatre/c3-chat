import { DynamicTool } from "@langchain/core/tools";

export const imageGenTool = new DynamicTool({
  name: "image_generation",
  description: "Generate an image from a prompt",
  func: async (input: string) => {
    // Call your image generation API here
    const res = await fetch("/api/image-gen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input, provider: "openai" }),
    });
    const data = await res.json();
    return data.imageUrl || "No image generated.";
  },
});