import { createServerClient } from '@/lib/supabase/server';
import { Activity, Plus, Clock, Tag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { createService, deleteService } from '@/lib/actions/services';

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
  const supabase = await createServerClient();

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('category', { ascending: true });

  const categoryColors: Record<string, string> = {
    'تشخيص': 'bg-primary-light text-primary-dark border-primary',
    'علاج': 'bg-success/10 text-success border-success',
    'تجميل': 'bg-warning/10 text-warning border-warning',
    'جراحة': 'bg-danger/10 text-danger border-danger',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text mb-1 flex items-center gap-2">
            <Activity className="text-primary" />
            الخدمات والأسعار
          </h1>
          <p className="text-text-muted">إدارة قائمة خدمات العيادة وتحديد أسعارها.</p>
        </div>
        
        {/* We use a simple details/summary tag for the "Add Service" modal without external state libs to stay server-friendly */}
        <details className="group relative">
          <summary className="list-none bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium shadow-sm hover:shadow-md cursor-pointer">
            <Plus size={20} />
            إضافة خدمة
          </summary>
          
          <div className="absolute top-full left-0 mt-2 w-[400px] z-50 bg-surface rounded-2xl shadow-xl border border-border overflow-hidden">
            <h3 className="p-4 bg-surface-2 border-b border-border font-bold text-lg">خدمة جديدة</h3>
            <form action={createService} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">اسم الخدمة *</label>
                <input required type="text" name="name" className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الوصف</label>
                <textarea name="description" rows={2} className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary outline-none resize-none"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-sm font-medium">السعر (دج) *</label>
                   <input required type="number" step="0.01" name="price" className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary outline-none" dir="ltr" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-medium">المدة (دقائق) *</label>
                   <input required type="number" name="duration_minutes" defaultValue={30} className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary outline-none" dir="ltr" />
                 </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الفئة *</label>
                <select required name="category" className="w-full px-3 py-2 rounded-lg border border-border focus:ring-2 focus:ring-primary outline-none">
                  <option value="تشخيص">تشخيص</option>
                  <option value="علاج">علاج</option>
                  <option value="تجميل">تجميل</option>
                  <option value="جراحة">جراحة</option>
                </select>
              </div>
              <div className="pt-4 border-t border-border flex justify-end gap-2 text-sm">
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors">حفظ</button>
              </div>
            </form>
          </div>
        </details>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
        {services?.map((service) => (
          <div key={service.id} className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            <div className="p-5 flex-1 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <h3 className="font-bold text-lg leading-tight text-text">{service.name}</h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap border ${categoryColors[service.category] || categoryColors['علاج']}`}>
                  {service.category}
                </span>
              </div>
              
              <p className="text-text-muted text-sm line-clamp-2 min-h-[40px]">
                {service.description || 'لا يوجد وصف متاح لهذه الخدمة.'}
              </p>
              
              <div className="flex gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-text-muted text-sm font-medium">
                  <Clock size={16} className="text-primary" />
                  {service.duration_minutes} دقيقة
                </div>
                <div className="flex items-center gap-1.5 text-text-muted text-sm font-medium">
                  <Tag size={16} className="text-warning" />
                  {formatCurrency(service.price)}
                </div>
              </div>
            </div>
            
            <div className="bg-surface-2 px-5 py-3 border-t border-border flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${service.is_active ? 'bg-success' : 'bg-danger'}`}></span>
                <span className="text-text-muted font-medium">{service.is_active ? 'نشطة' : 'متوقفة'}</span>
              </div>
              <form action={async () => {
                'use server';
                await deleteService(service.id);
              }}>
                <button type="submit" className="text-danger font-medium hover:underline text-xs">
                  حذف الخدمة
                </button>
              </form>
            </div>
          </div>
        ))}

        {(!services || services.length === 0) && (
          <div className="col-span-full text-center py-12 text-text-muted bg-surface rounded-2xl border border-border">
            لا توجد خدمات مسجلة في العيادة. أضف بعض الخدمات للبدء!
          </div>
        )}
      </div>

    </div>
  );
}
