import { createServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Calendar, User, Phone, MapPin, Droplet, Activity, AlertTriangle, Clock } from 'lucide-react';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerClient();
  const { id } = await params;

  // Fetch only patient first to ensure it doesn't fail due to missing relations
  const { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !patient) {
    notFound();
  }

  // Safely fetch visits (if available)
  const { data: visits, error: visitsError } = await supabase
    .from('visits')
    .select('*, service:services(name)')
    .eq('patient_id', id)
    .order('visit_date', { ascending: false });
  
  patient.visits = visitsError ? [] : visits || [];

  // Safely fetch appointments (if available)
  const { data: appointments, error: apptError } = await supabase
    .from('appointments')
    .select('*, service:services(name)')
    .eq('patient_id', id);
  
  patient.appointments = apptError ? [] : appointments || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/patients" 
          className="p-2 hover:bg-surface-2 rounded-xl transition-colors text-text-muted hover:text-text"
        >
          <ArrowRight size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text mb-1 flex items-center gap-2">
            <User className="text-primary" />
            الملف الطبي: {patient.full_name}
          </h1>
          <p className="text-text-muted">رقم الملف: #{patient.file_number} &nbsp;|&nbsp; تم التسجيل في: {formatDate(patient.created_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Info Card */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border bg-gradient-to-br from-primary/10 to-transparent">
              <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold mb-4 shadow-md">
                {patient.full_name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-text">{patient.full_name}</h2>
              <p className="text-sm text-text-muted mt-1">{patient.phone}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-text-muted mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-text-muted font-medium">العنوان</p>
                  <p className="text-sm">{patient.address || '-'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Droplet className="text-danger mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-text-muted font-medium">فصيلة الدم</p>
                  <p className="text-sm font-bold">{patient.blood_type || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Activity className="text-warning mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-text-muted font-medium">الأمراض المزمنة</p>
                  <p className="text-sm">{patient.chronic_diseases || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle className="text-danger mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-text-muted font-medium">الحساسية</p>
                  <p className="text-sm">{patient.allergies || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Tabs Content (Appointments & Visits) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Action Buttons */}
          <div className="flex gap-3 bg-surface p-4 rounded-2xl shadow-sm border border-border">
            <Link 
              href={`/dashboard/appointments/new?patient_id=${patient.id}`}
              className="flex-1 bg-primary text-white hover:bg-primary-dark transition-colors py-2.5 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <Calendar size={18} />
              حجز موعد
            </Link>
          </div>

          {/* Visits Timeline */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Clock className="text-primary" size={20} />
                سجل الزيارات
              </h2>
            </div>
            <div className="p-6">
              {patient.visits && patient.visits.length > 0 ? (
                <div className="space-y-6">
                  {patient.visits.map((visit: any, index: number) => (
                    <div key={visit.id} className="relative pl-6 rtl:pr-6 rtl:pl-0 border-r-2 border-border rtl:border-r-0 rtl:border-l-2">
                      <div className="absolute top-0 right-[-9px] rtl:left-[-9px] rtl:right-auto w-4 h-4 rounded-full bg-primary border-4 border-surface shadow-sm" />
                      <div className="bg-surface-2 rounded-xl p-4 mr-4">
                         <div className="flex justify-between items-start mb-3">
                           <div>
                              <p className="font-bold text-primary">{visit.service?.name}</p>
                              <p className="text-xs text-text-muted">{formatDate(visit.visit_date)}</p>
                           </div>
                           <div className="bg-primary-light/50 text-primary-dark px-3 py-1 rounded-lg text-sm font-bold">
                             {formatCurrency(visit.amount_paid || 0)}
                           </div>
                         </div>
                         <div className="space-y-2 text-sm">
                           {visit.diagnosis && <p><span className="font-medium">التشخيص:</span> {visit.diagnosis}</p>}
                           {visit.treatment && <p><span className="font-medium">العلاج:</span> {visit.treatment}</p>}
                           {visit.prescribed_medication && <p><span className="font-medium">الأدوية:</span> {visit.prescribed_medication}</p>}
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-muted">لا توجد زيارات سابقة لهذا المريض.</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
