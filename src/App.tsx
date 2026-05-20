/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AppointmentForm from './components/AppointmentForm';
import RoleSelection from './components/RoleSelection';
import { Role } from './types';
import { Bell, Menu, LogOut, LayoutDashboard } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [activeSection, setActiveSection] = useState<string>('default');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Reset section when role changes
  useEffect(() => {
    if (activeRole === Role.ADMIN) setActiveSection('metrics');
    else if (activeRole === Role.RECEPCION) setActiveSection('agenda');
    else if (activeRole === Role.MEDICINA_GENERAL || activeRole === Role.CIRUGIA || activeRole === Role.PODOLOGIA) setActiveSection('metrics');
    else if (activeRole === Role.ESTETICA) setActiveSection('metrics');
    else if (activeRole === Role.PACIENTE) setActiveSection('appointments');
  }, [activeRole]);

  const handleLogout = () => {
    setActiveRole(null);
    setActiveSection('default');
    setIsSidebarOpen(false);
  };

  if (!activeRole) {
    return <RoleSelection onSelect={setActiveRole} />;
  }

  return (
    <div className="min-h-screen bg-bg-main flex selection:bg-brand-purple/20 selection:text-brand-purple font-sans tracking-tight">
      {/* Sidebar */}
      <Sidebar 
        activeRole={activeRole} 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-500 ease-in-out lg:ml-80`}>
        {/* Header */}
        <header className="p-4 md:p-8 lg:p-10 pb-0 flex flex-row items-center justify-between gap-2 md:gap-6 sticky top-0 bg-bg-main/90 backdrop-blur-xl z-40 border-b border-transparent">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 md:p-3 bg-white border border-slate-200 rounded-xl md:rounded-2xl text-slate-400 hover:text-brand-purple transition-all shadow-sm shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="bg-white p-2 md:p-3 rounded-xl md:rounded-2xl shadow-md border border-slate-100 flex items-center justify-center shrink-0">
                  <img src="https://cossma.com.mx/medical.png" alt="Medical D'Lis Logo" className="h-10 sm:h-14 md:h-20 w-auto object-contain drop-shadow-sm" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl md:text-3xl font-display font-black text-slate-900 tracking-tight leading-none italic">
                    Medical <span className="text-brand-purple hidden sm:inline">D'Lis.</span>
                  </h1>
                  <p className="text-slate-500 mt-1 md:mt-2 text-[8px] sm:text-[9px] md:text-[11px] font-bold uppercase tracking-wider md:tracking-widest flex items-center gap-1 md:gap-2">
                    <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-brand-purple animate-pulse"></span>
                    <span className="hidden sm:inline">Panel: </span>{activeRole}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className="hidden sm:flex bg-emerald-50 p-2 px-4 rounded-full border border-emerald-100 items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
              <span className="text-[10px] uppercase tracking-[0.15em] font-black text-emerald-700">Sistema Conectado</span>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 p-2 md:p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </header>

        {/* Content Grid */}
        <div className="p-6 md:p-8 lg:p-10 pt-8 grid grid-cols-1 xl:grid-cols-12 gap-10 items-start flex-1">
          {(() => {
            const hasRightSidebar = activeRole === Role.RECEPCION && (activeSection === 'agenda' || activeSection === 'registration');
            return (
              <>
                <div className={`${!hasRightSidebar ? 'xl:col-span-12' : 'xl:col-span-8'} space-y-8`}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${activeRole}-${activeSection}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Dashboard activeRole={activeRole} activeSection={activeSection} onSectionChange={setActiveSection} />
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                {hasRightSidebar && (
                  <div className="xl:col-span-4 lg:sticky lg:top-32 space-y-8">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <AppointmentForm activeRole={activeRole} />
                    </motion.div>
                    
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-brand-purple rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-white/10 rounded-xl">
                          <Bell className="w-4 h-4 text-brand-purple" />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/90">Aviso Sugerido AI</h4>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed font-medium">
                        Se detectó baja de stock en <span className="text-white font-bold">Botox (Vial 100u)</span>. 3 pacientes programados para mañana requieren aplicación.
                      </p>
                      <button className="mt-6 w-full py-3 bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                        Actualizar Inventario
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </main>
    </div>
  );
}


