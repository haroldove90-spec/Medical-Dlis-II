/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Role {
  ADMIN = 'Administración',
  MEDICINA_GENERAL = 'Medicina General',
  CIRUGIA = 'Cirugía General',
  PODOLOGIA = 'Podología',
  ESTETICA = 'Medicina Estética',
  RECEPCION = 'Recepción',
  PACIENTE = 'Paciente'
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  category: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  commission: number;
  services: number;
}

export interface Patient {
  id: string;
  name: string;
  lastVisit: string;
  service: string;
  email?: string;
  phone?: string;
  status?: string;
  sessions?: string;
  age?: number;
  gender?: string;
  bloodType?: string;
}

export type Specialty = 'Medicina General' | 'Medicina Estética' | 'Aparatología' | 'Podología' | 'Cirugía General';

export interface VitalSigns {
  ta: string; // Tensión Arterial
  fc: number; // Frecuencia Cardíaca
  fr: number; // Frecuencia Respiratoria
  temp: number; // Temperatura
  weight: number; // Peso (kg)
  height: number; // Talla (cm)
  imc: number; // IMC
  nutritionalStatus: string;
}

export interface PhysicalExamSystems {
  headNeck: string;
  thorax: string;
  abdomen: string;
  extremities: string;
  neurological: string;
}

export interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  indications: string;
}

export interface LabOrder {
  study: string;
  priority: 'Baja' | 'Media' | 'Alta';
  notes: string;
}

export interface PodiatryExploration {
  riskFilter: {
    diabetes: { has: boolean; years: string };
    circulatoryIssues: boolean;
    anticoagulants: boolean;
    allergies: { meds: string; anesthetics: string; antiseptics: string };
  };
  footPathologicalHistory: {
    ulcers: boolean;
    amputations: boolean;
    nailSurgery: boolean;
    gout: boolean;
    notes: string;
  };
  habits: {
    footwearType: string; // Laboral, deportivo, tacones, seguridad
    impactSports: boolean;
  };
  dermatological: {
    helomas: boolean;
    hiperqueratosis: boolean;
    anhidrosis: boolean;
    maceration: boolean;
    infections: string; // Tiña pedis, bromhidrosis
    notes: string;
  };
  nails: {
    [toe: string]: {
      onicocriptosis: { present: boolean; laterality: string; grade: string };
      onicomicosis: boolean;
      onicogrifosis: boolean;
      trauma: boolean;
      normal: boolean;
    };
  };
  vascular: {
    pedalPulse: { der: 'Normal' | 'Ausente' | 'Disminuido'; izq: 'Normal' | 'Ausente' | 'Disminuido' };
    tibialPulse: { der: 'Normal' | 'Ausente' | 'Disminuido'; izq: 'Normal' | 'Ausente' | 'Disminuido' };
    temperature: { der: 'Normal' | 'Aumentada' | 'Disminuida'; izq: 'Normal' | 'Aumentada' | 'Disminuida' };
    capillaryRefill: { der: number; izq: number }; // In seconds
  };
  neurological: {
    monofilament: { der: 'Sensible' | 'Insensible'; izq: 'Sensible' | 'Insensible' };
    tuningFork: { der: 'Normal' | 'Disminuido' | 'Ausente'; izq: 'Normal' | 'Disminuido' | 'Ausente' };
    neuropathyScale: number; // 0-10
  };
  biomechanical: {
    static: {
      footType: 'Normal' | 'Plano' | 'Cavo' | 'Neutro';
      alignment: 'Valgo' | 'Varo' | 'Normal';
      deformities: { halluxValgus: boolean; clawToes: boolean; hammerToes: boolean };
    };
    dynamic: {
      gaitType: 'Pronador' | 'Supinador' | 'Neutro';
      observations: string;
    };
  };
  treatment: {
    quiropodiaDetails: string;
    orthopodologyPlan: string;
  };
}

