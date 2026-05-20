/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, DollarSign, TrendingUp, Award, Plus, X, UserPlus, Briefcase, CheckCircle2 } from 'lucide-react';
import { Staff } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_STAFF: Staff[] = [
  { id: '1', name: 'Dra. Lluvia G.', role: 'Directora / Médica', commission: 14500, services: 42 },
  { id: '2', name: 'Lic. Ana Martínez', role: 'Cosmetóloga', commission: 4800, services: 64 },
  { id: '3', name: 'Dr. Roberto Sánchez', role: 'Podólogo', commission: 3950, services: 18 },
  { id: '4', name: 'Lic. Carla Ruiz', role: 'Enfermera Gral', commission: 2100, services: 30 },
  { id: '5', name: 'Dr. Ricardo Valdés', role: 'Gastroenterólogo', commission: 7200, services: 12 },
  { id: '6', name: 'Sandra López', role: 'Recepcionista', commission: 500, services: 0 },
  { id: '7', name: 'Miguel Ángel Torres', role: 'Podólogo Jr.', commission: 1850, services: 15 },
  { id: '8', name: 'Dra. Sofía Castro', role: 'Dermatóloga', commission: 9400, services: 28 },
];

export default function StaffManager() {
  const [staff, setStaff] = useState<Staff[]>(INITIAL_STAFF);
  const [showForm, setShowForm] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', role: '' });
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAddCommission = (id: string) => {
    setStaff(prev => prev.map(person => 
      person.id === id ? { ...person, commission: person.commission + 500, services: person.services + 1 } : person
    ));
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.name || !newStaff.role) return;

    const staffMember: Staff = {
      id: Math.random().toString(36).substr(2, 9),
      name: newStaff.name,
      role: newStaff.role,
      commission: 0,
      services: 0
    };

    setStaff([staffMember, ...staff]);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setShowForm(false);
      setNewStaff({ name: '', role: '' });
    }, 1500);
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-display font-black text-slate-900">Gestión de Personal</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Comisiones y Rendimiento</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`p-3 rounded-2xl text-white transition-all transform hover:scale-110 ${showForm ? 'bg-rose-500 rotate-45' : 'bg-brand-purple'}`}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showForm ? (
          <motion.form 
            key="staff-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleCreateStaff}
            className="mb-8 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-brand-purple/10 rounded-lg">
                <UserPlus className="w-4 h-4 text-brand-purple" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-600">Nuevo Integrante</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nombre Completo</label>
                <input 
                  type="text" 
                  value={newStaff.name}
                  onChange={e => setNewStaff({...newStaff, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-brand-purple/30"
                  placeholder="Ej. Dr. Mario Santos"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Puesto / Especialidad</label>
                <input 
                  type="text" 
                  value={newStaff.role}
                  onChange={e => setNewStaff({...newStaff, role: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-brand-purple/30"
                  placeholder="Ej. Dermatólogo"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSuccess}
              className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                isSuccess ? 'bg-emerald-500 shadow-emerald-100' : 'bg-slate-900 shadow-slate-100 hover:bg-brand-purple'
              } text-white shadow-xl`}
            >
              {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isSuccess ? 'Personal Registrado' : 'Dar de Alta Personal'}
            </button>
          </motion.form>
        ) : (
          <motion.div 
            key="staff-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar"
          >
            {staff.map((person, idx) => (
              <motion.div 
                key={person.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="p-5 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-brand-purple/20 transition-all cursor-pointer overflow-hidden relative"
                onClick={() => handleAddCommission(person.id)}
              >
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-[8px] font-black bg-brand-purple text-white px-2 py-1 rounded-lg uppercase tracking-widest">Añadir Venta</div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-500 text-xs shadow-sm group-hover:bg-brand-purple group-hover:text-white transition-all">
                      {person.name.split(' ').filter(n => n.length > 2).slice(0, 2).map(n => n[0]).join('') || 'U'}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{person.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{person.role}</p>
                    </div>
                  </div>
                  <Award className={`w-5 h-5 ${idx === 0 ? 'text-amber-400' : 'text-slate-200'}`} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Comisión</p>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-emerald-500" />
                      <span className="text-sm font-black text-slate-900">${person.commission.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Servicios</p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-brand-purple" />
                      <span className="text-sm font-black text-slate-900">{person.services}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button className="w-full mt-6 py-4 bg-slate-50 text-slate-900 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all border border-slate-100">
        Reporte de Nómina Completo
      </button>
    </div>
  );
}

