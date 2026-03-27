import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, Search, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PatientsPage() {
  const supabase = await createServerClient();

  const { data: patients } = await supabase
    .from('patients')
    .select('*, visits(id)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text mb-1 flex items-center gap-2">
            <FileText className="text-primary" />
            ملفات المرضى
          </h1>
          <p className="text-text-muted">إدارة بيانات المرضى وسجلاتهم الطبية.</p>
        </div>
        
        <Link 
          href="/dashboard/patients/new" 
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          إضافة مريض
        </Link>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 mt-6">
        {/* Search and Filter (Static for now, would be client component normally) */}
        <div className="flex gap-4 mb-6 relative">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <input 
              type="text" 
              placeholder="البحث بالاسم، رقم الهاتف، أو رقم الملف..." 
              className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-bg"
            />
          </div>
          <select className="border border-border rounded-xl px-4 py-2.5 bg-bg focus:outline-none focus:ring-2 focus:ring-primary font-medium text-text-muted">
            <option value="">كل فصائل الدم</option>
            <option value="A+">A+</option>
            <option value="O+">O+</option>
            <option value="B+">B+</option>
            <option value="AB+">AB+</option>
          </select>
        </div>

        {/* Patients Table */}
        <div className="overflow-x-auto rounded-xl border border-border bg-bg/50 text-sm">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-surface-2 text-text-muted font-medium border-b border-border">
                <th className="px-6 py-4">رقم الملف</th>
                <th className="px-6 py-4">الاسم الكامل</th>
                <th className="px-6 py-4">الهاتف</th>
                <th className="px-6 py-4">فصيلة الدم</th>
                <th className="px-6 py-4">عدد الزيارات</th>
                <th className="px-6 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {patients?.map((patient) => (
                <tr key={patient.id} className="hover:bg-surface transition-colors">
                  <td className="px-6 py-4 text-text-muted font-mono">#{patient.file_number}</td>
                  <td className="px-6 py-4 font-bold text-text">
                    <Link href={`/dashboard/patients/${patient.id}`} className="hover:text-primary transition-colors">
                      {patient.full_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{patient.phone}</td>
                  <td className="px-6 py-4">
                    {patient.blood_type ? (
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-danger/10 text-danger border border-danger/20 font-bold">
                        {patient.blood_type}
                      </span>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-primary-light text-primary-dark font-bold px-2.5 py-1 rounded-full text-xs">
                      {patient.visits?.length || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <Link 
                      href={`/dashboard/patients/${patient.id}`} 
                      className="text-primary hover:bg-primary-light px-3 py-1.5 rounded-lg transition-colors font-medium border border-transparent hover:border-primary/20"
                    >
                      عرض الملف
                    </Link>
                  </td>
                </tr>
              ))}
              {(!patients || patients.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-text-muted">
                    لا يوجد مرضى مسجلين حتى الآن.
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
