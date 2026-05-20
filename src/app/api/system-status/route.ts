import { NextResponse } from 'next/server';
import { supabase } from '@backend/database/supabase';

export async function GET() {
  try {
    // Check DB connection
    const { error } = await supabase.from('url_scans').select('id').limit(1);
    const dbStatus = error ? 'offline' : 'online';

    // Check Ollama
    let aiStatus = 'simulated (Ollama offline)';
    try {
      const aiRes = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(3000) });
      if (aiRes.ok) aiStatus = 'online';
    } catch {
      // Ignored
    }

    return NextResponse.json({
      status: 'online',
      database: dbStatus,
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      services: {
        heuristics: 'online',
        ai_orchestrator: aiStatus,
        ocr: 'online'
      }
    });
  } catch {
    return NextResponse.json({ status: 'degraded', error: 'System error' }, { status: 500 });
  }
}
