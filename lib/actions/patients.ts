'use server';
import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { triggerWebhook } from '@/lib/webhooks';

export async function createPatient(formData: FormData) {
  const supabase = await createServerClient();
  
  const formEntries = Object.fromEntries(formData.entries());
  const patientData = {
    full_name: formEntries.full_name as string,
    phone: formEntries.phone as string,
    email: formEntries.email ? formEntries.email as string : null,
    date_of_birth: formEntries.date_of_birth ? formEntries.date_of_birth as string : null,
    address: formEntries.address ? formEntries.address as string : null,
    blood_type: formEntries.blood_type ? formEntries.blood_type as string : null,
    chronic_diseases: formEntries.chronic_diseases ? formEntries.chronic_diseases as string : null,
    allergies: formEntries.allergies ? formEntries.allergies as string : null,
    notes: formEntries.notes ? formEntries.notes as string : null,
  };

  const { data, error } = await supabase
    .from('patients')
    .insert(patientData)
    .select()
    .single();

  if (error) {
      console.error(error);
      throw new Error(error.message);
  }

  // Trigger n8n webhook
  await triggerWebhook('new_patient', data);

  revalidatePath('/dashboard/patients');
  return data;
}

export async function updatePatient(id: string, formData: FormData) {
    const supabase = await createServerClient();
    
    const formEntries = Object.fromEntries(formData.entries());
    const patientData = {
      full_name: formEntries.full_name as string,
      phone: formEntries.phone as string,
      email: formEntries.email ? formEntries.email as string : null,
      date_of_birth: formEntries.date_of_birth ? formEntries.date_of_birth as string : null,
      address: formEntries.address ? formEntries.address as string : null,
      blood_type: formEntries.blood_type ? formEntries.blood_type as string : null,
      chronic_diseases: formEntries.chronic_diseases ? formEntries.chronic_diseases as string : null,
      allergies: formEntries.allergies ? formEntries.allergies as string : null,
      notes: formEntries.notes ? formEntries.notes as string : null,
    };
  
    const { data, error } = await supabase
      .from('patients')
      .update(patientData)
      .eq('id', id)
      .select()
      .single();
  
    if (error) throw new Error(error.message);
  
    revalidatePath('/dashboard/patients');
    revalidatePath(`/dashboard/patients/${id}`);
    return data;
}

export async function deletePatient(id: string) {
    const supabase = await createServerClient();
    
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);
  
    if (error) throw new Error(error.message);
  
    revalidatePath('/dashboard/patients');
}
