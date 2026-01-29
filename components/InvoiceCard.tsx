
import React from 'react';
import { InvoiceData, AccountingData } from '../types';
import AccountingDataTable from './AccountingDataTable';

interface Props {
  invoice: InvoiceData;
  onRemove: (id: string) => void;
  onAccountingUpdate?: (id: string, accounting: AccountingData) => void;
}

const InvoiceCard: React.FC<Props> = ({ invoice, onRemove, onAccountingUpdate }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start gap-4">
            {invoice.imageUrl && (
              <div className="w-16 h-16 rounded-lg border border-gray-100 overflow-hidden">
                {invoice.fileType === 'pdf' ? (
                  <div className="w-full h-full bg-red-50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                ) : (
                  <img
                    src={invoice.imageUrl}
                    alt="Miniatura Factura"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}
            <div>
              <h4 className="text-xl font-bold text-gray-900">{invoice.nombreEmpresa}</h4>
              <p className="text-sm text-gray-500 font-mono">RUC: {invoice.ruc}</p>
              <p className="text-xs text-gray-400 mt-1">{invoice.direccion}</p>
            </div>
          </div>
          <button 
            onClick={() => onRemove(invoice.id)}
            className="text-gray-400 hover:text-red-500 p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Sección de Datos Contables */}
        {invoice.accounting && (
          <AccountingDataTable
            accounting={invoice.accounting}
            onUpdate={(updated) => onAccountingUpdate?.(invoice.id, updated)}
          />
        )}

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Detalle de Compra</h5>
            <div className="space-y-3">
              {invoice.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.descripcion}</p>
                    <p className="text-xs text-gray-500">Cant: {item.cantidad} x {invoice.moneda} {item.precioUnitario?.toFixed(2)}</p>
                  </div>
                  <div className="text-right font-semibold text-[#00468b]">
                    {invoice.moneda} {item.montoTotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-medium text-gray-600">Monto Total:</span>
            <span className="text-2xl font-black text-[#00468b]">
              {invoice.moneda} {invoice.montoTotalFactura.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;
