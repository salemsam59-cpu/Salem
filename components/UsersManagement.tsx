
import React, { useState } from 'react';
import { User, UserRole, PermissionAction } from '../types';

interface UsersManagementProps {
  users: User[];
  onAddUser: (u: User) => void;
  onUpdateUser: (u: User) => void;
  onDeleteUser: (id: string) => void;
}

const UsersManagement: React.FC<UsersManagementProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    role: UserRole.SALES,
    password: '',
    permissions: [] as PermissionAction[]
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        name: user.name,
        role: user.role,
        password: '',
        permissions: user.permissions || []
      });
    } else {
      setEditingUser(null);
      setFormData({ username: '', name: '', role: UserRole.SALES, password: '', permissions: [PermissionAction.VIEW] });
    }
    setIsModalOpen(true);
  };

  const togglePermission = (perm: PermissionAction) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm) 
        ? prev.permissions.filter(p => p !== perm) 
        : [...prev.permissions, perm]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      const updated: User = { 
        ...editingUser, 
        username: formData.username, 
        name: formData.name, 
        role: formData.role,
        permissions: formData.permissions
      };
      if (formData.password) updated.password = formData.password;
      onUpdateUser(updated);
    } else {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username: formData.username,
        name: formData.name,
        role: formData.role,
        password: formData.password || '123',
        permissions: formData.permissions
      };
      onAddUser(newUser);
    }
    setIsModalOpen(false);
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'مدير النظام';
      case UserRole.ACCOUNTANT: return 'محاسب';
      case UserRole.SALES: return 'مبيعات';
      case UserRole.WAREHOUSE: return 'أمين مستودع';
      default: return role;
    }
  };

  const inputClass = "w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 transition-all";
  const labelClass = "block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider";

  const permissionCategories = [
    {
      title: 'الصلاحيات الأساسية',
      perms: [
        { id: PermissionAction.VIEW, label: 'رؤية التقارير والبيانات' },
        { id: PermissionAction.CREATE, label: 'إضافة سجلات جديدة' },
        { id: PermissionAction.UPDATE, label: 'تعديل السجلات' },
        { id: PermissionAction.DELETE, label: 'حذف السجلات' },
      ]
    },
    {
      title: 'الصلاحيات المالية',
      perms: [
        { id: PermissionAction.VIEW_COSTS, label: 'رؤية أسعار التكلفة' },
        { id: PermissionAction.VIEW_PROFIT_LOSS, label: 'رؤية تقارير الأرباح' },
        { id: PermissionAction.MANAGE_PRICES, label: 'تعديل أسعار المنتجات' },
        { id: PermissionAction.GIVE_DISCOUNT, label: 'منح خصومات مبيعات' },
      ]
    },
    {
      title: 'الصلاحيات الإدارية',
      perms: [
        { id: PermissionAction.VIEW_ALERTS, label: 'رؤية تنبيهات المخزون' },
        { id: PermissionAction.MANAGE_STOCKS, label: 'تعديل المخزون يدوياً' },
        { id: PermissionAction.VOID_TRANSACTION, label: 'إلغاء العمليات المؤرشفة' },
        { id: PermissionAction.PRINT, label: 'طباعة الفواتير' },
        { id: PermissionAction.EXPORT, label: 'تصدير البيانات للخارج' },
        { id: PermissionAction.EDIT_CLOSED_PERIOD, label: 'تعديل الفترات المغلقة' },
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <h2 className="text-lg font-black text-indigo-950 dark:text-indigo-100">إدارة مستخدمي النظام</h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">تحديد الصلاحيات المخصصة بدقة</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[11px] font-black shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30">إضافة مستخدم جديد</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <div key={user.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black ${user.role === UserRole.ADMIN ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600'}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>
            <h3 className="font-black text-indigo-950 dark:text-indigo-100 mb-1">{user.name}</h3>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-4">@{user.username}</p>
            
            <div className="flex flex-wrap gap-1 mb-4">
               {user.permissions?.slice(0, 4).map(p => (
                 <span key={p} className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[8px] font-bold text-slate-500">
                    {p.replace('_', ' ')}
                 </span>
               ))}
               {(user.permissions?.length || 0) > 4 && <span className="text-[8px] font-bold text-indigo-400">+{user.permissions!.length - 4} أخرى</span>}
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => handleOpenModal(user)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-2.5 rounded-xl text-[10px] font-black hover:bg-indigo-600 hover:text-white transition-all">تعديل الصلاحيات</button>
              <button onClick={() => onDeleteUser(user.id)} className="w-10 h-10 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[150] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border dark:border-slate-800 transition-colors animate-in zoom-in duration-300">
            <h3 className="text-base font-black text-indigo-950 dark:text-indigo-100 mb-6">{editingUser ? 'تعديل بيانات وصلاحيات مستخدم' : 'إضافة مستخدم جديد'}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelClass}>الاسم الكامل</label><input className={inputClass} required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                <div><label className={labelClass}>اسم المستخدم</label><input className={inputClass} required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>الدور الأساسي</label>
                  <select className={inputClass} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                    <option value={UserRole.ADMIN}>مدير النظام (صلاحية كاملة)</option>
                    <option value={UserRole.ACCOUNTANT}>محاسب</option>
                    <option value={UserRole.SALES}>مسؤول مبيعات</option>
                    <option value={UserRole.WAREHOUSE}>أمين مستودع</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>كلمة المرور</label>
                  <input type="password" className={inputClass} required={!editingUser} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={editingUser ? "اتركها فارغة لعدم التغيير" : "أدخل كلمة المرور"} />
                </div>
              </div>

              <div className="space-y-4">
                <label className={labelClass}>تخصيص الصلاحيات المتقدمة</label>
                {permissionCategories.map(cat => (
                  <div key={cat.title} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-[2rem]">
                    <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 mb-3 uppercase tracking-widest">{cat.title}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {cat.perms.map(perm => (
                        <label key={perm.id} className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer group">
                           <input 
                             type="checkbox" 
                             className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" 
                             checked={formData.permissions.includes(perm.id)}
                             onChange={() => togglePermission(perm.id)}
                           />
                           <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 transition-colors">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t dark:border-slate-800">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3.5 rounded-2xl text-xs font-black shadow-lg shadow-indigo-100">حفظ كافة التغييرات</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 py-3.5 rounded-2xl text-xs font-black">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
