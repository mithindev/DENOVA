import React, { useEffect, useState } from 'react';
import { Users, Search, Phone, Calendar, ChevronRight, UserRoundSearch, ArrowLeft, MoreHorizontal, User, MapPin, Activity, Clock, UserPlus, Save, Loader2 } from 'lucide-react';
import api from '../api/api.client';
import { formatDate, cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface Appointment {
  id: string;
  date: string;
  reason: string | null;
  status: string;
  doctor: {
    name: string;
  } | null;
}

interface PatientDetail extends Patient {
  mobile: string | null;
  age: number | null;
  bloodGroup: string | null;
  fathersName: string | null;
  address1: string | null;
  address2: string | null;
  address3: string | null;
  regDate: string;
  currentWeight: number | null;
  height: number | null;
  appointments: Appointment[];
}

interface Patient {
  id: string;
  opNo: string | null;
  name: string;
  phone: string | null;
  mobile: string | null;
  gender: string | null;
  createdAt: string;
}

export const PatientRevisitPage: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<PatientDetail | null>(null);
  
  // Measurement editing state
  const [editMeasures, setEditMeasures] = useState({ weight: '', height: '' });
  const [updatingMeasures, setUpdatingMeasures] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async (query = '') => {
    setLoading(true);
    try {
      const res = await api.get('/patients', { params: { query, limit: 15 } });
      setPatients(res.data);
    } catch (err) {
      console.error('Failed to fetch patients', err);
    } finally {
      setLoading(false);
    }
  };

  const selectPatient = async (id: string) => {
    try {
      const res = await api.get(`/patients/${id}`);
      const data = res.data;
      setSelectedPatient(data);
      setEditMeasures({
        weight: data.currentWeight?.toString() || '',
        height: data.height?.toString() || ''
      });
    } catch (err) {
      console.error('Failed to fetch patient detail', err);
    }
  };

  const updateMeasurements = async () => {
    if (!selectedPatient) return;
    setUpdatingMeasures(true);
    try {
      const res = await api.patch(`/patients/${selectedPatient.id}`, {
        currentWeight: editMeasures.weight ? parseFloat(editMeasures.weight) : null,
        height: editMeasures.height ? parseFloat(editMeasures.height) : null,
      });
      setSelectedPatient({ ...selectedPatient, ...res.data });
      alert('Measurements updated successfully');
    } catch (err) {
      console.error('Failed to update measurements', err);
      alert('Update failed');
    } finally {
      setUpdatingMeasures(false);
    }
  };

  const isMeasuresDirty = selectedPatient && (
    editMeasures.weight !== (selectedPatient.currentWeight?.toString() || '') ||
    editMeasures.height !== (selectedPatient.height?.toString() || '')
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRevisit = async () => {
    if (!selectedPatient) return;
    setIsSubmitting(true);
    try {
      // Create a "WAITING" appointment for today
      await api.post('/appointments', {
        patientId: selectedPatient.id,
        doctorId: null, // User can assign later in appointments page
        date: new Date().toISOString(),
        status: 'WAITING',
        reason: 'Revisit Checklist',
        duration: 30
      });
      alert('Patient added to appointment list (Waiting)');
      navigate('/appointments');
    } catch (err) {
      console.error('Failed to submit revisit', err);
      alert('Failed to add patient to appointments list');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!selectedPatient) fetchPatients(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedPatient]);

  if (selectedPatient) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-12">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedPatient(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium text-sm"
          >
            <ArrowLeft size={16} />
            Search Another Patient
          </button>
          
          <div className="flex items-center gap-2">
             <button
                onClick={() => navigate('/patients/registration')}
                className="px-4 py-2 border rounded-lg text-xs font-bold hover:bg-accent transition-all bg-card flex items-center gap-2 shadow-sm"
              >
                <UserPlus size={14} /> New
              </button>
              <button
                onClick={() => navigate('/patients/list')}
                className="px-4 py-2 border rounded-lg text-xs font-bold hover:bg-accent transition-all bg-card flex items-center gap-2 shadow-sm"
              >
                <Users size={14} /> List
              </button>
             <span className="text-[10px] font-bold uppercase text-muted-foreground bg-muted px-2 py-1 rounded ml-2">
                Ref: {selectedPatient.id.slice(0, 8)}
             </span>
          </div>
        </div>

        {/* Modern Patient Card */}
        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-primary/5 p-6 border-b">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center">
                  <User size={32} />
                </div>
                <div>
                  <h1 className="text-2xl font-heading font-bold text-foreground leading-tight">{selectedPatient.name}</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      {selectedPatient.opNo || 'NO OP'}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold uppercase",
                      selectedPatient.gender === 'MALE' ? 'text-blue-600' : 'text-pink-600'
                    )}>
                      {selectedPatient.gender}, {selectedPatient.age || '—'} Yrs
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                {isMeasuresDirty && (
                  <button 
                    onClick={updateMeasurements}
                    disabled={updatingMeasures}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold shadow-md shadow-green-200 hover:bg-green-700 transition-all animate-in zoom-in-95 duration-200"
                  >
                    {updatingMeasures ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Save Changes
                  </button>
                )}
                <button 
                  onClick={handleSubmitRevisit}
                  disabled={isSubmitting}
                  className="flex-1 md:flex-none px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Submit'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x border-b">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground"><Phone size={16} /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Mobile / Phone</p>
                  <p className="text-sm font-medium">
                    {selectedPatient.mobile || '—'} 
                    {selectedPatient.phone && selectedPatient.mobile !== selectedPatient.phone && ` / ${selectedPatient.phone}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground"><Activity size={16} /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Blood Group</p>
                  <p className="text-sm font-medium">{selectedPatient.bloodGroup || '—'}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
               <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground"><User size={16} /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Relation / Father</p>
                  <p className="text-sm font-medium">{selectedPatient.fathersName || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground"><Calendar size={16} /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Registration Date</p>
                  <p className="text-sm font-medium">{formatDate(selectedPatient.regDate)}</p>
                </div>
              </div>
            </div>

            {/* Editable Measurements */}
            <div className="p-6 space-y-4 bg-primary/[0.02]">
               <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Weight (kg)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={editMeasures.weight}
                  onChange={(e) => setEditMeasures(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full bg-transparent border-b border-dashed border-primary/20 focus:border-primary outline-none text-sm font-bold py-1 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Height (cm)</label>
                <input 
                  type="number"
                  step="0.1"
                  value={editMeasures.height}
                  onChange={(e) => setEditMeasures(prev => ({ ...prev, height: e.target.value }))}
                  className="w-full bg-transparent border-b border-dashed border-primary/20 focus:border-primary outline-none text-sm font-bold py-1 transition-all"
                />
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground"><MapPin size={16} /></div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Address</p>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    {[selectedPatient.address1, selectedPatient.address2, selectedPatient.address3]
                      .filter(Boolean)
                      .join(', ') || 'No address provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visit History Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
              <Clock size={20} className="text-primary" />
              Visit History
              <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-2">
                Last 10 Visits
              </span>
            </h2>
          </div>

          <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
            {!selectedPatient.appointments || selectedPatient.appointments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar size={20} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-foreground font-bold">No visits recorded yet</p>
                <p className="text-xs text-muted-foreground mt-1">This patient hasn't had any appointments scheduled.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Attending Doctor</th>
                      <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Reason / Diagnosis</th>
                      <th className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedPatient.appointments.slice(0, 10).map((apt) => (
                      <tr key={apt.id} className="hover:bg-accent/50 transition-all cursor-pointer">
                        <td className="px-6 py-4 font-medium text-foreground">{formatDate(apt.date)}</td>
                        <td className="px-6 py-4 text-muted-foreground">Dr. {apt.doctor?.name || 'Assigned'}</td>
                        <td className="px-6 py-4 text-muted-foreground italic font-medium">{apt.reason || 'General Routine'}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                            apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                            apt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 
                            'bg-primary/10 text-primary'
                          )}>
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <UserRoundSearch size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Patient Revisit</h1>
            <p className="text-muted-foreground text-sm mt-1">Search and select a patient for their visit history</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative group max-w-xl">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search by name, phone, or OP number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 border-2 border-border rounded-xl bg-card text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground font-medium">Fetching patient records...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-muted-foreground" />
            </div>
            <p className="text-foreground font-bold text-lg">No patients found</p>
            <p className="text-muted-foreground mt-1 mb-6">Try adjusting your search criteria</p>
            <button 
              onClick={() => navigate('/patients/registration')}
              className="text-primary font-bold hover:underline"
            >
              Register a new patient instead?
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b">
                <tr>
                  {['OP No', 'Patient Name', 'Contact Info', 'Gender', 'Record Date', ''].map((h) => (
                    <th key={h} className="px-6 py-4 text-left font-bold text-muted-foreground text-[10px] uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {patients.map((p) => (
                  <tr 
                    key={p.id} 
                    onClick={() => selectPatient(p.id)}
                    className="hover:bg-accent/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded border">
                        {p.opNo || 'NEW'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{p.id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1.5 font-bold text-foreground">
                          <Phone size={12} className="text-primary" />
                          {p.mobile || p.phone || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        p.gender === 'MALE' ? 'bg-blue-100 text-blue-700' : 
                        p.gender === 'FEMALE' ? 'bg-pink-100 text-pink-700' : 
                        'bg-slate-100 text-slate-700'
                      )}>
                        {p.gender || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-medium italic">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                        <span className="text-xs font-bold mr-2 uppercase tracking-tight">Select</span>
                        <ChevronRight size={16} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
