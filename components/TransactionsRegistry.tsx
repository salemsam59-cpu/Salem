
import React, { useState, useMemo } from 'react';
import { Transaction, Branch, Safe, Product } from '../types';

interface RegistryProps {
  transactions: Transaction[];
  branches: Branch[];
  safes: Safe[];
}

const TransactionsRegistry: React.FC<RegistryProps> = ({ transactions, branches, safes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'invoice' | 'product'>('invoice');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['date', 'id', 'type', 'entity', 'amount']);

  // Available columns for picking
  const columns = [
    { id: 'date', label: 'التاريخ' },
    { id: 'id', label: 'رقم العملية' },
    { id: 'type', label: 'النوع' },
    { id: 'entity', label: 'الجهة/العميل' },
    { id: 'branch', label: 'الفرع' },
    { id: 'safe', label: 'الخزينة' },
    { id: 'product', label: 'المنتج (في عرض الأصناف)' },
    { id: 'qty', label: 'الكمية' },
    { id: 'amount', label: 'القيمة الإجمالية' },
  ];

  // Flattening transactions to product level for "Product Movement" view
  const productMovements = useMemo(() => {
    const movements: any[] = [];
    transactions.forEach(t => {
      t.items.forEach(item => {
        movements.push({
          ...t,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.price,
          itemTotal: item.price * item.quantity
        });
      });
      if (t.items.length === 0) {
         movements.push({ ...t, productName: 'عملية مالية فقط', quantity: 0, itemTotal: t.totalAmount });
      }
    });
    return movements;
  }, [transactions]);

  const filteredData = useMemo(() => {
    const data = viewMode === 'invoice' ? transactions : productMovements;
    return data.filter(item => {
      const searchStr = searchTerm.toLowerCase();
      return (
        item.entityName?.toLowerCase().includes(searchStr) ||
        item.id.includes(searchStr) ||
        (item.productName && item.productName.toLowerCase().includes(searchStr))
      );
    });
  }, [transactions, productMovements, viewMode, searchTerm]);

  const handleExport = () => {
    const headers = columns.filter(c => selectedColumns.includes(c.id)).map(c => c.label);
    const rows = filteredData.map(item => {
      const row: any[] = [];
      if (selectedColumns.includes('date')) row.push(item.date);
      if (selectedColumns.includes('id')) row.push(item.id);
      if (selectedColumns.includes('type')) row.push(item.type);
      if (selectedColumns.includes('entity')) row.push(item.entityName || 'داخلي');
      if (selectedColumns.includes('branch')) row.push(branches.find(b => b.id === item.branchId)?.name || '-');
      if (selectedColumns.includes('safe')) row.push(safes.find(s => s.id === item.safeId)?.name || '-');
      if (selectedColumns.includes('product')) row.push(item.productName || '-');
      if (selectedColumns.includes('qty')) row.push(item.quantity || '-');
      if (selectedColumns.includes('amount')) row.push(item.totalAmount || item.itemTotal);
      return row;
    });

    const csvContent = '\ufeff' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `سجل_المنارة_${viewMode === 'invoice' ? 'فواتير' : 'أصناف'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setIsExportModalOpen(false);
  };

  const toggleColumn = (colId: string) => {
    setSelectedColumns(prev => prev.includes(colId) ? prev.filter(c => c !== colId) : [...prev, colId]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Mode Selector */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-xl font-black text-indigo-950 dark:text-indigo-100 flex items-center gap-3">
              <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
              سجل العمليات التفصيلي
            </h2>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => setViewMode('invoice')} 
                className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${viewMode === 'invoice' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
              >
                عرض الفواتير
              </button>
              <button 
                onClick={() => setViewMode('product')} 
                className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${viewMode === 'product' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
              >
                عرض حركة الأصناف
              </button>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="بحث في السجل.." 
                className="pr-10 pl-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <svg className="absolute right-3 top-3 text-slate-400" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <button onClick={() => setIsExportModalOpen(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              تصدير مخصص
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-right text-[11px] md:text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 font-black border-b dark:border-slate-800">
              <tr>
                <th className="px-6 py-5">التاريخ</th>
                <th className="px-6 py-5">الرقم</th>
                <th className="px-6 py-5">النوع</th>
                <th className="px-6 py-5">الجهة</th>
                {viewMode === 'product' && <th className="px-6 py-5 text-indigo-600">الصنف المباع/المشترى</th>}
                {viewMode === 'product' && <th className="px-6 py-5">الكمية</th>}
                <th className="px-6 py-5 text-left">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-500">{row.date}</td>
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-400">#{row.id.slice(-6)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${
                      row.type === 'sale' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                      row.type === 'purchase' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {row.type === 'sale' ? 'بيع' : row.type === 'purchase' ? 'شراء' : row.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-indigo-950 dark:text-indigo-100">{row.entityName || 'داخلي'}</td>
                  {viewMode === 'product' && <td className="px-6 py-4 font-black text-indigo-600">{row.productName}</td>}
                  {viewMode === 'product' && <td className="px-6 py-4 font-bold">{row.quantity} ق</td>}
                  <td className="px-6 py-4 text-left font-black text-indigo-950 dark:text-indigo-100">
                    {(row.totalAmount || row.itemTotal).toLocaleString()} ر.س
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Selection Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-full max-w-md shadow-2xl border dark:border-slate-800 animate-in zoom-in duration-300">
            <h3 className="text-xl font-black text-indigo-950 dark:text-indigo-100 mb-2">تخصيص تصدير البيانات</h3>
            <p className="text-xs text-slate-400 font-bold mb-8 uppercase tracking-widest">اختر الأعمدة التي تريد تضمينها في الملف</p>
            
            <div className="grid grid-cols-2 gap-3 mb-10">
              {columns.map(col => (
                <button 
                  key={col.id} 
                  onClick={() => toggleColumn(col.id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border text-[11px] font-black transition-all ${
                    selectedColumns.includes(col.id) 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20' 
                      : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedColumns.includes(col.id) ? 'border-white' : 'border-slate-200'}`}>
                    {selectedColumns.includes(col.id) && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                  {col.label}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={handleExport} className="flex-[2] bg-indigo-600 text-white py-4 rounded-[2rem] text-xs font-black shadow-xl hover:bg-indigo-700 transition-all">بدء التصدير (CSV)</button>
              <button onClick={() => setIsExportModalOpen(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 py-4 rounded-[2rem] text-xs font-black">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsRegistry;
