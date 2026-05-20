import { NextRequest } from 'next/server';
import { successResponse, serverErrorResponse, errorResponse } from '@shared/utils/apiResponse';
import { supabase } from '@backend/database/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (type && !['URL', 'EMAIL', 'IMAGE'].includes(type.toUpperCase())) {
      return errorResponse('Invalid scan type', 400);
    }

    let query = supabase.from('threat_reports').select('*').order('created_at', { ascending: false }).limit(limit);

    if (type) {
      query = query.eq('scan_type', type.toUpperCase());
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return successResponse({ reports: data });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
