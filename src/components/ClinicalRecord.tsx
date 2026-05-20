/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, 
  ChevronLeft, 
  Save, 
  History, 
  FileText,
  Activity,
  Plus,
  Trash2,
  FileDown,
  CheckCircle2,
  Edit2,
  Calendar,
  ClipboardList,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Heart,
  Stethoscope,
  Package,
  Thermometer,
  Waves,
  Fingerprint,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Info,
  Check,
  Lock,
  Camera,
  Footprints,
  ClipboardCheck
} from 'lucide-react';
import { Patient, Role, ClinicalRecordData, InformedConsent, PodiatryExploration, LabOrder } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import ConsentForm from './ConsentForm';

interface ClinicalRecordProps {
  patient: Patient;
  onClose: () => void;
  activeRole: Role;
  activeSection?: string;
  initialView?: 'list' | 'form';
  patients?: Patient[];
  onPatientChange?: (p: Patient) => void;
}

const STORAGE_KEY = 'medical_dlis_clinical_records';
const CONSENT_STORAGE_KEY = 'medical_dlis_informed_consents';
const PRIVACY_ACCEPTANCE_KEY = 'medical_dlis_privacy_accepted_';

const INITIAL_FORM_STATE: ClinicalRecordData = {
  id: '',
  patientId: '',
  date: new Date().toISOString().split('T')[0],
  recordNumber: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
  personalData: {
    fullName: '',
    age: 0,
    dob: '',
    address: '',
    sex: '',
    phone: '',
    occupation: '',
    maritalStatus: '',
    education: '',
    email: '',
    identificationId: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  },
  reasonForConsultation: {
    reason: '',
    anamnesis: '',
    timeOfEvolution: '',
    firstSymptomDate: '',
    location: '',
    modifyingCircumstance: '',
    painType: '',
    intensity: 5,
    urgencyLevel: 'Verde',
    systemicReview: {
      cardioRespiratory: '',
      gastrointestinal: '',
      genitourinary: '',
      nervousSystem: ''
    }
  },
  vitalSigns: {
    ta: '',
    fc: 0,
    fr: 0,
    temp: 36.5,
    weight: 0,
    height: 0,
    imc: 0,
    nutritionalStatus: '',
  },
  physicalExamSystems: {
    headNeck: '',
    thorax: '',
    abdomen: '',
    extremities: '',
    neurological: '',
  },
  familyHistory: {
    diabetes: false,
    hypertension: false,
    cardiacDisease: false,
    neoplasias: false,
    renalDisease: false,
    psychiatric: false,
    rheumatoidArthritis: false,
    notes: '',
  },
  pathologicalHistory: {
    allergies: '',
    chronicDegenerative: '',
    surgicalTraumatic: '',
    hospitalizationsTransfusions: '',
    cardiovascular: false,
    pulmonary: false,
    renal: false,
    gastrointestinal: false,
    hematological: false,
    endocrine: false,
    mental: false,
    dermatological: false,
    neurological: false,
    metabolic: false,
    heartDisease: false,
    seizures: false,
    pacemaker: false,
    neuropathy: false,
    diabetes: false,
    cancer: false,
    hypertension: false,
    hypotension: false,
    hyperthyroidism: false,
    notes: '',
  },
  nonPathologicalHistory: {
    habits: {
      smoking: '',
      alcohol: '',
      substances: ''
    },
    lifestyle: {
      diet: '',
      activity: '',
      sleep: ''
    },
    immunizations: '',
    hygiene: '',
    notes: '',
  },
  gynecologicalHistory: {
    menarche: '',
    cycleRegularity: '',
    lastMenstrualPeriod: '',
    gpca: { g: 0, p: 0, c: 0, a: 0 },
    prevention: { papanicolaou: '', mammography: '' }
  },
  diagnosis: {
    icdCode: '',
    description: '',
  },
  podiatry: {
    exploration: {
      riskFilter: {
        diabetes: { has: false, years: '' },
        circulatoryIssues: false,
        anticoagulants: false,
        allergies: { meds: '', anesthetics: '', antiseptics: '' }
      },
      footPathologicalHistory: {
        ulcers: false,
        amputations: false,
        nailSurgery: false,
        gout: false,
        notes: ''
      },
      habits: {
        footwearType: '',
        impactSports: false
      },
      dermatological: {
        helomas: false,
        hiperqueratosis: false,
        anhidrosis: false,
        maceration: false,
        infections: '',
        notes: ''
      },
      nails: {},
      vascular: {
        pedalPulse: { der: 'Normal', izq: 'Normal' },
        tibialPulse: { der: 'Normal', izq: 'Normal' },
        temperature: { der: 'Normal', izq: 'Normal' },
        capillaryRefill: { der: 0, izq: 0 }
      },
      neurological: {
        monofilament: { der: 'Sensible', izq: 'Sensible' },
        tuningFork: { der: 'Normal', izq: 'Normal' },
        neuropathyScale: 0
      },
      biomechanical: {
        static: {
          footType: 'Normal',
          alignment: 'Normal',
          deformities: { halluxValgus: false, clawToes: false, hammerToes: false }
        },
        dynamic: {
          gaitType: 'Neutro',
          observations: ''
        }
      },
      treatment: {
        quiropodiaDetails: '',
        orthopodologyPlan: ''
      }
    }
  },
  prescriptions: [],
  labOrders: [],
  medications: [],
  aesthetics: {
    identification: {
      photos: [],
      contraindications: {
        pregnancy: false,
        keloid: false,
        autoimmune: false,
        isotretinoin: false,
        allergies: '',
      },
    },
    history: {
      previousProcedures: '',
      skincareRoutine: '',
      consultationReason: '',
    },
    diagnosis: {
      fitzpatrick: '',
      glogau: '',
      skinType: '',
      lesions: '',
    },
    procedure: {
      type: '',
      brand: '',
      lab: '',
      lotNumber: '',
      expirationDate: '',
      units: '',
      mapping: '',
    },
    followUp: {
      nextAppointment: '',
      afterPhotos: [],
    },
  },
};

