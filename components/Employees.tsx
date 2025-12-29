
import React, { useState } from 'react';
import { Employee, SalaryPayment, Safe, Branch } from '../types';

interface EmployeesProps {
  employees: Employee[];
  onAddEmployee: (e: Employee) => void;
  onUpdateEmployee: (e: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  salaryPayments: SalaryPayment[];
  onPaySalary: (p: SalaryPayment) => void;
  safes: Safe[];
  branches: Branch[];
}

const Employees: React.FC<EmployeesProps> = ({ employees, onAddEmployee, onUpdateEmployee, onDeleteEmployee, salaryPayments, onPaySalary, safes, branches }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'payroll'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [salaryData, setSalaryData] = useState<any>({ bonus: 0, deduction: 0, month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const handleOpenModal = (employee?: Employee) => {
    setFormData(employee || { status: 'active', joiningDate: new Date().toISOString().split('T')[0], branchId: '' });
    setIsModalOpen(true);
  };

  const handlePaySalary = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSalaryData({ ...salaryData, employeeId: employee.id, employeeName: employee.name, netSalary: employee.baseSalary, safeId: '' });
    setIsSalaryModalOpen(true);
  };

  const submitEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      onUpdateEmployee(formData);
    } else {
      onAddEmployee({ ...formData, id: Math.random().toString(36).substr(2, 9) });
    }
    setIsModalOpen(false);
  };

