/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Users, CalendarCheck, TrendingUp, Search, MoreHorizontal, FileText, ChevronRight, ChevronLeft, Package, DollarSign, Sparkles, UserRound, Plus, Image as ImageIcon, ClipboardList, Activity, Stethoscope, Trash2, ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';
import { Patient, Metric, Role, InformedConsent, ConsentClosure, PhysicalExploration, LaserConsent, TreatmentPlan } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import ClinicalRecord from './ClinicalRecord';
import PodiatryChecklistForm from './PodiatryChecklistForm';
import FinanceReport from './FinanceReport';
import InventoryManager from './InventoryManager';
import StaffManager from './StaffManager';
import PatientPortal from './PatientPortal';
import AppointmentForm from './AppointmentForm';
import ConsentForm from './ConsentForm';
import ConsentClosureForm from './ConsentClosureForm';
import PhysicalExplorationForm from './PhysicalExplorationForm';
import LaserConsentForm from './LaserConsentForm';
import TreatmentPlanForm from './TreatmentPlanForm';

const CONSENT_STORAGE_KEY = 'medical_dlis_informed_consents';
const CLOSURE_STORAGE_KEY = 'medical_dlis_consent_closures';
const EXPLORATION_STORAGE_KEY = 'medical_dlis_physical_explorations';
const LASER_CONSENT_STORAGE_KEY = 'medical_dlis_laser_consents';
const TREATMENT_PLAN_STORAGE_KEY = 'medical_dlis_treatment_plans';

const metricsData: Metric[] = [
  { label: 'Citas del día', value: 12, change: '+20%', trend: 'up', icon: 'CalendarCheck' },
  { label: 'Pacientes nuevos', value: 48, change: '+12%', trend: 'up', icon: 'Users' },
  { label: 'Ingresos Hoy', value: '$12,450', change: '+8%', trend: 'up', icon: 'TrendingUp' },
];

interface DashboardProps {
  activeRole: Role;
  activeSection: string;
  onSectionChange?: (section: string) => void;
}

export const INITIAL_PATIENTS: Patient[] = [
  { 
    id: '1', 
    name: 'Ana García López', 
    age: 28, 
    lastVisit: '12 May, 2024', 
    status: 'En Sala', 
    phone: '55-1234-5678', 
    email: 'ana.garcia@email.com',
    gender: 'Femenino',
    bloodType: 'O+',
    sessions: '3 de 10',
    service: 'Medicina Estética'
  },
  { 
    id: '2', 
    name: 'Carlos Ruiz Martínez', 
    age: 35, 
    lastVisit: '05 May, 2024', 
    status: 'Finalizado', 
    phone: '55-8765-4321', 
    email: 'carlos.ruiz@email.com',
    gender: 'Masculino',
    bloodType: 'A+',
    sessions: '8 de 12',
    service: 'Cirugía General'
  },
  { 
    id: '3', 
    name: 'Elena Rodríguez Silva', 
    age: 42, 
    lastVisit: '20 Abr, 2024', 
    status: 'Confirmado', 
    phone: '55-4433-2211', 
    email: 'elena.rodriguez@email.com',
    gender: 'Femenino',
    bloodType: 'AB-',
    sessions: '1 de 5',
    service: 'Podología'
  },
  { 
    id: '4', 
    name: 'Javier Méndez Solís', 
    age: 31, 
    lastVisit: 'Hoy', 
    status: 'En Consulta', 
    phone: '55-9988-7766', 
    email: 'javier.m@email.com',
    gender: 'Masculino',
    bloodType: 'O-',
    sessions: 'N/A',
    service: 'Medicina General'
  },
  { 
    id: '5', 
    name: 'Sofía Lara Casillo', 
    age: 24, 
    lastVisit: 'Hoy', 
    status: 'Esperando', 
    phone: '55-1122-3344', 
    email: 'sofia.lara@email.com',
    gender: 'Femenino',
    bloodType: 'B+',
    sessions: '5 de 10',
    service: 'Medicina Estética'
  },
  { 
    id: '6', 
    name: 'Roberto Gómez Vara', 
    age: 50, 
    lastVisit: 'Hoy', 
    status: 'Confirmado', 
    phone: '55-5566-7788', 
    email: 'roberto.g@email.com',
    gender: 'Masculino',
    bloodType: 'O+',
    sessions: 'N/A',
    service: 'Podología'
  },
  { 
    id: '7', 
    name: 'Marcela Quiroz', 
    age: 29, 
    lastVisit: 'Hoy', 
    status: 'En Sala', 
    phone: '55-3344-5566', 
    email: 'm.quiroz@email.com',
    gender: 'Femenino',
    bloodType: 'A-',
    sessions: '2 de 4',
    service: 'Medicina Estética'
  },
  { 
    id: '8', 
    name: 'Humberto León', 
    age: 45, 
    lastVisit: 'Ayer', 
    status: 'Finalizado', 
    phone: '55-7788-9900', 
    email: 'h.leon@email.com',
    gender: 'Masculino',
    bloodType: 'O+',
    sessions: 'N/A',
    service: 'Medicina General'
  },
  { 
    id: '9', 
    name: 'Diana Prince', 
    age: 33, 
    lastVisit: '10 May, 2024', 
    status: 'Confirmado', 
    phone: '55-1111-2222', 
    email: 'diana.p@email.com',
    gender: 'Femenino',
    bloodType: 'B-',
    sessions: 'N/A',
    service: 'Cirugía General'
  },
];

