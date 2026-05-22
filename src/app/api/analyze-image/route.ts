import { NextRequest } from 'next/server';
import { successResponse, errorResponse, serverErrorResponse } from '@shared/utils/apiResponse';
import { ImageThreatAgent } from '@ai/agents/ImageThreatAgent';
import { checkRateLimit } from '@shared/utils/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return errorResponse('Rate limit exceeded. Please wait 60 seconds.', 429);
    }
    const body = await request.json();
    const { ocrText, filename } = body;

    if (typeof ocrText !== 'string' || !filename) {
      return errorResponse('Missing ocrText or filename in request', 400);
    }

    // Agent handles heuristic orchestration, and database logging
    const result = await ImageThreatAgent.analyze(ocrText, filename);

    return successResponse(result);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
