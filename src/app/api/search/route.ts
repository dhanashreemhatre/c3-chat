// app/api/search/route.js
import { searchGoogle } from "@/app/lib/websearch";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const limit = searchParams.get('limit') || '10';

        if (!query) {
            return Response.json({ error: 'Query parameter "q" is required' }, { status: 400 });
        }

        const results = await searchGoogle(query, parseInt(limit));

        return Response.json({
            success: true,
            ...results
        });

    } catch (error: unknown) {
        console.error('Search API error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return Response.json(
            { error: 'Search failed', details: errorMessage },
            { status: 500 }
        );
    }
}