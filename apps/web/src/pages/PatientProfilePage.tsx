import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  Activity, 
  HeartPulse, 
  Camera, 
  ClipboardList, 
  Clock, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  Stethoscope,
  Pill,
  History,
  Maximize2,
  ExternalLink,
  MessageCircle,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Printer,
  Share2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import api from '../api/api.client';
import { formatDate } from '../lib/utils';

// --- Types ---
interface Patient {
  id: string;
  opNo: string | null;
  name: string;
  phone: string | null;
  mobile: string | null;
  email: string | null;
  age: number | null;
  gender: string | null;
  bloodGroup: string | null;
  address: string | null;
  address1: string | null;
  address2: string | null;
  address3: string | null;
  regDate: string;
  allergies: string | null;
  medicalNotes: string | null;
  appointments: Array<{
    id: string;
    date: string;
    status: string;
    reason: string | null;
    clinicalDetails: string | null;
    appointmentNotes: string | null;
    doctor: { name: string; speciality: string | null } | null;
    treatments: Array<{
      id: string;
      name: string;
      diagnosis: string | null;
      treatmentDone: string | null;
      quadrantRU: string | null;
      quadrantLU: string | null;
      quadrantRL: string | null;
      quadrantLL: string | null;
    }>;
    prescriptions: Array<{
      id: string;
      medicineName: string;
      totalTablets: number;
      dosage: string;
      days: number;
    }>;
  }>;
  imagingRecords: Array<{
    id: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    createdAt: string;
  }>;
}

