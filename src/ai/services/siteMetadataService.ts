/**
 * Fetches real page metadata (title, description, og:description) from a URL.
 * This runs server-side so there are no CORS issues.
 */
export interface SiteMetadata {
  title: string;
  description: string;
  domain: string;
}

export async function fetchSiteMetadata(url: string): Promise<SiteMetadata> {
  const normalized = url.startsWith('http') ? url : `https://${url}`;
  let domain = url;
  try {
    domain = new URL(normalized).hostname.replace('www.', '');
  } catch { /* use raw */ }

  try {
    const res = await fetch(normalized, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; URLSystemBot/1.0)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(8000),
      redirect: 'follow',
    });

    if (!res.ok) {
      return { title: domain, description: '', domain };
    }

    const html = await res.text();

    // Extract <title>
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim().slice(0, 120) : domain;

    // Try og:description → meta description fallback
    const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{0,400})["']/i)
      || html.match(/<meta[^>]+content=["']([^"']{0,400})["'][^>]+property=["']og:description["']/i);
    const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{0,400})["']/i)
      || html.match(/<meta[^>]+content=["']([^"']{0,400})["'][^>]+name=["']description["']/i);

    const description = (ogDescMatch?.[1] || metaDescMatch?.[1] || '').trim();

    return { title, description, domain };
  } catch (err) {
    console.warn(`[SiteMetadataService] Could not fetch metadata for ${url}:`, err);
    return { title: domain, description: '', domain };
  }
}
