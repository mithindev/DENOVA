import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Clock } from 'lucide-react';
import api from '../api/api.client';
import { formatDate } from '../lib/utils';
import { cn } from '../lib/utils';

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
  NO_SHOW: 'bg-gray-100 text-gray-600',
};

export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments').then((r) => setAppointments(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground text-sm mt-1">{appointments.length} total appointments</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-all">
          <Plus size={16} /> Book Appointment
        </button>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No appointments found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                {['Patient', 'Doctor', 'Date', 'Duration', 'Reason', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {appointments.map((a) => (
                <tr key={a.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-semibold text-foreground">{a.patient?.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.doctor?.name || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(a.date)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock size={13} /> {a.duration}m</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.reason || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-1 rounded-md text-xs font-semibold', STATUS_STYLES[a.status])}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
