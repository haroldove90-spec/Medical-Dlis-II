import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Gemini Initialization
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.post('/api/process-medical-note', async (req, res) => {
  const { note, patientContext, role } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY no configurada' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    let prompt = '';

    if (role === 'Podología') {
      prompt = `
        Eres un podólogo experto y asistente clínico. Analiza la siguiente consulta podológica.
        
        REGLA DE SIMULACIÓN PARA DEMO:
        Si la nota es corta o carece de detalles, DEBES SIMULAR un registro completo y realista basado en estándares podológicos (pulsos, monofilamento, biomecánica).

        CONTEXTO:
        - Diabético: ${patientContext.isDiabetic ? 'SÍ' : 'NO'}
        - Alergias: ${patientContext.allergies || 'Ninguna'}

        NOTA MÉDICA:
        "${note}"

        INSTRUCCIONES:
        1. EXPLORACIÓN DERMO-UNGUEAL: Separa piel y uñas. Mapea dedos afectados.
        2. VASCULAR/NEUROLÓGICO: Si es diabético, simula pruebas preventivas. Si no, simula normalidad.
        3. BIOMECÁNICA: Inyecta tipo de pie y marcha si no se detalla.
        4. TRATAMIENTO: Define servicios (Quiropodia, etc.) y ortesis si aplica.

        Devuelve EXCLUSIVAMENTE un JSON con esta estructura:
        {
          "reason": "motivo",
          "anamnesis": "relato clínico",
          "diagnosis": { "icdCode": "CODE", "description": "DESC" },
          "podiatry": {
            "exploration": {
              "dermatological": { "helomas": bool, "hiperqueratosis": bool, "anhidrosis": bool, "tinea": bool, "notes": "str" },
              "nails": { "Dedo 1 Der": { "onicocriptosis": bool, "onicomicosis": bool, "onicogrifosis": bool, "normal": bool } },
              "vascular": { 
                "pedalPulse": { "der": "Normal/Ausente/Disminuido", "izq": "Normal/Ausente/Disminuido" },
                "tibialPulse": { "der": "Normal/Ausente/Disminuido", "izq": "Normal/Ausente/Disminuido" }
              },
              "neurological": {
                "monofilament": { "der": "Sensible/Insensible", "izq": "Sensible/Insensible" },
                "neuropathyScale": 0-10
              },
              "biomechanical": {
                "static": { "footType": "Normal/Plano/Cavo/Valgo/Varo", "observations": "str" },
                "dynamic": { "gaitAnalysis": "str", "pressureBar": "str" }
              }
            },
            "services": [{ "type": "Quiropodia/Cirugía Ungueal/Valoración Biomecánica/Ortesis", "details": "str" }]
          }
        }
      `;
    } else if (role === 'Medicina Estética') {
      prompt = `
        Eres un experto en Medicina Estética y asistente clínico. Analiza la siguiente consulta estética.
        
        REGLA DE SIMULACIÓN PARA DEMO:
        Si los datos no se mencionan explícitamente, DEBES INFERIRLOS o SIMULARLOS basándote en la edad del paciente y el tipo de procedimiento mencionado (Fitzpatrick, Glogau y trazabilidad).

        CONTEXTO DEL PACIENTE:
        ${JSON.stringify(patientContext)}

        NOTA MÉDICA:
        "${note}"

        INSTRUCCIONES:
        1. DIAGNÓSTICO ESTÉTICO: Define Fototipo Fitzpatrick (I-VI), Escala de Glogau (I-IV) y Tipo de Piel.
        2. TRAZABILIDAD: Si menciona aplicación de toxina, rellenos o bioestimuladores, extrae o simula Marca, Lote, Laboratorio y Unidades/ml sugeridos.
        3. EVALUACIÓN: Identifica flacidez, arrugas (dinámicas/estáticas) o lesiones pigmentarias mencionadas.
        4. CONTRAINDICACIONES: Busca menciones de embarazo, lactancia, queloides o uso de isotretinoína.

        Devuelve EXCLUSIVAMENTE un JSON con esta estructura:
        {
          "reason": "motivo para tratamiento",
          "anamnesis": "antecedentes y expectativas",
          "aesthetics": {
            "identification": { 
              "contraindications": { "pregnancy": bool, "keloid": bool, "autoimmune": bool, "isotretinoin": bool, "allergies": "str" } 
            },
            "diagnosis": { 
              "fitzpatrick": "I/II/III/IV/V/VI", 
              "glogau": "I/II/III/IV", 
              "skinType": "Seca/Mixta/Grasa/Sensible/Alípica", 
              "lesions": "descripción de hallazgos" 
            },
            "procedure": { 
              "type": "str", 
              "units": "str", 
              "brand": "str", 
              "lab": "str", 
              "lotNumber": "simular lote si no existe", 
              "mapping": "descripción de zonas inyectadas" 
            }
          },
          "diagnosis": { "icdCode": "L71.9", "description": "Diagnóstico estético principal" }
        }
      `;
    } else {
      prompt = `
        Eres un Médico General experto y asistente clínico de Medical D'Lis. Analiza la siguiente consulta médica.
        
        REGLA DE SIMULACIÓN PARA DEMO:
        Si la nota es corta, DEBES SIMULAR un registro completo y profesional basado en estándares de medicina interna (AHF, APP, Interrogatorio por sistemas, Exploración física detallada).

        CONTEXTO DEL PACIENTE:
        ${JSON.stringify(patientContext)}

        NOTA MÉDICA:
        "${note}"

        INSTRUCCIONES:
        1. ANAMNESIS: Elabora un relato profesional, cronológico y detallado del padecimiento actual.
        2. ANTECEDENTES: Extrae o simula AHF (Diabetes, HTA, Cáncer en línea directa) y APP (Alergias - CRÍTICO, Cirugías, Crónicos).
        3. SISTEMAS: Simula el interrogatorio por aparatos y sistemas (Cardio-respiratorio, Gastrointestinal, etc.).
        4. EXPLORACIÓN: Extrae signos vitales y simula hallazgos normales o patológicos en Cabeza/Cuello, Tórax, Abdomen y Extremidades si no se detallan.
        5. DIAGNÓSTICO: Sugiere el código CIE-10 (ICD-10) más probable y su descripción.

        Devuelve EXCLUSIVAMENTE un JSON con esta estructura:
        {
          "reasonForConsultation": {
            "reason": "motivo breve",
            "anamnesis": "relato clínico detallado",
            "timeOfEvolution": "str",
            "urgencyLevel": "Verde/Amarillo/Rojo",
            "systemicReview": {
              "cardioRespiratory": "Normal/Alterado: str",
              "gastrointestinal": "Normal/Alterado: str",
              "genitourinary": "Normal/Alterado: str",
              "nervousSystem": "Normal/Alterado: str"
            }
          },
          "vitalSigns": { "ta": "str", "fc": num, "fr": num, "temp": num, "weight": num, "height": num },
          "physicalExamSystems": {
            "headNeck": "str",
            "thorax": "str",
            "abdomen": "str",
            "extremities": "str",
            "neurological": "str"
          },
          "diagnosis": { "icdCode": "CODE", "description": "DESC" },
          "plan": "Plan de tratamiento detallado incluyendo recetas sugeridas"
        }
      `;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (handling potential markdown blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      res.json(JSON.parse(jsonMatch[0]));
    } else {
      res.status(500).json({ error: 'No se pudo estructurar la respuesta de la IA' });
    }
  } catch (error) {
    console.error('Error processing note:', error);
    res.status(500).json({ error: 'Error al procesar la nota con IA' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
