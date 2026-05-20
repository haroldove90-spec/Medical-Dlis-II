/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Clock, User, ChevronDown, Plus } from 'lucide-react';
import { AppointmentCategory, Role } from '../types';
import { motion } from 'motion/react';

interface AppointmentFormProps {
  activeRole?: Role;
}

export default function AppointmentForm({ activeRole }: AppointmentFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="dashboard-card h-full border-none shadow-sm relative overflow-hidden">
      {isSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-x-0 top-0 p-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest text-center z-50 flex items-center justify-center gap-2"
        >
          <Plus className="w-3 h-3 rotate-45" /> 
          Agendado con éxito
        </motion.div>
      )}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-display font-black text-slate-900">
          {activeRole === Role.ESTETICA ? 'Nueva Sesión' : 'Nueva Cita'}
        </h3>
        <div className="p-2.5 bg-brand-purple-light rounded-xl">
          <Calendar className="w-5 h-5 text-brand-purple" />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 block px-1">Paciente</label>
          <div className="relative">
            <input
              type="text"
              id="appointment-patient"
              placeholder="Buscar o ingresar paciente..."
              className="w-full input-light pl-10 text-sm font-medium bg-white"
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 block px-1">Fecha</label>
            <input
              type="date"
              id="appointment-date"
              className="w-full input-light font-sans text-xs bg-white font-bold"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 block px-1">Hora</label>
            <input
              type="time"
              id="appointment-time"
              className="w-full input-light font-sans text-xs bg-white font-bold"
            />
          </div>
        </div>

        <button
          id="confirm-appointment"
          className="w-full mt-4 bg-brand-purple hover:bg-brand-purple-dark text-white font-black py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-[10px]"
        >
          <Plus className="w-4 h-4" />
          {activeRole === Role.ESTETICA ? 'Registrar Sesión' : 'Agendar Cita'}
        </button>
      </div>
    </form>
  );
}

