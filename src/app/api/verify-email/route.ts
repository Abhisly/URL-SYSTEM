import { NextRequest } from 'next/server';
import { successResponse, errorResponse, serverErrorResponse } from '@shared/utils/apiResponse';
import { EmailAgent } from '@ai/agents/EmailAgent';
import { EmailScanRequest } from '@projectTypes/index';
import { checkRateLimit } from '@shared/utils/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return errorResponse('Rate limit exceeded. Please wait 60 seconds.', 429);
    }
    const body: EmailScanRequest = await request.json();

    if (!body.email || typeof body.email !== 'string') {
      return errorResponse('Invalid or missing email parameter', 400);
    }

    // Agent handles orchestration and database logging
    const result = await EmailAgent.analyze(body.email);

    return successResponse(result);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
