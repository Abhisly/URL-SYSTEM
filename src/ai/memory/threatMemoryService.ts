export interface ThreatMemoryRecord {
  target: string;
  type: 'URL' | 'EMAIL' | 'IMAGE';
  timestamp: number;
  threatLevel: string;
  patterns: string[];
}

// In-memory store acting as the active cache for the current session.
// In a full production scenario, this syncs strictly with Supabase/Redis.
const memoryBank: ThreatMemoryRecord[] = [];

/**
 * Service responsible for managing the AI's persistent threat memory.
 * It tracks historical scans to identify recurring attack vectors.
 */
export const threatMemoryService = {
  
  // Log a completed scan into the AI's memory
  logThreat: (target: string, type: 'URL' | 'EMAIL' | 'IMAGE', threatLevel: string, patterns: string[]) => {
    memoryBank.push({
      target,
      type,
      timestamp: Date.now(),
      threatLevel,
      patterns
    });
    console.log(`[MemoryService] Target [${target}] logged into neural memory.`);
  },

  // Recall history for a specific target to provide context to the AI
  recallHistory: (target: string): ThreatMemoryRecord[] => {
    // Basic semantic matching: match exact or root domain similarity
    const sanitizedTarget = target.toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
    
    return memoryBank.filter(record => {
      const recordSanitized = record.target.toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
      return recordSanitized === sanitizedTarget || recordSanitized.includes(sanitizedTarget) || sanitizedTarget.includes(recordSanitized);
    }).sort((a, b) => b.timestamp - a.timestamp); // Most recent first
  },

  // Generate a tactical summary of the memory for the Prompt Engine
  generateMemoryContext: (target: string): string => {
    const history = threatMemoryService.recallHistory(target);
    
    if (history.length === 0) {
      return "No historical threat memory for this target. This is a first-time encounter.";
    }

    const previousThreats = history.filter(h => h.threatLevel === 'HIGH RISK' || h.threatLevel === 'CRITICAL');
    
    if (previousThreats.length > 0) {
      return `[CRITICAL MEMORY UPLINK]: This target (or a highly similar structure) has been scanned ${history.length} time(s) previously. It has been flagged as MALICIOUS ${previousThreats.length} times in recent history. Identified historical patterns include: ${[...new Set(previousThreats.flatMap(t => t.patterns))].join(', ')}. YOU MUST FACTOR THIS RECURRING BEHAVIOR INTO YOUR CONFIDENCE SCORE.`;
    }

    return `[MEMORY UPLINK]: Target has been scanned ${history.length} time(s) before and was previously considered safe. Ensure no new sophisticated obfuscation has been introduced.`;
  },
  
  // Get the most recent global threats for the Live Feed UI
  getGlobalThreatStream: (): ThreatMemoryRecord[] => {
    return [...memoryBank].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  }
};
