Información sobre inicialización de la base de datos en *database/database.py*

# Pasos para hacer debug del back-end

## Parte para ejecutar

En anaconda prompt o similar, desde la carpeta de backend ejecutar:
```shell
(base) conda env create -f environment.yml
(base) conda activate taller2WM-backend
(taller2WM-backend) uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Deberías ver en la consola mensajes indicando que la aplicación arrancó exitosamente (Uvicorn running on [http://127.0.0.1:8000](http://127.0.0.1:8000)) y que SQLAlchemy creó las tablas en PostgreSQL.

<br>

****

## Pasos extra de Debug

### Comprobar el funcionamiento con Swagger UI (Documentación Interactiva)

FastAPI genera automáticamente una interfaz visual interactiva basada en OpenAPI (Swagger) ideal para hacer pruebas y debugging sin necesidad de escribir código en Angular todavía.

Abre tu navegador web y entra a:
👉 [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

Verás todos los endpoints agrupados por categorías (Autenticación y Tareas).

****

### Flujo recomendado de pruebas:

#### Registrar un usuario:
- Despliega el endpoint POST /auth/register.

- Haz clic en "Try it out", ingresa un nombre y contraseña en formato JSON (ej. `{"nombre": "testuser", "password": "1234"}`) y presiona Execute.

- Verificación: La respuesta debe retornar un código 201 Created junto con el objeto del usuario creado (uid y nombre).

#### Iniciar sesión:

- Ve al endpoint POST /auth/login e ingresa las mismas credenciales.

- Verificación: Retornará un código 200 OK junto con el **access_token (JWT)**. Copia este token, ya que lo necesitarás para probar las rutas protegidas.

#### Autorizar en Swagger:

- Haz clic en el botón verde "**Authorize**" situado en la parte superior derecha de la página de Swagger.

- Pega el token JWT. A partir de ese momento, todos los candados de los endpoints protegidos se considerarán abiertos.

#### Probar el CRUD de Tareas:

- Usa POST /tareas para crear una tarea, GET /tareas para listar las tareas del usuario autenticado, y PUT o DELETE usando el id de la tarea para verificar la modificación y eliminación.

<br>

****

**Register/Login de usuarios:**
```json
{
    nombre: "testuser"
    password_hash: "1234"
}
```
- access_token: ... (copiar el valor obtenido para acceder a endpoints de tareas)

**POST tarea:**
```json
{
  "titulo": "tarea_ej",
  "fecha": "2026-11-07",
  "inicio_minutos": 60,
  "duracion_minutos": 60,
  "estado": "por hacer"
}
```
**PUT tarea (id = 1):**
```json
{
  "descripcion": "descripcion...",
  "estado": "En progreso",
  "prioridad": "Media"
}
```

<br>

****

<br>

Para configurar una tarea de ejecución en VS Code (.vscode/launch.json) y hacer debug con breakpoints:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": [
        "backend.main:app",
        "--reload",
        "--port",
        "8000"
      ],
      "jinja": true
    }
  ]
}
```

Pon un punto rojo (breakpoint) en cualquiera de los archivos (por ejemplo, en backend/routers/tareas.py dentro de la función crear_tarea).

Inicia el debug desde tu editor y realiza una petición desde Swagger (/docs). El código se pausará en el punto exacto para que puedas revisar las variables en tiempo real.