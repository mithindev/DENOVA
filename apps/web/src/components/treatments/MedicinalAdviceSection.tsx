import React from 'react';
import { Trash2, Pill, Printer, Eraser, CheckCircle2 } from 'lucide-react';

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

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
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
                  Initializing Prescription Ledger...
                </td>
              </tr>
            ) : (
              prescriptions.map((p, idx) => (
                <tr key={idx} className="hover:bg-emerald-50/10 transition-colors group">
                  <td className="px-6 py-4">
                    <input
                      placeholder="Search or enter medicine..."
                      value={p.medicineName}
                      onChange={e => onChange(idx, 'medicineName', e.target.value)}
                      className="w-full bg-slate-50/50 px-4 py-2.5 rounded-lg text-slate-900 border border-slate-200 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all outline-none font-bold text-[14px]"
                    />
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
                      onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        onChange(idx, 'days', val);
                        if (idx === prescriptions.length - 1 && val > 0 && p.medicineName.trim() !== '') {
                          onAddRow();
                        }
                      }}
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
      
      <div className="flex items-center gap-2.5 text-[11px] text-slate-400 font-bold uppercase ml-1 tracking-wider bg-slate-50 w-fit px-3 py-1 rounded-full border border-slate-100">
        <CheckCircle2 size={12} className="text-emerald-500" />
        Record auto-saves incrementally
      </div>
    </div>
  );
};
