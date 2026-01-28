import React, { useState } from 'react';
import { AccountingData } from '../types';

interface Props {
  accounting: AccountingData;
  onUpdate?: (updated: AccountingData) => void;
}

/**
 * Componente de Tabla de Datos Contables
 *
 * Muestra los datos contables mapeados de una factura en formato tabla expandible/colapsable.
 * Permite edición inline de campos contables.
 *
 * Estados:
 * - Colapsado (default): Muestra solo 3 campos clave
 * - Expandido: Muestra todos los campos contables
 */
const AccountingDataTable: React.FC<Props> = ({ accounting, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localAccounting, setLocalAccounting] = useState(accounting);

  // Colores de badge según estado de mapeo
  const getBadgeClasses = (status: string) => {
    switch (status) {
      case 'mapped':
        return 'bg-green-500 text-white';
      case 'partial':
        return 'bg-yellow-500 text-white';
      case 'not_found':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getBadgeText = (status: string) => {
    switch (status) {
      case 'mapped':
        return '✓ Mapeado';
      case 'partial':
        return '⚠ Parcial';
      case 'not_found':
        return '✗ No Mapeado';
      default:
        return 'Desconocido';
    }
  };

  // Manejador de cambios en campos
  const handleFieldChange = (field: keyof AccountingData, value: string) => {
    const updated = {
      ...localAccounting,
      [field]: value
    };
    setLocalAccounting(updated);
    onUpdate?.(updated);
  };

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h5 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          Datos Contables
        </h5>
        <span
          className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${getBadgeClasses(
            localAccounting.mappingStatus
          )}`}
        >
          {getBadgeText(localAccounting.mappingStatus)}
        </span>
      </div>

      {/* Vista Colapsada: Muestra 3 campos principales */}
      {!isExpanded && (
        <div className="space-y-3">
          {/* Cuenta Contable */}
          {localAccounting.cuentaContable !== undefined && (
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">
                Cuenta Contable
              </label>
              <input
                type="text"
                value={localAccounting.cuentaContable || 'NO MAPEADO'}
                onChange={(e) =>
                  handleFieldChange('cuentaContable', e.target.value)
                }
                className="w-full font-mono font-semibold text-blue-900 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
          )}

          {/* Cuenta Gasto */}
          {localAccounting.cuentaGasto !== undefined && (
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">
                Cuenta Gasto
              </label>
              <input
                type="text"
                value={localAccounting.cuentaGasto || 'NO MAPEADO'}
                onChange={(e) =>
                  handleFieldChange('cuentaGasto', e.target.value)
                }
                className="w-full font-mono font-semibold text-blue-900 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
              {localAccounting.nombreCuentaGasto && (
                <p className="text-xs text-gray-600 mt-1">
                  {localAccounting.nombreCuentaGasto}
                </p>
              )}
            </div>
          )}

          {/* Centro de Costo */}
          {localAccounting.centroCosto !== undefined && (
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">
                Centro de Costo
              </label>
              <input
                type="text"
                value={localAccounting.centroCosto || 'NO MAPEADO'}
                onChange={(e) =>
                  handleFieldChange('centroCosto', e.target.value)
                }
                className="w-full font-mono font-semibold text-blue-900 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
              {localAccounting.descripcionCentroCosto && (
                <p className="text-xs text-gray-600 mt-1">
                  {localAccounting.descripcionCentroCosto}
                </p>
              )}
            </div>
          )}

          {/* Botón Expandir */}
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full text-xs font-semibold text-blue-700 hover:text-blue-900 py-2 flex items-center justify-center gap-2 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
            Ver todos los detalles
          </button>
        </div>
      )}

      {/* Vista Expandida: Muestra todos los campos */}
      {isExpanded && (
        <div className="space-y-3">
          {/* Cuenta Contable */}
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">
              Cuenta Contable
            </label>
            <input
              type="text"
              value={localAccounting.cuentaContable || 'NO MAPEADO'}
              onChange={(e) =>
                handleFieldChange('cuentaContable', e.target.value)
              }
              className="w-full font-mono font-semibold text-blue-900 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          {/* Cuenta Gasto */}
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">
              Cuenta Gasto
            </label>
            <input
              type="text"
              value={localAccounting.cuentaGasto || 'NO MAPEADO'}
              onChange={(e) =>
                handleFieldChange('cuentaGasto', e.target.value)
              }
              className="w-full font-mono font-semibold text-blue-900 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          {/* Nombre Cuenta Gasto (solo lectura) */}
          {localAccounting.nombreCuentaGasto && (
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">
                Nombre Cuenta Gasto
              </label>
              <p className="font-mono text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                {localAccounting.nombreCuentaGasto}
              </p>
            </div>
          )}

          {/* Centro de Costo */}
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">
              Centro de Costo
            </label>
            <input
              type="text"
              value={localAccounting.centroCosto || 'NO MAPEADO'}
              onChange={(e) =>
                handleFieldChange('centroCosto', e.target.value)
              }
              className="w-full font-mono font-semibold text-blue-900 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          {/* Descripción Centro Costo (solo lectura) */}
          {localAccounting.descripcionCentroCosto && (
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">
                Descripción Centro de Costo
              </label>
              <p className="font-mono text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                {localAccounting.descripcionCentroCosto}
              </p>
            </div>
          )}

          {/* Flujo de Caja */}
          {localAccounting.codigoFlujoCaja !== undefined && (
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">
                Flujo de Caja
              </label>
              <input
                type="text"
                value={localAccounting.codigoFlujoCaja || 'NO MAPEADO'}
                onChange={(e) =>
                  handleFieldChange('codigoFlujoCaja', e.target.value)
                }
                className="w-full font-mono font-semibold text-blue-900 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
          )}

          {/* Errores de Mapeo (si existen) */}
          {localAccounting.mappingErrors &&
            localAccounting.mappingErrors.length > 0 && (
              <div className="pt-3 border-t border-blue-200">
                <p className="text-xs text-amber-700 font-medium">
                  ⚠ {localAccounting.mappingErrors.join(', ')}
                </p>
              </div>
            )}

          {/* Botón Colapsar */}
          <button
            onClick={() => setIsExpanded(false)}
            className="w-full text-xs font-semibold text-blue-700 hover:text-blue-900 py-2 flex items-center justify-center gap-2 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 15l7-7 7 7"
              />
            </svg>
            Ocultar detalles
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountingDataTable;
