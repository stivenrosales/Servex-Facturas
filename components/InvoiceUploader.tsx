
import React, { useRef, useState } from 'react';

interface UploadedFile {
  base64: string;
  file: File;
}

interface Props {
  onUpload: (files: UploadedFile[]) => void;
  isLoading: boolean;
  processingCount?: { current: number; total: number };
}

const InvoiceUploader: React.FC<Props> = ({ onUpload, isLoading, processingCount }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files));
    }
  };

  const processFiles = async (files: File[]) => {
    const processedFiles: UploadedFile[] = [];
    
    for (const file of files) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve((reader.result as string).split(',')[1]);
        };
        reader.readAsDataURL(file);
      });
      processedFiles.push({ base64, file });
    }
    
    onUpload(processedFiles);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div 
      className={`relative border-2 border-dashed rounded-2xl p-8 transition-all ${
        dragActive ? 'border-[#00468b] bg-blue-50' : 'border-gray-200 bg-white'
      } ${isLoading ? 'opacity-70 cursor-wait' : 'hover:border-[#00468b] cursor-pointer'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => !isLoading && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,application/pdf,.pdf"
        multiple
        className="hidden"
      />
      
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-[#00468b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Subir Facturas</h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Puedes seleccionar <b>varias imágenes o PDFs</b> a la vez. Arrástralas aquí o haz clic.
          </p>
        </div>
        <button
          type="button"
          className="bg-[#00468b] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#003569] transition-all shadow-lg active:scale-95"
        >
          Seleccionar Archivos
        </button>
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-white/90 rounded-2xl flex flex-col items-center justify-center z-10">
          <div className="w-12 h-12 border-4 border-[#00468b] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[#00468b] font-bold text-lg">Analizando Documentos</p>
          {processingCount && (
            <p className="text-gray-500 text-sm mt-1">
              Procesando {processingCount.current} de {processingCount.total}...
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoiceUploader;
