// Script para convertir Excel a TypeScript
// Ejecutar una sola vez: node scripts/convertExcelToTS.cjs

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Ruta al archivo Excel
const excelPath = path.join(__dirname, '..', 'modelo compras diciembre 2025.xlsx');

console.log('📋 Iniciando conversión de Excel a TypeScript...');
console.log(`📂 Leyendo archivo: ${excelPath}`);

// Verificar que el archivo existe
if (!fs.existsSync(excelPath)) {
  console.error(`❌ ERROR: No se encontró el archivo ${excelPath}`);
  console.error('Asegúrate de que el archivo "modelo compras diciembre 2025.xlsx" esté en la raíz del proyecto');
  process.exit(1);
}

// Leer el workbook
const workbook = XLSX.readFile(excelPath);
console.log('📊 Hojas disponibles:', workbook.SheetNames);

// Función helper para normalizar RUC
const normalizeRUC = (ruc) => {
  return String(ruc || '')
    .trim()
    .replace(/[\s-]/g, '')
    .toUpperCase();
};

// REGLA 1: Cuenta Contable (hoja "regla 1")
// Los datos comienzan en la fila 6 (range: 5)
// Estructura: [0]=vacío, [1]=RUC, [2]=Razón Social, [3]=Cuenta
console.log('\n🔍 Procesando REGLA 1 (Cuenta Contable)...');
const sheet1 = workbook.Sheets['regla 1'];
const data1 = XLSX.utils.sheet_to_json(sheet1, { range: 5, header: 1, defval: '' });
const regla1 = {};
let regla1Count = 0;

data1.forEach((row) => {
  const ruc = normalizeRUC(row[1]); // Columna 1
  const razonSocial = String(row[2] || '').trim(); // Columna 2
  const cuenta = String(row[3] || '').trim(); // Columna 3

  if (ruc && cuenta) {
    regla1[ruc] = {
      ruc,
      razonSocial,
      cuenta
    };
    regla1Count++;
  }
});

console.log(`✅ REGLA 1: ${regla1Count} registros procesados`);

// REGLA 2: Cuenta Gasto + Centro de Costo (hoja "regla 2")
// Los datos comienzan en la fila 6 (range: 5)
// Estructura: [0]=RUC, [1]=Razón, [2]=Cta Gasto, [3]=Nombre Cta, [4-5]=vacío, [6]=Centro, [7]=Desc Centro
console.log('\n🔍 Procesando REGLA 2 (Gasto + Centro Costo)...');
const sheet2 = workbook.Sheets['regla 2'];
const data2 = XLSX.utils.sheet_to_json(sheet2, { range: 5, header: 1, defval: '' });
const regla2 = {};
let regla2Count = 0;

data2.forEach((row) => {
  const ruc = normalizeRUC(row[0]); // Columna 0
  const razonSocial = String(row[1] || '').trim(); // Columna 1
  const cuentaGasto = String(row[2] || '').trim(); // Columna 2
  const nombreCuenta = String(row[3] || '').trim(); // Columna 3
  const centroCosto = String(row[6] || '').trim(); // Columna 6
  const descripcion = String(row[7] || '').trim(); // Columna 7

  if (ruc && cuentaGasto) {
    regla2[ruc] = {
      ruc,
      razonSocial,
      cuentaGasto,
      nombreCuenta,
      centroCosto,
      descripcion
    };
    regla2Count++;
  }
});

console.log(`✅ REGLA 2: ${regla2Count} registros procesados`);

// REGLA 3: Flujo de Caja (hoja "regla 3")
// Los datos comienzan en la fila 6 (range: 5)
// Estructura: [0]=RUC, [1]=Razón Social, [2]=Código Flujo
console.log('\n🔍 Procesando REGLA 3 (Flujo de Caja)...');
const sheet3 = workbook.Sheets['regla 3'];
const data3 = XLSX.utils.sheet_to_json(sheet3, { range: 5, header: 1, defval: '' });
const regla3 = {};
let regla3Count = 0;

