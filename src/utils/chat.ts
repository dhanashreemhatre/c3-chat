import { CHAT_MODELS } from "../constants/models";

// Generate unique ID for messages
export const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
};

// Format timestamp for display
export const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Simulate AI response - replace with actual API calls
export const simulateAIResponse = async (
    message: string,
    model: string,
): Promise<string> => {
    // Simulate realistic API delay
    await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000),
    );

    const selectedModel = CHAT_MODELS.find((m) => m.id === model);

    const responses = [
        `I'm ${selectedModel?.name} and I received your message: "${message}". How can I help you further?`,
        `That's an interesting question about "${message}". Let me think about that and provide you with a comprehensive answer.`,
        `I understand you're asking about "${message}". Here's what I think based on my knowledge...`,
        `Great question! Regarding "${message}", I can help you with that. Let me break this down for you.`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
};
