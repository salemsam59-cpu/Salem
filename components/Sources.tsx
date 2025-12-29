
import React, { useState, useRef } from 'react';
import { Supplier, Customer, Warehouse, Branch, Safe, Product, WarehouseStock, User, UserRole, PermissionAction } from '../types';

interface SourcesProps {
  currentUser: User;
  hasPermission: (action: PermissionAction) => boolean;
  canViewCosts: boolean;
  suppliers: Supplier[]; onAddSupplier: (s: Supplier) => void; onUpdateSupplier: (s: Supplier) => void; onDeleteSupplier: (id: string) => void;
  customers: Customer[]; onAddCustomer: (c: Customer) => void; onUpdateCustomer: (c: Customer) => void; onDeleteCustomer: (id: string) => void;
  warehouses: Warehouse[]; onAddWarehouse: (w: Warehouse) => void; onUpdateWarehouse: (w: Warehouse) => void; onDeleteWarehouse: (id: string) => void;
  branches: Branch[]; onAddBranch: (b: Branch) => void; onUpdateBranch: (b: Branch) => void; onDeleteBranch: (id: string) => void;
  safes: Safe[]; onAddSafe: (s: Safe) => void; onUpdateSafe: (s: Safe) => void; onDeleteSafe: (id: string) => void;
  products: Product[]; onAddProduct: (p: Product) => void; onUpdateProduct: (p: Product) => void; onDeleteProduct: (id: string) => void;
}

type TabType = 'suppliers' | 'customers' | 'warehouses' | 'branches' | 'safes' | 'products';

