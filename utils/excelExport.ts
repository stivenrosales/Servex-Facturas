
import * as XLSX from 'xlsx';
import { InvoiceData } from "../types";

export function exportToExcel(invoices: InvoiceData[]) {
  if (invoices.length === 0) return;

  // Transformamos los datos jerárquicos en una estructura plana para Excel
  const dataToExport = invoices.flatMap((inv) =>
    inv.items.map((item) => ({
      "ID Sistema": inv.id,
      "RUC": inv.ruc,
      "Empresa": inv.nombreEmpresa,
      "Dirección": inv.direccion || 'No especificada',
      "Fecha Emisión": inv.fechaEmision || 'No detectada',
      "Moneda": inv.moneda,
      "Total Factura": inv.montoTotalFactura,
      "Descripción Item": item.descripcion,
      "Cantidad": item.cantidad,
      "Precio Unitario": item.precioUnitario || 0,
      "Monto Item": item.montoTotal
    }))
  );

  // Crear libro y hoja de trabajo
  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Facturas Procesadas");

  // Ajustar anchos de columna automáticamente (opcional pero mejora estética)
  const maxWidths = [
    { wch: 15 }, // ID
    { wch: 12 }, // RUC
    { wch: 30 }, // Empresa
    { wch: 40 }, // Dirección
    { wch: 15 }, // Fecha
    { wch: 8 },  // Moneda
    { wch: 12 }, // Total
    { wch: 40 }, // Descripción
    { wch: 10 }, // Cantidad
    { wch: 15 }, // Precio Unit
    { wch: 12 }  // Monto Item
  ];
  worksheet['!cols'] = maxWidths;

  // Generar archivo y descargar
  const fileName = `Facturas_Servex_AI_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
