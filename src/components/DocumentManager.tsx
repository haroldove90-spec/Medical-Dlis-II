/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileText, Printer, MessageSquare, ShieldCheck, Download, ExternalLink } from 'lucide-react';
import { Patient, Specialty, Role } from '../types';
import { motion } from 'motion/react';

interface DocumentManagerProps {
  patient: Patient;
  specialty: Specialty;
  activeRole: Role;
}

export default function DocumentManager({ patient, specialty, activeRole }: DocumentManagerProps) {
  const draName = "Dr. Alejandro Méndez";
  const clinicName = "Centro Médico Integral";
  
  const generateConsentText = () => {
    return `
      CONSENTIMIENTO INFORMADO PARA TRATAMIENTO DE ${specialty.toUpperCase()}
      
      Yo, ${patient.name}, por la presente autorizo a la ${draName} y al personal de ${clinicName} 
      a realizar el procedimiento médico/estético de ${specialty}.
      
      Se me ha explicado la naturaleza del tratamiento, los beneficios esperados, así como los 
      posibles riesgos y complicaciones. Entiendo que los resultados pueden variar según el 
      paciente y el seguimiento de las recomendaciones post-tratamiento.
      
      Fecha: ${new Date().toLocaleDateString('es-MX')}
      Firma del Paciente: __________________________
    `;
  };

  const sendWhatsApp = () => {
    const isSurgical = specialty === 'Cirugía General' || specialty === 'Podología';
    
    const recommendations = isSurgical
      ? "Mantener reposo absoluto, evitar exposición al sol y seguir la medicación indicada puntualmente."
      : "Hidratar la zona tratada, usar protector solar FPS 50+ y evitar ejercicio intenso por 24 horas.";
    
    const message = `Hola ${patient.name}, le escribe el equipo de ${clinicName}. Esperamos que su tratamiento de ${specialty} haya sido de su agrado. Para asegurar los mejores resultados, recuerde estas recomendaciones: ${recommendations} Quedamos a sus órdenes ante cualquier duda.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${patient.phone || ''}?text=${encodedMessage}`, '_blank');
  };

  const handlePrint = (type: 'consent' | 'prescription') => {
    const printContent = type === 'consent' ? generateConsentText() : "RECETA MÉDICA\n\nPrescripción para: " + patient.name + "\n\nTratamiento:\n1. _______________________\n2. _______________________\n3. _______________________";
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${type === 'consent' ? 'Consentimiento' : 'Receta'}</title>
            <style>
              body { font-family: 'Inter', 'Arial', sans-serif; padding: 50px; color: #1e293b; line-height: 1.6; }
              .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #6b21a8; padding-bottom: 20px; margin-bottom: 40px; }
              .clinic-name { color: #6b21a8; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; }
              .dra-info { text-align: right; }
              .dra-name { font-weight: 800; font-size: 16px; margin: 0; }
              .dra-ced { font-size: 12px; color: #64748b; margin: 0; }
              .content { white-space: pre-wrap; font-size: 16px; margin: 40px 0; min-height: 400px; padding: 20px; background: #f8fafc; border-radius: 12px; }
              .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 25px; }
              @media print { .content { background: transparent; border: 1px solid #eee; } }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="clinic-name">${clinicName}</div>
              <div class="dra-info">
                <p class="dra-name">${draName}</p>
                <p class="dra-ced">Cédula Profesional: 12345678</p>
                <p class="dra-ced">Especialista en ${specialty}</p>
              </div>
            </div>
            <div class="content">${printContent}</div>
            <div class="footer">
              <strong>${clinicName} - Especialidades Médicas</strong><br/>
              Calle Principal #123, Ciudad Salud | Tel: 55-0000-0000
            </div>
            <script>window.print(); window.close();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const showPrescription = activeRole === Role.ADMIN || activeRole === Role.CIRUGIA || activeRole === Role.PODOLOGIA;
  const showConsent = activeRole !== Role.RECEPCION;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2 text-xs font-black text-slate-400 uppercase tracking-widest px-1">
        <FileText className="w-3 h-3" />
        <span>Docs & Fidelización</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Prescription Card */}
        {showPrescription && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-50 rounded-lg text-brand-purple">
                <Printer className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Validez Legal</span>
            </div>
            <h4 className="text-sm font-black text-slate-900 mb-1">Receta Médica</h4>
            <p className="text-[10px] text-slate-500 font-medium mb-4 leading-tight">Generar prescripción con logo, firma y cédula.</p>
            <button 
              onClick={() => handlePrint('prescription')}
              className="w-full py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-purple transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-3 h-3" />
              Emitir
            </button>
          </motion.div>
        )}

        {/* Consent Card */}
        {showConsent && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Confidencial</span>
            </div>
            <h4 className="text-sm font-black text-slate-900 mb-1">Consentimiento</h4>
            <p className="text-[10px] text-slate-500 font-medium mb-4 leading-tight">Texto legal adaptado para {specialty}.</p>
            <button 
              onClick={() => handlePrint('consent')}
              className="w-full py-2 border-2 border-slate-900 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <Printer className="w-3 h-3" />
              Imprimir
            </button>
          </motion.div>
        )}
      </div>

      {/* WhatsApp Section */}
      <motion.button 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={sendWhatsApp}
        className="w-full p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl flex items-center justify-between transition-all shadow-lg shadow-emerald-500/20 group"
      >
        <div className="flex items-center gap-3 text-left">
          <div className="p-2 bg-white/20 rounded-xl">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-none">Seguimiento Post-Tratamiento</p>
            <p className="text-sm font-black mt-1">Enviar Cuidados por WhatsApp</p>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
      </motion.button>
    </div>
  );
}

