import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Clock, Search, ChevronLeft, ChevronRight, User, Monitor, CheckCircle2 } from 'lucide-react';
import api from '../api/api.client';
import { formatDate, cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const STATUS_STYLES: Record<string, string> = {
  WAITING: 'bg-amber-100 text-amber-700 border-amber-200',
  SCHEDULED: 'bg-blue-100 text-blue-700 border-blue-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
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
  const [bookingLoading, setBookingLoading] = useState(false);

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
        date: selectedDate,
        status: 'SCHEDULED',
        reason: 'Regular Checkup',
        duration: 30
      });
      setShowBookModal(false);
      setSelectedPatientId('');
      setSearchQuery('');
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

      {/* Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-2xl p-4 flex items-center gap-4 shadow-sm border-amber-100">
           <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
             <Clock size={24} />
           </div>
           <div>
             <p className="text-[10px] font-bold uppercase text-muted-foreground">Waiting</p>
             <p className="text-xl font-bold text-foreground">{appointments.filter(a => a.status === 'WAITING').length}</p>
           </div>
        </div>
        <div className="bg-card border rounded-2xl p-4 flex items-center gap-4 shadow-sm border-blue-100">
           <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
             <Calendar size={24} />
           </div>
           <div>
             <p className="text-[10px] font-bold uppercase text-muted-foreground">Scheduled</p>
             <p className="text-xl font-bold text-foreground">{appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'WAITING').length}</p>
           </div>
        </div>
        <div className="bg-card border rounded-2xl p-4 flex items-center gap-4 shadow-sm border-green-100">
           <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
             <CheckCircle2 size={24} />
           </div>
           <div>
             <p className="text-[10px] font-bold uppercase text-muted-foreground">Completed</p>
             <p className="text-xl font-bold text-foreground">{appointments.filter(a => a.status === 'COMPLETED').length}</p>
           </div>
        </div>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-3">
             <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
             <p className="text-muted-foreground font-medium">Getting queue details...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-20 text-center">
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Patient Details</th>
                  <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">OP Number</th>
                  <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Assigned Doctor</th>
                  <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Time / Duration</th>
                  <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Reason / Notes</th>
                  <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments.map((a) => (
                  <tr 
                    key={a.id} 
                    onClick={() => navigate(`/appointments/${a.id}/treatments`)}
                    className="hover:bg-accent/50 transition-all cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
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
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-primary/60" />
                        <span>{a.doctor?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1.5 font-bold text-foreground">
                          <Clock size={12} className="text-primary" />
                          {new Date(a.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-4.5">{a.duration} mins</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground italic truncate max-w-[200px]">
                      {a.reason || 'Regular Visit'}
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
        )}
      </div>

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowBookModal(false)} />
          <div className="relative bg-card border rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b">
              <h2 className="text-xl font-heading font-bold">Book Appointment</h2>
              <p className="text-sm text-muted-foreground">Select a patient and schedule a visit</p>
            </div>
            
            <form onSubmit={handleBookAppointment} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <Search size={14} /> Search Patient
                </label>
                <input 
                  type="text"
                  placeholder="Type patient name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
                
                {patients.length > 0 && (
                  <div className="mt-2 border rounded-lg divide-y bg-background overflow-hidden animate-in slide-in-from-top-1">
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
                          "w-full px-4 py-2.5 text-left text-sm hover:bg-accent transition-colors flex items-center justify-between group",
                          selectedPatientId === p.id && "bg-primary/5"
                        )}
                      >
                        <div>
                          <p className="font-bold group-hover:text-primary transition-colors">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">{p.phone || p.mobile || p.opNo}</p>
                        </div>
                        {selectedPatientId === p.id && <CheckCircle2 size={16} className="text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Selected Date</label>
                <div className="px-4 py-2 border rounded-xl bg-muted/30 text-sm font-medium">
                  {formatDate(selectedDate)}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="flex-1 px-4 py-2 border rounded-xl text-sm font-bold hover:bg-accent transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!selectedPatientId || bookingLoading}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {bookingLoading ? 'Booking...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
