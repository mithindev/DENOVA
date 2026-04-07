import React from 'react';
import { Plus, Trash2, Pill, Printer, Eraser } from 'lucide-react';

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
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-2 border-b">
        <div className="flex items-center gap-2">
          <Pill size={16} className="text-primary" />
          <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-tighter">Medicinal Advice</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onPrint} className="px-3 py-1 text-[10px] font-bold text-primary bg-primary/5 rounded border border-primary/20 hover:bg-primary/10 transition-colors uppercase flex items-center gap-1.5">
            <Printer size={12} /> Print Prescription
          </button>
          <button onClick={onClearAll} className="px-3 py-1 text-[10px] font-bold text-red-600 bg-red-50 rounded border border-red-200 hover:bg-red-100 transition-colors uppercase flex items-center gap-1.5">
            <Eraser size={12} /> Clear All
          </button>
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-card transition-all">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-muted/30 border-b">
              <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-wider w-2/5">Medicine Name *</th>
              <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-wider text-center">Total Tablets</th>
              <th className="px-4 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-wider">Dosage</th>
              <th className="px-4 py-4 font-bold text-muted-foreground uppercase text-[9px] tracking-wider text-center">Days</th>
              <th className="px-4 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {prescriptions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-muted-foreground text-[11px] font-medium italic">
                  No medicines prescribed for this visit...
                </td>
              </tr>
            ) : (
              prescriptions.map((p, idx) => (
                <tr key={idx} className="hover:bg-muted/5 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      placeholder="Search medicine..."
                      value={p.medicineName}
                      onChange={e => onChange(idx, 'medicineName', e.target.value)}
                      className="w-full bg-transparent p-1 focus:bg-muted/20 rounded outline-none font-bold text-foreground focus:ring-1 focus:ring-primary/20"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      value={p.totalTablets}
                      onChange={e => onChange(idx, 'totalTablets', parseInt(e.target.value) || 0)}
                      className="w-16 bg-transparent p-1 text-center focus:bg-muted/20 rounded outline-none font-bold text-foreground"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      placeholder="e.g. 1-0-1 after food"
                      value={p.dosage}
                      onChange={e => onChange(idx, 'dosage', e.target.value)}
                      className="w-full bg-transparent p-1 focus:bg-muted/20 rounded outline-none font-medium placeholder:text-muted-foreground/30"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="number"
                      value={p.days}
                      onChange={e => onChange(idx, 'days', parseInt(e.target.value) || 0)}
                      className="w-12 bg-transparent p-1 text-center focus:bg-muted/20 rounded outline-none font-bold text-foreground"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onRemoveRow(idx)} className="p-1.5 text-muted-foreground hover:text-red-500 rounded transition-all">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        <div className="p-3 bg-muted/10 border-t flex justify-center">
          <button onClick={onAddRow} className="flex items-center gap-2 text-[10px] font-bold uppercase text-primary hover:text-primary/70 transition-colors py-1 px-4">
            <Plus size={14} /> Add Medicine Row
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-bold uppercase ml-1">
        <span className="w-1.5 h-1.5 rounded-full bg-primary/20"></span>
        AI Future: Prescriptions will soon be assisted by clinical intelligence.
      </div>
    </div>
  );
};
