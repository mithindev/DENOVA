import React, { useState } from 'react';
import { Plus, Trash2, ClipboardList, Grid3X3 } from 'lucide-react';

export interface TreatmentRow {
  diagnosis: string;
  treatmentDone: string;
  quadrantRU: string;
  quadrantLU: string;
  quadrantRL: string;
  quadrantLL: string;
  name: string; // Procedure name for backward compatibility
}

interface Props {
  stagedTreatments: TreatmentRow[];
  onAdd: (row: TreatmentRow) => void;
  onRemove: (index: number) => void;
  onClearAll: () => void;
}

export const DiagnosisTreatmentSection: React.FC<Props> = ({ stagedTreatments, onAdd, onRemove, onClearAll }) => {
  const [formData, setFormData] = useState<TreatmentRow>({
    diagnosis: '',
    treatmentDone: '',
    quadrantRU: '',
    quadrantLU: '',
    quadrantRL: '',
    quadrantLL: '',
    name: '', // We'll map "Treatment Done" to "name" as well
  });

  const handleQuadrantChange = (q: keyof TreatmentRow, val: string) => {
    setFormData(prev => ({ ...prev, [q]: val }));
  };

  const handleAdd = () => {
    // If absolutely nothing is entered, don't add
    const hasAnyContent = formData.diagnosis.trim() || formData.treatmentDone.trim() || 
                         formData.quadrantRU || formData.quadrantLU || 
                         formData.quadrantRL || formData.quadrantLL;
    
    if (!hasAnyContent) return;

    onAdd({ ...formData, name: formData.treatmentDone || 'Procedure' });
    setFormData({
      diagnosis: '',
      treatmentDone: '',
      quadrantRU: '',
      quadrantLU: '',
      quadrantRL: '',
      quadrantLL: '',
      name: '',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <Grid3X3 size={18} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Diagnosis & Treatment</h3>
        </div>
        <button 
          onClick={onClearAll} 
          className="px-3 py-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100 uppercase tracking-wider"
        >
          Clear All
        </button>
      </div>

      {/* Main Container Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider ml-1">Diagnosis</label>
              <textarea
                rows={2}
                value={formData.diagnosis}
                onChange={e => setFormData(p => ({ ...p, diagnosis: e.target.value }))}
                placeholder="Briefly describe the clinical findings..."
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white transition-all outline-none resize-none min-h-[60px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider ml-1">Treatment Done</label>
              <textarea
                rows={2}
                value={formData.treatmentDone}
                onChange={e => setFormData(p => ({ ...p, treatmentDone: e.target.value }))}
                placeholder="Describe the procedure performed..."
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:bg-white transition-all outline-none resize-none min-h-[60px]"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider ml-1">Anatomical Mapping (Quadrants)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'quadrantRU', label: 'RU (Right Upper)' },
                { id: 'quadrantLU', label: 'LU (Left Upper)' },
                { id: 'quadrantRL', label: 'RL (Right Lower)' },
                { id: 'quadrantLL', label: 'LL (Left Lower)' },
              ].map(q => (
                <div key={q.id} className="relative group">
                  <input
                    placeholder={q.label.split(' ')[0]}
                    value={(formData as any)[q.id]}
                    onChange={e => handleQuadrantChange(q.id as keyof TreatmentRow, e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-300 uppercase pointer-events-none group-focus-within:opacity-0">
                    {q.label.split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleAdd}
              disabled={!(formData.diagnosis.trim() || formData.treatmentDone.trim() || formData.quadrantRU || formData.quadrantLU || formData.quadrantRL || formData.quadrantLL)}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 uppercase tracking-widest shadow-md active:scale-95"
            >
              <Plus size={16} /> Add Procedure
            </button>
          </div>
        </div>

        {/* Integrated Procedures Table */}
        {stagedTreatments.length > 0 && (
          <div className="border-t border-slate-200 animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="bg-slate-50/80 px-5 py-2.5 flex items-center gap-2 border-b border-slate-200">
              <ClipboardList size={14} className="text-slate-500" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">Staged Procedures ({stagedTreatments.length})</span>
            </div>
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="px-6 py-3 font-black text-slate-900 uppercase text-[11px] tracking-widest">Diagnosis</th>
                  <th className="px-6 py-3 font-black text-slate-900 uppercase text-[11px] tracking-widest">Treatment Done</th>
                  <th className="px-6 py-3 font-black text-slate-900 uppercase text-[11px] tracking-widest">Quadrants</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {stagedTreatments.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-6 py-4 align-top text-slate-700 font-medium text-[13px] max-w-[200px] break-words">{row.diagnosis || <span className="text-slate-300">N/A</span>}</td>
                    <td className="px-6 py-4 align-top text-slate-900 font-bold text-[13px] max-w-[200px] break-words">{row.treatmentDone || <span className="text-slate-300">N/A</span>}</td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-wrap gap-1.5">
                        {row.quadrantRU && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-bold uppercase">RU: {row.quadrantRU}</span>}
                        {row.quadrantLU && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-bold uppercase">LU: {row.quadrantLU}</span>}
                        {row.quadrantRL && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-bold uppercase">RL: {row.quadrantRL}</span>}
                        {row.quadrantLL && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-bold uppercase">LL: {row.quadrantLL}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => onRemove(idx)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </td>
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
