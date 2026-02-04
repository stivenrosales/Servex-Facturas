/**
 * Exportación a Excel en Formato ERP
 *
 * Este módulo exporta facturas al formato completo requerido por el ERP,
 * basado en el "MODELO PARA SUBIR AL ERP" (Sheet2) del archivo Excel de reglas.
 *
 * Genera 3 hojas:
 * 1. "Datos ERP" - Datos formateados para importación directa al ERP
 * 2. "Resumen de Mapeo" - Estadísticas de efectividad del mapeo
 * 3. "No Mapeados" - Listado de facturas con RUC no encontrados
 */

import * as XLSX from 'xlsx';
import { InvoiceData } from '../types';

/**
 * Calcula la Base Gravada (sin IGV) a partir del monto total
 * En Perú, IGV = 18%, entonces: Base Gravada = Total / 1.18
 */
function calcularBaseGravada(total: number): number {
  return parseFloat((total / 1.18).toFixed(2));
}

/**
 * Calcula el IGV (18%) a partir del monto total
 * IGV = Total - Base Gravada
 */
function calcularIGV(total: number): number {
  const base = calcularBaseGravada(total);
  return parseFloat((total - base).toFixed(2));
}

/**
 * Convierte el símbolo o nombre de moneda a código numérico ERP
 * - '001' para Soles (S/., PEN, SOL, SOLES)
 * - '002' para Dólares (USD, $, DOLAR, DOLARES)
 */
function convertirCodigoMoneda(moneda: string): string {
  if (!moneda) {
    return '001'; // Default: Soles
  }

  // Normalizar: trim y convertir a mayúsculas
  const monedaNormalizada = moneda.trim().toUpperCase();

  // Detectar Soles
  if (
    monedaNormalizada.includes('S/') ||
    monedaNormalizada === 'PEN' ||
    monedaNormalizada === 'SOL' ||
    monedaNormalizada === 'SOLES'
  ) {
    return '001';
  }

  // Detectar Dólares
  if (
    monedaNormalizada.includes('$') ||
    monedaNormalizada === 'USD' ||
    monedaNormalizada === 'DOLAR' ||
    monedaNormalizada === 'DOLARES'
  ) {
    return '002';
  }

  // Default: Soles (caso de moneda no reconocida)
  console.warn(`⚠️ Moneda no reconocida: "${moneda}". Asumiendo Soles (001).`);
  return '001';
}

/**
 * Determina el código de Cuenta Total según la moneda
 * - '421211' para Soles
 * - '421212' para Dólares
 */
function determinarCuentaTotal(moneda: string): string {
  const codigoMoneda = convertirCodigoMoneda(moneda);
  return codigoMoneda === '001' ? '421211' : '421212';
}

/**
 * Extrae el número de serie de la factura
 * Por ahora retorna placeholder "F001", pero puede ser mejorado
 * para extraer de campos específicos de la factura
 */
function extractSerie(invoice: InvoiceData): string {
  // TODO: Implementar lógica específica si Gemini extrae la serie
  return 'F001';
}

/**
 * Extrae el número de factura
 * Usa los últimos 6 dígitos del ID generado
 */
function extractNumero(id: string): string {
  const timestamp = id.replace('INV-', '');
  return timestamp.slice(-6);
}

/**
 * Determina el tipo de gasto basado en la descripción del item
 * Categorías: SERVICIO, COMPRA, ALQUILER, GENERAL
 */
function determinarTipoGasto(descripcion: string): string {
  const desc = descripcion.toLowerCase();

  if (desc.includes('servicio') || desc.includes('mantenimiento')) {
    return 'SERVICIO';
  } else if (desc.includes('producto') || desc.includes('mercaderia') || desc.includes('mercancía')) {
    return 'COMPRA';
  } else if (desc.includes('alquiler') || desc.includes('arriendo')) {
    return 'ALQUILER';
  }

  return 'GENERAL';
}

/**
 * Formatea una fecha al formato DD/MM/YYYY requerido por el ERP peruano
 */
