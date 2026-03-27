'use server';
import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { triggerWebhook } from '@/lib/webhooks';
import { AppointmentStatus } from '@/types';

export async function createAppointment(formData: FormData) {
  const supabase = await createServerClient();
  
  const formEntries = Object.fromEntries(formData.entries());
  
  const appointmentData = {
    patient_id: formEntries.patient_id as string,
    service_id: formEntries.service_id as string,
    appointment_date: formEntries.appointment_date as string,
    doctor_notes: formEntries.doctor_notes ? formEntries.doctor_notes as string : null,
    status: 'معلق' as AppointmentStatus,
  };

  const { data, error } = await supabase
    .from('appointments')
    .insert(appointmentData)
    .select('*, patient:patients(*), service:services(*)')
    .single();

  if (error) throw new Error(error.message);

  // Trigger n8n webhook
  await triggerWebhook('book_appointment', data);

  revalidatePath('/dashboard/appointments');
  revalidatePath(`/dashboard/patients/${appointmentData.patient_id}`);
  return data;
}

export async function updateAppointmentStatus(
  id: string, 
  status: AppointmentStatus
) {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
    .select('*, patient:patients(*), service:services(*)')
    .single();

  if (error) throw new Error(error.message);

  // Trigger webhook on confirmation
  if (status === 'مؤكد') {
    await triggerWebhook('confirm_appointment', data);
  }

  revalidatePath('/dashboard/appointments');
  revalidatePath(`/dashboard/patients/${data.patient_id}`);
  return data;
}

export async function deleteAppointment(id: string) {
    const supabase = await createServerClient();
    
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
  
    if (error) throw new Error(error.message);
  
    revalidatePath('/dashboard/appointments');
}
