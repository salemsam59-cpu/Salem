
import React, { useState, useMemo } from 'react';
import { AccountingEntry, Safe, Branch } from '../types';

interface AccountingProps {
  entries: AccountingEntry[];
  onAddEntry: (entry: AccountingEntry) => void;
  safes: Safe[];
  branches: Branch[];
}

const Accounting: React.FC<AccountingProps> = ({ entries, onAddEntry, safes, branches }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<AccountingEntry>>({
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    category: 'إيجار',
    note: ''
  });

  const expenseCategories = ['إيجار', 'كهرباء ومياه', 'رواتب', 'صيانة', 'تسويق', 'شحن', 'أخرى'];
  const revenueCategories = ['مبيعات أصول', 'إيرادات استشارية', 'عوائد استثمار', 'أخرى'];

  const stats = useMemo(() => {
    const totalExpenses = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const totalRevenues = entries.filter(e => e.type === 'revenue').reduce((sum, e) => sum + e.amount, 0);
    return { totalExpenses, totalRevenues, net: totalRevenues - totalExpenses };
  }, [entries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.safeId || !formData.amount || formData.amount <= 0) return;
    onAddEntry({ ...formData as AccountingEntry, id: Math.random().toString(36).substr(2, 9) });
    setIsModalOpen(false);
  };

  const inputClass = "w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 transition-all";
  const labelClass = "block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1.5 uppercase";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
           <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center shadow-inner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
           </div>
           <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase mb-1">المصروفات العامة</p>
              <h3 className="text-xl font-black text-rose-600 dark:text-rose-400">{stats.totalExpenses.toLocaleString()} <small className="text-xs">ر.س</small></h3>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
           <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
           </div>
           <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase mb-1">إيرادات أخرى</p>
              <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400">{stats.totalRevenues.toLocaleString()} <small className="text-xs">ر.س</small></h3>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
           <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-inner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
           </div>
           <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase mb-1">الصافي المالي</p>
              <h3 className="text-xl font-black text-indigo-950 dark:text-indigo-100">{stats.net.toLocaleString()} <small className="text-xs">ر.س</small></h3>
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center transition-colors">
         <div>
            <h2 className="text-lg font-black text-indigo-950 dark:text-indigo-100">سجل القيود المالية</h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">إجمالي العمليات: {entries.length}</p>
         </div>
         <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[11px] font-black shadow-lg shadow-indigo-100 dark:shadow-indigo-950/20">إضافة قيد جديد</button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-[11px] md:text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 font-black border-b dark:border-slate-700">
              <tr>
                <th className="px-6 py-5">التاريخ</th>
                <th className="px-6 py-5">النوع</th>
                <th className="px-6 py-5">التصنيف</th>
                <th className="px-6 py-5">الملاحظات</th>
                <th className="px-6 py-5 text-left">القيمة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {entries.map(e => (
                <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">{e.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black ${e.type === 'revenue' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600'}`}>
                      {e.type === 'revenue' ? 'إيراد' : 'مصروف'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-indigo-950 dark:text-indigo-100">{e.category}</td>
                  <td className="px-6 py-4 text-slate-400 dark:text-slate-500 font-medium italic">{e.note || '-'}</td>
                  <td className={`px-6 py-4 text-left font-black text-sm ${e.type === 'revenue' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {e.amount.toLocaleString()} ر.س
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 dark:text-slate-600 font-bold">لا توجد قيود مسجلة حالياً</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-full max-w-md shadow-2xl border dark:border-slate-800 transition-colors animate-in zoom-in duration-300">
            <h3 className="text-base font-black text-indigo-950 dark:text-indigo-100 mb-6">تسجيل قيد مالي جديد</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>نوع القيد</label>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                   <button type="button" onClick={() => setFormData({...formData, type: 'expense', category: 'إيجار'})} className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${formData.type === 'expense' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-400'}`}>مصروف</button>
                   <button type="button" onClick={() => setFormData({...formData, type: 'revenue', category: 'مبيعات أصول'})} className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${formData.type === 'revenue' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm' : 'text-slate-400'}`}>إيراد</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelClass}>التاريخ</label><input type="date" className={inputClass} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                <div><label className={labelClass}>القيمة</label><input type="number" className={inputClass} value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} /></div>
              </div>
              <div>
                <label className={labelClass}>التصنيف</label>
                <select className={inputClass} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                   {(formData.type === 'expense' ? expenseCategories : revenueCategories).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                   <label className={labelClass}>الخزينة</label>
                   <select className={inputClass} required value={formData.safeId} onChange={e => setFormData({...formData, safeId: e.target.value})}>
                      <option value="">اختر..</option>
                      {safes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </select>
                </div>
                <div>
                   <label className={labelClass}>الفرع</label>
                   <select className={inputClass} required value={formData.branchId} onChange={e => setFormData({...formData, branchId: e.target.value})}>
                      <option value="">اختر..</option>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                   </select>
                </div>
              </div>
              <div><label className={labelClass}>ملاحظات</label><textarea className={`${inputClass} h-20 resize-none`} value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="تفاصيل إضافية.." /></div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3.5 rounded-2xl text-xs font-black shadow-lg shadow-indigo-100">تأكيد القيد</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 py-3.5 rounded-2xl text-xs font-black">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounting;