export const PatientProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'imaging' | 'profile'>('timeline');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const fetchPatientData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/patients/${id}`);
      setPatient(res.data);
    } catch (err) {
      console.error('Failed to fetch patient data', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleWhatsAppShare = async (img?: any) => {
    if (!patient) return;
    const phone = patient.mobile || patient.phone;
    if (!phone) {
      alert('Patient does not have a registered phone number.');
      return;
    }

    const rawNumber = phone.replace(/\D/g, '');
    const formattedNumber = rawNumber.length === 10 ? `91${rawNumber}` : rawNumber;
    
    let messageBody = `Hello ${patient.name}, sharing your clinical record from Denova Clinic.`;
    if (img) messageBody += ` File: ${img.fileName}`;
    
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(messageBody)}`;

    // If an image is provided, try to copy it to clipboard first
    if (img) {
      setCopyStatus('Preparing Image...');
      try {
        const response = await fetch(`${api.defaults.baseURL}/imaging/${img.id}`);
        const jpegBlob = await response.blob();
        
        // 1. Convert JPEG to PNG for maximum clipboard compatibility
        const pngBlob = await new Promise<Blob>((resolve, reject) => {
          const image = new Image();
          const url = URL.createObjectURL(jpegBlob);
          image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Failed to get canvas context'));
              return;
            }
            ctx.drawImage(image, 0, 0);
            canvas.toBlob((blob) => {
              URL.revokeObjectURL(url);
              if (blob) resolve(blob);
              else reject(new Error('Canvas toBlob failed'));
            }, 'image/png');
          };
          image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Image load failed'));
          };
          image.src = url;
        });

        // 2. Write PNG to clipboard
        if (navigator.clipboard && window.ClipboardItem) {
          const data = [new ClipboardItem({ 'image/png': pngBlob })];
          await navigator.clipboard.write(data);
          setCopyStatus('Image Ready! Paste in WhatsApp (Ctrl+V)');
        }
      } catch (err) {
        console.warn('Clipboard write/conversion failed', err);
        setCopyStatus('Opening WhatsApp...');
      }
      
      setTimeout(() => setCopyStatus(null), 4000);
    }

    window.open(whatsappUrl, '_blank');
  };

  const handlePrescriptionShare = async (appt: any, action: 'share' | 'print') => {
    if (!patient) return;

    setCopyStatus('Generating Prescription...');
    
    // 1. Create a temporary container for the prescription
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '600px';
    container.style.backgroundColor = 'white';
    container.style.padding = '40px';
    container.style.fontFamily = 'Inter, sans-serif';
    container.style.color = '#0f172a';
    
    // Construct the HTML content for the prescription
    container.innerHTML = `
      <div style="border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="font-size: 24px; font-weight: 900; margin: 0; color: #2563eb;">DENOVA CLINIC</h1>
        <p style="font-size: 10px; font-weight: bold; text-transform: uppercase; margin: 4px 0 0 0; color: #64748b;">Premium Dental Care & Maxillofacial Center</p>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
        <div style="font-size: 12px;">
          <p style="font-weight: 900; margin: 0; text-transform: uppercase; color: #64748b; font-size: 10px;">Patient</p>
          <p style="font-weight: 800; margin: 2px 0 0 0;">${patient.name}</p>
          <p style="margin: 2px 0 0 0;">${patient.gender || '—'}, ${patient.age || '—'}Y</p>
        </div>
        <div style="text-align: right; font-size: 12px;">
          <p style="font-weight: 900; margin: 0; text-transform: uppercase; color: #64748b; font-size: 10px;">OP Number</p>
          <p style="font-weight: 800; margin: 2px 0 0 0;">${patient.opNo || 'WALK-IN'}</p>
          <p style="margin: 2px 0 0 0;">${new Date(appt.date).toLocaleDateString('en-GB')}</p>
        </div>
      </div>

      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 10px; font-weight: 900; color: #2563eb; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 12px;">Prescription Records</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="text-align: left; background-color: #f8fafc;">
              <th style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 800;">Medicine</th>
              <th style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 800; text-align: center;">Duration</th>
              <th style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 800;">Instructions</th>
            </tr>
          </thead>
          <tbody>
            ${appt.prescriptions.map((p: any) => `
              <tr>
                <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; font-weight: 700;">${p.medicineName}</td>
                <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9; text-align: center;">${p.days} Days</td>
                <td style="padding: 10px 8px; border-bottom: 1px solid #f1f5f9;">${p.dosage}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      ${appt.appointmentNotes ? `
        <div style="margin-bottom: 24px; font-size: 11px;">
          <h2 style="font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">General Notes</h2>
          <p style="margin: 0; color: #334155; line-height: 1.5; font-style: italic;">${appt.appointmentNotes}</p>
        </div>
      ` : ''}

      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding-top: 20px; border-top: 2px solid #f1f5f9;">
        <div style="font-size: 9px; color: #94a3b8;">
           <p style="margin: 0;">Digitally generated by Denova Clinical Studio</p>
           <p style="margin: 0;">ID: ${appt.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <div style="text-align: center;">
          <div style="width: 120px; border-bottom: 1px solid #64748b; margin-bottom: 4px;"></div>
          <p style="font-size: 10px; font-weight: 900; margin: 0; text-transform: uppercase;">Medical Officer</p>
          <p style="font-size: 9px; color: #64748b; margin: 0;">Dr. ${appt.doctor?.name || 'Authorized Signatory'}</p>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    try {
      // 2. Capture as canvas
      const canvas = await html2canvas(container, {
        scale: 2, // High DPI
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      document.body.removeChild(container);

      if (action === 'print') {
        const dataUrl = canvas.toDataURL('image/png');
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head><title>Print Prescription</title></head>
              <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh;">
                <img src="${dataUrl}" style="max-width:100%; height:auto;">
                <script>window.onload = () => { window.print(); window.close(); }</script>
              </body>
            </html>
          `);
        }
        setCopyStatus(null);
      } else {
        // 3. Copy to clipboard
        canvas.toBlob(async (blob) => {
          if (blob && navigator.clipboard && window.ClipboardItem) {
            const data = [new ClipboardItem({ 'image/png': blob })];
            await navigator.clipboard.write(data);
            setCopyStatus('Ready! Paste in WhatsApp (Ctrl+V)');
            
            // 4. Open WhatsApp
            const phone = patient.mobile || patient.phone || '';
            const rawNumber = phone.replace(/\D/g, '');
            const formattedNumber = rawNumber.length === 10 ? `91${rawNumber}` : rawNumber;
            const message = `Hello ${patient.name}, sharing your prescription from Denova Clinic. (Please paste the image below)`;
            const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
            
            window.open(whatsappUrl, '_blank');
          } else {
            throw new Error('Clipboard API not supported');
          }
        }, 'image/png');
      }
    } catch (err) {
      console.error('Failed to capture/copy prescription', err);
      setCopyStatus('Error sharing prescription');
      document.body.removeChild(container);
    }
    
    setTimeout(() => setCopyStatus(null), 4000);
  };

  useEffect(() => {
    fetchPatientData();
  }, [fetchPatientData]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse tracking-widest uppercase text-xs">Assembling Profile...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-12 text-center">
        <AlertCircle size={48} className="mx-auto text-destructive mb-4" />
        <h2 className="text-xl font-bold">Patient Not Found</h2>
        <button onClick={() => navigate('/patients/list')} className="mt-4 text-primary font-bold hover:underline">
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Toast Feedback */}
      {copyStatus && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 animate-in fade-in slide-in-from-top-4 transition-all">
          <MessageCircle size={18} />
          {copyStatus}
        </div>
      )}

      {/* Back & Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/patients/list')}
          className="p-2 hover:bg-muted rounded-full transition-all group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patient Profile</h1>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Medical Management System</p>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-card border rounded-3xl overflow-hidden shadow-xl shadow-primary/5">
        <div className="p-8 md:p-10 flex flex-col md:flex-row gap-10 items-start">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-primary to-primary/60 text-primary-foreground rounded-[2.5rem] flex items-center justify-center font-bold text-4xl shadow-2xl shadow-primary/20 shrink-0 transform hover:scale-105 transition-transform duration-500">
              {patient.name[0].toUpperCase()}
            </div>
            <div className="text-center">
              <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                {patient.opNo || 'WALK-IN'}
              </span>
            </div>
          </div>

          {/* Info Details */}
          <div className="flex-1 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-2">{patient.name}</h2>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground font-semibold">
                  <span className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-1.5 rounded-xl border">
                    <Activity size={16} className="text-primary" /> {patient.gender || '—'}, {patient.age || '—'} Years
                  </span>
                  {patient.bloodGroup && (
                    <span className="flex items-center gap-2 text-sm bg-red-50 text-red-700 px-3 py-1.5 rounded-xl border border-red-100">
                      <HeartPulse size={16} /> {patient.bloodGroup} Group
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                   onClick={() => navigate(`/patients/registration?edit=${patient.id}`)}
                   className="px-6 py-2.5 bg-foreground text-background rounded-2xl text-xs font-bold hover:opacity-90 transition-all shadow-lg"
                >
                  Edit Information
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-border/50">
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Primary Contact</p>
                <div className="flex items-center gap-3 text-foreground">
                  <Phone size={14} className="text-primary" /> 
                  <span className="text-sm font-bold">{patient.mobile || patient.phone || '—'}</span>
                  {(patient.mobile || patient.phone) && (
                    <button 
                      onClick={() => handleWhatsAppShare()}
                      className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100"
                      title="Open WhatsApp Chat"
                    >
                      <MessageCircle size={12} />
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Email Address</p>
                <p className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <Mail size={14} className="text-primary" /> {patient.email || 'None Provided'}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Registration Date</p>
                <p className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <Calendar size={14} className="text-primary" /> {formatDate(patient.regDate)}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Total Visits</p>
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                     <History size={12} />
                   </div>
                   <p className="text-sm font-black text-foreground">{patient.appointments.length} Consultations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-card border rounded-2xl w-fit shadow-sm">
        <button 
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'timeline' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:bg-muted text-muted-foreground'
          }`}
        >
          <Clock size={16} /> Clinical Timeline
        </button>
        <button 
          onClick={() => setActiveTab('imaging')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'imaging' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:bg-muted text-muted-foreground'
          }`}
        >
          <Camera size={16} /> Imaging & X-Rays
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'profile' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:bg-muted text-muted-foreground'
          }`}
        >
          <User size={16} /> Patient Profile
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'timeline' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
            {patient.appointments.length === 0 ? (
              <div className="p-20 text-center bg-card border rounded-3xl border-dashed">
                <History size={48} className="mx-auto text-muted-foreground opacity-20 mb-4" />
                <p className="font-bold text-muted-foreground tracking-widest uppercase text-xs">No clinical history recorded yet.</p>
              </div>
            ) : (
              <div className="relative space-y-12 before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-1 before:bg-muted before:rounded-full">
                {patient.appointments.map((appt) => (
                  <div key={appt.id} className="relative pl-12 group">
                    {/* Circle Pulse */}
                    <div className="absolute left-0 top-1 w-10 h-10 bg-background border-4 border-primary rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 z-10">
                       <Stethoscope size={20} className="text-primary" />
                    </div>

                    <div className="bg-card border rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                      <div className="bg-muted/30 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <span className="text-lg font-black text-foreground">
                              {new Date(appt.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                              <Clock size={10} /> {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="w-px h-8 bg-border hidden md:block" />
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider leading-none mb-1">Consulting Doctor</p>
                            <p className="text-sm font-bold text-foreground">Dr. {appt.doctor?.name || 'In-House Consultant'}</p>
                          </div>
                        </div>
                        <div>
                          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border ${
                            appt.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {appt.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Clinical Summary */}
                        <div className="space-y-6">
                           <div className="space-y-2">
                             <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                               <ClipboardList size={14} /> Clinical Findings
                             </h4>
                             <p className="text-sm font-medium text-foreground leading-relaxed italic border-l-4 border-muted pl-4">
                               {appt.clinicalDetails || 'No clinical details logged for this visit.'}
                             </p>
                           </div>

                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                                <Stethoscope size={14} /> Procedures & Treatments
                              </h4>
                              <div className="space-y-3">
                                {appt.treatments.map((t, ti) => (
                                  <div key={ti} className="bg-muted/30 p-4 rounded-xl border border-border/50">
                                    <h5 className="font-bold text-foreground text-sm flex items-center justify-between">
                                      {t.name}
                                      <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">PROC_{ti+1}</span>
                                    </h5>
                                    {t.diagnosis && <p className="text-xs text-muted-foreground mt-1"><span className="font-bold uppercase text-[9px] text-foreground/50">Diagnosis:</span> {t.diagnosis}</p>}
                                    {t.treatmentDone && <p className="text-xs text-muted-foreground"><span className="font-bold uppercase text-[9px] text-foreground/50">Procedure:</span> {t.treatmentDone}</p>}
                                  </div>
                                ))}
                                {appt.treatments.length === 0 && (
                                  <p className="text-xs text-muted-foreground italic">No specific procedures recorded.</p>
                                )}
                              </div>
                           </div>
                        </div>

                        {/* Prescription Summary */}
                        <div className="space-y-6">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                  <Pill size={14} /> Prescription Records
                                </h4>
                                {appt.prescriptions.length > 0 && (
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => handlePrescriptionShare(appt, 'print')}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 hover:bg-muted rounded-lg text-[10px] font-bold text-muted-foreground transition-colors border shadow-sm"
                                    >
                                      <Printer size={12} /> Print
                                    </button>
                                    <button 
                                      onClick={() => handlePrescriptionShare(appt, 'share')}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-[10px] font-bold transition-colors border border-emerald-100 shadow-sm"
                                    >
                                      <Share2 size={12} /> Share to WhatsApp
                                    </button>
                                  </div>
                                )}
                              </div>
                              {appt.prescriptions.length > 0 ? (
                                <div className="border rounded-xl overflow-hidden shadow-sm">
                                  <table className="w-full text-left text-xs">
                                    <thead className="bg-muted/30 border-b">
                                      <tr>
                                        <th className="px-4 py-2 font-black text-muted-foreground uppercase tracking-widest text-[9px]">Medicine</th>
                                        <th className="px-4 py-2 font-black text-muted-foreground uppercase tracking-widest text-[9px] text-center">Duration</th>
                                        <th className="px-4 py-2 font-black text-muted-foreground uppercase tracking-widest text-[9px]">Instruction</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                      {appt.prescriptions.map((p, pi) => (
                                        <tr key={pi} className="hover:bg-muted/20">
                                          <td className="px-4 py-3 font-bold text-foreground">{p.medicineName}</td>
                                          <td className="px-4 py-3 text-center">
                                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 font-bold">{p.days}d</span>
                                          </td>
                                          <td className="px-4 py-3 font-medium text-muted-foreground leading-snug">{p.dosage}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="p-10 text-center bg-muted/20 rounded-xl border border-dashed">
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No medicine prescribed</p>
                                </div>
                              )}
                              
                              {appt.appointmentNotes && (
                              <div className="space-y-2">
                                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Doctor's Closing Notes</h4>
                                <p className="text-xs text-muted-foreground bg-muted/20 p-4 rounded-xl leading-relaxed">
                                  {appt.appointmentNotes}
                                </p>
                              </div>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'imaging' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
             <div className="flex items-center justify-between px-2">
               <div>
                 <h3 className="text-xl font-bold tracking-tight">Image & Radiography Gallery</h3>
                 <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Total of {patient.imagingRecords.length} records found</p>
               </div>
             </div>

             {patient.imagingRecords.length === 0 ? (
               <div className="p-24 text-center bg-card border rounded-3xl border-dashed">
                 <Camera size={64} className="mx-auto text-muted-foreground opacity-10 mb-4" />
                 <p className="font-bold text-muted-foreground tracking-widest uppercase text-xs">No Imaging records found for this patient.</p>
               </div>
             ) : (
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                 {patient.imagingRecords.map((img) => (
                   <div 
                    key={img.id}
                    className="group bg-card border rounded-2xl overflow-hidden hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-xl"
                    onClick={() => setSelectedImage(img)}
                   >
                     <div className="aspect-square bg-slate-900 flex items-center justify-center overflow-hidden">
                       <img 
                         src={`${api.defaults.baseURL}/imaging/${img.id}`} 
                         alt={img.fileName}
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                       />
                     </div>
                     <div className="p-3 bg-card border-t">
                       <p className="text-[10px] font-black text-foreground truncate uppercase">{img.fileName}</p>
                       <div className="flex items-center justify-between mt-1">
                          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">{formatDate(img.createdAt)}</p>
                          <div className="flex items-center gap-1.5 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleWhatsAppShare(img); }}
                              className="p-1.5 bg-emerald-500 text-white rounded-lg shadow-lg hover:bg-emerald-600 transition-colors"
                              title="Send to WhatsApp"
                            >
                              <MessageCircle size={10} />
                            </button>
                            <div className="p-1.5 bg-primary text-primary-foreground rounded-lg shadow-lg">
                              <Maximize2 size={10} />
                            </div>
                          </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Personal Context */}
                <div className="md:col-span-2 space-y-8">
                   <div className="bg-card border rounded-3xl p-8 space-y-8 shadow-sm">
                      <div className="flex items-center gap-3 border-b pb-4">
                        <div className="p-2 bg-primary/10 text-primary rounded-xl">
                          <ClipboardList size={20} />
                        </div>
                        <h3 className="text-lg font-black tracking-tight uppercase">Registration Details</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                         {[
                           { label: 'Full Legal Name', val: patient.name },
                           { label: 'OP Number', val: patient.opNo || 'WALK-IN', isTag: true },
                           { label: 'Age / Gender', val: `${patient.age || '—'} Y / ${patient.gender || '—'}` },
                           { label: 'Blood Group', val: patient.bloodGroup || '—' },
                           { label: 'Registration Date', val: formatDate(patient.regDate) },
                           { label: 'Primary Mobile', val: patient.mobile || '—' },
                           { label: 'Secondary Phone', val: patient.phone || '—' },
                           { label: 'Email Address', val: patient.email || '—' }
                         ].map((item, i) => (
                           <div key={i} className="space-y-1">
                             <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{item.label}</p>
                             <p className={`text-md font-bold ${item.isTag ? 'inline-block bg-primary/5 text-primary px-2 py-0.5 rounded border border-primary/10' : 'text-foreground'}`}>
                               {item.val}
                             </p>
                           </div>
                         ))}
                      </div>

                      <div className="space-y-4 pt-4">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Residential Address</p>
                        <div className="flex items-start gap-3 bg-muted/20 p-6 rounded-2xl border border-dashed">
                          <MapPin size={24} className="text-primary mt-1" />
                          <div className="space-y-1">
                            <p className="text-md font-bold text-foreground leading-relaxed whitespace-pre-wrap">
                              {[patient.address1, patient.address2, patient.address3].filter(Boolean).join('\n') || patient.address || 'No residential address recorded.'}
                            </p>
                          </div>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Right Column: Medical Context */}
                <div className="space-y-8">
                   <div className="bg-card border rounded-3xl p-8 space-y-8 shadow-sm h-full">
                      <div className="flex items-center gap-3 border-b pb-4">
                        <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                          <Activity size={20} />
                        </div>
                        <h3 className="text-lg font-black tracking-tight uppercase text-red-600">Medical Alerts</h3>
                      </div>

                      <div className="space-y-6">
                        <div className="p-6 bg-red-50/50 border border-red-100 rounded-2xl">
                           <p className="text-[10px] font-black uppercase text-red-600 tracking-widest mb-3">Known Allergies</p>
                           <p className="text-sm font-bold text-red-900 leading-relaxed italic">
                             {patient.allergies || 'Patient reports no known drug or contact allergies.'}
                           </p>
                        </div>

                        <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-2xl">
                           <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-3">General Medical Notes</p>
                           <p className="text-sm font-bold text-amber-900 leading-relaxed">
                             {patient.medicalNotes || 'No auxiliary medical history or notes recorded.'}
                           </p>
                        </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Pro Image Viewer Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/98 flex flex-col animate-in fade-in duration-300">
          <div className="flex items-center justify-between p-6 text-white border-b border-white/10 backdrop-blur-md bg-black/40 z-10">
            <div>
              <h4 className="text-lg font-black tracking-tight uppercase">{selectedImage.fileName}</h4>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {formatDate(selectedImage.createdAt)} • {(selectedImage.fileSize / 1024).toFixed(1)} KB
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleWhatsAppShare(selectedImage)}
                className="p-3 bg-emerald-600 hover:bg-emerald-700 rounded-2xl transition-all text-white flex items-center gap-2 shadow-xl shadow-emerald-900/20"
                title="Send as WhatsApp"
              >
                <MessageCircle size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Send to WhatsApp</span>
              </button>
              <a 
                href={`${api.defaults.baseURL}/imaging/${selectedImage.id}`} 
                target="_blank" 
                rel="noreferrer"
                className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors text-white"
                title="Open in New Tab"
              >
                <ExternalLink size={20} />
              </a>
              <button 
                onClick={() => setSelectedImage(null)}
                className="p-3 bg-red-600 hover:bg-red-700 rounded-2xl transition-colors text-white shadow-xl shadow-red-900/20"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative group">
            <TransformWrapper
              initialScale={1}
              initialPositionX={0}
              initialPositionY={0}
              centerOnInit={true}
              minScale={0.1}
              maxScale={10}
              doubleClick={{ mode: "toggle" }}
              smooth={true}
              zoomAnimation={{ animationTime: 200, animationType: "easeOut" }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <React.Fragment>
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 p-3 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] shadow-2xl opacity-80 hover:opacity-100 transition-all">
                    <button onClick={() => zoomIn()} className="p-4 hover:bg-white/20 rounded-2xl transition-all text-white flex flex-col items-center gap-1">
                      <ZoomIn size={24} />
                    </button>
                    <div className="w-px h-10 bg-white/10" />
                    <button onClick={() => zoomOut()} className="p-4 hover:bg-white/20 rounded-2xl transition-all text-white flex flex-col items-center gap-1">
                      <ZoomOut size={24} />
                    </button>
                    <div className="w-px h-10 bg-white/10" />
                    <button onClick={() => resetTransform()} className="p-4 hover:bg-white/20 rounded-2xl transition-all text-white flex flex-col items-center gap-1">
                      <RotateCcw size={24} />
                    </button>
                  </div>

                  <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%" }}
                    contentStyle={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
                  >
                    <img 
                      src={`${api.defaults.baseURL}/imaging/${selectedImage.id}`} 
                      alt={selectedImage.fileName}
                      className="max-w-[95%] max-h-[90vh] object-contain shadow-2xl animate-in zoom-in-95 duration-500 cursor-grab active:cursor-grabbing"
                    />
                  </TransformComponent>
                </React.Fragment>
              )}
            </TransformWrapper>
          </div>
        </div>
      )}
    </div>
  );
};
