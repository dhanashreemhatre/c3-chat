import prisma from "@/app/lib/db/db"; // Adjust the import path based on your setup

type UserApiKeyResult = {
    provider: string;
    apiKey: string;
};

/**
 * Gets all API keys saved by the user
 * @param userId The user's ID
 * @returns Object mapping providers to API keys
 */
export async function getUserApiKeys(userId: string): Promise<Record<string, string>> {
    try {
        const userApiKeys = await prisma.userApiKey.findMany({
            where: {
                userId: userId,
            },
            select: {
                provider: true,
                apiKey: true,
            },
        });

        // Convert array to object with provider as key
        const apiKeysMap: Record<string, string> = {};
        userApiKeys.forEach((key: UserApiKeyResult) => {
            apiKeysMap[key.provider] = key.apiKey;
        });

        return apiKeysMap;
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
        await prisma.userApiKey.upsert({
            where: {
                userId_provider: {
                    userId: userId,
                    provider: provider,
                },
            },
            update: {
                apiKey: apiKey,
                updatedAt: new Date(),
            },
            create: {
                userId: userId,
                provider: provider,
                apiKey: apiKey,
            },
        });
    } catch (error) {
        console.error("Error saving user API key:", error);
        throw error;
    }
}

/**
 * Deletes an API key for a provider
 * @param userId The user's ID
 * @param provider The provider name (e.g., "OpenAI")
 */
export async function deleteUserApiKey(userId: string, provider: string) {
    try {
        await prisma.userApiKey.delete({
            where: {
                userId_provider: {
                    userId: userId,
                    provider: provider,
                },
            },
        });
    } catch (error) {
        console.error("Error deleting user API key:", error);
        throw error;
    }
}