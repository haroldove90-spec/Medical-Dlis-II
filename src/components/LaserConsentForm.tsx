/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Save, Trash2, FileDown, CheckCircle2, ClipboardCheck, Phone, Mail, User, Info, AlertTriangle, ShieldCheck, ClipboardList, Lock, MapPin, Sparkles, RefreshCw } from 'lucide-react';
import { LaserConsent, Patient } from '../types';
import SignatureCanvas from 'react-signature-canvas';
import { jsPDF } from 'jspdf';

interface LaserConsentFormProps {
  patient: Patient;
  onClose: () => void;
  onSave: (consent: LaserConsent) => void;
  initialData?: LaserConsent;
}

export default function LaserConsentForm({ patient, onClose, onSave, initialData }: LaserConsentFormProps) {
  const [formData, setFormData] = useState<LaserConsent>(initialData || {
    id: '',
    patientId: patient.id,
    date: new Date().toISOString().split('T')[0],
    patientData: {
      fullName: patient.name,
      identityDoc: '',
      phone: patient.phone || '',
      email: patient.email || '',
    },
    treatmentAreas: '',
    responsibleProfessional: 'Dra. Lluvia G.',
    contraindications: {
      pregnancyOrLactation: false,
      skinDiseases: false,
      photosensitiveMeds: false,
      recentTan: false,
      abnormalScarring: false,
    },
    signature: '',
    professionalSignature: '',
    lugar: 'Chihuahua, Chih.',
    observations: '',
  });

  const sigCanvasPatient = useRef<SignatureCanvas>(null);
  const sigCanvasPro = useRef<SignatureCanvas>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [patientConsents, setPatientConsents] = useState<LaserConsent[]>([]);
  const [hasConfirmedRead, setHasConfirmedRead] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('medical_dlis_laser_consents');
      if (saved) {
        const all = JSON.parse(saved) as LaserConsent[];
        const filtered = all.filter(c => c.patientId === patient.id || c.patientData?.fullName === patient.name);
        setPatientConsents(filtered);
      }
    } catch (e) {
      console.error(e);
    }
  }, [patient, isSaving]);

  const handleClearPatientSig = () => {
    sigCanvasPatient.current?.clear();
    setFormData(prev => ({ ...prev, signature: '' }));
  };

  const handleClearProSig = () => {
    sigCanvasPro.current?.clear();
    setFormData(prev => ({ ...prev, professionalSignature: '' }));
  };

  const handleSave = () => {
    let patientSig = formData.signature;
    let proSig = formData.professionalSignature;

    if (sigCanvasPatient.current && !sigCanvasPatient.current.isEmpty()) {
      patientSig = sigCanvasPatient.current.getTrimmedCanvas().toDataURL('image/png');
    }

    if (sigCanvasPro.current && !sigCanvasPro.current.isEmpty()) {
      proSig = sigCanvasPro.current.getTrimmedCanvas().toDataURL('image/png');
    }

    if (!patientSig) {
      alert('Por favor, el paciente debe firmar el documento para continuar.');
      return;
    }

    if (!proSig) {
      alert('Por favor, el profesional debe firmar el documento para continuar.');
      return;
    }

    if (!hasConfirmedRead && !initialData) {
      alert('Por favor, marque la casilla de aceptación y consentimiento para proceder.');
      return;
    }

    const finalData: LaserConsent = {
      ...formData,
      signature: patientSig,
      professionalSignature: proSig,
      id: formData.id || `CONS-LASER-${Math.floor(Math.random() * 10000)}`,
    };

    setIsSaving(true);
    setTimeout(() => {
      onSave(finalData);
      setIsSaving(false);
    }, 1000);
  };

  const generatePDF = (consent: LaserConsent) => {
    const doc = new jsPDF();
    const margin = 20;
    const width = doc.internal.pageSize.getWidth();
    let y = 15;

    // PAGE 1: HEADER & PATIENT DATA & SECTIONS 1-4
    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(24, 24, 30);
    doc.text('MEDICAL D\'LIS', width / 2, y, { align: 'center' });
    y += 5;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Av. Glandorf 3706, Col San Felipe, CP 31203, Tel. 6144891998', width / 2, y, { align: 'center' });
    y += 7;

    // Document Title Banner
    doc.setFillColor(109, 40, 217); // brand purple
    doc.rect(margin, y, width - (margin * 2), 9, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('CONSENTIMIENTO INFORMADO PARA DEPILACIÓN LÁSER', width / 2, y + 6, { align: 'center' });
    y += 15;

    // Patient Details Table
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    
    // Grid Lines and Labels
    const drawRow = (label1: string, val1: string, label2: string, val2: string, currentY: number) => {
      doc.setFont('helvetica', 'bold');
      doc.rect(margin, currentY, 40, 7);
      doc.text(label1, margin + 3, currentY + 5);
      
      doc.setFont('helvetica', 'normal');
      doc.rect(margin + 40, currentY, 55, 7);
      doc.text(val1, margin + 43, currentY + 5);

      doc.setFont('helvetica', 'bold');
      doc.rect(margin + 95, currentY, 35, 7);
      doc.text(label2, margin + 98, currentY + 5);

      doc.setFont('helvetica', 'normal');
      doc.rect(margin + 130, currentY, 40, 7);
      doc.text(val2, margin + 133, currentY + 5);
    };

    drawRow('Paciente:', consent.patientData.fullName, 'Identificación:', consent.patientData.identityDoc || 'N/A', y);
    y += 7;
    drawRow('Fecha:', consent.date, 'Contacto Tel:', consent.patientData.phone || 'N/A', y);
    y += 7;
    drawRow('Área(s) a Tratar:', consent.treatmentAreas || 'No indicada', 'Responsable:', consent.responsibleProfessional, y);
    y += 14;

    // Section 1. Descripción
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('1. Descripción del procedimiento', margin, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const desc = doc.splitTextToSize('La depilación láser es un tratamiento estético que utiliza energía lumínica para destruir selectivamente el folículo piloso y reducir el crecimiento del vello de manera progresiva y duradera.', width - (margin * 2));
    doc.text(desc, margin, y);
    y += desc.length * 4 + 4;

    // Section 2. Indicaciones
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('2. Indicaciones del procedimiento', margin, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const indic = doc.splitTextToSize('Se recomienda para la eliminación o disminución del vello en diversas áreas del cuerpo. El número de sesiones varía según: tipo y grosor del vello, ciclo de crecimiento del folículo y equipo utilizado.', width - (margin * 2));
    doc.text(indic, margin, y);
    y += indic.length * 4 + 4;

    // Section 3. Beneficios
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('3. Beneficios Esperados', margin, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('- Reducción considerable y progresiva del crecimiento del vello.', margin + 4, y);
    y += 4;
    doc.text('- Mejora estética del área tratada.', margin + 4, y);
    y += 4;
    doc.text('- Disminución de foliculitis o vellos encarnados.', margin + 4, y);
    y += 8;

    // Section 4. Riesgos
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('4. Riesgos y posibles efectos secundarios', margin, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const riesgos = [
      '- Enrojecimiento o inflamación temporal de la piel.',
      '- Sensación de ardor o calor durante y después del tratamiento.',
      '- Cambios temporales en la pigmentación.',
      '- Aparición de costras o ampollas en casos excepcionales.',
      '- Riesgo de quemadura si no se cumplen las indicaciones o si la piel está bronceada.'
    ];
    riesgos.forEach(r => {
      doc.text(r, margin + 4, y);
      y += 4;
    });

    // PAGE 2: CONTRAINDICACIONES & INDICACIONES PRE/POST & CONSENT & SIGNATURES
    doc.addPage();
    y = 20;

    // Section 5. Contraindicaciones
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('5. Contraindicaciones Declaradas', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('El paciente declara NO presentar, o en caso contrario, manifestar lo siguiente:', margin, y);
    y += 5;

    const conts = [
      { k: 'pregnancyOrLactation', l: 'Embarazo o lactancia' },
      { k: 'skinDiseases', l: 'Enfermedades de la piel en el área a tratar' },
      { k: 'photosensitiveMeds', l: 'Consumo de medicamentos fotosensibles' },
      { k: 'recentTan', l: 'Bronceado reciente' },
      { k: 'abnormalScarring', l: 'Antecedentes de cicatrización anormal' }
    ];

    conts.forEach(c => {
      const checked = consent.contraindications[c.k as keyof typeof consent.contraindications] ? '[X]' : '[ ]';
      doc.setFont('helvetica', 'bold');
      doc.text(checked, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(c.l, margin + 10, y);
      y += 5;
    });
    y += 4;

    // Section 6. Indicaciones PREVIAS
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('6. Indicaciones PREVIAS al tratamiento', margin, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const previas = [
      '- No exponerse al sol al menos 2 semanas antes.',
      '- No usar autobronceadores.',
      '- Rasurar el área 24 a 48 horas antes.',
      '- No depilar con cera y/o pinzas 4 semanas antes.',
      '- Evitar exfoliantes o retinoides 3 a 5 días antes.',
      '- Asistir con la piel limpia.',
      '- Informar sobre medicamentos o cambios recientes en la salud y piel.'
    ];
    previas.forEach(p => {
      doc.text(p, margin + 4, y);
      y += 4;
    });
    y += 4;

    // Section 7. Cuidados POSTERIORES
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('7. Cuidados POSTERIORES al tratamiento', margin, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const post = [
      '- Evitar la exposición solar por 1 a 2 semanas; utilizar FPS 50+ rigurosamente.',
      '- No aplicar calor directo (baños calientes, saunas) por 24 a 48 horas.',
      '- No rascar, tallar o exfoliar la zona tratada.',
      '- Aplicar gel calmante de Aloe Vera o crema reparadora post-láser recomendada.',
      '- Solo rasurar entre sesiones si es necesario, no extraer el vello de raíz.',
      '- Evitar maquillajes o desodorantes invasivos por las primeras 24 horas.',
      '- Notificar de forma inmediata cualquier reacción inusual o ampolla.'
    ];
    post.forEach(po => {
      doc.text(po, margin + 4, y);
      y += 4;
    });
    y += 6;

    // Section 8. Consentimiento
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('8. Declaración de Consentimiento', margin, y);
    y += 4;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    const declarText = doc.splitTextToSize('Declaro que he leído y comprendido la información presente. He tenido la oportunidad de realizar preguntas y todas mis dudas han sido resueltas. Entiendo perfectamente los beneficios, riesgos, cuidados y alternativas al tratamiento de depilación láser, otorgando mi consentimiento completo.', width - (margin * 2));
    doc.text(declarText, margin, y);
    y += declarText.length * 4 + 8;

    // Signatures Frame
    // Line for signatures
    const sigY = y + 20;
    
    if (consent.signature) {
      doc.addImage(consent.signature, 'PNG', margin + 10, sigY - 18, 50, 18);
    }
    doc.line(margin + 5, sigY, margin + 65, sigY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Firma del Paciente', margin + 35, sigY + 4, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${consent.date}`, margin + 35, sigY + 8, { align: 'center' });

    if (consent.professionalSignature) {
      doc.addImage(consent.professionalSignature, 'PNG', margin + 100, sigY - 18, 50, 18);
    }
    doc.line(margin + 95, sigY, margin + 155, sigY);
    doc.setFont('helvetica', 'bold');
    doc.text('Firma del Profesional', margin + 125, sigY + 4, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text(consent.responsibleProfessional, margin + 125, sigY + 8, { align: 'center' });

    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Elaborado en ${consent.lugar || 'Chihuahua, Chih.'} - Id: ${consent.id}`, width / 2, sigY + 18, { align: 'center' });

    // Save document
    doc.save(`Consentimiento_Laser_${consent.patientData.fullName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 p-6 md:p-10 shadow-xl space-y-10 relative overflow-hidden">
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
              <span className="p-1.5 bg-brand-purple/10 text-brand-purple rounded-lg text-xs font-black uppercase tracking-wider">PODOLOGÍA & LÁSER</span>
            </div>
            <h2 className="text-2xl font-display font-black text-slate-900 leading-none mt-2">
              Informed Laser Consent
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {initialData && (
            <button
              onClick={() => generatePDF(formData)}
              className="px-6 py-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Exportar PDF
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-4 bg-brand-purple text-white hover:bg-brand-purple/90 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-brand-purple/20 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Guardando...' : 'Guardar y Cerrar'}
          </button>
        </div>
      </div>

      {/* Main Grid: Info card and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Side: Image header, General form fields, Contraindications */}
        <div className="lg:col-span-12 space-y-10">
          {/* Logo & Info banner */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                <img src="https://cossma.com.mx/medical.png" alt="Medical D'Lis Logo" className="w-full h-auto object-contain" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-black text-slate-900 uppercase">MEDICAL D'LIS</h3>
                <p className="text-xs text-slate-400 font-bold">Av. Glandorf 3706, Col San Felipe, CP 31203</p>
                <p className="text-xs text-slate-400 font-bold">Tel: 6144891998 | CARE D'LIS</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <span className="inline-block px-4 py-2 bg-purple-50 text-brand-purple rounded-xl border border-purple-100 text-xs font-black tracking-widest uppercase">
                DEPILACIÓN LÁSER
              </span>
              <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-2">Folio: {formData.id || 'NUEVO DOCUMENTO'}</p>
            </div>
          </div>

          {/* Core patient details */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 text-brand-purple">
              <User className="w-5 h-5 text-brand-purple" />
              Datos del Paciente e Identificación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre del Paciente</label>
                <input 
                  type="text" 
                  value={formData.patientData.fullName}
                  onChange={e => setFormData({
                    ...formData, 
                    patientData: { ...formData.patientData, fullName: e.target.value }
                  })}
                  className="form-input-hc" 
                  placeholder="Ej. Juan Pérez"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Documento de Identidad (INE, CURP...)</label>
                <input 
                  type="text" 
                  value={formData.patientData.identityDoc}
                  onChange={e => setFormData({
                    ...formData, 
                    patientData: { ...formData.patientData, identityDoc: e.target.value }
                  })}
                  className="form-input-hc" 
                  placeholder="Ej. CURP o Folio de ID"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Contacto Telefónico</label>
                <input 
                  type="text" 
                  value={formData.patientData.phone}
                  onChange={e => setFormData({
                    ...formData, 
                    patientData: { ...formData.patientData, phone: e.target.value }
                  })}
                  className="form-input-hc" 
                  placeholder="Ej. 614-123-4567"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Fecha de Elaboración</label>
                <input 
                  type="date" 
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="form-input-hc"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Área(s) a tratar</label>
                <input 
                  type="text" 
                  value={formData.treatmentAreas}
                  onChange={e => setFormData({ ...formData, treatmentAreas: e.target.value })}
                  className="form-input-hc" 
                  placeholder="Ej. Pierna completa, Axila, Rostro, Bozo, Espalda"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Profesional Responsable</label>
                <input 
                  type="text" 
                  value={formData.responsibleProfessional}
                  onChange={e => setFormData({ ...formData, responsibleProfessional: e.target.value })}
                  className="form-input-hc" 
                  placeholder="Ej. Dra. Lluvia G."
                />
              </div>
            </div>
          </div>

          {/* Sections Grid info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight border-b border-slate-50 pb-2 flex items-center gap-2 text-brand-purple">
                <span className="p-1.5 bg-brand-purple/10 text-brand-purple rounded-lg text-xs font-black">1 & 2</span>
                Descripción e Indicaciones
              </h4>
              <div className="space-y-3.5 text-xs text-slate-600 font-medium leading-relaxed">
                <p>
                  <b className="text-slate-900 block font-black">1. Descripción del procedimiento:</b>
                  La depilación láser es un tratamiento estético que utiliza energía lumínica para destruir selectivamente el folículo piloso y reducir el crecimiento del vello de manera progresiva y duradera.
                </p>
                <p>
                  <b className="text-slate-900 block font-black">2. Indicaciones del procedimiento:</b>
                  Se recomienda para la eliminación o disminución del vello en diversas áreas del cuerpo. El número de sesiones varía según: tipo y grosor del vello, ciclo de crecimiento del folículo y equipo utilizado.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-sm font-black text-emerald-600 uppercase tracking-tight border-b border-slate-50 pb-2 flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg text-xs font-black">3</span>
                Beneficios Esperados
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 font-medium list-disc list-inside">
                <li><b className="text-slate-950 font-extrabold">Reducción considerable y progresiva:</b> Disminución visible del crecimiento de vello de manera prolongada y duradera.</li>
                <li><b className="text-slate-950 font-extrabold">Mejora estetica:</b> Piel más suave y libre de imperfecciones o marcas en la zona tratada.</li>
                <li><b className="text-slate-950 font-extrabold">Higiene y Salud:</b> Disminución notable o eliminación de foliculitis o vellos encarnados.</li>
              </ul>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-rose-600 uppercase tracking-tight border-b border-slate-50 pb-2 flex items-center gap-2">
              <span className="p-1.5 bg-rose-100 text-rose-600 rounded-lg text-xs font-black">4</span>
              Riesgos y Posibles Efectos Secundarios
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600 font-medium">
              <ul className="space-y-2 list-disc list-inside">
                <li>Enrojecimiento o inflamación temporal de la piel tratada.</li>
                <li>Sensación transitoria de ardor, calor u hormigueo durante del procedimiento.</li>
                <li>Cambios temporales leves o pigmentación (hiper/hipopigmentación).</li>
              </ul>
              <ul className="space-y-2 list-disc list-inside/50">
                <li>Aparición de costras o ampollas superficiales en casos excepcionales.</li>
                <li>Riesgo de quemadura leve si no se cumplen las indicaciones de preparación o si la piel fue bronceada recientemente.</li>
              </ul>
            </div>
          </div>

          {/* Section 5. Contraindicaciones (Checklist) */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-brand-purple">
              <span className="p-2 bg-brand-purple/10 text-brand-purple rounded-xl text-sm font-black">5</span>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Contraindicaciones</h3>
            </div>
            
            <p className="text-xs text-slate-500 font-bold leading-relaxed bg-brand-purple/5 p-4 rounded-xl border border-brand-purple/10">
              El paciente declara NO presentar, o en caso contrario, notificar y marcar lo siguiente:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {[
                { key: 'pregnancyOrLactation', label: 'Embarazo o lactancia activa' },
                { key: 'skinDiseases', label: 'Enfermedades de la piel en el área a tratar' },
                { key: 'photosensitiveMeds', label: 'Consumo de medicamentos fotosensibles' },
                { key: 'recentTan', label: 'Bronceado reciente (últimas 2-3 semanas)' },
                { key: 'abnormalScarring', label: 'Antecedentes de cicatrización queloide o anormal' },
              ].map((opt) => (
                <label 
                  key={opt.key}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.contraindications[opt.key as keyof typeof formData.contraindications]
                      ? 'bg-rose-50 border-rose-400 text-rose-900' 
                      : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <input 
                    type="checkbox"
                    checked={formData.contraindications[opt.key as keyof typeof formData.contraindications]}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        contraindications: {
                          ...formData.contraindications,
                          [opt.key]: e.target.checked
                        }
                      });
                    }}
                    className="w-4 h-4 rounded text-brand-purple border-slate-300 focus:ring-brand-purple cursor-pointer bg-slate-100"
                  />
                  <span className="text-xs font-bold leading-none">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 6 & 7: PREVIAS and POSTERIORES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <h4 className="text-sm font-black text-brand-purple uppercase tracking-widest pb-3 border-b border-slate-50 flex items-center gap-3">
                <span className="p-1.5 bg-brand-purple/10 rounded-lg text-xs font-black">6</span>
                Indicaciones PREVIAS al tratamiento
              </h4>
              <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-brand-purple font-black shrink-0">•</span>
                  <span>No exponerse al sol directo ni camas de bronceado al menos 2 semanas antes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-purple font-black shrink-0">•</span>
                  <span>No utilizar productos autobronceadores o cremas pigmentantes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-purple font-black shrink-0">•</span>
                  <span>Rasurar el área a tratar 24 a 48 horas antes de la sesión.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-purple font-black shrink-0">•</span>
                  <span>No depilar con cera ni pinzas protectoras 4 semanas antes del inicio.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-purple font-black shrink-0">•</span>
                  <span>Evitar el uso de agentes exfoliantes o cremas con retinoides 3 a 5 días previos.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-purple font-black shrink-0">•</span>
                  <span>Asistir a la cita con la piel limpia, sin aceites, desodorantes o maquillajes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-purple font-black shrink-0">•</span>
                  <span>Informar al especialista de cualquier nuevo medicamento recetado o cambio dérmico.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <h4 className="text-sm font-black text-brand-purple uppercase tracking-widest pb-3 border-b border-slate-50 flex items-center gap-3">
                <span className="p-1.5 bg-brand-purple/10 rounded-lg text-xs font-black">7</span>
                Cuidados POSTERIORES al tratamiento
              </h4>
              <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-black shrink-0">•</span>
                  <span>Evitar la exposición solar por 1 a 2 semanas; usar FPS 50+ de forma constante.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-black shrink-0">•</span>
                  <span>No aplicar calor directo o tomar duchas muy calientes, albercas, saunas por 24-48 horas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-black shrink-0">•</span>
                  <span>No rascar o jalar el vello en proceso de caída, ni exfoliar mecánicamente la zona.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-black shrink-0">•</span>
                  <span>Aplicar gel calmante de Aloe Vera o crema post-láser recomendada ante cualquier irritación.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-black shrink-0">•</span>
                  <span>Solo rasurar el área entre sesiones si es necesario, de ningún modo arrancar el vello.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-black shrink-0">•</span>
                  <span>Evitar maquillajes corporales o desodorantes con alcohol en las primeras 24 horas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-black shrink-0">•</span>
                  <span>Notificar al centro y médico de forma inmediata de cualquier reacción inusual o ampolla.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 8: Consent Selection and Declarations */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-brand-purple">
              <span className="p-2 bg-brand-purple/10 text-brand-purple rounded-xl text-sm font-black">8</span>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Consentimiento</h3>
            </div>
            <div className="bg-brand-purple/5 p-6 rounded-2xl border-l-4 border-brand-purple text-xs text-slate-800 font-semibold italic space-y-3 leading-relaxed">
              <p>
                "Declaro que he leído y comprendido la información presente. He tenido la oportunidad de realizar preguntas y todas mis dudas han sido aclaradas satisfactoriamente."
              </p>
              <p>
                "Entiendo los beneficios, riesgos, cuidados sugeridos y las alternativas a este tratamiento de depilación láser."
              </p>
              <p className="font-bold text-brand-purple">
                "Otorgo mi consentimiento libre, voluntario e informado para que se realice el tratamiento estético/funcional por parte del profesional responsable."
              </p>

              {!initialData && (
                <label className="flex items-center gap-3 border-t border-brand-purple/20 pt-4 mt-4 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={hasConfirmedRead} 
                    onChange={e => setHasConfirmedRead(e.target.checked)}
                    className="w-5 h-5 rounded text-brand-purple border-slate-300 focus:ring-brand-purple bg-white transition-all cursor-pointer"
                  />
                  <span className="text-xs font-black uppercase text-slate-900 not-italic tracking-wider select-none">
                    Confirmar Lectura y Conformidad
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Section 9: Observations & Metadata */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 text-brand-purple">
              <MapPin className="w-5 h-5 text-brand-purple" />
              Observaciones del Tratamiento y Lugar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Lugar de Elaboración</label>
                <input 
                  type="text" 
                  value={formData.lugar || 'Chihuahua, Chih.'} 
                  onChange={e => setFormData({ ...formData, lugar: e.target.value })} 
                  className="form-input-hc" 
                  placeholder="Ej. Chihuahua, Chih." 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nota / Indicaciones / Observaciones Especiales</label>
                <textarea 
                  value={formData.observations || ''} 
                  onChange={e => setFormData({ ...formData, observations: e.target.value })} 
                  className="form-input-hc min-h-[48px] py-3.5 resize-none" 
                  placeholder="Ej. Sin contraindicaciones detectadas, el paciente tolera bien." 
                />
              </div>
            </div>
          </div>

          {/* Signatures Dual Section */}
          <div className="pt-12 border-t-2 border-slate-100 space-y-8 bg-slate-50/50 -mx-6 md:-mx-10 p-6 md:p-10 pb-20 rounded-b-[2rem] md:rounded-b-[2.5rem]">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight underline decoration-brand-purple/30">
                Firmas y Validación
              </h3>
              <p className="text-xs text-slate-400 font-bold max-w-lg mx-auto">
                Para completar la validez del consentimiento, el paciente y el especialista responsable deben estampar su firma digital a continuación.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
              {/* Patient Signature Panel */}
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-md flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                  <span className="text-[10px] font-black text-brand-purple uppercase tracking-widest">
                    Paciente / Firma de Conformidad
                  </span>
                  <button 
                    type="button" 
                    onClick={handleClearPatientSig} 
                    className="text-slate-400 hover:text-rose-500 font-bold p-1 hover:bg-rose-50 rounded-lg text-xs flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Limpiar
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl h-44 relative overflow-hidden flex items-center justify-center cursor-crosshair">
                  {formData.signature ? (
                    <img src={formData.signature} alt="Firma del Paciente Registrada" className="h-full object-contain max-h-[160px]" />
                  ) : (
                    <SignatureCanvas 
                      ref={sigCanvasPatient}
                      penColor="black"
                      canvasProps={{ className: 'w-full h-full' }}
                    />
                  )}
                  {!formData.signature && (
                    <p className="absolute bottom-2 left-0 right-0 text-center text-[9px] font-black text-slate-350 pointer-events-none uppercase tracking-widest">
                      Escriba su firma aquí
                    </p>
                  )}
                </div>

                <div className="text-center">
                  <h5 className="text-xs font-black text-slate-900 leading-none mb-1">{formData.patientData.fullName}</h5>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Firma del paciente o tutor</p>
                </div>
              </div>

              {/* Professional Signature Panel */}
              <div className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-md flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                  <span className="text-[10px] font-black text-brand-purple uppercase tracking-widest">
                    Especialista / Firma Profesional
                  </span>
                  <button 
                    type="button" 
                    onClick={handleClearProSig} 
                    className="text-slate-400 hover:text-rose-500 font-bold p-1 hover:bg-rose-50 rounded-lg text-xs flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Limpiar
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl h-44 relative overflow-hidden flex items-center justify-center cursor-crosshair">
                  {formData.professionalSignature ? (
                    <img src={formData.professionalSignature} alt="Firma del Especialista Registrada" className="h-full object-contain max-h-[160px]" />
                  ) : (
                    <SignatureCanvas 
                      ref={sigCanvasPro}
                      penColor="black"
                      canvasProps={{ className: 'w-full h-full' }}
                    />
                  )}
                  {!formData.professionalSignature && (
                    <p className="absolute bottom-2 left-0 right-0 text-center text-[9px] font-black text-slate-350 pointer-events-none uppercase tracking-widest">
                      Firma del podólogo / especialista
                    </p>
                  )}
                </div>

                <div className="text-center">
                  <h5 className="text-xs font-black text-slate-900 leading-none mb-1">{formData.responsibleProfessional}</h5>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Firma del profesional responsable</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
