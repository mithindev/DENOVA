import React, { useState } from 'react';
import { History, Eye, User, Calendar, ExternalLink, X } from 'lucide-react';

export interface HistoryItem {
  id: string;
  date: string;
  opNo: string | null;
  doctor: { name: string } | null;
  treatments: Array<{ name: string; diagnosis: string; treatmentDone: string }>;
  _count: { treatments: number; prescriptions: number };
}

interface Props {
  history: HistoryItem[];
  currentAppointmentId: string;
  loading: boolean;
}

export const VisitingHistorySection: React.FC<Props> = ({ history, currentAppointmentId, loading }) => {
  const [selectedVisit, setSelectedVisit] = useState<HistoryItem | null>(null);

  if (loading) return <div className="h-40 animate-pulse bg-muted/20 rounded-xl mt-6 border border-border/50"></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 py-2 border-b mt-6">
        <History size={16} className="text-primary" />
        <h3 className="text-sm font-bold text-foreground/80 uppercase tracking-tighter">Visiting History</h3>
      </div>

      <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-card overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-muted/10 border-b">
              <th className="px-5 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-wider">Visit Date</th>
              <th className="px-5 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-wider">Doctor</th>
              <th className="px-5 py-3 font-bold text-muted-foreground uppercase text-[9px] tracking-wider">Summary</th>
              <th className="px-5 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 font-medium">
            {history.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                  No previous records found for this patient.
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-muted/5 transition-colors group cursor-pointer ${item.id === currentAppointmentId ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''}`}
                  onClick={() => setSelectedVisit(item)}
                >
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground tracking-tight">{new Date(item.date).toLocaleDateString()}</span>
                      <span className="text-[9px] font-bold uppercase text-muted-foreground">{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                       <User size={12} className="text-primary/40" /> {item.doctor?.name || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1 max-w-[300px]">
                      <span className="text-foreground truncate font-bold">
                        {item.treatments?.[0]?.name || 'N/A'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">{item._count.treatments} Procedures</span>
                        <span className="w-1 h-1 rounded-full bg-border"></span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">{item._count.prescriptions} Meds</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="p-2 text-muted-foreground hover:text-primary transition-all rounded-lg group-hover:bg-primary/10">
                      <Eye size={14} className="group-hover:scale-110 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Side Detail Modal (Simple) */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
           <div 
             className="w-full max-w-lg h-full bg-background border-l shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right-full duration-500"
           >
             <div className="flex items-center justify-between mb-8">
               <div className="space-y-1">
                 <h2 className="text-xl font-bold text-foreground">Visit Detail</h2>
                 <p className="text-xs text-muted-foreground font-bold uppercase flex items-center gap-2">
                   <Calendar size={12} /> {new Date(selectedVisit.date).toLocaleString()}
                 </p>
               </div>
               <button onClick={() => setSelectedVisit(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
                 <X size={20} />
               </button>
             </div>

             <div className="space-y-8">
               <div className="p-4 bg-muted/20 border border-border rounded-xl flex items-center justify-between">
                 <div>
                   <p className="text-[10px] font-bold uppercase text-muted-foreground">Doctor In-charge</p>
                   <p className="text-sm font-bold text-foreground">{selectedVisit.doctor?.name || 'Unknown'}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Status</p>
                    <p className="text-xs font-bold text-primary">COMPLETED</p>
                 </div>
               </div>

               <div className="space-y-4">
                 <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                    <ExternalLink size={12} /> Procedure History
                 </h4>
                 {selectedVisit.treatments && selectedVisit.treatments.length > 0 ? (
                   <div className="space-y-4">
                     {selectedVisit.treatments.map((t, i) => (
                       <div key={i} className="p-5 border border-border/50 rounded-2xl bg-card hover:border-primary/20 transition-colors">
                         <h5 className="font-bold text-sm text-foreground mb-2">{t.name}</h5>
                         <div className="grid grid-cols-1 gap-3">
                           <div className="space-y-1">
                              <p className="text-[9px] font-bold uppercase text-primary/60">Diagnosis</p>
                              <p className="text-xs font-medium leading-relaxed">{t.diagnosis || 'No record.'}</p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[9px] font-bold uppercase text-primary/60">Treatment Done</p>
                              <p className="text-xs font-medium leading-relaxed">{t.treatmentDone || 'No record.'}</p>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <p className="text-xs italic text-muted-foreground p-10 bg-muted/20 text-center rounded-xl">No treatment records found for this specific visit.</p>
                 )}
               </div>
             </div>

             <div className="mt-12 flex justify-center">
                <button 
                  onClick={() => setSelectedVisit(null)}
                  className="px-8 py-3 bg-foreground text-background rounded-full text-xs font-bold shadow-lg hover:opacity-90 transition-all uppercase tracking-widest"
                >
                  Close History
                </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};
