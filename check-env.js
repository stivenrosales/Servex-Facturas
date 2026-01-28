// Script para verificar variables de entorno
import { loadEnv } from 'vite';

const mode = process.env.NODE_ENV || 'development';
const env = loadEnv(mode, process.cwd(), '');

console.log('=== DIAGNÓSTICO DE VARIABLES DE ENTORNO ===');
console.log('Modo:', mode);
console.log('Directorio actual:', process.cwd());
console.log('\nVariables VITE_* encontradas:');
Object.keys(env)
    .filter(key => key.startsWith('VITE_'))
    .forEach(key => {
        console.log(`  ${key}: ${env[key] ? '✅ Configurada (longitud: ' + env[key].length + ')' : '❌ Vacía'}`);
    });

console.log('\nContenido de VITE_GEMINI_API_KEY:');
console.log(env.VITE_GEMINI_API_KEY || '❌ NO ENCONTRADA');
