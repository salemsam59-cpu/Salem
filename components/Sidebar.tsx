
import React from 'react';
import { AppView, User, UserRole } from '../types';

interface SidebarProps { 
  activeView: AppView; 
  setView: (view: AppView) => void; 
  isDarkMode: boolean; 
  toggleDarkMode: () => void;
  currentUser: User;
  onLogout: () => void;
  canAccessView: (view: AppView) => boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setView, isDarkMode, toggleDarkMode, currentUser, onLogout, canAccessView }) => {
  const allMenuItems = [
    { id: AppView.DASHBOARD, label: 'الرئيسية', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { id: AppView.SOURCES, label: 'المصادر', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8' },
    { id: AppView.OPERATIONS, label: 'العمليات', icon: 'M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
    { id: AppView.REGISTRY, label: 'السجلات', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { id: AppView.STATEMENTS, label: 'كشف حساب', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: AppView.ACCOUNTING, label: 'الحسابات', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
    { id: AppView.REPORTS, label: 'التقارير', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z' },
    { id: AppView.EMPLOYEES, label: 'الموظفين', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8' },
    { id: AppView.USERS_MANAGEMENT, label: 'المستخدمين', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
  ];

  const menuItems = allMenuItems.filter(item => canAccessView(item.id));

  return (
    <aside className="w-14 md:w-44 bg-indigo-950 text-white flex flex-col shadow-2xl sticky top-0 h-screen transition-all duration-300 z-50">
      <div className="p-3 border-b border-indigo-900 flex items-center justify-center md:justify-start gap-2">
        <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center flex-shrink-0">
          <svg className="text-white" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
        </div>
        <span className="text-xs font-black hidden md:block">المنارة ERP</span>
      </div>
      
      <nav className="flex-1 py-4 px-1.5 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => setView(item.id)} 
            title={item.label}
            className={`w-full flex items-center justify-center md:justify-start gap-2 p-2.5 rounded-xl transition-all duration-200 ${
              activeView === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' 
                : 'text-indigo-300 hover:bg-indigo-900 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={item.icon} /></svg>
            <span className="text-[10px] font-bold hidden md:block">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-1.5 space-y-1 border-t border-indigo-900">
        <button 
          onClick={toggleDarkMode}
          title={isDarkMode ? 'الوضع المضيء' : 'الوضع المظلم'}
          className="w-full flex items-center justify-center md:justify-start gap-2 p-2.5 rounded-xl transition-all duration-200 text-indigo-300 hover:bg-indigo-900 hover:text-white"
        >
          {isDarkMode ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
          <span className="text-[10px] font-bold hidden md:block">{isDarkMode ? 'وضع مضيء' : 'وضع مظلم'}</span>
        </button>

        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center md:justify-start gap-2 p-2.5 rounded-xl transition-all duration-200 text-rose-400 hover:bg-rose-900 hover:text-white"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9"/></svg>
          <span className="text-[10px] font-bold hidden md:block">تسجيل خروج</span>
        </button>

        <div className="p-3 bg-indigo-900/40 border-t border-indigo-900 hidden md:block rounded-xl">
          <p className="text-[7px] text-indigo-400 mb-1 uppercase tracking-tighter">نظام المنارة</p>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[8px] text-emerald-100 font-bold">نشط: {currentUser.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
