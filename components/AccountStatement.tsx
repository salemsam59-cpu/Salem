
import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, Customer, Supplier, Safe, AccountingEntry, Branch } from '../types';

interface StatementProps {
  transactions: Transaction[];
  customers: Customer[];
  suppliers: Supplier[];
  safes: Safe[];
  branches: Branch[];
  onAddEntry: (entry: AccountingEntry) => void;
  canPrint: boolean;
  canExport: boolean;
}

const AccountStatement: React.FC<StatementProps> = ({ transactions, customers, suppliers, safes, branches, onAddEntry, canPrint, canExport }) => {
  const [selectedType, setSelectedType] = useState<'customer' | 'supplier' | 'safe'>('customer');
  const [selectedId, setSelectedId] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settleData, setSettleData] = useState({
    amount: 0,
    safeId: '',
    branchId: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const currentSelection = useMemo(() => {
    if (selectedType === 'customer') return customers.find(c => c.id === selectedId);
    if (selectedType === 'supplier') return suppliers.find(s => s.id === selectedId);
    if (selectedType === 'safe') return safes.find(s => s.id === selectedId);
    return null;
  }, [selectedType, selectedId, customers, suppliers, safes]);

  const statementData = useMemo(() => {
    if (!selectedId) return [];

    // جلب كافة المعاملات المرتبطة بالجهة المحددة
    let filtered = transactions.filter(t => {
      const matchEntity = selectedType === 'safe' ? t.safeId === selectedId : t.entityId === selectedId;
      const matchDate = (!dateRange.start || t.date >= dateRange.start) && 
                        (!dateRange.end || t.date <= dateRange.end);
      return matchEntity && matchDate;
    });

    // ترتيب الحركات زمنياً لضمان صحة الرصيد التراكمي
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningBalance = 0;
    return filtered.map(t => {
      let debit = 0; // مدين (عليه للعميل / سداد للمورد)
      let credit = 0; // دائن (له للعميل / فاتورة للمورد)

      if (selectedType === 'customer') {
        // العميل: الفواتير تزيد مديونيته (مدين)، السندات تنقصها (دائن)
        if (t.type === 'sale') debit = t.totalAmount;
        if (t.type === 'accounting') credit = t.totalAmount;
      } else if (selectedType === 'supplier') {
        // المورد: الفواتير تزيد له (دائن)، السندات تنقصها (مدين)
        if (t.type === 'purchase') credit = t.totalAmount;
        if (t.type === 'accounting') debit = t.totalAmount;
      } else if (selectedType === 'safe') {
        // الخزينة: الإيرادات تزيدها (مدين)، المصروفات تنقصها (دائن)
        const isRevenue = t.type === 'sale' || (t.type === 'accounting' && transactions.find(x => x.id === t.id)?.entityName?.includes('إيراد'));
        const isExpense = t.type === 'purchase' || t.type === 'salary' || (t.type === 'accounting' && transactions.find(x => x.id === t.id)?.entityName?.includes('مصروف'));
        
        if (isRevenue) debit = t.totalAmount;
        if (isExpense) credit = t.totalAmount;
      }

      runningBalance += (debit - credit);
      return { ...t, debit, credit, balance: runningBalance };
    });
  }, [transactions, selectedId, selectedType, dateRange]);

  const totals = useMemo(() => {
    const totalDebit = statementData.reduce((acc, curr) => acc + curr.debit, 0);
    const totalCredit = statementData.reduce((acc, curr) => acc + curr.credit, 0);
    return {
      debit: totalDebit,
      credit: totalCredit,
      final: totalDebit - totalCredit
    };
  }, [statementData]);

  const handleOpenSettle = () => {
    setSettleData({
      amount: Math.abs(totals.final),
      safeId: '',
      branchId: branches[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      note: `سداد رصيد: ${currentSelection?.name}`
    });
    setIsSettleModalOpen(true);
  };

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleData.safeId || settleData.amount <= 0) return;

    onAddEntry({
      id: `PAY-${Date.now()}`,
      date: settleData.date,
      type: selectedType === 'customer' ? 'revenue' : 'expense',
      category: 'تسوية حساب',
      amount: settleData.amount,
      safeId: settleData.safeId,
      branchId: settleData.branchId,
      note: settleData.note,
      entityId: selectedId,
      entityType: selectedType as any
    });

    setIsSettleModalOpen(false);
  };

  const exportCSV = () => {
    if (!canExport || !currentSelection) return;
    const headers = ['التاريخ', 'رقم السند', 'النوع', 'البيان', 'مدين (عليه)', 'دائن (له)', 'الرصيد'];
    const rows = statementData.map(r => [
      r.date,
      r.id,
      r.type,
      r.entityName || 'قيد مالي',
      r.debit,
      r.credit,
      r.balance
    ]);

    const csvContent = '\ufeff' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `كشف_حساب_${currentSelection.name}.csv`;
    link.click();
  };

  const inputClass = "w-full px-4 py-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 transition-all";
  const labelClass = "block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-xl font-black text-indigo-950 dark:text-indigo-100 flex items-center gap-3">
              <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
              كشف الحساب التفصيلي
            </h2>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 pr-5">مراجعة الأرصدة والديون والتحصيلات</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedId && (
              <>
                <button onClick={handleOpenSettle} className="px-5 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black hover:bg-emerald-700 shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20 transition-all flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  تسجيل سداد
                </button>
                <button onClick={exportCSV} className="px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-[10px] font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">تصدير EXCEL</button>
                <button onClick={() => window.print()} className="px-5 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 transition-all">طباعة الكشف</button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800">
          <div>
            <label className={labelClass}>نوع الحساب</label>
            <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
               <button onClick={() => { setSelectedType('customer'); setSelectedId(''); }} className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${selectedType === 'customer' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-500'}`}>عميل</button>
               <button onClick={() => { setSelectedType('supplier'); setSelectedId(''); }} className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${selectedType === 'supplier' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-500'}`}>مورد</button>
               <button onClick={() => { setSelectedType('safe'); setSelectedId(''); }} className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${selectedType === 'safe' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 dark:text-slate-500 hover:text-indigo-500'}`}>خزينة</button>
            </div>
          </div>
          <div>
            <label className={labelClass}>اختر الحساب</label>
            <select className={inputClass} value={selectedId} onChange={e => setSelectedId(e.target.value)}>
               <option value="">-- اختر من القائمة --</option>
               {selectedType === 'customer' && customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               {selectedType === 'supplier' && suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
               {selectedType === 'safe' && safes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>من تاريخ</label>
            <input type="date" className={inputClass} value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
          </div>
          <div>
            <label className={labelClass}>إلى تاريخ</label>
            <input type="date" className={inputClass} value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
          </div>
        </div>
      </div>

      {selectedId && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black mb-2 uppercase tracking-widest">إجمالي المستحقات (عليه)</p>
                <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">{totals.debit.toLocaleString()} <small className="text-xs">ر.س</small></h3>
             </div>
             <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black mb-2 uppercase tracking-widest">إجمالي المدفوعات (له)</p>
                <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{totals.credit.toLocaleString()} <small className="text-xs">ر.س</small></h3>
             </div>
             <div className={`p-6 rounded-[2rem] shadow-2xl transition-all ${totals.final >= 0 ? 'bg-indigo-600 text-white' : 'bg-rose-700 text-white'}`}>
                <p className="text-[10px] text-white/70 font-black mb-2 uppercase tracking-widest">صافي الرصيد الحالي</p>
                <div className="flex justify-between items-end">
                   <h3 className="text-2xl font-black">{Math.abs(totals.final).toLocaleString()} <small className="text-xs">ر.س</small></h3>
                   <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full">{totals.final >= 0 ? 'رصيد مدين' : 'رصيد دائن'}</span>
                </div>
             </div>
          </div>

          {/* Statement Table */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden print:border-slate-300">
             <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
                <h3 className="font-black text-indigo-950 dark:text-indigo-100">سجل حركات الحساب التفصيلي</h3>
                <span className="text-[10px] font-bold text-slate-400">بدأ الكشف من {statementData[0]?.date || 'البداية'}</span>
             </div>
             <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-right text-[11px] md:text-xs">
                   <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-black border-b dark:border-slate-700">
                      <tr>
                         <th className="px-8 py-5">التاريخ</th>
                         <th className="px-8 py-5">رقم السند</th>
                         <th className="px-8 py-5">نوع الحركة</th>
                         <th className="px-8 py-5">البيان / الوصف</th>
                         <th className="px-8 py-5 text-rose-600">مدين (عليه)</th>
                         <th className="px-8 py-5 text-emerald-600">دائن (له)</th>
                         <th className="px-8 py-5 text-left bg-indigo-50/30 dark:bg-indigo-950/20">الرصيد التراكمي</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {statementData.map((row, idx) => (
                         <tr key={idx} className="hover:bg-indigo-50/10 dark:hover:bg-indigo-900/10 transition-colors group">
                            <td className="px-8 py-4 font-bold text-slate-500 dark:text-slate-400">{row.date}</td>
                            <td className="px-8 py-4 font-mono text-[10px] text-slate-400">#{row.id.slice(-6)}</td>
                            <td className="px-8 py-4">
                               <div className="flex items-center gap-2">
                                  {row.type === 'sale' && <div className="w-2 h-2 rounded-full bg-emerald-500"></div>}
                                  {row.type === 'purchase' && <div className="w-2 h-2 rounded-full bg-rose-500"></div>}
                                  {row.type === 'accounting' && <div className="w-2 h-2 rounded-full bg-indigo-500"></div>}
                                  <span className="font-black text-[10px]">{row.type === 'sale' ? 'فاتورة مبيعات' : row.type === 'purchase' ? 'فاتورة مشتريات' : 'سند مالي'}</span>
                               </div>
                            </td>
                            <td className="px-8 py-4 font-black text-indigo-950 dark:text-indigo-100 group-hover:text-indigo-600 transition-colors">
                               {row.entityName || 'قيد تسوية نظامي'}
                            </td>
                            <td className="px-8 py-4 text-rose-600 font-bold">{row.debit > 0 ? row.debit.toLocaleString() : '-'}</td>
                            <td className="px-8 py-4 text-emerald-600 font-bold">{row.credit > 0 ? row.credit.toLocaleString() : '-'}</td>
                            <td className={`px-8 py-4 text-left font-black text-sm bg-indigo-50/10 dark:bg-indigo-950/10 ${row.balance < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                               {row.balance.toLocaleString()} ر.س
                            </td>
                         </tr>
                      ))}
                      {statementData.length === 0 && (
                        <tr><td colSpan={7} className="px-8 py-24 text-center text-slate-400 dark:text-slate-600 font-bold">لا توجد حركات مسجلة لهذا الحساب خلال الفترة المحددة</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
             <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex justify-between items-center print:hidden">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">نهاية تقرير كشف الحساب</span>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">الإجمالي الصافي: {totals.final.toLocaleString()} ر.س</span>
             </div>
          </div>
        </>
      )}

      {/* Settle Modal (Sustained from previous updates) */}
      {isSettleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-full max-w-md shadow-2xl border dark:border-slate-800 transition-colors animate-in zoom-in duration-300">
            <h3 className="text-lg font-black text-indigo-950 dark:text-indigo-100 mb-6">تسوية رصيد الحساب</h3>
            <form onSubmit={handleSettleSubmit} className="space-y-4">
              <div><label className={labelClass}>المبلغ المسدد</label><input type="number" className={inputClass} required value={settleData.amount} onChange={e => setSettleData({...settleData, amount: Number(e.target.value)})} /></div>
              <div className="grid grid-cols-2 gap-3">
                 <div><label className={labelClass}>الخزينة</label>
                    <select className={inputClass} required value={settleData.safeId} onChange={e => setSettleData({...settleData, safeId: e.target.value})}>
                       <option value="">اختر..</option>
                       {safes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                 </div>
                 <div><label className={labelClass}>الفرع</label>
                    <select className={inputClass} required value={settleData.branchId} onChange={e => setSettleData({...settleData, branchId: e.target.value})}>
                       <option value="">اختر..</option>
                       {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                 </div>
              </div>
              <div><label className={labelClass}>البيان</label><textarea className={`${inputClass} h-20 resize-none`} value={settleData.note} onChange={e => setSettleData({...settleData, note: e.target.value})} /></div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl text-xs font-black shadow-lg">تأكيد العملية</button>
                <button type="button" onClick={() => setIsSettleModalOpen(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 py-4 rounded-2xl text-xs font-black">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountStatement;
