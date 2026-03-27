import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Bot, Save, Webhook, KeyRound, Activity } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AISettingsPage() {
  const supabase = await createServerClient();

  const { data: config } = await supabase
    .from('ai_config')
    .select('*')
    .limit(1)
    .single();

  async function saveSettings(formData: FormData) {
    'use server';
    const supabase = await createServerClient();
    
    // Check if we have a config row
    const { data: existing } = await supabase.from('ai_config').select('id').limit(1).single();

    const updateData = {
      webhook_new_patient: formData.get('webhook_new_patient') as string,
      webhook_book_appointment: formData.get('webhook_book_appointment') as string,
      webhook_confirm_appointment: formData.get('webhook_confirm_appointment') as string,
      webhook_patient_query: formData.get('webhook_patient_query') as string,
      api_key: formData.get('api_key') as string,
    };

    if (existing) {
      await supabase.from('ai_config').update(updateData).eq('id', existing.id);
    } else {
      await supabase.from('ai_config').insert(updateData);
    }

    revalidatePath('/dashboard/ai-settings');
  }

  // Simple test function just updating DB state for UI feedback purposes in this demo
  async function testWebhook(webhookType: string, url: string) {
    'use server';
    if (!url) return;
    try {
      // Setup payload matching the prompt
      const payload = {
        event: webhookType,
        timestamp: new Date().toISOString(),
        clinic: { name: 'عيادة الأسنان' }, // Mock for test
        data: { test: true },
      };

      const supabase = await createServerClient();
      const { data: currentConfig } = await supabase.from('ai_config').select('api_key, last_test_status, id').limit(1).single();

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentConfig?.api_key ? { 'Authorization': `Bearer ${currentConfig.api_key}` } : {}),
        },
        body: JSON.stringify(payload)
      });

      const success = response.ok;
      
      // Save test status to DB
      if (currentConfig) {
        const statuses = currentConfig.last_test_status || {};
        await supabase.from('ai_config').update({ 
          last_test_status: { ...statuses, [webhookType]: success ? 'success' : 'failed' } 
        }).eq('id', currentConfig.id);
        revalidatePath('/dashboard/ai-settings');
      }
    } catch (e) {
       console.error(e);
    }
  }

  const testStatus = config?.last_test_status || {};

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text mb-1 flex items-center gap-2">
          <Bot className="text-primary" />
          إعدادات الذكاء الاصطناعي (n8n Webhooks)
        </h1>
        <p className="text-text-muted">التحكم في نقاط الاتصال (Webhooks) لدمج مساعد الذكاء الاصطناعي مع النظام.</p>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-border p-8">
        
        <form action={saveSettings} className="space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-3">
              <KeyRound size={20} className="text-warning"/>
              المصادقة والأمان
            </h2>
            <div className="space-y-2 max-w-md">
              <label className="text-sm font-medium text-text block">API Key (Bearer Token)</label>
              <input 
                type="password" 
                name="api_key" 
                defaultValue={config?.api_key || ''}
                placeholder="اتركه فارغاً إن لم يكن مطلوباً..." 
                className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg" 
                dir="ltr" 
              />
              <p className="text-xs text-text-muted mt-1 font-medium">سيتم إرسال هذا المفتاح في ترويسة جميع الطلبات.</p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-3">
              <Webhook size={20} className="text-primary"/>
              مسارات الـ Webhooks
            </h2>
            
            <div className="space-y-5">
              
              {/* Webhook 1 */}
              <div className="bg-bg/50 p-4 rounded-xl border border-border">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                   <div className="w-56 font-bold text-sm text-text">تسجيل مريض جديد :</div>
                   <input required type="url" name="webhook_new_patient" defaultValue={config?.webhook_new_patient || ''} className="flex-1 px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-surface text-sm" dir="ltr" placeholder="https://your-n8n.com/webhook/..." />
                   
                   <div className="flex gap-2">
                     <button formAction={async () => { 'use server'; await testWebhook('new_patient', config?.webhook_new_patient || ''); }} formNoValidate className="bg-surface-2 hover:bg-border text-text px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors border border-border shrink-0">
                       <Activity size={16}/> اختبار
                     </button>
                     {testStatus['new_patient'] === 'success' && <span className="bg-success/10 text-success border border-success/20 px-3 py-2.5 rounded-xl text-sm font-bold shrink-0">✅</span>}
                     {testStatus['new_patient'] === 'failed' && <span className="bg-danger/10 text-danger border border-danger/20 px-3 py-2.5 rounded-xl text-sm font-bold shrink-0">❌</span>}
                   </div>
                </div>
              </div>

              {/* Webhook 2 */}
              <div className="bg-bg/50 p-4 rounded-xl border border-border">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                   <div className="w-56 font-bold text-sm text-text">حجز موعد :</div>
                   <input required type="url" name="webhook_book_appointment" defaultValue={config?.webhook_book_appointment || ''} className="flex-1 px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-surface text-sm" dir="ltr" placeholder="https://your-n8n.com/webhook/..." />
                   
                   <div className="flex gap-2">
                     <button formAction={async () => { 'use server'; await testWebhook('book_appointment', config?.webhook_book_appointment || ''); }} formNoValidate className="bg-surface-2 hover:bg-border text-text px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors border border-border shrink-0">
                       <Activity size={16}/> اختبار
                     </button>
                     {testStatus['book_appointment'] === 'success' && <span className="bg-success/10 text-success border border-success/20 px-3 py-2.5 rounded-xl text-sm font-bold shrink-0">✅</span>}
                     {testStatus['book_appointment'] === 'failed' && <span className="bg-danger/10 text-danger border border-danger/20 px-3 py-2.5 rounded-xl text-sm font-bold shrink-0">❌</span>}
                   </div>
                </div>
              </div>

              {/* Webhook 3 */}
              <div className="bg-bg/50 p-4 rounded-xl border border-border">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                   <div className="w-56 font-bold text-sm text-text">تأكيد موعد :</div>
                   <input required type="url" name="webhook_confirm_appointment" defaultValue={config?.webhook_confirm_appointment || ''} className="flex-1 px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-surface text-sm" dir="ltr" placeholder="https://your-n8n.com/webhook/..." />
                   
                   <div className="flex gap-2">
                     <button formAction={async () => { 'use server'; await testWebhook('confirm_appointment', config?.webhook_confirm_appointment || ''); }} formNoValidate className="bg-surface-2 hover:bg-border text-text px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors border border-border shrink-0">
                       <Activity size={16}/> اختبار
                     </button>
                     {testStatus['confirm_appointment'] === 'success' && <span className="bg-success/10 text-success border border-success/20 px-3 py-2.5 rounded-xl text-sm font-bold shrink-0">✅</span>}
                     {testStatus['confirm_appointment'] === 'failed' && <span className="bg-danger/10 text-danger border border-danger/20 px-3 py-2.5 rounded-xl text-sm font-bold shrink-0">❌</span>}
                   </div>
                </div>
              </div>

              {/* Webhook 4 */}
              <div className="bg-bg/50 p-4 rounded-xl border border-border">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                   <div className="w-56 font-bold text-sm text-text">استعلام عن مريض :</div>
                   <input required type="url" name="webhook_patient_query" defaultValue={config?.webhook_patient_query || ''} className="flex-1 px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-surface text-sm" dir="ltr" placeholder="https://your-n8n.com/webhook/..." />
                   
                   <div className="flex gap-2">
                     <button formAction={async () => { 'use server'; await testWebhook('patient_query', config?.webhook_patient_query || ''); }} formNoValidate className="bg-surface-2 hover:bg-border text-text px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors border border-border shrink-0">
                       <Activity size={16}/> اختبار
                     </button>
                     {testStatus['patient_query'] === 'success' && <span className="bg-success/10 text-success border border-success/20 px-3 py-2.5 rounded-xl text-sm font-bold shrink-0">✅</span>}
                     {testStatus['patient_query'] === 'failed' && <span className="bg-danger/10 text-danger border border-danger/20 px-3 py-2.5 rounded-xl text-sm font-bold shrink-0">❌</span>}
                   </div>
                </div>
              </div>

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
