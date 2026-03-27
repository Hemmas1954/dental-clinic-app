import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Calendar, Plus, CheckCircle, Clock, XCircle, FileCheck } from 'lucide-react';
import { formatDate, formatTime, cn } from '@/lib/utils';
import { updateAppointmentStatus } from '@/lib/actions/appointments';

export const dynamic = 'force-dynamic';

export default async function AppointmentsPage() {
  const supabase = await createServerClient();

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, patient:patients(full_name), service:services(name)')
    .order('appointment_date', { ascending: true });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'مؤكد': return <span className="bg-success/10 text-success border-success/20 border px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={14}/> مؤكد</span>;
      case 'معلق': return <span className="bg-warning/10 text-warning border-warning/20 border px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={14}/> معلق</span>;
      case 'مكتمل': return <span className="bg-primary/10 text-primary border-primary/20 border px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FileCheck size={14}/> مكتمل</span>;
      case 'ملغي': return <span className="bg-danger/10 text-danger border-danger/20 border px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><XCircle size={14}/> ملغي</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text mb-1 flex items-center gap-2">
            <Calendar className="text-primary" />
            المواعيد
          </h1>
          <p className="text-text-muted">إدارة وجدولة مواعيد المرضى.</p>
        </div>
        
        <Link 
          href="/dashboard/appointments/new" 
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          حجز موعد
        </Link>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 mt-6">
        
        {/* Filter controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select className="border border-border rounded-xl px-4 py-2.5 bg-bg focus:outline-none focus:ring-2 focus:ring-primary font-medium text-text-muted flex-1 min-w-[200px]">
            <option value="">كل الحالات</option>
            <option value="معلق">معلق</option>
            <option value="مؤكد">مؤكد</option>
            <option value="مكتمل">مكتمل</option>
            <option value="ملغي">ملغي</option>
          </select>
          <input type="date" className="border border-border rounded-xl px-4 py-2.5 bg-bg focus:outline-none focus:ring-2 focus:ring-primary font-medium text-text-muted flex-1 min-w-[200px]" />
        </div>

        {/* Appointments Table */}
        <div className="overflow-x-auto rounded-xl border border-border bg-bg/50 text-sm">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-surface-2 text-text-muted font-medium border-b border-border">
                <th className="px-6 py-4">التاريخ والوقت</th>
                <th className="px-6 py-4">المريض</th>
                <th className="px-6 py-4">الخدمة</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4 text-center">تحديث الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {appointments?.map((appt) => (
                <tr key={appt.id} className="hover:bg-surface transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-text">{formatDate(appt.appointment_date)}</div>
                    <div className="text-text-muted text-xs mt-1">{formatTime(appt.appointment_date)}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-text">
                    <Link href={`/dashboard/patients/${appt.patient_id}`} className="hover:text-primary transition-colors">
                      {appt.patient?.full_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-text-muted">{appt.service?.name}</td>
                  <td className="px-6 py-4">
                    {getStatusBadge(appt.status)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                       {appt.status === 'معلق' && (
                          <form action={async () => {
                            'use server';
                            await updateAppointmentStatus(appt.id, 'مؤكد');
                          }}>
                            <button type="submit" className="text-xs bg-success/10 text-success hover:bg-success hover:text-white px-3 py-1.5 rounded-lg border border-success/20 transition-colors font-bold">
                              تأكيد الموعد
                            </button>
                          </form>
                       )}
                       {appt.status !== 'ملغي' && appt.status !== 'مكتمل' && (
                          <form action={async () => {
                            'use server';
                            await updateAppointmentStatus(appt.id, 'ملغي');
                          }}>
                            <button type="submit" className="text-xs bg-danger/10 text-danger hover:bg-danger hover:text-white px-3 py-1.5 rounded-lg border border-danger/20 transition-colors font-bold">
                              إلغاء
                            </button>
                          </form>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
              {(!appointments || appointments.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-text-muted">
                    لا توجد مواعيد مبرمجة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
