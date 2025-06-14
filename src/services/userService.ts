/**
 * Gets all API keys saved by the user
 * @param userId The user's ID
 * @returns Object mapping providers to API keys
 */
export async function getUserApiKeys(userId: string): Promise<Record<string, string>> {
    try {
        // This is where you'd query your database or API for the user's saved keys
        // Example implementation with a database call:
        // const keys = await db.apiKeys.findMany({ where: { userId } });

        // For now, we'll simulate fetching from localStorage if in the browser
        if (typeof window !== 'undefined') {
            const savedKeys = localStorage.getItem(`user_${userId}_api_keys`);
            if (savedKeys) {
                return JSON.parse(savedKeys);
            }
        }

        // If no keys found or server-side
        return {};
    } catch (error) {
        console.error("Error fetching user API keys:", error);
        return {};
    }
}

/**
 * Saves an API key for a provider
 * @param userId The user's ID
 * @param provider The provider name (e.g., "OpenAI")
 * @param apiKey The API key to save
 */
export async function saveUserApiKey(
    userId: string,
    provider: string,
    apiKey: string
): Promise<void> {
    try {
        // This is where you'd save to your database
        // Example implementation with a database call:
        // await db.apiKeys.upsert({
        //   where: { userId_provider: { userId, provider } },
        //   update: { apiKey },
        //   create: { userId, provider, apiKey },
        // });

        // For now, we'll simulate saving to localStorage if in the browser
        if (typeof window !== 'undefined') {
            const savedKeys = localStorage.getItem(`user_${userId}_api_keys`) || '{}';
            const keys = JSON.parse(savedKeys);
            keys[provider] = apiKey;
            localStorage.setItem(`user_${userId}_api_keys`, JSON.stringify(keys));
        }
    } catch (error) {
        console.error("Error saving user API key:", error);
        throw new Error("Failed to save API key");
    }
}