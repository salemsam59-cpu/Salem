
import React, { useState, useMemo } from 'react';
import { Transaction, Branch, Product, Customer } from '../types';

interface ReportsProps {
  transactions: Transaction[];
  branches: Branch[];
  products: Product[];
  canExport: boolean;
  canPrint: boolean;
  canViewCosts: boolean;
  canViewProfitLoss: boolean;
}

type ReportTab = 'financial' | 'profitability' | 'top_performers' | 'movement';

const Reports: React.FC<ReportsProps> = ({ 
  transactions, 
  branches, 
  products, 
  canExport, 
  canPrint, 
  canViewCosts, 
  canViewProfitLoss 
}) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('financial');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    branchId: '',
    searchTerm: ''
  });

  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchDate = (!filters.startDate || t.date >= filters.startDate) &&
                        (!filters.endDate || t.date <= filters.endDate);
      const matchBranch = !filters.branchId || t.branchId === filters.branchId;
      const matchSearch = !filters.searchTerm || 
                        t.entityName?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                        t.items.some(i => i.productName.toLowerCase().includes(filters.searchTerm.toLowerCase()));
      return matchDate && matchBranch && matchSearch;
    });
  }, [transactions, filters]);

  // Deep Profitability Analysis Engine
  const analytics = useMemo(() => {
    let totalSales = 0;
    let totalCostOfSales = 0;
    let totalPurchases = 0;
    
    const productStats: Record<string, { name: string, qty: number, revenue: number, profit: number, cost: number }> = {};
    const customerStats: Record<string, { name: string, revenue: number, profit: number, orders: number }> = {};

    filteredTransactions.forEach(t => {
      if (t.type === 'sale') {
        totalSales += t.totalAmount;
        let invoiceProfit = 0;

        t.items.forEach(item => {
          const product = products.find(p => p.id === item.productId);
          const costPrice = product?.cost || 0;
          const profit = (item.price - costPrice) * item.quantity;
          invoiceProfit += profit;
          totalCostOfSales += (costPrice * item.quantity);

          if (!productStats[item.productId]) {
            productStats[item.productId] = { name: item.productName, qty: 0, revenue: 0, profit: 0, cost: 0 };
          }
          productStats[item.productId].qty += item.quantity;
          productStats[item.productId].revenue += (item.price * item.quantity);
          productStats[item.productId].profit += profit;
        });

        if (t.entityId) {
          if (!customerStats[t.entityId]) {
            customerStats[t.entityId] = { name: t.entityName || 'عميل مجهول', revenue: 0, profit: 0, orders: 0 };
          }
          customerStats[t.entityId].revenue += t.totalAmount;
          customerStats[t.entityId].profit += invoiceProfit;
          customerStats[t.entityId].orders += 1;
        }
      } else if (t.type === 'purchase') {
        totalPurchases += t.totalAmount;
      }
    });

    return {
      totalSales,
      totalPurchases,
      grossProfit: totalSales - totalCostOfSales,
      margin: totalSales > 0 ? ((totalSales - totalCostOfSales) / totalSales) * 100 : 0,
      topProducts: Object.values(productStats).sort((a, b) => b.profit - a.profit),
      topCustomers: Object.values(customerStats).sort((a, b) => b.profit - a.profit)
    };
  }, [filteredTransactions, products]);

  const exportData = () => {
    if (!canExport) return;
    const headers = ['التاريخ', 'رقم العملية', 'النوع', 'الجهة', 'القيمة'];
    const rows = filteredTransactions.map(t => [t.date, t.id, t.type, t.entityName || 'داخلي', t.totalAmount]);
    const csvContent = '\ufeff' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Manara_Report_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  const inputClass = "w-full px-4 py-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 transition-all";
  const labelClass = "block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Filtering Engine Dashboard */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className="text-xl font-black text-indigo-950 dark:text-indigo-100 flex items-center gap-3">
              <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
              مركز التقارير والتحليلات الربحية
            </h2>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 pr-5">تحليل أداء الفروع والمنتجات والعملاء بشكل معمق</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
              {(['financial', 'profitability', 'top_performers', 'movement'] as ReportTab[]).map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)} 
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 hover:text-indigo-500'}`}
                >
                  {tab === 'financial' ? 'الأداء العام' : tab === 'profitability' ? 'الربحية' : tab === 'top_performers' ? 'المتصدرون' : 'سجل الحركة'}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {canExport && <button onClick={exportData} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black hover:bg-slate-200 transition-all">تصدير CSV</button>}
              {canPrint && <button onClick={() => window.print()} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black hover:bg-indigo-700 shadow-lg transition-all">طباعة التقرير</button>}
            </div>
          </div>
        </div>

        {/* Global Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800">
          <div>
            <label className={labelClass}>الفرع المستهدف</label>
            <select className={inputClass} value={filters.branchId} onChange={e => setFilters({...filters, branchId: e.target.value})}>
              <option value="">جميع الفروع والمراكز</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div><label className={labelClass}>من تاريخ</label><input type="date" className={inputClass} value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} /></div>
          <div><label className={labelClass}>إلى تاريخ</label><input type="date" className={inputClass} value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} /></div>
          <div><label className={labelClass}>بحث سريـع</label><input placeholder="منتج، عميل، فاتورة.." className={inputClass} value={filters.searchTerm} onChange={e => setFilters({...filters, searchTerm: e.target.value})} /></div>
        </div>
      </div>

      {/* KPI Overviews */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] text-slate-400 font-black mb-1 uppercase tracking-widest">إجمالي المبيعات المحققة</p>
          <h3 className="text-2xl font-black text-indigo-950 dark:text-indigo-100">{analytics.totalSales.toLocaleString()} <small className="text-xs">ر.س</small></h3>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] text-slate-400 font-black mb-1 uppercase tracking-widest">إجمالي تكاليف الشراء</p>
          <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">{analytics.totalPurchases.toLocaleString()} <small className="text-xs">ر.س</small></h3>
        </div>
        {canViewProfitLoss && (
          <>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] text-slate-400 font-black mb-1 uppercase tracking-widest">إجمالي الربح الصافي</p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{analytics.grossProfit.toLocaleString()} <small className="text-xs">ر.س</small></h3>
            </div>
            <div className="bg-indigo-600 p-6 rounded-[2rem] shadow-xl text-white">
              <p className="text-[10px] text-indigo-100 font-black mb-1 uppercase tracking-widest">هامش الربح التشغيلي</p>
              <h3 className="text-2xl font-black">{analytics.margin.toFixed(1)}%</h3>
            </div>
          </>
        )}
      </div>

      {/* Dynamic Content Area */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
        {activeTab === 'profitability' && canViewProfitLoss && (
          <div className="p-8 space-y-12">
            <div>
              <h3 className="text-lg font-black text-indigo-950 dark:text-indigo-100 mb-6 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                تحليل ربحية المنتجات بالتفصيل
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-[11px] md:text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-black uppercase">
                    <tr>
                      <th className="px-6 py-4">اسم المنتج</th>
                      <th className="px-6 py-4">الكمية المباعة</th>
                      <th className="px-6 py-4">الإيرادات المحققة</th>
                      <th className="px-6 py-4">صافي الربح</th>
                      <th className="px-6 py-4">كفاءة الربح (المساهمة)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {analytics.topProducts.map((p, idx) => (
                      <tr key={idx} className="hover:bg-indigo-50/10 transition-colors group">
                        <td className="px-6 py-4 font-black text-indigo-950 dark:text-indigo-100">{p.name}</td>
                        <td className="px-6 py-4 font-bold text-slate-500">{p.qty.toLocaleString()}</td>
                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{p.revenue.toLocaleString()} ر.س</td>
                        <td className="px-6 py-4 font-black text-emerald-600">+{p.profit.toLocaleString()} ر.س</td>
                        <td className="px-6 py-4">
                           <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                                style={{ width: `${Math.min(100, (p.profit / (analytics.grossProfit || 1)) * 100 * 5)}%` }}
                              ></div>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'top_performers' && (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Top Customers Card */}
            <div className="space-y-4">
              <h3 className="text-base font-black text-indigo-950 dark:text-indigo-100 uppercase tracking-widest border-b pb-4 dark:border-slate-800">أفضل العملاء (حسب الربحية)</h3>
              {analytics.topCustomers.slice(0, 5).map((c, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-indigo-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs">{idx + 1}</div>
                    <div>
                      <p className="text-xs font-black text-indigo-950 dark:text-indigo-100">{c.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold">{c.orders} عمليات مكتملة</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-emerald-600">+{c.profit.toLocaleString()} <small className="text-[8px]">ر.س</small></p>
                    <p className="text-[9px] text-slate-400 font-bold">إجمالي مبيعات: {c.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Products Card */}
            <div className="space-y-4">
              <h3 className="text-base font-black text-indigo-950 dark:text-indigo-100 uppercase tracking-widest border-b pb-4 dark:border-slate-800">أكثر المنتجات تحقيقاً للعائد</h3>
              {analytics.topProducts.slice(0, 5).map((p, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-emerald-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs">{idx + 1}</div>
                    <div>
                      <p className="text-xs font-black text-indigo-950 dark:text-indigo-100">{p.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold">مباع: {p.qty.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-indigo-600">+{p.profit.toLocaleString()} <small className="text-[8px]">ر.س</small></p>
                    <p className="text-[9px] text-slate-400 font-bold">هامش: {((p.profit / (p.revenue || 1)) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'movement' && (
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-right text-[11px] md:text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-black border-b dark:border-slate-700">
                <tr>
                  <th className="px-6 py-5">التاريخ</th>
                  <th className="px-6 py-5">رقم العملية</th>
                  <th className="px-6 py-5">النوع</th>
                  <th className="px-6 py-5">الجهة</th>
                  <th className="px-6 py-5">الفرع</th>
                  <th className="px-6 py-5 text-left">القيمة الإجمالية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredTransactions.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-500">{t.date}</td>
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-400">#{t.id.slice(-6)}</td>
                    <td className="px-6 py-4 uppercase font-black text-[9px]">
                       <span className={`px-2 py-1 rounded-md ${t.type === 'sale' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                          {t.type === 'sale' ? 'مبيعات' : t.type === 'purchase' ? 'مشتريات' : 'أخرى'}
                       </span>
                    </td>
                    <td className="px-6 py-4 font-black text-indigo-950 dark:text-indigo-100">{t.entityName || 'عملية داخلية'}</td>
                    <td className="px-6 py-4 text-slate-400 font-bold">{branches.find(b => b.id === t.branchId)?.name || 'غير محدد'}</td>
                    <td className="px-6 py-4 text-left font-black text-indigo-900 dark:text-indigo-300">{t.totalAmount.toLocaleString()} ر.س</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="p-16 text-center">
             <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
                <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-950/30 rounded-[2.5rem] flex items-center justify-center mx-auto text-indigo-600">
                   <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div>
                   <h3 className="text-2xl font-black text-indigo-950 dark:text-indigo-100">ملخص المركز المالي للفترة</h3>
                   <p className="text-sm text-slate-400 dark:text-slate-500 font-bold mt-2">
                      مراجعة عامة لأداء العمليات المالية بناءً على الفلاتر الزمنية والمكانية المختارة.
                   </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">صافي الربح التقديري</p>
                      <p className="text-2xl font-black text-emerald-600">{analytics.grossProfit.toLocaleString()} ر.س</p>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">كفاءة الهامش التشغيلي</p>
                      <p className="text-2xl font-black text-indigo-600">{analytics.margin.toFixed(2)}%</p>
                   </div>
                </div>
                <div className="pt-6 border-t dark:border-slate-800">
                   <p className="text-xs text-slate-400 font-bold">تم توليد هذا التقرير بناءً على {filteredTransactions.length} عملية موثقة.</p>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
