
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#00468b] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#00468b] tracking-tight">SERVEX</h1>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">BPO Solutions AI</p>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-600 hover:text-[#00468b] font-medium transition-colors">Dashboard</a>
            <a href="#" className="text-gray-600 hover:text-[#00468b] font-medium transition-colors">Procesamiento</a>
            <a href="#" className="text-gray-600 hover:text-[#00468b] font-medium transition-colors">Historial</a>
            <button className="bg-[#00468b] text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-[#003569] transition-all shadow-md">
              Mi Cuenta
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
