
import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, Product, Customer, Supplier, Warehouse, Branch, Safe, TransactionItem, User, UserRole } from '../types';

interface OpsProps {
  transactions: Transaction[]; 
  products: Product[]; 
  customers: Customer[];
  suppliers: Supplier[]; 
  warehouses: Warehouse[]; 
  branches: Branch[]; 
  safes: Safe[];
  onAdd: (t: Transaction) => void;
  onAddProduct: (p: Product) => void;
  currentUser: User;
}

const Operations: React.FC<OpsProps> = ({ 
  transactions, products, customers, suppliers, warehouses, branches, safes, onAdd, onAddProduct, currentUser 
}) => {
  const [type, setType] = useState<'sale' | 'purchase' | 'loss' | 'transfer'>('sale');
  const [isReviewing, setIsReviewing] = useState(false);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  
  const allowedTypes = useMemo(() => {
    if (currentUser.role === UserRole.ADMIN) return ['sale', 'purchase', 'loss', 'transfer'];
    if (currentUser.role === UserRole.SALES) return ['sale'];
    if (currentUser.role === UserRole.WAREHOUSE) return ['transfer', 'loss'];
    return [];
  }, [currentUser]);

  useEffect(() => {
    if (!allowedTypes.includes(type)) {
      setType(allowedTypes[0] as any);
    }
  }, [allowedTypes, type]);

  const [header, setHeader] = useState({
    date: new Date().toISOString().split('T')[0],
    branchId: '',
    warehouseId: '',
    fromWarehouseId: '',
    toWarehouseId: '',
    entityId: '',
    safeId: ''
  });

  const [itemInput, setItemInput] = useState({
    productId: '',
    boxQty: 0,
    pieceQty: 0,
    totalQty: 0,
    price: 0,
    cost: 0,
    lossQuantity: 0
  });

  const [draftItems, setDraftItems] = useState<TransactionItem[]>([]);
  const [newProductForm, setNewProductForm] = useState<Partial<Product>>({
    name: '',
    sku: '',
    price: 0,
    cost: 0,
    unit: 'قطعة',
    itemsPerBox: 1,
    minThreshold: 5
  });

  const selectedProduct = products.find(p => p.id === itemInput.productId);

  useEffect(() => {
    if (selectedProduct) {
      const perBox = selectedProduct.itemsPerBox || 1;
      const total = (itemInput.boxQty * perBox) + itemInput.pieceQty;
      setItemInput(prev => ({ 
        ...prev, 
        totalQty: total, 
        price: prev.price || selectedProduct.price,
        cost: selectedProduct.cost || 0
      }));
    }
  }, [itemInput.boxQty, itemInput.pieceQty, selectedProduct]);

  const totalInvoiceAmount = useMemo(() => 
    draftItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  , [draftItems]);

  const totalInvoiceCost = useMemo(() => 
    draftItems.reduce((sum, item) => sum + (item.cost * item.quantity), 0)
  , [draftItems]);

  const handleAddItem = () => {
    if (!selectedProduct || itemInput.totalQty <= 0) return;

    const newItem: TransactionItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: itemInput.totalQty,
      boxQuantity: itemInput.boxQty,
      pieceQuantity: itemInput.pieceQty,
      price: type === 'sale' || type === 'purchase' ? Number(itemInput.price) : 0,
      cost: selectedProduct.cost || 0,
      unit: selectedProduct.unit,
      packaging: selectedProduct.packaging
    };

    setDraftItems([...draftItems, newItem]);
    setItemInput({ productId: '', boxQty: 0, pieceQty: 0, totalQty: 0, price: 0, cost: 0, lossQuantity: 0 });
  };

  const removeItem = (index: number) => {
    setDraftItems(draftItems.filter((_, i) => i !== index));
  };

  const handleFinalConfirm = () => {
    const entityName = type === 'sale' 
      ? customers.find(c => c.id === header.entityId)?.name 
      : suppliers.find(s => s.id === header.entityId)?.name;

    onAdd({
      ...header,
      id: Date.now().toString(),
      type,
      items: draftItems,
      totalAmount: totalInvoiceAmount,
      totalCost: totalInvoiceCost,
      entityName: entityName || (type === 'transfer' ? 'تحويل مخزني' : 'عملية داخلية')
    });

    setDraftItems([]);
    setHeader({ ...header, entityId: '', safeId: '' });
    setIsReviewing(false);
  };

  const inputClass = "w-full px-3 py-2 text-[10px] md:text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 transition-all";
  const labelClass = "block text-[8px] font-black text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wider";

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        {/* شريط معلومات الفاتورة العلوي */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-full lg:w-auto">
            {allowedTypes.map(t => (
              <button key={t} onClick={() => { setType(t as any); setDraftItems([]); }} className={`flex-1 lg:px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${type === t ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-md' : 'text-slate-500'}`}>
                {t === 'sale' ? 'بيع' : t === 'purchase' ? 'شراء' : t === 'loss' ? 'تالف' : 'تحويل'}
              </button>
            ))}
          </div>
          <div className="text-left bg-indigo-50 dark:bg-indigo-950/30 px-6 py-3 rounded-[1.5rem] border border-indigo-100 dark:border-indigo-900/50 min-w-[200px]">
            <span className="text-[9px] text-indigo-400 font-black block mb-0.5 uppercase tracking-tighter">إجمالي الفاتورة الحالي</span>
            <span className="text-xl font-black text-indigo-950 dark:text-indigo-100">{totalInvoiceAmount.toLocaleString()} ر.س</span>
          </div>
        </div>

        <form onSubmit={e => { e.preventDefault(); if (draftItems.length > 0) setIsReviewing(true); }} className="space-y-6">
          {/* إعدادات الفاتورة العامة */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800">
            <div><label className={labelClass}>التاريخ</label><input type="date" className={inputClass} value={header.date} onChange={e => setHeader({...header, date: e.target.value})} /></div>
            {type !== 'transfer' ? (
              <>
                <div><label className={labelClass}>الفرع</label>
                  <select className={inputClass} required value={header.branchId} onChange={e => setHeader({...header, branchId: e.target.value})}>
                    <option value="">اختر الفرع..</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div><label className={labelClass}>المستودع</label>
                  <select className={inputClass} required value={header.warehouseId} onChange={e => setHeader({...header, warehouseId: e.target.value})}>
                    <option value="">اختر المستودع..</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div><label className={labelClass}>من مخزن</label>
                  <select className={inputClass} required value={header.fromWarehouseId} onChange={e => setHeader({...header, fromWarehouseId: e.target.value})}>
                    <option value="">اختر..</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div><label className={labelClass}>إلى مخزن</label>
                  <select className={inputClass} required value={header.toWarehouseId} onChange={e => setHeader({...header, toWarehouseId: e.target.value})}>
                    <option value="">اختر..</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </>
            )}
            {(type === 'sale' || type === 'purchase') && (
              <>
                <div><label className={labelClass}>{type === 'sale' ? 'العميل' : 'المورد'}</label>
                  <select className={inputClass} required value={header.entityId} onChange={e => setHeader({...header, entityId: e.target.value})}>
                    <option value="">اختر..</option>
                    {type === 'sale' ? customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>) : suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div><label className={labelClass}>الخزينة</label>
                  <select className={inputClass} required value={header.safeId} onChange={e => setHeader({...header, safeId: e.target.value})}>
                    <option value="">اختر..</option>
                    {safes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* قسم إضافة الأصناف - الآن في صف واحد */}
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-inner">
            <h4 className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 mb-3 uppercase tracking-widest px-1">إضافة صنف للفاتورة</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
              {/* البحث عن المنتج */}
              <div className="md:col-span-4">
                <label className={labelClass}>البحث عن منتج</label>
                <div className="flex gap-1.5">
                  <select className={inputClass} value={itemInput.productId} onChange={e => setItemInput({...itemInput, productId: e.target.value})}>
                    <option value="">ابحث عن منتج بالاسم أو الكود..</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} - {p.sku}</option>)}
                  </select>
                  <button 
                    type="button" 
                    onClick={() => setIsNewProductModalOpen(true)}
                    className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                  </button>
                </div>
              </div>

              {/* الكميات */}
              <div className="md:col-span-1">
                <label className={labelClass}>صندوق</label>
                <input type="number" className={inputClass} value={itemInput.boxQty} onChange={e => setItemInput({...itemInput, boxQty: Number(e.target.value)})} />
              </div>
              
              <div className="md:col-span-1">
                <label className={labelClass}>قطعة</label>
                <input type="number" className={inputClass} value={itemInput.pieceQty} onChange={e => setItemInput({...itemInput, pieceQty: Number(e.target.value)})} />
              </div>

              {/* السعر */}
              {(type === 'sale' || type === 'purchase') && (
                <div className="md:col-span-1.5 md:col-span-2">
                  <label className={labelClass}>سعر الحبة</label>
                  <input type="number" className={inputClass} value={itemInput.price} onChange={e => setItemInput({...itemInput, price: Number(e.target.value)})} />
                </div>
              )}

              {/* الإجمالي التراكمي للحقل */}
              <div className="md:col-span-2">
                <label className={labelClass}>إجمالي الكمية</label>
                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 px-3 py-2 rounded-xl text-center border border-indigo-100 dark:border-indigo-900/30 h-[38px] flex items-center justify-center">
                   <span className="text-[10px] font-black text-indigo-950 dark:text-indigo-200">{itemInput.totalQty} {selectedProduct?.unit || 'قطعة'}</span>
                </div>
              </div>

              {/* زر الإدراج */}
              <div className="md:col-span-2">
                <button type="button" onClick={handleAddItem} className="w-full h-[38px] bg-indigo-600 text-white rounded-xl text-[10px] font-black shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                   إدراج البند
                </button>
              </div>
            </div>
          </div>

          {/* جدول بنود الفاتورة الحالية */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors">
            <table className="w-full text-right text-[10px]">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-black border-b dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4">الصنف</th>
                  <th className="px-6 py-4">الكمية</th>
                  <th className="px-6 py-4">السعر</th>
                  <th className="px-6 py-4 text-left">المجموع</th>
                  <th className="px-6 py-4 text-center w-16">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {draftItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-3 font-black text-indigo-950 dark:text-indigo-100">{item.productName}</td>
                    <td className="px-6 py-3 font-black text-slate-700 dark:text-slate-300">{item.quantity} {item.unit}</td>
                    <td className="px-6 py-3 font-bold text-slate-600 dark:text-slate-400">{item.price.toLocaleString()}</td>
                    <td className="px-6 py-3 text-left font-black text-indigo-600 dark:text-indigo-400">{(item.price * item.quantity).toLocaleString()}</td>
                    <td className="px-6 py-3 text-center">
                      <button type="button" onClick={() => removeItem(idx)} className="text-rose-400 hover:text-rose-600 p-1.5 transition-colors">
                        <svg className="w-3.5 h-3.5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {draftItems.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-400 font-bold italic">لا توجد أصناف في الفاتورة بعد</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <button type="submit" disabled={draftItems.length === 0} className="w-full py-4 rounded-[1.5rem] text-[11px] font-black text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-xl transition-all">مراجعة واعتماد الفاتورة النهائية</button>
        </form>
      </div>

      {isReviewing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl border dark:border-slate-800 animate-in zoom-in duration-300 overflow-hidden">
             <div className="bg-indigo-600 p-6 text-white">
                <h3 className="text-lg font-black">مراجعة نهائية</h3>
                <p className="text-[10px] text-indigo-100">يرجى التأكد من صحة البيانات قبل الحفظ</p>
             </div>
             <div className="p-6 space-y-4">
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                   {draftItems.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                         <div>
                            <p className="text-[11px] font-black text-indigo-950 dark:text-indigo-100">{item.productName}</p>
                            <p className="text-[9px] text-slate-400 font-bold">{item.quantity} × {item.price} ر.س</p>
                         </div>
                         <p className="text-[12px] font-black text-indigo-600 dark:text-indigo-400">{(item.quantity * item.price).toLocaleString()} ر.س</p>
                      </div>
                   ))}
                </div>
                <div className="bg-slate-900 p-5 rounded-2xl text-white flex justify-between items-center">
                   <p className="text-sm font-black">الإجمالي الكلي</p>
                   <p className="text-xl font-black text-emerald-400">{totalInvoiceAmount.toLocaleString()} ر.س</p>
                </div>
                <div className="flex gap-3">
                   <button onClick={handleFinalConfirm} className="flex-[2] bg-emerald-600 text-white py-4 rounded-xl text-[11px] font-black shadow-lg">اعتماد وحفظ</button>
                   <button onClick={() => setIsReviewing(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 py-4 rounded-xl text-[11px] font-black">تعديل</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Operations;
