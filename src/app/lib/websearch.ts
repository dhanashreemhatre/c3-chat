export async function webSearch(query: string) {
  const apiKey = process.env.SERPAPI_KEY;
  const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${apiKey}`;
  const resp = await fetch(url);
  const data = await resp.json();
  // You can filter/format results here as needed
  return data.organic_results || data;
}