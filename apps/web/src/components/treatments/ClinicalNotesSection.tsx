import React from 'react';
import { AlertTriangle, StickyNote, ClipboardPen } from 'lucide-react';

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
      <div className="flex items-center gap-2 py-2 border-b">
        <StickyNote size={16} className="text-primary" />
        <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-tighter">Clinical Notes (Details)</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allergies */}
        <div className="bg-card border-l-4 border-l-red-500 border border-border shadow-sm rounded-xl p-5 space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-red-600 flex items-center gap-1.5 tracking-wider">
              <AlertTriangle size={12} /> Allergies
            </span>
          </div>
          <textarea
            value={allergies}
            onChange={e => handleTextChange('allergies', e.target.value, e)}
            placeholder="No known allergies recorded..."
            className="w-full bg-transparent text-sm font-medium outline-none resize-none min-h-[100px] leading-relaxed placeholder:text-muted-foreground/30"
          />
        </div>

        {/* Clinical Details */}
        <div className="bg-card border-l-4 border-l-primary border border-border shadow-sm rounded-xl p-5 space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-primary flex items-center gap-1.5 tracking-wider">
              <ClipboardPen size={12} /> Clinical Details
            </span>
          </div>
          <textarea
            value={clinicalDetails}
            onChange={e => handleTextChange('clinicalDetails', e.target.value, e)}
            placeholder="Clinical observations, history..."
            className="w-full bg-transparent text-sm font-medium outline-none resize-none min-h-[100px] leading-relaxed placeholder:text-muted-foreground/30"
          />
        </div>

        {/* Appointment Notes */}
        <div className="bg-card border-l-4 border-l-amber-500 border border-border shadow-sm rounded-xl p-5 space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-amber-600 flex items-center gap-1.5 tracking-wider">
              <StickyNote size={12} /> Appointment Notes
            </span>
          </div>
          <textarea
            value={appointmentNotes}
            onChange={e => handleTextChange('appointmentNotes', e.target.value, e)}
            placeholder="Next visit reminders, instructions..."
            className="w-full bg-transparent text-sm font-medium outline-none resize-none min-h-[100px] leading-relaxed placeholder:text-muted-foreground/30"
          />
        </div>
      </div>
    </div>
  );
};
