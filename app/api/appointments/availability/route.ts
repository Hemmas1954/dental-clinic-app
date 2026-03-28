import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const API_SECRET_KEY = process.env.SERVICES_API_KEY || 'dental-n8n-secret-2024';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('x-api-key');
  if (authHeader !== API_SECRET_KEY) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date'); // e.g. 2026-03-29
  const timeStr = searchParams.get('time'); // e.g. 14:00

  if (!dateStr || !timeStr) {
    return NextResponse.json({ success: false, error: 'date and time are required' }, { status: 400 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Assuming appointments are stored as ISO datetime strings in `appointment_date`
    // Convert to ISO to query properly if your db stores it as timestamptz
    const requestedDateTime = new Date(`${dateStr}T${timeStr}:00`).toISOString();

    const { data: existingAppts, error } = await supabase
      .from('appointments')
      .select('id')
      .eq('appointment_date', requestedDateTime);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const isAvailable = existingAppts.length === 0;

    return NextResponse.json({
      success: true,
      available: isAvailable,
      requested_time: requestedDateTime,
      message: isAvailable ? 'الوقت متاح للحجز' : 'عذراً، هذا الوقت محجوز مسبقاً'
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
