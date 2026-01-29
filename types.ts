
export interface InvoiceItem {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  montoTotal: number;
}

export interface InvoiceData {
  id: string;
  ruc: string;
  nombreEmpresa: string;
  direccion: string;
  fechaEmision: string;
  moneda: string;
  items: InvoiceItem[];
  montoTotalFactura: number;
  imageUrl?: string;
  fileType?: 'image' | 'pdf'; // Tipo de archivo (imagen o PDF)
  fileName?: string; // Nombre original del archivo
  accounting?: AccountingData; // Datos contables mapeados
}

export interface ExtractionResult {
  success: boolean;
  data?: InvoiceData;
  error?: string;
}

// Interfaces para reglas contables
export interface AccountingRule1 {
  ruc: string;
  razonSocial: string;
  cuenta: string; // Formato: X.X.X.X.X
}

export interface AccountingRule2 {
  ruc: string;
  razonSocial: string;
  cuentaGasto: string;
  nombreCuenta: string;
  centroCosto: string;
  descripcion: string;
}

export interface AccountingRule3 {
  ruc: string;
  razonSocial: string;
  codigoFlujo: string;
}

// Datos contables mapeados
export interface AccountingData {
  // REGLA 1
  cuentaContable?: string;

  // REGLA 2
  cuentaGasto?: string;
  nombreCuentaGasto?: string;
  centroCosto?: string;
  descripcionCentroCosto?: string;

  // REGLA 3
  codigoFlujoCaja?: string;

  // Metadata
  mappingStatus: 'mapped' | 'partial' | 'not_found';
  mappingErrors?: string[];
}