export default function Dashboard({ activeRole, activeSection, onSectionChange }: DashboardProps) {
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [clinicalRecordView, setClinicalRecordView] = useState<'list' | 'form'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFinance, setShowFinance] = useState(false);

  // Filter patients based on role and search query
  const filteredPatients = patients.filter(p => {
    const matchesRole = activeRole === Role.ESTETICA ? p.service === 'Medicina Estética' :
                        activeRole === Role.MEDICINA_GENERAL ? p.service === 'Medicina General' :
                        activeRole === Role.PODOLOGIA ? p.service === 'Podología' :
                        true;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.service.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleAddPatient = () => {
    const defaultService = activeRole === Role.ESTETICA ? 'Medicina Estética' :
                          activeRole === Role.MEDICINA_GENERAL ? 'Medicina General' :
                          activeRole === Role.PODOLOGIA ? 'Podología' : 'Medicina General';
                          
    const newPatient: Patient = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Nuevo Paciente ' + (patients.length + 1),
      lastVisit: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
      service: defaultService,
      phone: '5500000000',
      status: 'Confirmado',
      sessions: activeRole === Role.ESTETICA ? '1 de 10' : 'N/A'
    };
    setPatients([newPatient, ...patients]);
  };

  const [justSavedRecordId, setJustSavedRecordId] = useState<string | null>(null);
  const [consents, setConsents] = useState<InformedConsent[]>([]);
  const [selectedConsent, setSelectedConsent] = useState<InformedConsent | null>(null);
  
  const [laserConsents, setLaserConsents] = useState<LaserConsent[]>([]);
  const [selectedLaserConsent, setSelectedLaserConsent] = useState<LaserConsent | null>(null);
  
  const [closures, setClosures] = useState<ConsentClosure[]>([]);
  const [selectedClosure, setSelectedClosure] = useState<ConsentClosure | null>(null);
  
  const [explorations, setExplorations] = useState<PhysicalExploration[]>([]);
  const [selectedExploration, setSelectedExploration] = useState<PhysicalExploration | null>(null);

  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [selectedTreatmentPlan, setSelectedTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [selectedPatientForTreatmentPlan, setSelectedPatientForTreatmentPlan] = useState<Patient | null>(null);

  const [selectedPatientForConsent, setSelectedPatientForConsent] = useState<Patient | null>(null);
  const [selectedPatientForLaserConsent, setSelectedPatientForLaserConsent] = useState<Patient | null>(null);
  const [selectedPatientForClosure, setSelectedPatientForClosure] = useState<Patient | null>(null);
  const [selectedPatientForExploration, setSelectedPatientForExploration] = useState<Patient | null>(null);

  useEffect(() => {
    const savedConsents = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (savedConsents) setConsents(JSON.parse(savedConsents));

    const savedLaserConsents = localStorage.getItem(LASER_CONSENT_STORAGE_KEY);
    if (savedLaserConsents) setLaserConsents(JSON.parse(savedLaserConsents));
    
    const savedClosures = localStorage.getItem(CLOSURE_STORAGE_KEY);
    if (savedClosures) {
      setClosures(JSON.parse(savedClosures));
    } else {
      // Mock data for Podiatry Closures
      const mockClosures: ConsentClosure[] = [
        {
          id: 'CLO-101',
          patientId: '2',
          date: '15 May, 2024',
          patientName: 'Carlos Ruiz Martínez',
          treatmentCompleted: 'Tratamiento de Onicocriptosis en primer artejo derecho finalizado con éxito.',
          observations: 'Paciente evoluciona favorablemente. Se recomienda calzado amplio.',
          patientSignature: 'data:image/png;base64,mock',
          specialistSignature: 'data:image/png;base64,mock'
        },
        {
          id: 'CLO-102',
          patientId: '1',
          date: '10 May, 2024',
          patientName: 'Ana García López',
          treatmentCompleted: 'Quiropodia completa y remoción de helomas plantares.',
          observations: 'Piel hidratada, sin signos de infección.',
          patientSignature: 'data:image/png;base64,mock',
          specialistSignature: 'data:image/png;base64,mock'
        }
      ];
      setClosures(mockClosures);
      localStorage.setItem(CLOSURE_STORAGE_KEY, JSON.stringify(mockClosures));
    }
    
    const savedExplorations = localStorage.getItem(EXPLORATION_STORAGE_KEY);
    if (savedExplorations) {
      setExplorations(JSON.parse(savedExplorations));
    } else {
      // Mock data for Podiatry Explorations
      const mockExplorations: PhysicalExploration[] = [
        {
          id: 'EXP-501',
          patientId: '7',
          date: 'Hoy, 10:00 AM',
          visualExploration: {
            'helomas': { der: true, izq: false },
            'hiperqueratosis': { der: true, izq: true },
            'micosis': { der: false, izq: false }
          },
          otherVisualObservations: 'Lleve anhidrosis en talones.',
          footType: 'Griego',
          stepType: 'Pronación',
          manualExploration: {
            osteoarticular: { der: 'Normal', izq: 'Normal' },
            temperature: { der: 'Normal', izq: 'Normal' },
            capillaryRefill: { der: 'Normal', izq: 'Normal' },
            tibialPulse: { der: 'Normal', izq: 'Normal' },
            monofilament: { der: 'Normal', izq: 'Normal' },
            tuningFork: { der: 'Normal', izq: 'Normal' },
            reflexHammer: { der: 'Normal', izq: 'Normal' }
          },
          diagnostics: {
             biomechanical: 'Pie plano grado 1',
             dermatological: 'Hiperqueratosis submetatarsal',
             neurological: 'Sin alteraciones',
             vascular: 'Pulsos presentes y simétricos'
          },
          reference: false,
          referenceTo: '',
          therapeuticPlan: 'Quiropodia mensual y plantillas de descarga.',
          patientSignature: 'data:image/png;base64,mock',
          professionalName: 'Dr. Roberto Sánchez'
        },
        {
          id: 'EXP-502',
          patientId: '2',
          date: 'Viernes, 12 Mayo',
          visualExploration: {
            'helomas': { der: false, izq: false },
            'hiperqueratosis': { der: false, izq: false },
            'micosis': { der: true, izq: false }
          },
          otherVisualObservations: 'Onicomicosis inicial en primer artejo izquierdo.',
          footType: 'Egipcio',
          stepType: 'Neutro',
          manualExploration: {
            osteoarticular: { der: 'Normal', izq: 'Normal' },
            temperature: { der: 'Normal', izq: 'Normal' },
            capillaryRefill: { der: 'Normal', izq: 'Normal' },
            tibialPulse: { der: 'Normal', izq: 'Normal' },
            monofilament: { der: 'Normal', izq: 'Normal' },
            tuningFork: { der: 'Normal', izq: 'Normal' },
            reflexHammer: { der: 'Normal', izq: 'Normal' }
          },
          diagnostics: {
             biomechanical: 'Marcha dentro de límites normales',
             dermatological: 'Onicomicosis incipiente',
             neurological: 'Normal',
             vascular: 'Normal'
          },
          reference: false,
          referenceTo: '',
          therapeuticPlan: 'Tratamiento antimicótico tópico y control en 3 semanas.',
          patientSignature: 'data:image/png;base64,mock',
          professionalName: 'Dr. Roberto Sánchez'
        }
      ];
      setExplorations(mockExplorations);
      localStorage.setItem(EXPLORATION_STORAGE_KEY, JSON.stringify(mockExplorations));
    }

    const savedPlans = localStorage.getItem(TREATMENT_PLAN_STORAGE_KEY);
    if (savedPlans) {
      setTreatmentPlans(JSON.parse(savedPlans));
    }
  }, [activeSection]);

  const handleSaveTreatmentPlan = (plan: TreatmentPlan) => {
    const updated = [
      plan,
      ...treatmentPlans.filter(p => p.id !== plan.id)
    ];
    setTreatmentPlans(updated);
    localStorage.setItem(TREATMENT_PLAN_STORAGE_KEY, JSON.stringify(updated));
    setSelectedTreatmentPlan(null);
    setSelectedPatientForTreatmentPlan(null);
  };

  const handleDeleteTreatmentPlan = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este plan de tratamiento?')) {
      const updated = treatmentPlans.filter(p => p.id !== id);
      setTreatmentPlans(updated);
      localStorage.setItem(TREATMENT_PLAN_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const handleSaveConsent = (consent: InformedConsent) => {
    const updatedConsents = [
      consent,
      ...consents.filter(c => c.id !== consent.id)
    ];
    setConsents(updatedConsents);
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(updatedConsents));
    setSelectedConsent(null);
    setSelectedPatientForConsent(null);
  };

  const handleClinicalViewClose = () => {
    setSelectedPatient(null);
    const defaultSection = activeRole === Role.RECEPCION ? 'agenda' : 'metrics';
    onSectionChange?.(defaultSection);
  };

  const handleSaveClosure = (closure: ConsentClosure) => {
    const updated = [closure, ...closures.filter(c => c.id !== closure.id)];
    setClosures(updated);
    localStorage.setItem(CLOSURE_STORAGE_KEY, JSON.stringify(updated));
    setSelectedPatientForClosure(null);
    setSelectedClosure(null);
  };

  const handleSaveExploration = (exploration: PhysicalExploration) => {
    const updated = [exploration, ...explorations.filter(e => e.id !== exploration.id)];
    setExplorations(updated);
    localStorage.setItem(EXPLORATION_STORAGE_KEY, JSON.stringify(updated));
    setSelectedPatientForExploration(null);
    setSelectedExploration(null);
  };

  const deleteConsent = (id: string) => {
    if (confirm('¿Eliminar este consentimiento?')) {
      const updated = consents.filter(c => c.id !== id);
      setConsents(updated);
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const handleSaveLaserConsent = (consent: LaserConsent) => {
    const updated = [
      consent,
      ...laserConsents.filter(c => c.id !== consent.id)
    ];
    setLaserConsents(updated);
    localStorage.setItem(LASER_CONSENT_STORAGE_KEY, JSON.stringify(updated));
    setSelectedLaserConsent(null);
    setSelectedPatientForLaserConsent(null);
  };

  const deleteLaserConsent = (id: string) => {
    if (confirm('¿Eliminar este consentimiento de depilación láser?')) {
      const updated = laserConsents.filter(c => c.id !== id);
      setLaserConsents(updated);
      localStorage.setItem(LASER_CONSENT_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const renderLaserConsentList = () => (
    <div className="space-y-8 h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {laserConsents.length === 0 ? (
          <div className="col-span-full h-96 flex flex-col items-center justify-center text-slate-300 gap-6">
             <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center border-2 border-dashed border-slate-100">
                <Sparkles className="w-10 h-10 opacity-30 text-brand-purple" />
             </div>
             <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest">Sin Documentos</p>
                <p className="text-xs font-bold text-slate-400 mt-2 italic">Crea un consentimiento de depilación láser seleccionando un paciente.</p>
             </div>
          </div>
        ) : laserConsents.filter(c => c.patientData.fullName.toLowerCase().includes(searchQuery.toLowerCase())).map((consent, i) => (
          <motion.div
            key={consent.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-purple/30 transition-all group relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button onClick={() => deleteLaserConsent(consent.id)} className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                   <Trash2 className="w-4 h-4" />
                </button>
             </div>

             <div className="flex items-start gap-4 mb-8">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100 group-hover:bg-brand-purple group-hover:text-white transition-all">
                   <Sparkles className="w-6 h-6 text-brand-purple group-hover:text-white" />
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{consent.date}</p>
                   <h4 className="text-lg font-black text-slate-900 leading-tight italic">{consent.patientData.fullName}</h4>
                </div>
             </div>

             <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-50">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">ID Documento:</span>
                   <span className="text-[11px] font-black text-slate-800">{consent.id}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-50">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Área:</span>
                   <span className="text-[11px] font-black text-slate-800 truncate max-w-[120px]" title={consent.treatmentAreas}>{consent.treatmentAreas}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-50">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Estado:</span>
                   <span className="text-[9px] font-black px-2 py-1 bg-brand-purple text-white rounded-lg">FIRMADO LÁSER</span>
                </div>
             </div>

             <button 
               onClick={() => setSelectedLaserConsent(consent)}
               className="w-full mt-8 py-4 bg-slate-50 text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-purple hover:text-white transition-all border border-slate-100"
             >
                Ver / Exportar PDF
             </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedLaserConsent && (
          <div className="fixed inset-0 z-[300]">
             <LaserConsentForm 
               patient={patients.find(p => p.id === selectedLaserConsent.patientId) || INITIAL_PATIENTS[0]} 
               onClose={() => setSelectedLaserConsent(null)} 
               onSave={handleSaveLaserConsent}
               initialData={selectedLaserConsent}
             />
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderConsentList = () => (
    <div className="space-y-8 h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {consents.length === 0 ? (
          <div className="col-span-full h-96 flex flex-col items-center justify-center text-slate-300 gap-6">
             <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center border-2 border-dashed border-slate-100">
                <ShieldCheck className="w-10 h-10 opacity-30" />
             </div>
             <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest">Sin Documentos</p>
                <p className="text-xs font-bold text-slate-400 mt-2 italic">Crea un consentimiento desde el expediente del paciente.</p>
             </div>
          </div>
        ) : consents.filter(c => c.patientData.fullName.toLowerCase().includes(searchQuery.toLowerCase())).map((consent, i) => (
          <motion.div
            key={consent.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-purple/30 transition-all group relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button onClick={() => deleteConsent(consent.id)} className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                   <Trash2 className="w-4 h-4" />
                </button>
             </div>

             <div className="flex items-start gap-4 mb-8">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                   <FileCheck className="w-6 h-6 text-emerald-500 group-hover:text-white" />
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{consent.date}</p>
                   <h4 className="text-lg font-black text-slate-900 leading-tight italic">{consent.patientData.fullName}</h4>
                </div>
             </div>

             <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-50">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">ID Documento:</span>
                   <span className="text-[11px] font-black text-slate-800">{consent.id}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-50">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Estado:</span>
                   <span className="text-[9px] font-black px-2 py-1 bg-emerald-500 text-white rounded-lg">FIRMADO</span>
                </div>
             </div>

             <button 
               onClick={() => setSelectedConsent(consent)}
               className="w-full mt-8 py-4 bg-slate-50 text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-purple hover:text-white transition-all border border-slate-100"
             >
                Ver / Exportar PDF
             </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedConsent && (
          <div className="fixed inset-0 z-[300]">
             <ConsentForm 
               patient={patients.find(p => p.id === selectedConsent.patientId) || INITIAL_PATIENTS[0]} 
               onClose={() => setSelectedConsent(null)} 
               onSave={handleSaveConsent}
               initialData={selectedConsent}
             />
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderTreatmentPlanList = () => (
    <div className="space-y-8 h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {treatmentPlans.length === 0 ? (
          <div className="col-span-full h-96 flex flex-col items-center justify-center text-slate-300 gap-6">
             <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center border-2 border-dashed border-slate-100">
                <ClipboardList className="w-10 h-10 opacity-30 text-brand-purple" />
             </div>
             <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest">Sin Planes de Tratamiento</p>
                <p className="text-xs font-bold text-slate-400 mt-2 italic">Crea un nuevo plan seleccionando un paciente del listado general (botón "Plan").</p>
             </div>
          </div>
        ) : treatmentPlans.filter(p => p.patientData.fullName.toLowerCase().includes(searchQuery.toLowerCase())).map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-purple/30 transition-all group relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button onClick={() => handleDeleteTreatmentPlan(plan.id)} className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm pointer-events-auto z-10">
                   <Trash2 className="w-4 h-4" />
                </button>
             </div>

             <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-purple-50 rounded-[1.25rem] flex items-center justify-center border border-purple-100 group-hover:bg-brand-purple group-hover:text-white transition-all">
                   <ClipboardList className="w-6 h-6 text-brand-purple group-hover:text-white" />
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{plan.date}</p>
                   <h4 className="text-lg font-black text-slate-900 leading-tight italic">{plan.patientData.fullName}</h4>
                   <p className="text-[10px] font-bold text-brand-purple uppercase tracking-wider mt-1">{plan.totalSessions} Sesiones</p>
                </div>
             </div>

             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 mb-6 text-xs">
                <div className="flex justify-between items-center text-[10px] font-bold">
                   <span className="text-slate-400 uppercase">Responsable:</span>
                   <span className="text-slate-800 font-extrabold">{plan.responsibleProfessional}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold">
                   <span className="text-slate-400 uppercase">Validadas:</span>
                   <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase">
                     {plan.sessions.filter(s => s.signature).length} de {plan.totalSessions}
                   </span>
                </div>
                {plan.observations && (
                   <p className="text-[9px] font-medium text-slate-400 italic line-clamp-2 pt-2 border-t border-slate-100 mt-1">
                     Obs: {plan.observations}
                   </p>
                )}
             </div>

             <button 
               onClick={() => setSelectedTreatmentPlan(plan)}
               className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-purple hover:text-white transition-all shadow-md"
             >
                Ver / Editar Sesiones
             </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedTreatmentPlan && (
          <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm overflow-y-auto p-4 md:p-10">
             <div className="max-w-5xl mx-auto my-8">
                <TreatmentPlanForm 
                  patient={patients.find(p => p.id === selectedTreatmentPlan.patientId) || INITIAL_PATIENTS[0]} 
                  onClose={() => setSelectedTreatmentPlan(null)} 
                  onSave={handleSaveTreatmentPlan}
                  initialData={selectedTreatmentPlan}
                />
             </div>
          </div>
        )}

        {selectedPatientForTreatmentPlan && (
          <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm overflow-y-auto p-4 md:p-10">
             <div className="max-w-5xl mx-auto my-8">
                <TreatmentPlanForm 
                  patient={selectedPatientForTreatmentPlan} 
                  onClose={() => setSelectedPatientForTreatmentPlan(null)} 
                  onSave={handleSaveTreatmentPlan}
                />
             </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderClosureList = () => (
    <div className="space-y-8 h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {closures.length === 0 ? (
          <div className="col-span-full h-96 flex flex-col items-center justify-center text-slate-300 gap-6">
             <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center border-2 border-dashed border-slate-100">
                <CheckCircle2 className="w-10 h-10 opacity-30" />
             </div>
             <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest">Sin Cierres</p>
                <p className="text-xs font-bold text-slate-400 mt-2 italic">Finaliza tratamientos desde la tarjeta del paciente.</p>
             </div>
          </div>
        ) : closures.filter(c => c.patientName.toLowerCase().includes(searchQuery.toLowerCase())).map((closure, i) => (
          <motion.div
            key={closure.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative"
          >
             <div className="flex items-start gap-4 mb-8">
                <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100">
                   <CheckCircle2 className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{closure.date}</p>
                   <h4 className="text-lg font-black text-slate-900 italic tracking-tighter">{closure.patientName}</h4>
                </div>
             </div>
             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Tratamiento</p>
                <p className="text-xs font-bold text-slate-700 leading-relaxed truncate">{closure.treatmentCompleted}</p>
             </div>
             <button 
               onClick={() => setSelectedClosure(closure)}
               className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-purple transition-all"
             >
                Ver Cierre / PDF
             </button>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {selectedClosure && (
          <div className="fixed inset-0 z-[300]">
            <ConsentClosureForm 
              patient={patients.find(p => p.id === selectedClosure.patientId) || INITIAL_PATIENTS[0]} 
              onClose={() => setSelectedClosure(null)} 
              onSave={handleSaveClosure}
              initialData={selectedClosure}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderExplorationList = () => (
    <div className="space-y-8 h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {explorations.length === 0 ? (
          <div className="col-span-full h-96 flex flex-col items-center justify-center text-slate-300 gap-6">
             <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center border-2 border-dashed border-slate-100">
                <Activity className="w-10 h-10 opacity-30" />
             </div>
             <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-widest">Sin Exploraciones</p>
                <p className="text-xs font-bold text-slate-400 mt-2 italic">Realiza exploraciones físicas desde la tarjeta del paciente.</p>
             </div>
          </div>
        ) : explorations.filter(e => {
            const p = patients.find(p => p.id === e.patientId);
            return p?.name.toLowerCase().includes(searchQuery.toLowerCase());
          }).map((exploration, i) => {
          const patient = patients.find(p => p.id === exploration.patientId);
          return (
            <motion.div
              key={exploration.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative"
            >
               <div className="flex items-start gap-4 mb-8">
                  <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center border border-sky-100">
                     <Activity className="w-6 h-6 text-sky-500" />
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{exploration.date}</p>
                     <h4 className="text-lg font-black text-slate-900 italic tracking-tighter">{patient?.name || 'Paciente ID: ' + exploration.patientId}</h4>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                     <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Diagnóstico</p>
                     <p className="text-[10px] font-bold text-slate-700 truncate">{exploration.diagnostics.biomechanical || 'Biomecánico'}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                     <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Tipo de Pie</p>
                     <p className="text-[10px] font-bold text-slate-700">{exploration.footType}</p>
                  </div>
               </div>
               <button 
                 onClick={() => setSelectedExploration(exploration)}
                 className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all border border-slate-100"
               >
                  Ver Exploración
               </button>
            </motion.div>
          );
        })}
      </div>
      <AnimatePresence>
        {selectedExploration && (
          <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm overflow-hidden flex flex-col">
            <PhysicalExplorationForm 
              patient={patients.find(p => p.id === selectedExploration.patientId) || INITIAL_PATIENTS[0]} 
              onClose={() => setSelectedExploration(null)} 
              onSave={handleSaveExploration}
              initialData={selectedExploration}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  if (activeRole === Role.PACIENTE) {
    return <PatientPortal activeSection={activeSection} />;
  }

  // --- RENDER HELPERS BY SECTION ---

  const renderPodiatrySpecializedDashboard = () => (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Specialized Agenda */}
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-display font-black text-slate-900 tracking-tight leading-none italic">Agenda de <span className="text-brand-purple">Procedimientos.</span></h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Diferenciación visual por tipo de servicio</p>
              </div>
              <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                <button className="px-5 py-2 bg-white rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm border border-slate-200/50">Hoy</button>
                <button className="px-5 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400">Semana</button>
               </div>
            </div>

            <div className="space-y-4">
              {[
                { time: '09:00', patient: 'Ana Soto', type: 'Valoración', color: 'bg-emerald-500', icon: Stethoscope },
                { time: '10:30', patient: 'Luis Rivas', type: 'Quiropodia Corta', color: 'bg-brand-purple', icon: Activity },
                { time: '12:00', patient: 'Elena Gil', type: 'Cirugía Ungueal', color: 'bg-rose-500', icon: Plus },
                { time: '14:00', patient: 'Marco Polo', type: 'Quiropodia', color: 'bg-brand-purple', icon: Activity },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-6 p-6 rounded-[2rem] border-2 border-slate-50 hover:border-slate-100 transition-all group">
                  <div className="w-16 shrink-0 text-center">
                    <p className="text-sm font-black text-slate-900">{item.time}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AM</p>
                  </div>
                  <div className={`w-1 h-12 rounded-full ${item.color} opacity-40 group-hover:opacity-100 transition-opacity`}></div>
                  <div className="flex-1">
                    <h4 className="text-base font-black text-slate-900">{item.patient}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <item.icon className="w-3 h-3 text-slate-400" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.type}</p>
                    </div>
                  </div>
                  <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Insumos status per cubicle */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-brand-purple rounded-full blur-3xl opacity-20"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <Package className="w-5 h-5 text-brand-purple" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Estatus de Insumos</h3>
              </div>
              <div className="space-y-6">
                {[
                  { cubicle: 'Cubículo 1', status: 'Surtido', items: ['Material estéril (12 kit)', 'Gasas (40)', 'Alcohol (1L)'], color: 'text-emerald-400' },
                  { cubicle: 'Cubículo 2', status: 'Bajo', items: ['Material estéril (2 kit)', 'Jabón Quirúrgico (200ml)'], color: 'text-amber-400' },
                  { cubicle: 'Cubículo 3', status: 'Surtido', items: ['Material estéril (10 kit)', 'Anestesia (5 amp)'], color: 'text-emerald-400' },
                ].map((cub, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-black uppercase tracking-widest">{cub.cubicle}</p>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-white/10 ${cub.color}`}>{cub.status}</span>
                    </div>
                    <div className="space-y-1.5 opacity-50">
                      {cub.items.map((it, i) => (
                        <p key={i} className="text-[9px] font-medium flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-slate-500"></span> {it}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-4 bg-white/10 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/5 hover:bg-brand-purple transition-all">
                Control de Material Estéril
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-10">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Egresos Caja', value: '$8,240', icon: DollarSign, trend: 'Sincronizado', color: 'from-slate-800 to-slate-900' },
          { label: 'Pacientes Nuevos', value: '128', icon: Users, trend: '+5%', color: 'from-brand-purple to-purple-600' },
          { label: 'Stock Alarma', value: '3 Items', icon: Package, trend: 'Revisar', color: 'from-rose-500 to-rose-600' },
          { label: 'Citas Hoy', value: '14', icon: CalendarCheck, trend: '90% Ocup.', color: 'from-sky-500 to-sky-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 rounded-[2.5rem] bg-gradient-to-br ${stat.color} text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform`}
          >
            <stat.icon className="absolute right-[-5%] bottom-[-5%] w-24 h-24 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-60 mb-2">{stat.label}</p>
            <h4 className="text-3xl font-black mb-3">{stat.value}</h4>
            <div className="flex items-center gap-2">
               <span className="text-[9px] font-black bg-white/10 p-1 px-2 rounded-lg border border-white/5">{stat.trend}</span>
            </div>
          </motion.div>
        ))}
      </section>

      <section className="dashboard-card border-none shadow-sm p-8 bg-white/50 border border-white">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-2xl font-display font-black text-slate-900 tracking-tight">Rendimiento Operativo</h3>
           <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
              <TrendingUp className="w-5 h-5" />
           </div>
        </div>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-[2.5rem] text-slate-400 bg-slate-50/30">
           <p className="text-[10px] font-black uppercase tracking-widest text-center">Inyectando datos de analítica clínica...<br/><span className="text-brand-purple">Sincronizado con Stripe API</span></p>
        </div>
      </section>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-4">
        <div>
          <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight leading-none italic">Stock & <span className="text-brand-purple">Logística.</span></h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Suministros médicos y consumibles</p>
        </div>
        <button className="p-5 bg-brand-purple text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-purple/20 hover:translate-y-[-2px] transition-all">
          Surtir Pedido
        </button>
      </div>
      <InventoryManager />
    </div>
  );

  const renderStaff = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-4">
        <div>
          <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight leading-none italic">Team <span className="text-brand-purple">Medical.</span></h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Colaboradores y Horarios</p>
        </div>
      </div>
      <StaffManager />
    </div>
  );

  const renderAgenda = () => {
    const [viewDate, setViewDate] = useState(new Date());
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    // Simple logic to get days of current month for the calendar
    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const daysCount = new Date(year, month + 1, 0).getDate();
      return { firstDay, daysCount };
    };

    const { firstDay, daysCount } = getDaysInMonth(viewDate);
    const calendarDays = Array.from({ length: 42 }, (_, i) => {
      const day = i - firstDay + 1;
      return day > 0 && day <= daysCount ? day : null;
    });

    return (
      <div className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Calendar & Summary */}
          <div className="lg:col-span-8 space-y-8">
            <section className="dashboard-card border-none shadow-sm p-10 bg-white/50 border border-white rounded-[3rem]">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h3 className="text-2xl font-display font-black text-slate-900 tracking-tight leading-none italic">
                    Calendario <span className="text-brand-purple">Médico.</span>
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 px-1">Vista Mensual / Gestión de Horarios</p>
                </div>
                <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-2xl border border-slate-200/50 shadow-inner">
                  <button 
                    onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1))}
                    className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-900"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 min-w-32 text-center">
                    {viewDate.toLocaleString('es-MX', { month: 'long', year: 'numeric' })}
                  </span>
                  <button 
                    onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1))}
                    className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-slate-900"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-[2rem] overflow-hidden border border-slate-100">
                {days.map(d => (
                  <div key={d} className="bg-slate-50 py-4 text-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{d}</span>
                  </div>
                ))}
                {calendarDays.map((d, i) => (
                  <div key={i} className={`bg-white min-h-[100px] p-4 relative group hover:bg-slate-50/50 transition-colors ${d === null ? 'bg-slate-50/20' : ''}`}>
                    {d && (
                      <>
                        <span className={`text-xs font-black ${d === new Date().getDate() && viewDate.getMonth() === new Date().getMonth() ? 'bg-brand-purple text-white w-6 h-6 flex items-center justify-center rounded-lg shadow-lg shadow-brand-purple/20' : 'text-slate-400'}`}>
                          {d}
                        </span>
                        {/* Dot indicators for appointments (simulated) */}
                        {d % 3 === 0 && d < 20 && (
                          <div className="mt-2 space-y-1">
                            <div className="h-1.5 w-full rounded-full bg-brand-purple/20"></div>
                            <div className="h-1.5 w-2/3 rounded-full bg-emerald-400/20"></div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Appointment List Below */}
            <section className="dashboard-card border-none shadow-sm p-10 bg-white/50 border border-white rounded-[3rem]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-display font-black text-slate-900 tracking-tight">Citas Programadas</h3>
                <div className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hoy: {filteredPatients.length}</div>
              </div>
              <div className="space-y-4">
                {filteredPatients.map((p, i) => (
                  <div key={p.id} className="group p-6 bg-white border border-slate-100 rounded-[2.5rem] flex items-center justify-between hover:border-brand-purple/20 hover:shadow-xl transition-all cursor-pointer">
                    <div className="flex items-center gap-8">
                      <div className="text-right w-16">
                        <p className="text-sm font-black text-slate-900">{8+i}:00</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">AM</p>
                      </div>
                      <div className="w-px h-10 bg-slate-100 group-hover:bg-brand-purple/20 transition-colors"></div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 italic">{p.name}</h4>
                        <p className="text-[9px] font-black text-brand-purple uppercase tracking-widest mt-1">{p.service}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${p.status === 'Finalizado' ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-500 border border-emerald-100'}`}>
                         {p.status || 'Confirmado'}
                       </span>
                       <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-purple group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Form & Stats */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-10">
              <AppointmentForm activeRole={activeRole} />
              
              <div className="mt-8">
                <section className="p-10 bg-slate-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-brand-purple rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                   <div className="relative z-10">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 text-center">Resumen Financiero</p>
                      <h4 className="text-4xl font-black mb-1 italic tracking-tighter text-center">$12,450</h4>
                      <p className="text-[9px] font-bold text-brand-purple uppercase tracking-[0.2em] mb-12 text-center">Recaudación Diaria</p>
                      
                      <div className="space-y-5 mb-12">
                         <div className="flex justify-between items-center group/item hover:translate-x-1 transition-transform">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Servicios Realizados</span>
                            <span className="text-xs font-black text-white">{filteredPatients.length}</span>
                         </div>
                         <div className="flex justify-between items-center group/item hover:translate-x-1 transition-transform">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pendiente de Pago</span>
                            <span className="text-xs font-black text-white">$3,950</span>
                         </div>
                      </div>

                      <button className="w-full py-5 bg-brand-purple rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-purple-dark transition-all shadow-xl shadow-brand-purple/20 hover:scale-[1.02] active:scale-95 text-center">
                         Cerrar Turno / Caja
                      </button>
                   </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLabOrdersSummary = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { id: 'LAB-542', patient: 'Ana García López', study: 'Química Sanguínea 35 elementos', date: 'Hoy, 09:30 AM', status: 'Pendiente', priority: 'Alta', color: 'bg-amber-500' },
          { id: 'LAB-541', patient: 'Carlos Ruiz Martínez', study: 'Ultrasonido Abdominal', date: '18 May, 2024', status: 'Interpretado', priority: 'Media', color: 'bg-emerald-500' },
          { id: 'LAB-540', patient: 'Elena Rodríguez Silva', study: 'Examen General de Orina', date: '17 May, 2024', status: 'En Proceso', priority: 'Baja', color: 'bg-sky-500' },
          { id: 'LAB-539', patient: 'Javier Méndez Solís', study: 'Perfil Lipídico', date: 'Hoy, 10:15 AM', status: 'Pendiente', priority: 'Alta', color: 'bg-amber-500' },
          { id: 'LAB-538', patient: 'Sofía Lara Casillo', study: 'Biometría Hemática', date: '16 May, 2024', status: 'Finalizado', priority: 'Normal', color: 'bg-emerald-500' },
          { id: 'LAB-537', patient: 'Roberto Gómez Vara', study: 'Radiografía de Tórax', date: 'Hoy, 08:00 AM', status: 'Urgente', priority: 'Crítica', color: 'bg-rose-500' },
          { id: 'LAB-536', patient: 'Marcela Quiroz', study: 'Perfil Tiroideo', date: '15 May, 2024', status: 'Finalizado', priority: 'Normal', color: 'bg-emerald-500' },
          { id: 'LAB-535', patient: 'Humberto León', study: 'Hemoglobina Glicosilada', date: 'Hace 4 horas', status: 'Pendiente', priority: 'Media', color: 'bg-amber-500' },
        ].map((lab, i) => (
          <motion.div
            key={lab.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-brand-purple/20 transition-all group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[8px] font-black uppercase tracking-widest">{lab.id}</div>
              <div className={`w-2 h-2 rounded-full ${lab.color} animate-pulse`}></div>
            </div>
            <h4 className="text-sm font-black text-slate-900 mb-1 italic">{lab.patient}</h4>
            <p className="text-[11px] font-bold text-brand-purple uppercase tracking-tight mb-4">{lab.study}</p>
            <div className="space-y-3">
               <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estado:</span>
                  <span className="text-[9px] font-black text-slate-900 uppercase">{lab.status}</span>
               </div>
               <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Prioridad:</span>
                  <span className="text-[9px] font-black text-slate-900 uppercase">{lab.priority}</span>
               </div>
            </div>
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-6 text-center italic">{lab.date}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'photos': return { title: 'Seguimiento', highlight: 'Fotográfico.', sub: 'Galería de evolución por paciente' };
      case 'consent': return { title: 'Consentimientos', highlight: 'Tratamiento Podológico.', sub: 'Gestión de firmas y documentos legales de podología' };
      case 'laser_consent': return { title: 'Consentimientos', highlight: 'Depilación Láser.', sub: 'Firma y registro de consentimiento para depilación láser' };
      case 'treatment_plan': return { title: 'Planes de', highlight: 'Tratamiento.', sub: 'Planificación de sesiones y rúbrica de seguimiento por paciente' };
      case 'closures': return { title: 'Cierres de', highlight: 'Consentimiento.', sub: 'Finalización de tratamientos podológicos' };
      case 'records': return { title: 'Historiales', highlight: 'Clínicos.', sub: 'Consulta, diagnóstico y evolución médica del paciente' };
      case 'explorations': return { title: 'Exploraciones', highlight: 'Físicas Visuales.', sub: 'Evaluación de padecimientos identificados bilaterales' };
      case 'recipe': return { title: 'Recetarios', highlight: 'Digitales.', sub: 'Control de prescripciones y recomendaciones' };
      case 'cabin': return { title: 'Fichas de', highlight: 'Cabina.', sub: 'Parámetros técnicos y evolución estética' };
      case 'sessions': return { title: 'Control de', highlight: 'Sesiones.', sub: 'Paquetes y tratamientos activos' };
      case 'lab': return { title: 'Órdenes de', highlight: 'Laboratorio.', sub: 'Gestión y seguimiento de estudios clínicos y gabinete' };
      default: return { title: 'Control de', highlight: 'Expedientes.', sub: 'Historial clínico y seguimiento activo' };
    }
  };

  const sectionInfo = getSectionTitle();

  const renderRegistration = () => {
    return (
      <div className="space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-4">
          <div>
            <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight leading-none italic">
              Registro de <span className="text-brand-purple">Pacientes.</span>
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-3">
              Datos de entrega y gestión
            </p>
          </div>
          <button onClick={handleAddPatient} className="px-6 py-3 bg-brand-purple text-white rounded-2xl font-black text-xs shadow-lg shadow-brand-purple/20 hover:scale-[1.02] transition-transform">
            Simular Nuevo Registro
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-display font-black text-slate-900 mb-6">Simulador de Entrega de Datos</h3>
            <p className="text-xs text-slate-500 mb-8">Activa este formulario para simular la función de entrega de resultados, recetas o expedientes al paciente por parte del área de recepción.</p>
            
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Datos de entrega registrados exitosamente en el sistema.") }}>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Paciente Destinatario</label>
                <select className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-purple">
                  <option value="">Seleccionar Paciente</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tipo de Entrega</label>
                  <select className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-purple">
                    <option>Resultados Laboratorio</option>
                    <option>Receta Médica Impresa</option>
                    <option>Kit Post-Tratamiento</option>
                    <option>Resumen Clínico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rol Responsable</label>
                  <select className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-purple">
                    <option>Recepción / Frente</option>
                    <option>Asistente Médico</option>
                    <option>Personal de Enfermería</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notas u Observaciones (Función Simulada)</label>
                <textarea rows={3} placeholder="Instrucciones dadas al paciente..." className="w-full p-4 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-brand-purple transition-all"></textarea>
              </div>

              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-purple transition-all shadow-xl">
                Activar Función de Entrega
              </button>
            </form>
          </section>

          <section className="bg-slate-50 border border-slate-100 rounded-[3rem] p-8">
            <h3 className="text-xl font-display font-black text-slate-900 mb-6">Registro Activo</h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {patients.map((p, i) => (
                <div key={p.id} className="p-5 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-between group">
                   <div>
                     <h4 className="text-sm font-black text-slate-900">{p.name}</h4>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.service}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-xs font-black text-brand-purple">{p.status || 'Activo'}</p>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.lastVisit}</p>
                   </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  };

  const renderClinicalView = () => (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-4 mt-4">
        <div>
          <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight leading-none italic">
            {sectionInfo.title} <span className="text-brand-purple">{sectionInfo.highlight}</span>
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-3">
            {sectionInfo.sub}
          </p>
        </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleAddPatient}
              className="hidden sm:flex bg-brand-purple text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest items-center gap-2 hover:bg-brand-purple-dark transition-all shadow-xl shadow-brand-purple/20"
            >
              <Users className="w-4 h-4" />
              Nuevo Paciente
            </button>
            <div className="relative group">
              <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-purple" />
              <input 
                type="text" 
                placeholder="Buscar por nombre o servicio..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 pr-8 py-5 bg-white border-2 border-slate-200 rounded-[2rem] text-xs font-bold w-full md:w-96 shadow-sm outline-none focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/5 transition-all" 
              />
            </div>
          </div>
      </header>

      {activeSection === 'photos' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {filteredPatients.map((p, i) => (
             <motion.div
               key={p.id}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.1 }}
               onClick={() => { setSelectedPatient(p); setClinicalRecordView('list'); }}
               className="dashboard-card group cursor-pointer hover:border-brand-purple/40"
             >
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-brand-purple">
                      {p.name[0]}
                   </div>
                   <div>
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-brand-purple">{p.name}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.service}</p>
                   </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                   {[1,2,3].map(j => (
                     <div key={j} className="aspect-square bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                        <ImageIcon className="w-4 h-4 text-slate-200" />
                     </div>
                   ))}
                </div>
                <div className="mt-6 flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">3 Archivos</span>
                   <span className="text-[9px] font-black text-brand-purple uppercase tracking-widest">Ver Todo</span>
                </div>
             </motion.div>
           ))}
        </div>
      ) : activeSection === 'lab' ? (
        renderLabOrdersSummary()
      ) : activeSection === 'consent' ? (
        renderConsentList()
      ) : activeSection === 'laser_consent' ? (
        renderLaserConsentList()
      ) : activeSection === 'treatment_plan' ? (
        renderTreatmentPlanList()
      ) : activeSection === 'closures' ? (
        renderClosureList()
      ) : activeSection === 'explorations' ? (
        renderExplorationList()
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredPatients.map((patient, i) => (
            <motion.div 
              key={patient.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => {
                setSelectedPatient(patient);
                setClinicalRecordView('list');
              }}
              className="group p-5 sm:p-6 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col items-stretch cursor-pointer hover:border-brand-purple/40 hover:shadow-2xl transition-all duration-500"
            >
              <div className="flex items-center gap-4 sm:gap-8 mb-6">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl flex items-center justify-center font-black text-brand-purple text-lg sm:text-xl shadow-inner group-hover:bg-brand-purple group-hover:text-white transition-all transform group-hover:rotate-[-8deg] duration-500">
                    {patient.name[0]}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-brand-purple transition-colors mb-1 truncate">{patient.name}</h4>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <span className="text-[10px] font-black bg-slate-50 text-slate-500 p-1 px-2.5 rounded-lg uppercase tracking-widest">{patient.service}</span>
                    <span className="hidden sm:inline w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="text-[10px] text-brand-purple font-black uppercase tracking-widest whitespace-nowrap">{patient.lastVisit}</span>
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end shrink-0">
                  <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1 italic">Estatus</p>
                  <div className="px-3 py-1 bg-slate-950 text-white rounded-xl text-[11px] font-black uppercase tracking-widest border border-white/5">{patient.status || 'Activo'}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 xs:grid-cols-4 sm:flex items-center gap-2 sm:gap-3">
                {(activeRole === Role.MEDICINA_GENERAL || activeRole === Role.PODOLOGIA) ? (
                  <>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPatientForConsent(patient);
                      }}
                      className="flex-1 sm:flex-none p-3 sm:p-4 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl sm:rounded-2xl hover:bg-emerald-500 hover:text-white transition-all flex flex-col items-center gap-1 group/btn"
                    >
                      <ShieldCheck className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-tighter">Consentir</span>
                    </button>

                    {activeRole === Role.PODOLOGIA && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPatientForLaserConsent(patient);
                        }}
                        className="flex-1 sm:flex-none p-3 sm:p-4 bg-purple-50 text-brand-purple border border-purple-100 rounded-xl sm:rounded-2xl hover:bg-brand-purple hover:text-white transition-all flex flex-col items-center gap-1 group/btn"
                      >
                        <Sparkles className="w-5 h-5 group-hover/btn:scale-110 transition-transform text-brand-purple" />
                        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-tighter">Láser</span>
                      </button>
                    )}

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPatientForClosure(patient);
                      }}
                      className="flex-1 sm:flex-none p-3 sm:p-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl sm:rounded-2xl hover:bg-rose-500 hover:text-white transition-all flex flex-col items-center gap-1 group/btn"
                    >
                      <CheckCircle2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-tighter">Cierre</span>
                    </button>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPatientForExploration(patient);
                      }}
                      className="flex-1 sm:flex-none p-3 sm:p-4 bg-sky-50 text-sky-600 border border-sky-100 rounded-xl sm:rounded-2xl hover:bg-sky-500 hover:text-white transition-all flex flex-col items-center gap-1 group/btn"
                    >
                      <Activity className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-tighter">Explorar</span>
                    </button>

                    {activeRole === Role.PODOLOGIA && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPatientForTreatmentPlan(patient);
                        }}
                        className="flex-1 sm:flex-none p-3 sm:p-4 bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100 rounded-xl sm:rounded-2xl hover:bg-fuchsia-500 hover:text-white transition-all flex flex-col items-center gap-1 group/btn"
                      >
                        <ClipboardList className="w-5 h-5 group-hover/btn:scale-110 transition-transform text-fuchsia-600" />
                        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-tighter">Plan</span>
                      </button>
                    )}

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPatient(patient);
                        setClinicalRecordView('form');
                      }}
                      className="flex-1 sm:flex-none p-3 sm:p-4 bg-brand-purple text-white shadow-lg shadow-brand-purple/20 rounded-xl sm:rounded-2xl hover:scale-105 active:scale-95 transition-all flex flex-col items-center gap-1"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-tighter">Historia</span>
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPatient(patient);
                      setClinicalRecordView('list');
                    }}
                    className="flex-1 sm:flex-none py-3.5 px-6 bg-brand-purple text-white shadow-lg shadow-brand-purple/20 rounded-xl sm:rounded-2xl hover:scale-[1.03] active:scale-[0.97] transition-all flex flex-row items-center justify-center gap-2 group/btn"
                  >
                    <ClipboardList className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-none">Historia Clínica</span>
                  </button>
                )}
                
                <div className="hidden xs:flex flex-1 sm:flex-none p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl text-slate-300 group-hover:bg-brand-purple/10 group-hover:text-brand-purple transition-all duration-500 border border-slate-100 group-hover:border-brand-purple/20 items-center justify-center">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBoxView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
       <div className="lg:col-span-4 space-y-8">
          <section className="p-10 bg-brand-purple rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
             <DollarSign className="absolute right-[-10%] top-[-10%] w-48 h-48 opacity-10" />
             <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Ingresos del Turno</p>
                <h4 className="text-5xl font-black italic">$4,860</h4>
                <div className="h-px bg-white/20 my-8"></div>
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                      <span>Efectivo</span>
                      <span>$2,450</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                      <span>Tarjeta</span>
                      <span>$2,410</span>
                   </div>
                </div>
                <button className="w-full py-5 bg-white text-brand-purple rounded-2xl text-[10px] font-black uppercase tracking-widest mt-12 shadow-xl hover:scale-[1.02] transition-all">
                   Cierre de Caja
                </button>
             </div>
          </section>
       </div>
       <div className="lg:col-span-8">
          <section className="dashboard-card border-none shadow-sm p-10">
             <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-display font-black text-slate-900 tracking-tight">Ventas Recientes</h3>
                <button className="p-4 bg-slate-50 text-brand-purple rounded-2xl text-[10px] font-black uppercase tracking-widest">Reporte PDF</button>
             </div>
             <div className="space-y-4">
                {[
                  { id: 'V-001', client: 'Beatriz Solis', amount: '$1,200', method: 'Tarjeta', status: 'Pagado' },
                  { id: 'V-002', client: 'Héctor Moreno', amount: '$850', method: 'Efectivo', status: 'Pagado' },
                  { id: 'V-003', client: 'Carla Ruiz', amount: '$2,810', method: 'Tarjeta', status: 'Pagado' },
                  { id: 'V-004', client: 'Juan Pérez', amount: '$450', method: 'Efectivo', status: 'Pagado' },
                  { id: 'V-005', client: 'Marcela Quiroz', amount: '$1,500', method: 'Transferencia', status: 'Pagado' },
                  { id: 'V-006', client: 'Humberto León', amount: '$750', method: 'Efectivo', status: 'Pendiente' },
                ].map((v, i) => (
                  <div key={v.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200">
                           <DollarSign className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{v.id}</p>
                           <h4 className="text-sm font-black text-slate-900">{v.client}</h4>
                        </div>
                     </div>
                     <div className="flex items-center gap-8">
                        <div className="text-right">
                           <p className="text-sm font-black text-slate-900">{v.amount}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{v.method}</p>
                        </div>
                        <div className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                           {v.status}
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </section>
       </div>
    </div>
  );

  const renderMedicalDashboard = () => {
    const medicalAgenda = [
      { id: '1', name: 'Ana García López', time: '09:00', status: 'En espera', urgency: 'Verde', reason: 'Control Hipertensión' },
      { id: '2', name: 'Carlos Ruiz Martínez', time: '09:30', status: 'En consulta', urgency: 'Amarillo', reason: 'Dolor Abdominal' },
      { id: '3', name: 'Elena Rodríguez Silva', time: '10:00', status: 'Pendiente', urgency: 'Verde', reason: 'Revisión Resultados' },
      { id: '4', name: 'Miguel Angel Sosa', time: '10:30', status: 'Prioridad', urgency: 'Rojo', reason: 'Dificultad Respiratoria' },
      { id: '5', name: 'Javier Méndez Solís', time: '11:00', status: 'Pendiente', urgency: 'Amarillo', reason: 'Consulta General' },
      { id: '6', name: 'Sofía Lara Casillo', time: '11:30', status: 'En espera', urgency: 'Verde', reason: 'Control Post-Op' },
      { id: '7', name: 'Roberto Gómez Vara', time: '12:00', status: 'Pendiente', urgency: 'Verde', reason: 'Valoración Podología' },
    ];

    return (
      <div className="space-y-10">
        {/* Métricas Rápidas */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Consultas Hoy', value: '24', icon: ClipboardList, trend: '+4 hoy', color: 'from-brand-purple to-purple-600' },
            { label: 'Primera Vez', value: '6', icon: UserRound, trend: '25%', color: 'from-sky-500 to-sky-600' },
            { label: 'Subsecuentes', value: '18', icon: Users, trend: '75%', color: 'from-emerald-500 to-emerald-600' },
            { label: 'Tiempo Promedio', value: '18 min', icon: Activity, trend: '-2 min', color: 'from-rose-500 to-rose-600' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-[2.5rem] bg-gradient-to-br ${stat.color} text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform`}
            >
              <stat.icon className="absolute right-[-5%] bottom-[-5%] w-24 h-24 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-60 mb-2">{stat.label}</p>
              <h4 className="text-3xl font-black mb-3">{stat.value}</h4>
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black bg-white/10 p-1 px-2 rounded-lg border border-white/5">{stat.trend}</span>
              </div>
            </motion.div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Agenda del día */}
          <section className="lg:col-span-8 dashboard-card border-none shadow-sm p-8 bg-white/50 border border-white rounded-[3rem]">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-display font-black text-slate-900 tracking-tight italic">Agenda del <span className="text-brand-purple">Día</span></h3>
               <CalendarCheck className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-4">
               {medicalAgenda.map((item, i) => (
                 <div key={item.id} className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-brand-purple/30 transition-all">
                    <div className="flex items-center gap-6">
                       <div className="text-center w-12">
                          <p className="text-xs font-black text-slate-900">{item.time}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">AM</p>
                       </div>
                       <div className="w-px h-8 bg-slate-100"></div>
                       <div>
                          <h4 className="text-sm font-black text-slate-900">{item.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.reason}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                         item.status === 'En consulta' ? 'bg-sky-100 text-sky-600' :
                         item.status === 'En espera' ? 'bg-emerald-100 text-emerald-600' :
                         item.status === 'Prioridad' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'
                       }`}>
                          {item.status}
                       </span>
                       <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-purple transition-colors" />
                    </div>
                 </div>
               ))}
            </div>
          </section>

          {/* Fila Virtual / Priorización */}
          <section className="lg:col-span-4 dashboard-card border-none shadow-sm p-8 bg-slate-900 rounded-[3rem] text-white">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-display font-black tracking-tight italic">Fila <span className="text-brand-purple">Virtual</span></h3>
               <Activity className="w-5 h-5 text-slate-500" />
            </div>
            <div className="space-y-6">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Triage y Priorización</p>
               {medicalAgenda.sort((a, b) => {
                 const weight = { 'Rojo': 3, 'Amarillo': 2, 'Verde': 1 };
                 return (weight[b.urgency as keyof typeof weight] || 0) - (weight[a.urgency as keyof typeof weight] || 0);
               }).map((item) => (
                 <div key={item.id} className="flex items-center gap-4 group">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${
                      item.urgency === 'Rojo' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' :
                      item.urgency === 'Amarillo' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <div className="min-w-0">
                       <p className="text-xs font-black truncate">{item.name}</p>
                       <p className="text-[9px] font-bold text-slate-500 uppercase truncate">{item.urgency} Urgencia</p>
                    </div>
                 </div>
               ))}
            </div>
            <button className="w-full mt-12 py-4 bg-white/10 hover:bg-white/20 transition-all rounded-2xl border border-white/5 text-[9px] font-black uppercase tracking-widest">
               Ver Triage Completo
            </button>
          </section>
        </div>
      </div>
    );
  };

  const renderEstheticsDashboard = () => {
    return (
      <div className="space-y-10">
        {/* Esthetic Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Ingresos Estética', value: '$28,400', icon: DollarSign, trend: '+15%', color: 'from-purple-600 to-brand-purple' },
            { label: 'Botox Viales', value: '4', icon: Package, trend: 'Bajo', color: 'from-rose-500 to-rose-600' },
            { label: 'Sesiones Agendadas', value: '14', icon: CalendarCheck, trend: 'Full Today', color: 'from-sky-500 to-sky-600' },
            { label: 'Pacientes Satisfechos', value: '98%', icon: Sparkles, trend: 'Excelencia', color: 'from-emerald-500 to-emerald-600' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-[2.5rem] bg-gradient-to-br ${stat.color} text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform`}
            >
              <stat.icon className="absolute right-[-5%] bottom-[-5%] w-24 h-24 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.25em] opacity-60 mb-2">{stat.label}</p>
              <h4 className="text-3xl font-black mb-3">{stat.value}</h4>
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black bg-white/10 p-1 px-2 rounded-lg border border-white/5">{stat.trend}</span>
              </div>
            </motion.div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-12 dashboard-card border-none shadow-sm p-10 bg-white/50 border border-white rounded-[3rem]">
            <div className="flex items-center justify-between mb-12">
               <h3 className="text-2xl font-display font-black text-slate-900 tracking-tight italic">Control de <span className="text-brand-purple">Cabina & Sesiones</span></h3>
               <Sparkles className="w-5 h-5 text-brand-purple" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Dermapen Facial', patients: 3, items: ['Agujas 36pin', 'Serum Hialurónico'], status: 'Confirmado' },
                { name: 'Toxina Botulínica', patients: 5, items: ['Vial 100u', 'Jeringas 1ml'], status: 'En espera' },
                { name: 'Depilación Láser', patients: 8, items: ['Gel Conductor', 'Cuchilla desechable'], status: 'Turno Activo' },
              ].map((service, idx) => (
                <div key={idx} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:shadow-2xl transition-all group">
                  <h4 className="text-lg font-black text-slate-900 mb-4">{service.name}</h4>
                  <div className="flex items-center gap-2 mb-6">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500">{service.patients} Pacientes hoy</span>
                  </div>
                  <div className="space-y-2 mb-8">
                    {service.items.map(it => (
                      <div key={it} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-brand-purple" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{it}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">{service.status}</span>
                    <button className="p-3 bg-brand-purple text-white rounded-xl shadow-lg shadow-brand-purple/20">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  };

  const isClinicalSection = ['records', 'consent', 'laser_consent', 'treatment_plan', 'closures', 'explorations', 'recipe', 'cabin', 'photos', 'sessions', 'lab'].includes(activeSection);

  return (
    <div className="pb-6">
      <AnimatePresence mode="wait">
        {(selectedPatient || isClinicalSection) ? (
          <motion.div
            key="clinical-record-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            {activeRole === Role.PODOLOGIA ? (
              activeSection === 'explorations' ? (
                <PhysicalExplorationForm 
                  patient={selectedPatient || patients[0] || INITIAL_PATIENTS[0]}
                  onClose={handleClinicalViewClose}
                  patients={patients}
                  onPatientChange={(p) => setSelectedPatient(p)}
                />
              ) : activeSection === 'consent' ? (
                <ConsentForm 
                  patient={selectedPatient || patients[0] || INITIAL_PATIENTS[0]}
                  onClose={handleClinicalViewClose}
                  onSave={handleSaveConsent}
                />
              ) : activeSection === 'laser_consent' ? (
                <LaserConsentForm 
                  patient={selectedPatient || patients[0] || INITIAL_PATIENTS[0]}
                  onClose={handleClinicalViewClose}
                  onSave={handleSaveLaserConsent}
                />
              ) : activeSection === 'treatment_plan' ? (
                <TreatmentPlanForm 
                  patient={selectedPatient || patients[0] || INITIAL_PATIENTS[0]}
                  onClose={handleClinicalViewClose}
                  onSave={handleSaveTreatmentPlan}
                  patients={patients}
                />
              ) : activeSection === 'recipe' ? (
                <ClinicalRecord 
                  patient={selectedPatient || patients[0] || INITIAL_PATIENTS[0]} 
                  onClose={handleClinicalViewClose}
                  activeRole={activeRole}
                  activeSection={activeSection}
                  initialView={clinicalRecordView}
                  patients={patients}
                  onPatientChange={(p) => setSelectedPatient(p)}
                />
              ) : (
                <PodiatryChecklistForm 
                  patient={selectedPatient || patients[0] || INITIAL_PATIENTS[0]}
                  onClose={handleClinicalViewClose}
                  patients={patients}
                  onPatientChange={(p) => setSelectedPatient(p)}
                />
              )
            ) : (
              <ClinicalRecord 
                patient={selectedPatient || patients[0] || INITIAL_PATIENTS[0]} 
                onClose={handleClinicalViewClose}
                activeRole={activeRole}
                activeSection={activeSection}
                initialView={clinicalRecordView}
                patients={patients}
                onPatientChange={(p) => setSelectedPatient(p)}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`section-${activeSection}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* METRICS SECTIONS */}
            {activeSection === 'metrics' && activeRole === Role.ADMIN && renderAdminDashboard()}
            {activeSection === 'metrics' && activeRole === Role.MEDICINA_GENERAL && renderMedicalDashboard()}
            {activeSection === 'metrics' && activeRole === Role.PODOLOGIA && renderPodiatrySpecializedDashboard()}
            {activeSection === 'metrics' && activeRole === Role.ESTETICA && renderEstheticsDashboard()}
            
            {/* ADMIN SECTIONS */}
            {activeSection === 'inventory' && renderInventory()}
            {activeSection === 'staff' && renderStaff()}
            {activeSection === 'finance' && <div className="space-y-8 animate-in fade-in zoom-in duration-500 transition-all"><FinanceReport /></div>}

            {/* RECEPTION SECTIONS */}
            {activeSection === 'agenda' && renderAgenda()}
            {activeSection === 'registration' && renderRegistration()}
            {activeSection === 'box' && renderBoxView()}
            
            {/* CLINICAL SECTIONS (MEDIC & AESTHETIC) */}
            {(activeSection === 'records' || activeSection === 'consent' || activeSection === 'laser_consent' || activeSection === 'treatment_plan' || activeSection === 'closures' || 
              activeSection === 'explorations' || activeSection === 'recipe' || 
              activeSection === 'cabin' || activeSection === 'photos' || activeSection === 'sessions' || activeSection === 'lab') && renderClinicalView()}
            
            {/* PATIENT SECTIONS */}
            {(activeSection === 'appointments' || activeSection === 'results') && (
              <PatientPortal activeSection={activeSection} />
            )}
            {activeSection === 'default' && (
              <div className="h-96 flex flex-col items-center justify-center text-slate-400 space-y-6">
                 <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center border border-slate-100 animate-pulse">
                    <Sparkles className="w-10 h-10 text-brand-purple/30" />
                 </div>
                 <div className="text-center">
                    <p className="font-black uppercase tracking-[0.3em] text-[10px] text-slate-500 mb-2">Sincronizando Módulos</p>
                    <p className="text-xs font-bold text-slate-300 italic">Preparando entorno para {activeRole}...</p>
                 </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPatientForConsent && (
          <div className="fixed inset-0 z-[300]">
            <ConsentForm 
              patient={selectedPatientForConsent} 
              onClose={() => setSelectedPatientForConsent(null)} 
              onSave={handleSaveConsent}
            />
          </div>
        )}
        {selectedPatientForLaserConsent && (
          <div className="fixed inset-0 z-[300]">
            <LaserConsentForm 
              patient={selectedPatientForLaserConsent} 
              onClose={() => setSelectedPatientForLaserConsent(null)} 
              onSave={handleSaveLaserConsent}
            />
          </div>
        )}
        {selectedPatientForClosure && (
          <div className="fixed inset-0 z-[300]">
            <ConsentClosureForm 
              patient={selectedPatientForClosure} 
              onClose={() => setSelectedPatientForClosure(null)} 
              onSave={handleSaveClosure}
            />
          </div>
        )}
        {selectedPatientForExploration && (
          <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm overflow-hidden flex flex-col">
            <PhysicalExplorationForm 
              patient={selectedPatientForExploration} 
              onClose={() => setSelectedPatientForExploration(null)} 
              onSave={handleSaveExploration}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

