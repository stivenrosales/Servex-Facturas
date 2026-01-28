# 🧾 Invoice Reader AI - Servex Style

Una aplicación web moderna para procesar facturas automáticamente usando **Google Gemini AI**. Extrae información clave de imágenes de facturas y exporta los datos a Excel o CSV.

![React](https://img.shields.io/badge/React-19.2.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.2.0-purple?logo=vite)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-orange?logo=google)

## ✨ Características

- 📸 **Carga de imágenes**: Sube facturas en formato JPG, PNG o JPEG
- 🤖 **Extracción automática con IA**: Utiliza Google Gemini AI para extraer datos
- 📊 **Exportación múltiple**: Descarga los datos en formato Excel (.xlsx) o CSV
- 🎨 **Interfaz moderna**: Diseño limpio y profesional estilo Servex
- ⚡ **Procesamiento rápido**: Resultados en segundos
- 📱 **Responsive**: Funciona en desktop, tablet y móvil

## 🎯 Datos Extraídos

La aplicación extrae automáticamente:

- **RUC** (Registro Único de Contribuyentes)
- **Nombre de la empresa**
- **Dirección**
- **Fecha de emisión**
- **Moneda**
- **Monto total de la factura**
- **Items de la factura**:
  - Descripción
  - Cantidad
  - Precio unitario
  - Monto total por item

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+ instalado
- Una API key de Google Gemini ([obtener aquí](https://aistudio.google.com/app/apikey))

### Pasos

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/franz767/FacturasServex.git
   cd FacturasServex
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**:
   
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` y agrega tu API key de Gemini:
   ```env
   VITE_GEMINI_API_KEY=tu_api_key_aqui
   ```

4. **Inicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

5. **Abre tu navegador** en `http://localhost:3000`

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo

# Producción
npm run build        # Construye la aplicación para producción
npm run preview      # Previsualiza la build de producción
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19.2.3** - Biblioteca de UI
- **TypeScript 5.8.2** - Tipado estático
- **Vite 6.2.0** - Build tool y dev server

### IA y Procesamiento
- **@google/genai 1.34.0** - SDK de Google Gemini AI
- **xlsx 0.18.5** - Generación de archivos Excel

### Estilos
- **CSS Vanilla** - Estilos personalizados
- **Tailwind CSS** (CDN) - Utilidades CSS

## 📁 Estructura del Proyecto

```
procesamientoFacturas/
├── components/           # Componentes React
│   ├── Header.tsx       # Encabezado de la aplicación
│   ├── InvoiceCard.tsx  # Tarjeta para mostrar facturas
│   └── InvoiceUploader.tsx  # Componente de carga de imágenes
├── services/            # Servicios y lógica de negocio
│   └── geminiService.ts # Integración con Google Gemini AI
├── utils/               # Utilidades
│   ├── csvExport.ts     # Exportación a CSV
│   └── excelExport.ts   # Exportación a Excel
├── types.ts             # Definiciones de tipos TypeScript
├── App.tsx              # Componente principal
├── index.tsx            # Punto de entrada
├── vite.config.ts       # Configuración de Vite
└── .env.example         # Plantilla de variables de entorno
```

## 🔒 Seguridad

- ✅ Las API keys se almacenan en `.env.local` (no incluido en Git)
- ✅ El archivo `.env.local` está en `.gitignore`
- ✅ Solo se sube `.env.example` como plantilla
- ⚠️ **Nunca compartas tu API key públicamente**

## 🌐 Despliegue

### Vercel (Recomendado)

1. Haz push de tu código a GitHub
2. Importa el proyecto en [Vercel](https://vercel.com)
3. Agrega la variable de entorno `VITE_GEMINI_API_KEY` en la configuración
4. ¡Despliega!

### Netlify

1. Haz push de tu código a GitHub
2. Importa el proyecto en [Netlify](https://netlify.com)
3. Configura el build command: `npm run build`
4. Configura el publish directory: `dist`
5. Agrega la variable de entorno `VITE_GEMINI_API_KEY`
6. ¡Despliega!

## 📝 Uso

1. **Carga una imagen**: Haz clic en el área de carga o arrastra una imagen de factura
2. **Espera el procesamiento**: La IA extraerá automáticamente los datos
3. **Revisa los resultados**: Verifica la información extraída
4. **Exporta los datos**: Descarga en formato Excel o CSV

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👤 Autor

**Franz**
- GitHub: [@franz767](https://github.com/franz767)

## 🙏 Agradecimientos

- [Google Gemini AI](https://ai.google.dev/) por la API de procesamiento de imágenes
- [Vite](https://vitejs.dev/) por el excelente build tool
- [React](https://react.dev/) por la biblioteca de UI

---

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub!
