import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Pill, Printer, Eraser, CheckCircle2, Search, Save, Loader2 } from 'lucide-react';
import api from '../../api/api.client';

export interface PrescriptionRow {
  medicineName: string;
  totalTablets: number;
  dosage: string;
  days: number;
}

interface Props {
  prescriptions: PrescriptionRow[];
  onChange: (index: number, field: keyof PrescriptionRow, value: any) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  onClearAll: () => void;
  onPrint: () => void;
}

export const MedicinalAdviceSection: React.FC<Props> = ({ prescriptions, onChange, onAddRow, onRemoveRow, onClearAll, onPrint }) => {
  const [searchResults, setSearchResults] = useState<{ id: string; name: string }[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmSaveIndex, setConfirmSaveIndex] = useState<number | null>(null);
  const [savingMedicine, setSavingMedicine] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update position on scroll/resize
  useEffect(() => {
    const updatePos = () => {
      if (activeIndex !== null && inputRefs.current[activeIndex]) {
        const rect = inputRefs.current[activeIndex]!.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom,
          left: rect.left,
          width: rect.width
        });
      }
    };
    if (showDropdown) {
      updatePos();
      window.addEventListener('scroll', updatePos, true);
      window.addEventListener('resize', updatePos);
    }
    return () => {
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [showDropdown, activeIndex]);

  const handleMedicineSearch = async (index: number, query: string) => {
    onChange(index, 'medicineName', query.toUpperCase());
    if (query.length < 1) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      const response = await api.get('/medicines', { params: { search: query, limit: 10 } });
      setSearchResults(response.data.medicines);
      setActiveIndex(index);
      setShowDropdown(true);
      
      // Initial position update
      setTimeout(() => {
        if (inputRefs.current[index]) {
          const rect = inputRefs.current[index]!.getBoundingClientRect();
          setDropdownPos({
            top: rect.bottom,
            left: rect.left,
            width: rect.width
          });
        }
      }, 0);
    } catch (err) {
      console.error('Search failed', err);
    }
  };

  const selectMedicine = (index: number, name: string) => {
    onChange(index, 'medicineName', name);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleDaysChange = async (index: number, val: number) => {
    const medicineName = prescriptions[index].medicineName.trim();
    onChange(index, 'days', val);

    if (val > 0 && medicineName !== '') {
      try {
        const response = await api.get('/medicines', { params: { search: medicineName, limit: 10 } });
        const exactMatch = response.data.medicines.find((m: any) => m.name.toUpperCase() === medicineName.toUpperCase());
        
        if (!exactMatch) {
          setConfirmSaveIndex(index);
        } else {
          if (index === prescriptions.length - 1) onAddRow();
        }
      } catch (err) {
        if (index === prescriptions.length - 1) onAddRow();
      }
    }
  };

  const saveNewMedicine = async () => {
    if (confirmSaveIndex === null) return;
    const name = prescriptions[confirmSaveIndex].medicineName.trim().toUpperCase();
    
    setSavingMedicine(true);
    try {
      await api.post('/medicines', { name });
      if (confirmSaveIndex === prescriptions.length - 1) onAddRow();
      setConfirmSaveIndex(null);
    } catch (err) {
      console.error('Failed to save medicine', err);
    } finally {
      setSavingMedicine(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shadow-sm">
            <Pill size={18} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Medicinal Advice</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onPrint} className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-white hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-200 flex items-center gap-1.5 uppercase tracking-wider">
            <Printer size={14} /> Print Rx
          </button>
          <button onClick={onClearAll} className="px-3 py-1.5 text-xs font-bold text-red-600 bg-white hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-200 flex items-center gap-1.5 uppercase tracking-wider">
            <Eraser size={14} /> Clear All
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm relative">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr className="border-b border-slate-200">
              <th className="px-6 py-4 text-[11px] font-black text-slate-900 uppercase tracking-widest w-2/5 leading-none">Medicine Name</th>
              <th className="px-4 py-4 text-[11px] font-black text-slate-900 uppercase tracking-widest text-center leading-none">Total Tabs</th>
              <th className="px-6 py-4 text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">Dosage / Direction</th>
              <th className="px-4 py-4 text-[11px] font-black text-slate-900 uppercase tracking-widest text-center leading-none">Days</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white font-medium">
            {prescriptions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center text-slate-400 text-sm font-medium italic bg-slate-50/10">
                  Initializing Medicines Ledger...
                </td>
              </tr>
            ) : (
              prescriptions.map((p, idx) => (
                <tr key={idx} className="hover:bg-emerald-50/10 transition-colors group relative">
                  <td className="px-6 py-4 relative">
                    <div className="relative">
                      <input
                        ref={el => inputRefs.current[idx] = el}
                        placeholder="Search medicines..."
                        value={p.medicineName}
                        onChange={e => handleMedicineSearch(idx, e.target.value)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                        className="w-full bg-slate-50/50 px-4 py-2.5 rounded-lg text-slate-900 border border-slate-200 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-bold text-[14px] uppercase"
                      />
                      {showDropdown && activeIndex === idx && searchResults.length > 0 && (
                        <div 
                          ref={dropdownRef} 
                          style={{ 
                            position: 'fixed', 
                            top: dropdownPos.top + 4, 
                            left: dropdownPos.left, 
                            width: dropdownPos.width,
                            zIndex: 9999
                          }}
                          className="bg-white border border-slate-200 shadow-2xl rounded-xl max-h-60 overflow-y-auto py-2 animate-in fade-in slide-in-from-top-2"
                        >
                           {searchResults.map((m) => (
                             <button
                               key={m.id}
                               onMouseDown={() => selectMedicine(idx, m.name)}
                               className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 font-bold text-sm text-slate-700 flex items-center gap-3"
                             >
                                <Search size={14} className="text-slate-300" />
                                {m.name}
                             </button>
                           ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <input
                      type="number"
                      value={p.totalTablets || ''}
                      onChange={e => onChange(idx, 'totalTablets', parseInt(e.target.value) || 0)}
                      className="w-20 bg-slate-50/50 px-2 py-2.5 text-center rounded-lg text-slate-900 border border-slate-200 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-bold text-[14px]"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      placeholder="e.g. 1 cap stat"
                      value={p.dosage}
                      onChange={e => onChange(idx, 'dosage', e.target.value)}
                      className="w-full bg-slate-50/50 px-4 py-2.5 rounded-lg text-slate-700 border border-slate-200 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-bold text-[13px] placeholder:text-slate-300"
                    />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <input
                      type="number"
                      value={p.days || ''}
                      onChange={e => handleDaysChange(idx, parseInt(e.target.value) || 0)}
                      className="w-16 bg-slate-50/50 px-2 py-2.5 text-center rounded-lg text-slate-900 border border-slate-200 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-bold text-[14px]"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onRemoveRow(idx)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {confirmSaveIndex !== null && (
        <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
           <div className="flex items-center gap-4">
              <div className="p-2.5 bg-white text-blue-600 rounded-xl shadow-sm">
                <Pill size={20} />
              </div>
              <div>
                 <p className="text-sm font-black text-slate-900 tracking-tight italic">
                   Save <span className="text-blue-700 font-bold uppercase underline decoration-2 underline-offset-4">{prescriptions[confirmSaveIndex].medicineName}</span> to database?
                 </p>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">This will make it available for future clinical searches.</p>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <button 
                onClick={saveNewMedicine}
                disabled={savingMedicine}
                className="px-6 py-2.5 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                {savingMedicine ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Yes, Save
              </button>
              <button 
                onClick={() => {
                  if (confirmSaveIndex === prescriptions.length - 1) onAddRow();
                  setConfirmSaveIndex(null);
                }}
                className="px-6 py-2.5 bg-white text-slate-500 text-xs font-black uppercase tracking-widest rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
              >
                No, Skip
              </button>
           </div>
        </div>
      )}

      <div className="flex items-center gap-2.5 text-[11px] text-slate-400 font-bold uppercase ml-1 tracking-wider bg-slate-50 w-fit px-3 py-1 rounded-full border border-slate-100">
        <CheckCircle2 size={12} className="text-emerald-500" />
        Record auto-saves incrementally
      </div>
    </div>
  );
};
