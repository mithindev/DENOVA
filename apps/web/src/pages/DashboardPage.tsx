import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Calendar, ReceiptIndianRupee, Stethoscope } from 'lucide-react';
import api from '../api/api.client';

interface Stats {
  patients: number;
  todayAppointments: number;
  pendingBills: number;
}

const StatCard: React.FC<{ icon: React.ElementType; label: string; value: string | number; color: string }> = ({
  icon: Icon, label, value, color
}) => (
  <div className="bg-card border rounded-lg p-6 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-muted-foreground text-sm font-medium">{label}</p>
      <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
    </div>
  </div>
);

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ patients: 0, todayAppointments: 0, pendingBills: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [pRes, aRes, bRes] = await Promise.all([
          api.get('/patients'),
          api.get('/appointments'),
          api.get('/billing'),
        ]);
        const today = new Date().toDateString();
        const todayAppts = aRes.data.filter((a: any) => new Date(a.date).toDateString() === today);
        const pending = bRes.data.filter((b: any) => b.status !== 'PAID');
        setStats({ patients: pRes.data.length, todayAppointments: todayAppts.length, pendingBills: pending.length });
      } catch (err) { /* non-critical */ }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Good morning, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening at your clinic today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Patients" value={stats.patients} color="bg-blue-500" />
        <StatCard icon={Calendar} label="Today's Appointments" value={stats.todayAppointments} color="bg-primary" />
        <StatCard icon={ReceiptIndianRupee} label="Pending Bills" value={stats.pendingBills} color="bg-amber-500" />
        <StatCard icon={Stethoscope} label="Active Doctors" value="—" color="bg-green-500" />
      </div>

      <div className="bg-card border rounded-lg p-6">
        <h2 className="font-heading font-bold text-lg text-foreground mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: '+ New Patient', href: '/patients' },
            { label: '+ Book Appointment', href: '/appointments' },
            { label: 'View Billing', href: '/billing' },
          ].map((a) => (
            <a key={a.href} href={a.href}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-md text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-all">
              {a.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
