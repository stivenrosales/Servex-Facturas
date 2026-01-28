
import { InvoiceData } from "../types";

export function exportToCSV(invoices: InvoiceData[]) {
  if (invoices.length === 0) return;

  // Flattening the structure: One row per item
  const headers = [
    "ID Factura",
    "RUC",
    "Empresa",
    "Direccion",
    "Fecha",
    "Moneda",
    "Total Factura",
    "Item Descripcion",
    "Cantidad",
    "Precio Unitario",
    "Item Total"
  ];

  const rows = invoices.flatMap((inv) =>
    inv.items.map((item) => [
      inv.id,
      inv.ruc,
      `"${inv.nombreEmpresa.replace(/"/g, '""')}"`,
      `"${inv.direccion?.replace(/"/g, '""') || ''}"`,
      inv.fechaEmision,
      inv.moneda,
      inv.montoTotalFactura,
      `"${item.descripcion.replace(/"/g, '""')}"`,
      item.cantidad,
      item.precioUnitario || 0,
      item.montoTotal
    ])
  );

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `facturas_exportadas_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
