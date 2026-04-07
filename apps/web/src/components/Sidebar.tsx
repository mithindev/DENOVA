import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Stethoscope, 
  ReceiptIndianRupee, 
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const navItems = [
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
  { name: 'Treatments', path: '/treatments', icon: Stethoscope },
  { name: 'Billing', path: '/billing', icon: ReceiptIndianRupee },
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

  return (
    <aside className="w-64 bg-card border-r flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6 border-b flex items-center gap-3">
        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold text-xl">
          B
        </div>
        <div>
          <h1 className="font-heading font-bold text-lg leading-none">Balaji Dental</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Care System</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          if (item.adminOnly && user?.role !== 'ADMIN') return null;
          
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
        })}
      </nav>

      <div className="p-4 border-t mt-auto">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-bold">
            {user?.name?.[0]}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate">{user?.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md transition-all font-medium text-sm text-destructive hover:bg-destructive/10"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};
