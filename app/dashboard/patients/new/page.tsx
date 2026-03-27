import { createPatient } from '@/lib/actions/patients';
import { UserPlus, Save, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function NewPatientPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/patients" 
          className="p-2 hover:bg-surface-2 rounded-xl transition-colors text-text-muted hover:text-text"
        >
          <ArrowRight size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-text flex items-center gap-2">
            <UserPlus className="text-primary" />
            مرض جديد
          </h1>
          <p className="text-text-muted">إضافة بيانات مريض جديد إلى النظام.</p>
        </div>
      </div>

      <form action={createPatient} className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-8 space-y-8">
          
          {/* Personal Info Section */}
          <section>
            <h2 className="text-lg font-bold text-primary mb-4 border-b border-border pb-2">المعلومات الشخصية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text">الاسم الكامل <span className="text-danger">*</span></label>
                <input required type="text" name="full_name" className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text">تاريخ الميلاد</label>
                <input type="date" name="date_of_birth" className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text">رقم الهاتف <span className="text-danger">*</span></label>
                <input required type="tel" name="phone" className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg text-left" dir="ltr" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text">البريد الإلكتروني</label>
                <input type="email" name="email" className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg text-left" dir="ltr" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-text">العنوان</label>
                <input type="text" name="address" className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg" />
              </div>
            </div>
          </section>

          {/* Medical Info Section */}
          <section>
            <h2 className="text-lg font-bold text-primary mb-4 border-b border-border pb-2">المعلومات الطبية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text">فصيلة الدم</label>
                <select name="blood_type" className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg" dir="ltr">
                  <option value="">غير معروف</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text">الأمراض المزمنة</label>
                <input type="text" name="chronic_diseases" placeholder="مثال: سكري، ضغط، ربو..." className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-text">حساسية ضد أدوية معينة</label>
                <input type="text" name="allergies" placeholder="مثال: حساسية البنسلين..." className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-text">ملاحظات إضافية</label>
                <textarea name="notes" rows={3} className="w-full px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg resize-none"></textarea>
              </div>
            </div>
          </section>

        </div>
        
        <div className="px-8 py-5 bg-surface-2 border-t border-border flex justify-end gap-3">
          <Link 
            href="/dashboard/patients"
            className="px-6 py-2.5 rounded-xl font-medium text-text-muted hover:bg-border transition-colors outline-none focus:ring-2 focus:ring-border"
          >
            إلغاء
          </Link>
          <button 
            type="submit"
            className="px-6 py-2.5 rounded-xl font-medium bg-primary text-white hover:bg-primary-dark transition-colors flex items-center gap-2 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <Save size={20} />
            حفظ ملف المريض
          </button>
        </div>
      </form>
    </div>
  );
}
