/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Save, 
  Trash2, 
  Edit3, 
  FileDown, 
  Plus, 
  FileText, 
  CheckCircle2, 
  User, 
  Calendar, 
  Activity, 
  Heart, 
  Ruler, 
  Info, 
  Brain, 
  ClipboardCheck,
  Award,
  AlertTriangle,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { Patient, PhysicalExploration } from '../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import SignatureCanvas from 'react-signature-canvas';

interface PhysicalExplorationFormProps {
  patient: Patient;
  onClose: () => void;
  onSave?: (exploration: PhysicalExploration) => void;
  initialData?: PhysicalExploration;
  patients?: Patient[];
  onPatientChange?: (p: Patient) => void;
}

const STORAGE_KEY = 'medical_dlis_physical_explorations';

// Left Column Padecimientos
const PADECIMIENTOS_IZQUIERDA = [
  { key: 'Palidez', label: 'PALIDEZ', isSpecial: false },
  { key: 'Eritema', label: 'ERITEMA', isSpecial: false },
  { key: 'Hematoma', label: 'HEMATOMA', isSpecial: false },
  { key: 'Dermatitis', label: 'DERMATITIS', isSpecial: false },
  { key: 'Poliactilia', label: 'POLIACTILIA', isSpecial: false },
  { key: 'Sindctilia', label: 'SINDCTILIA', isSpecial: false },
  { key: 'Hiperqueratosis', label: 'HIPERQUERATOSIS', isSpecial: false },
  { key: 'Heloma_Izq', label: 'HELOMA', isSpecial: false },
  { key: 'Hallux Valgus', label: 'HALLUX VALGUS', isSpecial: false },
  { key: 'Juanete Sastre', label: 'JUANETE SASTRE', isSpecial: false },
  { key: 'Hipocráticas', label: 'HIPOCRATICAS', isSpecial: false },
  { key: 'Micosis Plantar', label: 'MICOSIS PLANTAR', isSpecial: false },
  { key: 'Mi. Interdigital', label: 'MI. INTERDIGITAL (Micosis Interdigital)', isSpecial: false },
  { key: 'Onicogrifosis', label: 'ONICOGRIFOSIS', isSpecial: true, placeholder: 'ej: 1-5' },
  { key: 'Onicolisis', label: 'ONICOLISIS', isSpecial: false },
  { key: 'Onicomadesis', label: 'ONICOMADESIS', isSpecial: false },
  { key: 'Onicocriptosis', label: 'ONICOCRIPTOSIS', isSpecial: true, placeholder: 'ej: 1' },
  { key: 'Onicomicosis', label: 'ONICOMICOSIS', isSpecial: true, placeholder: 'ej: 1-5' },
];

// Right Column Padecimientos
const PADECIMIENTOS_DERECHA = [
  { key: 'Heloma_Der', label: 'HELOMA', isSpecial: false },
  { key: 'Leuconiquia_1', label: 'LEUCONIQUIA', isSpecial: false },
  { key: 'Melanoniquia', label: 'MELANONIQUIA', isSpecial: false },
  { key: 'Oniquia', label: 'ONIQUIA', isSpecial: false },
  { key: 'Coiloniquia', label: 'COILONIQUIA', isSpecial: false },
  { key: 'Anoniquia', label: 'ANONIQUIA', isSpecial: false },
  { key: 'Platoniquia', label: 'PLATONIQUIA', isSpecial: false },
  { key: 'Braquioniquia', label: 'BRAQUIONIQUIA', isSpecial: false },
  { key: 'Hapaloniquia', label: 'HAPALONIQUIA', isSpecial: false },
  { key: 'Microniquia', label: 'MICRONIQUIA', isSpecial: false },
  { key: 'Macroniquia', label: 'MACRONIQUIA', isSpecial: false },
  { key: 'Leuconiquia_2', label: 'LEUCONIQUIA', isSpecial: false }, // duplicated in print template
  { key: 'Traquioniquia', label: 'TRAQUIONIQUEA', isSpecial: false },
  { key: 'Línea de Beau', label: 'LINEA DE BEAU', isSpecial: false },
  { key: 'Úlcera', label: 'ULCERA', isSpecial: false },
  { key: 'T. Konenen', label: 'T. KONENEN', isSpecial: false },
  { key: 'Descamación', label: 'DESCAMACION', isSpecial: false },
  { key: 'Tatuajes', label: 'TATUAJES', isSpecial: false },
];

