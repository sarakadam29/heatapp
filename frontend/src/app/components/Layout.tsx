import React from 'react';
import { Outlet } from 'react-router-dom';
import { useHeatGuardStore } from '../store/useHeatGuardStore';
import { motion } from 'motion/react';

export default function Layout() {
  const store = useHeatGuardStore();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* Header */}
      <header className="h-14 sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌡️</span>
          <h1 className="font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
            HeatGuard
          </h1>
        </div>
        
        {/* Data Source Banner */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
          <div className={`w-2 h-2 rounded-full ${store.weatherSource === 'live' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
          <span className="text-xs font-medium text-slate-300">
            {store.weatherSource === 'live' ? 'Live Data ✓' : 'Demo Data'}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 py-8">
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: 20 }}
           transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800 text-center">
         <p className="text-xs text-slate-500">
            HeatGuard - Know before you go. Stay safe in the heat.
         </p>
         <p className="text-[10px] text-slate-600 mt-1">
            Not medical advice. Built according to product specifications.
         </p>
      </footer>
    </div>
  );
}