  const submitSalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salaryData.safeId) return;
    const net = Number(selectedEmployee?.baseSalary || 0) + Number(salaryData.bonus || 0) - Number(salaryData.deduction || 0);
    onPaySalary({
      ...salaryData,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      netSalary: net
    });
    setIsSalaryModalOpen(false);
  };

  const inputClass = "w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-900 dark:text-slate-100 transition-all";
  const labelClass = "block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1.5 uppercase";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex gap-2 transition-colors">
        <button onClick={() => setActiveTab('list')} className={`flex-1 py-3 rounded-xl text-[11px] font-black transition-all ${activeTab === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>سجل الموظفين</button>
        <button onClick={() => setActiveTab('payroll')} className={`flex-1 py-3 rounded-xl text-[11px] font-black transition-all ${activeTab === 'payroll' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>مسير الرواتب</button>
      </div>

      {activeTab === 'list' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
            <div>
              <h2 className="text-lg font-black text-indigo-950 dark:text-indigo-100">إدارة الكوادر البشرية</h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">إجمالي الموظفين: {employees.length}</p>
            </div>
            <button onClick={() => handleOpenModal()} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[11px] font-black shadow-lg shadow-indigo-100 dark:shadow-indigo-950/20 transition-all">تعيين موظف جديد</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map(emp => {
              const branch = branches.find(b => b.id === emp.branchId);
              return (
                <div key={emp.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                     </div>
                     <span className={`px-2.5 py-1 rounded-full text-[9px] font-black ${emp.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600'}`}>
                        {emp.status === 'active' ? 'نشط' : 'غير نشط'}
                     </span>
                  </div>
                  <h3 className="font-black text-indigo-950 dark:text-indigo-100 mb-1">{emp.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-4">{emp.position} • {emp.department}</p>
                  
                  <div className="flex items-center gap-2 mb-4 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg w-fit">
                    <svg className="text-indigo-500 dark:text-indigo-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span className="text-[10px] font-black text-indigo-950 dark:text-indigo-200">{branch?.name || 'غير محدد'}</span>
                  </div>

                  <div className="space-y-2 mb-6">
                     <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400 dark:text-slate-500 font-bold">الراتب الأساسي:</span>
                        <span className="font-black text-indigo-600 dark:text-indigo-400">{emp.baseSalary.toLocaleString()} ر.س</span>
                     </div>
                     <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400 dark:text-slate-500 font-bold">تاريخ الالتحاق:</span>
                        <span className="font-black text-slate-700 dark:text-slate-300">{emp.joiningDate}</span>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => handlePaySalary(emp)} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-[10px] font-black shadow-lg shadow-emerald-100 dark:shadow-emerald-950/20 transition-all">صرف راتب</button>
                     <button onClick={() => handleOpenModal(emp)} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                     <button onClick={() => onDeleteEmployee(emp.id)} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 transition-all"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800">
             <h2 className="text-sm font-black text-indigo-950 dark:text-indigo-100">سجل صرف الرواتب التاريخي</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-[11px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 font-black border-b dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">الموظف</th>
                  <th className="px-6 py-4">عن شهر</th>
                  <th className="px-6 py-4">المكافآت</th>
                  <th className="px-6 py-4">الاستقطاعات</th>
                  <th className="px-6 py-4">الصافي المنصرف</th>
                  <th className="px-6 py-4">تاريخ الصرف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {salaryPayments.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-black text-indigo-950 dark:text-indigo-100">{pay.employeeName}</td>
                    <td className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400">{pay.month} / {pay.year}</td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-400 font-bold">+{pay.bonus.toLocaleString()}</td>
                    <td className="px-6 py-4 text-rose-600 dark:text-rose-400 font-bold">-{pay.deduction.toLocaleString()}</td>
                    <td className="px-6 py-4 font-black text-indigo-600 dark:text-indigo-400">{pay.netSalary.toLocaleString()} ر.س</td>
                    <td className="px-6 py-4 text-slate-400 dark:text-slate-500">{pay.date}</td>
                  </tr>
                ))}
                {salaryPayments.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 dark:text-slate-600 font-bold">لم يتم تسجيل عمليات صرف رواتب بعد</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Employee */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors animate-in zoom-in duration-300">
            <h3 className="text-base font-black text-indigo-950 dark:text-indigo-100 mb-6">{formData.id ? 'تحديث بيانات موظف' : 'إضافة موظف جديد'}</h3>
            <form onSubmit={submitEmployee} className="space-y-4">
              <div><label className={labelClass}>الاسم الكامل</label><input className={inputClass} required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                 <div><label className={labelClass}>المسمى الوظيفي</label><input className={inputClass} required value={formData.position || ''} onChange={e => setFormData({...formData, position: e.target.value})} /></div>
                 <div><label className={labelClass}>القسم</label><input className={inputClass} required value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div><label className={labelClass}>الراتب الأساسي</label><input type="number" className={inputClass} required value={formData.baseSalary || ''} onChange={e => setFormData({...formData, baseSalary: Number(e.target.value)})} /></div>
                 <div><label className={labelClass}>رقم الهاتف</label><input className={inputClass} required value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div><label className={labelClass}>تاريخ التعيين</label><input type="date" className={inputClass} required value={formData.joiningDate || ''} onChange={e => setFormData({...formData, joiningDate: e.target.value})} /></div>
                 <div><label className={labelClass}>الفرع التابع له</label>
                    <select className={inputClass} required value={formData.branchId || ''} onChange={e => setFormData({...formData, branchId: e.target.value})}>
                       <option value="">اختر الفرع..</option>
                       {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                 </div>
              </div>
              <div>
                <label className={labelClass}>الحالة الوظيفية</label>
                <select className={inputClass} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="active">نشط</option>
                    <option value="on_leave">في إجازة</option>
                    <option value="terminated">منتهي</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3.5 rounded-2xl text-xs font-black shadow-lg shadow-indigo-100 dark:shadow-indigo-950/20">حفظ البيانات</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 py-3.5 rounded-2xl text-xs font-black">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Salary */}
      {isSalaryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors animate-in zoom-in duration-300">
            <h3 className="text-base font-black text-indigo-950 dark:text-indigo-100 mb-1">صرف راتب شهري</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-6 uppercase tracking-widest">الموظف: {selectedEmployee?.name}</p>
            <form onSubmit={submitSalary} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                 <div><label className={labelClass}>عن شهر</label><input type="number" className={inputClass} required value={salaryData.month} onChange={e => setSalaryData({...salaryData, month: Number(e.target.value)})} /></div>
                 <div><label className={labelClass}>السنة</label><input type="number" className={inputClass} required value={salaryData.year} onChange={e => setSalaryData({...salaryData, year: Number(e.target.value)})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div><label className={labelClass}>مكافآت إضافية</label><input type="number" className={inputClass} value={salaryData.bonus} onChange={e => setSalaryData({...salaryData, bonus: Number(e.target.value)})} /></div>
                 <div><label className={labelClass}>استقطاعات / خصم</label><input type="number" className={inputClass} value={salaryData.deduction} onChange={e => setSalaryData({...salaryData, deduction: Number(e.target.value)})} /></div>
              </div>
              <div>
                 <label className={labelClass}>الخزينة المختارة للصرف</label>
                 <select className={inputClass} required value={salaryData.safeId} onChange={e => setSalaryData({...salaryData, safeId: e.target.value})}>
                    <option value="">اختر الخزينة..</option>
                    {safes.map(s => <option key={s.id} value={s.id}>{s.name} (رصيد: {s.balance})</option>)}
                 </select>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                 <p className="text-[10px] text-indigo-400 dark:text-indigo-300 font-black mb-1">إجمالي صافي الراتب المستحق</p>
                 <p className="text-2xl font-black text-indigo-900 dark:text-indigo-100">
                    {(Number(selectedEmployee?.baseSalary || 0) + Number(salaryData.bonus || 0) - Number(salaryData.deduction || 0)).toLocaleString()} ر.س
                 </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-3.5 rounded-2xl text-xs font-black shadow-lg shadow-emerald-100 dark:shadow-emerald-950/20 transition-all">تأكيد عملية الصرف</button>
                <button type="button" onClick={() => setIsSalaryModalOpen(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 py-3.5 rounded-2xl text-xs font-black">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
