'use server';

import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Basic redirect with error param
    return redirect('/login?error=' + encodeURIComponent(error.message));
  }

  redirect('/dashboard');
}

export async function logout() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}
