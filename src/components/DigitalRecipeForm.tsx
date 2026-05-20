/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Save, 
  Plus, 
  Trash2, 
  FileDown, 
  CheckCircle2, 
  ClipboardList, 
  Clock, 
  User, 
  Pill, 
  FileText, 
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { Patient } from '../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface PrescriptionItem {
  medication: string;
  presentation: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Prescription {
  id: string;
  patientId: string;
  date: string;
  patientData: {
    fullName: string;
    age: number;
    allergies: string;
    gender: string;
  };
  diagnosis: string;
  items: PrescriptionItem[];
  recommendations: string;
  responsibleProfessional: string;
  cedula: string;
}

interface DigitalRecipeFormProps {
  patient: Patient;
  onClose: () => void;
  patients?: Patient[];
  onSave?: (recipe: Prescription) => void;
}

export default function DigitalRecipeForm({ patient, onClose, patients, onSave }: DigitalRecipeFormProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [allRecipes, setAllRecipes] = useState<Prescription[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const [formData, setFormData] = useState<Prescription>({
    id: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    patientId: patient.id,
    date: new Date().toISOString().split('T')[0],
    patientData: {
      fullName: patient.name,
      age: patient.age || 28,
      allergies: 'Ninguna reportada',
      gender: patient.gender || 'Femenino',
    },
    diagnosis: 'Onicomicosis ungueal bilateral',
    items: [
      { medication: 'Itraconazol', presentation: 'Cápsulas 100 mg', dosage: 'Tomar 2 cápsulas (200 mg)', frequency: 'Cada 24 horas (con alimentos)', duration: '15 días' },
      { medication: 'Ketoconazol crema', presentation: 'Crema al 2%', dosage: 'Aplicar una capa delgada', frequency: 'Cada 12 horas en zona afectada', duration: '30 días' }
    ],
    recommendations: 'Lavar diariamente el calzado con spray antiséptico. Secar meticulosamente los espacios interdigitales después del baño. Utilizar calcetines de algodón 100% transpirable.',
    responsibleProfessional: 'Dra. Lluvia G.',
    cedula: '11582943',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [patientRecipes, setPatientRecipes] = useState<Prescription[]>([]);

  const loadAllRecipes = () => {
    try {
      const saved = localStorage.getItem('medical_dlis_digital_recipes');
      if (saved) {
        setAllRecipes(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAllRecipes();
  }, [isSaving]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('medical_dlis_digital_recipes');
      if (saved) {
        const all = JSON.parse(saved) as Prescription[];
        const filtered = all.filter(r => r.patientId === formData.patientId || r.patientData?.fullName === formData.patientData.fullName);
        setPatientRecipes(filtered);
      }
    } catch (e) {
      console.error(e);
    }
  }, [formData.patientId, formData.patientData.fullName, isSaving]);

  // Handle adding prescription item
  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { medication: '', presentation: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  // Handle removing prescription item
  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Handle specific farmaco field change
  const handleItemFieldChange = (index: number, field: keyof PrescriptionItem, value: string) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const handleResetForm = () => {
    setFormData({
      id: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: patient.id,
      date: new Date().toISOString().split('T')[0],
      patientData: {
        fullName: patient.name,
        age: patient.age || 28,
        allergies: 'Ninguna reportada',
        gender: patient.gender || 'Femenino',
      },
      diagnosis: '',
      items: [
        { medication: '', presentation: '', dosage: '', frequency: '', duration: '' }
      ],
      recommendations: '',
      responsibleProfessional: 'Dra. Lluvia G.',
      cedula: '11582943',
    });
    setShowSuccessToast(false);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      try {
        const saved = localStorage.getItem('medical_dlis_digital_recipes');
        const all = saved ? JSON.parse(saved) as Prescription[] : [];
        const index = all.findIndex(p => p.id === formData.id);
        
        let updated: Prescription[];
        if (index > -1) {
          updated = [...all];
          updated[index] = formData;
        } else {
          updated = [formData, ...all];
        }
        
        localStorage.setItem('medical_dlis_digital_recipes', JSON.stringify(updated));
        if (onSave) onSave(formData);
      } catch (e) {
        console.error(e);
      }
      setIsSaving(false);
      setShowSuccessToast(true);
      loadAllRecipes();
      setTimeout(() => setShowSuccessToast(false), 4000);
    }, 1000);
  };

  const handleDeleteRecipe = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar esta receta médica?')) {
      const updated = allRecipes.filter(r => r.id !== id);
      setAllRecipes(updated);
      localStorage.setItem('medical_dlis_digital_recipes', JSON.stringify(updated));
    }
  };

  const handleEditRecipe = (recipe: Prescription) => {
    setFormData(recipe);
    setActiveTab('form');
  };

  // Generate pdf with jsPDF
  const generatePDF = (recipe: Prescription) => {
    const doc = new jsPDF() as any;
    
    // Clinic Header Frame
    doc.setFillColor(250, 245, 255); // high-end lavender
    doc.rect(0, 0, 210, 40, 'F');
    
    // Header Content
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(107, 33, 168); // brand-purple
    doc.text("MEDICAL D'LIS", 15, 20);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(115, 115, 115);
    doc.text("PODOLOGÍA CLÍNICA Y CUIDADO MÉDICO", 15, 26);
    doc.text("Av. Glandorf 3706, Col San Felipe, CP 31203, Chihuahua, Chih.", 15, 31);
    doc.text("Teléfono: 6144891998 | Contacto Directo", 15, 36);

    // Doctor details on the header right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`${recipe.responsibleProfessional}`, 195, 18, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(82, 82, 82);
    doc.text("Especialista en Podología Clínica", 195, 23, { align: 'right' });
    doc.text(`Cédula Profesional: ${recipe.cedula}`, 195, 28, { align: 'right' });
    
    // Title Banner
    doc.setFillColor(107, 33, 168); // brand-purple solid
    doc.rect(15, 48, 180, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`RECETA MÉDICA DIGITAL - FOLIO: ${recipe.id}`, 20, 53);

    // Info card frame for Patient
    doc.setFillColor(248, 250, 252); // slate-100/50
    doc.rect(15, 60, 180, 26, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.rect(15, 60, 180, 26);

    // Patient info details
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text("PACIENTE:", 20, 66);
    doc.text("EDAD:", 20, 72);
    doc.text("GÉNERO:", 20, 78);
    doc.text("ALERGIAS:", 110, 66);
    doc.text("DIAGNÓSTICO:", 110, 72);
    doc.text("EMISIÓN:", 110, 78);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(recipe.patientData.fullName, 42, 66);
    doc.text(`${recipe.patientData.age} años`, 42, 72);
    doc.text(recipe.patientData.gender, 42, 78);
    doc.setTextColor(225, 29, 72); // Rose allergy color
    doc.setFont('helvetica', 'bold');
    doc.text(recipe.patientData.allergies, 137, 66);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(recipe.diagnosis || 'Ninguno reportado', 137, 72);
    doc.text(recipe.date, 137, 78);

    // Table Header
    const headers = [['Medicamento / Sustancia', 'Presentación', 'Dosis / Indicación', 'Frecuencia', 'Duración']];
    const data = recipe.items.map(item => [
      item.medication,
      item.presentation,
      item.dosage,
      item.frequency,
      item.duration
    ]);

    doc.autoTable({
      head: headers,
      body: data,
      startY: 92,
      margin: { left: 15, right: 15 },
      theme: 'grid',
      styles: {
        fontSize: 8.5,
        font: 'helvetica',
        cellPadding: 3.5,
        halign: 'left',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [107, 33, 168],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [253, 242, 253]
      }
    });

    const finalY = doc.autoTableEndPosY() + 10;

    // Recommendations note
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(107, 33, 168);
    doc.text("INDICACIONES GENERALES Y RECOMENDACIONES:", 15, finalY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const splitRecommendations = doc.splitTextToSize(recipe.recommendations || 'No hay indicaciones adicionales.', 180);
    doc.text(splitRecommendations, 15, finalY + 5);

    const footprintY = finalY + 5 + (splitRecommendations.length * 4.5) + 12;

    // Footer lines for professional signatures
    doc.setFillColor(250, 245, 255);
    doc.rect(15, footprintY, 180, 25, 'F');
    doc.rect(15, footprintY, 180, 25);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`PRESCRITO ELECTRÓNICAMENTE POR: ${recipe.responsibleProfessional}`, 20, footprintY + 7);
    doc.setFont('helvetica', 'normal');
    doc.text("Firma Autorizada", 20, footprintY + 13);
    doc.text(`Aprobación Digital ID: ${recipe.id.replace('REC-', 'SEC-')}`, 20, footprintY + 18);

    // Decorative Stamp placeholder
    doc.setDrawColor(107, 33, 168);
    doc.setFillColor(253, 242, 253);
    doc.rect(145, footprintY + 2.5, 45, 20, 'F');
    doc.rect(145, footprintY + 2.5, 45, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(107, 33, 168);
    doc.text("MEDICAL D'LIS", 167.5, footprintY + 8, { align: 'center' });
    doc.setFontSize(6);
    doc.text("COPIA DIGITAL ENTREGADA", 167.5, footprintY + 13, { align: 'center' });
    doc.text(`VALIDEZ EMISIÓN: OK`, 167.5, footprintY + 17, { align: 'center' });

    // Print footer disclaimer
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("Esta receta médica digital es una representación autorizada con firma electrónica para uso en farmacia clínica. No se requiere firma autógrafa física.", 105, 280, { align: 'center' });

    // Save PDF
    doc.save(`Receta_Medica_${recipe.patientData.fullName.replace(/\s+/g, '_')}_${recipe.id}.pdf`);
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
              <span className="p-1.5 bg-brand-purple/10 text-brand-purple rounded-lg text-xs font-black uppercase tracking-wider">MÓDULO CLÍNICO PODOLOGÍA</span>
            </div>
            <h2 className="text-2xl font-display font-black text-slate-900 leading-none mt-2">
              Recetario Clínico Digital
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'form' && (
            <>
              {formData.items.length > 0 && formData.items[0].medication && (
                <button
                  type="button"
                  onClick={() => generatePDF(formData)}
                  className="px-6 py-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  Imprimir PDF
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-4 bg-brand-purple text-white hover:bg-brand-purple/90 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-brand-purple/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Guardando...' : 'Emitir Receta'}
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
                <p className="font-black uppercase tracking-wider text-emerald-800">Receta Registrada Exitosamente</p>
                <p className="text-[11px] text-emerald-600 italic font-medium mt-1">La receta {formData.id} se ha indexado en el historial técnico y el PDF ha sido generado.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => generatePDF(formData)}
                className="px-4 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl uppercase font-black tracking-wider text-[10px] transition-all"
              >
                Descargar / Imprimir
              </button>
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2.5 bg-white text-emerald-700 hover:bg-emerald-100 rounded-xl uppercase font-black tracking-wider text-[10px] border border-emerald-200 transition-all"
              >
                Nueva Receta
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
          <Pill className="w-4 h-4" />
          Nueva Receta (Prescribir)
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('history');
            loadAllRecipes();
          }}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
            activeTab === 'history' 
              ? 'bg-white text-brand-purple shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Historial Emitido ({allRecipes.length})
        </button>
      </div>

      {/* Core Body switcher */}
      {activeTab === 'history' ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Historial de Recetas Emitidas</h4>
              <p className="text-xs text-slate-400 mt-1">Busque recetas por nombre del paciente o revise folios clínicos.</p>
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
            {allRecipes.length === 0 ? (
              <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-300 gap-4">
                <ClipboardList className="w-10 h-10 opacity-30 text-brand-purple" />
                <p className="text-xs font-black uppercase tracking-widest">Sin Recetas Registradas</p>
              </div>
            ) : allRecipes
                .filter(p => p.patientData?.fullName?.toLowerCase().includes(historySearchQuery.toLowerCase()))
                .map((recipe, i) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-purple/30 transition-all group relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button 
                        onClick={() => handleDeleteRecipe(recipe.id)} 
                        className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100">
                          <Pill className="w-5 h-5 text-brand-purple" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{recipe.date}</p>
                          <h4 className="text-sm font-black text-slate-900 leading-tight italic truncate max-w-[180px]">{recipe.patientData.fullName}</h4>
                          <p className="text-[9px] font-bold text-brand-purple uppercase tracking-wider mt-0.5">{recipe.items.length} Fármacos</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-[11px] font-bold">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 uppercase text-[9px]">DIAGNÓSTICO:</span>
                          <span className="text-slate-800 font-extrabold max-w-[150px] truncate text-right" title={recipe.diagnosis}>{recipe.diagnosis}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 uppercase text-[9px]">PRESCRIBIÓ:</span>
                          <span className="text-slate-700">{recipe.responsibleProfessional}</span>
                        </div>
                        {recipe.patientData.allergies && (
                          <div className="pt-1.5 mt-1 border-t border-slate-100 text-[9px] text-rose-500 font-medium italic">
                             ⚠️ Alergias: {recipe.patientData.allergies}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button 
                        onClick={() => handleEditRecipe(recipe)}
                        className="flex-1 py-2.5 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md text-center"
                      >
                         Ver / Modificar
                      </button>
                      <button 
                        onClick={() => generatePDF(recipe)}
                        className="p-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                        title="Imprimir PDF"
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
          {/* Clinic Banner Logo */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                <img src="https://cossma.com.mx/medical.png" alt="Medical D'Lis Logo" className="w-full h-auto object-contain" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-black text-slate-900 uppercase">MEDICAL D'LIS</h3>
                <p className="text-xs text-slate-400 font-bold">Av. Glandorf 3706, Col San Felipe, CP 31203</p>
                <p className="text-xs text-slate-400 font-bold">Tel: 6144891998 | RECETARIO DIGITAL PODOLOGÍA</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <span className="inline-block px-4 py-2 bg-purple-50 text-brand-purple rounded-xl border border-purple-100 text-xs font-black tracking-widest uppercase">
                PRESCRIBIR FÁRMACO
              </span>
              <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-2">Folio: {formData.id}</p>
            </div>
          </div>

          {/* Patient identification frame */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 text-brand-purple">
              <User className="w-5 h-5 text-brand-purple" />
              Información de Identificación General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                            ...prev.patientData,
                            fullName: found.name,
                            age: found.age || 28,
                            gender: found.gender || 'Femenino',
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
                  placeholder="Nombre de Paciente"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Edad del Paciente</label>
                <input 
                  type="number" 
                  value={formData.patientData.age}
                  onChange={e => setFormData({
                    ...formData,
                    patientData: { ...formData.patientData, age: Number(e.target.value) }
                  })}
                  className="form-input-hc" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Alergias Conocidas</label>
                <input 
                  type="text" 
                  value={formData.patientData.allergies}
                  onChange={e => setFormData({
                    ...formData,
                    patientData: { ...formData.patientData, allergies: e.target.value }
                  })}
                  className="form-input-hc font-bold text-rose-600 bg-rose-50 border-rose-200 focus:bg-white" 
                  placeholder="Penicilina, sulfa, etc. o 'Ninguna'"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-55">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Diagnóstico Podológico / Clínico</label>
                <input 
                  type="text" 
                  value={formData.diagnosis}
                  onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="form-input-hc" 
                  placeholder="Ej: Onicomicosis, Tiña pedis, Heloma plantar, Espolón calcáneo"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Responsable Emisión</label>
                  <input 
                    type="text" 
                    value={formData.responsibleProfessional}
                    onChange={e => setFormData({ ...formData, responsibleProfessional: e.target.value })}
                    className="form-input-hc bg-slate-50 font-bold" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Cédula Profesional</label>
                  <input 
                    type="text" 
                    value={formData.cedula}
                    onChange={e => setFormData({ ...formData, cedula: e.target.value })}
                    className="form-input-hc bg-slate-50 font-bold" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive recipe items (Fármacos) */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 text-brand-purple">
                <Pill className="w-5 h-5 text-brand-purple" />
                Medicamentos Recetados (Fórmula)
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-5 py-2.5 bg-brand-purple text-white hover:bg-brand-purple/90 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar Medicamento
              </button>
            </div>

            <div className="space-y-6">
              {formData.items.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic bg-slate-50 rounded-2xl border-2 border-dashed">
                  Sin medicamentos en el recetario. Agregue uno con el botón superior.
                </div>
              ) : (
                formData.items.map((item, idx) => (
                  <div key={idx} className="p-6 bg-slate-50/50 hover:bg-slate-50 rounded-[2rem] border border-slate-200 transition-all relative group grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Medicamento (Sustancia)</label>
                      <input 
                        type="text" 
                        value={item.medication}
                        onChange={e => handleItemFieldChange(idx, 'medication', e.target.value)}
                        className="form-input-hc text-xs bg-white" 
                        placeholder="Ej: Terbinafina, Ibuprofeno"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Presentación / Formato</label>
                      <input 
                        type="text" 
                        value={item.presentation}
                        onChange={e => handleItemFieldChange(idx, 'presentation', e.target.value)}
                        className="form-input-hc text-xs bg-white" 
                        placeholder="Ej: Tabletas 250 mg, Gel 10%"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Dosis / Aplicación</label>
                      <input 
                        type="text" 
                        value={item.dosage}
                        onChange={e => handleItemFieldChange(idx, 'dosage', e.target.value)}
                        className="form-input-hc text-xs bg-white" 
                        placeholder="Ej: Tomar 1 tab, Aplicar capa fina"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Frecuencia / Horario</label>
                      <input 
                        type="text" 
                        value={item.frequency}
                        onChange={e => handleItemFieldChange(idx, 'frequency', e.target.value)}
                        className="form-input-hc text-xs bg-white" 
                        placeholder="Ej: Cada 24 hrs, Cada 12 hrs"
                      />
                    </div>

                    <div className="space-y-1 flex items-end gap-2">
                      <div className="space-y-1 flex-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Duración</label>
                        <input 
                          type="text" 
                          value={item.duration}
                          onChange={e => handleItemFieldChange(idx, 'duration', e.target.value)}
                          className="form-input-hc text-xs bg-white" 
                          placeholder="Ej: 14 días, 1 mes"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-550 hover:text-white border border-rose-100 transition-all shadow-sm flex items-center justify-center shrink-0 mb-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recommendations / Signatures */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 text-brand-purple">
              <FileText className="w-5 h-5 text-brand-purple" />
              Recomendaciones Higiénico-Dietéticas e Indicaciones
            </h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Instrucciones adicionales para el Paciente</label>
              <textarea 
                rows={3}
                value={formData.recommendations}
                onChange={e => setFormData({ ...formData, recommendations: e.target.value })}
                className="form-input-hc p-4 rounded-2xl h-24 max-h-48 resize-y" 
                placeholder="Instrucciones sobre cambio de calcetines, aseo, desinfección de calzado, calzado holgado..."
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .form-input-hc {
          width: 100%;
          padding: 0.875rem 1.25rem;
          background-color: rgb(248, 250, 252);
          border-width: 1px;
          border-color: rgb(226, 232, 240);
          border-radius: 1rem;
          font-size: 0.8125rem;
          font-weight: 600;
          color: rgb(15, 23, 42);
          transition-property: all;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 200ms;
        }
        .form-input-hc:focus {
          outline: 2px solid transparent;
          outline-offset: 2px;
          border-color: #6b21a8;
          background-color: #ffffff;
          box-shadow: 0 4px 12px -2px rgba(107, 33, 168, 0.08);
        }
      `}</style>
    </motion.div>
  );
}
