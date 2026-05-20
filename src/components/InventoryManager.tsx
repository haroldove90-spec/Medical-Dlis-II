/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Package, AlertCircle, ShoppingCart, Search } from 'lucide-react';
import { InventoryItem } from '../types';
import { motion } from 'motion/react';

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Botox (Vial 100u)', stock: 5, minStock: 3, category: 'Estética' },
  { id: '2', name: 'Relleno Hialurónico', stock: 12, minStock: 10, category: 'Estética' },
  { id: '3', name: 'Kits Sutura Pro', stock: 2, minStock: 5, category: 'Cirugía' },
  { id: '4', name: 'Gasas Estériles (Paq.)', stock: 50, minStock: 20, category: 'Gral' },
  { id: '5', name: 'Guantes de Nitrilo (Caja)', stock: 8, minStock: 15, category: 'Gral' },
  { id: '6', name: 'Cartuchos Dermapen', stock: 15, minStock: 10, category: 'Estética' },
  { id: '7', name: 'Gel Conductivo 5L', stock: 1, minStock: 2, category: 'Estética' },
  { id: '8', name: 'Cánulas Endoscopia', stock: 4, minStock: 10, category: 'Cirugía' },
  { id: '9', name: 'Mascarilla Hidrogel', stock: 25, minStock: 10, category: 'Estética' },
  { id: '10', name: 'Anestésico Tópico 30g', stock: 10, minStock: 5, category: 'Estética' },
  { id: '11', name: 'Compresas Frías', stock: 30, minStock: 15, category: 'Gral' },
  { id: '12', name: 'Agujas 30G x 1/2', stock: 100, minStock: 50, category: 'Estética' },
  { id: '13', name: 'Jeringas 3ml', stock: 200, minStock: 50, category: 'Gral' },
  { id: '14', name: 'Alcohol Isopropílico 70%', stock: 15, minStock: 5, category: 'Gral' },
  { id: '15', name: 'Solución Salina 500ml', stock: 24, minStock: 12, category: 'Cirugía' },
  { id: '16', name: 'Campos Estériles', stock: 40, minStock: 20, category: 'Cirugía' },
  { id: '17', name: 'Hojas de Bisturí #15', stock: 8, minStock: 20, category: 'Podología' },
  { id: '18', name: 'Crema Hidratante Urea 10%', stock: 12, minStock: 6, category: 'Podología' },
];

export default function InventoryManager() {
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [search, setSearch] = useState('');

  const handleOrder = (id: string) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, stock: item.stock + 10 } : item
    ));
  };

  const filteredItems = inventory.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div>
          <h3 className="text-xl font-display font-black text-slate-900">Control de Insumos</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Supervisión de Inventario Crítico</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar insumo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-brand-purple/30 transition-all"
          />
        </div>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredItems.map((item, idx) => {
          const isLow = item.stock <= item.minStock;
          return (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                isLow ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-xl shadow-sm ${isLow ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-500'}`}>
                   {isLow ? <AlertCircle className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">{item.name}</h4>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">{item.category}</p>
                </div>
              </div>
              
              <div className="text-right flex items-center gap-6">
                <div>
                  <p className={`text-sm font-black ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                    {item.stock} uds
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Mín: {item.minStock}</p>
                </div>
                <button 
                  onClick={() => handleOrder(item.id)}
                  className={`p-2 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    isLow ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  Surtir
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <button className="w-full mt-6 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold uppercase tracking-widest hover:border-brand-purple hover:text-brand-purple transition-all flex items-center justify-center gap-2">
        <ShoppingCart className="w-4 h-4" />
        Ver Catálogo Completo
      </button>
    </div>
  );
}
