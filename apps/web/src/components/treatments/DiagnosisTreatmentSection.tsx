import React, { useState } from 'react';
import { Plus, Trash2, ClipboardList, Grid3X3, RefreshCw } from 'lucide-react';

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
    if (!formData.diagnosis || !formData.treatmentDone) return;
    onAdd({ ...formData, name: formData.treatmentDone });
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

  // Auto-add when all quadrants or primary fields are filled (optional UX)
  // For now, let's keep it explicit with a "Stage" button or auto-trigger on blurring the last field
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10 py-2 border-b">
        <h3 className="text-sm font-bold flex items-center gap-2 text-foreground/80 uppercase tracking-tighter">
          <Grid3X3 size={16} className="text-primary" /> Diagnosis & Treatment
        </h3>
        <button onClick={onClearAll} className="px-3 py-1 text-[10px] font-bold text-red-600 bg-red-50 rounded border border-red-200 hover:bg-red-100 transition-colors uppercase">
          Clear All
        </button>
      </div>

      {/* Input Grid */}
      <div className="bg-card border border-border shadow-sm rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-tight">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Diagnosis *</label>
            <textarea
              rows={2}
              value={formData.diagnosis}
              onChange={e => setFormData(p => ({ ...p, diagnosis: e.target.value }))}
              placeholder="e.g. Deep carious lesion on 16..."
              className="w-full px-4 py-3 bg-muted/20 border-border border rounded-xl text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none min-h-[80px]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Treatment Done *</label>
            <textarea
              rows={2}
              value={formData.treatmentDone}
              onChange={e => setFormData(p => ({ ...p, treatmentDone: e.target.value }))}
              placeholder="e.g. Composite filling, scaling..."
              className="w-full px-4 py-3 bg-muted/20 border-border border rounded-xl text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none min-h-[80px]"
            />
          </div>
        </div>

        {/* Quadrants Grid */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1 tracking-wider">Tooth Quadrants (Optional)</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'quadrantRU', label: 'RU (Right Upper)' },
              { id: 'quadrantLU', label: 'LU (Left Upper)' },
              { id: 'quadrantRL', label: 'RL (Right Lower)' },
              { id: 'quadrantLL', label: 'LL (Left Lower)' },
            ].map(q => (
              <div key={q.id} className="space-y-1">
                <div className="relative group">
                  <input
                    placeholder={q.label.split(' ')[0]}
                    value={(formData as any)[q.id]}
                    onChange={e => handleQuadrantChange(q.id as keyof TreatmentRow, e.target.value)}
                    className="w-full px-3 py-2 bg-muted/20 border border-border rounded-lg text-xs font-bold focus:bg-background transition-all outline-none"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/30 pointer-events-none group-focus-within:opacity-0">
                    {q.label.split(' ')[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAdd}
            disabled={!formData.diagnosis || !formData.treatmentDone}
            className="px-6 py-2 bg-foreground text-background rounded-xl text-xs font-bold shadow-lg hover:opacity-90 transition-all disabled:opacity-30 flex items-center gap-2 uppercase tracking-widest"
          >
            <Plus size={14} /> Add Procedure
          </button>
        </div>
      </div>

      {/* Staging Area (Table) */}
      {stagedTreatments.length > 0 && (
        <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-card animate-in fade-in slide-in-from-top-2 duration-400">
          <div className="bg-muted/30 px-5 py-3 border-b flex items-center justify-between">
            <h4 className="text-[10px] font-bold uppercase text-foreground/60 flex items-center gap-2">
              <ClipboardList size={12} /> Staged Procedures ({stagedTreatments.length})
            </h4>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/10 border-b">
                <th className="px-5 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-wider">Diagnosis</th>
                <th className="px-5 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-wider">Treatment</th>
                <th className="px-5 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-wider">Quadrants</th>
                <th className="px-5 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {stagedTreatments.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/5 transition-colors">
                  <td className="px-5 py-4 align-top max-w-[200px] break-words">{row.diagnosis}</td>
                  <td className="px-5 py-4 align-top max-w-[200px] break-words font-bold">{row.treatmentDone}</td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-wrap gap-1.5 mt-0.5">
                      {row.quadrantRU && <span className="px-1.5 py-0.5 bg-primary/5 text-primary border border-primary/20 rounded text-[9px] font-bold">RU: {row.quadrantRU}</span>}
                      {row.quadrantLU && <span className="px-1.5 py-0.5 bg-primary/5 text-primary border border-primary/20 rounded text-[9px] font-bold">LU: {row.quadrantLU}</span>}
                      {row.quadrantRL && <span className="px-1.5 py-0.5 bg-primary/5 text-primary border border-primary/20 rounded text-[9px] font-bold">RL: {row.quadrantRL}</span>}
                      {row.quadrantLL && <span className="px-1.5 py-0.5 bg-primary/5 text-primary border border-primary/20 rounded text-[9px] font-bold">LL: {row.quadrantLL}</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right align-middle">
                    <button onClick={() => onRemove(idx)} className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-all group">
                      <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
