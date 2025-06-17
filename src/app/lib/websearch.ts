import * as cheerio from 'cheerio';

// Define types for Google Search API response
interface GoogleSearchItem {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  formattedUrl: string;
  pagemap?: any;
}

interface GoogleSearchResponse {
  items?: GoogleSearchItem[];
  searchInformation?: {
    totalResults: string;
    searchTime: number;
    formattedTotalResults: string;
  };
  error?: {
    message: string;
  };
}

async function scrapeContent(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return '';

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, .advertisement').remove();

    // Extract main content - try common content selectors
    let content = '';
    const contentSelectors = [
      'article',
      '[role="main"]',
      '.content',
      '.post-content',
      '.entry-content',
      'main',
      '.main-content',
    ];

    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text();
        break;
      }
    }

    // Fallback to body if no specific content found
    if (!content) {
      content = $('body').text();
    }

    // Clean up the text
    return content
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 4000); // Limit to 4000 characters to avoid token limits
  } catch (error: unknown) {
    console.error(`Error scraping ${url}:`, error);
    return '';
  }
}

export async function searchGoogle(query: string, numResults = 10) {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cseId) {
    throw new Error('Google Search API key or CSE ID not configured');
  }

  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(
    query
  )}&num=${Math.min(numResults, 5)}&sort=date`;

  try {
    console.log('Making request to Google Search API:', url.replace(apiKey, 'HIDDEN'));

    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GoogleBot/1.0)',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GoogleSearchResponse = await response.json();
    console.log('Google Search API response received');

    if (data.error) {
      throw new Error(`API error: ${data.error.message}`);
    }

    // Scrape content from top results
    const enrichedItems = await Promise.all(
      (data.items || []).slice(0, 3).map(async (item: GoogleSearchItem) => {
        // Only scrape top 3 to avoid timeouts
        const scrapedContent = await scrapeContent(item.link);
        return {
          title: item.title,
          link: item.link,
          snippet: item.snippet,
          displayLink: item.displayLink,
          formattedUrl: item.formattedUrl,
          scrapedContent, // Add full scraped content
          pagemap: item.pagemap,
        };
      })
    );
    console.log('Scraped content for Google search results:', enrichedItems);

    return {
      query: query,
      items: enrichedItems,
      searchInformation: {
        totalResults: data.searchInformation?.totalResults,
        searchTime: data.searchInformation?.searchTime,
        formattedTotalResults: data.searchInformation?.formattedTotalResults,
      },
    };
  } catch (error: unknown) {
    console.error('Google Search API error:', error);

    // Return empty results instead of throwing to prevent chat from failing
    return {
      query: query,
      items: [],
      searchInformation: {
        totalResults: '0',
        searchTime: 0,
        formattedTotalResults: '0',
      },
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}