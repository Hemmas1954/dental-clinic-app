import { createServerClient } from '@/lib/supabase/server';
import { createAppointment } from '@/lib/actions/appointments';
import { CalendarRange, Save, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: { patient_id?: string };
}) {
  const supabase = await createServerClient();

  const [{ data: patients }, { data: services }] = await Promise.all([
    supabase.from('patients').select('id, full_name, file_number').order('full_name'),
    supabase.from('services').select('id, name, price, duration_minutes').eq('is_active', true).order('category'),
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/appointments" 
          className="p-2 hover:bg-surface-2 rounded-xl transition-colors text-text-muted hover:text-text"
        >
          <ArrowRight size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <CalendarRange className="text-primary" />
            حجز موعد جديد
          </h1>
          <p className="text-text-muted">جدولة موعد لمريض في العيادة.</p>
        </div>
      </div>

      <form action={createAppointment} className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-8 space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">المريض <span className="text-danger">*</span></label>
            <select 
              required 
              name="patient_id" 
              defaultValue={searchParams.patient_id || ''}
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg"
            >
              <option value="" disabled>-- اختر المريض --</option>
              {patients?.map(p => (
                <option key={p.id} value={p.id}>{p.full_name} (ملف #{p.file_number})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text">الخدمة المطلوبة <span className="text-danger">*</span></label>
            <select 
              required 
              name="service_id" 
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg"
            >
              <option value="" disabled>-- اختر الخدمة --</option>
              {services?.map(s => (
                <option key={s.id} value={s.id}>{s.name} - {s.duration_minutes} دقيقة</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text">التاريخ <span className="text-danger">*</span></label>
              <input 
                required 
                type="datetime-local" 
                name="appointment_date" 
                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg text-left"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-text">ملاحظات الطبيب (اختياري)</label>
              <textarea 
                name="doctor_notes" 
                rows={1}
                placeholder="أية ملاحظات حول الموعد..." 
                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg resize-none"
              ></textarea>
            </div>
          </div>

        </div>
        
        <div className="px-8 py-5 bg-surface-2 border-t border-border flex justify-end gap-3">
          <Link 
            href="/dashboard/appointments"
            className="px-6 py-2.5 rounded-xl font-medium text-text-muted hover:bg-border transition-colors outline-none focus:ring-2 focus:ring-border"
          >
            إلغاء
          </Link>
          <button 
            type="submit"
            className="px-6 py-2.5 rounded-xl font-medium bg-primary text-white hover:bg-primary-dark transition-colors flex items-center gap-2 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <Save size={20} />
            تأكيد الحجز
          </button>
        </div>
      </form>
    </div>
  );
}
