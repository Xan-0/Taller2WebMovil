import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cl.ucn.gestortareas',
  appName: 'Gestor de Tareas',
  // Carpeta de salida del build de producción de Angular (builder @angular/build:application)
  webDir: 'dist/frontend/browser',
  server: {
    // El WebView sirve la app desde https://localhost (ya permitido en el CORS del backend)
    androidScheme: 'https',
  },
};

export default config;
