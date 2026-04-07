import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api/api.client';

// Components
import { PatientCard } from '../components/treatments/PatientCard';
import { DiagnosisTreatmentSection, TreatmentRow } from '../components/treatments/DiagnosisTreatmentSection';
import { ClinicalNotesSection } from '../components/treatments/ClinicalNotesSection';
import { MedicinalAdviceSection, PrescriptionRow } from '../components/treatments/MedicinalAdviceSection';
import { VisitingHistorySection, HistoryItem } from '../components/treatments/VisitingHistorySection';

export const TreatmentsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // App State
  const [appointment, setAppointment] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [stagedTreatments, setStagedTreatments] = useState<TreatmentRow[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState({
    allergies: '',
    clinicalDetails: '',
    appointmentNotes: ''
  });
  const [prescriptions, setPrescriptions] = useState<PrescriptionRow[]>([
    { medicineName: '', totalTablets: 0, dosage: '', days: 0 }
  ]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apptRes = await api.get(`/appointments/${id}`);
      const appt = apptRes.data;
      setAppointment(appt);
      
      // Initialize form with existing data if any (for revisits/edits)
      setClinicalNotes({
        allergies: appt.patient?.allergies || appt.allergies || '',
        clinicalDetails: appt.clinicalDetails || '',
        appointmentNotes: appt.appointmentNotes || appt.notes || ''
      });

      if (appt.patientId) {
        fetchHistory(appt.patientId);
      }
    } catch (err) {
      console.error('Failed to fetch appointment', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (patientId: string) => {
    setHistoryLoading(true);
    try {
      const res = await api.get('/appointments/history', { params: { patientId } });
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSaveAndComplete = async () => {
    if (stagedTreatments.length === 0 && !confirm('No procedures staged. Save anyway?')) return;
    
    setSubmitting(true);
    try {
      await api.post(`/appointments/${id}/complete`, {
        ...clinicalNotes,
        treatments: stagedTreatments,
        prescriptions: prescriptions.filter(p => p.medicineName.trim() !== '')
      });
      
      setSaveSuccess(true);
      setTimeout(() => {
        navigate('/appointments');
      }, 1500);
    } catch (err) {
      console.error('Failed to complete appointment', err);
      alert('Failed to save clinical record. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>Prescription - ${appointment.patient?.name}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            .clinic-name { font-size: 24px; font-weight: bold; text-transform: uppercase; }
            .patient-info { display: flex; justify-content: space-between; margin-bottom: 40px; font-size: 14px; }
            table { w-full; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; border-bottom: 1px solid #ddd; padding: 10px; font-size: 12px; text-transform: uppercase; }
            td { padding: 10px; border-bottom: 1px solid #eee; font-size: 14px; }
            .footer { margin-top: 100px; text-align: right; border-top: 1px solid #ddd; padding-top: 20px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="clinic-name">DENOVA DENTAL CLINIC</div>
            <div>Advanced Oral Care & Implant Centre</div>
            <div style="font-size: 12px; margin-top: 5px;">Contact: +91 9876543210 | Email: care@denova.com</div>
          </div>
          
          <div class="patient-info">
            <div>
              <strong>PATIENT:</strong> ${appointment.patient?.name}<br>
              <strong>AGE/GENDER:</strong> ${appointment.patient?.age}/${appointment.patient?.gender}<br>
              <strong>OP NO:</strong> ${appointment.patient?.opNo || 'WALK-IN'}
            </div>
            <div style="text-align: right">
              <strong>DATE:</strong> ${new Date().toLocaleDateString()}<br>
              <strong>DOCTOR:</strong> ${appointment.doctor?.name || 'In-house Consultant'}
            </div>
          </div>

          <h3 style="text-transform: uppercase; border-left: 4px solid #000; padding-left: 10px;">Prescription</h3>
          <table style="width: 100%">
            <thead>
              <tr>
                <th>Medicine</th>
                <th style="text-align: center">Qty</th>
                <th>Dosage</th>
                <th style="text-align: center">Days</th>
              </tr>
            </thead>
            <tbody>
              ${prescriptions.map(p => `
                <tr>
                  <td><strong>${p.medicineName}</strong></td>
                  <td style="text-align: center">${p.totalTablets}</td>
                  <td>${p.dosage}</td>
                  <td style="text-align: center">${p.days}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <br><br>
            <strong>Authorized Signature</strong>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse tracking-widest uppercase text-xs">Loading clinical records...</p>
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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-30 py-4 border-b">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/appointments')}
            className="p-2 hover:bg-muted rounded-full transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">Clinical Workflow</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {saveSuccess ? (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl border border-green-200 animate-in zoom-in duration-300">
              <CheckCircle2 size={18} />
              <span className="text-xs font-bold uppercase">Saved Successfully</span>
            </div>
          ) : (
            <button 
              onClick={handleSaveAndComplete}
              disabled={submitting}
              className="px-8 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2 uppercase tracking-widest disabled:opacity-50"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
              {submitting ? 'Saving...' : 'Save & Complete'}
            </button>
          )}
        </div>
      </div>

      {/* 0. Patient Card */}
      <PatientCard patient={appointment.patient} status={appointment.status} />

      <div className="grid grid-cols-1 gap-12">
        {/* 1. Diagnosis & Treatment */}
        <DiagnosisTreatmentSection 
          stagedTreatments={stagedTreatments}
          onAdd={row => setStagedTreatments(p => [...p, row])}
          onRemove={idx => setStagedTreatments(p => p.filter((_, i) => i !== idx))}
          onClearAll={() => setStagedTreatments([])}
        />

        {/* 2. Clinical Notes */}
        <ClinicalNotesSection 
          allergies={clinicalNotes.allergies}
          clinicalDetails={clinicalNotes.clinicalDetails}
          appointmentNotes={clinicalNotes.appointmentNotes}
          onChange={(f, v) => setClinicalNotes(p => ({ ...p, [f]: v }))}
        />

        {/* 3. Medicinal Advice */}
        <MedicinalAdviceSection 
          prescriptions={prescriptions}
          onAddRow={() => setPrescriptions(p => [...p, { medicineName: '', totalTablets: 0, dosage: '', days: 0 }])}
          onRemoveRow={idx => setPrescriptions(p => p.filter((_, i) => i !== idx))}
          onChange={(idx, f, v) => {
            const next = [...prescriptions];
            (next[idx] as any)[f] = v;
            setPrescriptions(next);
          }}
          onClearAll={() => setPrescriptions([{ medicineName: '', totalTablets: 0, dosage: '', days: 0 }])}
          onPrint={handlePrint}
        />

        {/* 4. Visiting History */}
        <VisitingHistorySection 
          history={history}
          currentAppointmentId={id || ''}
          loading={historyLoading}
        />
      </div>
    </div>
  );
};
