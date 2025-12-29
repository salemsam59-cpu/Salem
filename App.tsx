
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppView, Supplier, Customer, Warehouse, Branch, Safe, Product, Transaction, Employee, SalaryPayment, AccountingEntry, User, UserRole, PermissionAction } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Sources from './components/Sources';
import Operations from './components/Operations';
import Reports from './components/Reports';
import Employees from './components/Employees';
import Accounting from './components/Accounting';
import TransactionsRegistry from './components/TransactionsRegistry';
import AccountStatement from './components/AccountStatement';
import Login from './components/Login';
import UsersManagement from './components/UsersManagement';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('system_users');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', username: 'admin', password: '123', name: 'المدير العام', role: UserRole.ADMIN, permissions: Object.values(PermissionAction) },
      { id: '2', username: 'acc', password: '123', name: 'أحمد المحاسب', role: UserRole.ACCOUNTANT, permissions: [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.PRINT, PermissionAction.EXPORT, PermissionAction.VIEW_COSTS, PermissionAction.VIEW_ALERTS] },
      { id: '3', username: 'sales', password: '123', name: 'سارة مبيعات', role: UserRole.SALES, permissions: [PermissionAction.VIEW, PermissionAction.CREATE] },
      { id: '4', username: 'store', password: '123', name: 'خالد المستودع', role: UserRole.WAREHOUSE, permissions: [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.MANAGE_STOCKS, PermissionAction.VIEW_ALERTS] },
    ];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([{id: 'w1', name: 'المخزن الرئيسي', location: 'الرياض', manager: 'أحمد'}]);
  const [branches, setBranches] = useState<Branch[]>([{id: 'b1', name: 'فرع الوسطى', city: 'الرياض'}]);
  const [safes, setSafes] = useState<Safe[]>([{id: 's1', name: 'الخزينة الرئيسية', balance: 100000}]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
  const [accountingEntries, setAccountingEntries] = useState<AccountingEntry[]>([]);

  useEffect(() => {
    localStorage.setItem('system_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    showToast(`مرحباً بك ${user.name} في نظام المنارة`, 'info');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    setCurrentView(AppView.DASHBOARD);
  };

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ msg, type });
  };

  const hasPermission = useCallback((action: PermissionAction, view?: AppView): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === UserRole.ADMIN) return true;
    if (currentUser.permissions?.includes(action)) {
      if (!view) return true;
    }
    const rolePermissions: Record<UserRole, Partial<Record<AppView, PermissionAction[]>>> = {
      [UserRole.ADMIN]: {}, 
      [UserRole.ACCOUNTANT]: {
        [AppView.DASHBOARD]: [PermissionAction.VIEW, PermissionAction.VIEW_ALERTS],
        [AppView.ACCOUNTING]: [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.EXPORT],
        [AppView.REPORTS]: [PermissionAction.VIEW, PermissionAction.EXPORT, PermissionAction.PRINT, PermissionAction.VIEW_COSTS, PermissionAction.VIEW_PROFIT_LOSS],
        [AppView.STATEMENTS]: [PermissionAction.VIEW, PermissionAction.PRINT, PermissionAction.EXPORT],
        [AppView.REGISTRY]: [PermissionAction.VIEW],
      },
      [UserRole.SALES]: {
        [AppView.DASHBOARD]: [PermissionAction.VIEW],
        [AppView.OPERATIONS]: [PermissionAction.VIEW, PermissionAction.CREATE],
        [AppView.REGISTRY]: [PermissionAction.VIEW],
        [AppView.SOURCES]: [PermissionAction.VIEW, PermissionAction.CREATE],
      },
      [UserRole.WAREHOUSE]: {
        [AppView.DASHBOARD]: [PermissionAction.VIEW, PermissionAction.VIEW_ALERTS],
        [AppView.SOURCES]: [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.MANAGE_STOCKS],
        [AppView.OPERATIONS]: [PermissionAction.VIEW, PermissionAction.CREATE],
        [AppView.REGISTRY]: [PermissionAction.VIEW],
      }
    };
    if (!view) return false;
    const allowedActions = rolePermissions[currentUser.role][view] || [];
    return allowedActions.includes(action);
  }, [currentUser]);

  const canAccessView = useCallback((view: AppView): boolean => {
    return hasPermission(PermissionAction.VIEW, view);
  }, [hasPermission]);

  const lowStockAlertsCount = useMemo(() => {
    return products.filter(p => {
      const totalStock = p.stocks.reduce((sum, s) => sum + s.quantity, 0);
      return totalStock <= p.minThreshold;
    }).length;
  }, [products]);

  const updateEntity = (setter: any, data: any) => {
    setter((prev: any[]) => prev.map(item => item.id === data.id ? data : item));
    showToast('✨ تم تحديث البيانات بنجاح في النظام');
  };

  const deleteEntity = (setter: any, id: string) => {
    setter((prev: any[]) => prev.filter(item => item.id !== id));
    showToast('🗑️ تم حذف السجل بنجاح', 'info');
  };

  const addTransaction = (t: Transaction) => {
    if (t.type !== 'salary' && t.type !== 'accounting') {
      setProducts(prev => {
        const updatedProducts = [...prev];
        t.items.forEach(item => {
          const pIdx = updatedProducts.findIndex(p => p.id === item.productId);
          if (pIdx > -1) {
            const product = { ...updatedProducts[pIdx] };
            const newStocks = [...product.stocks];
            if (t.type === 'transfer') {
              const fromIdx = newStocks.findIndex(s => s.warehouseId === t.fromWarehouseId);
              const toIdx = newStocks.findIndex(s => s.warehouseId === t.toWarehouseId);
              if (fromIdx > -1) newStocks[fromIdx] = { ...newStocks[fromIdx], quantity: Math.max(0, newStocks[fromIdx].quantity - item.quantity) };
              if (toIdx > -1) {
                newStocks[toIdx] = { ...newStocks[toIdx], quantity: newStocks[toIdx].quantity + item.quantity };
              } else if (t.toWarehouseId) {
                newStocks.push({ warehouseId: t.toWarehouseId, quantity: item.quantity });
              }
            } else {
              const sIdx = newStocks.findIndex(s => s.warehouseId === t.warehouseId);
              const qtyChange = t.type === 'purchase' ? item.quantity : -(item.quantity + (item.lossQuantity || 0));
              if (sIdx > -1) {
                newStocks[sIdx] = { ...newStocks[sIdx], quantity: Math.max(0, newStocks[sIdx].quantity + qtyChange) };
              } else if (t.type === 'purchase' && t.warehouseId) {
                newStocks.push({ warehouseId: t.warehouseId, quantity: item.quantity });
              }
            }
            product.stocks = newStocks;
            updatedProducts[pIdx] = product;
          }
        });
        return updatedProducts;
      });
    }

    if (t.safeId) {
      setSafes(prev => prev.map(s => {
        if (s.id !== t.safeId) return s;
        let balanceChange = 0;
        if (t.type === 'sale') balanceChange = t.totalAmount;
        else if (t.type === 'purchase' || t.type === 'salary') balanceChange = -t.totalAmount;
        return { ...s, balance: s.balance + balanceChange };
      }));
    }
    setTransactions(prev => [t, ...prev]);
    showToast('✅ تم تنفيذ العملية وحفظ البيانات بنجاح');
  };

  const addAccountingEntry = (entry: AccountingEntry) => {
    setSafes(prev => prev.map(s => {
      if (s.id !== entry.safeId) return s;
      const balanceChange = entry.type === 'revenue' ? entry.amount : -entry.amount;
      return { ...s, balance: s.balance + balanceChange };
    }));
    
    const transaction: Transaction = {
      id: entry.id,
      date: entry.date,
      totalAmount: entry.amount,
      type: 'accounting',
      items: [],
      entityId: entry.entityId,
      entityName: entry.note || `${entry.type === 'revenue' ? 'إيراد' : 'مصروف'}: ${entry.category}`,
      safeId: entry.safeId,
      branchId: entry.branchId
    };

    setAccountingEntries(prev => [entry, ...prev]);
    setTransactions(prev => [transaction, ...prev]);
    showToast(`✅ تم تسجيل ${entry.type === 'revenue' ? 'سند القبض' : 'سند الصرف'} بنجاح`);
  };

  const paySalary = (payment: SalaryPayment) => {
    const transaction: Transaction = {
      id: Date.now().toString(),
      date: payment.date,
      totalAmount: payment.netSalary,
      type: 'salary',
      items: [],
      entityName: `راتب: ${payment.employeeName} (${payment.month}/${payment.year})`,
      safeId: payment.safeId
    };
    addTransaction(transaction);
    setSalaryPayments(prev => [...prev, payment]);
    showToast(`💰 تم صرف راتب ${payment.employeeName} بنجاح`);
  };

  const handleAddProduct = (p: Product) => {
    setProducts(prev => [...prev, p]);
    showToast('✅ تمت إضافة المنتج بنجاح');
  };

  const renderContent = () => {
    if (!currentUser) return null;
    if (!canAccessView(currentView)) return (
      <div className="p-10 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h3 className="text-xl font-black text-indigo-950 dark:text-indigo-100 mb-2">غير مصرح لك بالوصول</h3>
        <p className="text-sm text-slate-400 dark:text-slate-500 font-bold">عذراً، لا تمتلك صلاحية عرض هذه الصفحة بناءً على دورك الوظيفي الحالي.</p>
        <button onClick={() => setCurrentView(AppView.DASHBOARD)} className="mt-6 text-indigo-600 dark:text-indigo-400 font-black text-xs hover:underline">العودة للرئيسية</button>
      </div>
    );

    switch (currentView) {
      case AppView.DASHBOARD: return <Dashboard transactions={transactions} suppliers={suppliers} products={products} canViewCosts={hasPermission(PermissionAction.VIEW_COSTS)} canViewAlerts={hasPermission(PermissionAction.VIEW_ALERTS)} />;
      case AppView.SOURCES: return <Sources 
          currentUser={currentUser}
          hasPermission={(action) => hasPermission(action, AppView.SOURCES)}
          canViewCosts={hasPermission(PermissionAction.VIEW_COSTS)}
          suppliers={suppliers} onAddSupplier={s => { setSuppliers(p => [...p, s]); showToast('✅ تمت إضافة المورد بنجاح'); }} onUpdateSupplier={s => updateEntity(setSuppliers, s)} onDeleteSupplier={id => deleteEntity(setSuppliers, id)}
          customers={customers} onAddCustomer={c => { setCustomers(p => [...p, c]); showToast('✅ تمت إضافة العميل بنجاح'); }} onUpdateCustomer={c => updateEntity(setCustomers, c)} onDeleteCustomer={id => deleteEntity(setCustomers, id)}
          warehouses={warehouses} onAddWarehouse={w => { setWarehouses(p => [...p, w]); showToast('✅ تمت إضافة المخزن بنجاح'); }} onUpdateWarehouse={w => updateEntity(setWarehouses, w)} onDeleteWarehouse={id => deleteEntity(setWarehouses, id)}
          branches={branches} onAddBranch={b => { setBranches(p => [...p, b]); showToast('✅ تمت إضافة الفرع بنجاح'); }} onUpdateBranch={b => updateEntity(setBranches, b)} onDeleteBranch={id => deleteEntity(setBranches, id)}
          safes={safes} onAddSafe={s => { setSafes(p => [...p, s]); showToast('✅ تمت إضافة الخزينة بنجاح'); }} onUpdateSafe={s => updateEntity(setSafes, s)} onDeleteSafe={id => deleteEntity(setSafes, id)}
          products={products} onAddProduct={handleAddProduct} onUpdateProduct={p => updateEntity(setProducts, p)} onDeleteProduct={id => deleteEntity(setProducts, id)}
        />;
      case AppView.OPERATIONS: return <Operations 
          transactions={transactions} 
          products={products} 
          customers={customers} 
          suppliers={suppliers} 
          warehouses={warehouses} 
          branches={branches} 
          safes={safes} 
          onAdd={addTransaction} 
          onAddProduct={handleAddProduct}
          currentUser={currentUser} 
        />;
      case AppView.ACCOUNTING: return <Accounting 
          entries={accountingEntries} 
          onAddEntry={addAccountingEntry} 
          safes={safes} 
          branches={branches} 
        />;
      case AppView.REGISTRY: return <TransactionsRegistry transactions={transactions} branches={branches} safes={safes} />;
      case AppView.STATEMENTS: return <AccountStatement 
          transactions={transactions} 
          customers={customers} 
          suppliers={suppliers} 
          safes={safes} 
          branches={branches}
          onAddEntry={addAccountingEntry}
          canPrint={hasPermission(PermissionAction.PRINT, AppView.STATEMENTS)}
          canExport={hasPermission(PermissionAction.EXPORT, AppView.STATEMENTS)}
        />;
      case AppView.REPORTS: return <Reports 
          transactions={transactions} 
          branches={branches} 
          products={products}
          canExport={hasPermission(PermissionAction.EXPORT, AppView.REPORTS)}
          canPrint={hasPermission(PermissionAction.PRINT, AppView.REPORTS)}
          canViewCosts={hasPermission(PermissionAction.VIEW_COSTS)}
          canViewProfitLoss={hasPermission(PermissionAction.VIEW_PROFIT_LOSS)}
        />;
      case AppView.EMPLOYEES: return <Employees 
          employees={employees} 
          onAddEmployee={e => { setEmployees(p => [...p, e]); showToast('✅ تمت إضافة الموظف بنجاح'); }}
          onUpdateEmployee={e => updateEntity(setEmployees, e)}
          onDeleteEmployee={id => deleteEntity(setEmployees, id)}
          salaryPayments={salaryPayments}
          onPaySalary={paySalary}
          safes={safes}
          branches={branches}
        />;
      case AppView.USERS_MANAGEMENT: return <UsersManagement 
          users={users} 
          onAddUser={u => { setUsers(p => [...p, u]); showToast('✅ تمت إضافة المستخدم بنجاح'); }}
          onUpdateUser={u => { setUsers(p => p.map(x => x.id === u.id ? u : x)); showToast('✅ تم تحديث بيانات المستخدم'); }}
          onDeleteUser={id => { setUsers(p => p.filter(x => x.id !== id)); showToast('🗑️ تم حذف المستخدم'); }}
        />;
      default: return <Dashboard transactions={transactions} suppliers={suppliers} products={products} canViewCosts={hasPermission(PermissionAction.VIEW_COSTS)} canViewAlerts={hasPermission(PermissionAction.VIEW_ALERTS)} />;
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-['Cairo'] text-[11px] md:text-sm transition-colors duration-300">
      <Sidebar currentUser={currentUser} canAccessView={canAccessView} onLogout={handleLogout} activeView={currentView} setView={setCurrentView} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      
      {toast && (
        <div className="fixed bottom-6 left-6 z-[200] animate-in slide-in-from-left duration-300">
           <div className={`px-6 py-4 rounded-[1.5rem] shadow-2xl flex items-center gap-3 border ${
             toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 
             toast.type === 'info' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-rose-600 text-white border-rose-500'
           }`}>
             <span className="text-xl">
               {toast.type === 'success' ? '✅' : toast.type === 'info' ? 'ℹ️' : '⚠️'}
             </span>
             <p className="text-xs font-black">{toast.msg}</p>
           </div>
        </div>
      )}

      <main className="flex-1 p-2 md:p-4 overflow-y-auto">
        <header className="flex justify-between items-center mb-6 bg-white dark:bg-slate-900 p-4 md:p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100 dark:shadow-indigo-950/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
             </div>
             <div>
                <h1 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1.5">نظام المنارة الذكي</h1>
                <h2 className="text-lg font-black text-indigo-950 dark:text-indigo-100 leading-none">ERP v2.2 Pro</h2>
             </div>
          </div>
          <div className="flex items-center gap-4">
            {hasPermission(PermissionAction.VIEW_ALERTS) && (
               <div className="relative cursor-pointer group" onClick={() => setCurrentView(AppView.SOURCES)}>
                 <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border dark:border-slate-700 transition-all ${lowStockAlertsCount > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                 </div>
                 {lowStockAlertsCount > 0 && (
                   <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900 animate-bounce">
                     {lowStockAlertsCount}
                   </span>
                 )}
                 <div className="absolute top-12 left-0 w-32 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-xl border dark:border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none transition-all text-center z-50">
                    <p className="text-[9px] font-black text-slate-500">تنبيهات المخزون</p>
                    <p className="text-[10px] font-black text-rose-600">{lowStockAlertsCount} نواقص مكتشفة</p>
                 </div>
               </div>
            )}
            <div className="flex flex-col items-end text-right hidden sm:flex">
               <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none mb-1">
                 {currentUser.role === UserRole.ADMIN ? 'المدير العام' : currentUser.role === UserRole.ACCOUNTANT ? 'المحاسب المعتمد' : currentUser.role === UserRole.SALES ? 'مسؤول مبيعات' : 'أمين مستودع'}
               </span>
               <span className="text-xs font-black text-slate-700 dark:text-slate-300">{currentUser.name}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black border dark:border-slate-700">
               {currentUser.name.charAt(0)}
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
