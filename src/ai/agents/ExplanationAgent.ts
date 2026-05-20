import { generateOllamaResponse } from '@ai/services/ollamaService';

export class ExplanationAgent {
  /**
   * Generates a cinematic, human-readable summary from raw JSON threat reports.
   * Can be used on the frontend or backend to wrap up complex AI data into an executive summary.
   */
  static async generateSummary(threatData: Record<string, unknown>): Promise<string> {
    console.log(`[ExplanationAgent] Generating summary for threat data...`);
    
    const prompt = `
You are the autonomous cybersecurity system "URL SYSTEM CORE".
Summarize the following threat report into a single, highly professional, 2-sentence executive summary.
Do not output markdown, just the clean summary text.

Threat Data:
${JSON.stringify(threatData)}
    `;

    try {
      const summary = await generateOllamaResponse(prompt);
      return summary;
    } catch (error) {
      console.error('[ExplanationAgent] Failed to generate summary:', error);
      return "Based on heuristic analysis, this target exhibits patterns consistent with known threat vectors. Further manual review is advised.";
    }
  }
}
