import React, { useState } from 'react';
import { 
  History, 
  User, 
  Calendar, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Stethoscope, 
  Pill, 
  ClipboardList, 
  ShieldAlert,
  Clock,
  ArrowRight
} from 'lucide-react';

export interface HistoryItem {
  id: string;
  date: string;
  opNo: string | null;
  doctor: { name: string } | null;
  allergies: string | null;
  clinicalDetails: string | null;
  appointmentNotes: string | null;
  treatments: Array<{
    id: string;
    name: string;
    diagnosis: string;
    treatmentDone: string;
    quadrantRU: string;
    quadrantLU: string;
    quadrantRL: string;
    quadrantLL: string;
  }>;
  prescriptions: Array<{
    id: string;
    medicineName: string;
    totalTablets: number;
    dosage: string;
    days: number;
  }>;
  _count: { treatments: number; prescriptions: number };
}

interface Props {
  history: HistoryItem[];
  currentAppointmentId: string;
  loading: boolean;
}

export const VisitingHistorySection: React.FC<Props> = ({ history, currentAppointmentId, loading }) => {
  const [selectedVisit, setSelectedVisit] = useState<HistoryItem | null>(null);
  const [openSection, setOpenSection] = useState<string | null>('procedures');

  if (loading) return <div className="h-40 animate-pulse bg-slate-50 rounded-xl mt-8 border border-slate-200"></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mt-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <History size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Visiting History</h3>
            <p className="text-xs text-slate-500 font-medium tracking-normal">Historical patient encounter records</p>
          </div>
        </div>
      </div>

      {/* History List - Standard Professional Design */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Date & Time</th>
              <th className="px-6 py-4 text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Consulting Doctor</th>
              <th className="px-6 py-4 text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Primary Record</th>
              <th className="px-6 py-4 text-xs font-black text-slate-900 uppercase tracking-widest leading-none text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <History size={32} className="text-slate-300" />
                    <p className="text-sm font-medium text-slate-400">No previous visits recorded for this patient.</p>
                  </div>
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-blue-50/30 transition-colors group cursor-pointer ${item.id === currentAppointmentId ? 'bg-blue-50/50' : ''}`}
                  onClick={() => setSelectedVisit(item)}
                >
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-100 p-2.5 rounded-lg group-hover:bg-white transition-colors">
                        <Calendar size={16} className="text-slate-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-[14px] leading-none mb-1">
                          {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 uppercase flex items-center gap-1.5">
                          <Clock size={10} /> {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-2 font-semibold text-slate-700 text-[14px]">
                       <User size={14} className="text-blue-400" /> {item.doctor?.name || 'Medical Team'}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="flex flex-col gap-1.5 max-w-[280px]">
                      <span className="text-slate-900 font-bold text-[14px] truncate leading-tight">
                        {item.treatments?.[0]?.name || 'Routine Consultation'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{item._count.treatments} Treatments</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{item._count.prescriptions} Medicines</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle text-right">
                    <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-200">
                      View Details <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modern Sidebar Detail Panel */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300">
           {/* Backdrop Close Target */}
           <div className="absolute inset-0 -z-10" onClick={() => setSelectedVisit(null)} />
           
           <div 
             className="w-full max-w-xl h-full bg-slate-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 ease-out"
           >
             {/* Modal Header */}
             <div className="bg-white px-8 py-6 border-b border-slate-200 flex items-center justify-between shadow-sm">
               <div className="space-y-1">
                 <h2 className="text-xl font-bold text-slate-900 tracking-tight">Visit Record Detail</h2>
                 <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                   <div className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-500" /> {new Date(selectedVisit.date).toLocaleDateString()}</div>
                   <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                   <div className="flex items-center gap-1.5"><Clock size={14} className="text-blue-500" /> {new Date(selectedVisit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                 </div>
               </div>
               <button onClick={() => setSelectedVisit(null)} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                 <X size={20} />
               </button>
             </div>

             <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {/* Doctor Brief Card */}
                <div className="bg-white border border-slate-200 p-6 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-200">
                      {selectedVisit.doctor?.name?.[0] || 'D'}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Consulting Doctor</p>
                      <p className="text-[17px] font-bold text-slate-900">{selectedVisit.doctor?.name || 'Medical Center Specialist'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">ID No.</p>
                     <p className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-md">{selectedVisit.opNo || 'WALK-IN VISIT'}</p>
                  </div>
                </div>

                {/* Clinical Context Dropdowns */}
                <div className="space-y-4">
                  {/* Observation Summary */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <button 
                      onClick={() => setOpenSection(openSection === 'clinical' ? null : 'clinical')}
                      className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${openSection === 'clinical' ? 'bg-slate-50 border-b border-slate-200' : 'bg-white hover:bg-slate-50/50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <ClipboardList size={18} className="text-blue-600" />
                        <span className="text-sm font-bold text-slate-900 tracking-tight">Clinical Observations & Alerts</span>
                      </div>
                      {openSection === 'clinical' ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                    </button>
                    {openSection === 'clinical' && (
                      <div className="p-6 space-y-4 bg-white animate-in slide-in-from-top-1">
                        <div className="space-y-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <h4 className="text-[10px] font-bold text-amber-800 uppercase flex items-center gap-2 tracking-widest">
                            <ShieldAlert size={14} /> Medical Alerts & Warnings
                          </h4>
                          <p className="text-sm font-bold text-amber-950 leading-relaxed italic">
                            {selectedVisit.allergies || 'Patient reports no known medical alerts at the time of visit.'}
                          </p>
                        </div>
                        <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                             Full Consultation Details
                          </h4>
                          <p className="text-sm font-medium text-slate-900 leading-relaxed">
                            {selectedVisit.clinicalDetails || 'No auxiliary clinical details logged for this encounter.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Procedures Summary */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <button 
                      onClick={() => setOpenSection(openSection === 'procedures' ? null : 'procedures')}
                      className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${openSection === 'procedures' ? 'bg-slate-50 border-b border-slate-200' : 'bg-white hover:bg-slate-50/50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Stethoscope size={18} className="text-blue-600" />
                        <span className="text-sm font-bold text-slate-900 tracking-tight">Procedures Done</span>
                      </div>
                      {openSection === 'procedures' ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                    </button>
                    {openSection === 'procedures' && (
                      <div className="p-6 space-y-5 bg-white animate-in slide-in-from-top-1">
                        {selectedVisit.treatments && selectedVisit.treatments.map((t, i) => (
                           <div key={i} className="p-5 border border-slate-200 rounded-xl bg-slate-50/30">
                              <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                                <h5 className="text-[15px] font-bold text-slate-900 italic">{t.name}</h5>
                                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">RECORD #{i+1}</span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Diagnosis</p>
                                  <p className="text-sm font-bold text-slate-900">{t.diagnosis || '—'}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Treatment Procedure</p>
                                  <p className="text-sm font-bold text-slate-900">{t.treatmentDone || '—'}</p>
                                </div>
                                
                                <div className="col-span-full pt-2">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Anatomical Mapping (Quadrants)</p>
                                  <div className="grid grid-cols-4 gap-2">
                                     {[
                                       { l: 'RU', v: t.quadrantRU },
                                       { l: 'LU', v: t.quadrantLU },
                                       { l: 'RL', v: t.quadrantRL },
                                       { l: 'LL', v: t.quadrantLL },
                                     ].map(q => (
                                       <div key={q.l} className={`text-center p-2 rounded border ${q.v ? 'bg-white border-blue-200 shadow-sm' : 'bg-slate-100 border-transparent opacity-40'}`}>
                                          <p className="text-[8px] font-bold text-slate-400 uppercase">{q.l}</p>
                                          <p className="text-[11px] font-bold text-slate-900 truncate">{q.v || '—'}</p>
                                       </div>
                                     ))}
                                  </div>
                                </div>
                              </div>
                           </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Medicines Summary */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <button 
                      onClick={() => setOpenSection(openSection === 'meds' ? null : 'meds')}
                      className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${openSection === 'meds' ? 'bg-slate-50 border-b border-slate-200' : 'bg-white hover:bg-slate-50/50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Pill size={18} className="text-blue-600" />
                        <span className="text-sm font-bold text-slate-900 tracking-tight">Medicinal Prescriptions</span>
                      </div>
                      {openSection === 'meds' ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                    </button>
                    {openSection === 'meds' && (
                      <div className="p-6 bg-white animate-in slide-in-from-top-1">
                        {selectedVisit.prescriptions && selectedVisit.prescriptions.length > 0 ? (
                           <div className="border border-slate-200 rounded-lg overflow-hidden">
                              <table className="w-full text-left">
                                 <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                       <th className="px-4 py-2.5 text-[11px] font-black text-slate-900 uppercase tracking-widest">Medicine</th>
                                       <th className="px-4 py-2.5 text-[11px] font-black text-slate-900 uppercase tracking-widest text-center">Dosage Map</th>
                                       <th className="px-4 py-2.5 text-[11px] font-black text-slate-900 uppercase tracking-widest">Direction</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-100">
                                    {selectedVisit.prescriptions.map((p, pi) => (
                                       <tr key={pi}>
                                          <td className="px-4 py-3 font-bold text-slate-900 text-[14px] leading-tight">
                                            {p.medicineName}
                                            <div className="text-[10px] text-slate-400 font-medium">{p.totalTablets} Total Tablets</div>
                                          </td>
                                          <td className="px-4 py-3 text-center">
                                             <div className="inline-flex items-center justify-center bg-blue-50 text-blue-700 px-2 py-1 rounded text-[11px] font-bold border border-blue-100">
                                                {p.days} Days
                                             </div>
                                          </td>
                                          <td className="px-4 py-3 text-[13px] font-medium text-slate-700 leading-snug">{p.dosage}</td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        ) : (
                           <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                              <p className="text-sm font-medium text-slate-400">No prescription records for this visit.</p>
                           </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
             </div>

             {/* Footer Action */}
             <div className="p-8 bg-white border-t border-slate-200 flex flex-col items-center gap-4">
                <button 
                  onClick={() => setSelectedVisit(null)}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl text-[13px] font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                >
                  Close Record Review
                </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};
