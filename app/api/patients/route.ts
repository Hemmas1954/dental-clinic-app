import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// API Key for securing access from n8n / AI Agent
const API_SECRET_KEY = process.env.SERVICES_API_KEY || 'dental-n8n-secret-2024';

export async function POST(request: NextRequest) {
  // --- Authentication ---
  const authHeader = request.headers.get('x-api-key');
  if (authHeader !== API_SECRET_KEY) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Invalid API Key' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { full_name, phone, notes } = body;

    // Minimum Required Validation
    if (!full_name || !phone) {
      return NextResponse.json(
        { success: false, error: 'full_name and phone are required fields.' },
        { status: 400 }
      );
    }

    // Initialize Supabase admin client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Check if patient already exists by phone (prevent AI duplicates)
    const { data: existingPatient, error: searchError } = await supabase
      .from('patients')
      .select('*')
      .eq('phone', phone)
      .limit(1)
      .maybeSingle();

    if (existingPatient) {
      return NextResponse.json({
        success: true,
        message: 'Patient already exists (duplicate prevented)',
        patient: existingPatient,
      }, { status: 200 });
    }

    const patientData = {
      full_name,
      phone,
      notes: notes || null, // Optional notes from the AI
      // All other fields will default to null
    };

    const { data: patient, error } = await supabase
      .from('patients')
      .insert(patientData)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Patient created successfully',
      patient,
    }, { status: 201 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