function formatFecha(fecha: string): string {
  if (!fecha) {
    return new Date().toLocaleDateString('es-PE');
  }

  try {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE');
  } catch {
    return fecha; // Si falla, retornar el string original
  }
}

/**
 * Calcula la fecha de vencimiento (Fecha Emisión + 30 días por defecto)
 */
function calcularFechaVencimiento(fechaEmision: string): string {
  try {
    const date = new Date(fechaEmision);
    date.setDate(date.getDate() + 30); // +30 días
    return date.toLocaleDateString('es-PE');
  } catch {
    const today = new Date();
    today.setDate(today.getDate() + 30);
    return today.toLocaleDateString('es-PE');
  }
}

/**
 * Genera los datos para la hoja "Datos ERP"
 * Cada item de cada factura genera una fila en el Excel
 */
function generateERPData(invoices: InvoiceData[]): any[] {
  const erpData: any[] = [];

  invoices.forEach((inv) => {
    // Si la factura no tiene items, crear un item placeholder
    const items = inv.items.length > 0
      ? inv.items
      : [{
          descripcion: 'Factura sin detalle',
          cantidad: 1,
          precioUnitario: inv.montoTotalFactura,
          montoTotal: inv.montoTotalFactura
        }];

    items.forEach((item) => {
      const acc = inv.accounting;
      const montoTotal = item.montoTotal;

      erpData.push({
        // Datos de identificación del documento
        'Tipo': '01', // Código numérico para Factura en ERP
        'Serie': extractSerie(inv),
        'Numero': extractNumero(inv.id),
        'Fecha': formatFecha(inv.fechaEmision),

        // Datos monetarios
        'Mnd': convertirCodigoMoneda(inv.moneda), // Código numérico de moneda
        'Base Gravada': calcularBaseGravada(montoTotal),
        'Base NO Gravada': 0, // Por defecto 0 (puede ser calculado si es necesario)
        'IGV': calcularIGV(montoTotal),
        'Monto Total': montoTotal,

        // Fechas adicionales
        'Tipo de Cambio': 1.00, // Default para PEN, ajustar para USD/EUR
        'Fecha Vencimiento': calcularFechaVencimiento(inv.fechaEmision),
        'Fecha Registro': formatFecha(inv.fechaEmision),

        // Datos del proveedor
        'RUC': inv.ruc,
        'Razon Social': inv.nombreEmpresa,

        // DATOS CONTABLES MAPEADOS (objetivo principal)
        'Cta Gasto': acc?.cuentaGasto || 'NO MAPEADO',
        'Glosa': item.descripcion, // Descripción del item
        'Centro Costo': acc?.centroCosto || 'NO MAPEADO',
        'Flujo Caja': acc?.codigoFlujoCaja || 'NO MAPEADO',

        // Datos adicionales
        'Tipo Gasto': determinarTipoGasto(item.descripcion),
        'Cta Total': determinarCuentaTotal(inv.moneda),
        'Agrupacion': '', // Vacío por defecto

        // Metadata (opcional, para debugging)
        '_Status Mapeo': acc?.mappingStatus || 'not_found',
        '_Errores': acc?.mappingErrors?.join('; ') || ''
      });
    });
  });

  return erpData;
}

/**
 * Genera los datos para la hoja "Resumen de Mapeo"
 * Muestra estadísticas de efectividad del mapeo
 */
function generateMappingSummary(invoices: InvoiceData[]): any[] {
  const total = invoices.length;
  const mapped = invoices.filter(i => i.accounting?.mappingStatus === 'mapped').length;
  const partial = invoices.filter(i => i.accounting?.mappingStatus === 'partial').length;
  const notFound = invoices.filter(i => i.accounting?.mappingStatus === 'not_found').length;

  const percentMapped = total > 0 ? ((mapped / total) * 100).toFixed(1) : '0.0';

  return [
    { 'Métrica': 'Total Facturas', 'Valor': total },
    { 'Métrica': 'Completamente Mapeadas', 'Valor': mapped },
    { 'Métrica': 'Parcialmente Mapeadas', 'Valor': partial },
    { 'Métrica': 'No Mapeadas', 'Valor': notFound },
    { 'Métrica': '% Efectividad', 'Valor': `${percentMapped}%` },
    { 'Métrica': '', 'Valor': '' },
    { 'Métrica': 'Items Totales Exportados', 'Valor': invoices.reduce((sum, inv) => sum + inv.items.length, 0) }
  ];
}

