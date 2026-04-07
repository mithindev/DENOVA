import React, { useEffect, useState } from 'react';
import { Users, Search, UserPlus } from 'lucide-react';
import api from '../api/api.client';
import { formatDate } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface Patient {
  id: string;
  opNo: string | null;
  name: string;
  age: number | null;
  gender: string | null;
  bloodGroup: string | null;
  mobile: string | null;
  regDate: string;
}

export const PatientListPage: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPatients = async (query = '') => {
    setLoading(true);
    try {
      const res = await api.get('/patients', { params: { query, limit: 15 } });
      setPatients(res.data);
    } catch (err) {
      console.error('Failed to fetch patients', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Patient List</h1>
            <p className="text-muted-foreground text-sm mt-1">Viewing latest 15 patients with advanced search</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/patients/registration')}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-sm"
        >
          <UserPlus size={16} />
          New Registration
        </button>
      </div>

      {/* Search */}
      <div className="relative group max-w-xl">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search by name, OP number, or phone (7+ digits)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 border-2 border-border rounded-xl bg-card text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        {loading && patients.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground font-medium">Loading patients...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-muted-foreground" />
            </div>
            <p className="text-foreground font-bold text-lg">No results found</p>
            <p className="text-muted-foreground mt-1">Try a different search term or check the spelling</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">No.</th>
                  <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">OP.No</th>
                  <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Age</th>
                  <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Sex</th>
                  <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Bg Group</th>
                  <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Mobile</th>
                  <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Reg Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {patients.map((p, index) => (
                  <tr key={p.id} className="hover:bg-accent/50 transition-colors cursor-pointer group" onClick={() => navigate(`/patients/${p.id}`)}>
                    <td className="px-6 py-4 font-medium text-muted-foreground">{index + 1}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-muted border px-1.5 py-0.5 rounded text-foreground">
                        {p.opNo || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground group-hover:text-primary transition-colors">{p.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{p.age || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase ${
                        p.gender === 'MALE' ? 'text-blue-600' : p.gender === 'FEMALE' ? 'text-pink-600' : 'text-slate-600'
                      }`}>
                        {p.gender || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-medium">{p.bloodGroup || '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{p.mobile || '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground italic">{formatDate(p.regDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
