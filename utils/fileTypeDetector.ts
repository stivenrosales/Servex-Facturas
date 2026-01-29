/**
 * Utilidad para detección y validación de tipos de archivos
 * Soporta imágenes (JPEG, PNG, WebP, GIF) y PDFs
 */

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const SUPPORTED_MIME_TYPES = {
  // Imágenes
  'image/jpeg': '.jpg,.jpeg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  // PDFs
  'application/pdf': '.pdf',
} as const;

export type SupportedMimeType = keyof typeof SUPPORTED_MIME_TYPES;

/**
 * Obtiene la extensión de un archivo
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1].toLowerCase()}` : '';
}

/**
 * Detecta el MIME type de un archivo
 * Usa file.type del navegador, con fallback a extensión
 */
export function getMimeType(file: File): string {
  // Intentar usar el tipo del navegador primero
  if (file.type && Object.keys(SUPPORTED_MIME_TYPES).includes(file.type)) {
    return file.type;
  }

  // Fallback: detectar por extensión
  const ext = getFileExtension(file.name);

  for (const [mimeType, extensions] of Object.entries(SUPPORTED_MIME_TYPES)) {
    if (extensions.split(',').includes(ext)) {
      return mimeType;
    }
  }

  // Si no se puede detectar, asumir JPEG (comportamiento anterior)
  console.warn(`No se pudo detectar MIME type para ${file.name}, asumiendo image/jpeg`);
  return 'image/jpeg';
}

/**
 * Verifica si el archivo es un tipo soportado
 */
export function isSupportedFileType(file: File): boolean {
  const mimeType = getMimeType(file);
  return Object.keys(SUPPORTED_MIME_TYPES).includes(mimeType);
}

/**
 * Verifica si el archivo es un PDF
 */
export function isPDF(file: File): boolean {
  return getMimeType(file) === 'application/pdf';
}

/**
 * Verifica si el archivo es una imagen
 */
export function isImage(file: File): boolean {
  const mimeType = getMimeType(file);
  return mimeType.startsWith('image/');
}

/**
 * Valida el tamaño del archivo
 */
export function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

/**
 * Formatea el tamaño del archivo para mostrar
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Valida un archivo completamente
 * Retorna objeto con validación y mensajes de error
 */
export function validateFile(file: File): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!isSupportedFileType(file)) {
    errors.push(`Tipo de archivo no soportado: ${file.name}`);
  }

  if (!validateFileSize(file)) {
    errors.push(`Archivo muy grande: ${file.name} (${formatFileSize(file.size)}). Máximo: ${formatFileSize(MAX_FILE_SIZE)}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
