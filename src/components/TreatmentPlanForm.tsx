/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Save, Trash2, FileDown, CheckCircle2, RefreshCw, ClipboardList, Clock, Sparkles, MapPin, Plus, User, FileText, Settings } from 'lucide-react';
import { TreatmentPlan, TreatmentSession, Patient } from '../types';
import SignatureCanvas from 'react-signature-canvas';
import { jsPDF } from 'jspdf';

interface TreatmentPlanFormProps {
  patient: Patient;
  onClose: () => void;
  onSave: (plan: TreatmentPlan) => void;
  initialData?: TreatmentPlan;
  patients?: Patient[];
}

export default function TreatmentPlanForm({ patient, onClose, onSave, initialData, patients }: TreatmentPlanFormProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [allPlans, setAllPlans] = useState<TreatmentPlan[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const [formData, setFormData] = useState<TreatmentPlan>(initialData || {
    id: `PLAN-TRAT-${Math.floor(Math.random() * 10000)}`,
    patientId: patient.id,
    date: new Date().toISOString().split('T')[0],
    patientData: {
      fullName: patient.name,
      phone: patient.phone || '',
      email: patient.email || '',
    },
    responsibleProfessional: 'Dra. Lluvia G.',
    totalSessions: 3,
    sessions: [
      { sessionNum: 1, comment: '', parameters: '', date: new Date().toISOString().split('T')[0], time: '12:00', signature: '' },
      { sessionNum: 2, comment: '', parameters: '', date: '', time: '', signature: '' },
      { sessionNum: 3, comment: '', parameters: '', date: '', time: '', signature: '' },
    ],
    observations: '',
    lugar: 'Chihuahua, Chih.',
  });

  const [activeSignSessionNum, setActiveSignSessionNum] = useState<number | null>(null);
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [patientPlans, setPatientPlans] = useState<TreatmentPlan[]>([]);

  const loadAllPlans = () => {
    try {
      const saved = localStorage.getItem('medical_dlis_treatment_plans');
      if (saved) {
        setAllPlans(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAllPlans();
  }, [isSaving]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('medical_dlis_treatment_plans');
      if (saved) {
        const all = JSON.parse(saved) as TreatmentPlan[];
        const filtered = all.filter(p => p.patientId === formData.patientId || p.patientData?.fullName === formData.patientData.fullName);
        setPatientPlans(filtered);
      }
    } catch (e) {
      console.error(e);
    }
  }, [formData.patientId, formData.patientData.fullName, isSaving]);

  const handleDeletePlan = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este plan de tratamiento?')) {
      const updated = allPlans.filter(p => p.id !== id);
      setAllPlans(updated);
      localStorage.setItem('medical_dlis_treatment_plans', JSON.stringify(updated));
    }
  };

  const handleEditPlan = (plan: TreatmentPlan) => {
    setFormData(plan);
    setActiveTab('form');
  };

  // Handle total sessions number update
  const handleTotalSessionsChange = (num: number) => {
    if (num < 1) return;
    const currentSessions = [...formData.sessions];
    let newSessions: TreatmentSession[] = [];
    
    if (num > currentSessions.length) {
      // Add empty session configurations
      newSessions = [
        ...currentSessions,
        ...Array.from({ length: num - currentSessions.length }, (_, i) => ({
          sessionNum: currentSessions.length + i + 1,
          comment: '',
          parameters: '',
          date: '',
          time: '',
          signature: ''
        }))
      ];
    } else {
      // Prune sessions
      newSessions = currentSessions.slice(0, num);
    }

    setFormData(prev => ({
      ...prev,
      totalSessions: num,
      sessions: newSessions
    }));
  };

  const handleSessionFieldChange = (index: number, field: keyof TreatmentSession, value: any) => {
    const updatedSessions = [...formData.sessions];
    updatedSessions[index] = {
      ...updatedSessions[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      sessions: updatedSessions
    }));
  };

  const handleOpenSignaturePad = (sessionNum: number) => {
    setActiveSignSessionNum(sessionNum);
  };

  const handleSaveSignature = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty() && activeSignSessionNum !== null) {
      const signatureBase64 = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
      const updatedSessions = formData.sessions.map(s => 
        s.sessionNum === activeSignSessionNum ? { ...s, signature: signatureBase64 } : s
      );
      setFormData(prev => ({
        ...prev,
        sessions: updatedSessions
      }));
      setActiveSignSessionNum(null);
    } else {
      alert('Por favor dibuje una firma/rúbrica antes de confirmar.');
    }
  };

  const clearActiveSignature = () => {
    sigCanvas.current?.clear();
  };

  const handleClearSavedSignature = (sessionNum: number) => {
    const updatedSessions = formData.sessions.map(s => 
      s.sessionNum === sessionNum ? { ...s, signature: '' } : s
    );
    setFormData(prev => ({
      ...prev,
      sessions: updatedSessions
    }));
  };

  const handleResetForm = () => {
    setFormData({
      id: `PLAN-TRAT-${Math.floor(Math.random() * 10000)}`,
      patientId: patient.id,
      date: new Date().toISOString().split('T')[0],
      patientData: {
        fullName: patient.name,
        phone: patient.phone || '',
        email: patient.email || '',
      },
      responsibleProfessional: 'Dra. Lluvia G.',
      totalSessions: 3,
      sessions: [
        { sessionNum: 1, comment: '', parameters: '', date: new Date().toISOString().split('T')[0], time: '12:00', signature: '' },
        { sessionNum: 2, comment: '', parameters: '', date: '', time: '', signature: '' },
        { sessionNum: 3, comment: '', parameters: '', date: '', time: '', signature: '' },
      ],
      observations: '',
      lugar: 'Chihuahua, Chih.',
    });
    setShowSuccessToast(false);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onSave(formData);
      setIsSaving(false);
      setShowSuccessToast(true);
      loadAllPlans();
      setTimeout(() => setShowSuccessToast(false), 4000);
    }, 1000);
  };

  const generatePDF = (plan: TreatmentPlan) => {
    const doc = new jsPDF();
    const margin = 15;
    const width = doc.internal.pageSize.getWidth();
    let y = 15;

    // Header Logo & text
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(24, 24, 30);
    doc.text('MEDICAL D\'LIS', width / 2, y, { align: 'center' });
    y += 5;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Av. Glandorf 3706, Col San Felipe, CP 31203, Tel. 6144891998 Care D\'Lis', width / 2, y, { align: 'center' });
    y += 10;

    // Document Bar
    doc.setFillColor(109, 40, 217); // brand purple
    doc.rect(margin, y, width - (margin * 2), 9, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('PLAN DE TRATAMIENTO PODOLÓGICO', width / 2, y + 6, { align: 'center' });
    y += 15;

    // Details Grid Layout
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);

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

    drawRow('Paciente:', plan.patientData.fullName, 'Fecha de Elaboración:', plan.date, y);
    y += 7;
    drawRow('Contacto Tel:', plan.patientData.phone || 'N/A', 'Responsable:', plan.responsibleProfessional, y);
    y += 7;
    drawRow('Total de Sesiones:', String(plan.totalSessions), 'Identificación Plan:', plan.id, y);
    y += 15;

    // Sessions Table Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Registro de Sesiones de Tratamiento', margin, y);
    y += 5;

    // Sessions Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, width - (margin * 2), 8, 'F');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('No. Sesión / Comentario', margin + 3, y + 5.5);
    doc.text('Parámetros', margin + 65, y + 5.5);
    doc.text('Fecha', margin + 115, y + 5.5);
    doc.text('Hora', margin + 138, y + 5.5);
    doc.text('Firma / Inicial', margin + 158, y + 5.5);
    y += 8;

    // Sessions Table Rows
    plan.sessions.forEach((session) => {
      // Row Box
      doc.rect(margin, y, width - (margin * 2), 16);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);

      // No. Sesion & Comentario
      doc.setFont('helvetica', 'bold');
      doc.text(`Sesión No. ${session.sessionNum}`, margin + 3, y + 5);
      doc.setFont('helvetica', 'normal');
      const commentLines = doc.splitTextToSize(session.comment || 'Sin comentario detallado', 55);
      doc.text(commentLines, margin + 3, y + 9);

      // Parametros
      const paramLines = doc.splitTextToSize(session.parameters || 'Ajustes por defecto / generales', 45);
      doc.text(paramLines, margin + 65, y + 6);

      // Fecha
      doc.text(session.date || '-', margin + 115, y + 8.5);

      // Hora
      doc.text(session.time || '-', margin + 138, y + 8.5);

      // Signature Image representation
      if (session.signature) {
        doc.addImage(session.signature, 'PNG', margin + 155, y + 2, 22, 12);
      } else {
        doc.setFontSize(6.5);
        doc.setTextColor(160, 160, 160);
        doc.text('[No firmado]', margin + 157, y + 8.5);
        doc.setTextColor(30, 41, 59);
      }
      y += 16;

      // Wrap page boundary
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    // Notes
    if (plan.observations) {
      if (y > 230) {
        doc.addPage();
        y = 20;
      }
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Observaciones Adicionales / Notas de Seguimiento', margin, y);
      y += 5;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      const obsLines = doc.splitTextToSize(plan.observations, width - (margin * 2));
      doc.text(obsLines, margin, y);
    }

    // Foot note
    y += 15;
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Elaborado en ${plan.lugar || 'Chihuahua, Chih.'} - Id Registro: ${plan.id}`, width / 2, y, { align: 'center' });

    doc.save(`Plan_Tratamiento_${plan.patientData.fullName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 p-6 md:p-10 shadow-xl space-y-10 relative overflow-hidden">
      {/* Decorative top strip */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-purple to-purple-400"></div>

      {/* Header and top commands */}
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
              <span className="p-1.5 bg-brand-purple/10 text-brand-purple rounded-lg text-xs font-black uppercase tracking-wider">PODOLOGÍA CLÍNICA</span>
            </div>
            <h2 className="text-2xl font-display font-black text-slate-900 mt-2">
              Plan de Tratamiento Podológico
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'form' && (
            <>
              {(initialData || formData.sessions.some(s => s.comment || s.parameters)) && (
                <button
                  type="button"
                  onClick={() => generatePDF(formData)}
                  className="px-6 py-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  Exportar PDF
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-4 bg-brand-purple text-white hover:bg-brand-purple/90 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-brand-purple/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Guardando plan...' : 'Guardar Plan'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Success Alert Banner */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 bg-emerald-50 border border-emerald-200 text-slate-800 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-bold text-xs"
          >
            <div className="flex items-center gap-3">
              <span className="p-2 bg-emerald-500 text-white rounded-xl">✓</span>
              <div>
                <p className="font-black uppercase tracking-wider text-emerald-800">Plan Guardado Exitosamente</p>
                <p className="text-[11px] text-emerald-650 italic font-medium mt-1">El folio {formData.id} se ha indexado en la base de datos local y está listo para impresión.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => generatePDF(formData)}
                className="px-4 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl uppercase font-black tracking-wider text-[10px] transition-all"
              >
                Imprimir / PDF
              </button>
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2.5 bg-white text-emerald-700 hover:bg-emerald-100 rounded-xl uppercase font-black tracking-wider text-[10px] border border-emerald-200 transition-all"
              >
                Crear Otro Plan
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Switchers */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl self-start w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('form')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'form' 
              ? 'bg-white text-brand-purple shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Registrar Plan (Formulario)
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('history');
            loadAllPlans();
          }}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'history' 
              ? 'bg-white text-brand-purple shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Consultar Historial/Planes ({allPlans.length})
        </button>
      </div>

      {/* Core Body switcher */}
      {activeTab === 'history' ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Historial de Planes de Tratamiento</h4>
              <p className="text-xs text-slate-400 mt-1">Busque planes por nombre del paciente o revise sesiones validadas.</p>
            </div>
            <input
              type="text"
              placeholder="Buscar por paciente..."
              value={historySearchQuery}
              onChange={e => setHistorySearchQuery(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold w-full sm:w-64 focus:outline-none focus:border-brand-purple"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPlans.length === 0 ? (
              <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-300 gap-4">
                <ClipboardList className="w-10 h-10 opacity-30 text-brand-purple" />
                <p className="text-xs font-black uppercase tracking-widest">Sin Planes Registrados</p>
              </div>
            ) : allPlans
                .filter(p => p.patientData?.fullName?.toLowerCase().includes(historySearchQuery.toLowerCase()))
                .map((plan, i) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-purple/30 transition-all group relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button 
                        onClick={() => handleDeletePlan(plan.id)} 
                        className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100">
                          <ClipboardList className="w-5 h-5 text-brand-purple" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{plan.date}</p>
                          <h4 className="text-sm font-black text-slate-900 leading-tight italic truncate max-w-[180px]">{plan.patientData.fullName}</h4>
                          <p className="text-[9px] font-bold text-brand-purple uppercase tracking-wider mt-0.5">{plan.totalSessions} Sesiones</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-[11px] font-bold">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 uppercase text-[9px]">Responsable:</span>
                          <span className="text-slate-800 font-extrabold">{plan.responsibleProfessional}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 uppercase text-[9px]">Validadas:</span>
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black uppercase">
                            {plan.sessions.filter(s => s.signature).length} de {plan.totalSessions}
                          </span>
                        </div>
                        {plan.observations && (
                          <div className="pt-1.5 mt-1 border-t border-slate-100 text-[9px] text-slate-400 font-medium italic line-clamp-2">
                             Obs: {plan.observations}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button 
                        onClick={() => handleEditPlan(plan)}
                        className="flex-1 py-2.5 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md text-center"
                      >
                         Ver / Editar Plan
                      </button>
                      <button 
                        onClick={() => generatePDF(plan)}
                        className="p-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                        title="Exportar PDF"
                      >
                         <FileDown className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
            }
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Clinica Banner Logo */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                <img src="https://cossma.com.mx/medical.png" alt="Medical D'Lis Logo" className="w-full h-auto object-contain" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-black text-slate-900 uppercase">MEDICAL D'LIS</h3>
                <p className="text-xs text-slate-400 font-bold">Av. Glandorf 3706, Col San Felipe, CP 31203</p>
                <p className="text-xs text-slate-400 font-bold">Tel: 6144891998 | PLAN DE TRATAMIENTO</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <span className="inline-block px-4 py-2 bg-purple-50 text-brand-purple rounded-xl border border-purple-100 text-xs font-black tracking-widest uppercase">
                SEGUIMIENTO POR SESIÓN
              </span>
              <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-2">Folio: {formData.id}</p>
            </div>
          </div>

          {/* General plan form options */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 text-brand-purple">
              <User className="w-5 h-5 text-brand-purple" />
              Información del Paciente e Inicio General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Seleccionar Paciente</label>
                {patients && patients.length > 0 ? (
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
                            fullName: found.name,
                            phone: found.phone || '',
                            email: found.email || '',
                          }
                        }));
                      }
                    }}
                    className="form-input-hc"
                  >
                    <option value="" disabled>-- Seleccione paciente --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                ) : (
                  <select className="form-input-hc" disabled>
                    <option>{formData.patientData.fullName}</option>
                  </select>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nombre Completo</label>
                <input 
                  type="text" 
                  value={formData.patientData.fullName}
                  onChange={e => setFormData({
                    ...formData, 
                    patientData: { ...formData.patientData, fullName: e.target.value }
                  })}
                  className="form-input-hc" 
                  placeholder="Nombre del Paciente"
                />
              </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Teléfono de Contacto</label>
              <input 
                type="text" 
                value={formData.patientData.phone}
                onChange={e => setFormData({
                  ...formData, 
                  patientData: { ...formData.patientData, phone: e.target.value }
                })}
                className="form-input-hc" 
                placeholder="Contacto del Paciente"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Fecha de Creación</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="form-input-hc"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Profesional Responsable</label>
              <input 
                type="text" 
                value={formData.responsibleProfessional}
                onChange={e => setFormData({ ...formData, responsibleProfessional: e.target.value })}
                className="form-input-hc" 
                placeholder="Dra. Lluvia G."
              />
            </div>
          </div>

          {/* Interactive Slider / Input for Number of Sessions */}
          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 mt-4">
            <div>
              <h4 className="text-sm font-black text-slate-900 uppercase">Número de Sesiones Planificadas</h4>
              <p className="text-xs text-slate-400 font-bold mt-1">Configure la cantidad de sesiones para este tratamiento. Agregará o eliminará filas automáticamente.</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                type="button" 
                onClick={() => handleTotalSessionsChange(formData.totalSessions - 1)}
                className="w-12 h-12 bg-white border-2 border-slate-200 hover:border-brand-purple hover:text-brand-purple text-lg font-black rounded-xl transition-all shadow-sm"
              >
                -
              </button>
              <input 
                type="number" 
                min="1" 
                max="24"
                value={formData.totalSessions} 
                onChange={e => handleTotalSessionsChange(parseInt(e.target.value) || 1)}
                className="w-20 text-center py-3 bg-white border-2 border-slate-200 font-black rounded-xl text-lg text-slate-900 focus:outline-none focus:border-brand-purple"
              />
              <button 
                type="button" 
                onClick={() => handleTotalSessionsChange(formData.totalSessions + 1)}
                className="w-12 h-12 bg-white border-2 border-slate-200 hover:border-brand-purple hover:text-brand-purple text-lg font-black rounded-xl transition-all shadow-sm"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Session Log Checklist/Table */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 text-brand-purple">
            <ClipboardList className="w-5 h-5 text-brand-purple" />
            Seguimiento de Sesiones
          </h3>

          <div className="overflow-x-auto rounded-[1.5rem] border border-slate-250">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100">
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/4">No. Sesión / Comentario</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/4">Parámetros</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/6">Fecha</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/8">Hora</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-1/6">Firma / Inicial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {formData.sessions.map((session, index) => (
                  <tr key={session.sessionNum} className="hover:bg-slate-50/30 transition-all">
                    {/* No. Sesión y Comentario */}
                    <td className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-brand-purple/10 text-brand-purple text-[10px] font-black rounded-lg">
                          SESIÓN {session.sessionNum}
                        </span>
                      </div>
                      <input 
                        type="text" 
                        value={session.comment}
                        onChange={e => handleSessionFieldChange(index, 'comment', e.target.value)}
                        className="w-full text-xs font-bold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-brand-purple focus:outline-none py-1 px-1"
                        placeholder="Agregar comentario (ej. evolución del heloma...)"
                      />
                    </td>

                    {/* Parámetros */}
                    <td className="p-4">
                      <input 
                        type="text" 
                        value={session.parameters}
                        onChange={e => handleSessionFieldChange(index, 'parameters', e.target.value)}
                        className="w-full text-xs font-bold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-brand-purple focus:outline-none py-1 px-1"
                        placeholder="Ej. Nitrógeno líquido, Láser 4W, etc."
                      />
                    </td>

                    {/* Fecha */}
                    <td className="p-4">
                      <input 
                        type="date" 
                        value={session.date}
                        onChange={e => handleSessionFieldChange(index, 'date', e.target.value)}
                        className="w-full text-xs font-bold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-brand-purple focus:outline-none py-1"
                      />
                    </td>

                    {/* Hora */}
                    <td className="p-4">
                      <input 
                        type="time" 
                        value={session.time}
                        onChange={e => handleSessionFieldChange(index, 'time', e.target.value)}
                        className="w-full text-xs font-bold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-brand-purple focus:outline-none py-1"
                      />
                    </td>

                    {/* Firma */}
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        {session.signature ? (
                          <div className="relative group/sig bg-slate-50 border border-slate-200 rounded-xl p-1 h-12 w-28 flex items-center justify-center">
                            <img src={session.signature} alt="Rúbrica registrada" className="max-h-full max-w-full object-contain" />
                            <button 
                              type="button"
                              onClick={() => handleClearSavedSignature(session.sessionNum)}
                              className="absolute -top-1.5 -right-1.5 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover/sig:opacity-100 hover:scale-110 transition-all shadow"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenSignaturePad(session.sessionNum)}
                            className="px-3 py-2 border-2 border-dashed border-slate-200 hover:border-brand-purple hover:text-brand-purple text-[10px] font-black uppercase tracking-wider rounded-xl transition-all"
                          >
                            Firmar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Observations / Location */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 text-brand-purple">
            <MapPin className="w-5 h-5 text-brand-purple" />
            Lugar y Observaciones Generales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Lugar de Elaboración</label>
              <input 
                type="text" 
                value={formData.lugar || 'Chihuahua, Chih.'} 
                onChange={e => setFormData({ ...formData, lugar: e.target.value })} 
                className="form-input-hc" 
                placeholder="Chihuahua, Chih." 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Observaciones, Indicaciones de Tratamiento o Notas Especiales</label>
              <textarea 
                value={formData.observations || ''} 
                onChange={e => setFormData({ ...formData, observations: e.target.value })} 
                className="form-input-hc min-h-[48px] py-3 resize-none" 
                placeholder="Ej. Realizar asepsias cuidadosas, re-evaluar la uña en sesión 3..." 
              />
            </div>
          </div>
        </div>
      </div>
    )}

      {/* Signature Pad Floating Dialog Overlay */}
      <AnimatePresence>
        {activeSignSessionNum !== null && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 p-8 w-full max-w-lg shadow-2xl relative space-y-6"
            >
              <div className="text-center space-y-1">
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Estampar Rúbrica de Sesión {activeSignSessionNum}</h4>
                <p className="text-xs text-slate-400 font-bold">Por favor firme o inicialice en la cuadrícula de abajo para validar la sesión.</p>
              </div>

              {/* Signature grid container */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl h-48 relative overflow-hidden flex items-center justify-center">
                <SignatureCanvas 
                  ref={sigCanvas}
                  penColor="black"
                  canvasProps={{ className: 'w-full h-full cursor-crosshair' }}
                />
                <span className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-black text-slate-300 pointer-events-none uppercase tracking-widest">
                  Firma del profesional aquí
                </span>
              </div>

              {/* Command options for signature overlay */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={clearActiveSignature}
                  className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-wider border border-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Limpiar Rúbrica
                </button>
                <button
                  type="button"
                  onClick={handleSaveSignature}
                  className="flex-1 py-4 bg-brand-purple text-white rounded-2xl font-black text-[10px] uppercase tracking-wider shadow-lg shadow-brand-purple/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Guardar y Cerrar
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveSignSessionNum(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 font-black text-xs"
              >
                ✕ Cancelar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
