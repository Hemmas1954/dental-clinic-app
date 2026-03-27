'use server';
import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createService(formData: FormData) {
  const supabase = await createServerClient();
  
  const formEntries = Object.fromEntries(formData.entries());
  
  const serviceData = {
    name: formEntries.name as string,
    description: formEntries.description ? formEntries.description as string : null,
    price: parseFloat(formEntries.price as string),
    duration_minutes: parseInt(formEntries.duration_minutes as string),
    category: formEntries.category as string,
    is_active: formEntries.is_active === 'on' || formEntries.is_active === 'true',
  };

  const { data, error } = await supabase
    .from('services')
    .insert(serviceData)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/services');
  return data;
}

export async function updateService(id: string, formData: FormData) {
  const supabase = await createServerClient();
  
  const formEntries = Object.fromEntries(formData.entries());
  
  const serviceData = {
    name: formEntries.name as string,
    description: formEntries.description ? formEntries.description as string : null,
    price: parseFloat(formEntries.price as string),
    duration_minutes: parseInt(formEntries.duration_minutes as string),
    category: formEntries.category as string,
    is_active: formEntries.is_active === 'on' || formEntries.is_active === 'true',
  };

  const { data, error } = await supabase
    .from('services')
    .update(serviceData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/services');
  return data;
}

export async function deleteService(id: string) {
    const supabase = await createServerClient();
    
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
  
    if (error) throw new Error(error.message);
  
    revalidatePath('/dashboard/services');
}
