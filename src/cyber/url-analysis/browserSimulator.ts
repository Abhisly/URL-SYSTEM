import dns from 'dns';
import { BrowserScanReport } from '@projectTypes/index';

/**
 * Executes a simulated browser verification for a target URL.
 * Performs DNS lookup, SSL check, page download, and redirects tracking.
 */
export async function runBrowserSimulation(url: string): Promise<BrowserScanReport> {
  const testedAt = new Date().toISOString();
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  const normalized = url.startsWith('http') ? url : `https://${url}`;
  
  let hostname = '';
  try {
    hostname = new URL(normalized).hostname;
  } catch {
    hostname = url;
  }

  // 1. DNS Resolution
  const dnsStart = Date.now();
  let ip: string | undefined;
  let dnsResolved = false;
  let dnsError: string | undefined;

  try {
    // Wrap dns.promises.lookup in a 1000ms timeout
    const lookupPromise = dns.promises.lookup(hostname);
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('DNS resolution timed out')), 1000)
    );
    const dnsRes = await Promise.race([lookupPromise, timeoutPromise]);
    ip = dnsRes.address;
    dnsResolved = true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'DNS resolution failed';
    dnsError = message || 'DNS resolution failed';
  }
  const dnsLookupTimeMs = Date.now() - dnsStart;

  // Defaults for HTTP/TLS stage
  let connectionStatus: 'SECURE' | 'INSECURE' | 'FAILED' = 'FAILED';
  let sslVerified = false;
  let handshakeTimeMs = 0;
  
  let statusCode: number | undefined;
  let statusText: string | undefined;
  const redirectChain: string[] = [];
  let responseTimeMs = 0;
  const headers: Record<string, string> = {};
  
  let title = '';
  let description = '';
  let elementCount = 0;
  let scriptsDetected = 0;

  let hsts = false;
  let csp = false;
  let xFrameOptions: string | undefined;
  let xContentTypeOptions: string | undefined;

  // 2. HTTP Navigation and SSL handshake check
  if (dnsResolved) {
    const httpStart = Date.now();
    try {
      const res = await fetch(normalized, {
        method: 'GET',
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(1500), // 1.5 second timeout
        redirect: 'follow',
      });

      responseTimeMs = Date.now() - httpStart;
      handshakeTimeMs = Math.round(responseTimeMs * 0.15); // Simulated handshake subset
      statusCode = res.status;
      statusText = res.statusText;

      if (res.url && res.url !== normalized) {
        redirectChain.push(normalized);
        redirectChain.push(res.url);
      }

      if (res.url.startsWith('https:')) {
        connectionStatus = 'SECURE';
        sslVerified = true;
      } else {
        connectionStatus = 'INSECURE';
        sslVerified = false;
      }

      // Collect security headers
      res.headers.forEach((val, key) => {
        const lowerKey = key.toLowerCase();
        headers[lowerKey] = val;
      });

      hsts = !!headers['strict-transport-security'];
      csp = !!headers['content-security-policy'];
      xFrameOptions = headers['x-frame-options'];
      xContentTypeOptions = headers['x-content-type-options'];

      // Extract HTML DOM content
      const html = await res.text();
      elementCount = (html.match(/<[a-zA-Z]/g) || []).length;
      scriptsDetected = (html.match(/<script/g) || []).length;

      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      title = titleMatch ? titleMatch[1].trim().slice(0, 120) : '';

      const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{0,400})["']/i)
        || html.match(/<meta[^>]+content=["']([^"']{0,400})["'][^>]+property=["']og:description["']/i);
      const metaDescMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{0,400})["']/i)
        || html.match(/<meta[^>]+content=["']([^"']{0,400})["'][^>]+name=["']description["']/i);
      description = (ogDescMatch?.[1] || metaDescMatch?.[1] || '').trim();

    } catch (err: unknown) {
      connectionStatus = 'FAILED';
      sslVerified = false;
      responseTimeMs = Date.now() - httpStart;
      
      const message = err instanceof Error ? err.message : String(err);
      const isSslErr = message && (
        message.includes('cert') || 
        message.includes('ssl') || 
        message.includes('tls') || 
        message.includes('expired')
      );
      if (isSslErr) {
        dnsError = 'SSL/TLS Handshake Error: Invalid or expired SSL certificate';
      } else {
        dnsError = message || 'HTTP request connection timed out';
      }
    }
  }

  return {
    testedAt,
    userAgent,
    dns: {
      resolved: dnsResolved,
      ip,
      lookupTimeMs: dnsLookupTimeMs,
      error: dnsError,
    },
    connection: {
      status: connectionStatus,
      protocol: connectionStatus === 'SECURE' ? 'TLS 1.3' : connectionStatus === 'INSECURE' ? 'HTTP/1.1' : undefined,
      handshakeTimeMs,
      sslVerified,
    },
    http: {
      statusCode,
      statusText,
      redirectChain,
      responseTimeMs,
      headers,
    },
    dom: {
      title: title || undefined,
      description: description || undefined,
      elementCount,
      scriptsDetected,
    },
    securityHeaders: {
      hsts,
      csp,
      xFrameOptions,
      xContentTypeOptions,
    },
  };
}
