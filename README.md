# Taller2WebMovil -> Talleres 2 y 3
Gestor de Tareas diarias y Eventos en AngularTS, Python FastAPI y PostgreSQL
<br><br>
Deploy web/móvil mediante Railway y Capacitor
<br><br>

# Ejecución:
- *Base de datos:* Utilizando el deploy web desde railway, o Instalando PostgreSQL localmente y creando la base de datos, por ejemplo: **taller2_WM_db**.

- *Back-end*: Utilizando el deploy web desde railway, o Estableciendo variables de entorno y ejecutando localmente FastAPI con Uvicorn en tu entorno virtual de Python (creado con el **environment.yml**).

- *Front-end:* Ejecutando `npm install` y `ng serve` de Angular en tu terminal.

<br>

> Más información en los READMEs del [backend](https://github.com/Xan-0/Taller2WebMovil/tree/main/backend) y del [frontend](https://github.com/Xan-0/Taller2WebMovil/tree/main/frontend)

<br><br>

# Aplicación móvil Android (Capacitor)

La app Angular se empaqueta como aplicación Android con **Capacitor** (`appId: cl.ucn.gestortareas`, nombre *Gestor de Tareas*). Se comunica con la misma API (FastAPI + PostgreSQL en Railway) del Taller 2.

## Funcionalidades móviles (integradas en el flujo de Eventos y Tareas)
| Capacidad | Plugin | Uso en la app |
|---|---|---|
| Cámara + QR | `@capacitor-mlkit/barcode-scanning` | Se escanea el QR de invitación `evento:<id>` y se confirma la asistencia en el backend. |
| Ubicación (GPS) | `@capacitor/geolocation` | Al confirmar la visita se envía la posición y el backend valida que estés a menos de la distancia máxima del evento. También rellena las coordenadas al crear un evento. |
| Acelerómetro | `@capacitor/motion` | Al completar una tarea hay que agitar el celular para lanzar el cohete. |
| Huella | `@capgo/capacitor-native-biometric` | Inicio de sesión con huella (credenciales en Android Keystore). |

**Permisos y errores:** cámara y ubicación se piden al usarlas. Si se rechazan, la app explica por qué se necesitan y ofrece abrir los **Ajustes**. Si el GPS está apagado, hay timeout, o no existe cámara/acelerómetro/huella, se muestra un aviso y una alternativa (ingresar el ID del evento a mano, botón «Lanzar cohete», correo y contraseña). En la APK la ubicación es obligatoria para confirmar asistencia.

## Requisitos
Node.js 24, JDK 21 y Android SDK (Android Studio). Para correr en un celular: depuración USB activada.

## Construir la APK (local)
```bash
cd frontend
npm ci
npm run android:preparar   # crea frontend/android (si no existe), agrega permisos y genera ícono/splash
npm run android:debug      # ng build + cap sync + gradlew assembleDebug
# APK: frontend/android/app/build/outputs/apk/debug/app-debug.apk
```
Pasos equivalentes manuales: `ng build` → `npx cap sync android` → `npx cap open android` → *Build > Build APK(s)*.
Para ejecutar directo en un dispositivo conectado: `npx cap run android`.

Ícono y splash salen de `frontend/resources/` (`icon.png`, `splash.png`); se reemplazan por otros y se vuelve a ejecutar `npm run android:preparar`.

## Instalar la APK
Copia `app-debug.apk` al celular (o `adb install app-debug.apk`), permite «instalar apps desconocidas» y ábrela.

## CI/CD (GitHub Actions)
`.github/workflows/android-debug.yml` se ejecuta en cada push a `main` (y manualmente): checkout → Node 24 y JDK 21 → `npm ci` → `ng build` → preparar Android → `cap sync` → `./gradlew assembleDebug` → sube **`gestor-tareas-debug-apk`** como artefacto.
Descarga: pestaña **Actions** → ejecución → sección **Artifacts**.

## Probar el flujo de eventos
1. Usuario A crea un evento (botón «Usar mi ubicación» para fijar coordenadas) y abre **Ver QR**.
2. Usuario B, en la APK, pulsa **Escanear QR**, acepta cámara y ubicación y se confirma la visita (el backend valida la distancia).
3. Más detalle de las funciones del dispositivo en [README-APK.md](README-APK.md).