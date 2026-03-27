import { createServerClient } from '@/lib/supabase/server'

export type WebhookEvent = 
  | 'new_patient'
  | 'book_appointment' 
  | 'confirm_appointment'
  | 'patient_query';

export async function triggerWebhook(
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<{ success: boolean; response?: unknown; error?: string }> {
  
  const supabase = await createServerClient();
  const { data: config } = await supabase
    .from('ai_config')
    .select('*')
    .limit(1)
    .single();

  const webhookMap: Record<WebhookEvent, string | null> = {
    new_patient: config?.webhook_new_patient,
    book_appointment: config?.webhook_book_appointment,
    confirm_appointment: config?.webhook_confirm_appointment,
    patient_query: config?.webhook_patient_query,
  };

  const url = webhookMap[event];
  if (!url) return { success: false, error: 'لم يتم تكوين الـ Webhook' };

  const { data: clinicData } = await supabase
    .from('clinic_settings')
    .select('name, doctor_name')
    .limit(1)
    .single();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config?.api_key 
          ? { 'Authorization': `Bearer ${config.api_key}` } 
          : {}),
      },
      body: JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        clinic: clinicData,
        data,
      }),
    });

    const responseData = await response.json().catch(() => ({}));
    return { success: response.ok, response: responseData };

  } catch (error) {
    return { success: false, error: String(error) };
  }
}