export interface OrthoticsDesign {
  id: string;
  patientId: string;
  date: string;
  material: 'EVA' | 'Resina' | 'Polipropileno' | 'Otros';
  type: 'Soporte Plantar' | 'Órtesis de Silicona' | 'Descargas';
  modifications: string[];
  notes: string;
  status: 'Diseño' | 'Fabricación' | 'Entregado';
}

export interface PodiatryService {
  type: 'Quiropodia' | 'Cirugía Ungueal' | 'Valoración Biomecánica' | 'Ortesis';
  details: string;
  photoBefore?: string;
  photoAfter?: string;
}

export interface ClinicalRecordData {
  id: string;
  patientId: string;
  date: string;
  recordNumber: string;
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
    identificationId?: string; // CURP/ID
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
    };
    profileImage?: string;
  };
  reasonForConsultation: {
    reason: string;
    anamnesis: string; // Elaborated text for AI extraction
    timeOfEvolution: string;
    firstSymptomDate: string;
    location: string;
    modifyingCircumstance: string;
    painType: string;
    intensity: number;
    urgencyLevel: 'Verde' | 'Amarillo' | 'Rojo';
    systemicReview: {
      cardioRespiratory: string;
      gastrointestinal: string;
      genitourinary: string;
      nervousSystem: string;
    };
  };
  vitalSigns?: VitalSigns;
  physicalExamSystems?: PhysicalExamSystems;
  familyHistory: {
    diabetes: boolean;
    hypertension: boolean;
    cardiacDisease: boolean;
    neoplasias: boolean;
    renalDisease: boolean;
    psychiatric: boolean;
    rheumatoidArthritis: boolean;
    notes: string;
  };
  pathologicalHistory: {
    allergies: string; // Critical field
    chronicDegenerative: string;
    surgicalTraumatic: string;
    hospitalizationsTransfusions: string;
    cardiovascular: boolean;
    pulmonary: boolean;
    renal: boolean;
    gastrointestinal: boolean;
    hematological: boolean;
    endocrine: boolean;
    mental: boolean;
    dermatological: boolean;
    neurological: boolean;
    metabolic: boolean;
    heartDisease: boolean;
    seizures: boolean;
    pacemaker: boolean;
    neuropathy: boolean;
    diabetes: boolean;
    cancer: boolean;
    hypertension: boolean;
    hypotension: boolean;
    hyperthyroidism: boolean;
    notes: string;
  };
  nonPathologicalHistory: {
    habits: {
      smoking: string;
      alcohol: string;
      substances: string;
    };
    lifestyle: {
      diet: string;
      activity: string;
      sleep: string;
    };
    immunizations: string;
    hygiene: string;
    notes: string;
  };
  gynecologicalHistory?: {
    menarche: string;
    cycleRegularity: string;
    lastMenstrualPeriod: string;
    gpca: { g: number; p: number; c: number; a: number };
    prevention: { papanicolaou: string; mammography: string };
  };
  diagnosis: {
    icdCode: string;
    description: string;
  };
  podiatry?: {
    exploration: PodiatryExploration;
    orthotics?: OrthoticsDesign[];
    services?: PodiatryService[];
  };
  aesthetics?: {
    identification: {
      photos: string[];
      contraindications: {
        pregnancy: boolean;
        keloid: boolean;
        autoimmune: boolean;
        isotretinoin: boolean;
        allergies: string;
      };
    };
    history: {
      previousProcedures: string;
      skincareRoutine: string;
      consultationReason: string;
    };
    diagnosis: {
      fitzpatrick: string; // I-VI
      glogau: string; // I-IV
      skinType: string;
      lesions: string;
    };
    procedure: {
      type: string;
      brand: string;
      lab: string;
      lotNumber: string;
      expirationDate: string;
      units: string;
      mapping: string;
    };
    followUp: {
      nextAppointment: string;
      afterPhotos: string[];
    };
  };
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  medications: { // Deprecated by prescriptions but kept for compatibility if needed
    name: string;
    dosage: string;
    duration: string;
  }[];
}

