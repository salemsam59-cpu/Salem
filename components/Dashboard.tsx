
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Transaction, Supplier, Product } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  suppliers: Supplier[];
  products: Product[];
  canViewCosts: boolean;
  canViewAlerts: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, suppliers, products, canViewCosts, canViewAlerts }) => {
  const isDark = document.documentElement.classList.contains('dark');

  const stats = useMemo(() => {
    const saleTransactions = transactions.filter(t => t.type === 'sale');
    const sales = saleTransactions.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const purchases = transactions.filter(t => t.type === 'purchase').reduce((acc, curr) => acc + curr.totalAmount, 0);
    
    // حساب عدد الوجبات وتكلفة البضاعة المباعة
    let totalMeals = 0;
    let totalCOGS = 0; // Cost of Goods Sold

    saleTransactions.forEach(t => {
      t.items.forEach(item => {
        totalMeals += item.quantity;
        totalCOGS += (item.cost * item.quantity);
      });
    });

    const grossProfit = sales - totalCOGS;

    const entityActivity: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.entityName) {
        entityActivity[t.entityName] = (entityActivity[t.entityName] || 0) + t.totalAmount;
      }
    });

    const topEntities = Object.entries(entityActivity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    return { sales, purchases, net: sales - purchases, totalMeals, totalCOGS, grossProfit, topEntities };
  }, [transactions]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => {
      const totalStock = p.stocks.reduce((sum, s) => sum + s.quantity, 0);
      return totalStock <= p.minThreshold;
    }).map(p => ({
      ...p,
      currentStock: p.stocks.reduce((sum, s) => sum + s.quantity, 0)
    }));
  }, [products]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const StatCard = ({ title, val, color, icon, trend, unit = 'ر.س' }: any) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">{title}</p>
          <h3 className={`text-xl font-black ${color}`}>{val.toLocaleString()} <small className="text-[10px] font-normal">{unit}</small></h3>
        </div>
        <div className={`p-2.5 rounded-xl ${color.replace('text', 'bg')}/10 ${color} dark:bg-slate-800`}>
          {React.cloneElement(icon as React.ReactElement, { width: 20, height: 20 })}
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trend >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">مقارنة بالأمس</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* الصف الأول: المحاسبة التلقائية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          title="عدد الوجبات المباعة" 
          val={stats.totalMeals} 
          unit="وجبة"
          color="text-indigo-600 dark:text-indigo-400"
          icon={<svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>}
        />
        <StatCard 
          title="إجمالي المبيعات" 
          val={stats.sales} 
          color="text-emerald-600 dark:text-emerald-400"
          icon={<svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        />
        <StatCard 
          title="تكلفة المبيعات (COGS)" 
          val={stats.totalCOGS} 
          color="text-rose-600 dark:text-rose-400"
          icon={<svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z M3 6h18"/></svg>}
        />
        <StatCard 
          title="إجمالي الربح (Gross)" 
          val={stats.grossProfit} 
          color="text-indigo-950 dark:text-white"
          icon={<svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-indigo-950 dark:text-indigo-100 uppercase">حركة المبيعات والربحية</h3>
              <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-[9px] font-bold text-indigo-600 dark:text-indigo-400"><span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></span> المبيعات</span>
                  <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400"></span> الأرباح</span>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { name: 'السبت', sales: 4000, profit: 1200 },
                  { name: 'الأحد', sales: 3000, profit: 800 },
                  { name: 'الاثنين', sales: 5000, profit: 1500 },
                  { name: 'الثلاثاء', sales: 2780, profit: 700 },
                  { name: 'الأربعاء', sales: 1890, profit: 400 },
                  { name: 'الخميس', sales: 6390, profit: 2200 },
                  { name: 'الجمعة', sales: 3490, profit: 1100 },
                ]}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10}} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px', border: 'none', backgroundColor: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="sales" stroke="#4f46e5" fill="url(#colorSales)" strokeWidth={3} name="المبيعات" />
                  <Area type="monotone" dataKey="profit" stroke="#10b981" fill="url(#colorProfit)" strokeWidth={2} name="الأرباح" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {canViewAlerts && lowStockProducts.length > 0 && (
             <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/30 transition-all animate-in fade-in">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      تنبيهات المخزون
                   </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {lowStockProducts.map(p => (
                     <div key={p.id} className="flex justify-between items-center bg-rose-50/30 dark:bg-rose-950/10 p-3 rounded-2xl border border-rose-100/50 dark:border-rose-900/20">
                        <div className="flex flex-col">
                           <span className="text-[11px] font-black text-indigo-950 dark:text-indigo-100">{p.name}</span>
                           <span className="text-[9px] text-slate-400 font-bold uppercase">SKU: {p.sku}</span>
                        </div>
                        <div className="text-left">
                           <p className="text-[10px] font-black text-rose-600">{p.currentStock} {p.unit}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 transition-colors flex flex-col h-full">
          <h3 className="text-sm font-black text-indigo-950 dark:text-indigo-100 mb-6 uppercase">أداء الشركاء</h3>
          <div className="flex-1 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.topEntities.length > 0 ? stats.topEntities : [{name: 'لا بيانات', value: 1}]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.topEntities.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {stats.topEntities.map((ent, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="text-[10px] font-black text-slate-600 dark:text-slate-400">{ent.name}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{(ent.value).toLocaleString()} ر.س</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