data3.forEach((row) => {
  const ruc = normalizeRUC(row[0]); // Columna 0
  const razonSocial = String(row[1] || '').trim(); // Columna 1
  const codigoFlujo = String(row[2] || '').trim(); // Columna 2

  if (ruc && codigoFlujo) {
    regla3[ruc] = {
      ruc,
      razonSocial,
      codigoFlujo
    };
    regla3Count++;
  }
});

console.log(`✅ REGLA 3: ${regla3Count} registros procesados`);

// Generar archivo TypeScript
console.log('\n📝 Generando archivo TypeScript...');

const output = `// Auto-generado desde modelo compras diciembre 2025.xlsx
// Fecha de generación: ${new Date().toISOString()}
// Total de registros: REGLA 1: ${regla1Count} | REGLA 2: ${regla2Count} | REGLA 3: ${regla3Count}

import { AccountingRule1, AccountingRule2, AccountingRule3 } from '../types';

/**
 * REGLA 1: Mapeo RUC → Cuenta Contable
 * Hoja "regla 1" del Excel
 * ${regla1Count} registros
 */
export const REGLA_1_CUENTA_CONTABLE: Record<string, AccountingRule1> = ${JSON.stringify(regla1, null, 2)};

/**
 * REGLA 2: Mapeo RUC → Cuenta Gasto + Centro de Costo
 * Hoja "regla 2" del Excel
 * ${regla2Count} registros
 */
export const REGLA_2_GASTO_CENTRO: Record<string, AccountingRule2> = ${JSON.stringify(regla2, null, 2)};

/**
 * REGLA 3: Mapeo RUC → Código Flujo de Caja
 * Hoja "regla 3" del Excel
 * ${regla3Count} registros
 */
export const REGLA_3_FLUJO_CAJA: Record<string, AccountingRule3> = ${JSON.stringify(regla3, null, 2)};
`;

// Escribir archivo
const outputPath = path.join(__dirname, '..', 'data', 'accountingRules.ts');
fs.writeFileSync(outputPath, output, 'utf8');

console.log(`\n✅ Archivo generado exitosamente: ${outputPath}`);
console.log('\n📊 Resumen:');
console.log(`   - REGLA 1 (Cuenta Contable): ${regla1Count} registros`);
console.log(`   - REGLA 2 (Gasto + Centro): ${regla2Count} registros`);
console.log(`   - REGLA 3 (Flujo de Caja): ${regla3Count} registros`);
console.log(`   - Total: ${regla1Count + regla2Count + regla3Count} registros\n`);

// Validación básica
console.log('🔍 Validación rápida...');
let invalidRUCs = 0;
let validRUCs = 0;

Object.keys({ ...regla1, ...regla2, ...regla3 }).forEach(ruc => {
  if (!/^(\d{11}|[A-Z0-9]{5,15})$/.test(ruc)) {
    if (invalidRUCs < 5) { // Mostrar solo los primeros 5
      console.warn(`   ⚠ RUC con formato inusual: ${ruc}`);
    }
    invalidRUCs++;
  } else {
    validRUCs++;
  }
});

console.log(`   ✓ ${validRUCs} RUCs con formato válido`);
if (invalidRUCs > 0) {
  console.log(`   ⚠ ${invalidRUCs} RUCs con formato inusual (pueden ser válidos)`);
}

// Mostrar algunos ejemplos
console.log('\n📝 Ejemplos de registros generados:');
const ejemplosRUC = Object.keys(regla1).slice(0, 3);
ejemplosRUC.forEach(ruc => {
  console.log(`\n   RUC: ${ruc}`);
  if (regla1[ruc]) console.log(`   - Cuenta Contable: ${regla1[ruc].cuenta}`);
  if (regla2[ruc]) console.log(`   - Cuenta Gasto: ${regla2[ruc].cuentaGasto}, Centro: ${regla2[ruc].centroCosto}`);
  if (regla3[ruc]) console.log(`   - Flujo de Caja: ${regla3[ruc].codigoFlujo}`);
});

console.log('\n✅ Conversión completada exitosamente!');
console.log('👉 Siguiente paso: Crear el servicio accountingMapperService.ts\n');