const PROFILES_PIE = [
  {
    type: 'Egipcio',
    label: 'Egipcio',
    desc: 'El primer dedo es el más largo; los demás descienden en línea diagonal.',
    svg: (active: boolean) => (
      <svg className="w-16 h-16 sm:w-20 sm:h-20 max-w-full" viewBox="0 0 100 100" fill="none">
        <path d="M25 80 C 25 88, 75 88, 75 80 C 75 70, 70 52, 65 38 C 55 33, 45 33, 35 38 C 30 52, 25 70, 25 80 Z" stroke="currentColor" strokeWidth="2" fill={active ? "rgba(107, 33, 168, 0.1)" : "none"} />
        <ellipse cx="32" cy="24" rx="6" ry="9" stroke="currentColor" strokeWidth="2.2" fill={active ? "currentColor" : "none"} />
        <ellipse cx="44" cy="29" rx="5" ry="7.5" stroke="currentColor" strokeWidth="1.8" fill={active ? "currentColor" : "none"} />
        <ellipse cx="54" cy="34" rx="4.5" ry="6.5" stroke="currentColor" strokeWidth="1.8" fill={active ? "currentColor" : "none"} />
        <ellipse cx="63" cy="40" rx="4" ry="5.5" stroke="currentColor" strokeWidth="1.8" fill={active ? "currentColor" : "none"} />
        <ellipse cx="71" cy="47" rx="3.5" ry="4.5" stroke="currentColor" strokeWidth="1.8" fill={active ? "currentColor" : "none"} />
        <line x1="22" y1="14" x2="80" y2="46" stroke="#f54242" strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
    )
  },
  {
    type: 'Romano',
    label: 'Romano',
    desc: 'Los tres primeros dedos son de la misma altura; perfil plano y cuadrado.',
    svg: (active: boolean) => (
      <svg className="w-16 h-16 sm:w-20 sm:h-20 max-w-full" viewBox="0 0 100 100" fill="none">
        <path d="M25 80 C 25 88, 75 88, 75 80 C 75 70, 70 52, 65 38 C 55 33, 45 33, 35 38 C 30 52, 25 70, 25 80 Z" stroke="currentColor" strokeWidth="2" fill={active ? "rgba(107, 33, 168, 0.1)" : "none"} />
        <ellipse cx="32" cy="26" rx="5.5" ry="8" stroke="currentColor" strokeWidth="2.2" fill={active ? "currentColor" : "none"} />
        <ellipse cx="44" cy="26" rx="5" ry="8" stroke="currentColor" strokeWidth="2" fill={active ? "currentColor" : "none"} />
        <ellipse cx="56" cy="26" rx="4.5" ry="8" stroke="currentColor" strokeWidth="2" fill={active ? "currentColor" : "none"} />
        <ellipse cx="66" cy="33" rx="4" ry="6.5" stroke="currentColor" strokeWidth="1.8" fill={active ? "currentColor" : "none"} />
        <ellipse cx="74" cy="40" rx="3.5" ry="5.5" stroke="currentColor" strokeWidth="1.8" fill={active ? "currentColor" : "none"} />
        <line x1="24" y1="17" x2="64" y2="17" stroke="#f54242" strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
    )
  },
  {
    type: 'Griego',
    label: 'Griego',
    desc: 'El segundo dedo es el más largo de todos, superando al dedo gordo.',
    svg: (active: boolean) => (
      <svg className="w-16 h-16 sm:w-20 sm:h-20 max-w-full" viewBox="0 0 100 100" fill="none">
        <path d="M25 80 C 25 88, 75 88, 75 80 C 75 70, 70 52, 65 38 C 55 33, 45 33, 35 38 C 30 52, 25 70, 25 80 Z" stroke="currentColor" strokeWidth="2" fill={active ? "rgba(107, 33, 168, 0.1)" : "none"} />
        <ellipse cx="32" cy="28" rx="5.5" ry="7" stroke="currentColor" strokeWidth="1.8" fill={active ? "currentColor" : "none"} />
        <ellipse cx="44" cy="22" rx="5" ry="9" stroke="currentColor" strokeWidth="2.2" fill={active ? "currentColor" : "none"} />
        <ellipse cx="55" cy="30" rx="4.5" ry="7" stroke="currentColor" strokeWidth="1.8" fill={active ? "currentColor" : "none"} />
        <ellipse cx="65" cy="36" rx="4" ry="6" stroke="currentColor" strokeWidth="1.8" fill={active ? "currentColor" : "none"} />
        <ellipse cx="73" cy="43" rx="3.5" ry="5" stroke="currentColor" strokeWidth="1.8" fill={active ? "currentColor" : "none"} />
        <polyline points="24,32 44,14 62,34" fill="none" stroke="#f54242" strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
    )
  },
  {
    type: 'Germánico',
    label: 'Germánico',
    desc: 'El primer dedo es el más largo y los demás son iguales y planos.',
    svg: (active: boolean) => (
      <svg className="w-16 h-16 sm:w-20 sm:h-20 max-w-full" viewBox="0 0 100 100" fill="none">
        <path d="M25 80 C 25 88, 75 88, 75 80 C 75 70, 70 52, 65 38 C 55 33, 45 33, 35 38 C 30 52, 25 70, 25 80 Z" stroke="currentColor" strokeWidth="2" fill={active ? "rgba(107, 33, 168, 0.1)" : "none"} />
        <ellipse cx="32" cy="24" rx="6" ry="9.5" stroke="currentColor" strokeWidth="2.2" fill={active ? "currentColor" : "none"} />
        <ellipse cx="44" cy="31" rx="4.8" ry="6" stroke="currentColor" strokeWidth="1.8" fill={active ? "currentColor" : "none"} />
        <ellipse cx="53" cy="31" rx="4.5" ry="6" stroke="currentColor" strokeWidth="1.8" fill={active ? "currentColor" : "none"} />
        <ellipse cx="62" cy="31" rx="4" ry="6" stroke="currentColor" strokeWidth="1.8" fill={active ? "currentColor" : "none"} />
        <ellipse cx="71" cy="31" rx="3.5" ry="6" stroke="currentColor" strokeWidth="1.8" fill={active ? "currentColor" : "none"} />
        <polyline points="23,15 39,15 41,25 77,25" fill="none" stroke="#f54242" strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
    )
  },
  {
    type: 'Celta',
    label: 'Celta',
    desc: 'El segundo dedo es el más largo, el primero y el tercero son de altura similar.',
    svg: (active: boolean) => (
      <svg className="w-16 h-16 sm:w-20 sm:h-20 max-w-full" viewBox="0 0 100 100" fill="none">
        <path d="M25 80 C 25 88, 75 88, 75 80 C 75 70, 70 52, 65 38 C 55 33, 45 33, 35 38 C 30 52, 25 70, 25 80 Z" stroke="currentColor" strokeWidth="2" fill={active ? "rgba(107, 33, 168, 0.1)" : "none"} />
        <ellipse cx="32" cy="27" rx="5.5" ry="7.5" stroke="currentColor" strokeWidth="1.8" fill={active ? "currentColor" : "none"} />
        <ellipse cx="44" cy="21" rx="5" ry="9.5" stroke="currentColor" strokeWidth="2.2" fill={active ? "currentColor" : "none"} />
        <ellipse cx="55" cy="27" rx="4.8" ry="7.5" stroke="currentColor" strokeWidth="1.8" fill={active ? "currentColor" : "none"} />
        <ellipse cx="65" cy="34" rx="4" ry="6" stroke="currentColor" strokeWidth="1.8" fill={active ? "currentColor" : "none"} />
        <ellipse cx="73" cy="42" rx="3.5" ry="5" stroke="currentColor" strokeWidth="1.8" fill={active ? "currentColor" : "none"} />
        <polyline points="24,31 44,13 56,31 75,46" fill="none" stroke="#f54242" strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
    )
  }
];

const PROFILES_PISADA = [
  {
    type: 'Neutro',
    label: 'Neutro / Fisiológico',
    desc: 'Apoyo equilibrado y alineación vertical correcta del tobillo y el talón.',
    svg: (active: boolean) => (
      <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 100 100" fill="none">
        {/* Back and ankle outline */}
        <path d="M35 15 L 35 48 C 35 62, 30 72, 30 78 L 70 78 C 70 72, 65 62, 65 48 L 65 15" stroke="currentColor" strokeWidth="2.5" fill={active ? "rgba(79, 70, 229, 0.05)" : "none"} />
        {/* Straight heel axis line */}
        <line x1="50" y1="38" x2="50" y2="78" stroke="#ef4444" strokeWidth="2.5" />
        {/* Alignment arrow */}
        <line x1="50" y1="28" x2="50" y2="38" stroke="#ef4444" strokeWidth="1.5" />
        <polyline points="47,32 50,28 53,32" fill="none" stroke="#ef4444" strokeWidth="1.5" />
        <text x="50" y="90" textAnchor="middle" fill="currentColor" className="text-[9px] font-black tracking-widest uppercase">Neutro</text>
      </svg>
    )
  },
  {
    type: 'Pronación',
    label: 'Pronación / Valgo',
    desc: 'El pie y el tobillo se inclinan hacia adentro, con colapso del arco longitudinal.',
    svg: (active: boolean) => (
      <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 100 100" fill="none">
        {/* Inward curve of ankles */}
        <path d="M35 15 L 42 48 C 44 62, 33 72, 28 78 L 65 78 C 68 72, 64 62, 61 48 L 61 15" stroke="currentColor" strokeWidth="2.5" fill={active ? "rgba(79, 70, 229, 0.05)" : "none"} />
        {/* Inward tilted heel axis line */}
        <line x1="51" y1="38" x2="42" y2="78" stroke="#ef4444" strokeWidth="2.5" />
        {/* Curve arrow indicating pronation direction */}
        <path d="M53 45 Q 40 54 44 66" fill="none" stroke="#ef4444" strokeWidth="1.5" />
        <polyline points="41,63 44,66 47,61" fill="none" stroke="#ef4444" strokeWidth="1.5" />
        <text x="50" y="90" textAnchor="middle" fill="currentColor" className="text-[9px] font-black tracking-widest uppercase truncate">Pronado</text>
      </svg>
    )
  },
  {
    type: 'Supinación',
    label: 'Supinación / Varo',
    desc: 'El pie y el tobillo se proyectan hacia afuera, recargando el arco lateral externo.',
    svg: (active: boolean) => (
      <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 100 100" fill="none">
        {/* Outward curve of ankles */}
        <path d="M39 15 L 39 48 C 39 62, 42 72, 47 78 L 84 78 C 79 72, 65 62, 63 48 L 65 15" stroke="currentColor" strokeWidth="2.5" fill={active ? "rgba(79, 70, 229, 0.05)" : "none"} />
        {/* Outward tilted heel axis */}
        <line x1="49" y1="38" x2="58" y2="78" stroke="#ef4444" strokeWidth="2.5" />
        {/* Curve arrow indicating supinación direction */}
        <path d="M47 45 Q 60 54 56 66" fill="none" stroke="#ef4444" strokeWidth="1.5" />
        <polyline points="59,61 56,66 53,63" fill="none" stroke="#ef4444" strokeWidth="1.5" />
        <text x="50" y="90" textAnchor="middle" fill="currentColor" className="text-[9px] font-black tracking-widest uppercase">Supinado</text>
      </svg>
    )
  }
];

