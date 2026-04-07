import React from 'react';
import { AlertTriangle, StickyNote, ClipboardPen, Sparkles } from 'lucide-react';

interface Props {
  allergies: string;
  clinicalDetails: string;
  appointmentNotes: string;
  onChange: (field: string, value: string) => void;
}

export const ClinicalNotesSection: React.FC<Props> = ({ allergies, clinicalDetails, appointmentNotes, onChange }) => {
  const autoExpand = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'inherit';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleTextChange = (field: string, value: string, e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(field, value);
    autoExpand(e);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mt-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
            <StickyNote size={18} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">Clinical Notes (Details)</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
          <Sparkles size={12} className="text-blue-400" /> Auto-Expands Based on Content
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medical Alerts / Allergies */}
        <div className="bg-white border-2 border-slate-100 shadow-sm rounded-xl p-5 space-y-4 hover:border-red-200 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-red-600 flex items-center gap-1.5 tracking-wider bg-red-50 px-2 py-1 rounded">
              <AlertTriangle size={12} /> Medical Alerts & Allergies
            </span>
          </div>
          <textarea
            value={allergies}
            onChange={e => handleTextChange('allergies', e.target.value, e)}
            placeholder="Type allergies here (e.g. Penicillin, Latex)..."
            className="w-full bg-slate-50/50 p-3 rounded-lg text-sm font-bold text-slate-900 outline-none resize-none min-h-[100px] leading-relaxed placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-red-50 focus:border-red-200 transition-all"
          />
        </div>

        {/* Clinical Summary */}
        <div className="bg-white border-2 border-slate-100 shadow-sm rounded-xl p-5 space-y-4 hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-blue-600 flex items-center gap-1.5 tracking-wider bg-blue-50 px-2 py-1 rounded">
              <ClipboardPen size={12} /> Clinical Observation Details
            </span>
          </div>
          <textarea
            value={clinicalDetails}
            onChange={e => handleTextChange('clinicalDetails', e.target.value, e)}
            placeholder="Enter clinical observations, patient history..."
            className="w-full bg-slate-50/50 p-3 rounded-lg text-sm font-bold text-slate-900 outline-none resize-none min-h-[100px] leading-relaxed placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all"
          />
        </div>

        {/* Instruction/Follow-up Notes */}
        <div className="bg-white border-2 border-slate-100 shadow-sm rounded-xl p-5 space-y-4 hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-emerald-600 flex items-center gap-1.5 tracking-wider bg-emerald-50 px-2 py-1 rounded">
              <StickyNote size={12} /> Reminders & Follow-up
            </span>
          </div>
          <textarea
            value={appointmentNotes}
            onChange={e => handleTextChange('appointmentNotes', e.target.value, e)}
            placeholder="Next visit reminders, specific instructions..."
            className="w-full bg-slate-50/50 p-3 rounded-lg text-sm font-bold text-slate-900 outline-none resize-none min-h-[100px] leading-relaxed placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-emerald-50 focus:border-emerald-200 transition-all"
          />
        </div>
      </div>
    </div>
  );
};
