import { NextRequest } from 'next/server';
import { successResponse, errorResponse, serverErrorResponse } from '@shared/utils/apiResponse';
import { ImageThreatAgent } from '@ai/agents/ImageThreatAgent';
import { checkRateLimit } from '@shared/utils/rateLimit';
import Tesseract from 'tesseract.js';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return errorResponse('Rate limit exceeded. Please wait 60 seconds.', 429);
    }
    const body = await request.json();
    const { ocrText, image, filename } = body;

    let textToAnalyze = ocrText || '';

    // If an image (base64) is sent, perform OCR on the server side
    if (image && typeof image === 'string') {
      try {
        console.log('[API/analyze-image] Initializing server-side Tesseract OCR...');
        const worker = await Tesseract.createWorker('eng', 1, {
          langPath: process.cwd(),
          cachePath: '/tmp',
          gzip: false,
        });
        const ocrRes = await worker.recognize(image);
        textToAnalyze = ocrRes.data.text.trim();
        await worker.terminate();
        console.log(`[API/analyze-image] Server-side OCR complete. Extracted ${textToAnalyze.length} chars.`);
      } catch (ocrErr: unknown) {
        const errMessage = ocrErr instanceof Error ? ocrErr.message : String(ocrErr);
        console.error('[API/analyze-image] Server-side OCR failed:', ocrErr);
        return errorResponse(`Server-side OCR engine failed: ${errMessage}`, 500);
      }
    }

    if (typeof textToAnalyze !== 'string' || !filename) {
      return errorResponse('Missing ocrText/image or filename in request', 400);
    }

    // Agent handles heuristic orchestration, and database logging
    const result = await ImageThreatAgent.analyze(textToAnalyze, filename);

    return successResponse(result);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
