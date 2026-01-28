// Script de diagnóstico - Ejecutar en la consola del navegador
console.log('=== DIAGNÓSTICO DE CONFIGURACIÓN ===');
console.log('API_KEY definida:', typeof process !== 'undefined' && process.env ? !!process.env.API_KEY : 'process.env no disponible');
console.log('GEMINI_API_KEY definida:', typeof process !== 'undefined' && process.env ? !!process.env.GEMINI_API_KEY : 'process.env no disponible');
console.log('Root element:', document.getElementById('root'));
console.log('React cargado:', typeof React !== 'undefined');
console.log('ReactDOM cargado:', typeof ReactDOM !== 'undefined');
