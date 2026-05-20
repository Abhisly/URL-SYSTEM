import { NextResponse } from 'next/server';

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { error: message, success: false },
    { status }
  );
}

export function serverErrorResponse(error: unknown) {
  console.error('Server Error:', error);
  const message = error instanceof Error ? error.message : 'Internal Server Error';
  return NextResponse.json(
    { error: message, success: false },
    { status: 500 }
  );
}
