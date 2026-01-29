
import React, { useState } from 'react';
import Header from './components/Header';
import InvoiceUploader from './components/InvoiceUploader';
import InvoiceCard from './components/InvoiceCard';
import { InvoiceData, AccountingData } from './types';
import { extractInvoiceData } from './services/geminiService';
import { exportToERPExcel } from './utils/erpExport';
import { enrichInvoiceWithAccounting } from './services/accountingMapperService';
import { getMimeType, isPDF } from './utils/fileTypeDetector';

const App: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const handleBatchUpload = async (filesData: { base64: string, file: File }[]) => {
    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: filesData.length });

    let count = 0;
    const errors: string[] = [];

    for (const item of filesData) {
      count++;
      setProgress({ current: count, total: filesData.length });
      
      try {
        // Detectar tipo de archivo
        const mimeType = getMimeType(item.file);
        const fileType = isPDF(item.file) ? 'pdf' : 'image';

        // Extraer datos con Gemini usando el MIME type correcto
        let data = await extractInvoiceData(item.base64, mimeType);
        const imageUrl = URL.createObjectURL(item.file);

        // Enriquecer con datos contables y metadata del archivo
        data = enrichInvoiceWithAccounting({
          ...data,
          imageUrl,
          fileType,
          fileName: item.file.name
        });

        setInvoices(prev => [data, ...prev]);
      } catch (err: any) {
        console.error(`Error processing file ${item.file.name}:`, err);
        errors.push(item.file.name);
      }
    }

    if (errors.length > 0) {
      setError(`No se pudieron procesar algunos archivos: ${errors.join(', ')}`);
    }

    setLoading(false);
  };

  const removeInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const updateInvoiceAccounting = (id: string, accounting: AccountingData) => {
    setInvoices(prev =>
      prev.map(inv =>
        inv.id === id ? { ...inv, accounting } : inv
      )
    );
  };

  const handleExport = () => {
    exportToERPExcel(invoices);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Columna Izquierda: Input y Resumen */}
          <div className="lg:col-span-5 space-y-8">
            <section>
              <div className="mb-6">
                <h2 className="text-3xl font-black text-[#00468b] leading-tight">
                  Procesamiento <br /><span className="text-blue-500">Multidocumento AI</span>
                </h2>
                <p className="text-gray-500 mt-2 text-lg">
                  Sube múltiples imágenes o PDFs y extrae RUC, montos y detalles automáticamente.
                </p>
              </div>
              
              <InvoiceUploader 
                onUpload={handleBatchUpload} 
                isLoading={loading} 
                processingCount={loading ? progress : undefined}
              />
              
              {error && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl text-sm flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
            </section>

            {invoices.length > 0 && (
              <section className="bg-[#00468b] rounded-2xl p-6 text-white shadow-xl">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold">Resumen del Lote</h3>
                  <span className="bg-white/20 text-white text-[10px] px-2 py-1 rounded-md uppercase tracking-wider font-bold">
                    Excel Listo
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-blue-200 text-sm">Facturas en lista</p>
                    <p className="text-4xl font-black">{invoices.length}</p>
                  </div>
                  <button 
                    onClick={handleExport}
                    className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center gap-2 shadow-lg active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2a4 4 0 00-4-4H5m11 0h2a4 4 0 014 4v2m-3-9.5V7a2 2 0 00-2-2H9a2 2 0 00-2 2v2.5m10 0L10 17l-3-3" />
                    </svg>
                    Descargar Excel
                  </button>
                </div>
              </section>
            )}
          </div>

          {/* Columna Derecha: Lista de Resultados */}
          <div className="lg:col-span-7">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Visualización de Datos</h3>
              {invoices.length > 0 && (
                <button 
                  onClick={() => setInvoices([])}
                  className="text-xs font-bold text-red-500 hover:text-red-600 uppercase tracking-wider"
                >
                  Limpiar Todo
                </button>
              )}
            </div>

            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-200 rounded-3xl text-gray-400">
                  <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <p className="text-lg font-medium">Esperando documentos...</p>
                  <p className="text-sm">Los datos extraídos aparecerán aquí.</p>
                </div>
              ) : (
                invoices.map((inv) => (
                  <InvoiceCard
                    key={inv.id}
                    invoice={inv}
                    onRemove={removeInvoice}
                    onAccountingUpdate={updateInvoiceAccounting}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                <div className="w-8 h-8 bg-[#00468b] rounded flex items-center justify-center font-bold">S</div>
                <h4 className="text-xl font-bold tracking-tight uppercase">Servex BPO AI</h4>
              </div>
              <p className="text-gray-400 text-sm">
                Líderes en externalización de procesos financieros y transformación digital en el Perú.
              </p>
            </div>
            <div className="space-y-2">
              <h5 className="font-bold mb-4">Soluciones</h5>
              <ul className="text-gray-400 text-sm space-y-2">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Digitalización de Facturas</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Dashboard Financiero</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Exportación Dinámica</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Información</h5>
              <p className="text-gray-400 text-sm">Soporte Técnico Servex</p>
              <p className="text-gray-400 text-sm font-medium mt-2">lima-centro@servex.com.pe</p>
              <div className="flex gap-4 mt-6 justify-center md:justify-start">
                <div className="w-8 h-8 bg-white/5 rounded-full hover:bg-white/10 cursor-pointer"></div>
                <div className="w-8 h-8 bg-white/5 rounded-full hover:bg-white/10 cursor-pointer"></div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-xs">
            © 2024 Servex BPO Solutions - Módulo de Inteligencia Artificial para Facturación.
          </div>
        </div>
      </footer>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default App;
