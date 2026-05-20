/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Calendar, FileText, Download, Clock, MapPin, User, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface PatientPortalProps {
  activeSection: string;
}

export default function PatientPortal({ activeSection }: PatientPortalProps) {
  const [confirmed, setConfirmed] = useState(false);
  const nextAppointment = {
    date: '20 May, 2024',
    time: '11:00 AM',
    specialty: 'Medicina Estética',
    doctor: 'Dr. Alejandro Méndez',
    procedure: 'Valoración / Control'
  };

  const results = [
    { id: '1', title: 'Receta Médica - Tratamiento Inicial', date: '12 May, 2024', type: 'PDF' },
    { id: '2', title: 'Consentimiento Informado - Procedimiento', date: '10 May, 2024', type: 'PDF' },
    { id: '3', title: 'Indicaciones Post-Tratamiento', date: '05 May, 2024', type: 'PDF' },
    { id: '4', title: 'Resultados Laboratorio - Biometría Hemática', date: '15 May, 2024', type: 'PDF' },
    { id: '5', title: 'Interpretación Rx Tórax', date: 'Hoy', type: 'PDF' },
    { id: '6', title: 'Ticket de Pago #V-042', date: '12 May, 2024', type: 'PDF' },
  ];

  const showAppointments = activeSection === 'appointments' || activeSection === 'portal' || activeSection === 'default';
  const showResults = activeSection === 'results' || activeSection === 'portal' || activeSection === 'default';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Welcome Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-brand-purple to-purple-800 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-white/60 uppercase tracking-[0.2em] mb-1">Bienvenido a su Portal</p>
              <h2 className="text-3xl font-display font-black tracking-tight leading-none">Juan Pérez</h2>
            </div>
          </div>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm">
            Aquí puedes gestionar tus citas, descargar tus recetas y seguir tu historial clínico de forma segura.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Next Appointment */}
        {showAppointments && (
          <div className={`${showResults ? 'md:col-span-7' : 'md:col-span-12'} space-y-4`}>
            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest px-1">
              <Calendar className="w-3 h-3" />
              <span>Mi Próxima Visita</span>
            </div>
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                 <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-brand-purple group-hover:text-white transition-all">
                    <Clock className="w-6 h-6" />
                 </div>
              </div>
              <div className="mb-8">
                 <div className="text-4xl font-black text-slate-900 mb-2">{nextAppointment.date}</div>
                 <div className="text-lg font-bold text-brand-purple">{nextAppointment.time}</div>
              </div>
              <div className="space-y-4 border-t border-slate-50 pt-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">Sucursal Roma Norte, CDMX</span>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">Atiende: {nextAppointment.doctor}</span>
                </div>
              </div>
              <button 
                onClick={() => setConfirmed(true)}
                disabled={confirmed}
                className={`w-full mt-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                  confirmed ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-brand-purple hover:shadow-brand-purple/20'
                }`}
              >
                 {confirmed ? <CheckCircle2 className="w-4 h-4" /> : null}
                 {confirmed ? 'Asistencia Confirmada' : 'Confirmar Asistencia'}
              </button>
            </motion.div>
          </div>
        )}

        {/* Results & Docs */}
        {showResults && (
          <div className={`${showAppointments ? 'md:col-span-5' : 'md:col-span-12'} space-y-4`}>
            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest px-1">
              <FileText className="w-3 h-3" />
              <span>Mis Documentos</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {results.map((res, idx) => (
                <motion.div 
                  key={res.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-brand-purple/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-brand-purple transition-colors">
                       <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 line-clamp-1">{res.title}</h4>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">{res.date}</p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-slate-300 group-hover:text-brand-purple transition-colors" />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-white hover:border-brand-purple/30 transition-all group">
            <div className="text-left">
              <h4 className="text-sm font-black text-slate-900 mb-1">Agendar Nueva Cita</h4>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Reserva tu espacio ahora</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-purple transition-transform group-hover:translate-x-1" />
        </button>
        <button className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-white hover:border-emerald-200 transition-all group">
            <div className="text-left">
              <h4 className="text-sm font-black text-slate-900 mb-1">Dudas o Urgencias</h4>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Contactar vía WhatsApp</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
