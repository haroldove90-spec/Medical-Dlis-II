/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Save, Trash2, FileDown, CheckCircle2, ClipboardCheck, Phone, Mail, User, Info, AlertTriangle, ShieldCheck, ClipboardList, Lock, MapPin } from 'lucide-react';
import { InformedConsent, Patient } from '../types';
import SignatureCanvas from 'react-signature-canvas';
import { jsPDF } from 'jspdf';

interface ConsentFormProps {
  patient: Patient;
  onClose: () => void;
  onSave: (consent: InformedConsent) => void;
  initialData?: InformedConsent;
  patients?: Patient[];
}

export default function ConsentForm({ patient, onClose, onSave, initialData, patients }: ConsentFormProps) {
  const [formData, setFormData] = useState<InformedConsent>(initialData || {
    id: '',
    patientId: patient.id,
    date: new Date().toISOString().split('T')[0],
    type: 'Podología',
    patientData: {
      fullName: patient.name,
      phone: patient.phone || '',
      email: patient.email || '',
      age: patient.age || 0,
      sex: patient.gender || '',
      medicalHistory: '',
    },
    podiatryProcedures: {
      nailCutting: true,
      callusRemoval: true,
      ingrownNail: false,
      antisepticCleaning: true,
      topicalApplication: true,
      complementaryProcedures: true,
    },
    aestheticsConsent: {
      procedureName: '',
      accepted: true,
    },
    alternative: 'none',
    signature: '',
  });

  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [patientConsents, setPatientConsents] = useState<InformedConsent[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('medical_dlis_informed_consents');
      if (saved) {
        const all = JSON.parse(saved) as InformedConsent[];
        const filtered = all.filter(c => c.patientId === patient.id || c.patientData?.fullName === patient.name);
        setPatientConsents(filtered);
      } else {
        setPatientConsents([]);
      }
    } catch (e) {
      console.error(e);
      setPatientConsents([]);
    }
  }, [patient, isSaving]);

  const handleClearSignature = () => {
    sigCanvas.current?.clear();
    setFormData({ ...formData, signature: '' });
  };

  const handleSave = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      const finalData = { ...formData, signature: signatureData, id: formData.id || `CONS-${Math.floor(Math.random() * 10000)}` };
      setIsSaving(true);
      setTimeout(() => {
        onSave(finalData);
        setIsSaving(false);
      }, 1000);
    } else if (formData.signature) {
      onSave(formData);
    } else {
      alert('Por favor, firme el documento para continuar.');
    }
  };
  const generatePDF = (consent: InformedConsent) => {
    const doc = new jsPDF();
    
    // Page 1
    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('MEDICAL D\'LIS', 105, 15, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Av. Glandorf 3706, Col San Felipe, CP 31203, Tel. 6144891998', 105, 21, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    let consentTitle = 'PARA TRATAMIENTO PODOLÓGICO';
    if (consent.type === 'Medicina Estética') consentTitle = 'PARA TRATAMIENTO DE MEDICINA ESTÉTICA';
    else if (consent.type === 'Medicina General') consentTitle = 'PARA ATENCIÓN DE MEDICINA GENERAL';
    
    doc.text(`CONSENTIMIENTO INFORMADO ${consentTitle}`, 105, 28, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Lugar: ${consent.lugar || 'Chihuahua, Chih.'}`, 20, 36);
    doc.text(`Fecha: ${consent.date}`, 160, 36);
    
    // I. DATOS DEL PACIENTE
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('I. DATOS DEL PACIENTE', 20, 45);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Nombre completo: ${consent.patientData.fullName}`, 20, 51);
    doc.text(`Teléfono: ${consent.patientData.phone}`, 20, 56);
    doc.text(`Correo electrónico: ${consent.patientData.email || 'No proporcionado'}`, 110, 56);
    doc.text(`Edad: ${consent.patientData.age} años`, 20, 61);
    doc.text(`Sexo: ${consent.patientData.sex === 'M' ? 'Masculino' : consent.patientData.sex === 'F' ? 'Femenino' : consent.patientData.sex || 'No especificado'}`, 110, 61);
    
    const relevantesTxt = `Relevantes (diabetes, hipertensión, alergias, otros): ${consent.patientData.relevantes || 'Ninguno'}`;
    const splitRelevantes = doc.splitTextToSize(relevantesTxt, 170);
    doc.text(splitRelevantes, 20, 66);
    let yPos = 66 + (splitRelevantes.length * 4.5);
    
    const antecedenteTxt = `Antecedentes médicos / clínicos: ${consent.patientData.medicalHistory || 'Ninguno'}`;
    const splitHistory = doc.splitTextToSize(antecedenteTxt, 170);
    doc.text(splitHistory, 20, yPos);
    yPos += (splitHistory.length * 4.5) + 5;
    
    // II. DESCRIPCIÓN DEL PROCEDIMIENTO
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('II. DESCRIPCIÓN DEL PROCEDIMIENTO', 20, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    if (consent.type === 'Medicina Estética') {
      doc.text(`Procedimiento: ${consent.aestheticsConsent?.procedureName || 'Tratamiento Estético'}`, 20, yPos);
      yPos += 5;
      const aestheticPoints = [
        "1. El paciente reconoce haber sido informado sobre el producto y técnica a aplicar.",
        "2. Se han discutido las recomendaciones pre-procedimiento y contraindicaciones.",
        "3. Se reconocen riesgos comunes: hematomas, edema, eritema o dolor local.",
        "4. El paciente se compromete a seguir el plan de cuidados post-procedimiento.",
        "5. Autorizo la realización del procedimiento descrito y el seguimiento fotográfico."
      ];
      aestheticPoints.forEach(p => {
        const lines = doc.splitTextToSize(p, 170);
        doc.text(lines, 20, yPos);
        yPos += lines.length * 4.5 + 1;
      });
      yPos += 3;
    } else if (consent.type === 'Medicina General') {
      doc.text('Atención Médica General e Integral', 20, yPos);
      yPos += 5;
      const generalPoints = [
        "1. El paciente otorga su consentimiento para la realización de la historia clínica y exploración física.",
        "2. Autoriza el procesamiento de sus datos de salud con asistencia de herramientas digitales.",
        "3. Se han discutido las finalidades del diagnóstico y el plan terapéutico sugerido.",
        "4. El paciente reconoce que ha sido informado sobre la NOM-004-SSA3-2012 del expediente clínico.",
        "5. Otorgo mi consentimiento expreso para el tratamiento de mis datos personales y sensibles."
      ];
      generalPoints.forEach(p => {
        const lines = doc.splitTextToSize(p, 170);
        doc.text(lines, 20, yPos);
        yPos += lines.length * 4.5 + 1;
      });
      yPos += 3;
    } else {
      doc.text('El tratamiento podológico que se me realizará consiste en: PEDICURE CLINICO', 20, yPos);
      doc.text('Este procedimiento podrá incluir, según valoración profesional, uno o varios de los siguientes actos:', 20, yPos + 4);
      yPos += 9;
      
      const procMap: {[key: string]: string} = {
        nailCutting: 'Corte y fresado terapéutico de uñas.',
        callusRemoval: 'Eliminación de hiperqueratosis, callosidades o helomas.',
        ingrownNail: 'Atención de uñas encarnadas (onicocriptosis).',
        antisepticCleaning: 'Limpieza antiséptica y cuidado integral del pie.',
        topicalApplication: 'Aplicación tópica de productos antifúngicos, hidratantes o regeneradores.',
        complementaryProcedures: 'Procedimientos complementarios de quiropedia o pedicure clínico con fines terapéuticos.',
      };
      
      if (consent.podiatryProcedures) {
        Object.entries(consent.podiatryProcedures).forEach(([key, val]) => {
          if (val && procMap[key]) {
            const splitProc = doc.splitTextToSize(`- ${procMap[key]}`, 165);
            doc.text(splitProc, 25, yPos);
            yPos += splitProc.length * 4 + 1.5;
          }
        });
      }
      
      const biosecurityText = "El procedimiento se realizará bajo estrictas normas de bioseguridad, cumpliendo con las normas NOM-087-ECOL-SSA1-2002 y NOM-005-SSA3-2018.";
      const splitBio = doc.splitTextToSize(biosecurityText, 170);
      doc.setFont('helvetica', 'italic');
      doc.text(splitBio, 20, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += (splitBio.length * 4) + 5;
    }
    
    // III. BENEFICIOS ESPERADOS
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('III. BENEFICIOS ESPERADOS', 20, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    if (consent.type === 'Medicina Estética') {
      const bText = "Mejora en la apariencia estética, armonización facial/corporal y aumento de la autoestima.";
      doc.text(bText, 20, yPos);
      yPos += 6;
    } else if (consent.type === 'Medicina General') {
      const bText = "Diagnóstico preciso, prevención de enfermedades y mejora del estado general de salud.";
      doc.text(bText, 20, yPos);
      yPos += 6;
    } else {
      const podiatryBenefits = [
        "- Disminución de molestias, dolor o alteraciones en uñas y piel del pie.",
        "- Mejora del aspecto y funcionalidad del pie.",
        "- Prevención de infecciones o complicaciones dérmicas.",
        "- Contribución al bienestar general y salud podal."
      ];
      podiatryBenefits.forEach(b => {
        doc.text(b, 20, yPos);
        yPos += 4.5;
      });
      yPos += 1;
    }
    
    // IV. RIESGOS Y POSIBLES COMPLICACIONES
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('IV. RIESGOS Y POSIBLES COMPLICACIONES', 20, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    if (consent.type === 'Medicina Estética') {
      const rText = "Hematomas, inflamación temporal, asimetrías transitorias o reacciones de hipersensibilidad.";
      doc.text(rText, 20, yPos);
      yPos += 6;
    } else if (consent.type === 'Medicina General') {
      const rText = "Reacciones adversas a fármacos (si se prescriben) o molestias menores en la exploración.";
      doc.text(rText, 20, yPos);
      yPos += 6;
    } else {
      doc.text('Aunque el tratamiento se realiza bajo estrictas normas de asepsia y técnica profesional, pueden presentarse:', 20, yPos);
      yPos += 4.5;
      const podiatryRisks = [
        "- Dolor o molestia leve durante o después del procedimiento.",
        "- Sangrado superficial por alteraciones ungueales o dérmicas.",
        "- Irritación o enrojecimiento transitorio.",
        "- Reacciones alérgicas a productos utilizados.",
        "- Riesgo mínimo de infección si no se siguen los cuidados posteriores."
      ];
      podiatryRisks.forEach(r => {
        doc.text(r, 20, yPos);
        yPos += 4.5;
      });
      doc.setFont('helvetica', 'bold');
      doc.text('El paciente manifiesta haber sido informado sobre estos posibles efectos y asume su conocimiento.', 20, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 6;
    }
    
    // V. ALTERNATIVAS DISPONIBLES
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('V. ALTERNATIVAS DISPONIBLES', 20, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('El paciente ha sido informado que puede optar por:', 20, yPos);
    yPos += 4.5;
    
    doc.text('- No realizar el procedimiento.', 25, yPos);
    doc.text('- Solicitar valoración médica o dermatológica previa.', 25, yPos + 4.5);
    doc.text('- Recibir tratamiento alternativo o diferido en otra cita.', 25, yPos + 9);
    
    yPos += 15;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('El paciente comprende que rechazar o posponer el tratamiento puede prolongar o agravar su afección podal.', 20, yPos);
    
    // PAGE 2
    doc.addPage();
    let yPos2 = 15;
    
    // Header page 2
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('MEDICAL D\'LIS - CONSENTIMIENTO INFORMADO', 20, yPos2);
    doc.line(20, yPos2 + 2, 190, yPos2 + 2);
    yPos2 += 10;
    
    // VI. DERECHOS DEL PACIENTE
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('VI. DERECHOS DEL PACIENTE', 20, yPos2);
    yPos2 += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('El paciente tiene derecho a:', 20, yPos2);
    yPos2 += 4.5;
    
    const rights = [
      "1. Recibir atención respetuosa, de calidad, digna y profesional.",
      "2. Conocer la identidad y calificación del podólogo tratante.",
      "3. Solicitar aclaraciones antes, durante y después del procedimiento.",
      "4. Revocar su consentimiento en cualquier momento, antes o durante el tratamiento, sin penalización alguna.",
      "5. Acceder a la confidencialidad de su información personal y clínica."
    ];
    rights.forEach(r => {
      const lines = doc.splitTextToSize(r, 170);
      doc.text(lines, 20, yPos2);
      yPos2 += lines.length * 4.5 + 1;
    });
    yPos2 += 3;
    
    // VII. CONFIDENCIALIDAD
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('VII. CONFIDENCIALIDAD', 20, yPos2);
    yPos2 += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const confText = "Toda la información obtenida durante su atención será tratada con carácter estrictamente confidencial, conforme a la Ley Federal de Protección de Datos Personales en Posesión de Particulares. Los datos no serán compartidos sin autorización expresa del paciente, salvo por requerimiento legal o sanitario.";
    const splitConf = doc.splitTextToSize(confText, 170);
    doc.text(splitConf, 20, yPos2);
    yPos2 += splitConf.length * 4.5 + 5;
    
    // VIII. DECLARACIÓN DE CONSENTIMIENTO
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('VIII. DECLARACIÓN DE CONSENTIMIENTO', 20, yPos2);
    yPos2 += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const declText = "Declaro que he sido informado(a) de forma clara y suficiente acerca del procedimiento podológico a realizar, sus beneficios, riesgos, alternativas y cuidados posteriores. He tenido oportunidad de hacer preguntas y todas mis dudas han sido aclaradas satisfactoriamente. Otorgo mi consentimiento libre, voluntario e informado para que se realice el tratamiento descrito.";
    const splitDecl = doc.splitTextToSize(declText, 170);
    doc.text(splitDecl, 20, yPos2);
    yPos2 += splitDecl.length * 4.5 + 5;
    
    // IX. OBSERVACIONES O INDICACIONES POSTERIORES
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('IX. OBSERVACIONES O INDICACIONES POSTERIORES', 20, yPos2);
    yPos2 += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    const obsVal = consent.observations || 'Sin observaciones o indicaciones adicionales registradas.';
    const splitObs = doc.splitTextToSize(obsVal, 170);
    doc.text(splitObs, 20, yPos2);
    yPos2 += splitObs.length * 4.5 + 20;
    
    // Signatures
    if (consent.signature) {
      doc.addImage(consent.signature, 'PNG', 75, yPos2, 60, 22);
    }
    yPos2 += 24;
    doc.line(65, yPos2, 145, yPos2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(consent.patientData.fullName, 105, yPos2 + 5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('FIRMA DEL PACIENTE O TUTOR', 105, yPos2 + 9, { align: 'center' });
    doc.text(`Lugar y fecha: ${consent.lugar || 'Chihuahua, Chih.'}, a ${consent.date}`, 105, yPos2 + 14, { align: 'center' });
 
    doc.save(`Consentimiento_${consent.type?.replace(/\s+/g, '_')}_${consent.patientData.fullName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 p-6 md:p-10 shadow-xl space-y-10 relative overflow-hidden"
    >
      {/* Decorative top strip */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-purple to-purple-400"></div>

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-brand-purple/10 text-brand-purple rounded-lg text-xs font-black uppercase tracking-wider">CONSENTIMIENTO INFORMADO</span>
            </div>
            <h2 className="text-2xl font-display font-black text-slate-900 leading-none mt-2">
              {formData.type || 'General'}
            </h2>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto shrink-0">
           {initialData && (
              <button 
                onClick={() => generatePDF(formData)}
                className="px-6 py-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                Exportar PDF
              </button>
           )}
           <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-4 bg-brand-purple text-white hover:bg-brand-purple/90 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-brand-purple/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <CheckCircle2 className="w-4 h-4 animate-bounce" /> : <Save className="w-4 h-4" />}
                <span>{isSaving ? 'Guardando...' : 'Firmar y Guardar'}</span>
           </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8 pb-32">
        {/* Logo & Info */}
        <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
               <div className="w-20 h-20 bg-brand-purple/10 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-10 h-10 text-brand-purple" />
               </div>
               <div>
                  <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight italic">MEDICAL <span className="text-brand-purple">D'LIS</span></h1>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Av. Glandorf 3706, Col San Felipe</p>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Tel: 6144891998</p>
               </div>
               <div className="pt-4 pb-2 border-y border-slate-50 w-full">
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">Consentimiento Informado</h2>
                  <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Procedimientos de {formData.type || 'Medicina'}</p>
               </div>
               <div className="w-full flex justify-end">
                  <div className="text-left">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Fecha de Emisión</label>
                     <input 
                       type="date" 
                       value={formData.date}
                       onChange={e => setFormData({...formData, date: e.target.value})}
                       className="p-2 border-2 border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-brand-purple"
                     />
                  </div>
               </div>
            </div>

            {/* I. Patient Data */}
            <div className="space-y-6 pt-6 border-t border-slate-50">
               <div className="flex items-center gap-3 text-brand-purple">
                  <User className="w-5 h-5" />
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">I. Datos del Paciente</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patients && patients.length > 0 && (
                     <div className="space-y-1 col-span-1 md:col-span-2 lg:col-span-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Seleccionar Paciente</label>
                        <select
                           value={formData.patientId || ''}
                           onChange={e => {
                              const selectedId = e.target.value;
                              const found = patients.find(p => p.id === selectedId);
                              if (found) {
                                 setFormData(prev => ({
                                    ...prev,
                                    patientId: found.id,
                                    patientData: {
                                       ...prev.patientData,
                                       fullName: found.name,
                                       phone: found.phone || '',
                                       email: found.email || '',
                                       age: found.age || 28,
                                       sex: found.gender === 'Femenino' ? 'F' : 'M'
                                    }
                                 }));
                              }
                           }}
                           className="form-input-hc"
                        >
                           <option value="" disabled>-- Seleccione un paciente --</option>
                           {patients.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                           ))}
                        </select>
                     </div>
                  )}
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre Completo</label>
                     <input type="text" value={formData.patientData.fullName} onChange={e => setFormData({...formData, patientData: {...formData.patientData, fullName: e.target.value}})} className="form-input-hc" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Teléfono</label>
                     <input type="tel" value={formData.patientData.phone} onChange={e => setFormData({...formData, patientData: {...formData.patientData, phone: e.target.value}})} className="form-input-hc" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Correo Electrónico</label>
                     <input type="email" value={formData.patientData.email} onChange={e => setFormData({...formData, patientData: {...formData.patientData, email: e.target.value}})} className="form-input-hc" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Edad</label>
                       <input type="number" value={formData.patientData.age} onChange={e => setFormData({...formData, patientData: {...formData.patientData, age: parseInt(e.target.value)}})} className="form-input-hc" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sexo</label>
                       <select value={formData.patientData.sex} onChange={e => setFormData({...formData, patientData: {...formData.patientData, sex: e.target.value}})} className="form-input-hc">
                          <option value="M">Masculino</option>
                          <option value="F">Femenino</option>
                          <option value="O">Otro</option>
                       </select>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Relevantes (diabetes, hipertensión, alergias, otros)</label>
                     <input type="text" value={formData.patientData.relevantes || ''} onChange={e => setFormData({...formData, patientData: {...formData.patientData, relevantes: e.target.value}})} placeholder="Indique diabetes, hipertensión, alergias u otros..." className="form-input-hc" />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Antecedentes Médicos / Clínicos</label>
                     <textarea value={formData.patientData.medicalHistory} onChange={e => setFormData({...formData, patientData: {...formData.patientData, medicalHistory: e.target.value}})} placeholder="Resto de antecedentes médicos o quirúrgicos..." className="form-input-hc min-h-[100px] resize-none" />
                  </div>
               </div>
            </div>

            {/* II. Procedures */}
            <div className="space-y-6 pt-6 border-t border-slate-50">
               <div className="flex items-center gap-3 text-brand-purple">
                  <ClipboardCheck className="w-5 h-5" />
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">II. {formData.type === 'Medicina Estética' ? 'Información sobre el Tratamiento' : formData.type === 'Medicina General' ? 'Información sobre el Servicio' : 'Descripción del Procedimiento'}</h3>
               </div>
               
               {formData.type === 'Medicina Estética' ? (
                 <div className="space-y-6">
                    <div className="bg-brand-purple/5 p-6 rounded-2xl border-l-4 border-brand-purple">
                       <label className="text-[10px] font-black text-brand-purple uppercase tracking-widest block mb-2 italic">Procedimiento a realizar</label>
                       <input 
                         type="text" 
                         value={formData.aestheticsConsent?.procedureName} 
                         onChange={e => setFormData({...formData, aestheticsConsent: {...formData.aestheticsConsent!, procedureName: e.target.value}})}
                         placeholder="Ej: Toxina Botulínica, Rellenos..."
                         className="form-input-hc bg-white"
                       />
                    </div>
                    
                    <div className="space-y-4">
                       {[
                         { title: '1. Información sobre el tratamiento', text: 'He sido informado sobre las características del tratamiento, el producto a utilizar y la técnica de aplicación. Entiendo que los resultados pueden variar según las características del paciente.', icon: Info },
                         { title: '2. Recomendaciones pre-procedimiento', text: 'Confirmo que he seguido las indicaciones de no tomar anticoagulantes o suplementos que aumenten el riesgo de sangrado, y que no presento infecciones activas en la zona.', icon: ClipboardCheck },
                         { title: '3. Riesgos posibles', text: 'Entiendo que existen riesgos comunes como hematomas, edema, eritema, equimosis, asimetrías transitorias o dolor local en el sitio de inyección.', icon: AlertTriangle },
                         { title: '4. Cuidados post-procedimiento', text: 'Me comprometo a seguir las indicaciones de no realizar ejercicio físico intenso, no exponerme al calor (sauna, sol) y acudir a mi cita de control en 15 días.', icon: CheckCircle2 }
                       ].map((item, idx) => {
                         const Icon = item.icon;
                         return (
                           <div key={idx} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-brand-purple/20 transition-all">
                              <Icon className="w-6 h-6 text-brand-purple shrink-0" />
                              <div className="space-y-1">
                                 <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-tight italic">{item.title}</h4>
                                 <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{item.text}</p>
                              </div>
                           </div>
                         );
                       })}
                       <label className="flex items-center gap-3 p-4 bg-slate-900 rounded-2xl cursor-pointer mt-4">
                          <input 
                            type="checkbox" 
                            checked={formData.aestheticsConsent?.accepted}
                            onChange={() => setFormData({...formData, aestheticsConsent: {...formData.aestheticsConsent!, accepted: !formData.aestheticsConsent?.accepted}})}
                            className="w-5 h-5 accent-brand-purple"
                          />
                          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">He leído y acepto los términos y el seguimiento fotográfico</span>
                       </label>
                    </div>
                 </div>
               ) : formData.type === 'Medicina General' ? (
                 <div className="space-y-6">
                    <div className="bg-brand-purple/5 p-6 rounded-2xl border-l-4 border-brand-purple">
                       <p className="text-[10px] font-black text-brand-purple uppercase tracking-widest mb-1 italic">Declaración de Consentimiento para Atención Médica</p>
                       <p className="text-sm text-slate-700 font-bold leading-relaxed italic">
                         "Otorgo mi consentimiento expreso y por escrito para que mis datos personales, incluidos los sensibles de salud, sean tratados conforme al aviso de privacidad de Medical D'Lis. Acepto la integración de mi expediente clínico digital y el uso de herramientas tecnológicas para mi diagnóstico y tratamiento."
                       </p>
                    </div>
                    
                    <div className="space-y-4">
                       {[
                         { title: '1. Integración de Expediente', text: 'Entiendo que se recabarán mis Antecedentes Heredo-Familiares, Patológicos, No Patológicos y Signos Vitales para la integración de mi expediente médico.', icon: ClipboardList },
                         { title: '2. NOM-004-SSA3-2012', text: 'Reconozco que el manejo de mi información se realiza bajo los lineamientos de la Norma Oficial Mexicana aplicable al Expediente Clínico.', icon: ShieldCheck },
                         { title: '3. Finalidad del Tratamiento', text: 'Sé que mis datos se utilizarán para la prestación de servicios de salud, diagnósticos médicos y envío de recetas o resultados digitales.', icon: CheckCircle2 },
                         { title: '4. Derechos ARCO', text: 'Se me ha informado sobre mi derecho a acceder, rectificar, cancelar u oponerme al tratamiento de mis datos personales en cualquier momento.', icon: Lock }
                       ].map((item, idx) => {
                         const Icon = item.icon;
                         return (
                           <div key={idx} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-brand-purple/20 transition-all">
                              <Icon className="w-6 h-6 text-brand-purple shrink-0" />
                              <div className="space-y-1">
                                 <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-tight italic">{item.title}</h4>
                                 <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{item.text}</p>
                              </div>
                           </div>
                         );
                       })}
                    </div>
                 </div>
               ) : (
                 <>
                   <div className="bg-slate-50 p-6 rounded-2xl">
                      <p className="text-sm font-bold text-slate-700 italic border-l-4 border-brand-purple pl-4 mb-6">
                         Nombre del tratamiento: <span className="text-brand-purple text-lg not-italic font-black">PEDICURE CLÍNICO</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {[
                           { id: 'nailCutting', label: 'Corte y fresado terapéutico de uñas.' },
                           { id: 'callusRemoval', label: 'Eliminación de hiperqueratosis, callosidades o helomas.' },
                           { id: 'ingrownNail', label: 'Atención de uñas encarnadas (onicocriptosis).' },
                           { id: 'antisepticCleaning', label: 'Limpieza antiséptica y cuidado integral del pie.' },
                           { id: 'topicalApplication', label: 'Aplicación tópica de productos antifúngicos, hidratantes o regeneradores.' },
                           { id: 'complementaryProcedures', label: 'Procedimientos complementarios de quiropedia o pedicure clínico con fines terapéuticos.' },
                         ].map(item => (
                            <label key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-brand-purple/20 transition-all">
                               <input 
                                 type="checkbox" 
                                 checked={formData.podiatryProcedures?.[item.id as keyof typeof formData.podiatryProcedures] || false} 
                                 onChange={() => setFormData({...formData, podiatryProcedures: {...formData.podiatryProcedures!, [item.id]: !formData.podiatryProcedures?.[item.id as keyof typeof formData.podiatryProcedures]}})}
                                 className="w-5 h-5 accent-brand-purple rounded-md"
                               />
                               <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                            </label>
                         ))}
                      </div>
                   </div>
                   <div className="bg-rose-50/50 p-6 rounded-2xl border-2 border-rose-100 flex gap-4">
                      <ShieldCheck className="w-8 h-8 text-rose-500 shrink-0 mt-1" />
                      <div className="space-y-2">
                         <h4 className="text-[11px] font-black text-rose-600 uppercase tracking-widest">Cláusula de Bioseguridad</h4>
                         <p className="text-xs text-rose-900/70 font-bold leading-relaxed">
                            Este establecimiento cumple rigurosamente con las normas mexicanas de bioseguridad <b>NOM-087-ECOL-SSA1-2002</b> y <b>NOM-005-SSA3-2018</b>. El procedimiento se realiza en un entorno seguro, utilizando material estéril o desechable y con estrictas prácticas de control de bioseguridad.
                          </p>
                       </div>
                    </div>
                  </>
               )}
            </div>

            {/* III & IV Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-50">
               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600">
                     <CheckCircle2 className="w-5 h-5" />
                     <h3 className="text-sm font-black uppercase tracking-tight">III. Objetivo y Beneficios</h3>
                   </div>
                   {formData.type === 'Medicina Estética' ? (
                     <p className="text-xs text-slate-500 font-bold leading-relaxed bg-emerald-50/30 p-4 rounded-xl border border-emerald-100">
                       Mejora en la armonía facial/corporal, rejuvenecimiento de la zona tratada y aumento de la confianza personal mediante técnicas mínimamente invasivas.
                     </p>
                   ) : formData.type === 'Medicina General' ? (
                     <p className="text-xs text-slate-500 font-bold leading-relaxed bg-emerald-50/30 p-4 rounded-xl border border-emerald-100">
                       Diagnóstico integral, detección oportuna de riesgos a la salud, establecimiento de metas terapéuticas y mejora en la calidad de vida.
                     </p>
                   ) : (
                     <div className="text-xs text-slate-500 font-bold leading-relaxed bg-emerald-50/30 p-4 rounded-xl border border-emerald-100 space-y-2">
                       <p className="font-extrabold text-emerald-800">El tratamiento busca lograr los siguientes beneficios:</p>
                       <ul className="list-disc list-inside space-y-1">
                         <li>Disminución de molestias, dolor o alteraciones en uñas y piel del pie.</li>
                         <li>Mejora del aspecto y funcionalidad del pie.</li>
                         <li>Prevención de infecciones o complicaciones dérmicas.</li>
                         <li>Contribución al bienestar general y salud podal.</li>
                       </ul>
                     </div>
                   )}
               </div>
               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-rose-600">
                     <AlertTriangle className="w-5 h-5" />
                     <h3 className="text-sm font-black uppercase tracking-tight">IV. Riesgos y Complicaciones</h3>
                  </div>
                  {formData.type === 'Medicina Estética' ? (
                     <p className="text-xs text-slate-500 font-bold leading-relaxed bg-rose-50/30 p-4 rounded-xl border border-rose-100">
                       Edema temporal, eritema, dolor localizado, riesgo de hematomas, asimetrías transitorias que pueden requerir retoque o reacciones de sensibilidad al producto.
                     </p>
                   ) : formData.type === 'Medicina General' ? (
                     <p className="text-xs text-slate-500 font-bold leading-relaxed bg-rose-50/30 p-4 rounded-xl border border-rose-100">
                       Posibles efectos secundarios de medicamentos, molestias transitorias durante la exploración física o riesgos inherentes a la historia clínica.
                     </p>
                   ) : (
                     <div className="text-xs text-slate-500 font-bold leading-relaxed bg-rose-50/30 p-4 rounded-xl border border-rose-100 space-y-2">
                       <p className="font-extrabold text-rose-800">Aunque el tratamiento se realiza bajo estrictas normas de asepsia y técnica profesional, pueden presentarse:</p>
                       <ul className="list-disc list-inside space-y-1">
                         <li>Dolor o molestia leve durante o después del procedimiento.</li>
                         <li>Sangrado superficial por alteraciones ungueales o dérmicas.</li>
                         <li>Irritación o enrojecimiento transitorio.</li>
                         <li>Reacciones alérgicas a productos utilizados.</li>
                         <li>Riesgo mínimo de infección si no se siguen los cuidados posteriores.</li>
                       </ul>
                       <p className="mt-2 font-black italic text-rose-900 border-t border-rose-200/50 pt-1">
                         El paciente manifiesta haber sido informado sobre estos posibles efectos y asume su conocimiento.
                       </p>
                     </div>
                   )}
               </div>
            </div>

            {/* V. Alternatives */}
            <div className="space-y-6 pt-6 border-t border-slate-50">
               <div className="flex items-center gap-3 text-brand-purple">
                  <Info className="w-5 h-5" />
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">V. Alternativas Disponibles</h3>
               </div>
               <p className="text-xs text-slate-400 font-bold tracking-wide">El paciente ha sido informado que puede optar por:</p>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'none', label: 'No realizar el procedimiento.' },
                    { id: 'valuation', label: 'Solicitar valoración médica o dermatológica previa.' },
                    { id: 'alternative', label: 'Recibir tratamiento alternativo o diferido en otra cita.' },
                  ].map(option => (
                    <label key={option.id} className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.alternative === option.id ? 'bg-brand-purple text-white border-brand-purple shadow-lg scale-[1.02]' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>
                       <input 
                         type="radio" 
                         name="alternative" 
                         checked={formData.alternative === option.id}
                         onChange={() => setFormData({...formData, alternative: option.id as any})}
                         className="hidden"
                       />
                       <span className={`text-[11px] font-black uppercase tracking-widest ${formData.alternative === option.id ? 'text-white' : 'text-slate-500'}`}>{option.label}</span>
                    </label>
                  ))}
               </div>
               <div className="p-4 bg-orange-50 text-orange-900 rounded-2xl border border-orange-200 text-xs font-bold leading-relaxed italic flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
                  <span>El paciente comprende que rechazar o posponer el tratamiento puede prolongar o agravar su afección podal.</span>
               </div>
            </div>

            {/* VI. DERECHOS DEL PACIENTE */}
            <div className="space-y-6 pt-6 border-t border-slate-50">
               <div className="flex items-center gap-3 text-brand-purple">
                  <ShieldCheck className="w-5 h-5 text-brand-purple shrink-0" />
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">VI. Derechos del Paciente</h3>
               </div>
               <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 text-xs text-slate-600 font-bold space-y-3">
                  <p className="font-extrabold text-slate-800">El paciente tiene derecho a:</p>
                  <ol className="list-decimal list-inside space-y-2 pl-2">
                     <li>Recibir atención respetuosa, de calidad, digna y profesional.</li>
                     <li>Conocer la identidad y calificación del podólogo tratante.</li>
                     <li>Solicitar aclaraciones antes, durante y después del procedimiento.</li>
                     <li>Revocar su consentimiento en cualquier momento, antes o durante el tratamiento, sin penalización alguna.</li>
                     <li>Acceder a la confidencialidad de su información personal y clínica.</li>
                  </ol>
               </div>
            </div>

            {/* VII. CONFIDENCIALIDAD */}
            <div className="space-y-6 pt-6 border-t border-slate-50">
               <div className="flex items-center gap-3 text-brand-purple">
                  <Lock className="w-5 h-5 text-brand-purple shrink-0" />
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">VII. Confidencialidad</h3>
               </div>
               <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 text-xs text-slate-600 font-bold leading-relaxed">
                  <p>Toda la información obtenida durante su atención será tratada con carácter estrictamente confidencial, conforme a la Ley Federal de Protección de Datos Personales en Posesión de Particulares.</p>
                  <p className="mt-2 text-brand-purple font-extrabold">Los datos no serán compartidos sin autorización expresa del paciente, salvo por requerimiento legal o sanitario.</p>
               </div>
            </div>

            {/* VIII. DECLARACIÓN DE CONSENTIMIENTO */}
            <div className="space-y-6 pt-6 border-t border-slate-50">
               <div className="flex items-center gap-3 text-brand-purple">
                  <ClipboardList className="w-5 h-5 text-brand-purple shrink-0" />
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">VIII. Declaración de Consentimiento</h3>
               </div>
               <div className="bg-brand-purple/5 p-6 rounded-2xl border-l-4 border-brand-purple text-xs text-slate-800 font-semibold italic space-y-2 leading-relaxed">
                  <p>"Declaro que he sido informado(a) de forma clara y suficiente acerca del procedimiento podológico a realizar, sus beneficios, riesgos, alternativas y cuidados posteriores."</p>
                  <p>"He tenido oportunidad de hacer preguntas y todas mis dudas han sido aclaradas satisfactoriamente."</p>
                  <p className="font-bold text-brand-purple">"Otorgo mi consentimiento libre, voluntario e informado para que se realice el tratamiento descrito."</p>
               </div>
            </div>

            {/* IX. OBSERVACIONES O INDICACIONES POSTERIORES */}
            <div className="space-y-6 pt-6 border-t border-slate-50">
               <div className="flex items-center gap-3 text-brand-purple">
                  <MapPin className="w-5 h-5 text-brand-purple shrink-0" />
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">IX. Observaciones o Indicaciones Posteriores</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Lugar de Elaboración</label>
                     <input type="text" value={formData.lugar || 'Chihuahua, Chih.'} onChange={e => setFormData({...formData, lugar: e.target.value})} className="form-input-hc" placeholder="Ej. Chihuahua, Chih." />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Observaciones / Indicaciones Específicas</label>
                     <textarea value={formData.observations || ''} onChange={e => setFormData({...formData, observations: e.target.value})} className="form-input-hc min-h-[48px] py-3.5 resize-none" placeholder="Indicaciones post-procedimiento p.ej. reposo, medicamentos..." />
                  </div>
               </div>
            </div>

            {/* Signature Section */}
            <div className="pt-12 border-t-2 border-slate-100 space-y-8 bg-slate-50/50 -mx-6 md:-mx-12 p-6 md:p-12 pb-24 rounded-b-[2rem] md:rounded-b-[3.5rem]">
               <div className="text-center max-w-2xl mx-auto space-y-4">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight underline decoration-brand-purple/30">Declaración de Conformidad</h3>
                  <p className="text-xs text-slate-500 font-bold leading-loose italic">
                    {formData.type === 'Medicina General' ? (
                      `"Yo, ${formData.patientData.fullName || '____________________'}, manifiesto mi conformidad para la integración de mi expediente clínico y tratamiento médico en MEDICAL D'LIS, aceptando los términos de privacidad y seguridad informados."`
                    ) : (
                      `"Yo, ${formData.patientData.fullName || '____________________'}, por voluntad propia, autorizo al personal de ${formData.type === 'Medicina Estética' ? 'medicina estética' : 'podología'} de MEDICAL D'LIS a realizar los procedimientos seleccionados, manifestando que he comprendido los beneficios y riesgos informados en este documento."`
                    )}
                  </p>
               </div>

               <div className="max-w-md mx-auto space-y-4">
                  <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] p-4 shadow-xl relative overflow-hidden group">
                     {formData.signature ? (
                        <div className="h-48 flex items-center justify-center relative">
                           <img src={formData.signature} alt="Signature" className="max-h-full" />
                           <button onClick={handleClearSignature} className="absolute top-2 right-2 p-2 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     ) : (
                        <>
                          <SignatureCanvas 
                            ref={sigCanvas}
                            penColor="#7c3aed"
                            canvasProps={{
                              className: 'w-full h-48 cursor-crosshair'
                            }}
                          />
                          <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-40 group-hover:opacity-100 transition-opacity pointer-events-none">
                             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Firma aquí</p>
                          </div>
                          <button 
                            onClick={() => sigCanvas.current?.clear()}
                            className="absolute bottom-4 right-4 text-[9px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-500 transition-colors"
                          >
                            Limpiar
                          </button>
                        </>
                     )}
                  </div>
                  <div className="text-center">
                     <p className="text-sm font-black text-slate-900 italic underline decoration-slate-200 decoration-2 underline-offset-8">
                        {formData.patientData.fullName || 'Firma del Paciente'}
                     </p>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Firmante Responsable</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Historial de Consentimientos Anteriores */}
          <div className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-brand-purple" />
                <h3 className="text-xl font-display font-black text-slate-900 tracking-tight italic">Consentimientos Anteriores Guardados</h3>
              </div>
              <span className="px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full text-[10px] font-black uppercase tracking-widest">{patientConsents.length} Documentos</span>
            </div>

            {patientConsents.length === 0 ? (
              <div className="p-10 bg-slate-50 text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                <ClipboardList className="w-8 h-8 mx-auto opacity-30 mb-2 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest">Aún no hay registros de consentimiento</p>
                <p className="text-xs text-slate-400 mt-1 italic">Este paciente no cuenta con registros de consentimiento guardados aún.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patientConsents.map((consent) => (
                  <div 
                    key={consent.id}
                    className="p-5 rounded-2xl border border-slate-100 hover:border-brand-purple/30 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between h-[160px]"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-black text-brand-purple/70 bg-brand-purple/5 px-2.5 py-1 rounded-md uppercase tracking-widest">{consent.type || 'General'}</span>
                        <span className="text-[9px] font-black text-slate-400">{consent.date}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-800 tracking-tight mt-3 italic truncate">{consent.patientData?.fullName || consent.patientId}</h4>
                      <p className="text-[11px] font-bold text-slate-400 mt-1 truncate">ID: {consent.id}</p>
                    </div>
                    <button 
                      onClick={() => generatePDF(consent)}
                      className="mt-4 flex items-center justify-center gap-2 py-2 px-4 bg-brand-purple text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-purple-dark transition-all shadow-sm"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      Descargar PDF
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      <style>{`
        .form-input-hc {
          width: 100%;
          padding: 1.15rem 1.25rem;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 1.25rem;
          font-size: 0.875rem;
          font-weight: 700;
          color: #1e293b;
          transition: all 0.3s;
          outline: none;
        }
        .form-input-hc:hover {
          border-color: #cbd5e1;
        }
        .form-input-hc:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </motion.div>
  );
}
