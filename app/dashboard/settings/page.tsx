import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Settings, Save, Home, User, Phone, MapPin, Mail } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ClinicSettingsPage() {
  const supabase = await createServerClient();

  const { data: config } = await supabase
    .from('clinic_settings')
    .select('*')
    .limit(1)
    .single();

  async function saveSettings(formData: FormData) {
    'use server';
    const supabase = await createServerClient();
    
    // Check if we have a config row
    const { data: existing } = await supabase.from('clinic_settings').select('id').limit(1).single();

    const updateData = {
      name: formData.get('name') as string,
      doctor_name: formData.get('doctor_name') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      email: formData.get('email') as string,
    };

    if (existing) {
      await supabase.from('clinic_settings').update(updateData).eq('id', existing.id);
    } else {
      await supabase.from('clinic_settings').insert(updateData);
    }

    revalidatePath('/dashboard/settings');
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text mb-1 flex items-center gap-2">
          <Settings className="text-primary" />
          الإعدادات العامة للعيادة
        </h1>
        <p className="text-text-muted">إدارة معلومات العيادة، أوقات العمل، والبيانات الأساسية.</p>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
        
        <form action={saveSettings} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text flex items-center gap-1.5"><Home size={16} className="text-text-muted"/> اسم العيادة</label>
              <input 
                required
                type="text" 
                name="name" 
                defaultValue={config?.name || ''}
                className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text flex items-center gap-1.5"><User size={16} className="text-text-muted"/> اسم الطبيب المعالج</label>
              <input 
                required
                type="text" 
                name="doctor_name" 
                defaultValue={config?.doctor_name || ''}
                className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text flex items-center gap-1.5"><Phone size={16} className="text-text-muted"/> رقم هاتف العيادة</label>
              <input 
                type="tel" 
                name="phone" 
                defaultValue={config?.phone || ''}
                className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg text-left" 
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text flex items-center gap-1.5"><Mail size={16} className="text-text-muted"/> البريد الإلكتروني</label>
              <input 
                type="email" 
                name="email" 
                defaultValue={config?.email || ''}
                className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg text-left" 
                dir="ltr"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-text flex items-center gap-1.5"><MapPin size={16} className="text-text-muted"/> عنوان العيادة بالتفصيل</label>
              <input 
                type="text" 
                name="address" 
                defaultValue={config?.address || ''}
                className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg" 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-border flex justify-end">
             <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm">
                <Save size={20}/> حفظ الإعدادات
             </button>
          </div>
        </form>

      </div>
    </div>
  );
}
