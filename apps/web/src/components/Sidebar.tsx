import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Search,
  Pill
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const mainNavItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { 
    name: 'Patients', 
    path: '/patients', 
    icon: Users,
    children: [
      { name: 'Registration', path: '/patients/registration', icon: UserPlus },
      { name: 'Revisit', path: '/patients/revisit', icon: Search },
      { name: 'Patient List', path: '/patients/list', icon: Users },
    ]
  },
  { name: 'Appointments', path: '/appointments', icon: Calendar },
];

const bottomNavItems = [
  { name: 'Medicine', path: '/medicine', icon: Pill },
  { name: 'Staff', path: '/staff', icon: Settings, adminOnly: true },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'Patients': location.pathname.startsWith('/patients')
  });

  const toggleMenu = (name: string) => {
    setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const renderNavItems = (items: typeof mainNavItems) => {
    return items.map((item) => {
      if ('adminOnly' in item && item.adminOnly && user?.role !== 'ADMIN') return null;
      
      const hasChildren = 'children' in item && item.children && item.children.length > 0;
      const isOpen = openMenus[item.name];

      if (hasChildren) {
        return (
          <div key={item.name} className="space-y-1">
            <button
              onClick={() => toggleMenu(item.name)}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2 rounded-md transition-all font-medium text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                location.pathname.startsWith(item.path) && "bg-accent/50 text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                {item.name}
              </div>
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {isOpen && (
              <div className="pl-9 space-y-1">
                {(item as any).children.map((child: any) => (
                  <NavLink
                    key={child.name}
                    to={child.path}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-1.5 rounded-md transition-all font-medium text-xs",
                      isActive 
                        ? "text-primary font-bold" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {child.name}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        );
      }

      return (
        <NavLink
          key={item.name}
          to={item.path!}
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-all font-medium text-sm",
            isActive 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <item.icon size={18} />
          {item.name}
        </NavLink>
      );
    });
  };

  return (
    <aside className="w-64 bg-card border-r flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b flex items-center gap-3 bg-slate-50/50">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm overflow-hidden p-0.5 border border-slate-100">
          <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="font-heading font-black text-sm leading-tight text-slate-900">Sri Ganesh</h1>
          <p className="text-[10px] text-primary uppercase tracking-[0.15em] font-black">Dental Care</p>
        </div>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-1">
        <div className="space-y-1">
          {renderNavItems(mainNavItems)}
        </div>
        
        <div className="mt-auto space-y-1">
          {renderNavItems(bottomNavItems)}
        </div>
      </nav>

      <div className="p-4 border-t mt-auto">
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md transition-all font-medium text-sm text-destructive hover:bg-destructive/10 mb-2"
        >
          <LogOut size={18} />
          Logout
        </button>
        
        <div className="px-3 pt-2">
          <a 
            href="https://www.optiviz.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-1.5 uppercase tracking-widest"
          >
            Designed by Optiviz.org
          </a>
        </div>
      </div>
    </aside>
  );
};
