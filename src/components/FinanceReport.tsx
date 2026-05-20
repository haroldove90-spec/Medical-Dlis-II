/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Wallet, CreditCard, Banknote, PieChart, CheckCircle2, TrendingUp, Lock } from 'lucide-react';
import { motion } from 'motion/react';

export default function FinanceReport() {
  const [isClosed, setIsClosed] = useState(false);
  const financeData = {
    total: '$12,450.00',
    methods: [
      { name: 'Efectivo', amount: '$4,280.00', percentage: 34, icon: Banknote, color: 'text-emerald-500' },
      { name: 'Tarjeta / Transf.', amount: '$8,170.00', percentage: 66, icon: CreditCard, color: 'text-brand-purple' },
    ],
    departments: [
      { name: 'Podología', amount: '$2,150', color: 'bg-sky-400' },
      { name: 'Cirugía General', amount: '$6,800', color: 'bg-brand-purple' },
      { name: 'Medicina Estética', amount: '$3,500', color: 'bg-purple-400' },
      { name: 'Medicina General', amount: '$1,250', color: 'bg-emerald-400' },
      { name: 'Laboratorio / Gabinete', amount: '$1,950', color: 'bg-amber-400' },
    ],
    history: [
      { period: 'Esta Semana', amount: '$85,200', growth: '+15%' },
      { period: 'Semana Anterior', amount: '$74,100', growth: '+12%' },
      { period: 'Mensual (Abril)', amount: '$312,400', growth: '+8%' },
      { period: 'Mensual (Marzo)', amount: '$289,500', growth: '+5%' },
    ]
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Main Stats */}
        <div className="lg:col-span-1 dashboard-card overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-brand-purple-light rounded-xl">
              <Wallet className="w-5 h-5 text-brand-purple" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Caja del Día</h3>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Hoy</p>
              <h4 className="text-4xl font-black text-slate-900 tracking-tight">{financeData.total}</h4>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {financeData.methods.map((method) => {
                const Icon = method.icon;
                return (
                  <div key={method.name} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-white rounded-xl shadow-sm ${method.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{method.name}</span>
                    </div>
                    <p className="text-sm font-black text-slate-900">{method.amount}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dept Breakdown */}
        <div className="dashboard-card">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-brand-purple" />
            <h3 className="text-lg font-bold text-slate-900">Ingresos por Área</h3>
          </div>
          <div className="space-y-4">
            {financeData.departments.map((dept) => (
              <div key={dept.name} className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${dept.color}`}></div>
                  <span className="text-sm font-medium text-slate-600">{dept.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{dept.amount}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-50">
             <button 
              onClick={() => setIsClosed(true)}
              disabled={isClosed}
              className={`w-full p-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
                isClosed ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-brand-purple'
              }`}
             >
              {isClosed ? <Lock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {isClosed ? 'Caja Cerrada Exitosamente' : 'Realizar Cierre de Caja'}
            </button>
          </div>
        </div>

        {/* Historical Summaries */}
        <div className="dashboard-card border-none bg-slate-900 text-white">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="w-5 h-5 text-brand-purple-light" />
            <h3 className="text-lg font-bold">Histórico Mensual</h3>
          </div>
          <div className="space-y-6">
            {financeData.history.map((item) => (
              <div key={item.period} className="relative">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{item.period}</p>
                <div className="flex items-end justify-between">
                  <h4 className="text-3xl font-black tracking-tight">{item.amount}</h4>
                  <span className="text-[10px] font-black px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg">
                    {item.growth}
                  </span>
                </div>
                <div className="mt-4 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-brand-purple-light w-[70%]"></div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-12 italic font-medium leading-relaxed">
            * Datos proyectados en base a la agenda de las próximas 4 semanas.
          </p>
        </div>
      </div>
    </div>
  );
}
