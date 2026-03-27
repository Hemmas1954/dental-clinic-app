import { Stethoscope, AlertCircle } from 'lucide-react';
import { login } from '@/lib/actions/auth';

export const dynamic = 'force-dynamic';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center p-4">
      <div className="bg-surface border border-border rounded-2xl shadow-sm p-8 w-full max-w-md">
        
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
            <Stethoscope size={32} />
          </div>
          <h1 className="text-2xl font-bold text-text">تسجيل الدخول للنظام</h1>
          <p className="text-text-muted mt-2 text-center text-sm">
            يرجى إدخال بيانات الاعتماد للوصول إلى لوحة التحكم الخاصة بالعيادة.
          </p>
        </div>

        {searchParams?.error && (
          <div className="mb-6 bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium">
            <AlertCircle size={20} className="shrink-0" />
            <p>
              بيانات الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور.
              <br/>
            </p>
          </div>
        )}

        <form action={login} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">البريد الإلكتروني</label>
            <input 
              required
              name="email"
              type="email" 
              placeholder="admin@clinic.com"
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg text-left" 
              dir="ltr"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">كلمة المرور</label>
            <input 
              required
              name="password"
              type="password" 
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-bg text-left" 
              dir="ltr"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl transition-colors mt-2"
          >
            تسجيل الدخول الدخول
          </button>
        </form>

      </div>
      
      <p className="text-text-muted text-sm mt-8">
        نظام إدارة عيادة الأسنان الحديث © {new Date().getFullYear()}
      </p>
    </div>
  );
}
