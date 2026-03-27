import { createServerClient } from '@/lib/supabase/server';
import { createVisit } from '@/lib/actions/visits';
import { Stethoscope, Save, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewVisitPage({
  searchParams,
}: {
  searchParams: { patient_id?: string, appointment_id?: string };
}) {
  const supabase = await createServerClient();

  const [{ data: patients }, { data: services }, { data: appointments }] = await Promise.all([
    supabase.from('patients').select('id, full_name, file_number').order('full_name'),
    supabase.from('services').select('id, name, price, duration_minutes').eq('is_active', true).order('category'),
    searchParams.patient_id 
      ? supabase.from('appointments').select('id, appointment_date, service_id').eq('patient_id', searchParams.patient_id).eq('status', 'مؤكد')
      : Promise.resolve({ data: null })
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/visits" 
          className="p-2 hover:bg-surface-2 rounded-xl transition-colors text-text-muted hover:text-text"
        >
          <ArrowRight size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <Stethoscope className="text-primary" />
            تسجيل زيارة جديدة
          </h1>
          <p className="text-text-muted">إضافة تفاصيل العلاج والتشخيص لمراجعة مريض.</p>
        </div>
      </div>

      <form action={createVisit} className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col gap-6">
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
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
            <p className="text-xs text-text-muted mt-1">تلميح: يمكنك تمرير المريض عبر الرابط مباشرة.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text">الموعد المرتبط (محجوز مسبقاً)</label>
            <select 
              name="appointment_id" 
              defaultValue={searchParams.appointment_id || ''}
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg disabled:bg-surface-2 disabled:text-text-muted"
              disabled={!searchParams.patient_id || !appointments?.length}
            >
              <option value="">-- زيارة طارئة بدون موعد --</option>
              {appointments?.map(a => (
                <option key={a.id} value={a.id}>موعد {new Date(a.appointment_date).toLocaleDateString('ar-DZ')}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text">الخدمة المقدمة <span className="text-danger">*</span></label>
            <select 
              required 
              name="service_id" 
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg"
            >
              <option value="" disabled>-- اختر الخدمة --</option>
              {services?.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text">تاريخ الزيارة <span className="text-danger">*</span></label>
            <input 
              required 
              type="datetime-local" 
              name="visit_date" 
              defaultValue={new Date().toISOString().slice(0, 16)}
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg text-left"
              dir="ltr"
            />
          </div>

          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-sm font-medium text-text">التشخيص</label>
            <textarea 
              name="diagnosis" 
              rows={2}
              placeholder="شرح حالة المريض..." 
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg resize-none"
            ></textarea>
          </div>

          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-sm font-medium text-text">العلاج المقدم</label>
            <textarea 
              name="treatment" 
              rows={2}
              placeholder="الإجراءات التي تم اتخاذها..." 
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg resize-none"
            ></textarea>
          </div>

          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-sm font-medium text-text">الأدوية الموصوفة</label>
            <textarea 
              name="prescribed_medication" 
              rows={2}
              placeholder="قائمة الأدوية وجرعاتها..." 
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg resize-none"
            ></textarea>
          </div>

          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-text">المبلغ المدفوع (دج)</label>
            <div className="relative">
               <input 
                 type="number" 
                 name="amount_paid" 
                 step="0.01"
                 placeholder="0.00"
                 className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg ltr font-mono font-medium pl-14"
                 dir="ltr"
               />
               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold text-sm">DZD</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text">تاريخ الموعد القادم (اختياري)</label>
            <input 
              type="date" 
              name="next_appointment_date" 
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg text-left"
              dir="ltr"
            />
          </div>
          
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-sm font-medium text-text">ملاحظات إضافية</label>
            <textarea 
              name="notes" 
              rows={2}
              placeholder="أية ملاحظات خاصة بهذه الزيارة..." 
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg resize-none"
            ></textarea>
          </div>

        </div>
        
        <div className="px-8 py-5 bg-surface-2 border-t border-border flex justify-end gap-3 mt-auto">
          <Link 
            href="/dashboard/visits"
            className="px-6 py-2.5 rounded-xl font-medium text-text-muted hover:bg-border transition-colors outline-none focus:ring-2 focus:ring-border"
          >
            إلغاء
          </Link>
          <button 
            type="submit"
            className="px-6 py-2.5 rounded-xl font-medium bg-primary text-white hover:bg-primary-dark transition-colors flex items-center gap-2 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <Save size={20} />
            حفظ سجل الزيارة
          </button>
        </div>
      </form>
    </div>
  );
}
