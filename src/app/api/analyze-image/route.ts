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
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return errorResponse('No image file provided', 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Agent handles OCR, heuristic orchestration, and database logging
    const result = await ImageThreatAgent.analyze(buffer, file.name);

    return successResponse(result);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
