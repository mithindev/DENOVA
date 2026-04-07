import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2, Activity, User, Stethoscope, ClipboardList, Loader2, AlertCircle } from 'lucide-react';
import api from '../api/api.client';

export const TreatmentsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<any>(null);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Treatment Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    toothNumber: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apptRes, treatRes] = await Promise.all([
        api.get(`/appointments/${id}`),
        api.get(`/treatments`, { params: { appointmentId: id } })
      ]);
      setAppointment(apptRes.data);
      setTreatments(treatRes.data);
    } catch (err) {
      console.error('Failed to fetch treatment data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTreatment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/treatments', {
        ...formData,
        appointmentId: id
      });
      setFormData({ name: '', toothNumber: '', notes: '' });
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      console.error('Failed to add treatment', err);
      alert('Failed to save treatment record');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTreatment = async (tid: string) => {
    if (!confirm('Are you sure you want to delete this treatment record?')) return;
    try {
      await api.delete(`/treatments/${tid}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete treatment', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading clinical records...</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-12 text-center">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-bold">Appointment Not Found</h2>
        <button onClick={() => navigate('/appointments')} className="mt-4 text-primary font-bold hover:underline">
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/appointments')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Appointments
        </button>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Plus size={14} /> Add Treatment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient & Appointment Detail */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border-t-4 border-t-primary rounded-2xl p-6 shadow-sm border space-y-6">
            <div className="flex flex-col items-center text-center space-y-3">
               <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center font-bold text-2xl shadow-inner">
                 {appointment.patient?.name?.[0]}
               </div>
               <div>
                 <h2 className="text-xl font-bold text-foreground">{appointment.patient?.name}</h2>
                 <p className="text-[10px] font-bold uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded inline-block mt-1">
                   {appointment.patient?.opNo || 'WALK-IN'}
                 </p>
               </div>
            </div>

            <div className="divide-y border rounded-xl overflow-hidden bg-muted/20">
               <div className="p-3 flex items-center justify-between text-xs">
                 <span className="text-muted-foreground font-bold uppercase tracking-tighter flex items-center gap-2"><User size={12} /> Contact</span>
                 <span className="font-bold">{appointment.patient?.phone || appointment.patient?.mobile || '—'}</span>
               </div>
               <div className="p-3 flex items-center justify-between text-xs">
                 <span className="text-muted-foreground font-bold uppercase tracking-tighter flex items-center gap-2"><Activity size={12} /> Body Stats</span>
                 <span className="font-bold">{appointment.patient?.gender}, {appointment.patient?.age} yrs</span>
               </div>
               <div className="p-3 flex items-center justify-between text-xs">
                 <span className="text-muted-foreground font-bold uppercase tracking-tighter flex items-center gap-2"><ClipboardList size={12} /> Status</span>
                 <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded font-bold uppercase text-[9px]">{appointment.status}</span>
               </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-2">
               <p className="text-[10px] font-bold uppercase text-primary/60">Reason for visit</p>
               <p className="text-sm font-medium italic text-foreground leading-relaxed">"{appointment.reason || 'Not specified'}"</p>
            </div>
          </div>
        </div>

        {/* Right Column: Treatment Records */}
        <div className="lg:col-span-2 space-y-6">
          {showAddForm && (
            <div className="bg-card border-2 border-primary/20 rounded-2xl p-6 shadow-lg animate-in slide-in-from-top-4 duration-300">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="font-bold text-lg flex items-center gap-2"><Stethoscope size={20} className="text-primary" /> New Treatment Record</h3>
                 <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground">✕</button>
               </div>
               <form onSubmit={handleAddTreatment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1 md:col-span-1">
                   <label className="text-[10px] font-bold uppercase text-muted-foreground">Procedure Name *</label>
                   <input required value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="w-full px-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="e.g. Scaling, Root Canal" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-bold uppercase text-muted-foreground">Tooth / Area</label>
                   <input value={formData.toothNumber} onChange={e => setFormData(p => ({...p, toothNumber: e.target.value}))} className="w-full px-4 py-2 border rounded-xl text-sm outline-none" placeholder="e.g. UL1, 16" />
                 </div>
                 <div className="space-y-1 md:col-span-2">
                   <label className="text-[10px] font-bold uppercase text-muted-foreground">Clinical Notes</label>
                   <textarea rows={2} value={formData.notes} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} className="w-full px-4 py-2 border rounded-xl text-sm outline-none" placeholder="Detailed findings..." />
                 </div>
                 <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                   <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm font-bold">Cancel</button>
                   <button type="submit" disabled={submitting} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow hover:opacity-90 transition-all flex items-center gap-2">
                     {submitting ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Save Record
                   </button>
                 </div>
               </form>
            </div>
          )}

          <div className="bg-card border rounded-2xl shadow-sm border overflow-hidden">
             <div className="p-6 border-b flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2"><ClipboardList size={18} className="text-primary" /> Treatment Log</h3>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{treatments.length} Procedures recorded</span>
             </div>
             
             {treatments.length === 0 ? (
               <div className="p-20 text-center space-y-4">
                 <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                   <ClipboardList className="text-muted-foreground" size={32} />
                 </div>
                 <div>
                   <p className="font-bold">No treatments recorded</p>
                   <p className="text-xs text-muted-foreground mt-1">Start by adding the first procedure for this visit</p>
                 </div>
                 <button 
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-all"
                 >
                   Record Treatment
                 </button>
               </div>
             ) : (
               <div className="divide-y">
                 {treatments.map((t, idx) => (
                   <div key={t.id} className="p-6 hover:bg-muted/30 transition-colors flex flex-col md:flex-row justify-between gap-4 group">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-bold text-foreground">{t.name}</h4>
                            {t.toothNumber && (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase border border-blue-100">
                                {t.toothNumber}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed max-w-md">{t.notes || 'No notes added'}</p>
                          <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider mt-1">{new Date(t.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-2">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => deleteTreatment(t.id)}
                            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
