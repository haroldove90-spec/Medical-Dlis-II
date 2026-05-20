/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Save, Trash2, FileDown, CheckCircle2, ShieldCheck, User, ClipboardCheck } from 'lucide-react';
import { ConsentClosure, Patient } from '../types';
import SignatureCanvas from 'react-signature-canvas';
import { jsPDF } from 'jspdf';

interface ConsentClosureFormProps {
  patient: Patient;
  onClose: () => void;
  onSave: (closure: ConsentClosure) => void;
  initialData?: ConsentClosure;
}

export default function ConsentClosureForm({ patient, onClose, onSave, initialData }: ConsentClosureFormProps) {
  const [formData, setFormData] = useState<ConsentClosure>(initialData || {
    id: '',
    patientId: patient.id,
    date: new Date().toISOString().split('T')[0],
    patientName: patient.name,
    treatmentCompleted: 'PEDICURE CLÍNICO - TRATAMIENTO COMPLETADO',
    observations: '',
    patientSignature: '',
    specialistSignature: '',
  });

  const patientSigCanvas = useRef<SignatureCanvas>(null);
  const specialistSigCanvas = useRef<SignatureCanvas>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    const pSig = patientSigCanvas.current && !patientSigCanvas.current.isEmpty() 
      ? patientSigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
      : formData.patientSignature;
    
    const sSig = specialistSigCanvas.current && !specialistSigCanvas.current.isEmpty()
      ? specialistSigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
      : formData.specialistSignature;

    if (!pSig || !sSig) {
      alert('Ambas firmas son necesarias para cerrar el consentimiento.');
      return;
    }

    const finalData = { 
      ...formData, 
      patientSignature: pSig, 
      specialistSignature: sSig,
      id: formData.id || `CLOSE-${Math.floor(Math.random() * 10000)}` 
    };

    setIsSaving(true);
    setTimeout(() => {
      onSave(finalData);
      setIsSaving(false);
    }, 1000);
  };

  const generatePDF = (data: ConsentClosure) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('MEDICAL D\'LIS', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('CIERRE DE CONSENTIMIENTO INFORMADO', 105, 35, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de Cierre: ${data.date}`, 20, 50);
    doc.text(`Paciente: ${data.patientName}`, 20, 55);
    
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN DEL TRATAMIENTO:', 20, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(data.treatmentCompleted, 20, 75);
    
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVACIONES DE CIERRE:', 20, 90);
    doc.setFont('helvetica', 'normal');
    const splitObs = doc.splitTextToSize(data.observations || 'Sin observaciones adicionales.', 170);
    doc.text(splitObs, 20, 95);

    // Section VI: Derechos
    doc.setFont('helvetica', 'bold');
    doc.text('VI. DERECHOS DEL PACIENTE:', 20, 115);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const rights = [
      "- Recibir atención respetuosa, digna y profesional.",
      "- Conocer la identidad y calificación del podólogo tratante.",
      "- Solicitar aclaraciones antes, durante y después del procedimiento.",
      "- Revocar su consentimiento en cualquier momento sin penalización.",
      "- Acceder a la confidencialidad de su información personal y clínica."
    ];
    doc.text(rights, 25, 120);

    // Section VII: Confidencialidad
    doc.setFont('helvetica', 'bold');
    doc.text('VII. CONFIDENCIALIDAD:', 20, 145);
    doc.setFont('helvetica', 'normal');
    const confText = "Menciona el tratamiento de datos conforme a la Ley Federal de Protección de Datos Personales en Posesión de Particulares. Los datos no serán compartidos sin autorización expresa, salvo requerimiento legal o sanitario.";
    doc.text(doc.splitTextToSize(confText, 170), 20, 150);

    // Section VIII: Declaración
    doc.setFont('helvetica', 'bold');
    doc.text('VIII. DECLARACIÓN DE CONSENTIMIENTO:', 20, 165);
    doc.setFont('helvetica', 'normal');
    const declText = "Declaro que he sido informado(a) de forma clara y suficiente acerca del procedimiento podológico a realizar, sus beneficios, riesgos, alternativas y cuidados posteriores. He tenido oportunidad de hacer preguntas y todas mis dudas han sido aclaradas satisfactoriamente. Otorgo mi consentimiento libre, voluntario e informado para que se realice el tratamiento descrito.";
    doc.text(doc.splitTextToSize(declText, 170), 20, 170);
    
    doc.setFontSize(9);
    doc.text(`Lugar y Fecha: ${data.location || 'Ciudad de México'}, ${data.date}`, 20, 185);

    // Signatures
    if (data.patientSignature) {
      doc.addImage(data.patientSignature, 'PNG', 30, 200, 60, 25);
    }
    doc.line(30, 225, 90, 225);
    doc.text('FIRMA DEL PACIENTE', 60, 230, { align: 'center' });
    doc.text(data.patientName, 60, 235, { align: 'center' });

    if (data.specialistSignature) {
      doc.addImage(data.specialistSignature, 'PNG', 120, 200, 60, 25);
    }
    doc.line(120, 225, 180, 225);
    doc.text('FIRMA DEL ESPECIALISTA', 150, 230, { align: 'center' });

    doc.save(`Cierre_Consentimiento_${data.patientName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] bg-white flex flex-col h-full overflow-hidden"
    >
      <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <button onClick={onClose} className="p-2 sm:p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-brand-purple transition-all border border-transparent hover:border-slate-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-display font-black text-slate-900 tracking-tight italic">Cierre Consentimiento</h2>
            <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Podología - Finalización</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           {initialData && (
              <button 
                onClick={() => generatePDF(formData)}
                className="bg-slate-900 text-white p-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2"
                title="Exportar PDF"
              >
                <FileDown className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar PDF</span>
              </button>
           )}
           <button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-brand-purple hover:bg-brand-purple-dark text-white p-2.5 sm:px-8 sm:py-3 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg"
              >
                {isSaving ? <CheckCircle2 className="w-4 h-4 animate-bounce" /> : <Save className="w-4 h-4" />}
                <span>{isSaving ? '...' : <span className="hidden sm:inline">Finalizar Cierre</span>}<span className="sm:hidden">Finalizar</span></span>
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50/50">
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 pb-32">
          <div className="bg-white p-6 sm:p-12 rounded-[2rem] sm:rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8 sm:space-y-10">
            <div className="flex flex-col items-center text-center">
               <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-brand-purple mb-4" />
               <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 italic">MEDICAL <span className="text-brand-purple">D'LIS</span></h1>
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Cierre de Acta Podológica</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 pt-8 border-t border-slate-50">
               <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Paciente</label>
                  <input type="text" readOnly value={formData.patientName} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900" />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:border-brand-purple outline-none" />
               </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Lugar</label>
               <input 
                 type="text" 
                 placeholder="Ej. Ciudad de México"
                 value={formData.location || ''} 
                 onChange={e => setFormData({...formData, location: e.target.value})} 
                 className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:border-brand-purple outline-none" 
               />
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-3 text-brand-purple">
                  <ClipboardCheck className="w-5 h-5" />
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest">Resumen de Tratamiento</h3>
               </div>
               <input 
                 type="text" 
                 value={formData.treatmentCompleted}
                 onChange={e => setFormData({...formData, treatmentCompleted: e.target.value})}
                 className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:border-brand-purple outline-none"
               />
            </div>

            <div className="space-y-4">
               <div className="flex items-center gap-3 text-brand-purple">
                  <User className="w-5 h-5" />
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest">Observaciones Finales</h3>
               </div>
               <textarea 
                 value={formData.observations}
                 onChange={e => setFormData({...formData, observations: e.target.value})}
                 placeholder="Indique los cuidados post-tratamiento..."
                 className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:border-brand-purple outline-none min-h-[120px] resize-none"
               />
            </div>

            <div className="space-y-8 py-8 border-t border-slate-100">
               <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest underline decoration-brand-purple decoration-4 underline-offset-4">VI. DERECHOS DEL PACIENTE</h4>
                  <ul className="space-y-3">
                     {[
                       "Recibir atención respetuosa, digna y profesional.",
                       "Conocer la identidad y calificación del podólogo tratante.",
                       "Solicitar aclaraciones antes, durante y después del procedimiento.",
                       "Revocar su consentimiento en cualquier momento sin penalización.",
                       "Acceder a la confidencialidad de su información personal y clínica."
                     ].map((text, idx) => (
                        <li key={idx} className="flex gap-3 text-xs font-bold text-slate-500 leading-relaxed">
                           <span className="w-1.5 h-1.5 bg-brand-purple rounded-full mt-1.5 shrink-0" />
                           {text}
                        </li>
                     ))}
                  </ul>
               </div>

               <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest underline decoration-brand-purple decoration-4 underline-offset-4">VII. CONFIDENCIALIDAD</h4>
                  <p className="text-xs font-bold text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl sm:rounded-2xl border border-slate-100">
                     Menciona el tratamiento de datos conforme a la Ley Federal de Protección de Datos Personales.
                  </p>
               </div>

               <div className="space-y-4">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest underline decoration-brand-purple decoration-4 underline-offset-4">VIII. DECLARACIÓN</h4>
                  <p className="text-xs font-bold text-slate-900 leading-relaxed italic border-l-4 border-brand-purple pl-4">
                     "Declaro que he sido informado(a) de forma clara y suficiente acerca del procedimiento podológico..."
                  </p>
                  <div className="space-y-1 pt-2">
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo del Paciente</label>
                     <input 
                        type="text" 
                        value={formData.patientName} 
                        onChange={e => setFormData({...formData, patientName: e.target.value})} 
                        className="w-full p-3 bg-white border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:border-brand-purple outline-none" 
                     />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-100">
               <div className="space-y-4">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Firma del Paciente</p>
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-4 relative h-40 flex items-center justify-center overflow-hidden group">
                     {formData.patientSignature ? (
                        <img src={formData.patientSignature} alt="Patient Sig" className="max-h-full" />
                     ) : (
                        <SignatureCanvas 
                          ref={patientSigCanvas}
                          penColor="#1e293b"
                          canvasProps={{ className: 'w-full h-full cursor-crosshair' }}
                        />
                     )}
                     {!formData.patientSignature && (
                        <button onClick={() => patientSigCanvas.current?.clear()} className="absolute bottom-4 right-4 text-[11px] font-black text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">Limpiar</button>
                     )}
                  </div>
                  <p className="text-[11px] font-black text-slate-400 text-center uppercase tracking-tighter">{formData.patientName}</p>
               </div>
               <div className="space-y-4">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Firma del Especialista</p>
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-4 relative h-40 flex items-center justify-center overflow-hidden group">
                     {formData.specialistSignature ? (
                        <img src={formData.specialistSignature} alt="Spec Sig" className="max-h-full" />
                     ) : (
                        <SignatureCanvas 
                          ref={specialistSigCanvas}
                          penColor="#7c3aed"
                          canvasProps={{ className: 'w-full h-full cursor-crosshair' }}
                        />
                     )}
                     {!formData.specialistSignature && (
                        <button onClick={() => specialistSigCanvas.current?.clear()} className="absolute bottom-4 right-4 text-[11px] font-black text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">Limpiar</button>
                     )}
                  </div>
                  <p className="text-[11px] font-black text-slate-400 text-center uppercase tracking-tighter">Especialista Podológico</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
