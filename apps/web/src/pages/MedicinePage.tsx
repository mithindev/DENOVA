import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Search, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Trash
} from 'lucide-react';
import api from '../api/api.client';

interface Medicine {
  id: string;
  name: string;
}

export const MedicinePage: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMedicines, setTotalMedicines] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, [page, search]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const response = await api.get('/medicines', {
        params: { search, page, limit: 12 }
      });
      setMedicines(response.data.medicines);
      setTotalPages(response.data.pages);
      setTotalMedicines(response.data.total);
    } catch (err) {
      console.error('Failed to fetch medicines', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    setSubmitting(true);
    try {
      await api.post('/medicines', { name: newName.trim().toUpperCase() });
      setNewName('');
      setIsAdding(false);
      fetchMedicines();
    } catch (err) {
      console.error('Failed to add medicine', err);
      alert('Failed to add medicine. It might already exist.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.delete(`/medicines/${id}`);
      fetchMedicines();
    } catch (err) {
      console.error('Failed to delete medicine', err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200">
               <Pill size={24} />
             </div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Medicine Inventory</h1>
          </div>
          <p className="text-slate-500 font-medium ml-1">Manage and update your clinical drug database</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search medicines..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-11 pr-6 py-3.5 bg-white border-2 border-slate-100 rounded-2xl w-full md:w-80 text-sm font-bold shadow-sm focus:border-emerald-500 transition-all outline-none"
              />
           </div>
           <button 
             onClick={() => setIsAdding(true)}
             className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl flex items-center gap-2 group"
           >
             <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> Add New
           </button>
        </div>
      </div>

      {/* Add Modal/Panel */}
      {isAdding && (
        <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-3xl animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAddMedicine} className="flex flex-col md:flex-row items-center gap-4">
             <div className="flex-1 w-full">
                <input
                  autoFocus
                  placeholder="Enter Medicine Name (e.g. PARACETAMOL)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value.toUpperCase())}
                  className="w-full bg-white px-5 py-3.5 rounded-xl border-2 border-emerald-200 text-sm font-black focus:border-emerald-500 outline-none uppercase"
                />
             </div>
             <div className="flex gap-2 w-full md:w-auto">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 md:flex-none px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-black text-sm uppercase tracking-wider hover:bg-emerald-700 transition-all disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Save Medicine'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)}
                  className="px-8 py-3.5 bg-white text-slate-500 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all border border-slate-200"
                >
                  Cancel
                </button>
             </div>
          </form>
        </div>
      )}

      {/* Main Table Grid */}
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-32">
             <div className="w-16 h-16 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
             <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Accessing Database...</p>
          </div>
        ) : medicines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-32 opacity-40">
             <Trash size={64} className="text-slate-200 mb-4" />
             <p className="text-slate-500 font-black text-sm uppercase tracking-widest">No matching medicines found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-x divide-y divide-slate-50">
              {medicines.map((m) => (
                <div key={m.id} className="p-6 hover:bg-slate-50/50 transition-all group flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 rounded-xl flex items-center justify-center transition-colors">
                        <Pill size={18} />
                      </div>
                      <span className="font-black text-slate-800 text-[15px] tracking-tight uppercase">{m.name}</span>
                   </div>
                   <button 
                     onClick={() => handleDelete(m.id, m.name)}
                     className="p-2.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
              ))}
            </div>

            {/* Pagination / Stats */}
            <div className="mt-auto p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Showing <span className="text-slate-900">{medicines.length}</span> of <span className="text-slate-900">{totalMedicines}</span> pharmaceutical records
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center px-6 text-sm font-black text-slate-900 bg-white border border-slate-200 rounded-xl h-[46px]">
                  Page {page} of {totalPages}
                </div>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
