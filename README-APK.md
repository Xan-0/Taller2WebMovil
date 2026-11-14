# Cambios y preparación para la APK

## Qué cambió

**Tareas (dashboard)**
- Al crear/editar una tarea se elige **hora de inicio** (selector de hora) y **duración** en minutos. Se valida que termine antes de las 24:00.
- Se agregó **categoría** (general / trabajo / estudio) al formulario.
- Lista desplegable **"Ordenar por"**: Orden de llegada (por defecto), Fecha, Estado, Prioridad y Categoría.

**Eventos (`/eventos`)**
- Cualquier usuario puede crear eventos. Cada evento tiene un **número identificador** (su `id`).
- **Web y APK:** confirmar la visita ingresando el número identificador.
- **Solo APK:** además aparece el botón **Escanear QR**. El host ve el QR de sus eventos con "Ver QR" (contiene `evento:<id>`).
- Si el dispositivo entrega ubicación, el backend valida que esté dentro del radio del evento; si no la entrega, solo se usa el identificador.

**Arreglos necesarios que se detectaron**
- El login/registro del frontend enviaba `nombre`, pero el backend usa **email**. Ahora el login pide correo + contraseña y el registro pide nombre + correo + contraseña.
- `main.py` no incluía el router de eventos; ahora sí.
- CORS ahora acepta los orígenes del WebView de Capacitor (`https://localhost`, `capacitor://localhost`).
- `resource()` del dashboard ahora se recarga con `params` (antes la señal no se rastreaba).
- Nota: en `backend/schemas/schema.sql` falta una coma después de `CHECK (distancia_maxima_metros >= 10)`. No afecta a la app (las tablas las crea SQLAlchemy), pero conviene corregirlo.

## Archivos incluidos en este paquete
Copia cada archivo sobre el mismo path de tu proyecto.

- backend: `main.py`, `routers/eventos.py` (nuevo), `schemas/schemas.py`
- frontend: `app.routes.ts`, `pages/dashboard/*`, `pages/login/login.ts|html`, `pages/eventos/*` (nuevo), `services/auth.service.ts`, `services/tareas.service.ts`, `services/eventos.service.ts` (nuevo), `capacitor.config.ts` (nuevo)

Las tablas `eventos` y `asistencias` se crean solas al reiniciar el backend en Railway.

## Dependencias nuevas (desde `frontend/`)

```bash
npm install @capacitor/core @capacitor/android @capacitor-mlkit/barcode-scanning qrcode
npm install -D @capacitor/cli @types/qrcode
```

Los paquetes `@capacitor/*` y `@capacitor-mlkit/*` deben tener la **misma versión mayor**. Si npm avisa de un conflicto, instala `@capacitor-mlkit/barcode-scanning` en la versión mayor que coincida con tu `@capacitor/core`.

## Generar la APK

```bash
cd frontend
npx cap add android          # solo la primera vez
ng build                     # build de producción -> dist/frontend/browser
npx cap sync android
npx cap open android         # Android Studio: Build > Build APK(s)
```

Dentro de `frontend/android/app/src/main/AndroidManifest.xml` agrega (si no están) los permisos:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

El backend de Railway ya usa HTTPS, así que no hace falta habilitar tráfico en texto plano.

## Probar el flujo de eventos
1. Inicia sesión con el usuario A y crea un evento (anota su ID, ej. 1).
2. Con el usuario B, en la web escribe el ID y pulsa **Confirmar visita**.
3. En la APK, con el usuario A abre "Ver QR" del evento; con el usuario B pulsa **Escanear QR**.