export default function ClinicalRecord({ patient, onClose, activeRole, initialView = 'form', patients, onPatientChange }: ClinicalRecordProps) {
  const [view, setView] = useState<'list' | 'form'>('form');
  const [records, setRecords] = useState<ClinicalRecordData[]>([]);
  const [showConsent, setShowConsent] = useState(false);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(false);
  const [justSavedRecordId, setJustSavedRecordId] = useState<string | null>(null);
  const [podiatryActiveTab, setPodiatryActiveTab] = useState<'risk' | 'derm' | 'vascular' | 'biomechanical' | 'treatment'>('risk');
  const [generalActiveTab, setGeneralActiveTab] = useState<'ficha' | 'historial' | 'exploracion' | 'plan'>('ficha');
  const [formData, setFormData] = useState<ClinicalRecordData>({
    ...INITIAL_FORM_STATE,
    patientId: patient.id,
    personalData: {
      ...INITIAL_FORM_STATE.personalData,
      fullName: patient.name,
      phone: patient.phone || '',
      email: patient.email || '',
      age: patient.age || 0,
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [rawAINote, setRawAINote] = useState('');
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const processWithAI = async () => {
    if (!rawAINote.trim()) return;
    setIsProcessingAI(true);
    try {
      const response = await fetch('/api/process-medical-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          note: rawAINote,
          role: activeRole,
          patientContext: {
            name: patient.name,
            age: patient.age,
            isDiabetic: formData.pathologicalHistory.diabetes,
            allergies: formData.pathologicalHistory.notes.toLowerCase().includes('alerg') ? formData.pathologicalHistory.notes : '',
            history: {
              pathological: formData.pathologicalHistory.notes,
              family: formData.familyHistory.notes
            }
          }
        }),
      });
      
      if (!response.ok) throw new Error('Error en el servidor AI');
      
      const data = await response.json();
      
      // Update form data with AI results
      setFormData(prev => ({
        ...prev,
        reasonForConsultation: {
          ...prev.reasonForConsultation,
          reason: data.reason || prev.reasonForConsultation.reason,
          anamnesis: data.anamnesis || prev.reasonForConsultation.anamnesis,
        },
        vitalSigns: data.vitalSigns ? {
          ...prev.vitalSigns,
          ta: data.vitalSigns?.ta || prev.vitalSigns.ta,
          fc: data.vitalSigns?.fc || prev.vitalSigns.fc,
          fr: data.vitalSigns?.fr || prev.vitalSigns.fr,
          temp: data.vitalSigns?.temp || prev.vitalSigns.temp,
          weight: data.vitalSigns?.weight || prev.vitalSigns.weight,
          height: data.vitalSigns?.height || prev.vitalSigns.height,
        } : prev.vitalSigns,
        physicalExamSystems: data.physical ? {
          ...prev.physicalExamSystems,
          headNeck: data.physical?.headNeck || prev.physicalExamSystems.headNeck,
          thorax: data.physical?.thorax || prev.physicalExamSystems.thorax,
          abdomen: data.physical?.abdomen || prev.physicalExamSystems.abdomen,
          extremities: data.physical?.extremities || prev.physicalExamSystems.extremities,
          neurological: data.physical?.neurological || prev.physicalExamSystems.neurological,
        } : prev.physicalExamSystems,
        podiatry: data.podiatry ? {
          ...prev.podiatry,
          exploration: {
            ...prev.podiatry!.exploration,
            ...data.podiatry.exploration,
            dermatological: {
              ...prev.podiatry!.exploration.dermatological,
              ...data.podiatry.exploration.dermatological
            },
            vascular: {
              ...prev.podiatry!.exploration.vascular,
              ...data.podiatry.exploration.vascular
            },
            neurological: {
              ...prev.podiatry!.exploration.neurological,
              ...data.podiatry.exploration.neurological
            },
            biomechanical: {
              ...prev.podiatry!.exploration.biomechanical,
              ...data.podiatry.exploration.biomechanical
            }
          },
          services: data.podiatry.services || prev.podiatry!.services
        } : prev.podiatry,
        aesthetics: data.aesthetics ? {
          ...prev.aesthetics,
          ...data.aesthetics,
          identification: { ...prev.aesthetics?.identification, ...data.aesthetics.identification },
          history: { ...prev.aesthetics?.history, ...data.aesthetics.history },
          diagnosis: { ...prev.aesthetics?.diagnosis, ...data.aesthetics.diagnosis },
          procedure: { ...prev.aesthetics?.procedure, ...data.aesthetics.procedure },
          followUp: { ...prev.aesthetics?.followUp, ...data.aesthetics.followUp },
        } : prev.aesthetics,
        diagnosis: {
          ...prev.diagnosis,
          icdCode: data.diagnosis?.icdCode || prev.diagnosis.icdCode,
          description: data.diagnosis?.description || prev.diagnosis.description,
        }
      }));
      
      setShowAIAssistant(false);
      setRawAINote('');
      alert('Información procesada e integrada exitosamente.');
    } catch (error) {
      console.error('AI Error:', error);
      alert('Hubo un error al procesar la nota con la IA. Verifique la conexión.');
    } finally {
      setIsProcessingAI(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const allRecords = JSON.parse(saved);
      setRecords(allRecords.filter((r: ClinicalRecordData) => r.patientId === patient.id));
    } else {
      setRecords([]);
    }

    setFormData({
      ...INITIAL_FORM_STATE,
      patientId: patient.id,
      recordNumber: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      personalData: {
        ...INITIAL_FORM_STATE.personalData,
        fullName: patient.name,
        phone: patient.phone || '',
        email: patient.email || '',
        age: patient.age || 0,
      }
    });
    setView('form');
  }, [patient.id]);

  const saveToStorage = (newRecords: ClinicalRecordData[]) => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const allRecords = saved ? JSON.parse(saved) : [];
    const otherPatientsRecords = allRecords.filter((r: ClinicalRecordData) => r.patientId !== patient.id);
    const finalRecords = [...otherPatientsRecords, ...newRecords];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalRecords));
    setRecords(newRecords);
  };

  const calculateIMC = (w: number, h: number) => {
    if (!w || !h) return { imc: 0, status: '' };
    const hMeter = h / 100;
    const imc = parseFloat((w / (hMeter * hMeter)).toFixed(1));
    let status = '';
    if (imc < 18.5) status = 'Bajo peso';
    else if (imc < 24.9) status = 'Normal';
    else if (imc < 29.9) status = 'Sobrepeso';
    else status = 'Obesidad';
    return { imc, status };
  };

  const updateVitalSigns = (field: string, value: any) => {
    const newSigns = { ...formData.vitalSigns, [field]: value };
    if (field === 'weight' || field === 'height') {
      const { imc, status } = calculateIMC(newSigns.weight || 0, newSigns.height || 0);
      newSigns.imc = imc;
      newSigns.nutritionalStatus = status;
    }
    setFormData({ ...formData, vitalSigns: newSigns as any });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      let updatedRecords;
      let savedId = formData.id;
      if (formData.id) {
        updatedRecords = records.map(r => r.id === formData.id ? formData : r);
      } else {
        savedId = crypto.randomUUID();
        const newRecord = { ...formData, id: savedId };
        updatedRecords = [newRecord, ...records];
      }
      saveToStorage(updatedRecords);
      setJustSavedRecordId(savedId);
      setIsSaving(false);
      handleNew(); // Reset screen form to empty ready for another entry
      alert('Registro Clínico guardado exitosamente. Podrá ver el registro actualizado abajo.');
    }, 800);
  };

  const handleSaveConsent = (consent: InformedConsent) => {
    const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
    const consents = saved ? JSON.parse(saved) : [];
    const newConsents = [
      { ...consent, clinicalRecordId: justSavedRecordId || undefined },
      ...consents.filter((c: InformedConsent) => c.id !== consent.id)
    ];
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(newConsents));
    setShowConsent(false);
    alert('Consentimiento guardado exitosamente.');
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar este historial clínico definitivamente?')) {
      const updated = records.filter(r => r.id !== id);
      saveToStorage(updated);
    }
  };

  const handleEdit = (record: ClinicalRecordData) => {
    setFormData(record);
    setView('form');
  };

  const handleNew = () => {
    setFormData({
      ...INITIAL_FORM_STATE,
      patientId: patient.id,
      recordNumber: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      personalData: {
        ...INITIAL_FORM_STATE.personalData,
        fullName: patient.name,
        phone: patient.phone || '',
        email: patient.email || '',
        age: patient.age || 0,
      }
    });
    setView('form');
    
    // For medicine role, if it's the first record, show privacy notice
    if (activeRole === Role.MEDICINA_GENERAL && records.length === 0 && !hasAcceptedPrivacy) {
      setShowPrivacyNotice(true);
    }
  };

  const renderPrivacyNotice = () => (
    <AnimatePresence>
      {showPrivacyNotice && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
          >
            <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-4 text-brand-purple mb-8">
                <div className="w-16 h-16 bg-brand-purple/10 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-black text-slate-900 tracking-tight italic">Aviso de Privacidad</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consentimiento para Expediente Digital</p>
                </div>
              </div>

              <div className="prose prose-slate prose-sm max-w-none space-y-6">
                <p className="text-slate-900 font-bold text-base border-b-2 border-brand-purple/20 pb-2">
                  AVISO DE PRIVACIDAD Y CONSENTIMIENTO INFORMADO PARA EXPEDIENTE CLÍNICO DIGITAL
                </p>
                
                <section className="space-y-4">
                  <div className="bg-slate-100 p-4 rounded-xl border-l-4 border-brand-purple">
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">Identidad y Domicilio</p>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                      Medical D'Lis Digital, con domicilio en Ciudad de México, es responsable del tratamiento de sus datos personales y sensibles relacionados con su salud.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">II. Datos Personales Recabados</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Recabamos datos de identificación (Nombre, CURP, Edad, Sexo, Contacto) y datos personales sensibles (Antecedentes Heredo-Familiares, Patológicos, Signos Vitales, Estilos de Vida, Exploraciones Clínicas y Resultados de Laboratorio).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">III. Finalidades del Tratamiento</h4>
                    <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4 font-medium">
                      <li>Integración de su Expediente Clínico Digital conforme a la NOM-004-SSA3-2012.</li>
                      <li>Prestación de servicios de atención médica y diagnósticos especializados.</li>
                      <li>Envío de recetas digitales y resultados de laboratorio interconectados (LIS).</li>
                      <li>Consultas históricas por personal médico autorizado.</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">IV. Transferencias y Seguridad</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Sus datos están protegidos por medidas de seguridad administrativas, técnicas y físicas. No se transferirán a terceros sin su consentimiento, excepto por requerimientos legales o de salud pública.
                    </p>
                  </div>

                  <div className="p-4 bg-brand-purple/5 rounded-2xl border border-brand-purple/10">
                    <h4 className="text-[10px] font-black text-brand-purple uppercase tracking-widest mb-2 italic">Declaratoria de Consentimiento</h4>
                    <p className="text-[11px] text-slate-700 leading-relaxed font-bold">
                      "Otorgo mi consentimiento expreso y por escrito para que mis datos personales, incluidos los sensibles de salud, sean tratados conforme a este aviso. Acepto que mi diagnóstico sea procesado con asistencia de herramientas digitales de precisión clínica."
                    </p>
                  </div>
                </section>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-8">
                  <p className="text-[10px] text-slate-400 font-bold mb-4">AL CONTINUAR, DECLARA QUE HA LEÍDO Y ACEPTA LOS TÉRMINOS DESCRITOS.</p>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={hasAcceptedPrivacy}
                        onChange={() => setHasAcceptedPrivacy(!hasAcceptedPrivacy)}
                        className="peer hidden"
                      />
                      <div className="w-6 h-6 border-2 border-slate-200 rounded-lg group-hover:border-brand-purple transition-all peer-checked:bg-brand-purple peer-checked:border-brand-purple flex items-center justify-center">
                        <Check className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">Acepto los términos y condiciones</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-500">
                <Lock className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Enclave de Seguridad Médica activo</span>
              </div>
              <button 
                onClick={() => {
                  localStorage.setItem(`${PRIVACY_ACCEPTANCE_KEY}${patient.id}`, 'true');
                  setShowPrivacyNotice(false);
                }}
                disabled={!hasAcceptedPrivacy}
                className={`w-full md:w-auto px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  hasAcceptedPrivacy 
                    ? 'bg-brand-purple text-white hover:bg-brand-purple-dark shadow-xl shadow-brand-purple/20' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Acceder al Expediente
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const generatePDF = (record: ClinicalRecordData) => {
    const doc = new jsPDF();
    const logoUrl = 'https://cossma.com.mx/medical.png';
    
    doc.addImage(logoUrl, 'PNG', 10, 10, 35, 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(51, 65, 85);
    doc.text("Medical D'Lis", 50, 22);
    doc.setFontSize(14);
    doc.setTextColor(124, 58, 237);
    doc.text("HISTORIA CLÍNICA INTEGRAL", 50, 29);
    
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`EXPEDIENTE: ${record.recordNumber}`, 155, 20);
    doc.text(`FECHA REGISTRO: ${record.date}`, 155, 25);

    doc.setDrawColor(226, 232, 240);
    doc.line(10, 35, 200, 35);

    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text("1. DATOS PERSONALES DEL PACIENTE", 10, 45);
    
    const pData = record.personalData;
    (doc as any).autoTable({
      startY: 48,
      body: [
        ["Nombre Completo", pData.fullName, "Edad", `${pData.age} años`],
        ["F. Nacimiento", pData.dob, "Sexo", pData.sex],
        ["Domicilio", pData.address, "Ocupación", pData.occupation],
        ["Teléfono", pData.phone, "Easc.", pData.education],
        ["Email", pData.email, "Edo. Civil", pData.maritalStatus]
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [124, 58, 237] }
    });

    // Sections for General Medicine in PDF
    // ... logic for additional sections in PDF can be added here
    
    doc.save(`HC_${record.recordNumber}_${record.personalData.fullName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-white flex flex-col h-full overflow-hidden"
    >
      {/* Header Bar */}
      <div className="px-4 md:px-8 py-4 md:py-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/80 backdrop-blur-md shrink-0 z-30 gap-4">
        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
          <button 
            onClick={onClose}
            className="p-2 md:p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-brand-purple transition-all border border-transparent hover:border-slate-100 shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-lg md:text-xl font-display font-black text-slate-900 tracking-tight leading-none italic truncate">
              {formData.id ? 'Editando Historia' : 'Nuevo Registro Clínico'}
            </h2>
            <div className="text-[11px] md:text-[12px] text-slate-400 font-black uppercase tracking-[0.15em] mt-1.5 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-brand-purple shrink-0"></span>
               {patients && patients.length > 0 && onPatientChange ? (
                 <select 
                   value={patient.id}
                   onChange={(e) => {
                     const selected = patients.find(p => p.id === e.target.value);
                     if (selected) onPatientChange(selected);
                   }}
                   className="bg-purple-50 hover:bg-purple-100 text-brand-purple font-black text-[11px] px-3 py-1 border border-purple-200 rounded-lg outline-none cursor-pointer transition-all"
                 >
                   {patients.map(p => (
                     <option key={p.id} value={p.id}>{p.name} ({p.service})</option>
                   ))}
                 </select>
               ) : (
                 <>
                   {patient.name} {formData.id && <span className="text-brand-purple font-black">({formData.recordNumber})</span>}
                 </>
               )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto shrink-0">
          {formData.id && (
            <button 
              onClick={handleNew}
              className="flex-1 sm:flex-none border-2 border-slate-200 text-slate-600 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[11px] md:text-xs font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all text-center flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Crear Nuevo
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex-1 sm:flex-none ${isSaving ? 'bg-emerald-500' : 'bg-brand-purple hover:bg-brand-purple-dark'} text-white px-4 md:px-8 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[11px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand-purple/20`}
          >
            {isSaving ? <CheckCircle2 className="w-4 h-4 animate-bounce" /> : <Save className="w-4 h-4" />}
            <span className="hidden sm:inline">{isSaving ? 'Guardando...' : formData.id ? 'Guardar Cambios' : 'Guardar Consulta'}</span>
            <span className="sm:hidden">{isSaving ? '...' : 'Guardar'}</span>
          </button>
          {justSavedRecordId && (
            <button 
              onClick={() => setShowConsent(true)}
              className="flex-1 sm:flex-none bg-emerald-500 text-white px-4 md:px-8 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[11px] md:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/20"
            >
              <ClipboardList className="w-4 h-4" />
              Consentimiento
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {renderPrivacyNotice()}
        <AnimatePresence mode="wait">
          {showConsent ? (
            <div className="fixed inset-0 z-[250]">
              <ConsentForm 
                patient={patient} 
                onClose={() => setShowConsent(false)} 
                onSave={handleSaveConsent}
                initialData={{
                  id: '',
                  patientId: patient.id,
                  clinicalRecordId: justSavedRecordId || undefined,
                  date: new Date().toISOString().split('T')[0],
                  type: activeRole === Role.ESTETICA ? 'Medicina Estética' : 'Podología',
                  patientData: {
                    fullName: formData.personalData.fullName,
                    phone: formData.personalData.phone,
                    email: formData.personalData.email,
                    age: formData.personalData.age,
                    sex: formData.personalData.sex,
                    medicalHistory: `A. Patológicos: ${formData.pathologicalHistory.notes}\nFamiliar: ${formData.familyHistory.notes}`,
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
                    procedureName: formData.aesthetics?.procedure.type || '',
                    accepted: true,
                  },
                  alternative: 'none',
                  signature: '',
                }}
              />
            </div>
          ) : (
            <motion.div 
               key="form"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="flex-1 flex flex-col overflow-hidden bg-slate-50/50"
             >
               <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-12">
                 <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 pb-32">
                   {/* Section: AI Assistant */}
                   {(activeRole === Role.MEDICINA_GENERAL || activeRole === Role.PODOLOGIA || activeRole === Role.ESTETICA) && (
                     <section className="bg-brand-purple/5 p-6 md:p-8 rounded-[2.5rem] border-2 border-brand-purple/10 relative overflow-hidden">
                       <div className="absolute right-[-2%] top-[-10%] w-32 h-32 bg-brand-purple/5 rounded-full blur-3xl" />
                       <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                         <div className="space-y-1">
                           <div className="flex items-center gap-2">
                             <Sparkles className="w-5 h-5 text-brand-purple" />
                             <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                               Asistente de {activeRole === Role.PODOLOGIA ? 'Podología' : activeRole === Role.ESTETICA ? 'Medicina Estética' : 'Escribano'} AI
                             </h4>
                           </div>
                           <p className="text-xs text-slate-500 font-medium italic">
                             {activeRole === Role.PODOLOGIA 
                               ? 'Analiza notas del pie diabético, pulsos y biomecánica automáticamente.' 
                               : activeRole === Role.ESTETICA 
                               ? 'Genera mapeo cutáneo, trazabilidad de producto y escalas Glogau/Fitzpatrick.'
                               : 'Pega tu nota médica cruda o transcripción para auto-llenar el expediente.'}
                           </p>
                         </div>
                         <button 
                           onClick={() => setShowAIAssistant(!showAIAssistant)}
                           className="w-full md:w-auto px-6 py-3 bg-brand-purple text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-brand-purple/20"
                         >
                           {showAIAssistant ? 'Cerrar Asistente' : 'Activar Asistente AI'}
                         </button>
                       </div>

                       <AnimatePresence>
                         {showAIAssistant && (
                           <motion.div 
                             initial={{ opacity: 0, height: 0 }}
                             animate={{ opacity: 1, height: 'auto' }}
                             exit={{ opacity: 0, height: 0 }}
                             className="mt-6 space-y-4"
                           >
                             <textarea 
                               rows={4}
                               value={rawAINote}
                               onChange={e => setRawAINote(e.target.value)}
                               placeholder={activeRole === Role.PODOLOGIA 
                                 ? "Ej: Paciente diabético con onicocriptosis en 1er dedo derecho. Pulsos presentes. Pie plano valgo..."
                                 : activeRole === Role.ESTETICA
                                 ? "Ej: Aplicación de botox en frente a María. Sugiero 30 unidades..."
                                 : "Paciente masculino refiere dolor abdominal tipo cólico desde hace 2 días... TA 120/80..."}
                               className="form-input-hc bg-white border-brand-purple/20 focus:border-brand-purple h-32 md:h-48"
                             />
                             <div className="flex justify-end items-center gap-4">
                               <button 
                                 onClick={processWithAI}
                                 disabled={isProcessingAI || !rawAINote.trim()}
                                 className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                   isProcessingAI ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-black'
                                 }`}
                               >
                                 {isProcessingAI ? (
                                   <>
                                     <Activity className="w-4 h-4 animate-spin" />
                                     Procesando Inteligencia...
                                   </>
                                 ) : (
                                   <>
                                     <Sparkles className="w-4 h-4" />
                                     Analizar y Estructurar
                                   </>
                                 )}
                               </button>
                             </div>
                           </motion.div>
                         )}
                       </AnimatePresence>
                     </section>
                   )}

                    {/* Specialist Tabs Header */}
                    {activeRole === Role.MEDICINA_GENERAL && (
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-4 overflow-x-auto no-scrollbar">
                        {[
                          { id: 'ficha', label: 'Ficha / Motivo', icon: User },
                          { id: 'historial', label: 'Antecedentes', icon: History },
                          { id: 'exploracion', label: 'Exploración', icon: Stethoscope },
                          { id: 'plan', label: 'Evaluación / Plan', icon: ClipboardList }
                        ].map(tab => (
                          <button 
                            key={tab.id} 
                            onClick={() => setGeneralActiveTab(tab.id as any)} 
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shrink-0 ${
                              generalActiveTab === tab.id 
                                ? 'bg-slate-900 text-white shadow-xl scale-[1.02]' 
                                : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'
                            }`}
                          >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Section: Control */}
                    {(activeRole !== Role.MEDICINA_GENERAL || generalActiveTab === 'ficha') && (
                      <section className="space-y-6 md:space-y-8 pb-8 md:pb-12 border-b border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex items-center gap-3 md:gap-4 text-brand-purple">
                        <ClipboardList className="w-6 md:w-8 h-6 md:h-8" />
                        <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 tracking-tight italic">1. Control de Registro</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                       <div className="space-y-2">
                         <label className="label-hc">Fecha de Registro</label>
                         <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="form-input-hc" />
                       </div>
                       <div className="space-y-2">
                         <label className="label-hc">Nº Expediente</label>
                         <input type="text" value={formData.recordNumber} onChange={e => setFormData({...formData, recordNumber: e.target.value})} className="form-input-hc" />
                       </div>
                     </div>
                   </section>

                   )}

                   {/* Section: Personal */}
                   {(activeRole !== Role.MEDICINA_GENERAL || generalActiveTab === 'ficha') && (
                     <section className="space-y-6 md:space-y-8 pb-8 md:pb-12 border-b border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex items-center gap-3 md:gap-4 text-brand-purple">
                        <User className="w-6 md:w-8 h-6 md:h-8" />
                        <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 tracking-tight italic">2. Ficha de Identificación</h3>
                     </div>
                     
                     <div className="flex flex-col md:flex-row gap-8 items-start">
                       <div className="w-full md:w-48 shrink-0 space-y-4">
                         <div className="aspect-square bg-slate-100 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 group hover:border-brand-purple hover:bg-brand-purple/5 transition-all cursor-pointer relative overflow-hidden">
                           <Camera className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Foto de Perfil</span>
                         </div>
                       </div>

                       <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
                         <div className="md:col-span-2 space-y-2">
                           <label className="label-hc">Nombre Completo</label>
                           <input type="text" value={formData.personalData.fullName} onChange={e => setFormData({...formData, personalData: {...formData.personalData, fullName: e.target.value}})} className="form-input-hc" />
                         </div>
                         <div className="space-y-2">
                           <label className="label-hc">CURP / Identificación</label>
                           <input type="text" value={formData.personalData.identificationId} onChange={e => setFormData({...formData, personalData: { ...formData.personalData, identificationId: e.target.value }})} className="form-input-hc" placeholder="CURP o ID Oficial" />
                         </div>
                         <div className="space-y-2">
                           <label className="label-hc">Fecha de Nacimiento</label>
                           <input type="date" value={formData.personalData.dob} onChange={e => setFormData({...formData, personalData: {...formData.personalData, dob: e.target.value}})} className="form-input-hc" />
                         </div>
                         <div className="space-y-2">
                           <label className="label-hc">Edad</label>
                           <input type="number" value={formData.personalData.age} onChange={e => setFormData({...formData, personalData: {...formData.personalData, age: parseInt(e.target.value)}})} className="form-input-hc" />
                         </div>
                         <div className="space-y-2">
                           <label className="label-hc">Género</label>
                           <select value={formData.personalData.sex} onChange={e => setFormData({...formData, personalData: {...formData.personalData, sex: e.target.value}})} className="form-input-hc">
                             <option value="">Seleccionar</option>
                             <option value="Femenino">Femenino</option>
                             <option value="Masculino">Masculino</option>
                             <option value="Otro">Otro</option>
                           </select>
                         </div>
                       </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 md:p-8 rounded-[2rem] border border-slate-100">
                       <div className="space-y-2">
                         <label className="label-hc">Ocupación</label>
                         <input type="text" value={formData.personalData.occupation} onChange={e => setFormData({...formData, personalData: {...formData.personalData, occupation: e.target.value}})} className="form-input-hc bg-white" />
                       </div>
                       <div className="space-y-2">
                         <label className="label-hc">Estado Civil</label>
                         <select value={formData.personalData.maritalStatus} onChange={e => setFormData({...formData, personalData: {...formData.personalData, maritalStatus: e.target.value}})} className="form-input-hc bg-white">
                           <option value="">Seleccionar</option>
                           <option value="Soltero">Soltero/a</option>
                           <option value="Casado">Casado/a</option>
                           <option value="Divorciado">Divorciado/a</option>
                           <option value="Viudo">Viudo/a</option>
                           <option value="Unión Libre">Unión Libre</option>
                         </select>
                       </div>
                       <div className="space-y-2">
                         <label className="label-hc">Escolaridad</label>
                         <input type="text" value={formData.personalData.education} onChange={e => setFormData({...formData, personalData: {...formData.personalData, education: e.target.value}})} className="form-input-hc bg-white" />
                       </div>
                     </div>

                     <div className="space-y-6">
                       <div className="flex items-center gap-2">
                         <Phone className="w-4 h-4 text-brand-purple" />
                         <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Contacto de Emergencia</h4>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="space-y-2">
                           <label className="label-hc">Nombre de Contacto</label>
                           <input type="text" value={formData.personalData.emergencyContact?.name} onChange={e => setFormData({...formData, personalData: {...formData.personalData, emergencyContact: { ...formData.personalData.emergencyContact!, name: e.target.value }}})} className="form-input-hc" />
                         </div>
                         <div className="space-y-2">
                           <label className="label-hc">Parentesco</label>
                           <input type="text" value={formData.personalData.emergencyContact?.relationship} onChange={e => setFormData({...formData, personalData: {...formData.personalData, emergencyContact: { ...formData.personalData.emergencyContact!, relationship: e.target.value }}})} className="form-input-hc" />
                         </div>
                         <div className="space-y-2">
                           <label className="label-hc">Teléfono</label>
                           <input type="tel" value={formData.personalData.emergencyContact?.phone} onChange={e => setFormData({...formData, personalData: {...formData.personalData, emergencyContact: { ...formData.personalData.emergencyContact!, phone: e.target.value }}})} className="form-input-hc" />
                         </div>
                       </div>
                     </div>
                   </section>
                   )}

                   {/* Section: Consultation & Anamnesis */}
                   {(activeRole !== Role.MEDICINA_GENERAL || generalActiveTab === 'ficha') && (
                     <section className="space-y-6 md:space-y-8 pb-8 md:pb-12 border-b border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-3 md:gap-4 text-brand-purple">
                         <Activity className="w-6 md:w-8 h-6 md:h-8" />
                         <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 tracking-tight italic">3. Motivo de Consulta y Anamnesis</h3>
                      </div>
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                             <label className="label-hc">Motivo Principal</label>
                             <input type="text" value={formData.reasonForConsultation.reason} onChange={e => setFormData({...formData, reasonForConsultation: {...formData.reasonForConsultation, reason: e.target.value}})} className="form-input-hc" placeholder="Ej: Dolor abdominal..." />
                           </div>
                           <div className="space-y-2">
                             <label className="label-hc">Nivel de Urgencia (Triage)</label>
                             <div className="flex gap-2">
                                {(['Verde', 'Amarillo', 'Rojo'] as const).map(level => (
                                  <button 
                                    key={level}
                                    type="button"
                                    onClick={() => setFormData({...formData, reasonForConsultation: {...formData.reasonForConsultation, urgencyLevel: level}})}
                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                                      formData.reasonForConsultation.urgencyLevel === level 
                                        ? level === 'Rojo' ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-200' :
                                          level === 'Amarillo' ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200' :
                                          'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200'
                                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                                    }`}
                                  >
                                    {level}
                                  </button>
                                ))}
                             </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="label-hc">Tiempo de Evolución</label>
                            <input type="text" value={formData.reasonForConsultation.timeOfEvolution} onChange={e => setFormData({...formData, reasonForConsultation: { ...formData.reasonForConsultation, timeOfEvolution: e.target.value }})} className="form-input-hc" placeholder="Ej: 3 días, 2 semanas..." />
                          </div>
                          <div className="space-y-2">
                            <label className="label-hc">Fecha de Inicio de Síntomas</label>
                            <input type="date" value={formData.reasonForConsultation.firstSymptomDate} onChange={e => setFormData({...formData, reasonForConsultation: {...formData.reasonForConsultation, firstSymptomDate: e.target.value}})} className="form-input-hc" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="label-hc">Anamnesis / Historia de la Enfermedad</label>
                          <textarea rows={6} value={formData.reasonForConsultation.anamnesis} onChange={e => setFormData({...formData, reasonForConsultation: {...formData.reasonForConsultation, anamnesis: e.target.value}})} className="form-input-hc resize-none" placeholder="Relato detallado de síntomas, evolución cronológica, factores agravantes o atenuantes..." />
                        </div>

                        {activeRole === Role.MEDICINA_GENERAL && (
                          <div className="space-y-6 pt-4">
                            <div className="flex items-center gap-2">
                              <Stethoscope className="w-4 h-4 text-brand-purple" />
                              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Interrogatorio por Aparatos y Sistemas</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="label-hc">Cardiovascular y Respiratorio</label>
                                <textarea rows={2} value={formData.reasonForConsultation.systemicReview.cardioRespiratory} onChange={e => setFormData({...formData, reasonForConsultation: { ...formData.reasonForConsultation, systemicReview: { ...formData.reasonForConsultation.systemicReview, cardioRespiratory: e.target.value } }})} className="form-input-hc bg-slate-50/30" />
                              </div>
                              <div className="space-y-2">
                                <label className="label-hc">Gastrointestinal</label>
                                <textarea rows={2} value={formData.reasonForConsultation.systemicReview.gastrointestinal} onChange={e => setFormData({...formData, reasonForConsultation: { ...formData.reasonForConsultation, systemicReview: { ...formData.reasonForConsultation.systemicReview, gastrointestinal: e.target.value } } })} className="form-input-hc bg-slate-50/30" />
                              </div>
                              <div className="space-y-2">
                                <label className="label-hc">Genitourinario</label>
                                <textarea rows={2} value={formData.reasonForConsultation.systemicReview.genitourinary} onChange={e => setFormData({...formData, reasonForConsultation: { ...formData.reasonForConsultation, systemicReview: { ...formData.reasonForConsultation.systemicReview, genitourinary: e.target.value } } })} className="form-input-hc bg-slate-50/30" />
                              </div>
                              <div className="space-y-2">
                                <label className="label-hc">Nervioso / Estado de Ánimo</label>
                                <textarea rows={2} value={formData.reasonForConsultation.systemicReview.nervousSystem} onChange={e => setFormData({...formData, reasonForConsultation: { ...formData.reasonForConsultation, systemicReview: { ...formData.reasonForConsultation.systemicReview, nervousSystem: e.target.value } } })} className="form-input-hc bg-slate-50/30" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                   </section>
                   )}

                   {/* Section: Vital Signs */}
                   {(activeRole !== Role.MEDICINA_GENERAL || generalActiveTab === 'ficha') && (
                     <section className="space-y-6 md:space-y-8 pb-8 md:pb-12 border-b border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-3 md:gap-4 text-brand-purple">
                         <Activity className="w-6 md:w-8 h-6 md:h-8" />
                         <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 tracking-tight italic">4. Signos Vitales y Antropometría</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                         <div className="space-y-1">
                            <label className="label-hc">P. Arterial</label>
                            <input type="text" placeholder="120/80" value={formData.vitalSigns?.ta} onChange={e => updateVitalSigns('ta', e.target.value)} className="form-input-hc" />
                         </div>
                         <div className="space-y-1">
                            <label className="label-hc">FC (bpm)</label>
                            <input type="number" value={formData.vitalSigns?.fc} onChange={e => updateVitalSigns('fc', parseInt(e.target.value))} className="form-input-hc" />
                         </div>
                         <div className="space-y-1">
                            <label className="label-hc">FR (rpm)</label>
                            <input type="number" value={formData.vitalSigns?.fr} onChange={e => updateVitalSigns('fr', parseInt(e.target.value))} className="form-input-hc" />
                         </div>
                         <div className="space-y-1">
                            <label className="label-hc">Temp (°C)</label>
                            <input type="number" step="0.1" value={formData.vitalSigns?.temp} onChange={e => updateVitalSigns('temp', parseFloat(e.target.value))} className="form-input-hc" />
                         </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 md:p-8 rounded-[2rem] border-2 border-slate-100 shadow-inner">
                         <div className="space-y-1">
                            <label className="label-hc">Peso (kg)</label>
                            <input type="number" step="0.1" value={formData.vitalSigns?.weight} onChange={e => updateVitalSigns('weight', parseFloat(e.target.value))} className="form-input-hc bg-white" />
                         </div>
                         <div className="space-y-1">
                            <label className="label-hc">Talla (cm)</label>
                            <input type="number" value={formData.vitalSigns?.height} onChange={e => updateVitalSigns('height', parseInt(e.target.value))} className="form-input-hc bg-white" />
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="bg-white p-3 rounded-2xl flex-1 border border-slate-200">
                               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">IMC</p>
                               <p className="text-xl font-black text-brand-purple">{formData.vitalSigns?.imc || '--'}</p>
                            </div>
                            <div className="bg-white p-3 rounded-2xl flex-1 border border-slate-200">
                               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado</p>
                               <p className={`text-[10px] font-black uppercase tracking-tighter ${
                                 formData.vitalSigns?.nutritionalStatus === 'Normal' ? 'text-emerald-500' :
                                 formData.vitalSigns?.nutritionalStatus === 'Bajo peso' ? 'text-sky-500' : 'text-rose-500'
                               }`}>{formData.vitalSigns?.nutritionalStatus || 'Pendiente'}</p>
                            </div>
                         </div>
                      </div>
                   </section>
                   )}

                   {/* Section: Physical Exam */}
                   {(activeRole !== Role.MEDICINA_GENERAL || generalActiveTab === 'exploracion') && (
                     <section className="space-y-6 md:space-y-8 pb-8 md:pb-12 border-b border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-3 md:gap-4 text-brand-purple">
                         <Stethoscope className="w-6 md:w-8 h-6 md:h-8" />
                         <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 tracking-tight italic">5. Examen Físico por Sistemas</h3>
                      </div>
                      <div className="space-y-4">
                         {[
                           { key: 'headNeck', label: 'Cabeza y Cuello' },
                           { key: 'thorax', label: 'Tórax (Cardiaco / Pulmonar)' },
                           { key: 'abdomen', label: 'Abdomen' },
                           { key: 'extremities', label: 'Extremidades' },
                           { key: 'neurological', label: 'Neurológico' },
                         ].map(system => (
                           <div key={system.key} className="space-y-2">
                             <label className="label-hc">{system.label}</label>
                             <textarea 
                               rows={2} 
                               value={formData.physicalExamSystems?.[system.key as keyof typeof formData.physicalExamSystems]} 
                               onChange={e => setFormData({
                                 ...formData, 
                                 physicalExamSystems: {
                                   ...formData.physicalExamSystems!, 
                                   [system.key]: e.target.value
                                 }
                               })} 
                               className="form-input-hc resize-none min-h-[60px]" 
                               placeholder="Hallazgos..."
                             />
                           </div>
                         ))}
                      </div>
                   </section>
                   )}

                   {/* Section: Family History */}
                   {(activeRole !== Role.MEDICINA_GENERAL || generalActiveTab === 'historial') && (
                     <section className="space-y-6 md:space-y-8 pb-8 md:pb-12 border-b border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex items-center gap-3 md:gap-4 text-brand-purple">
                        <History className="w-6 md:w-8 h-6 md:h-8" />
                        <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 tracking-tight italic">6. Antecedentes Heredo-Familiares</h3>
                     </div>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Registro de patologías en familiares de primer grado</p>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                       {[
                         { key: 'diabetes', label: 'Diabetes Mellitus' },
                         { key: 'hypertension', label: 'Hypertensión Arterial' },
                         { key: 'cardiacDisease', label: 'Cardiopatías' },
                         { key: 'neoplasias', label: 'Neoplasias (Cáncer)' },
                         { key: 'renalDisease', label: 'Enfermedades Renales' },
                         { key: 'psychiatric', label: 'Enfermedades Psiquiátricas' },
                         { key: 'rheumatoidArthritis', label: 'Artritis Reumatoide' },
                       ].map(item => (
                         <label key={item.key} className="flex items-center gap-3 p-3 md:p-4 bg-white rounded-xl md:rounded-2xl cursor-pointer hover:bg-brand-purple/5 transition-all group border-2 border-slate-100 hover:border-brand-purple/20">
                           <input type="checkbox" checked={formData.familyHistory[item.key as keyof typeof formData.familyHistory] as boolean} onChange={() => setFormData({...formData, familyHistory: {...formData.familyHistory, [item.key]: !formData.familyHistory[item.key as keyof typeof formData.familyHistory]}})} className="w-5 h-5 rounded-lg accent-brand-purple shrink-0" />
                           <span className="text-[11px] md:text-[11px] font-black text-slate-600 uppercase tracking-widest">{item.label}</span>
                         </label>
                       ))}
                     </div>
                     <div className="space-y-2">
                       <label className="label-hc">Notas Adicionales</label>
                       <textarea rows={3} value={formData.familyHistory.notes} onChange={e => setFormData({...formData, familyHistory: {...formData.familyHistory, notes: e.target.value}})} className="form-input-hc resize-none" placeholder="Especificar parentesco y detalles..." />
                     </div>
                   </section>
                   )}

                   {/* Section: Pathological */}
                   {(activeRole !== Role.MEDICINA_GENERAL || generalActiveTab === 'historial') && (
                     <section className="space-y-6 md:space-y-8 pb-8 md:pb-12 border-b border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex items-center gap-3 md:gap-4 text-brand-purple">
                        <ShieldAlert className="w-6 md:w-8 h-6 md:h-8" />
                        <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 tracking-tight italic">7. Antecedentes Personales Patológicos (APP)</h3>
                     </div>
                     
                     <div className="bg-rose-50 p-6 md:p-8 rounded-[2rem] border-2 border-rose-100 shadow-sm">
                       <div className="flex items-center gap-2 mb-4">
                         <AlertTriangle className="w-5 h-5 text-rose-500" />
                         <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest">⚠️ Alergias Diagnosticadas (Campo Crítico)</h4>
                       </div>
                       <textarea 
                         rows={2} 
                         value={formData.pathologicalHistory.allergies} 
                         onChange={e => setFormData({...formData, pathologicalHistory: { ...formData.pathologicalHistory, allergies: e.target.value }})} 
                         className="form-input-hc bg-white border-rose-200 focus:border-rose-500 text-rose-900 font-bold placeholder:text-rose-200" 
                         placeholder="Ninguna conocida..."
                       />
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                         <label className="label-hc">Enfermedades Crónico-Degenerativas</label>
                         <textarea rows={3} value={formData.pathologicalHistory.chronicDegenerative} onChange={e => setFormData({...formData, pathologicalHistory: { ...formData.pathologicalHistory, chronicDegenerative: e.target.value }})} className="form-input-hc" placeholder="Diabetes, Hipertensión, Asma, Epilepsia, etc." />
                       </div>
                       <div className="space-y-2">
                         <label className="label-hc">Historial Quirúrgico y Traumático</label>
                         <textarea rows={3} value={formData.pathologicalHistory.surgicalTraumatic} onChange={e => setFormData({...formData, pathologicalHistory: { ...formData.pathologicalHistory, surgicalTraumatic: e.target.value }})} className="form-input-hc" placeholder="Cirugías previas, fracturas o accidentes graves." />
                       </div>
                       <div className="md:col-span-2 space-y-2">
                         <label className="label-hc">Hospitalizaciones y Transfusiones</label>
                         <textarea rows={2} value={formData.pathologicalHistory.hospitalizationsTransfusions} onChange={e => setFormData({...formData, pathologicalHistory: { ...formData.pathologicalHistory, hospitalizationsTransfusions: e.target.value }})} className="form-input-hc" placeholder="Motivos, fechas y complicaciones..." />
                       </div>
                     </div>
                   </section>
                   )}

                   {/* Section: Non-Pathological */}
                   {(activeRole !== Role.MEDICINA_GENERAL || generalActiveTab === 'historial') && (
                     <section className="space-y-6 md:space-y-8 pb-8 md:pb-12 border-b border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="flex items-center gap-3 md:gap-4 text-brand-purple">
                        <Info className="w-6 md:w-8 h-6 md:h-8" />
                        <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 tracking-tight italic">8. Antecedentes Personales No Patológicos (APNP)</h3>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-6">
                         <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Hábitos de Consumo</h4>
                         <div className="space-y-4">
                           <div className="space-y-2">
                             <label className="label-hc">Tabaquismo</label>
                             <input type="text" value={formData.nonPathologicalHistory.habits.smoking} onChange={e => setFormData({...formData, nonPathologicalHistory: { ...formData.nonPathologicalHistory, habits: { ...formData.nonPathologicalHistory.habits, smoking: e.target.value } }})} className="form-input-hc" placeholder="Frecuencia/Cantidad..." />
                           </div>
                           <div className="space-y-2">
                             <label className="label-hc">Alcoholismo</label>
                             <input type="text" value={formData.nonPathologicalHistory.habits.alcohol} onChange={e => setFormData({...formData, nonPathologicalHistory: { ...formData.nonPathologicalHistory, habits: { ...formData.nonPathologicalHistory.habits, alcohol: e.target.value } }})} className="form-input-hc" placeholder="Frecuencia/Cantidad..." />
                           </div>
                           <div className="space-y-2">
                             <label className="label-hc">Otras Sustancias</label>
                             <input type="text" value={formData.nonPathologicalHistory.habits.substances} onChange={e => setFormData({...formData, nonPathologicalHistory: { ...formData.nonPathologicalHistory, habits: { ...formData.nonPathologicalHistory.habits, substances: e.target.value } }})} className="form-input-hc" placeholder="Especificar..." />
                           </div>
                         </div>
                       </div>

                       <div className="space-y-6">
                         <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Estilo de Vida</h4>
                         <div className="space-y-4">
                           <div className="space-y-2">
                             <label className="label-hc">Alimentación</label>
                             <input type="text" value={formData.nonPathologicalHistory.lifestyle.diet} onChange={e => setFormData({...formData, nonPathologicalHistory: { ...formData.nonPathologicalHistory, lifestyle: { ...formData.nonPathologicalHistory.lifestyle, diet: e.target.value } }})} className="form-input-hc" placeholder="Calidad/Frecuencia..." />
                           </div>
                           <div className="space-y-2">
                             <label className="label-hc">Actividad Física</label>
                             <input type="text" value={formData.nonPathologicalHistory.lifestyle.activity} onChange={e => setFormData({...formData, nonPathologicalHistory: { ...formData.nonPathologicalHistory, lifestyle: { ...formData.nonPathologicalHistory.lifestyle, activity: e.target.value } }})} className="form-input-hc" placeholder="Horas/Semana..." />
                           </div>
                           <div className="space-y-2">
                             <label className="label-hc">Sueño</label>
                             <input type="text" value={formData.nonPathologicalHistory.lifestyle.sleep} onChange={e => setFormData({...formData, nonPathologicalHistory: { ...formData.nonPathologicalHistory, lifestyle: { ...formData.nonPathologicalHistory.lifestyle, sleep: e.target.value } }})} className="form-input-hc" placeholder="Horas/Día..." />
                           </div>
                         </div>
                       </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                       <div className="space-y-2">
                         <label className="label-hc">Inmunizaciones (Vacunas)</label>
                         <textarea rows={2} value={formData.nonPathologicalHistory.immunizations} onChange={e => setFormData({...formData, nonPathologicalHistory: { ...formData.nonPathologicalHistory, immunizations: e.target.value }})} className="form-input-hc" placeholder="Esquema actual..." />
                       </div>
                       <div className="space-y-2">
                         <label className="label-hc">Higiene y Entorno</label>
                         <textarea rows={2} value={formData.nonPathologicalHistory.hygiene} onChange={e => setFormData({...formData, nonPathologicalHistory: { ...formData.nonPathologicalHistory, hygiene: e.target.value }})} className="form-input-hc" placeholder="Servicios básicos en vivienda/entorno..." />
                       </div>
                     </div>
                   </section>
                   )}

                   {/* Section: Gyneo-Obstetric */}
                   {formData.personalData.sex === 'Femenino' && (activeRole !== Role.MEDICINA_GENERAL || generalActiveTab === 'historial') && (
                      <section className="space-y-6 md:space-y-8 pb-8 md:pb-12 border-b border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                       <div className="flex items-center gap-3 md:gap-4 text-brand-purple">
                          <Heart className="w-6 md:w-8 h-6 md:h-8" />
                          <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 tracking-tight italic">9. Antecedentes Gineco-Obstétricos</h3>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label className="label-hc">Menarca (Edad)</label>
                            <input type="text" value={formData.gynecologicalHistory?.menarche} onChange={e => setFormData({...formData, gynecologicalHistory: { ...formData.gynecologicalHistory!, menarche: e.target.value }})} className="form-input-hc" />
                          </div>
                          <div className="space-y-2">
                            <label className="label-hc">Regularidad del Ciclo</label>
                            <select value={formData.gynecologicalHistory?.cycleRegularity} onChange={e => setFormData({...formData, gynecologicalHistory: { ...formData.gynecologicalHistory!, cycleRegularity: e.target.value }})} className="form-input-hc">
                              <option value="">Seleccionar</option>
                              <option value="Regular">Regular</option>
                              <option value="Irregular">Irregular</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="label-hc">Fecha Última Regla (FUR)</label>
                            <input type="date" value={formData.gynecologicalHistory?.lastMenstrualPeriod} onChange={e => setFormData({...formData, gynecologicalHistory: { ...formData.gynecologicalHistory!, lastMenstrualPeriod: e.target.value }})} className="form-input-hc" />
                          </div>
                       </div>
                       <div className="grid grid-cols-4 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">Gestas</label>
                            <input type="number" value={formData.gynecologicalHistory?.gpca.g} onChange={e => setFormData({...formData, gynecologicalHistory: { ...formData.gynecologicalHistory!, gpca: { ...formData.gynecologicalHistory!.gpca, g: parseInt(e.target.value) } }})} className="form-input-hc bg-white text-center" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">Partos</label>
                            <input type="number" value={formData.gynecologicalHistory?.gpca.p} onChange={e => setFormData({...formData, gynecologicalHistory: { ...formData.gynecologicalHistory!, gpca: { ...formData.gynecologicalHistory!.gpca, p: parseInt(e.target.value) } }})} className="form-input-hc bg-white text-center" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">Cesáreas</label>
                            <input type="number" value={formData.gynecologicalHistory?.gpca.c} onChange={e => setFormData({...formData, gynecologicalHistory: { ...formData.gynecologicalHistory!, gpca: { ...formData.gynecologicalHistory!.gpca, c: parseInt(e.target.value) } }})} className="form-input-hc bg-white text-center" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">Abortos</label>
                            <input type="number" value={formData.gynecologicalHistory?.gpca.a} onChange={e => setFormData({...formData, gynecologicalHistory: { ...formData.gynecologicalHistory!, gpca: { ...formData.gynecologicalHistory!.gpca, a: parseInt(e.target.value) } }})} className="form-input-hc bg-white text-center" />
                          </div>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="label-hc">Último Papanicolaou (Fecha)</label>
                            <input type="text" value={formData.gynecologicalHistory?.prevention.papanicolaou} onChange={e => setFormData({...formData, gynecologicalHistory: { ...formData.gynecologicalHistory!, prevention: { ...formData.gynecologicalHistory!.prevention, papanicolaou: e.target.value } }})} className="form-input-hc" placeholder="Mes / Año" />
                          </div>
                          <div className="space-y-2">
                            <label className="label-hc">Última Mastografía (Fecha)</label>
                            <input type="text" value={formData.gynecologicalHistory?.prevention.mammography} onChange={e => setFormData({...formData, gynecologicalHistory: { ...formData.gynecologicalHistory!, prevention: { ...formData.gynecologicalHistory!.prevention, mammography: e.target.value } }})} className="form-input-hc" placeholder="Mes / Año" />
                          </div>
                       </div>
                     </section>
                   )}

                    {/* Section: Medical Aesthetics (New) */}
                    {activeRole === Role.ESTETICA && (
                      <div className="space-y-12">
                        {/* 1. Ficha de Identificación y Filtro de Estilo de Vida */}
                        <section className="space-y-6 md:space-y-8 pb-8 md:pb-12 border-b border-slate-100">
                          <div className="flex items-center gap-3 md:gap-4 text-brand-purple">
                            <Sparkles className="w-6 md:w-8 h-6 md:h-8" />
                            <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 tracking-tight italic">Checklist: Expediente e Historial (Estética)</h3>
                          </div>

                          <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100">
                             <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 italic">1. Filtro de Contraindicaciones Críticas</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {[
                                 { key: 'pregnancy', label: '¿Embarazo o periodo de lactancia activo?' },
                                 { key: 'keloid', label: 'Historial de cicatrización queloide o hipertrófica' },
                                 { key: 'autoimmune', label: 'Enfermedades autoinmunes activas (Lupus, Esclerodermia)' },
                                 { key: 'isotretinoin', label: 'Uso reciente de isotretinoína (últimos 6 meses)' }
                               ].map(item => (
                                 <label key={item.key} className="flex items-center gap-3 p-4 bg-white rounded-2xl border-2 border-slate-100 hover:border-brand-purple/20 transition-all cursor-pointer">
                                   <input 
                                     type="checkbox" 
                                     checked={formData.aesthetics?.identification.contraindications[item.key as keyof typeof formData.aesthetics.identification.contraindications] as boolean}
                                     onChange={() => setFormData({
                                       ...formData,
                                       aesthetics: {
                                         ...formData.aesthetics!,
                                         identification: {
                                           ...formData.aesthetics!.identification,
                                           contraindications: {
                                             ...formData.aesthetics!.identification.contraindications,
                                             [item.key]: !formData.aesthetics?.identification.contraindications[item.key as keyof typeof formData.aesthetics.identification.contraindications]
                                           }
                                         }
                                       }
                                     })}
                                     className="w-5 h-5 accent-brand-purple"
                                   />
                                   <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 italic leading-tight">{item.label}</span>
                                 </label>
                               ))}
                             </div>
                             <div className="mt-4 space-y-2">
                               <label className="label-hc">Alergias (Medicamentos, anestésicos, látex, huevo...)</label>
                               <textarea 
                                 rows={2} 
                                 value={formData.aesthetics?.identification.contraindications.allergies}
                                 onChange={e => setFormData({
                                   ...formData,
                                   aesthetics: {
                                     ...formData.aesthetics!,
                                     identification: {
                                       ...formData.aesthetics!.identification,
                                       contraindications: { ...formData.aesthetics!.identification.contraindications, allergies: e.target.value }
                                     }
                                   }
                                 })}
                                 className="form-input-hc bg-white"
                                 placeholder="Especificar alergias críticas..."
                               />
                             </div>
                          </div>
                        </section>

                        {/* 2. Antecedentes dermo-cosméticos y Solicitud */}
                        <section className="space-y-6 md:space-y-8 pb-8 md:pb-12 border-b border-slate-100">
                          <h4 className="text-[10px] font-black text-brand-purple uppercase tracking-widest italic">2. Antecedentes Dermo-cosméticos</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="label-hc">Procedimientos Estéticos Previos (Sustancia y fecha)</label>
                              <textarea 
                                rows={3} 
                                value={formData.aesthetics?.history.previousProcedures}
                                onChange={e => setFormData({
                                  ...formData,
                                  aesthetics: {
                                    ...formData.aesthetics!,
                                    history: { ...formData.aesthetics!.history, previousProcedures: e.target.value }
                                  }
                                })}
                                className="form-input-hc"
                                placeholder="Rellenos, hilos, toxina, cirugías..."
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="label-hc">Rutina de Skincare Actual</label>
                              <textarea 
                                rows={3} 
                                value={formData.aesthetics?.history.skincareRoutine}
                                onChange={e => setFormData({
                                  ...formData,
                                  aesthetics: {
                                    ...formData.aesthetics!,
                                    history: { ...formData.aesthetics!.history, skincareRoutine: e.target.value }
                                  }
                                })}
                                className="form-input-hc"
                                placeholder="Retinoides, ácidos, protectores solares..."
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="label-hc">Motivo de Consulta Estética y Expectativas Reales</label>
                            <textarea 
                              rows={3} 
                              value={formData.aesthetics?.history.consultationReason}
                              onChange={e => setFormData({
                                ...formData,
                                aesthetics: {
                                  ...formData.aesthetics!,
                                  history: { ...formData.aesthetics!.history, consultationReason: e.target.value }
                                }
                              })}
                              className="form-input-hc border-brand-purple/20 bg-brand-purple/5"
                              placeholder="Zona a mejorar, flacidez, manchas, volumen..."
                            />
                          </div>
                        </section>

                        {/* 3. Exploración y Diagnóstico (Mapeo) */}
                        <section className="space-y-6 md:space-y-8 pb-8 md:pb-12 border-b border-slate-100">
                          <h4 className="text-[10px] font-black text-brand-purple uppercase tracking-widest italic">3. Exploración y Diagnóstico Estético (Mapeo)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <label className="label-hc">Fototipo Fitzpatrick (I-VI)</label>
                              <select 
                                value={formData.aesthetics?.diagnosis.fitzpatrick}
                                onChange={e => setFormData({
                                  ...formData,
                                  aesthetics: {
                                    ...formData.aesthetics!,
                                    diagnosis: { ...formData.aesthetics!.diagnosis, fitzpatrick: e.target.value }
                                  }
                                })}
                                className="form-input-hc"
                              >
                                <option value="">Seleccionar</option>
                                <option value="I">Fototipo I</option>
                                <option value="II">Fototipo II</option>
                                <option value="III">Fototipo III</option>
                                <option value="IV">Fototipo IV</option>
                                <option value="V">Fototipo V</option>
                                <option value="VI">Fototipo VI</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="label-hc">Escala de Glogau (I-IV)</label>
                              <select 
                                value={formData.aesthetics?.diagnosis.glogau}
                                onChange={e => setFormData({
                                  ...formData,
                                  aesthetics: {
                                    ...formData.aesthetics!,
                                    diagnosis: { ...formData.aesthetics!.diagnosis, glogau: e.target.value }
                                  }
                                })}
                                className="form-input-hc"
                              >
                                <option value="">Seleccionar</option>
                                <option value="I">Glogau I (Mínimo)</option>
                                <option value="II">Glogau II (Arrugas dinámicas)</option>
                                <option value="III">Glogau III (Estáticas)</option>
                                <option value="IV">Glogau IV (Severo)</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="label-hc">Tipo de Piel</label>
                              <select 
                                value={formData.aesthetics?.diagnosis.skinType}
                                onChange={e => setFormData({
                                  ...formData,
                                  aesthetics: {
                                    ...formData.aesthetics!,
                                    diagnosis: { ...formData.aesthetics!.diagnosis, skinType: e.target.value }
                                  }
                                })}
                                className="form-input-hc"
                              >
                                <option value="">Seleccionar</option>
                                <option value="Seca">Seca</option>
                                <option value="Alípica">Alípica</option>
                                <option value="Mixta">Mixta</option>
                                <option value="Grasa">Grasa</option>
                                <option value="Sensible">Sensible</option>
                              </select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="label-hc">Evaluación Lesiones / Alteraciones</label>
                            <textarea 
                              rows={3} 
                              value={formData.aesthetics?.diagnosis.lesions}
                              onChange={e => setFormData({
                                ...formData,
                                aesthetics: {
                                  ...formData.aesthetics!,
                                  diagnosis: { ...formData.aesthetics!.diagnosis, lesions: e.target.value }
                                }
                              })}
                              className="form-input-hc"
                              placeholder="Melasma, hiperpigmentaciones, flacidez, arrugas, cicatrices, telangiectasias..."
                            />
                          </div>
                        </section>

                        {/* 4. Módulo de Registro del Procedimiento */}
                        <section className="space-y-6 md:space-y-8 pb-8 md:pb-12 border-b border-slate-100">
                          <h4 className="text-[10px] font-black text-brand-purple uppercase tracking-widest italic">4. Módulo de Registro y Trazabilidad (Bitácora)</h4>
                          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Tipo de procedimiento</label>
                                <input 
                                  type="text" 
                                  value={formData.aesthetics?.procedure.type}
                                  onChange={e => setFormData({
                                    ...formData,
                                    aesthetics: {
                                      ...formData.aesthetics!,
                                      procedure: { ...formData.aesthetics!.procedure, type: e.target.value }
                                    }
                                  })}
                                  className="form-input-hc bg-slate-800 border-slate-700 text-white focus:border-brand-purple"
                                  placeholder="Ej: Toxina Botulínica, Relleno Labios..."
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Unidades o mililitros aplicados</label>
                                <input 
                                  type="text" 
                                  value={formData.aesthetics?.procedure.units}
                                  onChange={e => setFormData({
                                    ...formData,
                                    aesthetics: {
                                      ...formData.aesthetics!,
                                      procedure: { ...formData.aesthetics!.procedure, units: e.target.value }
                                    }
                                  })}
                                  className="form-input-hc bg-slate-800 border-slate-700 text-white focus:border-brand-purple"
                                  placeholder="Ej: 30 UI, 1 ml..."
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Marca</label>
                                <input type="text" value={formData.aesthetics?.procedure.brand} onChange={e => setFormData({...formData, aesthetics: {...formData.aesthetics!, procedure: {...formData.aesthetics!.procedure, brand: e.target.value}}})} className="form-input-hc bg-slate-800 border-slate-700 text-white text-xs py-2" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Laboratorio</label>
                                <input type="text" value={formData.aesthetics?.procedure.lab} onChange={e => setFormData({...formData, aesthetics: {...formData.aesthetics!, procedure: {...formData.aesthetics!.procedure, lab: e.target.value}}})} className="form-input-hc bg-slate-800 border-slate-700 text-white text-xs py-2" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Nº de Lote</label>
                                <input type="text" value={formData.aesthetics?.procedure.lotNumber} onChange={e => setFormData({...formData, aesthetics: {...formData.aesthetics!, procedure: {...formData.aesthetics!.procedure, lotNumber: e.target.value}}})} className="form-input-hc bg-slate-800 border-slate-700 text-white text-xs py-2" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Caducidad</label>
                                <input type="date" value={formData.aesthetics?.procedure.expirationDate} onChange={e => setFormData({...formData, aesthetics: {...formData.aesthetics!, procedure: {...formData.aesthetics!.procedure, expirationDate: e.target.value}}})} className="form-input-hc bg-slate-800 border-slate-700 text-white text-xs py-2" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 italic">Mapeo de Zonas Inyectadas (Coordenadas)</label>
                              <textarea 
                                rows={2} 
                                value={formData.aesthetics?.procedure.mapping}
                                onChange={e => setFormData({
                                  ...formData,
                                  aesthetics: {
                                    ...formData.aesthetics!,
                                    procedure: { ...formData.aesthetics!.procedure, mapping: e.target.value }
                                  }
                                })}
                                className="form-input-hc bg-slate-800 border-slate-700 text-white"
                                placeholder="Describir cuadrícula facial o corporal..."
                              />
                            </div>
                          </div>
                        </section>

                        {/* 5. Plan de Seguimiento */}
                        <section className="space-y-6 md:space-y-8 pb-8 md:pb-12 border-b border-slate-100">
                          <h4 className="text-[10px] font-black text-brand-purple uppercase tracking-widest italic">5. Plan de Seguimiento</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <div className="bg-brand-purple/10 p-6 rounded-2xl border border-brand-purple/20">
                                <div className="flex items-center gap-2 mb-4">
                                  <Calendar className="w-4 h-4 text-brand-purple" />
                                  <label className="text-[10px] font-black text-brand-purple uppercase tracking-widest italic">Cita de Retoque / Control (14-21 días)</label>
                                </div>
                                <input 
                                  type="date" 
                                  value={formData.aesthetics?.followUp.nextAppointment}
                                  onChange={e => setFormData({
                                    ...formData,
                                    aesthetics: {
                                      ...formData.aesthetics!,
                                      followUp: { ...formData.aesthetics!.followUp, nextAppointment: e.target.value }
                                    }
                                  })}
                                  className="form-input-hc bg-white"
                                />
                              </div>
                            </div>
                            <div className="space-y-4">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Evolución Fotográfica</p>
                              <div className="aspect-video bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-brand-purple hover:bg-brand-purple/5 transition-all cursor-pointer">
                                <Camera className="w-8 h-8 mb-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Cargar Fotos "Después"</span>
                              </div>
                            </div>
                          </div>
                        </section>
                      </div>
                    )}

                    {/* Section: Podiatry specialized tabs */}
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2 overflow-x-auto no-scrollbar">
                      {[
                        { id: 'risk', label: 'Riesgo / Filtro', icon: ShieldAlert },
                        { id: 'derm', label: 'Dermatológica', icon: Footprints },
                        { id: 'vascular', label: 'Vas/Neurológica', icon: Waves },
                        { id: 'biomechanical', label: 'Biomecánica', icon: Fingerprint }
                      ].map(tab => (
                        <button 
                          key={tab.id} 
                          onClick={() => setPodiatryActiveTab(tab.id as any)} 
                          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shrink-0 ${
                            podiatryActiveTab === tab.id 
                              ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/20' 
                              : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          <tab.icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    
                   {activeRole === Role.PODOLOGIA && (
                     <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Tab Content: Risk Filter */}
                        {podiatryActiveTab === 'risk' && (
                          <div className="space-y-8">
                            <div className="bg-rose-50 p-8 rounded-[2.5rem] border-2 border-rose-100 space-y-6">
                              <div className="flex items-center gap-3">
                                <AlertTriangle className="w-6 h-6 text-rose-500" />
                                <h4 className="text-[10px] font-black text-rose-700 uppercase tracking-widest italic">Banderas de Alerta Crítica (Filtro Inicial)</h4>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-2xl border border-rose-200 flex items-center justify-between">
                                  <span className="text-[11px] font-black uppercase tracking-tight text-slate-700 italic">¿Padece Diabetes Mellitus?</span>
                                  <div className="flex items-center gap-4">
                                     <div className="flex items-center gap-2">
                                       <input type="checkbox" checked={formData.podiatry?.exploration.riskFilter.diabetes.has} onChange={e => setFormData({...formData, podiatry: { ...formData.podiatry!, exploration: { ...formData.podiatry!.exploration, riskFilter: { ...formData.podiatry!.exploration.riskFilter, diabetes: { ...formData.podiatry!.exploration.riskFilter.diabetes, has: e.target.checked } } } } } ) } className="w-5 h-5 accent-brand-purple" />
                                       <span className="text-[10px] font-bold">SÍ</span>
                                     </div>
                                     {formData.podiatry?.exploration.riskFilter.diabetes.has && (
                                       <input type="text" placeholder="Años" value={formData.podiatry.exploration.riskFilter.diabetes.years} onChange={e => setFormData({...formData, podiatry: { ...formData.podiatry!, exploration: { ...formData.podiatry!.exploration, riskFilter: { ...formData.podiatry!.exploration.riskFilter, diabetes: { ...formData.podiatry!.exploration.riskFilter.diabetes, years: e.target.value } } } } } ) } className="w-16 p-1 border-b border-rose-200 text-[10px] outline-none font-bold" />
                                     )}
                                  </div>
                                </div>

                                <div className="bg-white p-4 rounded-2xl border border-rose-200 flex items-center justify-between">
                                  <span className="text-[11px] font-black uppercase tracking-tight text-slate-700 italic">¿Problemas circulatorios?</span>
                                  <input 
                                    type="checkbox" 
                                    checked={formData.podiatry?.exploration.riskFilter.circulatoryIssues} 
                                    onChange={e => setFormData({...formData, podiatry: { ...formData.podiatry!, exploration: { ...formData.podiatry!.exploration, riskFilter: { ...formData.podiatry!.exploration.riskFilter, circulatoryIssues: e.target.checked } } } } ) }
                                    className="w-5 h-5 accent-brand-purple" 
                                  />
                                </div>

                                <div className="bg-white p-4 rounded-2xl border border-rose-200 flex items-center justify-between md:col-span-2">
                                  <span className="text-[11px] font-black uppercase tracking-tight text-slate-700 italic">¿Toma anticoagulantes?</span>
                                  <input 
                                    type="checkbox" 
                                    checked={formData.podiatry?.exploration.riskFilter.anticoagulants} 
                                    onChange={e => setFormData({...formData, podiatry: { ...formData.podiatry!, exploration: { ...formData.podiatry!.exploration, riskFilter: { ...formData.podiatry!.exploration.riskFilter, anticoagulants: e.target.checked } } } } ) }
                                    className="w-5 h-5 accent-brand-purple" 
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                   <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-2">Alergia a Medicamentos</label>
                                   <input type="text" value={formData.podiatry?.exploration.riskFilter.allergies.meds} onChange={e => setFormData({...formData, podiatry: { ...formData.podiatry!, exploration: { ...formData.podiatry!.exploration, riskFilter: { ...formData.podiatry!.exploration.riskFilter, allergies: { ...formData.podiatry!.exploration.riskFilter.allergies, meds: e.target.value } } } } } ) } className="form-input-hc bg-white border-rose-100" />
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-2">Anestésicos Locales</label>
                                   <input type="text" value={formData.podiatry?.exploration.riskFilter.allergies.anesthetics} onChange={e => setFormData({...formData, podiatry: { ...formData.podiatry!, exploration: { ...formData.podiatry!.exploration, riskFilter: { ...formData.podiatry!.exploration.riskFilter, allergies: { ...formData.podiatry!.exploration.riskFilter.allergies, anesthetics: e.target.value } } } } } ) } className="form-input-hc bg-white border-rose-100" />
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[10px] font-black text-rose-600 uppercase tracking-widest ml-2">Antisépticos (Plata...)</label>
                                   <input type="text" value={formData.podiatry?.exploration.riskFilter.allergies.antiseptics} onChange={e => setFormData({...formData, podiatry: { ...formData.podiatry!, exploration: { ...formData.podiatry!.exploration, riskFilter: { ...formData.podiatry!.exploration.riskFilter, allergies: { ...formData.podiatry!.exploration.riskFilter.allergies, antiseptics: e.target.value } } } } } ) } className="form-input-hc bg-white border-rose-100" />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-brand-purple uppercase tracking-widest italic">Antecedentes del Miembro Inferior</h4>
                                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 grid grid-cols-1 gap-3">
                                  {[
                                    { key: 'ulcers', label: 'Historial de úlceras previas' },
                                    { key: 'amputations', label: 'Amputaciones menores' },
                                    { key: 'nailSurgery', label: 'Cirugías ungueales previas' },
                                    { key: 'gout', label: 'Tratamiento por Gota' }
                                  ].map(item => (
                                    <label key={item.key} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl cursor-pointer hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{item.label}</span>
                                      <input 
                                        type="checkbox" 
                                        checked={formData.podiatry?.exploration.footPathologicalHistory[item.key as keyof typeof formData.podiatry.exploration.footPathologicalHistory] as boolean}
                                        onChange={e => setFormData({...formData, podiatry: {...formData.podiatry!, exploration: {...formData.podiatry!.exploration, footPathologicalHistory: {...formData.podiatry!.exploration.footPathologicalHistory, [item.key]: e.target.checked}}}})}
                                        className="w-4 h-4 accent-brand-purple"
                                      />
                                    </label>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-brand-purple uppercase tracking-widest italic">Hábitos y Calzado</h4>
                                <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-4">
                                  <div className="space-y-1">
                                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Calzado predominante</label>
                                     <select value={formData.podiatry?.exploration.habits.footwearType} onChange={e => setFormData({...formData, podiatry: {...formData.podiatry!, exploration: {...formData.podiatry!.exploration, habits: {...formData.podiatry!.exploration.habits, footwearType: e.target.value}}}})} className="form-input-hc bg-white">
                                       <option value="">Seleccionar</option>
                                       <option value="Laboral">Laboral (Seguridad)</option>
                                       <option value="Deportivo">Deportivo</option>
                                       <option value="Tacones">Tacones/Estético</option>
                                       <option value="Sandalias">Sandalias/Abierto</option>
                                     </select>
                                  </div>
                                  <label className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 cursor-pointer">
                                    <input type="checkbox" checked={formData.podiatry?.exploration.habits.impactSports} onChange={e => setFormData({...formData, podiatry: {...formData.podiatry!, exploration: {...formData.podiatry!.exploration, habits: {...formData.podiatry!.exploration.habits, impactSports: e.target.checked}}}})} className="w-5 h-5 accent-brand-purple" />
                                    <span className="text-[11px] font-black uppercase tracking-tight text-slate-600 italic">Deportes de impacto</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tab Content: Dermatological */}
                        {podiatryActiveTab === 'derm' && (
                          <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {[
                                { label: 'Helomas', key: 'helomas' },
                                { label: 'Hiperqueratosis', key: 'hiperqueratosis' },
                                { label: 'Anhidrosis', key: 'anhidrosis' },
                                { label: 'Maceración', key: 'maceration' }
                              ].map(item => (
                                <label key={item.key} className="flex items-center gap-3 p-4 bg-white rounded-2xl border-2 border-slate-100 hover:border-brand-purple/20 transition-all cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={formData.podiatry?.exploration.dermatological[item.key as keyof typeof formData.podiatry.exploration.dermatological] as boolean} 
                                    onChange={() => setFormData({
                                      ...formData,
                                      podiatry: {
                                        ...formData.podiatry!,
                                        exploration: {
                                          ...formData.podiatry!.exploration,
                                          dermatological: {
                                            ...formData.podiatry!.exploration.dermatological,
                                            [item.key]: !formData.podiatry?.exploration.dermatological[item.key as keyof typeof formData.podiatry.exploration.dermatological]
                                          }
                                        }
                                      }
                                    })}
                                    className="w-5 h-5 accent-brand-purple"
                                  />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{item.label}</span>
                                </label>
                              ))}
                            </div>
                            
                            <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 space-y-4">
                               <div className="flex items-center gap-2 mb-2">
                                 <ClipboardCheck className="w-5 h-5 text-brand-purple" />
                                 <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Evaluación de uñas y piel</h4>
                               </div>
                               <textarea 
                                 rows={4} 
                                 value={formData.podiatry?.exploration.dermatological.notes}
                                 onChange={e => setFormData({
                                   ...formData,
                                   podiatry: {
                                     ...formData.podiatry!,
                                     exploration: {
                                       ...formData.podiatry!.exploration,
                                       dermatological: { ...formData.podiatry!.exploration.dermatological, notes: e.target.value }
                                     }
                                   }
                                 })}
                                 placeholder="Detallar onicopatías, onicocriptosis, estado de piel..."
                                 className="form-input-hc bg-white min-h-[120px]"
                               />
                            </div>
                          </div>
                        )}

                        {/* Tab Content: Vascular/Neurological */}
                        {podiatryActiveTab === 'vascular' && (
                          <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="bg-sky-50/50 p-8 rounded-[3rem] border border-sky-100 space-y-6">
                                <h4 className="text-[10px] font-black text-sky-600 uppercase tracking-widest flex items-center gap-2 italic">
                                  <Waves className="w-4 h-4" /> Vascular
                                </h4>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Pulsos Pedios (DER / IZQ)</label>
                                    <div className="grid grid-cols-2 gap-2">
                                      <select value={formData.podiatry?.exploration.vascular.pedalPulse.der} onChange={e => setFormData({...formData, podiatry: {...formData.podiatry!, exploration: {...formData.podiatry!.exploration, vascular: {...formData.podiatry!.exploration.vascular, pedalPulse: {...formData.podiatry!.exploration.vascular.pedalPulse, der: e.target.value as any}}}}})} className="form-input-hc bg-white text-xs">
                                        <option>Normal</option><option>Ausente</option><option>Disminuido</option>
                                      </select>
                                      <select value={formData.podiatry?.exploration.vascular.pedalPulse.izq} onChange={e => setFormData({...formData, podiatry: {...formData.podiatry!, exploration: {...formData.podiatry!.exploration, vascular: {...formData.podiatry!.exploration.vascular, pedalPulse: {...formData.podiatry!.exploration.vascular.pedalPulse, izq: e.target.value as any}}}}})} className="form-input-hc bg-white text-xs">
                                        <option>Normal</option><option>Ausente</option><option>Disminuido</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Tibiales Post (DER / IZQ)</label>
                                    <div className="grid grid-cols-2 gap-2">
                                      <select value={formData.podiatry?.exploration.vascular.tibialPulse.der} onChange={e => setFormData({...formData, podiatry: {...formData.podiatry!, exploration: {...formData.podiatry!.exploration, vascular: {...formData.podiatry!.exploration.vascular, tibialPulse: {...formData.podiatry!.exploration.vascular.tibialPulse, der: e.target.value as any}}}}})} className="form-input-hc bg-white text-xs">
                                        <option>Normal</option><option>Ausente</option><option>Disminuido</option>
                                      </select>
                                      <select value={formData.podiatry?.exploration.vascular.tibialPulse.izq} onChange={e => setFormData({...formData, podiatry: {...formData.podiatry!, exploration: {...formData.podiatry!.exploration, vascular: {...formData.podiatry!.exploration.vascular, tibialPulse: {...formData.podiatry!.exploration.vascular.tibialPulse, izq: e.target.value as any}}}}})} className="form-input-hc bg-white text-xs">
                                        <option>Normal</option><option>Ausente</option><option>Disminuido</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-emerald-50/50 p-8 rounded-[3rem] border border-emerald-100 space-y-6">
                                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 italic">
                                  <History className="w-4 h-4" /> Neurológica
                                </h4>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Monofilamento (DER / IZQ)</label>
                                    <div className="grid grid-cols-2 gap-2">
                                      <select value={formData.podiatry?.exploration.neurological.monofilament.der} onChange={e => setFormData({...formData, podiatry: {...formData.podiatry!, exploration: {...formData.podiatry!.exploration, neurological: {...formData.podiatry!.exploration.neurological, monofilament: {...formData.podiatry!.exploration.neurological.monofilament, der: e.target.value as any}}}}})} className="form-input-hc bg-white text-xs">
                                        <option>Sensible</option><option>Insensible</option>
                                      </select>
                                      <select value={formData.podiatry?.exploration.neurological.monofilament.izq} onChange={e => setFormData({...formData, podiatry: {...formData.podiatry!, exploration: {...formData.podiatry!.exploration, neurological: {...formData.podiatry!.exploration.neurological, monofilament: {...formData.podiatry!.exploration.neurological.monofilament, izq: e.target.value as any}}}}})} className="form-input-hc bg-white text-xs">
                                        <option>Sensible</option><option>Insensible</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Escala Neuropatía (0-10)</label>
                                     <input type="range" min="0" max="10" value={formData.podiatry?.exploration.neurological.neuropathyScale} onChange={e => setFormData({...formData, podiatry: {...formData.podiatry!, exploration: {...formData.podiatry!.exploration, neurological: {...formData.podiatry!.exploration.neurological, neuropathyScale: parseInt(e.target.value)}}}})} className="w-full accent-emerald-500" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tab Content: Biomechanical */}
                        {podiatryActiveTab === 'biomechanical' && (
                          <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Estática</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Pie</label>
                                    <select value={formData.podiatry?.exploration.biomechanical.static.footType} onChange={e => setFormData({...formData, podiatry: {...formData.podiatry!, exploration: {...formData.podiatry!.exploration, biomechanical: {...formData.podiatry!.exploration.biomechanical, static: {...formData.podiatry!.exploration.biomechanical.static, footType: e.target.value as any}}}}})} className="form-input-hc">
                                      <option>Normal</option><option>Plano</option><option>Cavo</option><option>Neutro</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Alineación</label>
                                    <select value={formData.podiatry?.exploration.biomechanical.static.alignment} onChange={e => setFormData({...formData, podiatry: {...formData.podiatry!, exploration: {...formData.podiatry!.exploration, biomechanical: {...formData.podiatry!.exploration.biomechanical, static: {...formData.podiatry!.exploration.biomechanical.static, alignment: e.target.value as any}}}}})} className="form-input-hc">
                                      <option>Normal</option><option>Valgo</option><option>Varo</option>
                                    </select>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-slate-900 p-8 rounded-[3rem] text-white space-y-4">
                                <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest italic">Dinámica</h4>
                                <div className="space-y-2">
                                   <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-2">Marcha</label>
                                   <textarea rows={3} value={formData.podiatry?.exploration.biomechanical.dynamic.observations} onChange={e => setFormData({...formData, podiatry: {...formData.podiatry!, exploration: {...formData.podiatry!.exploration, biomechanical: {...formData.podiatry!.exploration.biomechanical, dynamic: {...formData.podiatry!.exploration.biomechanical.dynamic, observations: e.target.value}}}}})} className="form-input-hc bg-white/5 border-white/10 text-white" />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                     </div>
                   )}

                   {/* Section: Diagnosis */}
                   {(activeRole !== Role.MEDICINA_GENERAL || generalActiveTab === 'plan') && (
                     <section className="space-y-6 md:space-y-8 pb-8 md:pb-12 border-b border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-3 md:gap-4 text-brand-purple">
                         <FileText className="w-6 md:w-8 h-6 md:h-8" />
                         <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 tracking-tight italic">9. Diagnóstico (ICD-10 / CIE-11)</h3>
                      </div>
                      <div className="space-y-4">
                         <div className="space-y-2">
                            <label className="label-hc">Buscador Predictivo</label>
                            <input 
                              type="text" 
                              placeholder="F32.9 - Trastorno depresivo..." 
                              value={formData.diagnosis.icdCode} 
                              onChange={e => setFormData({...formData, diagnosis: {...formData.diagnosis, icdCode: e.target.value}})}
                              className="form-input-hc" 
                            />
                         </div>
                      </div>
                   </section>
                   )}

                   {/* Section: Prescription Module */}
                   {(activeRole !== Role.MEDICINA_GENERAL || generalActiveTab === 'plan') && (
                     <section className="space-y-6 md:space-y-8 pb-8 md:pb-12 border-b border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                       <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 md:gap-4 text-brand-purple">
                            <Package className="w-6 md:w-8 h-6 md:h-8 shrink-0" />
                            <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 tracking-tight italic">10. Receta Médica Digital</h3>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, prescriptions: [...formData.prescriptions, { medication: '', dosage: '', frequency: '', duration: '', indications: '' }]})}
                            className="px-6 py-3 bg-brand-purple text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                          >
                            + Fármaco
                          </button>
                       </div>
                       <div className="space-y-4">
                          {formData.prescriptions.map((p, idx) => (
                            <div key={idx} className="p-6 bg-white rounded-[2rem] border-2 border-slate-100 relative group">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                     <label className="label-hc">Medicamento</label>
                                     <input type="text" value={p.medication} onChange={e => {
                                        const newP = [...formData.prescriptions];
                                        newP[idx].medication = e.target.value;
                                        setFormData({...formData, prescriptions: newP});
                                     }} className="form-input-hc" />
                                  </div>
                                  <div className="space-y-1">
                                     <label className="label-hc">Dosis / Frecuencia</label>
                                     <input type="text" value={p.dosage} onChange={e => {
                                        const newP = [...formData.prescriptions];
                                        newP[idx].dosage = e.target.value;
                                        setFormData({...formData, prescriptions: newP});
                                     }} className="form-input-hc" />
                                  </div>
                               </div>
                               <button 
                                 onClick={() => setFormData({...formData, prescriptions: formData.prescriptions.filter((_, i) => i !== idx)})}
                                 className="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                          ))}
                       </div>
                   </section>
                   )}

                    {/* 10b. Ortesis y Servicios Podológicos */}
                    {activeRole === Role.PODOLOGIA && (
                      <section className="space-y-6 md:space-y-8 pb-8 md:pb-12 border-b border-slate-100">
                        <div className="flex items-center justify-between gap-4">
                           <div className="flex items-center gap-3 md:gap-4 text-brand-purple">
                             <Package className="w-6 md:w-8 h-6 md:h-8 shrink-0" />
                             <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 tracking-tight italic">10b. Ortesis y Servicios Podológicos</h3>
                           </div>
                           <div className="flex gap-2">
                             <button 
                               type="button"
                               onClick={() => setFormData({
                                 ...formData, 
                                 podiatry: {
                                   ...formData.podiatry!,
                                   services: [...(formData.podiatry?.services || []), { type: 'Quiropodia', details: '' }]
                                 }
                               })}
                               className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap"
                             >
                               + Servicio
                             </button>
                             <button 
                               type="button"
                               onClick={() => setFormData({
                                 ...formData, 
                                 podiatry: {
                                   ...formData.podiatry!,
                                   orthotics: [...(formData.podiatry?.orthotics || []), { id: `ORTH-${Date.now()}`, patientId: formData.patientId, date: new Date().toISOString().split('T')[0], type: 'Soporte Plantar', material: 'EVA', modifications: [], notes: '', status: 'Diseño' }]
                                 }
                               })}
                               className="px-4 py-2 bg-brand-purple text-white rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap"
                             >
                               + Ortesis
                             </button>
                           </div>
                        </div>

                        <div className="space-y-6">
                           {/* Orthotics List */}
                           {(formData.podiatry?.orthotics || []).map((orth, idx) => (
                             <div key={`orth-${idx}`} className="p-6 bg-brand-purple/5 rounded-[2rem] border-2 border-brand-purple/10 relative group">
                               <p className="text-[10px] font-black text-brand-purple uppercase tracking-widest mb-4 italic">Diseño de Ortesis #{idx+1}</p>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                     <label className="label-hc">Tipo / Modelo</label>
                                     <select value={orth.type} onChange={e => {
                                        const newO = [...formData.podiatry!.orthotics!];
                                        newO[idx].type = e.target.value as any;
                                        setFormData({...formData, podiatry: {...formData.podiatry!, orthotics: newO}});
                                     }} className="form-input-hc bg-white">
                                        <option value="Soporte Plantar">Soporte Plantar</option>
                                        <option value="Órtesis de Silicona">Órtesis de Silicona</option>
                                        <option value="Descargas">Descargas</option>
                                     </select>
                                  </div>
                                  <div className="space-y-1">
                                     <label className="label-hc">Material Base</label>
                                     <select value={orth.material} onChange={e => {
                                        const newO = [...formData.podiatry!.orthotics!];
                                        newO[idx].material = e.target.value as any;
                                        setFormData({...formData, podiatry: {...formData.podiatry!, orthotics: newO}});
                                     }} className="form-input-hc bg-white">
                                        <option value="EVA">EVA</option>
                                        <option value="Resina">Resina</option>
                                        <option value="Polipropileno">Polipropileno</option>
                                        <option value="Otros">Otros</option>
                                     </select>
                                  </div>
                                  <div className="md:col-span-2 space-y-1">
                                     <label className="label-hc">Notas del Diseño</label>
                                     <textarea rows={2} value={orth.notes} onChange={e => {
                                        const newO = [...formData.podiatry!.orthotics!];
                                        newO[idx].notes = e.target.value;
                                        setFormData({...formData, podiatry: {...formData.podiatry!, orthotics: newO}});
                                     }} className="form-input-hc bg-white resize-none" />
                                  </div>
                               </div>
                               <button 
                                 onClick={() => {
                                   const newO = formData.podiatry!.orthotics!.filter((_, i) => i !== idx);
                                   setFormData({...formData, podiatry: {...formData.podiatry!, orthotics: newO}});
                                 }}
                                 className="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                             </div>
                           ))}

                           {/* Services List */}
                           {(formData.podiatry?.services || []).map((srv, idx) => (
                             <div key={`srv-${idx}`} className="p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 relative group">
                               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="md:col-span-1 space-y-1">
                                     <label className="label-hc">Tipo de Servicio</label>
                                     <select value={srv.type} onChange={e => {
                                        const newS = [...formData.podiatry!.services!];
                                        newS[idx].type = e.target.value as any;
                                        setFormData({...formData, podiatry: {...formData.podiatry!, services: newS}});
                                     }} className="form-input-hc bg-white">
                                        <option value="Quiropodia">Quiropodia</option>
                                        <option value="Cirugía Ungueal">Cirugía Ungueal</option>
                                        <option value="Valoración Biomecánica">Valoración Biomecánica</option>
                                        <option value="Ortesis">Ortesis</option>
                                     </select>
                                  </div>
                                  <div className="md:col-span-2 space-y-1">
                                     <label className="label-hc">Detalles del procedimiento</label>
                                     <input type="text" value={srv.details} onChange={e => {
                                        const newS = [...formData.podiatry!.services!];
                                        newS[idx].details = e.target.value;
                                        setFormData({...formData, podiatry: {...formData.podiatry!, services: newS}});
                                     }} className="form-input-hc bg-white" placeholder="Onicoplastia, Reconstrucción ungueal..." />
                                  </div>
                               </div>
                               <button 
                                 onClick={() => {
                                   const newS = formData.podiatry!.services!.filter((_, i) => i !== idx);
                                   setFormData({...formData, podiatry: {...formData.podiatry!, services: newS}});
                                 }}
                                 className="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                             </div>
                           ))}
                        </div>
                      </section>
                    )}

                   {/* Section: Lab Orders */}
                   {(activeRole !== Role.MEDICINA_GENERAL || generalActiveTab === 'plan') && (
                     <section className="space-y-6 md:space-y-8 pb-8 md:pb-12 border-b border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                       <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 md:gap-4 text-brand-purple">
                            <ClipboardList className="w-6 md:w-8 h-6 md:h-8 shrink-0" />
                            <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 tracking-tight italic">11. Órdenes de Laboratorio y Gabinete</h3>
                          </div>
                          <div className="flex items-center gap-2">
                             {activeRole === Role.MEDICINA_GENERAL && (
                               <button 
                                 type="button"
                                 onClick={() => {
                                   const examples: LabOrder[] = [
                                     { study: 'Biometría Hemática Completa', priority: 'Media', notes: '' },
                                     { study: 'Química Sanguínea 6 elementos', priority: 'Media', notes: '' },
                                     { study: 'Perfil Lipídico', priority: 'Baja', notes: '' },
                                     { study: 'Tele de Tórax (RX)', priority: 'Media', notes: '' },
                                     { study: 'Ultrasonido Abdominal', priority: 'Media', notes: '' }
                                   ];
                                   setFormData({...formData, labOrders: [...formData.labOrders, ...examples]});
                                 }}
                                 className="hidden md:flex px-4 py-3 bg-amber-50 text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all items-center gap-2 border border-amber-200/50"
                               >
                                 <Sparkles className="w-3 h-3" />
                                 Cargar Pruebas
                               </button>
                             )}
                             <button 
                               type="button"
                               onClick={() => setFormData({...formData, labOrders: [...formData.labOrders, { study: '', priority: 'Baja', notes: '' }]})}
                               className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                             >
                               + Solicitud
                             </button>
                          </div>
                       </div>
                       <div className="space-y-4">
                          {formData.labOrders.map((o, idx) => (
                            <div key={idx} className="p-6 bg-slate-50 rounded-[2rem] border-2 border-white relative group">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                     <label className="label-hc">Estudio</label>
                                     <input type="text" value={o.study} onChange={e => {
                                        const newO = [...formData.labOrders];
                                        newO[idx].study = e.target.value;
                                        setFormData({...formData, labOrders: newO});
                                     }} className="form-input-hc bg-white" placeholder="Ej: Sangre..." />
                                  </div>
                                  <div className="space-y-1">
                                     <label className="label-hc">Prioridad</label>
                                     <select value={o.priority} onChange={e => {
                                        const newO = [...formData.labOrders];
                                        newO[idx].priority = e.target.value as any;
                                        setFormData({...formData, labOrders: newO});
                                     }} className="form-input-hc bg-white">
                                        <option value="Baja">Baja</option>
                                        <option value="Media">Media</option>
                                        <option value="Alta">Alta</option>
                                     </select>
                                  </div>
                               </div>
                               <button 
                                 onClick={() => setFormData({...formData, labOrders: formData.labOrders.filter((_, i) => i !== idx)})}
                                 className="absolute -top-3 -right-3 w-8 h-8 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                          ))}
                       </div>
                   </section>
                   )}

                   {/* Section: Other Records */}
                   <section className="space-y-6 md:space-y-8">
                     <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 md:gap-4 text-brand-purple">
                          <Plus className="w-6 md:w-8 h-6 md:h-8 shrink-0" />
                          <h3 className="text-xl md:text-2xl font-display font-black text-slate-900 tracking-tight italic">12. Otros Registros (Insumos/Histórico)</h3>
                        </div>
                        <button 
                          onClick={() => setFormData({...formData, medications: [...formData.medications, { name: '', dosage: '', duration: '' }]})}
                          className="px-4 md:px-6 py-2.5 md:py-3 bg-brand-purple text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shrink-0"
                        >
                          Añadir
                        </button>
                     </div>
                     <div className="space-y-4">
                        {formData.medications.map((med, idx) => (
                          <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 p-5 md:p-6 bg-white rounded-[1.5rem] md:rounded-[2rem] border-2 border-slate-100 relative shadow-sm">
                            <div className="space-y-1">
                               <label className="label-hc text-[10px] ml-2">Nombre</label>
                               <input type="text" placeholder="Insumo" value={med.name} onChange={e => {
                                 const newMeds = [...formData.medications];
                                 newMeds[idx].name = e.target.value;
                                 setFormData({...formData, medications: newMeds});
                               }} className="form-input-hc" />
                            </div>
                            <div className="space-y-1">
                               <label className="label-hc text-[10px] ml-2">Detalle</label>
                               <input type="text" placeholder="Observaciones" value={med.dosage} onChange={e => {
                                 const newMeds = [...formData.medications];
                                 newMeds[idx].dosage = e.target.value;
                                 setFormData({...formData, medications: newMeds});
                               }} className="form-input-hc" />
                            </div>
                            <div className="space-y-1">
                               <label className="label-hc text-[10px] ml-2">Fecha</label>
                               <div className="flex gap-2">
                                 <input type="text" placeholder="dd/mm/aaaa" value={med.duration} onChange={e => {
                                   const newMeds = [...formData.medications];
                                   newMeds[idx].duration = e.target.value;
                                   setFormData({...formData, medications: newMeds});
                                 }} className="form-input-hc flex-1" />
                                 <button onClick={() => setFormData({...formData, medications: formData.medications.filter((_, i) => i !== idx)})} className="p-3 md:p-4 text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                   <Trash2 className="w-5 h-5" />
                                 </button>
                               </div>
                            </div>
                          </div>
                        ))}
                     </div>
                   </section>

                   <div className="flex justify-center pt-6 md:pt-10">
                     <button 
                       onClick={handleSave}
                       className="w-full max-w-md bg-brand-purple text-white py-5 md:py-6 rounded-2xl md:rounded-[2.5rem] text-sm md:text-base font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-purple/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4"
                     >
                       <Save className="w-5 md:w-6 h-5 md:h-6" />
                       Guardar Registro
                     </button>
                   </div>

                   {/* Section: Historical Records List */}
                   <div className="space-y-6 pt-12 border-t border-slate-200 mt-16">
                     <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <History className="w-6 h-6 text-brand-purple" />
                          <h3 className="text-xl font-display font-black text-slate-900 tracking-tight italic">Registros de Consultas Anteriores</h3>
                        </div>
                        <span className="px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full text-[10px] font-black uppercase tracking-widest">{records.length} Registros</span>
                     </div>
                     
                     {records.length === 0 ? (
                       <div className="p-10 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-center text-slate-400">
                         <ClipboardList className="w-8 h-8 mx-auto opacity-30 mb-2 animate-pulse" />
                         <p className="text-[10px] font-black uppercase tracking-widest">Sin Registros Guardados</p>
                         <p className="text-xs text-slate-400 mt-1 italic">Este paciente no cuenta con registros guardados aún.</p>
                       </div>
                     ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {records.map((record) => (
                           <motion.div 
                             layout
                             key={record.id}
                             className={`bg-white p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[230px] shadow-sm ${
                               formData.id === record.id 
                                 ? 'border-brand-purple ring-2 ring-brand-purple/10 bg-brand-purple/5' 
                                 : 'border-slate-200 hover:border-brand-purple/30 hover:shadow-md'
                             }`}
                           >
                             <div className="absolute top-4 right-4 flex gap-1.5 z-10">
                               <button onClick={() => generatePDF(record)} title="Descargar PDF" className="p-2 bg-brand-purple/5 text-brand-purple rounded-xl hover:bg-brand-purple hover:text-white transition-all shadow-sm"><FileDown className="w-4 h-4" /></button>
                               <button onClick={() => handleEdit(record)} title="Editar" className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"><Edit2 className="w-4 h-4" /></button>
                               <button onClick={() => handleDelete(record.id)} title="Borrar" className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                             </div>

                             <div>
                               <div className="flex items-center gap-3 mb-4">
                                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                                     <Calendar className="w-4 h-4 text-slate-400" />
                                  </div>
                                  <div className="min-w-0 pr-16 truncate">
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{record.date}</p>
                                     <h4 className="text-base font-display font-black text-slate-900 tracking-tight italic truncate">{record.recordNumber}</h4>
                                  </div>
                               </div>
                               
                               <div className="space-y-1.5 text-xs">
                                  <div className="flex justify-between items-center font-bold">
                                     <span className="text-slate-400 uppercase tracking-tighter text-[9px]">Motivo:</span>
                                     <span className="text-slate-700 truncate max-w-[150px] italic">"{record.reasonForConsultation?.reason || ''}"</span>
                                  </div>
                                  <div className="flex justify-between items-center font-bold">
                                     <span className="text-slate-400 uppercase tracking-tighter text-[9px]">Urgencia:</span>
                                     <span className={`${
                                       record.reasonForConsultation?.urgencyLevel === 'Rojo' ? 'text-rose-500' :
                                       record.reasonForConsultation?.urgencyLevel === 'Amarillo' ? 'text-amber-500' : 'text-emerald-500'
                                     }`}>{record.reasonForConsultation?.urgencyLevel || 'Verde'}</span>
                                  </div>
                               </div>
                             </div>

                             <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex -space-x-1.5">
                                   {record.vitalSigns?.temp > 38 && <div className="w-5 h-5 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-[7px] text-white font-bold" title="Fiebre">F</div>}
                                   {record.familyHistory?.diabetes && <div className="w-5 h-5 rounded-full bg-brand-purple border-2 border-white flex items-center justify-center text-[7px] text-white font-bold" title="Diabetes Familiar">D</div>}
                                </div>
                                <button onClick={() => handleEdit(record)} className="text-[9px] font-black text-brand-purple uppercase tracking-[0.2em] underline decoration-brand-purple/20">Cargar Consulta</button>
                             </div>
                           </motion.div>
                         ))}
                       </div>
                     )}
                   </div>
                 </div>
               </div>
             </motion.div>
          )}
        </AnimatePresence>
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
          color: #0f172a;
          transition: all 0.3s;
          outline: none;
        }
        .form-input-hc:hover {
          border-color: #cbd5e1;
        }
        .form-input-hc:focus {
          background: white;
          border-color: #7c3aed;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1), inset 0 2px 4px rgba(0,0,0,0.02);
        }
        .label-hc {
          display: block;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #64748b;
          margin-bottom: 0.75rem;
          margin-left: 0.5rem;
          font-style: italic;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .glow-purple {
          box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.3), 0 8px 10px -6px rgba(124, 58, 237, 0.3);
        }
      `}</style>
    </motion.div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
