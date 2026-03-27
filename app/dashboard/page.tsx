import { createServerClient } from '@/lib/supabase/server';
import { StatsCard } from '@/components/ui/StatsCard';
import { Users, CalendarClock, CalendarCheck, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createServerClient();
  
  // 1. Total Patients
  const { count: totalPatients } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true });

  // 2. Today's Appointments
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  
  const { count: todayAppts } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .gte('appointment_date', todayStart.toISOString())
    .lte('appointment_date', todayEnd.toISOString());

  // 3. Pending Appointments
  const { count: pendingAppts } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'معلق');

  // 4. Current Month Revenue
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  
  const { data: visits } = await supabase
    .from('visits')
    .select('amount_paid')
    .gte('visit_date', monthStart.toISOString());
    
  const monthlyRevenue = visits?.reduce((sum, visit) => sum + (visit.amount_paid || 0), 0) || 0;

  // 5. Last 5 Appointments
  const { data: recentAppts } = await supabase
    .from('appointments')
    .select('*, patient:patients(full_name), service:services(name)')
    .order('appointment_date', { ascending: false })
    .limit(5);

  // 6. Last 5 Patients
  const { data: recentPatients } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text mb-2">نظرة عامة</h1>
        <p className="text-text-muted">مرحباً بك في لوحة تحكم عيادة الأسنان.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="إجمالي المرضى" 
          value={totalPatients || 0} 
          icon={<Users size={24} />} 
        />
        <StatsCard 
          title="مواعيد اليوم" 
          value={todayAppts || 0} 
          icon={<CalendarCheck size={24} />} 
        />
        <StatsCard 
          title="مواعيد معلقة" 
          value={pendingAppts || 0} 
          icon={<CalendarClock size={24} />} 
        />
        <StatsCard 
          title="إيرادات الشهر" 
          value={formatCurrency(monthlyRevenue)} 
          icon={<TrendingUp size={24} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Appointments */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-bold">أحدث المواعيد</h2>
            <Link href="/dashboard/appointments" className="text-sm text-primary hover:underline">عرض الكل</Link>
          </div>
          <div className="divide-y divide-border">
            {recentAppts?.map((appt) => (
              <div key={appt.id} className="p-4 hover:bg-surface-2 transition-colors flex justify-between items-center">
                <div>
                  <p className="font-semibold">{appt.patient?.full_name}</p>
                  <p className="text-sm text-text-muted">{appt.service?.name}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{formatDate(appt.appointment_date)}</p>
                  <p className="text-xs text-text-muted">{formatTime(appt.appointment_date)}</p>
                </div>
              </div>
            ))}
            {(!recentAppts || recentAppts.length === 0) && (
              <div className="p-8 text-center text-text-muted">لا توجد مواعيد حديثة</div>
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-bold">أحدث المرضى المسجلين</h2>
            <Link href="/dashboard/patients" className="text-sm text-primary hover:underline">عرض الكل</Link>
          </div>
          <div className="divide-y divide-border">
            {recentPatients?.map((patient) => (
              <div key={patient.id} className="p-4 hover:bg-surface-2 transition-colors flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold">
                    {patient.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{patient.full_name}</p>
                    <p className="text-xs text-text-muted">{patient.phone}</p>
                  </div>
                </div>
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-2 text-text-muted border border-border">
                    ملف #{patient.file_number}
                  </span>
                </div>
              </div>
            ))}
            {(!recentPatients || recentPatients.length === 0) && (
              <div className="p-8 text-center text-text-muted">لا يوجد مرضى مسجلين</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
