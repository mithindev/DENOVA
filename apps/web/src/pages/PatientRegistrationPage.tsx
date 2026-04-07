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

      await api.post('/patients', submissionData);
      navigate('/patients/list');
    } catch (err) {
      console.error('Registration failed', err);
      alert('Failed to register patient. Please check the form and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-accent rounded-full transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">Patient Registration</h1>
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider">New Patient Entry</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/patients/revisit')}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold hover:bg-accent transition-all bg-card"
          >
            <List size={16} />
            List
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold hover:bg-accent transition-all bg-card"
          >
            <RotateCcw size={16} />
            Clear
          </button>
          <button
            form="registration-form"
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50 shadow-md shadow-primary/10"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            Save
          </button>
        </div>
      </div>

      <form id="registration-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column 1: Personal info */}
          <section className="bg-card border rounded-lg p-4 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <UserPlus size={16} className="text-primary" />
              <h2 className="font-bold text-sm">Personal Info</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">OP Number</label>
                <input
                  readOnly
                  type="text"
                  placeholder="Auto-generated"
                  className="w-full px-3 py-1.5 border rounded-md bg-muted/30 text-sm outline-none italic text-muted-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Full Name *</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name"
                  className="w-full px-3 py-1.5 border rounded-md bg-background text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border rounded-md bg-background text-sm outline-none transition-all"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border rounded-md bg-background text-sm outline-none transition-all"
                >
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Date of Birth</label>
                <input
                  type="text"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  placeholder="DD-MM-YYYY"
                  maxLength={10}
                  className="w-full px-3 py-1.5 border rounded-md bg-background text-sm outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Age (Calculated)</label>
                <input
                  readOnly
                  type="text"
                  name="age"
                  value={formData.age}
                  placeholder="Years"
                  className="w-full px-3 py-1.5 border rounded-md bg-muted/50 text-sm outline-none"
                />
              </div>
            </div>
          </section>

          {/* Column 2: Contact info */}
          <section className="bg-card border rounded-lg p-4 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <h2 className="font-bold text-sm">Contact & Family</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Mobile</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border rounded-md bg-background text-sm outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border rounded-md bg-background text-sm outline-none transition-all"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Father's Name</label>
                <input
                  type="text"
                  name="fathersName"
                  value={formData.fathersName}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border rounded-md bg-background text-sm outline-none transition-all"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Address Lines</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    name="address1"
                    placeholder="L1"
                    value={formData.address1}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 border rounded-md bg-background text-xs outline-none transition-all"
                  />
                  <input
                    type="text"
                    name="address2"
                    placeholder="L2"
                    value={formData.address2}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 border rounded-md bg-background text-xs outline-none transition-all"
                  />
                  <input
                    type="text"
                    name="address3"
                    placeholder="L3"
                    value={formData.address3}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 border rounded-md bg-background text-xs outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Measurements & Doctor */}
          <section className="bg-card border rounded-lg p-4 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <h2 className="font-bold text-sm">Measurements & Assign</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Weight(kg)</label>
                <input
                  type="number"
                  step="0.1"
                  name="currentWeight"
                  value={formData.currentWeight}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border rounded-md bg-background text-sm outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Height(cm)</label>
                <input
                  type="number"
                  step="0.1"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border rounded-md bg-background text-sm outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Doctor</label>
                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border rounded-md bg-background text-sm outline-none transition-all"
                >
                  <option value="">Select</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Medical Notes */}
          <section className="bg-card border rounded-lg p-4 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <h2 className="font-bold text-sm">Notes & History</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Allergies</label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-1.5 border rounded-md bg-background text-xs outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground">Medical Notes</label>
                <textarea
                  name="medicalNotes"
                  value={formData.medicalNotes}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-1.5 border rounded-md bg-background text-xs outline-none transition-all"
                />
              </div>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
};
