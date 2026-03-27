'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  Calendar, 
  Activity, 
  Stethoscope, 
  Bot, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'الرئيسية', href: '/dashboard', icon: Home },
  { name: 'ملفات المرضى', href: '/dashboard/patients', icon: Users },
  { name: 'المواعيد', href: '/dashboard/appointments', icon: Calendar },
  { name: 'الخدمات والأسعار', href: '/dashboard/services', icon: Activity },
  { name: 'زيارات المرضى', href: '/dashboard/visits', icon: Stethoscope },
  { name: 'إعدادات الذكاء الاصطناعي', href: '/dashboard/ai-settings', icon: Bot },
  { name: 'الإعدادات العامة', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-surface border-l border-border min-h-screen pt-6 pb-4 shadow-sm sticky top-0">
      <div className="flex items-center gap-3 px-6 mb-8">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Stethoscope size={24} />
        </div>
        <h1 className="text-xl font-bold text-primary">عيادة الأسنان</h1>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-2xl transition-all duration-200',
                isActive 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-text-muted hover:bg-surface-2 hover:text-primary'
              )}
            >
              <Icon 
                size={20} 
                className={cn(
                  isActive ? 'text-white' : 'text-text-muted group-hover:text-primary',
                  'transition-colors'
                )} 
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 mt-auto">
        <div className="bg-primary-light/30 rounded-2xl p-4 border border-primary-light">
          <p className="text-xs text-primary-dark font-medium leading-relaxed">
            النظام متصل بالذكاء الاصطناعي (n8n).
          </p>
        </div>
      </div>
    </div>
  );
}
