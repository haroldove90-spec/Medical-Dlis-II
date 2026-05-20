/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutDashboard, CalendarCheck, Users, UserRound, Sparkles, ClipboardList, LogOut, Menu, User, Package, DollarSign, X as CloseIcon, CheckCircle2, Activity, ShieldCheck } from 'lucide-react';
import { Role } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeRole: Role;
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

export default function Sidebar({ activeRole, activeSection, onSectionChange, isOpen, onToggle, onLogout }: SidebarProps) {
  const getMenuItems = () => {
    switch (activeRole) {
      case Role.ADMIN:
        return [
          { id: 'metrics', icon: LayoutDashboard, label: 'Dashboard de Métricas' },
          { id: 'agenda', icon: CalendarCheck, label: 'Agenda Global' },
          { id: 'finance', icon: DollarSign, label: 'Gestión Financiera' },
          { id: 'inventory', icon: Package, label: 'Control de Inventario' },
          { id: 'staff', icon: Users, label: 'Gestión de Personal' },
        ];
      case Role.MEDICINA_GENERAL:
        return [
          { id: 'metrics', icon: LayoutDashboard, label: 'Dashboard Médico' },
          { id: 'agenda', icon: CalendarCheck, label: 'Agenda Médica' },
          { id: 'records', icon: UserRound, label: 'Consulta e Historial' },
          { id: 'recipe', icon: Package, label: 'Recetario Digital' },
          { id: 'lab', icon: ClipboardList, label: 'Laboratorio y Gabinete' },
        ];
      case Role.PODOLOGIA:
        return [
          { id: 'metrics', icon: LayoutDashboard, label: 'Métricas de Podología' },
          { id: 'agenda', icon: CalendarCheck, label: 'Agenda Podológica' },
          { id: 'records', icon: UserRound, label: 'Historial Clínico' },
          { id: 'explorations', icon: ClipboardList, label: 'Exploración Física Visual' },
          { id: 'consent', icon: ShieldCheck, label: 'Consentimiento tratamiento podológico' },
          { id: 'laser_consent', icon: Sparkles, label: 'Consentimiento depilamiento láser' },
          { id: 'treatment_plan', icon: ClipboardList, label: 'Plan de Tratamiento' },
          { id: 'recipe', icon: Package, label: 'Recetario Digital' },
        ];
      case Role.ESTETICA:
        return [
          { id: 'metrics', icon: LayoutDashboard, label: 'Dashboard Estética' },
          { id: 'agenda', icon: CalendarCheck, label: 'Agenda Estética' },
          { id: 'cabin', icon: Sparkles, label: 'Ficha de Cabina' },
          { id: 'photos', icon: UserRound, label: 'Seguimiento Fotos' },
          { id: 'sessions', icon: ClipboardList, label: 'Control Sesiones' },
        ];
      case Role.RECEPCION:
        return [
          { id: 'agenda', icon: LayoutDashboard, label: 'Agenda Multidisciplinaria' },
          { id: 'registration', icon: Users, label: 'Registro Pacientes' },
          { id: 'box', icon: DollarSign, label: 'Caja y Cobranza' },
        ];
      case Role.PACIENTE:
        return [
          { id: 'appointments', icon: LayoutDashboard, label: 'Consulta de Citas' },
          { id: 'results', icon: ClipboardList, label: 'Resultados y Recetas' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const sidebarContent = (
    <div className="w-full h-full flex flex-col bg-slate-900 border-r border-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-purple to-purple-400"></div>
      
      <div className="flex-1 overflow-y-auto p-6 min-h-0 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <div className="mb-12 flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 transition-all duration-300 flex items-center bg-white rounded-xl p-2 w-40">
               <img src="https://cossma.com.mx/medical.png" alt="Medical D'Lis Logo" className="w-full h-auto object-contain" />
            </div>
          </div>
          <button onClick={onToggle} className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-1.5 overflow-hidden">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.25em] mb-6 px-4 transition-opacity duration-300">Módulos Activos</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                title={item.label}
                onClick={() => {
                  onSectionChange(item.id);
                  onToggle();
                }}
                className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 font-bold text-sm relative group ${
                  isActive 
                    ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/25' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="min-w-[1.25rem] flex items-center justify-center flex-shrink-0"><Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-600 group-hover:text-brand-purple'}`} /></div>
                <span className="transition-opacity duration-300 whitespace-nowrap">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="sidebarActive"
                    className="absolute left-[-8px] w-1.5 h-6 bg-white rounded-r-full"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-white/5 bg-slate-900/50 backdrop-blur-sm space-y-3">
        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors cursor-pointer">
          <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-slate-800 text-slate-400 border border-white/5 flex items-center justify-center font-black text-xs shadow-inner group-hover:border-brand-purple/30 group-hover:text-brand-purple transition-all">
            LG
          </div>
          <div className="overflow-hidden transition-opacity duration-300">
            <p className="text-xs font-black text-white leading-none mb-1 truncate">Dra. Lluvia G.</p>
            <p className="text-[8px] text-brand-purple font-black tracking-widest uppercase truncate">{activeRole}</p>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          title="Cerrar Sesión"
          className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-rose-500 transition-all px-3 w-full py-4 hover:bg-rose-500/5 rounded-2xl border border-transparent hover:border-rose-500/10"
        >
          <div className="min-w-[1.25rem] flex items-center justify-center flex-shrink-0"><LogOut className="w-5 h-5" /></div>
          <span className="transition-opacity duration-300 whitespace-nowrap">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed left-0 top-0 bottom-0 z-[70] transition-all duration-500 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } w-80 overflow-hidden shadow-2xl`}>
        {sidebarContent}
      </aside>
    </>
  );
}