const MANUAL_ITEMS = [
  { key: 'osteoarticular', label: 'Estructura Ósea (Est. Ósea)' },
  { key: 'temperature', label: 'Temperatura' },
  { key: 'capillaryRefill', label: 'Llenado Capilar' },
  { key: 'tibialPulse', label: 'Pulso Tibial Posterior' },
  { key: 'monofilament', label: 'Sensibilidad al Monofilamento' },
  { key: 'tuningFork', label: 'Sensibilidad al Diapasón' },
  { key: 'reflexHammer', label: 'Martillo de Reflejos' },
];

export default function PhysicalExplorationForm({ patient, onClose, onSave, initialData, patients, onPatientChange }: PhysicalExplorationFormProps) {
  // Screen views: 'list' (shows historical explorations) or 'form' (shows builder)
  const [viewMode, setViewMode] = useState<'list' | 'form'>('form');
  const [history, setHistory] = useState<PhysicalExploration[]>([]);
  const [selectedExploration, setSelectedExploration] = useState<PhysicalExploration | null>(null);

  // Core Form State
  const [formData, setFormData] = useState<PhysicalExploration>({
    id: '',
    patientId: patient.id,
    date: new Date().toISOString().split('T')[0],
    visualExploration: {},
    specialToes: {},
    otherVisualObservations: '',
    footType: 'Egipcio',
    stepType: 'Neutro',
    manualExploration: {
      osteoarticular: { der: 'Normal', izq: 'Normal' },
      temperature: { der: 'Normal', izq: 'Normal' },
      capillaryRefill: { der: 'Normal', izq: 'Normal' },
      tibialPulse: { der: 'Normal', izq: 'Normal' },
      monofilament: { der: 'Normal', izq: 'Normal' },
      tuningFork: { der: 'Normal', izq: 'Normal' },
      reflexHammer: { der: 'Normal', izq: 'Normal' },
    },
    diagnostics: {
      biomechanical: '',
      dermatological: '',
      neurological: '',
      vascular: '',
    },
    reference: false,
    referenceTo: '',
    therapeuticPlan: '',
    patientSignature: '',
    professionalName: 'Dr. Lluvia G.',
  });

  const patientSigCanvas = useRef<SignatureCanvas>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load records from local storage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as PhysicalExploration[];
        // Filter by current patient ID
        const filtered = parsed.filter(item => item.patientId === patient.id);
        setHistory(filtered);
      } catch (e) {
        console.error("Error loading physical explorations", e);
      }
    }
    
    // If we received initialData, open the form directly
    if (initialData) {
      setFormData(initialData);
      setViewMode('form');
    } else {
      // Reset form fields with new patient info
      setFormData({
        id: '',
        patientId: patient.id,
        date: new Date().toISOString().split('T')[0],
        visualExploration: {},
        specialToes: {},
        otherVisualObservations: '',
        footType: 'Egipcio',
        stepType: 'Neutro',
        manualExploration: {
          osteoarticular: { der: 'Normal', izq: 'Normal' },
          temperature: { der: 'Normal', izq: 'Normal' },
          capillaryRefill: { der: 'Normal', izq: 'Normal' },
          tibialPulse: { der: 'Normal', izq: 'Normal' },
          monofilament: { der: 'Normal', izq: 'Normal' },
          tuningFork: { der: 'Normal', izq: 'Normal' },
          reflexHammer: { der: 'Normal', izq: 'Normal' },
        },
        diagnostics: {
          biomechanical: '',
          dermatological: '',
          neurological: '',
          vascular: '',
        },
        reference: false,
        referenceTo: '',
        therapeuticPlan: '',
        patientSignature: '',
        professionalName: 'Dr. Lluvia G.',
      });
      setViewMode('form');
    }
  }, [patient.id, initialData]);

  // Save the state
  const handleSaveForm = () => {
    // Trim patient signature
    let sigDataUrl = formData.patientSignature;
    if (patientSigCanvas.current && !patientSigCanvas.current.isEmpty()) {
      sigDataUrl = patientSigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
    }

    setIsSaving(true);
    
    const updatedRecord: PhysicalExploration = {
      ...formData,
      id: formData.id || `EXPL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      patientId: patient.id,
      patientSignature: sigDataUrl
    };

    // Load actual DB list in localStorage
    const raw = localStorage.getItem(STORAGE_KEY);
    let allRecords: PhysicalExploration[] = [];
    if (raw) {
      try {
        allRecords = JSON.parse(raw) as PhysicalExploration[];
      } catch (e) {
        allRecords = [];
      }
    }

    // Filter out previous version of same record
    const updatedList = [updatedRecord, ...allRecords.filter(r => r.id !== updatedRecord.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));

    // Support optional prop callbacks
    if (onSave) {
      onSave(updatedRecord);
    }

    setTimeout(() => {
      // Re-load list
      const filtered = updatedList.filter(item => item.patientId === patient.id);
      setHistory(filtered);
      setIsSaving(false);
      resetForm();
      setViewMode('form');
      alert('Exploración Física Guardada Exitosamente. Podrá ver el registro actualizado abajo.');
    }, 700);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      patientId: patient.id,
      date: new Date().toISOString().split('T')[0],
      visualExploration: {},
      specialToes: {},
      otherVisualObservations: '',
      footType: 'Egipcio',
      stepType: 'Neutro',
      manualExploration: {
        osteoarticular: { der: 'Normal', izq: 'Normal' },
        temperature: { der: 'Normal', izq: 'Normal' },
        capillaryRefill: { der: 'Normal', izq: 'Normal' },
        tibialPulse: { der: 'Normal', izq: 'Normal' },
        monofilament: { der: 'Normal', izq: 'Normal' },
        tuningFork: { der: 'Normal', izq: 'Normal' },
        reflexHammer: { der: 'Normal', izq: 'Normal' },
      },
      diagnostics: {
        biomechanical: '',
        dermatological: '',
        neurological: '',
        vascular: '',
      },
      reference: false,
      referenceTo: '',
      therapeuticPlan: '',
      patientSignature: '',
      professionalName: 'Dr. Lluvia G.',
    });
    if (patientSigCanvas.current) {
      patientSigCanvas.current.clear();
    }
  };

  const handleCreateNew = () => {
    resetForm();
    setViewMode('form');
  };

  const handleEdit = (rec: PhysicalExploration) => {
    setFormData(rec);
    setViewMode('form');
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar permanentemente esta hoja de exploración física?')) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const all = JSON.parse(raw) as PhysicalExploration[];
          const filterAll = all.filter(r => r.id !== id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filterAll));
          
          const filtered = filterAll.filter(item => item.patientId === patient.id);
          setHistory(filtered);
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  // Toggle Standard Checkbox in Left/Right columns
  const toggleVisualCheckbox = (key: string, side: 'izq' | 'der') => {
    const prev = formData.visualExploration[key] || { der: false, izq: false };
    setFormData({
      ...formData,
      visualExploration: {
        ...formData.visualExploration,
        [key]: {
          ...prev,
          [side]: !prev[side]
        }
      }
    });
  };

  // Handle text input for affected toes/special fields (Onicogrifosis, Onicocriptosis, Onicomicosis)
  const handleSpecialToeChange = (key: string, side: 'izq' | 'der', val: string) => {
    const prevSpecial = formData.specialToes || {};
    const currentItem = prevSpecial[key] || { der: '', izq: '' };
    
    // Also toggle the visualExploration boolean representation to match
    const isToesActive = val.trim().length > 0;
    const prevExpl = formData.visualExploration[key] || { der: false, izq: false };

    setFormData({
      ...formData,
      visualExploration: {
        ...formData.visualExploration,
        [key]: {
          ...prevExpl,
          [side]: isToesActive
        }
      },
      specialToes: {
        ...prevSpecial,
        [key]: {
          ...currentItem,
          [side]: val
        }
      }
    });
  };

  // Toggle Manual Exploration normal/anormal
  const toggleManualStatus = (key: string, side: 'izq' | 'der', status: 'Normal' | 'Anormal') => {
    const prevManual = formData.manualExploration;
    const currentItem = prevManual[key] || { der: 'Normal', izq: 'Normal' };
    
    setFormData({
      ...formData,
      manualExploration: {
        ...prevManual,
        [key]: {
          ...currentItem,
          [side]: status
        }
      }
    });
  };

  // Generate jsPDF matching the sheet image!
  const exportPDF = (record: PhysicalExploration) => {
    const doc = new jsPDF();
    const logoUrl = 'https://cossma.com.mx/medical.png';
    
    // Brand header
    doc.addImage(logoUrl, 'PNG', 10, 10, 32, 16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(107, 33, 168); // Brand purple
    doc.text("MEDICAL D'LIS", 46, 17);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text("Av. Glandorf 3706, Col San Felipe, CP 31203, Tel. 6144891998", 46, 21);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text("EXPLORACIÓN FISICA ADULTOS Y HOJA CLINICA", 46, 26);

    // Right-aligned medical file date
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Paciente: ${patient.name}`, 148, 15);
    doc.text(`Fecha: ${record.date}`, 148, 19);
    doc.text(`Folio: ${record.id}`, 148, 23);

    doc.setDrawColor(233, 213, 255);
    doc.setLineWidth(0.5);
    doc.line(10, 30, 200, 30);

    let currentY = 35;

    // Table with Patient Details
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 33, 168);
    doc.text("DATOS GENERALES DEL PACIENTE", 10, currentY);
    currentY += 3;

    (doc as any).autoTable({
      startY: currentY,
      body: [
        ["Nombre del Paciente", patient.name, "Edad / Género", `${patient.age || 'N/E'} años / ${patient.gender || 'N/E'}`],
        ["Teléfono / Celular", patient.phone || 'N/E', "Última Cita", patient.lastVisit || 'N/E'],
      ],
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 1.5, font: 'helvetica' },
      columnStyles: {
        0: { fontStyle: 'bold', width: 40, fillColor: [250, 245, 255] },
        2: { fontStyle: 'bold', width: 30, fillColor: [250, 245, 255] }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // 1. Exploración Física Visual
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 33, 168);
    doc.text("1. EXPLORACIÓN FÍSICA VISUAL", 10, currentY);
    currentY += 3;

    // Prepare visual padecimientos table data
    const visualRows: any[] = [];
    const maxLen = Math.max(PADECIMIENTOS_IZQUIERDA.length, PADECIMIENTOS_DERECHA.length);
    
    for (let i = 0; i < maxLen; i++) {
      const leftCol = PADECIMIENTOS_IZQUIERDA[i];
      const rightCol = PADECIMIENTOS_DERECHA[i];

      let leftLabel = '';
      let leftIzq = '';
      let leftDer = '';
      if (leftCol) {
        leftLabel = leftCol.label;
        const val = record.visualExploration[leftCol.key] || { izq: false, der: false };
        if (leftCol.isSpecial) {
          const spec = record.specialToes?.[leftCol.key] || { izq: '', der: '' };
          leftIzq = spec.izq ? `SI (${spec.izq})` : 'NO';
          leftDer = spec.der ? `SI (${spec.der})` : 'NO';
        } else {
          leftIzq = val.izq ? 'SI [X]' : 'NO [ ]';
          leftDer = val.der ? 'SI [X]' : 'NO [ ]';
        }
      }

      let rightLabel = '';
      let rightIzq = '';
      let rightDer = '';
      if (rightCol) {
        rightLabel = rightCol.label;
        const val = record.visualExploration[rightCol.key] || { izq: false, der: false };
        rightIzq = val.izq ? 'SI [X]' : 'NO [ ]';
        rightDer = val.der ? 'SI [X]' : 'NO [ ]';
      }

      visualRows.push([leftLabel, leftIzq, leftDer, rightLabel, rightIzq, rightDer]);
    }

    (doc as any).autoTable({
      startY: currentY,
      head: [
        [{ content: 'PADECIMIENTO IZQ/DER (BLOQUE A)', colSpan: 3, styles: { halign: 'center', fillColor: [107, 33, 168] } },
         { content: 'PADECIMIENTO IZQ/DER (BLOQUE B)', colSpan: 3, styles: { halign: 'center', fillColor: [91, 33, 182] } }]
      ],
      body: visualRows,
      theme: 'grid',
      styles: { fontSize: 6.5, cellPadding: 1, font: 'helvetica' },
      columnStyles: {
        0: { width: 45, fontStyle: 'bold' },
        1: { width: 22, halign: 'center' },
        2: { width: 22, halign: 'center' },
        3: { width: 45, fontStyle: 'bold' },
        4: { width: 22, halign: 'center' },
        5: { width: 22, halign: 'center' }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 4;

    if (record.otherVisualObservations) {
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Observaciones visuales adicionales: ${record.otherVisualObservations}`, 11, currentY);
      currentY += 4.5;
    }

    // 2. Selectores Morfológicos / Biomecánicos
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 33, 168);
    doc.text("2. DETERMINACIÓN BIOMECÁNICA & MORFOLÓGICA", 10, currentY);
    currentY += 3;

    (doc as any).autoTable({
      startY: currentY,
      body: [
        ["TIPO DE PIE SELECCIONADO", record.footType.toUpperCase(), "TIPO DE PISADA / MARCHA", record.stepType.toUpperCase()]
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, font: 'helvetica' },
      columnStyles: {
        0: { fontStyle: 'bold', width: 50, fillColor: [243, 232, 255] },
        1: { fontStyle: 'bold', textColor: [107, 33, 168] },
        2: { fontStyle: 'bold', width: 50, fillColor: [243, 232, 255] },
        3: { fontStyle: 'bold', textColor: [79, 70, 229] }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    // 3. Exploración Física Manual
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 33, 168);
    doc.text("3. EXPLORACIÓN FÍSICA MANUAL E INSTRUMENTADA (BILATERAL)", 10, currentY);
    currentY += 3;

    const manualRows: any[] = [];
    MANUAL_ITEMS.forEach(m => {
      const stateObj = record.manualExploration[m.key] || { izq: 'Normal', der: 'Normal' };
      manualRows.push([m.label, stateObj.der, stateObj.izq]);
    });

    (doc as any).autoTable({
      startY: currentY,
      head: [["Hallazgo / Prueba instrumentada", "Pie Derecho", "Pie Izquierdo"]],
      body: manualRows,
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 1.5, font: 'helvetica' },
      headStyles: { fillColor: [71, 85, 105] },
      columnStyles: {
        0: { fontStyle: 'bold', width: 80 },
        1: { halign: 'center', fontStyle: 'bold' },
        2: { halign: 'center', fontStyle: 'bold' }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    // Next Page or layout protection
    if (currentY > 195) {
      doc.addPage();
      currentY = 15;
    }

    // 4. Diagnósticos
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 33, 168);
    doc.text("4. DIAGNÓSTICOS (Dx)", 10, currentY);
    currentY += 3;

    (doc as any).autoTable({
      startY: currentY,
      body: [
        ["Dx. Biomecánico", record.diagnostics.biomechanical || 'Sin afectación reportada.'],
        ["Dx. Dermatológico", record.diagnostics.dermatological || 'Sin afectación reportada.'],
        ["Dx. Neurológico", record.diagnostics.neurological || 'Sin afectación reportada.'],
        ["Dx. Vascular", record.diagnostics.vascular || 'Sin afectación reportada.'],
      ],
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 2, font: 'helvetica' },
      columnStyles: {
        0: { fontStyle: 'bold', width: 40, fillColor: [241, 245, 249] },
        1: { fontStyle: 'normal' }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 5;

    // 5. Plan Terapéutico
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 33, 168);
    doc.text("5. PLAN TERAPÉUTICO Y REFERENCIA MÉDICA", 10, currentY);
    currentY += 3;

    (doc as any).autoTable({
      startY: currentY,
      body: [
        ["Requiere Referencia Especializada", record.reference ? "SÍ" : "NO", "Dirigido a:", record.referenceTo || 'N/A'],
        ["Tratamiento / Terapéutica Sugerida", { content: record.therapeuticPlan || 'Tratamiento general profiláctico en cabina.', colSpan: 3 }]
      ],
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 2, font: 'helvetica' },
      columnStyles: {
        0: { fontStyle: 'bold', width: 45, fillColor: [241, 245, 249] },
        2: { fontStyle: 'bold', width: 30, fillColor: [241, 245, 249] }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 7;

    if (currentY > 215) {
      doc.addPage();
      currentY = 15;
    }

    // Responsiva legal text
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    const textClause = doc.splitTextToSize("En este documento quedan impresos los datos que he proporcionado y afirmo que son verídicos, después de conocer el tratamiento a seguir que me ha sugerido, recibiendo con atención la información respectiva sobre el mismo, acepto y autorizo. De acuerdo con el artículo 4º de la Conamed este documento es confidencial e intransferible.", 180);
    doc.text(textClause, 10, currentY);
    currentY += 12;

    // Signatures
    doc.setDrawColor(203, 213, 225);
    doc.line(20, currentY + 15, 85, currentY + 15);
    doc.line(125, currentY + 15, 190, currentY + 15);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text("FIRMA DEL PACIENTE", 52, currentY + 19, { align: 'center' });
    doc.text(record.professionalName.toUpperCase(), 157, currentY + 19, { align: 'center' });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(patient.name.toUpperCase(), 52, currentY + 23, { align: 'center' });
    doc.text("PROFESIONAL TRATANTE", 157, currentY + 23, { align: 'center' });

    // Paint signature if saved
    if (record.patientSignature) {
      try {
        doc.addImage(record.patientSignature, 'PNG', 32, currentY - 2, 40, 16);
      } catch (err) {
        console.error("Failed to render patient signature in PDF", err);
      }
    }

    doc.save(`ExploracionPhysical_${patient.name.replace(/\s+/g, '_')}_${record.date}.pdf`);
  };

  return (
    <div className="w-full h-full lg:min-h-0 min-h-[90vh] bg-slate-50/50 flex flex-col overflow-hidden md:p-6 p-4">
      
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-100 p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-[2.5rem] shadow-sm mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-brand-purple rounded-2xl transition-all border border-slate-100 shrink-0"
            title="Atrás"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight italic">
                Hoja de <span className="text-brand-purple">Exploración Física Visual</span>
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Paciente Activo:</span>
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
                  <span className="text-xs font-bold text-slate-700">{patient.name}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {formData.id && (
            <button
              onClick={resetForm}
              className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nueva Exploración
            </button>
          )}

          <button
            onClick={handleSaveForm}
            disabled={isSaving}
            className="px-6 py-4 bg-brand-purple hover:bg-brand-purple-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-brand-purple/10 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSaving ? <CheckCircle2 className="w-4 h-4 animate-bounce" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Guardando...' : formData.id ? 'Guardar Cambios' : 'Guardar Ficha'}</span>
          </button>
        </div>
      </div>

      {/* WORKSPACE AREA */}
      <div className="flex-1 w-full max-w-7xl mx-auto overflow-y-auto pr-1 pb-16 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key="form-screen"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mt-2"
          >
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                
                {/* Visual Header Clinic Banner */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-brand-purple p-8 sm:p-12 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative">
                  <div className="absolute inset-0 bg-repeat bg-center opacity-5 pointer-events-none" style={{ backgroundImage: `url('https://cossma.com.mx/medical.png')`, backgroundSize: '200px' }}></div>
                  
                  <div className="z-10">
                    <span className="text-[10px] font-black text-brand-purple-dark uppercase tracking-[0.25em] bg-white p-1.5 px-3 rounded-lg mr-2 inline-block">Expediente Médico</span>
                    <h3 className="text-2xl sm:text-3xl font-display font-black tracking-tight italic mt-3">CLÍNICA <span className="text-brand-purple">MEDICAL D'LIS</span></h3>
                    <p className="text-xs font-bold text-slate-400 max-w-xl leading-relaxed mt-2 uppercase tracking-wide">
                      VALORACIÓN PODOLÓGICA E INFORME ANATÓMICO INTEGRAL
                    </p>
                  </div>
                  
                  <div className="w-full sm:w-auto z-10 bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/15">
                    <label className="text-[9px] font-black text-slate-350 uppercase tracking-[0.2em] block mb-1.5">Fecha de la Exploración</label>
                    <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 px-4 rounded-xl">
                      <Calendar className="w-4 h-4 text-brand-purple shrink-0" />
                      <input 
                        type="date" 
                        value={formData.date} 
                        onChange={e => setFormData({...formData, date: e.target.value})} 
                        className="bg-transparent text-white font-black text-xs outline-none cursor-pointer" 
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-12 space-y-12 sm:space-y-16">
                  
                  {/* --- SECTION 1: EXPLORACIÓN FÍSICA VISUAL --- */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-brand-purple border-b border-purple-50 pb-4">
                      <Activity className="w-6 h-6 shrink-0" />
                      <h4 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tighter">1. Exploración Física Visual</h4>
                    </div>

                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-50 p-3 px-5 rounded-2xl inline-block">
                      Marque los padecimientos identificados bilaterales en Pie Izquierdo (IZQ) y Derecho (DER). Utilice las cajas de texto en los campos especiales para anotar los dedos afectados.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-14 pt-2">
                      
                      {/* Bloque A - Columna Izquierda */}
                      <div className="bg-slate-50/40 p-6 sm:p-8 rounded-[2.5rem] border border-slate-100">
                        <h5 className="text-[11px] font-black text-brand-purple-dark bg-purple-50 p-2 px-4 rounded-xl uppercase tracking-widest inline-block mb-6">Padecimientos - Bloque A</h5>
                        
                        <div className="space-y-1">
                          <div className="grid grid-cols-12 mb-3 px-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <span className="col-span-6">Padecimiento</span>
                            <span className="col-span-3 text-center">Pie Izquierdo</span>
                            <span className="col-span-3 text-center">Pie Derecho</span>
                          </div>

                          {PADECIMIENTOS_IZQUIERDA.map(p => (
                            <div key={p.key} className="grid grid-cols-12 items-center hover:bg-slate-50 group rounded-xl p-2.5 transition-colors border-b border-slate-100/50">
                              <span className="col-span-6 text-[11px] font-bold text-slate-700 group-hover:text-brand-purple transition-colors truncate pr-2">
                                {p.label} {p.isSpecial && <span className="text-[8px] font-black px-1.5 py-0.5 bg-purple-50 text-brand-purple rounded-md align-middle border border-purple-100">ESP</span>}
                              </span>

                              {p.isSpecial ? (
                                <>
                                  <div className="col-span-3 px-1.5">
                                    <input 
                                      type="text"
                                      placeholder={p.placeholder}
                                      value={formData.specialToes?.[p.key]?.izq || ''}
                                      onChange={e => handleSpecialToeChange(p.key, 'izq', e.target.value)}
                                      className="w-full text-center p-1.5 bg-white border border-slate-200 focus:border-brand-purple rounded-lg text-[10px] font-black uppercase text-slate-800 outline-none shadow-inner"
                                    />
                                  </div>
                                  <div className="col-span-3 px-1.5">
                                    <input 
                                      type="text"
                                      placeholder={p.placeholder}
                                      value={formData.specialToes?.[p.key]?.der || ''}
                                      onChange={e => handleSpecialToeChange(p.key, 'der', e.target.value)}
                                      className="w-full text-center p-1.5 bg-white border border-slate-200 focus:border-brand-purple rounded-lg text-[10px] font-black uppercase text-slate-800 outline-none shadow-inner"
                                    />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="col-span-3 flex justify-center">
                                    <label className="relative flex items-center justify-center p-1 cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        checked={formData.visualExploration[p.key]?.izq || false} 
                                        onChange={() => toggleVisualCheckbox(p.key, 'izq')}
                                        className="sr-only"
                                      />
                                      <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${formData.visualExploration[p.key]?.izq ? 'bg-brand-purple border-brand-purple text-white rotate-6 scale-110 shadow-lg shadow-brand-purple/20' : 'bg-white border-slate-200 hover:border-brand-purple'}`}>
                                        <Check className="w-4 h-4" />
                                      </div>
                                    </label>
                                  </div>
                                  <div className="col-span-3 flex justify-center">
                                    <label className="relative flex items-center justify-center p-1 cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        checked={formData.visualExploration[p.key]?.der || false} 
                                        onChange={() => toggleVisualCheckbox(p.key, 'der')}
                                        className="sr-only"
                                      />
                                      <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${formData.visualExploration[p.key]?.der ? 'bg-brand-purple border-brand-purple text-white rotate-6 scale-110 shadow-lg shadow-brand-purple/20' : 'bg-white border-slate-200 hover:border-brand-purple'}`}>
                                        <Check className="w-4 h-4" />
                                      </div>
                                    </label>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bloque B - Columna Derecha */}
                      <div className="bg-slate-50/40 p-6 sm:p-8 rounded-[2.5rem] border border-slate-100">
                        <h5 className="text-[11px] font-black text-brand-purple-dark bg-purple-50 p-2 px-4 rounded-xl uppercase tracking-widest inline-block mb-6">Padecimientos - Bloque B</h5>
                        
                        <div className="space-y-1">
                          <div className="grid grid-cols-12 mb-3 px-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <span className="col-span-6">Padecimiento</span>
                            <span className="col-span-3 text-center">Pie Izquierdo</span>
                            <span className="col-span-3 text-center">Pie Derecho</span>
                          </div>

                          {PADECIMIENTOS_DERECHA.map(p => (
                            <div key={p.key} className="grid grid-cols-12 items-center hover:bg-slate-50 group rounded-xl p-2.5 transition-colors border-b border-slate-100/50">
                              <span className="col-span-6 text-[11px] font-bold text-slate-700 group-hover:text-brand-purple transition-colors truncate pr-2">{p.label}</span>
                              
                              <div className="col-span-3 flex justify-center">
                                <label className="relative flex items-center justify-center p-1 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={formData.visualExploration[p.key]?.izq || false} 
                                    onChange={() => toggleVisualCheckbox(p.key, 'izq')}
                                    className="sr-only"
                                  />
                                  <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${formData.visualExploration[p.key]?.izq ? 'bg-brand-purple border-brand-purple text-white rotate-6 scale-110 shadow-lg shadow-brand-purple/20' : 'bg-white border-slate-200 hover:border-brand-purple'}`}>
                                    <Check className="w-4 h-4" />
                                  </div>
                                </label>
                              </div>
                              <div className="col-span-3 flex justify-center">
                                <label className="relative flex items-center justify-center p-1 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={formData.visualExploration[p.key]?.der || false} 
                                    onChange={() => toggleVisualCheckbox(p.key, 'der')}
                                    className="sr-only"
                                  />
                                  <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${formData.visualExploration[p.key]?.der ? 'bg-brand-purple border-brand-purple text-white rotate-6 scale-110 shadow-lg shadow-brand-purple/20' : 'bg-white border-slate-200 hover:border-brand-purple'}`}>
                                    <Check className="w-4 h-4" />
                                  </div>
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Observaciones visuales general */}
                    <div className="pt-4 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Otras observaciones visuales (Texto libre)</label>
                      <textarea
                        value={formData.otherVisualObservations}
                        onChange={e => setFormData({...formData, otherVisualObservations: e.target.value})}
                        placeholder="Escriba aquí cualquier otro hallazgo visual como cicatrices, lesiones cutáneas atípicas, etc..."
                        className="w-full p-5 bg-slate-50 border-2 border-slate-200 rounded-[2rem] text-xs font-bold text-slate-900 focus:border-brand-purple outline-none min-h-[100px] hover:border-slate-300 transition-colors focus:ring-4 focus:ring-brand-purple/5"
                      />
                    </div>
                  </div>

                  {/* --- SECTION 2: BIOMECÁNICOS / MORFOLÓGICOS CON DIAGRAMAS --- */}
                  <div className="space-y-10 pt-8 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-brand-purple border-b border-purple-50 pb-4">
                      <Ruler className="w-6 h-6 shrink-0" />
                      <h4 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tighter">2. Análisis Morfológico y Biomecánico</h4>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                      
                      {/* Tipo de Pie card layout */}
                      <div className="space-y-6">
                        <label className="text-sm font-black text-slate-800 uppercase tracking-tight block">Tipo de Pie (Morfología de Artejos)</label>
                        <p className="text-xs font-bold text-slate-400 leading-relaxed">De acuerdo a la longitud de los primeros metatarsianos:</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                          {PROFILES_PIE.map(item => {
                            const active = formData.footType === item.type;
                            return (
                              <button
                                key={item.type}
                                type="button"
                                onClick={() => setFormData({...formData, footType: item.type as any})}
                                className={`p-4 flex flex-col items-center justify-between text-center border-2 rounded-[2.5rem] transition-all duration-300 min-h-[190px] group ${active ? 'bg-gradient-to-b from-purple-50 to-white border-brand-purple shadow-xl shadow-brand-purple/10 scale-[1.03]' : 'bg-slate-50 border-slate-200 hover:border-brand-purple/40 hover:bg-white'}`}
                              >
                                {item.svg(active)}
                                <div className="mt-3">
                                  <p className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-brand-purple' : 'text-slate-800'}`}>{item.label}</p>
                                  <p className="text-[10px] text-slate-400 font-bold mt-1 leading-snug truncate max-w-[150px]">{item.desc}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tipo de Pisada layout */}
                      <div className="space-y-6">
                        <label className="text-sm font-black text-slate-800 uppercase tracking-tight block">Tipo de Pisada / Marcha (Alineación Retropié)</label>
                        <p className="text-xs font-bold text-slate-400 leading-relaxed">De acuerdo a la distribución dinámica del eje del talón:</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-3 gap-4">
                          {PROFILES_PISADA.map(item => {
                            const active = formData.stepType === item.type;
                            return (
                              <button
                                key={item.type}
                                type="button"
                                onClick={() => setFormData({...formData, stepType: item.type as any})}
                                className={`p-4 flex flex-col items-center justify-between text-center border-2 rounded-[2.5rem] transition-all duration-300 min-h-[190px] group ${active ? 'bg-gradient-to-b from-indigo-50 to-white border-indigo-500 shadow-xl shadow-indigo-500/10 scale-[1.03]' : 'bg-slate-50 border-slate-200 hover:border-indigo-500/40 hover:bg-white'}`}
                              >
                                {item.svg(active)}
                                <div className="mt-3">
                                  <p className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-indigo-600' : 'text-slate-800'}`}>{item.label}</p>
                                  <p className="text-[10px] text-slate-400 font-bold mt-1 leading-snug truncate max-w-[140px]">{item.desc}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* --- SECTION 3: EXPLORACIÓN FÍSICA MANUAL E INSTRUMENTADA --- */}
                  <div className="space-y-6 pt-8 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-brand-purple border-b border-purple-50 pb-4">
                      <Heart className="w-6 h-6 shrink-0" />
                      <h4 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tighter">3. Exploración Física Manual e Instrumentada</h4>
                    </div>

                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-50 p-3 px-5 rounded-2xl inline-block">
                      Evalúe y determine en forma bilateral si la respuesta a cada estímulo u orientación es Normal o Anormal.
                    </p>

                    <div className="overflow-x-auto border border-slate-200 rounded-[2.5rem] bg-white group shadow-inner">
                      <table className="w-full text-left border-collapse min-w-[650px]">
                        <thead>
                          <tr className="bg-slate-900 text-white rounded-[2.5rem]">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-200">Prueba Clínicos / Reflejos</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center border-x border-slate-800 w-1/3">Pie Derecho (DER)</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center w-1/3">Pie Izquierdo (IZQ)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {MANUAL_ITEMS.map(item => {
                            const stateObj = formData.manualExploration[item.key] || { der: 'Normal', izq: 'Normal' };
                            return (
                              <tr key={item.key} className="hover:bg-slate-50/55 transition-all">
                                <td className="px-8 py-5 text-xs font-black text-slate-800 italic">{item.label}</td>
                                
                                <td className="px-8 py-5 border-x border-slate-100/60">
                                  <div className="flex justify-center gap-3">
                                    {(['Normal', 'Anormal'] as const).map(value => (
                                      <button
                                        key={value}
                                        type="button"
                                        onClick={() => toggleManualStatus(item.key, 'der', value)}
                                        className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                          stateObj.der === value
                                            ? value === 'Normal'
                                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/10'
                                              : 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/10'
                                            : 'bg-white text-slate-400 border-slate-200 hover:border-slate-350'
                                        }`}
                                      >
                                        {value}
                                      </button>
                                    ))}
                                  </div>
                                </td>

                                <td className="px-8 py-5">
                                  <div className="flex justify-center gap-3">
                                    {(['Normal', 'Anormal'] as const).map(value => (
                                      <button
                                        key={value}
                                        type="button"
                                        onClick={() => toggleManualStatus(item.key, 'izq', value)}
                                        className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                                          stateObj.izq === value
                                            ? value === 'Normal'
                                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/10'
                                              : 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/10'
                                            : 'bg-white text-slate-400 border-slate-200 hover:border-slate-350'
                                        }`}
                                      >
                                        {value}
                                      </button>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* --- SECTION 4: DIAGNÓSTICOS --- */}
                  <div className="space-y-6 pt-8 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-brand-purple border-b border-purple-50 pb-4">
                      <Brain className="w-6 h-6 shrink-0" />
                      <h4 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tighter">4. Diagnósticos (Inputs de Texto)</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                      {[
                        { label: 'Dx. Biomecánico', key: 'biomechanical', placeholder: 'Ej. Fascitis plantar, pie plano valgo bilateral...' },
                        { label: 'Dx. Dermatológico', key: 'dermatological', placeholder: 'Ej. Tiña pedis interdigital, onicomicosis...' },
                        { label: 'Dx. Neurológico', key: 'neurological', placeholder: 'Ej. Sensibilidad conservada, neuropatía diabética leve...' },
                        { label: 'Dx. Vascular', key: 'vascular', placeholder: 'Ej. Pulsos distales presentes, llenado capilar rápido...' },
                      ].map(field => (
                        <div key={field.key} className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                          <textarea
                            value={(formData.diagnostics as any)[field.key]}
                            onChange={e => setFormData({
                              ...formData,
                              diagnostics: {
                                ...formData.diagnostics,
                                [field.key]: e.target.value
                              }
                            })}
                            placeholder={field.placeholder}
                            className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-[1.5rem] text-xs font-bold text-slate-900 focus:border-brand-purple outline-none min-h-[70px] hover:border-slate-350 transition-colors focus:ring-4 focus:ring-brand-purple/5"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* --- SECTION 5: PLAN TERAPÉUTICO Y REFERENCIAS --- */}
                  <div className="space-y-6 pt-8 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-brand-purple border-b border-purple-50 pb-4">
                      <ClipboardCheck className="w-6 h-6 shrink-0" />
                      <h4 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tighter">5. Plan Terapéutico, Referencia y Cierre</h4>
                    </div>

                    <div className="bg-slate-50 p-6 sm:p-10 rounded-[2.5rem] border border-slate-100 space-y-6 sm:space-y-8">
                      
                      {/* Referencia Médica toggling */}
                      <div className="flex flex-col md:flex-row md:items-center gap-6 sm:gap-8 justify-between bg-white p-6 rounded-3xl border border-slate-100">
                        <div className="space-y-1">
                          <span className="text-xs font-black text-slate-800 uppercase tracking-tight block">Terapéutica, ¿Requiere Referencia Especializada?</span>
                          <span className="text-[10px] text-slate-400 font-bold block">Marque si se canalizará a otro especialista de la salud.</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, reference: true})}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.reference ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                          >
                            Sí
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, reference: false, referenceTo: ''})}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${!formData.reference ? 'bg-slate-800 text-white border-slate-800 shadow-md shadow-slate-800/20' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                          >
                            No
                          </button>
                        </div>
                      </div>

                      {formData.reference && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">¿A quién se refiere? (Médico o Especialidad)</label>
                          <input
                            type="text"
                            value={formData.referenceTo}
                            onChange={e => setFormData({...formData, referenceTo: e.target.value})}
                            placeholder="Ej: Dr. Alfonso Ramos - Ángiólogo o Dr. Carlos Vega - Traumatología"
                            className="w-full p-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-brand-purple outline-none"
                          />
                        </div>
                      )}

                      {/* Plan de tratamiento ampliado */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Plan de Tratamiento / Terapéutica Detallada</label>
                        <textarea
                          value={formData.therapeuticPlan}
                          onChange={e => setFormData({...formData, therapeuticPlan: e.target.value})}
                          placeholder="Recomendaciones, tipo de calzado, tratamiento podológico integral sugerido or intervenciones necesarias..."
                          className="w-full p-5 bg-white border border-slate-200 rounded-[2rem] text-xs font-bold text-slate-900 focus:border-brand-purple outline-none min-h-[120px] resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* --- SECTION 6: FIRMAS Y RESPONSIVA --- */}
                  <div className="pt-8 border-t border-slate-100">
                    
                    {/* Legal responsiva box */}
                    <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-[2rem] text-slate-500 font-bold mb-10 text-[10px] sm:text-xs leading-relaxed flex items-start gap-3.5">
                      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <p>
                        <span className="font-extrabold text-slate-800 uppercase tracking-wide">Cláusula de Autorización Médica:</span> En este documento quedan impresos los datos que he proporcionado y afirmo que son verídicos, después de conocer el tratamiento a seguir que me ha sugerido, recibiendo con atención la información respectiva sobre el mismo, acepto y autorizo. De acuerdo con el artículo 4º de la Conamed este documento es confidencial e intransferible.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      
                      {/* Patient Signature */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2.5 text-slate-850">
                          <User className="w-5 h-5 text-brand-purple shrink-0" />
                          <h4 className="text-xs font-black uppercase tracking-widest text-slate-650">Firma De Enterado del Paciente</h4>
                        </div>
                        
                        <div className="bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-250 p-4 relative h-48 flex items-center justify-center overflow-hidden group">
                          {formData.patientSignature ? (
                            <img src={formData.patientSignature} alt="Patient Signature" className="max-h-full object-contain" />
                          ) : (
                            <SignatureCanvas
                              ref={patientSigCanvas}
                              penColor="#1e293b"
                              canvasProps={{ className: 'w-full h-full cursor-crosshair' }}
                            />
                          )}
                          {!formData.patientSignature && (
                            <button 
                              type="button"
                              onClick={() => patientSigCanvas.current?.clear()}
                              className="absolute bottom-4 right-4 text-[10px] font-black text-rose-500 bg-white/80 p-1.5 px-3 rounded-lg border shadow-sm transition-all"
                            >
                              Limpiar firma
                            </button>
                          )}
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Paciente</label>
                          <input 
                            type="text" 
                            readOnly 
                            value={patient.name} 
                            className="w-full p-4 bg-slate-55 border border-slate-200 rounded-2xl text-xs font-black text-slate-800"
                          />
                        </div>
                      </div>

                      {/* Specialist responsive */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2.5 text-slate-850">
                          <Award className="w-5 h-5 text-brand-purple shrink-0" />
                          <h4 className="text-xs font-black uppercase tracking-widest text-slate-650">Responsable de Diagnóstico (Profesional)</h4>
                        </div>

                        <div className="bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 text-white space-y-6 flex flex-col justify-between h-[18.2rem] shadow-lg">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Nombre del Profesional Tratante</label>
                            <input
                              type="text"
                              value={formData.professionalName}
                              onChange={e => setFormData({...formData, professionalName: e.target.value})}
                              placeholder="Ej. Dr. Lluvia G."
                              className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-black text-white focus:border-brand-purple outline-none"
                            />
                          </div>
                          
                          <div className="border-t border-white/10 pt-4 flex flex-col items-center justify-center">
                            <div className="w-40 h-16 bg-white/5 rounded-2xl border-2 border-dashed border-white/15 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity mb-2">
                              <span className="text-[10px] text-white font-black tracking-widest italic">SELLO OFICIAL</span>
                            </div>
                            <span className="text-[8px] font-black text-white/30 tracking-[0.2em] uppercase">Cédula de Especialista Podológica</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Back / Save flow block at footer */}
                <div className="bg-slate-50 p-8 flex justify-end gap-3 border-t border-slate-100">
                  {formData.id && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-4 bg-white hover:bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-200 transition-all"
                    >
                      Limpiar / Crear Nueva
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveForm}
                    disabled={isSaving}
                    className="px-8 py-4 bg-brand-purple hover:bg-brand-purple-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-brand-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {isSaving ? <CheckCircle2 className="w-4 h-4 animate-bounce" /> : <Save className="w-4 h-4" />}
                    <span>{isSaving ? 'Guardando...' : formData.id ? 'Guardar Cambios' : 'Finalizar y Guardar'}</span>
                  </button>
                </div>

              </div>
            </motion.div>

            {/* Historical Explorations List Section */}
            <div className="space-y-6 pt-12 border-t border-slate-200 mt-16 pb-12">
              <div className="flex items-center justify-between gap-4">
                 <div className="flex items-center gap-3">
                   <Activity className="w-6 h-6 text-brand-purple" />
                   <h3 className="text-xl font-display font-black text-slate-900 tracking-tight italic">Registros de Exploraciones Físicas Anteriores</h3>
                 </div>
                 <span className="px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full text-[10px] font-black uppercase tracking-widest">{history.length} Valoraciones</span>
              </div>

              {history.length === 0 ? (
                <div className="bg-white p-12 border-2 border-dashed border-slate-200 rounded-[3rem] shadow-sm flex flex-col items-center justify-center text-center max-w-2xl mx-auto mt-6">
                  <div className="w-16 h-16 bg-purple-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-purple-100 mb-4">
                    <Activity className="w-6 h-6 text-brand-purple animate-pulse" />
                  </div>
                  <h3 className="text-base font-black text-slate-900 mb-1 italic">Historial de Exploración Vacío</h3>
                  <p className="text-xs text-slate-450 font-bold max-w-md leading-relaxed">
                    Aún no se ha archivado ninguna valoración física para este paciente. Use el formulario superior para crear la primera.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {history.map((record, idx) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`bg-white p-8 rounded-[3rem] border transition-all duration-300 relative flex flex-col justify-between hover:shadow-xl ${
                        formData.id === record.id 
                          ? 'border-brand-purple ring-2 ring-brand-purple/10 bg-brand-purple/5' 
                          : 'border-slate-150 group'
                      }`}
                    >
                      <div className="absolute top-6 right-6 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={() => handleEdit(record)}
                          className="p-2 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-xl transition-all border border-sky-100 shrink-0"
                          title="Editar / Cargar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => exportPDF(record)}
                          className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-100 shrink-0"
                          title="Descargar PDF"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-all border border-rose-100 shrink-0"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <div className="flex items-start gap-4 mb-6">
                          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100 text-brand-purple font-bold">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 pr-16 truncate">
                            <span className="text-[8px] font-black text-brand-purple uppercase tracking-widest bg-brand-purple/5 p-1 px-2.5 rounded-lg inline-block">Valoración Física</span>
                            <h4 className="text-sm font-black text-slate-800 mt-2 truncate">Exploración del {record.date}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Folio: {record.id}</p>
                          </div>
                        </div>

                        {/* Summary metadata */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Morfología</span>
                            <span className="text-xs font-black text-brand-purple uppercase tracking-tight">{record.footType || 'Egipcio'}</span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Tipo Pisada</span>
                            <span className="text-xs font-black text-indigo-600 uppercase tracking-tight">{record.stepType || 'Neutro'}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 mb-6 text-xs text-slate-500 font-bold line-clamp-2">
                          {record.diagnostics?.biomechanical && (
                            <p className="truncate"><span className="text-slate-400 font-black uppercase text-[8px] tracking-wider block">Dx Biomecánico</span> {record.diagnostics.biomechanical}</p>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest">{record.professionalName}</span>
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-[9px] font-black text-brand-purple hover:underline decoration-brand-purple/20 uppercase tracking-widest"
                        >
                          Cargar en Formulario
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

        </AnimatePresence>
      </div>
      
    </div>
  );
}
