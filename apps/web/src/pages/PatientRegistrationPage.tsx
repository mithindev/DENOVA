import React, { useState, useEffect } from 'react';
import { UserPlus, Save, ArrowLeft, Loader2, List, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api.client';
import { useAuth } from '../context/AuthContext';

export const PatientRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const initialFormData = {
    opNo: '',
    name: '',
    phone: '',
    mobile: '',
    email: '',
    dateOfBirth: '',
    age: '',
    gender: 'MALE',
    bloodGroup: '',
    currentWeight: '',
    height: '',
    fathersName: '',
    address1: '',
    address2: '',
    address3: '',
    doctorId: '',
    allergies: '',
    medicalNotes: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  const resetForm = () => {
    setFormData(initialFormData);
  };

  useEffect(() => {
    // Fetch doctors for the dropdown
    api.get('/staff').then(res => {
      const docs = res.data.filter((s: any) => s.role === 'DOCTOR' || s.role === 'ADMIN');
      setDoctors(docs);
    }).catch(err => {
      console.error('Failed to fetch doctors', err);
    });

    // Fetch next OP number
    api.get('/patients/next-op-no').then(res => {
      if (res.data.opNo) {
        setFormData(prev => ({ ...prev, opNo: res.data.opNo }));
      }
    }).catch(err => {
      console.error('Failed to fetch next OP No', err);
    });
  }, []);

  const calculateAge = (dob: string) => {
    if (!dob || dob.length < 10) return '';
    const [day, month, year] = dob.split('-').map(Number);
    if (!day || !month || !year || year < 1900) return '';
    
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age.toString() : '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'dateOfBirth') {
      // Only digits
      let val = value.replace(/\D/g, '');
      if (val.length > 8) val = val.slice(0, 8);

      let formatted = '';
      if (val.length > 0) {
        formatted = val.slice(0, 2);
        if (val.length > 2) {
          formatted += '-' + val.slice(2, 4);
          if (val.length > 4) {
            formatted += '-' + val.slice(4, 8);
          }
        }
      }
      
      const age = calculateAge(formatted);
      setFormData(prev => ({ ...prev, [name]: formatted, age }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const [day, month, year] = formData.dateOfBirth.split('-');
      const isoDate = year && month && day ? `${year}-${month}-${day}` : null;

      const submissionData: any = {
        ...formData,
        dateOfBirth: isoDate,
        age: formData.age ? parseInt(formData.age) : null,
        currentWeight: formData.currentWeight ? parseFloat(formData.currentWeight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        registeredById: user?.id,
      };

      // Convert empty strings to null for nullable fields (like email)
      Object.keys(submissionData).forEach(key => {
        if (submissionData[key] === '') {
          submissionData[key] = null;
        }
      });

      const res = await api.post('/patients', submissionData);
      const newPatient = res.data;

      // Create a "WAITING" appointment for today
      try {
        await api.post('/appointments', {
          patientId: newPatient.id,
          doctorId: submissionData.doctorId,
          date: new Date().toISOString(),
          status: 'WAITING',
          reason: 'Initial Visit',
          duration: 30
        });
      } catch (apptErr) {
        console.error('Failed to create initial appointment', apptErr);
        // We don't want to block the whole flow if appointment creation fails,
        // but it's good to know.
      }

      navigate('/appointments');
    } catch (err) {
      console.error('Registration failed', err);
      alert('Failed to register patient. Please check the form and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-4 px-4 overflow-hidden h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-accent rounded-full transition-all border border-transparent hover:border-border shadow-sm bg-card"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-heading font-black text-foreground tracking-tight">Patient Registration</h1>
            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-[0.15em]">New Medical Record</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/patients/list')}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-bold hover:bg-accent transition-all bg-card shadow-sm"
          >
            <List size={16} />
            Patient List
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-bold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all bg-card shadow-sm"
          >
            <RotateCcw size={16} />
            Reset
          </button>
          <button
            form="registration-form"
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Save Registration
          </button>
        </div>
      </div>

      <form id="registration-form" onSubmit={handleSubmit} className="flex-1 min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
          {/* Column 1: Personal info */}
          <section className="bg-card border rounded-xl p-4 shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center gap-2 border-b pb-2 shrink-0">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <UserPlus size={16} className="text-primary" />
              </div>
              <h2 className="font-bold text-base tracking-tight">Personal Profile</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Full Name *</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full px-3 py-1.5 border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">DOB</label>
                <input
                  type="text"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  placeholder="DD-MM-YYYY"
                  maxLength={10}
                  className="w-full px-3 py-1.5 border rounded-lg bg-background text-sm outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Age</label>
                <input
                  readOnly
                  type="text"
                  name="age"
                  value={formData.age}
                  placeholder="Years"
                  className="w-full px-3 py-1.5 border rounded-lg bg-muted/30 text-sm italic text-muted-foreground pointer-events-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border rounded-lg bg-background text-sm outline-none transition-all"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border rounded-lg bg-background text-sm outline-none transition-all"
                >
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1 pt-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">OP Number</label>
                <input
                  type="text"
                  name="opNo"
                  value={formData.opNo}
                  onChange={handleChange}
                  placeholder="Enter OP Number (or leave for auto)"
                  className="w-full px-3 py-1.5 border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Column 2: Contact info */}
          <section className="bg-card border rounded-xl p-4 shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center gap-2 border-b pb-2 shrink-0">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <h2 className="font-bold text-base tracking-tight">Contact</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Mobile</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border rounded-lg bg-background text-sm outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Landline</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border rounded-lg bg-background text-sm outline-none transition-all"
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Guardian Name</label>
                <input
                   type="text"
                   name="fathersName"
                   value={formData.fathersName}
                   onChange={handleChange}
                   className="w-full px-3 py-1.5 border rounded-lg bg-background text-sm transition-all"
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Address</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    name="address1"
                    placeholder="Line 1"
                    value={formData.address1}
                    onChange={handleChange}
                    className="w-full px-3 py-1.5 border rounded-lg bg-background text-xs transition-all"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="address2"
                      placeholder="Line 2"
                      value={formData.address2}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 border rounded-lg bg-background text-xs transition-all"
                    />
                    <input
                      type="text"
                      name="address3"
                      placeholder="Line 3"
                      value={formData.address3}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 border rounded-lg bg-background text-xs transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Column 3: Vitals & Notes */}
          <div className="space-y-4 flex flex-col h-full overflow-hidden">
            {/* Vitals */}
            <section className="bg-card border rounded-xl p-4 shadow-sm space-y-4 shrink-0">
              <div className="flex items-center gap-2 border-b pb-2">
                <div className="p-1.5 bg-primary/10 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line></svg>
                </div>
                <h2 className="font-bold text-base tracking-tight">Clinical Vitals</h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Wt(kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="currentWeight"
                    value={formData.currentWeight}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 border rounded-lg bg-background text-sm transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Ht(cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 border rounded-lg bg-background text-sm transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Doctor</label>
                  <select
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 border rounded-lg bg-background text-xs transition-all font-semibold"
                  >
                    <option value="">Select</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Notes */}
            <section className="bg-card border rounded-xl p-4 shadow-sm flex-1 min-h-0 flex flex-col space-y-3 overflow-hidden">
              <div className="flex items-center gap-2 border-b pb-2 shrink-0">
                <div className="p-1.5 bg-primary/10 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14.5 2 14.5 7.5 20 7.5"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
                </div>
                <h2 className="font-bold text-base tracking-tight">Clinical History</h2>
              </div>
              <div className="flex-1 flex flex-col gap-3 min-h-0">
                <div className="flex-1 flex flex-col space-y-1 min-h-0">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider shrink-0">Allergies</label>
                  <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    className="flex-1 w-full px-3 py-2 border rounded-lg bg-background text-xs transition-all resize-none overflow-y-auto"
                    placeholder="Allergies..."
                  />
                </div>
                <div className="flex-1 flex flex-col space-y-1 min-h-0">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider shrink-0">Medical Notes</label>
                  <textarea
                    name="medicalNotes"
                    value={formData.medicalNotes}
                    onChange={handleChange}
                    className="flex-1 w-full px-3 py-2 border rounded-lg bg-background text-xs transition-all resize-none overflow-y-auto"
                    placeholder="Medical history/notes..."
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </form>
    </div>
  );
};
