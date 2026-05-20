/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRound, Sparkles, ArrowRight, Activity } from 'lucide-react';
import { Role } from '../types';
import { motion } from 'motion/react';

interface RoleSelectionProps {
  onSelect: (role: Role) => void;
}

export default function RoleSelection({ onSelect }: RoleSelectionProps) {
  const roles = [
    { 
      id: Role.MEDICINA_GENERAL, 
      label: 'Medicina General', 
      icon: UserRound, 
      color: 'bg-brand-purple', 
      desc: 'Enfoque sistémico, consulta integral y seguimiento clínico.',
      features: ['Signos Vitales', 'Receta Digital', 'Diagnóstico CIE-11']
    },
    { 
      id: Role.PODOLOGIA, 
      label: 'Podología', 
      icon: Activity, 
      color: 'bg-sky-500', 
      desc: 'Exploración física visual de pie, biomecánica y tratamientos.',
      features: ['Exploración Física Visual', 'Biomecánica', 'Cierres Podológicos']
    },
    { 
      id: Role.ESTETICA, 
      label: 'Medicina Estética', 
      icon: Sparkles, 
      color: 'bg-purple-500', 
      desc: 'Fichas de tratamiento, sesiones y evolución facial/corporal.',
      features: ['Dermapen', 'Botox', 'Aparatología']
    }
  ];

  return (
    <div className="min-h-screen bg-bg-main flex flex-col p-6 md:p-12">
      <div className="flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full">
        <header className="mb-16 text-center">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-48 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center p-4">
               <img src="https://cossma.com.mx/medical.png" alt="Medical D'Lis Logo" className="w-full h-auto object-contain drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight leading-none mb-2 text-center">Medical D'Lis</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] text-center">Acceso Multi-Usuario</p>
            </div>
          </div>
          <h2 className="text-2xl font-serif text-slate-600 italic">Bienvenida, Dra. Lluvia Gutiérrez</h2>
          <p className="text-slate-400 mt-2 font-medium">Seleccione el módulo de trabajo para iniciar jornada</p>
        </header>

        <div className="flex flex-wrap justify-center gap-8">
          {roles.map((role, idx) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => onSelect(role.id)}
              className="bg-white rounded-[2rem] p-8 text-left border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col w-full sm:w-[320px] h-[420px]"
            >
              <div className={`w-14 h-14 ${role.color} rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform`}>
                <role.icon className="w-7 h-7" />
              </div>
              
              <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-brand-purple transition-colors">{role.label}</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 block h-16">{role.desc}</p>
              
              <div className="space-y-2 mb-auto">
                {role.features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-brand-purple font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all mt-8">
                Ingresar
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <footer className="mt-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] w-full">
        © 2024 Medical D'Lis • Sistema Integral de Gestión Médica y Estética
      </footer>
    </div>
  );
}
