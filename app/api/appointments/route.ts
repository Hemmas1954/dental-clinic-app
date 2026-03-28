import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const API_SECRET_KEY = process.env.SERVICES_API_KEY || 'dental-n8n-secret-2024';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('x-api-key');
  if (authHeader !== API_SECRET_KEY) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { phone, full_name, date, time, service_name } = body;

    if (!phone || !full_name || !date || !time) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: phone, full_name, date, time' 
      }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Find or Create Patient
    let patientId = null;
    let fileNumber = null;
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id, file_number')
      .eq('phone', phone)
      .limit(1)
      .maybeSingle();

    if (existingPatient) {
      patientId = existingPatient.id;
      fileNumber = existingPatient.file_number;
    } else {
      // Create new patient
      const { data: newPatient, error: newPatientError } = await supabase
        .from('patients')
        .insert({ full_name, phone })
        .select('id, file_number')
        .single();

      if (newPatientError) throw new Error(`Failed to create patient: ${newPatientError.message}`);
      patientId = newPatient.id;
      fileNumber = newPatient.file_number;
    }

    // 2. Resolve Service ID (Default to a basic service if not found or provided)
    let serviceId = null;
    if (service_name) {
      const { data: service } = await supabase
        .from('services')
        .select('id')
        .ilike('name', `%${service_name}%`)
        .limit(1)
        .maybeSingle();
      if (service) serviceId = service.id;
    }
    
    // If no service found, grab the first available service ID to meet foreign key requirements
    if (!serviceId) {
      const { data: defaultService } = await supabase
        .from('services')
        .select('id')
        .limit(1)
        .maybeSingle();
      serviceId = defaultService?.id || null;
    }

    if (!serviceId) {
       throw new Error("No services found in database to attach to appointment.");
    }

    // 3. Prepare Appointment Date and Check Availability
    const requestedDateTime = new Date(`${date}T${time}:00`).toISOString();
    
    const { data: existingAppts } = await supabase
      .from('appointments')
      .select('id')
      .eq('appointment_date', requestedDateTime);

    if (existingAppts && existingAppts.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'عذراً، هذا الموعد محجوز مسبقاً. يرجى اختيار وقت آخر.' 
      }, { status: 409 });
    }

    // 4. Create the Appointment
    const appointmentData = {
      patient_id: patientId,
      service_id: serviceId,
      appointment_date: requestedDateTime,
      status: 'معلق', // Pending
      doctor_notes: 'محجوز آلياً من خلال المساعد الذكي',
    };

    const { data: appointment, error: apptError } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();

    if (apptError) throw new Error(apptError.message);

    return NextResponse.json({
      success: true,
      message: 'تم حجز الموعد بنجاح!',
      appointment,
      patient_id: patientId,
      file_number: fileNumber
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
