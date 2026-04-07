import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Clock, Search, ChevronLeft, ChevronRight, Monitor, CheckCircle2 } from 'lucide-react';
import api from '../api/api.client';
import { formatDate, cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const STATUS_STYLES: Record<string, string> = {
  WAITING: 'bg-amber-100 text-amber-700 border-amber-200',
  SCHEDULED: 'bg-blue-100 text-blue-700 border-blue-200',
  COMPLETED: 'bg-green-600 text-white border-green-700 shadow-sm shadow-green-100',
  CANCELLED: 'bg-red-100 text-red-600 border-red-200',
  NO_SHOW: 'bg-gray-100 text-gray-600 border-gray-200',
};

export const AppointmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showBookModal, setShowBookModal] = useState(false);
  
  // Modal state
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [bookingDate, setBookingDate] = useState(selectedDate);
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  
  useEffect(() => {
    if (showBookModal) {
      setBookingDate(selectedDate);
    }
  }, [showBookModal, selectedDate]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments', { params: { date: selectedDate } });
      setAppointments(res.data);
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  useEffect(() => {
    if (showBookModal && searchQuery.length > 2) {
      const timer = setTimeout(() => {
        api.get('/patients', { params: { query: searchQuery, limit: 5 } }).then(res => {
          setPatients(res.data);
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, showBookModal]);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    setBookingLoading(true);
    try {
      await api.post('/appointments', {
        patientId: selectedPatientId,
        date: new Date(bookingDate).toISOString(),
        status: 'SCHEDULED',
        reason: 'Regular Checkup',
        notes: bookingNotes,
        duration: 30
      });
      setShowBookModal(false);
      setSelectedPatientId('');
      setSearchQuery('');
      setBookingNotes('');
      fetchAppointments();
    } catch (err) {
      console.error('Booking failed', err);
      alert('Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header section with Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Clinic Queue</h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <Monitor size={14} />
            {formatDate(selectedDate)} — {appointments.length} Appointments Found
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-card p-1 border rounded-xl shadow-sm">
           <button 
             onClick={() => changeDate(-1)}
             className="p-1.5 hover:bg-accent rounded-lg transition-colors"
           >
             <ChevronLeft size={18} />
           </button>
           <div className="relative">
             <input 
               type="date"
               value={selectedDate}
               onChange={(e) => setSelectedDate(e.target.value)}
               className="bg-transparent border-none text-sm font-bold px-2 py-1 outline-none text-center"
             />
           </div>
           <button 
             onClick={() => changeDate(1)}
             className="p-1.5 hover:bg-accent rounded-lg transition-colors"
           >
             <ChevronRight size={18} />
           </button>
           <div className="h-4 w-px bg-border mx-1" />
           <button 
             onClick={() => setShowBookModal(true)}
             className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-primary/20"
           >
             <Plus size={16} /> Book
           </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-card border rounded-2xl p-20 text-center flex flex-col items-center gap-3 shadow-sm mt-6">
           <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
           <p className="text-muted-foreground font-medium">Getting queue details...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-card border rounded-2xl p-20 text-center shadow-sm mt-6">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar size={32} className="text-muted-foreground" />
          </div>
          <p className="text-foreground font-bold text-lg">No appointments today</p>
          <p className="text-muted-foreground mt-1 mb-6">Enjoy the free time or book a walk-in!</p>
          <button 
            onClick={() => setShowBookModal(true)}
            className="text-primary font-bold hover:underline"
          >
            Book walk-in patient?
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Active Queue */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                Active Queue
              </h2>
              <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {appointments.filter(a => a.status !== 'COMPLETED').length} Patients Waiting
              </span>
            </div>
            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Token</th>
                      <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Patient Details</th>
                      <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">OP Number</th>
                      <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Time</th>
                      <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Reason / Notes</th>
                      <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {appointments.filter(a => a.status !== 'COMPLETED').map((a) => (
                      <tr 
                        key={a.id} 
                        onClick={() => navigate(`/appointments/${a.id}/treatments`)}
                        className="hover:bg-accent/50 transition-all cursor-pointer group"
                      >
                        <td className="px-6 py-4">
                          <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                            {appointments.indexOf(a) + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs uppercase">
                              {a.patient?.name?.[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground group-hover:text-primary transition-colors">{a.patient?.name}</span>
                              <span className="text-[10px] text-muted-foreground uppercase">{a.patient?.gender}, {a.patient?.age || '—'} yrs</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border">
                            {a.patient?.opNo || 'WALK-IN'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="flex items-center gap-1.5 font-bold text-foreground text-sm">
                              <Clock size={12} className="text-primary" />
                              {new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground italic truncate max-w-[200px]">
                          <div className="flex flex-col">
                            <span className="text-foreground font-medium">{a.reason || 'Regular Visit'}</span>
                            {a.notes && <span className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{a.notes}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            'px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border transition-colors',
                            STATUS_STYLES[a.status] || 'bg-muted text-muted-foreground'
                          )}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Completed Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-600" />
                Completed Consultations
              </h2>
              <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full border border-green-200">
                {appointments.filter(a => a.status === 'COMPLETED').length} Finished
              </span>
            </div>
            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm transition-all border-green-100 shadow-green-50/50">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-green-50/50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Token</th>
                      <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Patient Details</th>
                      <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">OP Number</th>
                      <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Time</th>
                      <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Reason / Notes</th>
                      <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-100/50">
                    {appointments.filter(a => a.status === 'COMPLETED').map((a) => (
                      <tr 
                        key={a.id} 
                        onClick={() => navigate(`/appointments/${a.id}/treatments`)}
                        className="bg-green-50/30 hover:bg-green-50/60 transition-all cursor-pointer group"
                      >
                        <td className="px-6 py-4">
                          <span className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center font-black text-xs border border-green-200">
                            {appointments.indexOf(a) + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                              {a.patient?.name?.[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground group-hover:text-green-700 transition-colors uppercase tracking-tight">{a.patient?.name}</span>
                              <span className="text-[10px] text-muted-foreground uppercase">{a.patient?.gender}, {a.patient?.age || '—'} yrs</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <span className="font-mono text-xs font-bold bg-white/50 px-2 py-0.5 rounded border border-green-200/50">
                            {a.patient?.opNo || 'WALK-IN'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="flex items-center gap-1.5 font-bold text-green-700 text-sm">
                              <Clock size={12} className="text-green-600" />
                              {new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground italic truncate max-w-[200px]">
                          <div className="flex flex-col">
                            <span className="text-green-800/80 font-medium">{a.reason || 'Regular Visit'}</span>
                            {a.notes && <span className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{a.notes}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase bg-green-600 text-white shadow-sm shadow-green-200 border border-green-700">
                            COMPLETED
                          </span>
                        </td>
                      </tr>
                    ))}
                    {appointments.filter(a => a.status === 'COMPLETED').length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-medium italic">
                          No patients completed yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setShowBookModal(false)} />
          <div className="relative bg-card border rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 fade-in duration-300">
            <div className="h-2 bg-primary w-full" />
            
            <div className="p-8 space-y-6">
              <div className="space-y-1">
                <h2 className="text-3xl font-heading font-black text-foreground tracking-tight">Schedule Visit</h2>
                <p className="text-muted-foreground font-medium">Create a new appointment in the clinic queue.</p>
              </div>
              
              <form onSubmit={handleBookAppointment} className="space-y-6">
                {/* Search Patient */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                    <Search size={14} strokeWidth={3} /> 1. Search Patient
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Type name, phone or OP number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={cn(
                        "w-full px-5 py-4 border-2 rounded-2xl bg-muted/20 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-base",
                        selectedPatientId && "border-green-500/50 bg-green-50/10"
                      )}
                    />
                    {selectedPatientId && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600">
                        <CheckCircle2 size={24} fill="currentColor" className="text-green-100" />
                      </div>
                    )}
                  </div>
                  
                  {patients.length > 0 && (
                    <div className="mt-2 border-2 rounded-2xl divide-y bg-background overflow-hidden shadow-xl animate-in slide-in-from-top-4 duration-300 z-10 relative">
                      {patients.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedPatientId(p.id);
                            setSearchQuery(p.name);
                            setPatients([]);
                          }}
                          className={cn(
                            "w-full px-5 py-4 text-left hover:bg-primary/5 transition-colors flex items-center justify-between group",
                            selectedPatientId === p.id && "bg-primary/5"
                          )}
                        >
                          <div>
                            <p className="font-black text-foreground group-hover:text-primary transition-colors">{p.name}</p>
                            <p className="text-xs font-bold text-muted-foreground flex items-center gap-2 mt-1">
                              <span className="bg-muted px-2 py-0.5 rounded text-[10px]">{p.opNo || 'NEW'}</span>
                              {p.phone || p.mobile}
                            </p>
                          </div>
                          <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                      <Calendar size={14} strokeWidth={3} /> 2. Appointment Date
                    </label>
                    <input 
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-5 py-4 border-2 rounded-2xl bg-muted/20 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-bold"
                    />
                  </div>

                  {/* Time / Duration (Hardcoded for now as per instructions, but could be added) */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                      <Clock size={14} strokeWidth={3} /> Status
                    </label>
                    <div className="px-5 py-4 border-2 border-dashed rounded-2xl bg-muted/10 text-sm font-black text-muted-foreground flex items-center justify-center">
                      SCHEDULED
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                    <Monitor size={14} strokeWidth={3} /> 3. Additional Notes
                  </label>
                  <textarea 
                    placeholder="Enter any specific instructions or reason for visit..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    rows={3}
                    className="w-full px-5 py-4 border-2 rounded-2xl bg-muted/20 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm resize-none"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowBookModal(false)}
                    className="flex-1 px-6 py-4 border-2 rounded-2xl text-sm font-black hover:bg-accent transition-all uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!selectedPatientId || bookingLoading}
                    className="flex-[2] px-6 py-4 bg-primary text-primary-foreground rounded-2xl text-sm font-black shadow-xl shadow-primary/20 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    {bookingLoading ? (
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 size={18} strokeWidth={3} />
                        Confirm Booking
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
