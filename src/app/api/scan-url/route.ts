import { NextRequest } from 'next/server';
import { successResponse, errorResponse, serverErrorResponse } from '@shared/utils/apiResponse';
import { URLAgent } from '@ai/agents/URLAgent';
import { URLScanRequest } from '@projectTypes/index';
import { checkRateLimit } from '@shared/utils/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return errorResponse('Rate limit exceeded. Please wait 60 seconds.', 429);
    }
    const body: URLScanRequest = await request.json();

    if (!body.url || typeof body.url !== 'string') {
      return errorResponse('Invalid or missing URL parameter', 400);
    }

    // Agent handles orchestration and database logging
    const result = await URLAgent.analyze(body.url);

    return successResponse(result);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
