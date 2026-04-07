import React, { useEffect, useState } from 'react';
import { Users, Plus, Search, Phone, Calendar } from 'lucide-react';
import api from '../api/api.client';
import { formatDate } from '../lib/utils';

interface Patient {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  gender: string | null;
  createdAt: string;
  _count: { appointments: number };
}

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/patients').then((r) => setPatients(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground text-sm mt-1">{patients.length} patients registered</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-all">
          <Plus size={16} /> New Patient
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm pl-9 pr-4 py-2.5 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading patients...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No patients found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                {['Name', 'Phone', 'Gender', 'Appointments', 'Registered'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-semibold text-foreground">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Phone size={13} />{p.phone || '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{p.gender?.toLowerCase() || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-muted-foreground"><Calendar size={13} />{p._count.appointments}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
