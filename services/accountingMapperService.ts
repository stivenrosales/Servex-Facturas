/**
 * Servicio de Mapeo de Datos Contables
 *
 * Este servicio toma una factura procesada por Gemini AI y la enriquece
 * con datos contables basándose en el RUC del proveedor.
 *
 * Mapeos realizados:
 * - REGLA 1: RUC → Cuenta Contable
 * - REGLA 2: RUC → Cuenta Gasto + Centro de Costo
 * - REGLA 3: RUC → Código Flujo de Caja
 */

import { InvoiceData, AccountingData } from '../types';
import {
  REGLA_1_CUENTA_CONTABLE,
  REGLA_2_GASTO_CENTRO,
  REGLA_3_FLUJO_CAJA
} from '../data/accountingRules';

/**
 * Normaliza un RUC para búsqueda consistente
 * - Elimina espacios y guiones
 * - Convierte a mayúsculas
 * - Trim de espacios al inicio y final
 */
function normalizeRUC(ruc: string): string {
  return ruc
    .trim()
    .replace(/[\s-]/g, '')
    .toUpperCase();
}

/**
 * Determina el estado de mapeo basado en cuántas reglas encontraron datos
 */
function getMappingStatus(
  hasRule1: boolean,
  hasRule2: boolean,
  hasRule3: boolean
): 'mapped' | 'partial' | 'not_found' {
  if (hasRule1 && hasRule2 && hasRule3) {
    return 'mapped';
  } else if (hasRule1 || hasRule2 || hasRule3) {
    return 'partial';
  } else {
    return 'not_found';
  }
}

/**
 * Enriquece una factura con datos contables basándose en su RUC
 *
 * @param invoice - Factura procesada por Gemini AI
 * @returns Factura con datos contables agregados
 */
export function enrichInvoiceWithAccounting(invoice: InvoiceData): InvoiceData {
  const rucNormalizado = normalizeRUC(invoice.ruc);

  // Inicializar objeto de datos contables
  const accountingData: AccountingData = {
    mappingStatus: 'not_found',
    mappingErrors: []
  };

  // Buscar en REGLA 1: Cuenta Contable
  const regla1 = REGLA_1_CUENTA_CONTABLE[rucNormalizado];
  if (regla1) {
    accountingData.cuentaContable = regla1.cuenta;
  } else {
    accountingData.mappingErrors?.push('REGLA 1 (Cuenta Contable) no encontrada');
  }

  // Buscar en REGLA 2: Cuenta Gasto + Centro de Costo
  const regla2 = REGLA_2_GASTO_CENTRO[rucNormalizado];
  if (regla2) {
    accountingData.cuentaGasto = regla2.cuentaGasto;
    accountingData.nombreCuentaGasto = regla2.nombreCuenta;
    accountingData.centroCosto = regla2.centroCosto;
    accountingData.descripcionCentroCosto = regla2.descripcion;
  } else {
    accountingData.mappingErrors?.push('REGLA 2 (Gasto y Centro de Costo) no encontrada');
  }

  // Buscar en REGLA 3: Código Flujo de Caja
  const regla3 = REGLA_3_FLUJO_CAJA[rucNormalizado];
  if (regla3) {
    accountingData.codigoFlujoCaja = regla3.codigoFlujo;
  } else {
    accountingData.mappingErrors?.push('REGLA 3 (Flujo de Caja) no encontrada');
  }

  // Determinar estado de mapeo
  accountingData.mappingStatus = getMappingStatus(
    !!regla1,
    !!regla2,
    !!regla3
  );

  // Si todo está mapeado, limpiar array de errores
  if (accountingData.mappingStatus === 'mapped') {
    accountingData.mappingErrors = undefined;
  }

  // Logging para debugging
  console.log(
    `📊 Mapeo para RUC ${invoice.ruc} (${invoice.nombreEmpresa}):`,
    accountingData.mappingStatus,
    accountingData.mappingStatus !== 'mapped' ? accountingData.mappingErrors : '✓ Completo'
  );

  // Retornar factura enriquecida
  return {
    ...invoice,
    accounting: accountingData
  };
}

/**
 * Enriquece un lote de facturas con datos contables
 *
 * @param invoices - Array de facturas a enriquecer
 * @returns Array de facturas enriquecidas
 */
export function enrichInvoicesWithAccounting(invoices: InvoiceData[]): InvoiceData[] {
  return invoices.map(enrichInvoiceWithAccounting);
}

/**
 * Obtiene estadísticas de mapeo para un conjunto de facturas
 * Útil para reportes y validación
 */
export function getMappingStatistics(invoices: InvoiceData[]) {
  const stats = {
    total: invoices.length,
    mapped: 0,
    partial: 0,
    notFound: 0,
    percentMapped: 0
  };

  invoices.forEach(inv => {
    if (!inv.accounting) return;

    switch (inv.accounting.mappingStatus) {
      case 'mapped':
        stats.mapped++;
        break;
      case 'partial':
        stats.partial++;
        break;
      case 'not_found':
        stats.notFound++;
        break;
    }
  });

  stats.percentMapped = stats.total > 0
    ? Math.round((stats.mapped / stats.total) * 100)
    : 0;

  return stats;
}