const Sources: React.FC<SourcesProps> = (props) => {
  const { hasPermission } = props;
  const [activeTab, setActiveTab] = useState<TabType>('suppliers');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canCreate = hasPermission(PermissionAction.CREATE);
  const canUpdate = hasPermission(PermissionAction.UPDATE);

  const handleOpenModal = (item?: any) => {
    if (item && !canUpdate) return;
    if (!item && !canCreate) return;
    setEditingItem(item || null);
    setFormData(item ? { ...item } : { itemsPerBox: 1, minThreshold: 5, unit: 'قطعة', packaging: 'مفرد' });
    setIsModalOpen(true);
  };

  const handleImportClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').map(row => row.split(','));
      const headers = rows[0];
      const items = rows.slice(1).map(row => {
        const obj: any = {};
        headers.forEach((h, i) => obj[h.trim()] = row[i]?.trim());
        return obj;
      }).filter(i => Object.values(i).some(v => v));
      
      setImportPreview(items);
      setIsImportModalOpen(true);
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    importPreview.forEach(item => {
      const data = {
        id: Math.random().toString(36).substr(2, 9),
        name: item.name || item['الاسم'] || 'سجل مستورد',
        ...item
      };
      if (activeTab === 'products') {
        props.onAddProduct({ ...data, price: Number(item.price || 0), cost: Number(item.cost || 0), stocks: [], branchId: props.branches[0]?.id || '' });
      } else if (activeTab === 'customers') {
        props.onAddCustomer(data);
      } else if (activeTab === 'suppliers') {
        props.onAddSupplier({ ...data, rating: 5 });
      }
    });
    setIsImportModalOpen(false);
    setImportPreview([]);
    alert(`تم استيراد ${importPreview.length} سجل بنجاح!`);
  };

  const tabs = [
    { id: 'suppliers', label: 'الموردين', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8' },
    { id: 'customers', label: 'العملاء', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8' },
    { id: 'warehouses', label: 'المخازن', icon: 'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z' },
    { id: 'branches', label: 'الفروع', icon: 'M3 21h18 M3 7l9-4 9 4v14H3V7zm4 14v-7h4v7m4 0v-7h4v7' },
    { id: 'safes', label: 'الخزائن', icon: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v12' },
    { id: 'products', label: 'الأصناف', icon: 'M21 8l-2-2H5L3 8 M21 8v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8' },
  ];

  const inputClass = "w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 transition-all";
  const labelClass = "block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider pr-1";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 p-2 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 transition-colors">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-[11px] font-black transition-all duration-300 ${
              activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d={tab.icon} /></svg>
            <span className="hidden lg:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center bg-slate-50/30 dark:bg-slate-800/20 gap-4">
          <h2 className="text-lg font-black text-indigo-950 dark:text-indigo-100 flex items-center gap-3">
            <span className="w-2 h-7 bg-indigo-600 rounded-full"></span>
            إدارة {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          <div className="flex gap-3">
             <input type="file" ref={fileInputRef} onChange={handleImportClick} className="hidden" accept=".csv" />
             <button onClick={() => fileInputRef.current?.click()} className="px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-[10px] font-black hover:bg-slate-200 transition-all flex items-center gap-2 border dark:border-slate-700">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                استيراد ذكي
             </button>
             {canCreate && <button onClick={() => handleOpenModal()} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-indigo-950/20">إضافة سجل جديد</button>}
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-right text-[11px] md:text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-black border-b dark:border-slate-800">
               <tr>
                  <th className="px-8 py-5">الاسم / البيان</th>
                  <th className="px-8 py-5">المعلومات المرجعية</th>
                  <th className="px-8 py-5 text-left">التحكم</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {(props as any)[activeTab].map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="px-8 py-4">
                     <div className="flex flex-col">
                        <span className="font-black text-indigo-950 dark:text-indigo-100">{item.name}</span>
                        {item.sku && <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">SKU: {item.sku}</span>}
                     </div>
                  </td>
                  <td className="px-8 py-4">
                     <span className="text-slate-500 dark:text-slate-400 font-bold">
                        {item.phone || item.location || item.city || (item.price ? `${item.price} ر.س` : '-')}
                     </span>
                  </td>
                  <td className="px-8 py-4 text-left">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => handleOpenModal(item)} className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                       <button onClick={() => (props as any)[`onDelete${activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}`](item.id)} className="p-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Preview Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl border dark:border-slate-800 transition-colors animate-in zoom-in duration-300 overflow-hidden">
             <h3 className="text-xl font-black text-indigo-950 dark:text-indigo-100 mb-2">مراجعة بيانات الاستيراد</h3>
             <p className="text-xs text-slate-400 font-bold mb-6 uppercase tracking-widest pr-1">تم العثور على {importPreview.length} سجل في الملف</p>
             
             <div className="max-h-[300px] overflow-y-auto mb-8 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-right text-[10px]">
                   <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0">
                      <tr>{Object.keys(importPreview[0] || {}).map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {importPreview.slice(0, 10).map((row, i) => (
                         <tr key={i}>{Object.values(row).map((v: any, j) => <td key={j} className="px-4 py-2">{v}</td>)}</tr>
                      ))}
                   </tbody>
                </table>
             </div>

             <div className="flex gap-4">
                <button onClick={confirmImport} className="flex-[2] bg-indigo-600 text-white py-4 rounded-[2rem] text-xs font-black shadow-xl hover:bg-indigo-700 transition-all">تأكيد الاستيراد النهائي</button>
                <button onClick={() => setIsImportModalOpen(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 py-4 rounded-[2rem] text-xs font-black">إلغاء</button>
             </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-full max-w-lg shadow-2xl border dark:border-slate-800 transition-colors animate-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-black text-indigo-950 dark:text-indigo-100 mb-6">{editingItem ? 'تحديث السجل المختار' : 'إضافة سجل جديد'}</h3>
            <form onSubmit={(e) => {
               e.preventDefault();
               const id = editingItem ? editingItem.id : Math.random().toString(36).substr(2, 9);
               const data = { ...formData, id };
               if (editingItem) {
                 switch (activeTab) {
                   case 'suppliers': props.onUpdateSupplier(data); break;
                   case 'customers': props.onUpdateCustomer(data); break;
                   case 'warehouses': props.onUpdateWarehouse(data); break;
                   case 'branches': props.onUpdateBranch(data); break;
                   case 'safes': props.onUpdateSafe({ ...data, balance: Number(data.balance) }); break;
                   case 'products': props.onUpdateProduct({ ...data, price: Number(data.price), cost: Number(data.cost || 0) }); break;
                 }
               } else {
                 switch (activeTab) {
                   case 'suppliers': props.onAddSupplier({ ...data, rating: 5 }); break;
                   case 'customers': props.onAddCustomer(data); break;
                   case 'warehouses': props.onAddWarehouse(data); break;
                   case 'branches': props.onAddBranch(data); break;
                   case 'safes': props.onAddSafe({ ...data, balance: Number(data.balance || 0) }); break;
                   case 'products': props.onAddProduct({ ...data, price: Number(data.price || 0), cost: Number(data.cost || 0), stocks: [] }); break;
                 }
               }
               setIsModalOpen(false);
            }} className="space-y-4">
              <div><label className={labelClass}>الاسم الكامل / الوصف</label><input className={inputClass} required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              
              {activeTab === 'products' && (
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelClass}>كود المنتج SKU</label><input className={inputClass} required value={formData.sku || ''} onChange={e => setFormData({...formData, sku: e.target.value})} /></div>
                  <div><label className={labelClass}>وحدة القياس</label><input className={inputClass} value={formData.unit || ''} onChange={e => setFormData({...formData, unit: e.target.value})} /></div>
                </div>
              )}

              {activeTab === 'products' && (
                <div className="grid grid-cols-3 gap-3">
                  <div><label className={labelClass}>سعر البيع</label><input type="number" className={inputClass} required value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
                  <div><label className={labelClass}>التكلفة</label><input type="number" className={inputClass} required value={formData.cost || ''} onChange={e => setFormData({...formData, cost: e.target.value})} /></div>
                  <div><label className={labelClass}>حد الطلب</label><input type="number" className={inputClass} required value={formData.minThreshold || ''} onChange={e => setFormData({...formData, minThreshold: e.target.value})} /></div>
                </div>
              )}

              {(activeTab === 'customers' || activeTab === 'suppliers') && (
                <div><label className={labelClass}>رقم الهاتف</label><input className={inputClass} value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
              )}

              {activeTab === 'safes' && (
                <div><label className={labelClass}>الرصيد الافتتاحي</label><input type="number" className={inputClass} value={formData.balance || ''} onChange={e => setFormData({...formData, balance: e.target.value})} /></div>
              )}

              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-[2] bg-indigo-600 text-white py-4 rounded-[2rem] text-xs font-black shadow-xl hover:bg-indigo-700 transition-all">حفظ البيانات</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 py-4 rounded-[2rem] text-xs font-black">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sources;