/**
 * Genera los datos para la hoja "No Mapeados"
 * Lista las facturas que no fueron mapeadas completamente
 */
function generateUnmappedData(invoices: InvoiceData[]): any[] {
  return invoices
    .filter(inv => inv.accounting?.mappingStatus !== 'mapped')
    .map(inv => ({
      'RUC': inv.ruc,
      'Empresa': inv.nombreEmpresa,
      'Status': inv.accounting?.mappingStatus || 'not_found',
      'Errores': inv.accounting?.mappingErrors?.join('; ') || '',
      'Total Factura': inv.montoTotalFactura,
      'Moneda': inv.moneda
    }));
}

/**
 * Función principal: Exporta facturas a Excel en formato ERP completo
 *
 * @param invoices - Array de facturas con datos contables mapeados
 */
export function exportToERPExcel(invoices: InvoiceData[]): void {
  if (invoices.length === 0) {
    alert('No hay facturas para exportar');
    return;
  }

  console.log(`📊 Exportando ${invoices.length} facturas a formato ERP...`);

  // Crear workbook
  const workbook = XLSX.utils.book_new();

  // HOJA 1: Datos ERP (principal)
  const erpData = generateERPData(invoices);
  const wsERP = XLSX.utils.json_to_sheet(erpData);

  // Ajustar anchos de columna para legibilidad
  wsERP['!cols'] = [
    { wch: 6 },   // Tipo
    { wch: 10 },  // Serie
    { wch: 10 },  // Numero
    { wch: 12 },  // Fecha
    { wch: 8 },   // Mnd
    { wch: 12 },  // Base Gravada
    { wch: 12 },  // Base NO Gravada
    { wch: 10 },  // IGV
    { wch: 12 },  // Monto Total
    { wch: 10 },  // Tipo de Cambio
    { wch: 15 },  // Fecha Vencimiento
    { wch: 15 },  // Fecha Registro
    { wch: 12 },  // RUC
    { wch: 35 },  // Razon Social
    { wch: 15 },  // Cta Gasto
    { wch: 40 },  // Glosa
    { wch: 15 },  // Centro Costo
    { wch: 15 },  // Flujo Caja
    { wch: 12 },  // Tipo Gasto
    { wch: 15 },  // Cta Total
    { wch: 12 },  // Agrupacion
  ];

  XLSX.utils.book_append_sheet(workbook, wsERP, 'Datos ERP');

  // HOJA 2: Resumen de Mapeo
  const summaryData = generateMappingSummary(invoices);
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [
    { wch: 30 },  // Métrica
    { wch: 15 }   // Valor
  ];
  XLSX.utils.book_append_sheet(workbook, wsSummary, 'Resumen de Mapeo');

  // HOJA 3: No Mapeados (solo si existen)
  const unmappedData = generateUnmappedData(invoices);
  if (unmappedData.length > 0) {
    const wsUnmapped = XLSX.utils.json_to_sheet(unmappedData);
    wsUnmapped['!cols'] = [
      { wch: 12 },  // RUC
      { wch: 35 },  // Empresa
      { wch: 12 },  // Status
      { wch: 50 },  // Errores
      { wch: 12 },  // Total Factura
      { wch: 8 }    // Moneda
    ];
    XLSX.utils.book_append_sheet(workbook, wsUnmapped, 'No Mapeados');
  }

  // Generar nombre de archivo con timestamp
  const fileName = `Facturas_ERP_Servex_${new Date().toISOString().split('T')[0]}.xlsx`;

  // Guardar archivo
  XLSX.writeFile(workbook, fileName);

  console.log(`✅ Archivo exportado exitosamente: ${fileName}`);
  console.log(`   - Filas en "Datos ERP": ${erpData.length}`);
  console.log(`   - Facturas no mapeadas: ${unmappedData.length}`);
}
