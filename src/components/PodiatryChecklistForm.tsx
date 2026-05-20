/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Save, 
  Trash2, 
  Edit2, 
  FileDown, 
  Plus, 
  FileText, 
  CheckCircle2, 
  User, 
  Calendar, 
  ClipboardList, 
  Check, 
  X,
  AlertCircle,
  Stethoscope,
  Users,
  Eye,
  Activity,
  Heart
} from 'lucide-react';
import { Patient } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface PodiatryChecklistFormProps {
  patient: Patient;
  onClose: () => void;
  patients?: Patient[];
  onPatientChange?: (p: Patient) => void;
}

export interface PodiatryChecklistRecord {
  id: string;
  patientId: string;
  date: string;
  expNumber: string;
  
  // 1. Datos Personales
  personalData: {
    fullName: string;
    age: number;
    dob: string;
    address: string;
    sex: string;
    phone: string;
    occupation: string;
    maritalStatus: string;
    education: string;
    email: string;
  };
  
  // 2. Padecimiento Actual
  currentCondition: {
    reason: string;
    firstSymptomDate: string;
    location: string;
    modifyingCircumstance: string;
    painType: string;
    intensity: string;
  };

  // 3. Antecedentes Familiares
  familyHistory: {
    diabetes: boolean;
    hypertension: boolean;
    hypotension: boolean;
    rheumatoidArthritis: boolean;
    cardiopatria: boolean;
    osteoarticular: boolean;
    circulatorias: boolean;
    dermatologicas: boolean;
    alergias: boolean;
    explain: string;
  };

  // 4. Antecedentes Patológicos
  pathologicalHistory: {
    cardiovascular: boolean;
    pulmonar: boolean;
    renales: boolean;
    gastrointestinal: boolean;
    hematologica: boolean;
    endocrinas: boolean;
    mentales: boolean;
    dermatologicas: boolean;
    neurologicas: boolean;
    metabolicas: boolean;
    cardiopatia: boolean;
    marcapasos: boolean;
    neuropatia: boolean;
    diabetes: boolean;
    cancer: boolean;
    convulsiones: boolean;
    hypertension: boolean;
    hypotension: boolean;
    hypertiroidismo: boolean;
    hypotiroidismo: boolean;
    explain: string;
  };

  // 5. Antecedentes No Patológicos
  nonPathologicalHistory: {
    tabaquismo: boolean;
    alcohol: boolean;
    drogas: boolean;
    estrenimiento: boolean;
    ansiedad: boolean;
    estres: boolean;
    polidisplasia: boolean;
    embarazo: boolean;
    trastornoSueno: boolean;
    ingestaLiquidos: boolean;
    tatuajes: boolean;
    lactancia: boolean;
    protesis: boolean;
    marcapasos: boolean;
    deporte: boolean;
    sedentarismo: boolean;
    traumatismos: boolean;
    medicamentos: boolean;
    alergias: boolean;
    cuidadosCorporales: boolean;
    explain: string;
  };

  // 6. Medicamentos Actuales y Dosificación
  medications: {
    name: string;
    dosage: string;
  }[];
}

const STORAGE_KEY = 'medical_dlis_podiatry_checklists';

