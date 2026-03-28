import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// API Key for securing access from n8n
const API_SECRET_KEY = process.env.SERVICES_API_KEY || 'dental-n8n-secret-2024';

export async function GET(request: NextRequest) {
  // --- Authentication ---
  const authHeader = request.headers.get('x-api-key');
  if (authHeader !== API_SECRET_KEY) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Invalid API Key' },
      { status: 401 }
    );
  }

  // --- Query Params ---
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');      // e.g. ?category=علاج
  const activeOnly = searchParams.get('active_only'); // e.g. ?active_only=true

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let query = supabase
      .from('services')
      .select('id, name, description, price, duration_minutes, category, is_active, created_at')
      .order('category', { ascending: true });

    if (category) query = query.eq('category', category);
    if (activeOnly === 'true') query = query.eq('is_active', true);

    const { data: services, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // ✅ Return flat array — each service is a separate n8n item (row in table)
    return NextResponse.json(services ?? []);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
