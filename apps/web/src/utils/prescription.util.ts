import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface PrescriptionData {
  patient: {
    name: string;
    age?: number | string | null;
    gender?: string | null;
    opNo?: string | null;
    mobile?: string | null;
    phone?: string | null;
  };
  appointment: {
    id: string;
    date: string;
    doctor?: { name: string } | null;
    clinicalDetails?: string | null;
    appointmentNotes?: string | null;
    prescriptions: Array<{
      medicineName: string;
      totalTablets: number;
      dosage: string;
      days: number;
    }>;
  };
}

export const generatePrescriptionCanvas = async (data: PrescriptionData): Promise<HTMLCanvasElement> => {
  const { patient, appointment } = data;
  
  // 1. Create a temporary container for the prescription
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '700px';
  container.style.backgroundColor = 'white';
  container.style.padding = '50px';
  container.style.fontFamily = "'Inter', sans-serif";
  container.style.color = '#0f172a';
  
  // Construct the HTML content for the prescription
  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #0f172a; padding-bottom: 25px; margin-bottom: 30px;">
      <div style="display: flex; align-items: center; gap: 20px;">
        <img src="/logo.jpg" style="width: 80px; height: 80px; border-radius: 15px; object-fit: cover;" />
        <div>
          <h1 style="font-size: 28px; font-weight: 900; margin: 0; color: #1e293b; letter-spacing: -0.02em;">SRI GANESH DENTAL CARE</h1>
          <p style="font-size: 11px; font-weight: 800; text-transform: uppercase; margin: 6px 0 0 0; color: #64748b; letter-spacing: 0.1em;">Advanced Clinical Dentistry & Oral Surgery</p>
        </div>
      </div>
      <div style="text-align: right; font-size: 10px; font-weight: 700; color: #64748b; line-height: 1.6;">
        <p style="margin: 0;">123, Medical Square, Hosur Road</p>
        <p style="margin: 0;">Contact: +91 98765 43210</p>
        <p style="margin: 0;">Email: care@sriganeshdental.com</p>
      </div>
    </div>
    
    <div style="display: flex; justify-content: space-between; margin-bottom: 35px; background: #f8fafc; padding: 20px; border-radius: 15px;">
      <div style="font-size: 13px;">
        <p style="font-weight: 900; margin: 0; text-transform: uppercase; color: #64748b; font-size: 10px; letter-spacing: 0.05em;">Patient Information</p>
        <p style="font-weight: 800; margin: 6px 0 0 0; font-size: 16px; color: #0f172a;">${patient.name}</p>
        <p style="margin: 4px 0 0 0; font-weight: 600; color: #475569;">${patient.gender || '—'}, ${patient.age || '—'} Years</p>
      </div>
      <div style="text-align: right; font-size: 13px;">
        <p style="font-weight: 900; margin: 0; text-transform: uppercase; color: #64748b; font-size: 10px; letter-spacing: 0.05em;">Visit Record</p>
        <p style="font-weight: 800; margin: 6px 0 0 0; font-size: 16px; color: #0f172a;">ID: ${patient.opNo || 'WALK-IN'}</p>
        <p style="margin: 4px 0 0 0; font-weight: 600; color: #475569;">Date: ${new Date(appointment.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
      </div>
    </div>

    <div style="margin-bottom: 35px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
        <span style="font-size: 12px; font-weight: 900; color: #2563eb; text-transform: uppercase; letter-spacing: 0.1em;">Prescription Details</span>
        <div style="flex: 1; height: 1px; background: #f1f5f9;"></div>
      </div>
      
      <table style="width: 100%; border-collapse: separate; border-spacing: 0 8px; font-size: 13px;">
        <thead>
          <tr style="text-align: left;">
            <th style="padding: 10px 15px; font-weight: 800; color: #64748b; text-transform: uppercase; font-size: 10px;">Medicine Name</th>
            <th style="padding: 10px 15px; font-weight: 800; color: #64748b; text-transform: uppercase; font-size: 10px; text-align: center;">Qty/Days</th>
            <th style="padding: 10px 15px; font-weight: 800; color: #64748b; text-transform: uppercase; font-size: 10px;">Dosage & Timing</th>
          </tr>
        </thead>
        <tbody>
          ${appointment.prescriptions.map((p: any) => `
            <tr style="background-color: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <td style="padding: 15px; border: 1px solid #f1f5f9; border-right: 0; border-radius: 12px 0 0 12px; font-weight: 700; color: #0f172a;">${p.medicineName}</td>
              <td style="padding: 15px; border: 1px solid #f1f5f9; border-left: 0; border-right: 0; text-align: center; font-weight: 600; color: #2563eb;">${p.totalTablets} Tabs / ${p.days} Days</td>
              <td style="padding: 15px; border: 1px solid #f1f5f9; border-left: 0; border-radius: 0 12px 12px 0; font-weight: 600; color: #475569;">${p.dosage}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    ${appointment.appointmentNotes ? `
      <div style="margin-bottom: 40px; background: #fffbeb; border: 1px solid #fef3c7; padding: 20px; border-radius: 15px;">
        <p style="font-size: 10px; font-weight: 900; color: #d97706; text-transform: uppercase; margin: 0 0 8px 0; letter-spacing: 0.1em;">Doctor's Advice</p>
        <p style="margin: 0; color: #92400e; line-height: 1.6; font-size: 13px; font-weight: 600;">${appointment.appointmentNotes}</p>
      </div>
    ` : ''}

    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 60px; padding-top: 30px; border-top: 2px dashed #e2e8f0;">
      <div style="font-size: 10px; color: #94a3b8; font-weight: 600;">
         <p style="margin: 0;">Clinically validated by <strong>Sri Ganesh Dental Care</strong></p>
         <p style="margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.05em;">Ref: ${appointment.id.toUpperCase()}</p>
      </div>
      <div style="text-align: center;">
        <div style="width: 150px; border-bottom: 2px solid #1e293b; margin-bottom: 8px;"></div>
        <p style="font-size: 11px; font-weight: 900; margin: 0; text-transform: uppercase; color: #0f172a;">Dr. ${appointment.doctor?.name || 'Authorized Surgeon'}</p>
        <p style="font-size: 10px; color: #64748b; margin: 2px 0 0 0; font-weight: 700;">Signature / Stamp</p>
      </div>
    </div>
  `;

  document.body.appendChild(container);
  
  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      logging: false,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true
    });
    document.body.removeChild(container);
    return canvas;
  } catch (err) {
    document.body.removeChild(container);
    throw err;
  }
};

export const downloadPrescriptionPDF = async (data: PrescriptionData) => {
  const canvas = await generatePrescriptionCanvas(data);
  const imgData = canvas.toDataURL('image/png');
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [canvas.width / 2, canvas.height / 2] // Account for scale: 2
  });
  
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
  pdf.save(`Prescription_${data.patient.name.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
};

export const sharePrescriptionWhatsApp = async (data: PrescriptionData) => {
  const canvas = await generatePrescriptionCanvas(data);
  
  // Copy to clipboard
  return new Promise<void>((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (blob && navigator.clipboard && window.ClipboardItem) {
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          
          // Open WhatsApp
          const phone = data.patient.mobile || data.patient.phone || '';
          const rawNumber = phone.replace(/\D/g, '');
          const formattedNumber = rawNumber.length === 10 ? `91${rawNumber}` : rawNumber;
          const message = `Hello ${data.patient.name}, sharing your prescription from Sri Ganesh Dental Care. Please paste the copied image below.`;
          const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
          
          window.open(whatsappUrl, '_blank');
          resolve();
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error('Clipboard API not supported or blob generation failed'));
      }
    }, 'image/png');
  });
};
