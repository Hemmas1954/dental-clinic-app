'use server';
import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createVisit(formData: FormData) {
  const supabase = await createServerClient();
  
  const formEntries = Object.fromEntries(formData.entries());
  
  const visitData = {
    patient_id: formEntries.patient_id as string,
    appointment_id: formEntries.appointment_id ? (formEntries.appointment_id as string) : null,
    service_id: formEntries.service_id ? (formEntries.service_id as string) : null,
    visit_date: formEntries.visit_date as string,
    diagnosis: formEntries.diagnosis ? (formEntries.diagnosis as string) : null,
    treatment: formEntries.treatment ? (formEntries.treatment as string) : null,
    prescribed_medication: formEntries.prescribed_medication ? (formEntries.prescribed_medication as string) : null,
    amount_paid: formEntries.amount_paid ? parseFloat(formEntries.amount_paid as string) : null,
    next_appointment_date: formEntries.next_appointment_date ? (formEntries.next_appointment_date as string) : null,
    notes: formEntries.notes ? (formEntries.notes as string) : null,
  };

  const { data, error } = await supabase
    .from('visits')
    .insert(visitData)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/visits');
  revalidatePath(`/dashboard/patients/${visitData.patient_id}`);
  return data;
}

export async function deleteVisit(id: string) {
    const supabase = await createServerClient();
    
    const { error } = await supabase
      .from('visits')
      .delete()
      .eq('id', id);
  
    if (error) throw new Error(error.message);
  
    revalidatePath('/dashboard/visits');
}
