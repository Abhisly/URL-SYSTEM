export const OLLAMA_ENDPOINT = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
export const AI_MODEL = process.env.AI_MODEL || 'qwen2.5:7b';
export const AI_TEMPERATURE = 0.2;

export interface OllamaResponse {
  response: string;
}

export async function generateOllamaResponse(prompt: string): Promise<string> {
  console.log(`[OllamaService] Sending prompt to local ${AI_MODEL} model...`);
  
  try {
    const res = await fetch(OLLAMA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: AI_MODEL,
        prompt: prompt,
        temperature: AI_TEMPERATURE,
        stream: false
      }),
      // Set a timeout of 30 seconds
      signal: AbortSignal.timeout(30000) 
    });

    if (!res.ok) {
      throw new Error(`Ollama HTTP Error: ${res.status}`);
    }

    const data: OllamaResponse = await res.json();
    return data.response.trim();
  } catch (error) {
    console.error('[OllamaService] Failure communicating with Ollama:', error);
    throw new Error('Local AI Unreachable');
  }
}

/**
 * Attempts to parse an Ollama response string into JSON.
 * Often LLMs will wrap JSON in markdown blocks like ```json ... ```
 */
export function extractJsonFromResponse(responseString: string): Record<string, unknown> {
  try {
    // First, just try straight parsing
    return JSON.parse(responseString);
  } catch {
    // Attempt to extract JSON from markdown block
    const jsonMatch = responseString.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        console.error('[OllamaService] Failed to parse extracted JSON block.');
      }
    }
    
    // Attempt brute-force extraction (find first { and last })
    const start = responseString.indexOf('{');
    const end = responseString.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(responseString.substring(start, end + 1));
      } catch {
        console.error('[OllamaService] Failed brute-force JSON parse.');
      }
    }

    throw new Error('Could not parse valid JSON from AI response.');
  }
}