export default function PodiatryChecklistForm({ patient, onClose, patients, onPatientChange }: PodiatryChecklistFormProps) {
  const [records, setRecords] = useState<PodiatryChecklistRecord[]>([]);
  const [viewState, setViewState] = useState<'list' | 'form' | 'details'>('form');
  const [selectedRecord, setSelectedRecord] = useState<PodiatryChecklistRecord | null>(null);
  
  const [formData, setFormData] = useState<PodiatryChecklistRecord>({
    id: '',
    patientId: patient.id,
    date: new Date().toISOString().split('T')[0],
    expNumber: `EXP-POD-${Math.floor(1000 + Math.random() * 9000)}`,
    personalData: {
      fullName: patient.name,
      age: patient.age || 0,
      dob: '',
      address: '',
      sex: patient.gender || '',
      phone: patient.phone || '',
      occupation: '',
      maritalStatus: '',
      education: '',
      email: patient.email || '',
    },
    currentCondition: {
      reason: '',
      firstSymptomDate: '',
      location: '10 artejos',
      modifyingCircumstance: '',
      painType: '',
      intensity: '5'
    },
    familyHistory: {
      diabetes: false,
      hypertension: false,
      hypotension: false,
      rheumatoidArthritis: false,
      cardiopatria: false,
      osteoarticular: false,
      circulatorias: false,
      dermatologicas: false,
      alergias: false,
      explain: ''
    },
    pathologicalHistory: {
      cardiovascular: false,
      pulmonar: false,
      renales: false,
      gastrointestinal: false,
      hematologica: false,
      endocrinas: false,
      mentales: false,
      dermatologicas: false,
      neurologicas: false,
      metabolicas: false,
      cardiopatia: false,
      marcapasos: false,
      neuropatia: false,
      diabetes: false,
      cancer: false,
      convulsiones: false,
      hypertension: false,
      hypotension: false,
      hypertiroidismo: false,
      hypotiroidismo: false,
      explain: ''
    },
    nonPathologicalHistory: {
      tabaquismo: false,
      alcohol: false,
      drogas: false,
      estrenimiento: false,
      ansiedad: false,
      estres: false,
      polidisplasia: false,
      embarazo: false,
      trastornoSueno: false,
      ingestaLiquidos: false,
      tatuajes: false,
      lactancia: false,
      protesis: false,
      marcapasos: false,
      deporte: false,
      sedentarismo: false,
      traumatismos: false,
      medicamentos: false,
      alergias: false,
      cuidadosCorporales: false,
      explain: ''
    },
    medications: [
      { name: '', dosage: '' }
    ]
  });

  const [activeTab, setActiveTab] = useState<'personal' | 'current' | 'family' | 'pathological' | 'nonPathological' | 'meds'>('personal');
  const [isSaving, setIsSaving] = useState(false);

  // Load records from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const allRecords: PodiatryChecklistRecord[] = JSON.parse(saved);
      // Filter for active patient
      setRecords(allRecords.filter(r => r.patientId === patient.id));
    } else {
      // Mock records if not present
      const mockRecords: PodiatryChecklistRecord[] = [
        {
          id: 'CHECK-POD-101',
          patientId: patient.id,
          date: '2026-05-18',
          expNumber: 'EXP-POD-9281',
          personalData: {
            fullName: patient.name,
            age: patient.age || 45,
            dob: '1981-04-12',
            address: 'Calle Juárez 405, Col. Centro',
            sex: patient.gender || 'Masculino',
            phone: patient.phone || '5543210987',
            occupation: 'Oficinista',
            maritalStatus: 'Casado/a',
            education: 'Licenciatura',
            email: patient.email || 'andres.portillo@email.com',
          },
          currentCondition: {
            reason: 'Dolor punzante e inflamación en primer artejo del pie derecho debido a uña incrustada (onicocriptosis crónica). Dificultad para calzar.',
            firstSymptomDate: '2026-05-10',
            location: '1er artejo derecho',
            modifyingCircumstance: 'Aumenta al caminar o usar calzado cerrado.',
            painType: 'Punzante / Latido',
            intensity: '8'
          },
          familyHistory: {
            diabetes: true,
            hypertension: true,
            hypotension: false,
            rheumatoidArthritis: false,
            cardiopatria: false,
            osteoarticular: true,
            circulatorias: false,
            dermatologicas: false,
            alergias: false,
            explain: 'Madre padece diabetes tipo 2 e hipertensión. Abuelo materno con antecedentes de artrosis.'
          },
          pathologicalHistory: {
            cardiovascular: false,
            pulmonar: false,
            renales: false,
            gastrointestinal: true,
            hematologica: false,
            endocrinas: false,
            mentales: false,
            dermatologicas: false,
            neurologicas: false,
            metabolicas: false,
            cardiopatia: false,
            marcapasos: false,
            neuropatia: false,
            diabetes: false,
            cancer: false,
            convulsiones: false,
            hypertension: false,
            hypotension: false,
            hypertiroidismo: false,
            hypotiroidismo: false,
            explain: 'Gastritis crónica en tratamiento leve.'
          },
          nonPathologicalHistory: {
            tabaquismo: false,
            alcohol: true,
            drogas: false,
            estrenimiento: false,
            ansiedad: true,
            estres: true,
            polidisplasia: false,
            embarazo: false,
            trastornoSueno: false,
            ingestaLiquidos: true,
            tatuajes: false,
            lactancia: false,
            protesis: false,
            marcapasos: false,
            deporte: false,
            sedentarismo: true,
            traumatismos: false,
            medicamentos: false,
            alergias: false,
            cuidadosCorporales: false,
            explain: 'Consumo social ocasional de alcohol. Altos niveles de estrés laboral y sedentarismo habitual.'
          },
          medications: [
            { name: 'Omeprazol 20mg', dosage: '1 cápsula en ayunas' },
            { name: 'Paracetamol 500mg', dosage: 'Cada 8 horas si hay dolor' }
          ]
        }
      ];
      setRecords(mockRecords.filter(r => r.patientId === patient.id));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockRecords));
    }

    // Reset Form clean and ready for target patient
    setFormData({
      id: '',
      patientId: patient.id,
      date: new Date().toISOString().split('T')[0],
      expNumber: `EXP-POD-${Math.floor(1000 + Math.random() * 9000)}`,
      personalData: {
        fullName: patient.name,
        age: patient.age || 0,
        dob: '',
        address: '',
        sex: patient.gender || 'Masculino',
        phone: patient.phone || '',
        occupation: '',
        maritalStatus: 'Soltero/a',
        education: 'Licenciatura',
        email: patient.email || '',
      },
      currentCondition: {
        reason: '',
        firstSymptomDate: '',
        location: '10 artejos',
        modifyingCircumstance: '',
        painType: '',
        intensity: '5'
      },
      familyHistory: {
        diabetes: false,
        hypertension: false,
        hypotension: false,
        rheumatoidArthritis: false,
        cardiopatria: false,
        osteoarticular: false,
        circulatorias: false,
        dermatologicas: false,
        alergias: false,
        explain: ''
      },
      pathologicalHistory: {
        cardiovascular: false,
        pulmonar: false,
        renales: false,
        gastrointestinal: false,
        hematologica: false,
        endocrinas: false,
        mentales: false,
        dermatologicas: false,
        neurologicas: false,
        metabolicas: false,
        cardiopatia: false,
        marcapasos: false,
        neuropatia: false,
        diabetes: false,
        cancer: false,
        convulsiones: false,
        hypertension: false,
        hypotension: false,
        hypertiroidismo: false,
        hypotiroidismo: false,
        explain: ''
      },
      nonPathologicalHistory: {
        tabaquismo: false,
        alcohol: false,
        drogas: false,
        estrenimiento: false,
        ansiedad: false,
        estres: false,
        polidisplasia: false,
        embarazo: false,
        trastornoSueno: false,
        ingestaLiquidos: false,
        tatuajes: false,
        lactancia: false,
        protesis: false,
        marcapasos: false,
        deporte: false,
        sedentarismo: false,
        traumatismos: false,
        medicamentos: false,
        alergias: false,
        cuidadosCorporales: false,
        explain: ''
      },
      medications: [
        { name: '', dosage: '' }
      ]
    });
    setViewState('form');
  }, [patient.id]);

  const handleAddNew = () => {
    setFormData({
      id: '',
      patientId: patient.id,
      date: new Date().toISOString().split('T')[0],
      expNumber: `EXP-POD-${Math.floor(1000 + Math.random() * 9000)}`,
      personalData: {
        fullName: patient.name,
        age: patient.age || 0,
        dob: '',
        address: '',
        sex: patient.gender || 'Masculino',
        phone: patient.phone || '',
        occupation: '',
        maritalStatus: 'Soltero/a',
        education: 'Licenciatura',
        email: patient.email || '',
      },
      currentCondition: {
        reason: '',
        firstSymptomDate: '',
        location: '10 artejos',
        modifyingCircumstance: '',
        painType: '',
        intensity: '5'
      },
      familyHistory: {
        diabetes: false,
        hypertension: false,
        hypotension: false,
        rheumatoidArthritis: false,
        cardiopatria: false,
        osteoarticular: false,
        circulatorias: false,
        dermatologicas: false,
        alergias: false,
        explain: ''
      },
      pathologicalHistory: {
        cardiovascular: false,
        pulmonar: false,
        renales: false,
        gastrointestinal: false,
        hematologica: false,
        endocrinas: false,
        mentales: false,
        dermatologicas: false,
        neurologicas: false,
        metabolicas: false,
        cardiopatia: false,
        marcapasos: false,
        neuropatia: false,
        diabetes: false,
        cancer: false,
        convulsiones: false,
        hypertension: false,
        hypotension: false,
        hypertiroidismo: false,
        hypotiroidismo: false,
        explain: ''
      },
      nonPathologicalHistory: {
        tabaquismo: false,
        alcohol: false,
        drogas: false,
        estrenimiento: false,
        ansiedad: false,
        estres: false,
        polidisplasia: false,
        embarazo: false,
        trastornoSueno: false,
        ingestaLiquidos: false,
        tatuajes: false,
        lactancia: false,
        protesis: false,
        marcapasos: false,
        deporte: false,
        sedentarismo: false,
        traumatismos: false,
        medicamentos: false,
        alergias: false,
        cuidadosCorporales: false,
        explain: ''
      },
      medications: [
        { name: '', dosage: '' }
      ]
    });
    setActiveTab('personal');
    setViewState('form');
  };

  const handleAddMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { name: '', dosage: '' }]
    });
  };

  const handleRemoveMedication = (index: number) => {
    const updated = formData.medications.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      medications: updated.length > 0 ? updated : [{ name: '', dosage: '' }]
    });
  };

  const handleMedicationChange = (index: number, field: 'name' | 'dosage', value: string) => {
    const updated = [...formData.medications];
    updated[index][field] = value;
    setFormData({ ...formData, medications: updated });
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      const saved = localStorage.getItem(STORAGE_KEY);
      const allRecords: PodiatryChecklistRecord[] = saved ? JSON.parse(saved) : [];
      
      let finalRecords: PodiatryChecklistRecord[] = [];
      const updatedRecord = {
        ...formData,
        id: formData.id || `CHECK-POD-${Math.floor(1000 + Math.random() * 9000)}`
      };

      if (formData.id) {
        // Edit
        finalRecords = allRecords.map(r => r.id === formData.id ? updatedRecord : r);
      } else {
        // Add
        finalRecords = [updatedRecord, ...allRecords];
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(finalRecords));
      // Re-load patient records
      setRecords(finalRecords.filter(r => r.patientId === patient.id));
      setViewState('form');
      setIsSaving(false);
      handleAddNew();
      alert('Chequeo / Historia Clínica Guardada Exitosamente. Podrá ver el expediente médico actualizado abajo.');
    }, 800);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este checklist de historia clínica definitivamente?')) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const allRecords: PodiatryChecklistRecord[] = JSON.parse(saved);
        const filtered = allRecords.filter(r => r.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        setRecords(filtered.filter(r => r.patientId === patient.id));
      }
    }
  };

  const handleEdit = (rec: PodiatryChecklistRecord) => {
    setFormData(rec);
    setActiveTab('personal');
    setViewState('form');
  };

  const handleViewDetails = (rec: PodiatryChecklistRecord) => {
    setSelectedRecord(rec);
    setViewState('details');
  };

  const handleCheckboxChange = (
    section: 'familyHistory' | 'pathologicalHistory' | 'nonPathologicalHistory',
    key: string,
    checked: boolean
  ) => {
    setFormData({
      ...formData,
      [section]: {
        ...(formData[section] as any),
        [key]: checked
      }
    });
  };

  // PDF Export
  const exportPDF = (record: PodiatryChecklistRecord) => {
    const doc = new jsPDF();
    const logoUrl = 'https://cossma.com.mx/medical.png';
    
    // Header Style
    doc.addImage(logoUrl, 'PNG', 10, 10, 35, 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(107, 33, 168); // Brand Purple Color
    doc.text("MEDICAL D'LIS", 50, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("CLÍNICA MÉDICA Y ESTÉTICA", 50, 23);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text("CHECKLIST GENERAL: HISTORIA CLÍNICA (PODOLOGÍA)", 50, 29);
    
    // Metadata right align
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Expediente N°: ${record.expNumber}`, 155, 17);
    doc.text(`Fecha: ${record.date}`, 155, 22);

    doc.setDrawColor(233, 213, 255); // light purple row
    doc.setLineWidth(0.5);
    doc.line(10, 33, 200, 33);

    let currentY = 38;

    // 1. DATOS PERSONALES
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 33, 168);
    doc.text("1. DATOS PERSONALES", 10, currentY);
    currentY += 4;

    const pers = record.personalData;
    (doc as any).autoTable({
      startY: currentY,
      body: [
        ["Nombre Completo", pers.fullName, "Edad", `${pers.age} años`],
        ["Fec. Nacimiento", pers.dob || 'N/E', "Sexo", pers.sex || 'N/E'],
        ["Domicilio", pers.address || 'N/E', "Teléfono", pers.phone || 'N/E'],
        ["Ocupación", pers.occupation || 'N/E', "Estado Civil", pers.maritalStatus || 'N/E'],
        ["Escolaridad", pers.education || 'N/E', "Email", pers.email || 'N/E']
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, font: 'helvetica' },
      columnStyles: {
        0: { fontStyle: 'bold', width: 30, fillColor: [250, 245, 255] },
        2: { fontStyle: 'bold', width: 25, fillColor: [250, 245, 255] }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // 2. PADECIMIENTO ACTUAL
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 33, 168);
    doc.text("2. PADECIMIENTO ACTUAL", 10, currentY);
    currentY += 4;

    const cond = record.currentCondition;
    (doc as any).autoTable({
      startY: currentY,
      body: [
        ["Motivo de la consulta", cond.reason || 'Sín especificar'],
        ["Fecha del primer síntoma", cond.firstSymptomDate || 'N/E'],
        ["Localización", cond.location || '10 artejos'],
        ["Circunstancia que lo modifica", cond.modifyingCircumstance || 'N/E'],
        ["Tipo de dolor", cond.painType || 'N/E'],
        ["Intensidad / Escala Dolor", `${cond.intensity} de 10`]
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', width: 45, fillColor: [250, 245, 255] }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // 3. ANTECEDENTES FAMILIARES
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 33, 168);
    doc.text("3. ANTECEDENTES FAMILIARES", 10, currentY);
    currentY += 4;

    const fam = record.familyHistory;
    const activeFam = Object.entries(fam)
      .filter(([k, v]) => k !== 'explain' && v === true)
      .map(([k]) => k.toUpperCase())
      .join(', ');

    (doc as any).autoTable({
      startY: currentY,
      body: [
        ["Signos Positivos", activeFam || "Ninguno marcado"],
        ["Explicación/Detalle", fam.explain || "Sin observaciones adicionales"]
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2.5 },
      columnStyles: {
        0: { fontStyle: 'bold', width: 45, fillColor: [250, 245, 255] }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // Add page if needed
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    // 4. ANTECEDENTES PATOLÓGICOS
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 33, 168);
    doc.text("4. ANTECEDENTES PATOLÓGICOS", 10, currentY);
    currentY += 4;

    const pat = record.pathologicalHistory;
    const activePat = Object.entries(pat)
      .filter(([k, v]) => k !== 'explain' && v === true)
      .map(([k]) => k.toUpperCase())
      .join(', ');

    (doc as any).autoTable({
      startY: currentY,
      body: [
        ["Patologías Positivas", activePat || "Ninguna marcada"],
        ["Explicación/Detalle", pat.explain || "Sin observaciones adicionales"]
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2.5 },
      columnStyles: {
        0: { fontStyle: 'bold', width: 45, fillColor: [250, 245, 255] }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // Add page if needed
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    // 5. ANTECEDENTES NO PATOLÓGICOS
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 33, 168);
    doc.text("5. ANTECEDENTES NO PATOLÓGICOS", 10, currentY);
    currentY += 4;

    const npat = record.nonPathologicalHistory;
    const activeNpat = Object.entries(npat)
      .filter(([k, v]) => k !== 'explain' && v === true)
      .map(([k]) => k.toUpperCase())
      .join(', ');

    (doc as any).autoTable({
      startY: currentY,
      body: [
        ["Hábitos Positivos", activeNpat || "Ninguno marcado"],
        ["Explicación/Detalle", npat.explain || "Sin observaciones adicionales"]
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2.5 },
      columnStyles: {
        0: { fontStyle: 'bold', width: 45, fillColor: [250, 245, 255] }
      }
    });

    currentY = (doc as any).lastAutoTable.finalY + 6;

    // Add page if needed
    if (currentY > 220) {
      doc.addPage();
      currentY = 20;
    }

    // 6. MEDICAMENTOS ACTUALES Y DOSIFICACIÓN
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 33, 168);
    doc.text("6. MEDICAMENTOS ACTUALES Y DOSIFICACIÓN", 10, currentY);
    currentY += 4;

    const medRows = record.medications.filter(m => m.name.trim() !== '').map(m => [m.name, m.dosage]);
    
    (doc as any).autoTable({
      startY: currentY,
      head: [["Nombre del Medicamento", "Dosificación / Frecuencia"]],
      body: medRows.length > 0 ? medRows : [["No requiere medicamentos activos", "-"]],
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [107, 33, 168] }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    if (currentY > 260) {
      doc.addPage();
      currentY = 30;
    }

    // Footnotes/Signatures
    doc.setDrawColor(200, 200, 200);
    doc.line(40, currentY, 90, currentY);
    doc.line(120, currentY, 170, currentY);
    currentY += 4;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text("FIRMA DEL PACIENTE", 50, currentY);
    doc.text("FIRMA DEL ESPECIALISTA", 130, currentY);

    doc.setFont('helvetica', 'normal');
    currentY += 4;
    doc.text(record.personalData.fullName, 45, currentY);
    doc.text("Dra. Lluvia G. (Podóloga)", 125, currentY);

    doc.save(`Checklist_HC_Podologia_${record.personalData.fullName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50">
      
      {/* Dynamic Header */}
      <header className="px-6 py-6 bg-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 hover:text-brand-purple transition-all border border-slate-100 shadow-sm shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
              Podología Activa
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight leading-none italic mt-2 flex items-center gap-2">
              Checklist General: <span className="text-brand-purple">Historia Clínica Podológica</span>
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

         <div>
          {viewState === 'details' ? (
            <button 
              onClick={() => setViewState('form')}
              className="bg-slate-900 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
            >
              Cerrar Vista Detalles
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {formData.id && (
                <button 
                  onClick={handleAddNew}
                  className="bg-slate-150 hover:bg-slate-200 text-slate-700 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-slate-200"
                >
                  <Plus className="w-4 h-4" />
                  Limpiar / Nuevo Checklist
                </button>
              )}
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className={`bg-brand-purple text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-purple-dark transition-all shadow-xl shadow-brand-purple/25 ${isSaving ? 'opacity-80' : ''}`}
              >
                {isSaving ? (
                  <Activity className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{formData.id ? 'Guardar Cambios' : 'Guardar Ficha'}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <AnimatePresence mode="wait">
          
          {viewState !== 'details' && (
            <motion.div 
              key="form-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Form Sidebar Navigation */}
                <div className="space-y-2 lg:col-span-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 pl-3">Secciones del Formularo</p>
                  {[
                    { id: 'personal', label: '1. Datos Personales', icon: User },
                    { id: 'current', label: '2. Padecimiento', icon: Stethoscope },
                    { id: 'family', label: '3. Ant. Familiares', icon: Users },
                    { id: 'pathological', label: '4. Ant. Patológicos', icon: AlertCircle },
                    { id: 'nonPathological', label: '5. Ant. No Patológicos', icon: Heart },
                    { id: 'meds', label: '6. Medicamentos', icon: Activity }
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left text-xs font-black transition-all ${activeTab === tab.id ? 'bg-brand-purple text-white shadow-xl shadow-brand-purple/20' : 'text-slate-500 bg-white hover:bg-slate-100'}`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Form Panels Container */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm lg:col-span-3">
                  
                  {/* TAB 1: DATOS PERSONALES */}
                  {activeTab === 'personal' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 h-auto leading-none italic">1. Datos Personales</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Información demográfica básica del paciente</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">Fecha de Registro</label>
                          <input 
                            type="date" 
                            value={formData.date} 
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-brand-purple rounded-xl text-xs font-bold outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">N° Expediente</label>
                          <input 
                            type="text" 
                            value={formData.expNumber} 
                            onChange={e => setFormData({ ...formData, expNumber: e.target.value })}
                            className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-brand-purple rounded-xl text-xs font-bold outline-none"
                          />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">Nombre Completo</label>
                          <input 
                            type="text" 
                            value={formData.personalData.fullName} 
                            onChange={e => setFormData({ ...formData, personalData: { ...formData.personalData, fullName: e.target.value } })}
                            className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-brand-purple rounded-xl text-xs font-bold' outline-none text-xs font-bold"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">Edad</label>
                          <input 
                            type="number" 
                            value={formData.personalData.age || ''} 
                            onChange={e => setFormData({ ...formData, personalData: { ...formData.personalData, age: Number(e.target.value) } })}
                            className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-brand-purple rounded-xl text-xs font-bold outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">Fecha de Nacimiento</label>
                          <input 
                            type="date" 
                            value={formData.personalData.dob} 
                            onChange={e => setFormData({ ...formData, personalData: { ...formData.personalData, dob: e.target.value } })}
                            className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-brand-purple rounded-xl text-xs font-bold outline-none"
                          />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">Domicilio</label>
                          <input 
                            type="text" 
                            placeholder="Calle, Número, Colonia, C.P."
                            value={formData.personalData.address} 
                            onChange={e => setFormData({ ...formData, personalData: { ...formData.personalData, address: e.target.value } })}
                            className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-brand-purple rounded-xl text-xs font-bold outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">Teléfono (10 dígitos)</label>
                          <input 
                            type="tel" 
                            maxLength={10}
                            placeholder="Ej. 5512345678"
                            value={formData.personalData.phone} 
                            onChange={e => setFormData({ ...formData, personalData: { ...formData.personalData, phone: e.target.value.replace(/\D/g, '') } })}
                            className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-brand-purple rounded-xl text-xs font-bold outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">Sexo</label>
                          <select 
                            value={formData.personalData.sex} 
                            onChange={e => setFormData({ ...formData, personalData: { ...formData.personalData, sex: e.target.value } })}
                            className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-brand-purple rounded-xl text-xs font-bold outline-none cursor-pointer"
                          >
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">Ocupación</label>
                          <input 
                            type="text" 
                            value={formData.personalData.occupation} 
                            onChange={e => setFormData({ ...formData, personalData: { ...formData.personalData, occupation: e.target.value } })}
                            className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-brand-purple rounded-xl text-xs font-bold outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">Estado Civil</label>
                          <select 
                            value={formData.personalData.maritalStatus} 
                            onChange={e => setFormData({ ...formData, personalData: { ...formData.personalData, maritalStatus: e.target.value } })}
                            className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-brand-purple rounded-xl text-xs font-bold outline-none cursor-pointer"
                          >
                            <option value="Soltero/a">Soltero/a</option>
                            <option value="Casado/a">Casado/a</option>
                            <option value="Divorciado/a">Divorciado/a</option>
                            <option value="Viudo/a">Viudo/a</option>
                            <option value="Unión Libre">Unión Libre</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">Escolaridad</label>
                          <select 
                            value={formData.personalData.education} 
                            onChange={e => setFormData({ ...formData, personalData: { ...formData.personalData, education: e.target.value } })}
                            className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-brand-purple rounded-xl text-xs font-bold outline-none cursor-pointer"
                          >
                            <option value="Ninguna">Ninguna</option>
                            <option value="Primaria">Primaria</option>
                            <option value="Secundaria">Secundaria</option>
                            <option value="Preparatoria">Preparatoria</option>
                            <option value="Licenciatura">Licenciatura</option>
                            <option value="Posgrado">Posgrado</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">E-Mail</label>
                          <input 
                            type="email" 
                            value={formData.personalData.email} 
                            onChange={e => setFormData({ ...formData, personalData: { ...formData.personalData, email: e.target.value } })}
                            className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-brand-purple rounded-xl text-xs font-bold outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: PADECIMIENTO ACTUAL */}
                  {activeTab === 'current' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 h-auto leading-none italic">2. Padecimiento Actual</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Motivo principal de su consulta actual</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">Motivo de consulta</label>
                          <textarea 
                            rows={4}
                            placeholder="Describa extensamente los síntomas, quejas y el dolor del paciente..."
                            value={formData.currentCondition.reason} 
                            onChange={e => setFormData({ ...formData, currentCondition: { ...formData.currentCondition, reason: e.target.value } })}
                            className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-brand-purple rounded-xl text-xs font-bold outline-none resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">Fecha 1er Síntoma</label>
                            <input 
                              type="date" 
                              value={formData.currentCondition.firstSymptomDate} 
                              onChange={e => setFormData({ ...formData, currentCondition: { ...formData.currentCondition, firstSymptomDate: e.target.value } })}
                              className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-brand-purple rounded-xl text-xs font-bold outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">Localización</label>
                            <input 
                              type="text" 
                              placeholder="Ej. 1er artejo derecho, talón izquierdo, etc."
                              value={formData.currentCondition.location} 
                              onChange={e => setFormData({ ...formData, currentCondition: { ...formData.currentCondition, location: e.target.value } })}
                              className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-brand-purple rounded-xl text-xs font-bold outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">Circunstancia que lo modifica</label>
                            <input 
                              type="text" 
                              placeholder="Ej. Calzado cerrado, caminatas, reposo"
                              value={formData.currentCondition.modifyingCircumstance} 
                              onChange={e => setFormData({ ...formData, currentCondition: { ...formData.currentCondition, modifyingCircumstance: e.target.value } })}
                              className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-brand-purple rounded-xl text-xs font-bold outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">Tipo de dolor</label>
                            <input 
                              type="text" 
                              placeholder="Ej. Sordo, punzante, quemante, punzocortante"
                              value={formData.currentCondition.painType} 
                              onChange={e => setFormData({ ...formData, currentCondition: { ...formData.currentCondition, painType: e.target.value } })}
                              className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-brand-purple rounded-xl text-xs font-bold outline-none"
                            />
                          </div>

                          <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider ml-1 block mb-2">
                              Intensidad del Dolor (Escala EVA): <span className="text-brand-purple font-extrabold text-sm">{formData.currentCondition.intensity}</span>/10
                            </label>
                            <input 
                              type="range" 
                              min="0"
                              max="10"
                              step="1"
                              value={formData.currentCondition.intensity} 
                              onChange={e => setFormData({ ...formData, currentCondition: { ...formData.currentCondition, intensity: e.target.value } })}
                              className="w-full accent-brand-purple cursor-pointer bg-slate-100 rounded-lg appearance-none h-2"
                            />
                            <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-1 uppercase">
                              <span>Sin Dolor (0)</span>
                              <span>Soportable (5)</span>
                              <span>Inmisericorde (10)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: ANTECEDENTES FAMILIARES */}
                  {activeTab === 'family' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 h-auto leading-none italic">3. Antecedentes Familiares</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Patologías relevantes en familiares directos</p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                          { key: 'diabetes', label: 'Diabetes' },
                          { key: 'hypertension', label: 'Hipertensión' },
                          { key: 'hypotension', label: 'Hipotensión' },
                          { key: 'rheumatoidArthritis', label: 'Artritis reumatoide' },
                          { key: 'cardiopatria', label: 'Cardiopatía' },
                          { key: 'osteoarticular', label: 'Osteoarticular' },
                          { key: 'circulatorias', label: 'Circulatorias' },
                          { key: 'dermatologicas', label: 'Dermatológicas' },
                          { key: 'alergias', label: 'Alergias' }
                        ].map(item => (
                          <label 
                            key={item.key} 
                            className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-purple-50 hover:border-purple-200 transition-all select-none group"
                          >
                            <span className="text-[11px] font-bold text-slate-700 group-hover:text-brand-purple transition-colors truncate">{item.label}</span>
                            <div className="relative">
                              <input 
                                type="checkbox" 
                                checked={(formData.familyHistory as any)[item.key]}
                                onChange={e => handleCheckboxChange('familyHistory', item.key, e.target.checked)}
                                className="peer hidden"
                              />
                              <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-brand-purple peer-checked:border-brand-purple flex items-center justify-center transition-colors">
                                <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>

                      <div className="space-y-1.5 pt-4">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">Explique (Detalle positivos)</label>
                        <textarea 
                          rows={4}
                          placeholder="Escriba el detalle de los antecedentes familiares positivos de arriba..."
                          value={formData.familyHistory.explain} 
                          onChange={e => setFormData({ ...formData, familyHistory: { ...formData.familyHistory, explain: e.target.value } })}
                          className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-brand-purple rounded-xl text-xs font-bold outline-none resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 4: ANTECEDENTES PATOLÓGICOS */}
                  {activeTab === 'pathological' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 h-auto leading-none italic">4. Antecedentes Patológicos</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Historial médico y enfermedades diagnosticadas del paciente</p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { key: 'cardiovascular', label: 'Cardiovascular' },
                          { key: 'pulmonar', label: 'Pulmonar' },
                          { key: 'renales', label: 'Renales' },
                          { key: 'gastrointestinal', label: 'Gastrointestinal' },
                          { key: 'hematologica', label: 'Hematológica' },
                          { key: 'endocrinas', label: 'Endocrinas' },
                          { key: 'mentales', label: 'Mentales' },
                          { key: 'dermatologicas', label: 'Dermatológicas' },
                          { key: 'neurologicas', label: 'Neurológicas' },
                          { key: 'metabolicas', label: 'Metabólicas' },
                          { key: 'cardiopatia', label: 'Cardiopatía' },
                          { key: 'marcapasos', label: 'Marcapasos' },
                          { key: 'neuropatia', label: 'Neuropatía' },
                          { key: 'diabetes', label: 'Diabetes' },
                          { key: 'cancer', label: 'Cáncer' },
                          { key: 'convulsiones', label: 'Convulsiones' },
                          { key: 'hypertension', label: 'Hipertensión' },
                          { key: 'hypotension', label: 'Hipotensión' },
                          { key: 'hypertiroidismo', label: 'Hipertiroidismo' },
                          { key: 'hypotiroidismo', label: 'Hypotiroidismo' }
                        ].map(item => (
                          <label 
                            key={item.key} 
                            className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-purple-50 hover:border-purple-200 transition-all select-none group"
                          >
                            <span className="text-[11px] font-bold text-slate-700 group-hover:text-brand-purple transition-colors truncate">{item.label}</span>
                            <div className="relative">
                              <input 
                                type="checkbox" 
                                checked={(formData.pathologicalHistory as any)[item.key]}
                                onChange={e => handleCheckboxChange('pathologicalHistory', item.key, e.target.checked)}
                                className="peer hidden"
                              />
                              <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-brand-purple peer-checked:border-brand-purple flex items-center justify-center transition-colors">
                                <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>

                      <div className="space-y-1.5 pt-4">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">Explique (Detalle positivos de arriba)</label>
                        <textarea 
                          rows={4}
                          placeholder="Ej. fibrosis pulmonar hace 3 años, infarto cerebral con secuela leve, etc."
                          value={formData.pathologicalHistory.explain} 
                          onChange={e => setFormData({ ...formData, pathologicalHistory: { ...formData.pathologicalHistory, explain: e.target.value } })}
                          className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-brand-purple rounded-xl text-xs font-bold outline-none resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 5: ANTECEDENTES NO PATOLÓGICOS */}
                  {activeTab === 'nonPathological' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 h-auto leading-none italic">5. Antecedentes No Patológicos</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Estilos de vida, hábitos e integraciones adicionales del paciente</p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { key: 'tabaquismo', label: 'Tabaquismo' },
                          { key: 'alcohol', label: 'Alcohol' },
                          { key: 'drogas', label: 'Drogas' },
                          { key: 'estrenimiento', label: 'Estreñimiento' },
                          { key: 'ansiedad', label: 'Ansiedad' },
                          { key: 'estres', label: 'Estrés' },
                          { key: 'polidisplasia', label: 'Poli displasia' },
                          { key: 'embarazo', label: 'Embarazo' },
                          { key: 'trastornoSueno', label: 'Trastorno sueño' },
                          { key: 'ingestaLiquidos', label: 'Ingesta líquidos' },
                          { key: 'tatuajes', label: 'Tatuajes' },
                          { key: 'lactancia', label: 'Lactancia' },
                          { key: 'protesis', label: 'Prótesis' },
                          { key: 'marcapasos', label: 'Marcapasos' },
                          { key: 'deporte', label: 'Deporte' },
                          { key: 'sedentarismo', label: 'Sedentarismo' },
                          { key: 'traumatismos', label: 'Traumatismos' },
                          { key: 'medicamentos', label: 'Medicamentos' },
                          { key: 'alergias', label: 'Alergias' },
                          { key: 'cuidadosCorporales', label: 'Cuidados corporales' }
                        ].map(item => (
                          <label 
                            key={item.key} 
                            className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-purple-50 hover:border-purple-200 transition-all select-none group"
                          >
                            <span className="text-[11px] font-bold text-slate-700 group-hover:text-brand-purple transition-colors truncate">{item.label}</span>
                            <div className="relative">
                              <input 
                                type="checkbox" 
                                checked={(formData.nonPathologicalHistory as any)[item.key]}
                                onChange={e => handleCheckboxChange('nonPathologicalHistory', item.key, e.target.checked)}
                                className="peer hidden"
                              />
                              <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-brand-purple peer-checked:border-brand-purple flex items-center justify-center transition-colors">
                                <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>

                      <div className="space-y-1.5 pt-4">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider ml-1">Explique (Detalle positivos de arriba)</label>
                        <textarea 
                          rows={4}
                          placeholder="Detalle hidratación, insomnio de conciliación, práctica de deportes de impacto, tipo de drogas/medicamentos..."
                          value={formData.nonPathologicalHistory.explain} 
                          onChange={e => setFormData({ ...formData, nonPathologicalHistory: { ...formData.nonPathologicalHistory, explain: e.target.value } })}
                          className="w-full p-4 bg-slate-50 border border-slate-200 focus:border-brand-purple rounded-xl text-xs font-bold outline-none resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 6: MEDICAMENTOS ACTUALES */}
                  {activeTab === 'meds' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3 h-auto">
                        <div>
                          <h3 className="text-lg font-black text-slate-900 leading-none italic">6. Medicamentos Actuales y Dosificación</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Tratamientos farmacológicos simultáneos del paciente</p>
                        </div>
                        <button 
                          onClick={handleAddMedication}
                          className="px-4 py-2 bg-purple-50 hover:bg-brand-purple text-brand-purple hover:text-white transition-all rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-purple-100 shadow-sm"
                        >
                          <Plus className="w-4 h-4" /> Enlistar Medicamento
                        </button>
                      </div>

                      <div className="overflow-hidden border border-slate-100 rounded-2xl">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre del Medicamento</th>
                              <th className="px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Dosificación / Frecuencia</th>
                              <th className="px-5 py-3.5 text-center w-20">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {formData.medications.map((item, index) => (
                              <tr key={index} className="hover:bg-slate-50/20 transition-colors">
                                <td className="p-3">
                                  <input 
                                    type="text" 
                                    placeholder="Ej. Omeprazol, Insulina Glargina, Metformina"
                                    value={item.name} 
                                    onChange={e => handleMedicationChange(index, 'name', e.target.value)}
                                    className="w-full p-3 bg-white border border-slate-200 focus:border-brand-purple rounded-xl text-xs font-bold outline-none"
                                  />
                                </td>
                                <td className="p-3">
                                  <input 
                                    type="text" 
                                    placeholder="Ej. 1 cápsula cada 24 horas"
                                    value={item.dosage} 
                                    onChange={e => handleMedicationChange(index, 'dosage', e.target.value)}
                                    className="w-full p-3 bg-white border border-slate-200 focus:border-brand-purple rounded-xl text-xs font-bold' outline-none text-xs font-bold"
                                  />
                                </td>
                                <td className="p-3 text-center">
                                  <button 
                                    onClick={() => handleRemoveMedication(index)}
                                    className="p-2.5 bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white transition-all rounded-xl"
                                    title="Quitar"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* SECTION: HISTORIAL DE FICHAS DE PREDICCIÓN / HISTORIA CLÍNICA */}
              <div className="mt-16 pt-12 border-t border-slate-200">
                <div className="mb-8">
                  <h3 className="text-xl font-display font-black text-slate-900 italic">Historial de Expedientes (Checklists)</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Lista de checklist generales y antecedentes guardados para este paciente</p>
                </div>

                {records.length === 0 ? (
                  <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
                    <p className="text-slate-400 text-xs italic font-semibold">No se han registrado hojas de Checklist de Historia Clínica General para este paciente aún.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {records.map((rec, index) => (
                      <div 
                        key={rec.id}
                        className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 hover:shadow-lg transition-all group flex flex-col justify-between h-[280px] relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-100 md:opacity-100 group-hover:opacity-100 transition-opacity flex gap-1.5 z-10 bg-white shadow-sm border border-slate-50 rounded-bl-xl">
                          <button 
                            onClick={() => handleEdit(rec)} 
                            className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-brand-purple hover:text-white transition-all shadow-sm"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => exportPDF(rec)} 
                            className="p-2 bg-purple-50 text-brand-purple rounded-lg hover:bg-brand-purple hover:text-white transition-all shadow-sm"
                            title="Exportar PDF"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(rec.id)} 
                            className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-purple-50 border border-purple-100 rounded-lg flex items-center justify-center text-brand-purple shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[8px] font-black text-slate-400 tracking-wider">REGISTRO</span>
                              <h4 className="text-sm font-black text-slate-900 italic leading-none">{rec.expNumber}</h4>
                            </div>
                          </div>

                          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] font-bold">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Fecha:</span>
                              <span className="text-slate-800">{rec.date}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Motivo:</span>
                              <span className="text-slate-805 truncate max-w-[110px] italic">"{rec.currentCondition.reason || 'Sin especificar'}"</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Escala Dolor:</span>
                              <span className="text-rose-600 font-extrabold">{rec.currentCondition.intensity || '5'} / 10</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <button 
                            onClick={() => handleViewDetails(rec)}
                            className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-purple transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ver Ficha completa
                          </button>
                          <button 
                            onClick={() => exportPDF(rec)}
                            className="flex items-center gap-1 text-[9px] font-black text-brand-purple uppercase tracking-widest hover:underline transition-all"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            PDF
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </motion.div>
          )}

          {/* STATE 3: RECORD DETAILS SUMMARY (VIEW MODE) */}
          {viewState === 'details' && selectedRecord && (
            <motion.div 
              key="details-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="max-w-4xl mx-auto bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-xl space-y-10"
            >
              
              {/* Header inside document sheet */}
              <div className="flex flex-col sm:flex-row justify-between items-start border-b border-purple-100 pb-6 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-brand-purple border border-purple-100">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">HISTORIA CLÍNICA GENERAL</p>
                    <h3 className="text-2xl font-display font-black text-slate-900 italic leading-none mt-1">{selectedRecord.expNumber}</h3>
                  </div>
                </div>
                <div className="flex flex-row items-center gap-3">
                  <button 
                    onClick={() => exportPDF(selectedRecord)}
                    className="flex items-center gap-2 bg-brand-purple hover:bg-brand-purple-dark text-white px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-brand-purple/20 pr-6"
                  >
                    <FileDown className="w-4 h-4" /> Exportar PDF
                  </button>
                  <button 
                    onClick={() => handleEdit(selectedRecord)}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm"
                  >
                    <Edit2 className="w-4 h-4" /> Editar Ficha
                  </button>
                </div>
              </div>

              {/* Patient Basics */}
              <section className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-purple border-b border-purple-50 pb-2">1. Datos Personales</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 text-[11px] font-bold">
                  <div>
                    <span className="text-slate-400 block mb-0.5 uppercase text-[9px]">Nombre:</span>
                    <span className="text-slate-800">{selectedRecord.personalData.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 uppercase text-[9px]">Edad:</span>
                    <span className="text-slate-800">{selectedRecord.personalData.age} años</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 uppercase text-[9px]">Fec. Nacimiento:</span>
                    <span className="text-slate-800">{selectedRecord.personalData.dob || 'N/E'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 uppercase text-[9px]">Sexo:</span>
                    <span className="text-slate-800">{selectedRecord.personalData.sex || 'N/E'}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-slate-400 block mb-0.5 uppercase text-[9px]">Domicilio:</span>
                    <span className="text-slate-800">{selectedRecord.personalData.address || 'N/E'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 uppercase text-[9px]">Teléfono:</span>
                    <span className="text-slate-800">{selectedRecord.personalData.phone || 'N/E'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 uppercase text-[9px]">Estado Civil:</span>
                    <span className="text-slate-800">{selectedRecord.personalData.maritalStatus || 'N/E'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 uppercase text-[9px]">Ocupación:</span>
                    <span className="text-slate-800">{selectedRecord.personalData.occupation || 'N/E'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 uppercase text-[9px]">Escolaridad:</span>
                    <span className="text-slate-800">{selectedRecord.personalData.education || 'N/E'}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-slate-400 block mb-0.5 uppercase text-[9px]">E-Mail:</span>
                    <span className="text-slate-800">{selectedRecord.personalData.email || 'N/E'}</span>
                  </div>
                </div>
              </section>

              {/* Reason for visit */}
              <section className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-purple border-b border-purple-50 pb-2">2. Padecimiento Actual</h4>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 text-[11px] font-bold">
                  <div className="bg-white p-4 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block mb-1 uppercase text-[9px]">Motivo de consulta:</span>
                    <p className="text-slate-700 italic leading-relaxed">"{selectedRecord.currentCondition.reason || 'No especificado'}"</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-slate-400 block mb-0.5 uppercase text-[9px]">Fecha 1er Síntoma:</span>
                      <span className="text-slate-800">{selectedRecord.currentCondition.firstSymptomDate || 'N/E'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5 uppercase text-[9px]">Localización:</span>
                      <span className="text-slate-800">{selectedRecord.currentCondition.location || 'N/E'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5 uppercase text-[9px]">Circunstancia Dolor:</span>
                      <span className="text-slate-800">{selectedRecord.currentCondition.modifyingCircumstance || 'N/E'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5 uppercase text-[9px]">Escala Eva Dolor:</span>
                      <span className="text-rose-600 font-extrabold">{selectedRecord.currentCondition.intensity || '5'} / 10</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Family History */}
              <section className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-purple border-b border-purple-50 pb-2">3. Antecedentes Familiares</h4>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedRecord.familyHistory)
                      .filter(([k, v]) => k !== 'explain' && v === true)
                      .map(([k]) => (
                        <span key={k} className="px-3 py-1 bg-purple-50 text-brand-purple border border-purple-100 rounded-lg text-[9px] font-black uppercase tracking-widest">
                          {k.toUpperCase()}
                        </span>
                      ))}
                    {Object.entries(selectedRecord.familyHistory).filter(([k, v]) => k !== 'explain' && v === true).length === 0 && (
                      <span className="text-slate-400 text-xs italic">Ningún antecedente familiar de importancia marcado.</span>
                    )}
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700 leading-relaxed">
                    <span className="text-[9px] font-bold text-slate-400 block mb-1 uppercase">Observaciones:</span>
                    {selectedRecord.familyHistory.explain || 'Sin comentarios adicionales.'}
                  </div>
                </div>
              </section>

              {/* Patolólogicos */}
              <section className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-purple border-b border-purple-50 pb-2">4. Antecedentes Patológicos (Socio-Clínicos)</h4>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedRecord.pathologicalHistory)
                      .filter(([k, v]) => k !== 'explain' && v === true)
                      .map(([k]) => (
                        <span key={k} className="px-3 py-1 bg-purple-100 text-brand-purple border border-purple-200 rounded-lg text-[9px] font-black uppercase tracking-widest">
                          {k.toUpperCase()}
                        </span>
                      ))}
                    {Object.entries(selectedRecord.pathologicalHistory).filter(([k, v]) => k !== 'explain' && v === true).length === 0 && (
                      <span className="text-slate-400 text-xs italic">Ningún antecedente patológico marcado.</span>
                    )}
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700 leading-relaxed">
                    <span className="text-[9px] font-bold text-slate-400 block mb-1 uppercase">Observaciones:</span>
                    {selectedRecord.pathologicalHistory.explain || 'Sin comentarios adicionales.'}
                  </div>
                </div>
              </section>

              {/* No Patológicas */}
              <section className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-purple border-b border-purple-50 pb-2">5. Antecedentes No Patológicos (Estilos de Vida)</h4>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedRecord.nonPathologicalHistory)
                      .filter(([k, v]) => k !== 'explain' && v === true)
                      .map(([k]) => (
                        <span key={k} className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-[9px] font-black uppercase tracking-widest">
                          {k.toUpperCase()}
                        </span>
                      ))}
                    {Object.entries(selectedRecord.nonPathologicalHistory).filter(([k, v]) => k !== 'explain' && v === true).length === 0 && (
                      <span className="text-slate-400 text-xs italic">Ningún antecedente no patológico marcado.</span>
                    )}
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700 leading-relaxed">
                    <span className="text-[9px] font-bold text-slate-400 block mb-1 uppercase">Observaciones:</span>
                    {selectedRecord.nonPathologicalHistory.explain || 'Sin comentarios adicionales.'}
                  </div>
                </div>
              </section>

              {/* Medications */}
              <section className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-purple border-b border-purple-50 pb-2">6. Medicamentos Actuales</h4>
                <div className="overflow-hidden border border-slate-100 rounded-2xl">
                  {selectedRecord.medications.filter(m => m.name.trim() !== '').length === 0 ? (
                    <div className="p-6 bg-slate-50 text-slate-400 text-xs font-semibold italic">No refiere medicamentos activos actualmente.</div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-5 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Nombre del Medicamento</th>
                          <th className="px-5 py-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">Dosificación / Frecuencia</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedRecord.medications.filter(m => m.name.trim() !== '').map((m, index) => (
                          <tr key={index} className="hover:bg-slate-50/50 transition-colors font-bold text-xs text-slate-700">
                            <td className="px-5 py-3.5 text-brand-purple italic">{m.name}</td>
                            <td className="px-5 py-3.5">{m.dosage || 'Sín especificar'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
