import React from 'react';
import { User, Phone, Calendar, HeartPulse, Activity } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  opNo: string | null;
  phone: string | null;
  mobile: string | null;
  gender: string | null;
  age: number | null;
  bloodGroup: string | null;
}

interface PatientCardProps {
  patient: Patient;
  status: string;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient, status }) => {
  return (
    <div className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
      <div className="p-1.5 bg-primary/5 flex items-center justify-between border-b">
        <span className="text-[10px] font-bold uppercase text-primary/60 px-3 flex items-center gap-1.5">
          <User size={10} /> Clinical ID: {patient.opNo || 'WALK-IN'}
        </span>
        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
          status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700 border border-amber-200'
        }`}>
          {status}
        </span>
      </div>
      
      <div className="p-5 flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="flex items-center gap-4 flex-1">
          <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 text-primary rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm border border-primary/10 shrink-0">
            {patient.name?.[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">{patient.name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <Activity size={12} className="text-primary/50" /> {patient.gender || '—'}, {patient.age || '—'} yrs
              </span>
              {patient.bloodGroup && (
                <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 uppercase">
                  <HeartPulse size={12} /> {patient.bloodGroup}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:w-auto w-full border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-border/50">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Contact No</p>
            <p className="text-sm font-bold flex items-center gap-2">
              <Phone size={14} className="text-primary" /> {patient.phone || patient.mobile || 'No Contact'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Appointment</p>
            <p className="text-sm font-bold flex items-center gap-2">
              <Calendar size={14} className="text-primary" /> Today
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