export interface InformedConsent {
  id: string;
  patientId: string;
  clinicalRecordId?: string;
  date: string;
  type?: 'Podología' | 'Medicina Estética' | 'Medicina General';
  patientData: {
    fullName: string;
    phone: string;
    email: string;
    age: number;
    sex: string;
    medicalHistory: string;
    relevantes?: string;
  };
  podiatryProcedures?: {
    nailCutting: boolean;
    callusRemoval: boolean;
    ingrownNail: boolean;
    antisepticCleaning: boolean;
    topicalApplication: boolean;
    complementaryProcedures: boolean;
  };
  aestheticsConsent?: {
    procedureName: string;
    accepted: boolean;
  };
  alternative: 'none' | 'valuation' | 'alternative';
  signature: string; // Base64 signature
  lugar?: string;
  observations?: string;
}

export interface ConsentClosure {
  id: string;
  patientId: string;
  date: string;
  patientName: string;
  location?: string;
  treatmentCompleted: string;
  observations: string;
  patientSignature: string;
  specialistSignature: string;
}

export interface LaserConsent {
  id: string;
  patientId: string;
  date: string;
  patientData: {
    fullName: string;
    identityDoc: string;
    phone: string;
    email: string;
  };
  treatmentAreas: string;
  responsibleProfessional: string;
  contraindications: {
    pregnancyOrLactation: boolean;
    skinDiseases: boolean;
    photosensitiveMeds: boolean;
    recentTan: boolean;
    abnormalScarring: boolean;
  };
  signature: string;
  professionalSignature: string;
  lugar?: string;
  observations?: string;
}

export interface PhysicalExploration {
  id: string;
  patientId: string;
  date: string;
  // 1. Visual Exploration (Block A & B)
  visualExploration: {
    [key: string]: { der: boolean; izq: boolean };
  };
  specialToes?: {
    [key: string]: { der: string; izq: string };
  };
  otherVisualObservations: string;
  // 2. Morphological
  footType: 'Egipcio' | 'Romano' | 'Griego' | 'Germánico' | 'Celta';
  stepType: 'Neutro' | 'Pronación' | 'Supinación';
  // 3. Manual/Instrumented
  manualExploration: {
    osteoarticular: { der: 'Normal' | 'Anormal'; izq: 'Normal' | 'Anormal' };
    temperature: { der: 'Normal' | 'Anormal'; izq: 'Normal' | 'Anormal' };
    capillaryRefill: { der: 'Normal' | 'Anormal'; izq: 'Normal' | 'Anormal' };
    tibialPulse: { der: 'Normal' | 'Anormal'; izq: 'Normal' | 'Anormal' };
    monofilament: { der: 'Normal' | 'Anormal'; izq: 'Normal' | 'Anormal' };
    tuningFork: { der: 'Normal' | 'Anormal'; izq: 'Normal' | 'Anormal' };
    reflexHammer: { der: 'Normal' | 'Anormal'; izq: 'Normal' | 'Anormal' };
  };
  // 4. Diagnostics
  diagnostics: {
    biomechanical: string;
    dermatological: string;
    neurological: string;
    vascular: string;
  };
  // 5. Therapeutics & Reference
  reference: boolean;
  referenceTo: string;
  therapeuticPlan: string;
  // 6. Validation
  patientSignature: string;
  professionalName: string;
}

export interface TreatmentSession {
  sessionNum: number;
  comment: string;
  parameters: string;
  date: string;
  time: string;
  signature: string; // Base64 signature of the professional
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  date: string;
  patientData: {
    fullName: string;
    phone: string;
    email: string;
  };
  responsibleProfessional: string;
  totalSessions: number;
  sessions: TreatmentSession[];
  observations?: string;
  lugar?: string;
}

export type AppointmentCategory = Specialty;

export interface Metric {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}
