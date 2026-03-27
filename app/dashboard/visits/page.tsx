import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Stethoscope, Plus, Clock, Syringe, Pill, User } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { deleteVisit } from '@/lib/actions/visits';

export const dynamic = 'force-dynamic';

export default async function VisitsPage({
  searchParams,
}: {
  searchParams: { patient_id?: string };
}) {
  const supabase = await createServerClient();
  const selectedPatientId = searchParams.patient_id;

  // Fetch all patients for the select filter
  const { data: patients } = await supabase
    .from('patients')
    .select('id, full_name, file_number')
    .order('full_name');

  // Fetch visits
  let query = supabase
    .from('visits')
    .select('*, patient:patients(full_name), service:services(name)')
    .order('visit_date', { ascending: false });

  if (selectedPatientId) {
    query = query.eq('patient_id', selectedPatientId);
  }

  const { data: visits } = await query;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text mb-1 flex items-center gap-2">
            <Stethoscope className="text-primary" />
            سجل زيارات المرضى
          </h1>
          <p className="text-text-muted">تتبع وعرض تفاصيل زيارات العلاج والتشخيص.</p>
        </div>
        
        <Link 
          href="/dashboard/visits/new" 
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          تسجيل زيارة
        </Link>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 mt-6">
        
        {/* Filter by Patient via Server Side searchParams */}
        <div className="mb-8 p-4 bg-surface-2 rounded-xl border border-border flex flex-col md:flex-row gap-4 items-center">
          <label className="font-bold whitespace-nowrap text-text flex items-center gap-2"><User size={18} className="text-primary"/> تصفية حسب المريض:</label>
          <form className="flex-1 flex gap-2 w-full">
            <select 
              name="patient_id" 
              defaultValue={selectedPatientId || ''} 
              className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-surface"
            >
              <option value="">-- عرض كل المرضى --</option>
              {patients?.map(p => (
                <option key={p.id} value={p.id}>{p.full_name} (ملف #{p.file_number})</option>
              ))}
            </select>
            <button type="submit" className="bg-surface text-text font-bold px-6 border border-border rounded-xl hover:bg-border transition-colors">عـرض</button>
          </form>
        </div>

        {/* Visit Cards (Timeline style) */}
        <div className="space-y-6 max-w-4xl mx-auto">
          {visits?.map((visit) => (
            <div key={visit.id} className="relative pl-6 rtl:pr-6 rtl:pl-0 border-r-2 border-primary rtl:border-r-0 rtl:border-l-2">
               <div className="absolute top-0 right-[-11px] rtl:left-[-11px] rtl:right-auto w-5 h-5 rounded-full bg-primary border-4 border-surface shadow-sm flex items-center justify-center"></div>
               
               <div className="bg-surface border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-border">
                    <div>
                      <h3 className="text-lg font-bold text-text mb-1">
                        <Link href={`/dashboard/patients/${visit.patient_id}`} className="hover:text-primary transition-colors">
                          {visit.patient?.full_name}
                        </Link>
                      </h3>
                      <p className="text-sm text-primary font-bold">{visit.service?.name}</p>
                    </div>
                    <div className="text-left flex flex-col items-end">
                      <div className="bg-surface-2 text-text font-bold px-3 py-1.5 rounded-lg text-sm border border-border flex items-center gap-2 shadow-sm">
                        <Clock size={16} className="text-text-muted"/>
                        {formatDate(visit.visit_date)}
                      </div>
                      <span className="text-xs text-text-muted mt-2 block font-medium">سُجل في {formatDate(visit.created_at)}</span>
                    </div>
                  </div>

                  {/* Body grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm mt-4">
                     {visit.diagnosis && (
                       <div>
                         <p className="text-xs text-text-muted font-bold flex items-center gap-1.5 mb-1.5"><Stethoscope size={14} className="text-danger" /> التشخيص</p>
                         <p className="font-medium">{visit.diagnosis}</p>
                       </div>
                     )}
                     {visit.treatment && (
                       <div>
                         <p className="text-xs text-text-muted font-bold flex items-center gap-1.5 mb-1.5"><Syringe size={14} className="text-warning" /> العلاج المقدم</p>
                         <p className="font-medium">{visit.treatment}</p>
                       </div>
                     )}
                     {visit.prescribed_medication && (
                       <div>
                         <p className="text-xs text-text-muted font-bold flex items-center gap-1.5 mb-1.5"><Pill size={14} className="text-success" /> الوصفة الطبية</p>
                         <p className="font-medium">{visit.prescribed_medication}</p>
                       </div>
                     )}
                     {visit.notes && (
                       <div>
                         <p className="text-xs text-text-muted font-bold flex items-center gap-1.5 mb-1.5">ملاحظات إضافية</p>
                         <p className="font-medium text-text-muted">{visit.notes}</p>
                       </div>
                     )}
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-4 bg-surface-2 -mx-5 -mb-5 px-5 py-4 border-t border-border flex justify-between items-center rounded-b-2xl">
                     <div className="flex gap-4">
                       <p className="text-sm font-bold flex items-center gap-2">المبلغ المدفوع: <span className="text-primary-dark bg-primary-light px-2 py-0.5 rounded-md">{formatCurrency(visit.amount_paid || 0)}</span></p>
                       {visit.next_appointment_date && (
                         <p className="text-sm font-bold flex items-center gap-2 text-text-muted">الموعد القادم: <span className="text-text">{formatDate(visit.next_appointment_date)}</span></p>
                       )}
                     </div>
                     <form action={async () => {
                        'use server';
                        await deleteVisit(visit.id);
                      }}>
                        <button type="submit" className="text-danger text-sm font-bold hover:underline">أرشفة / حذف</button>
                     </form>
                  </div>
               </div>
            </div>
          ))}

          {(!visits || visits.length === 0) && (
            <div className="text-center py-12 text-text-muted bg-surface-2 rounded-2xl border border-border border-dashed">
              لا توجد زيارات سابقة مسجلة {selectedPatientId ? 'لهذا المريض' : 'في النظام'}.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
