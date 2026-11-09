# Taller 2 – Gestor de Tareas

Angular + Angular Material (frontend) · FastAPI + SQLAlchemy (backend) · PostgreSQL.

## Requisitos
- [Miniconda/Conda](https://docs.conda.io/)
- [Node.js](https://nodejs.org/) (LTS reciente) y npm
- [PostgreSQL](https://www.postgresql.org/download/)

## 1. Base de datos
Crear una base de datos vacía llamada `taller2_WM_db` (desde pgAdmin o con este comando). Las tablas las crea el backend al iniciar.

```bash
createdb -U postgres taller2_WM_db
```

## 2. Configuración de environment (`.env`)
El backend lee su configuración desde un archivo `.env` en la raíz del proyecto. **No se sube al repositorio** (está en `.gitignore`).

1. Copiar la plantilla:
   - Windows: `copy .env.example .env`
   - Linux/Mac: `cp .env.example .env`
2. Generar una clave secreta:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
3. Editar `.env`:
   ```
   DATABASE_URL=postgresql+psycopg2://postgres:TU_PASSWORD@localhost:5432/taller2_WM_db
   SECRET_KEY=<la clave generada>
   ```

> Para probar rápido sin PostgreSQL: `DATABASE_URL=sqlite:///./taller.db`

## 3. Backend
Desde la raíz del proyecto:

```bash
conda env create -f environment.yml
conda activate taller2WM-backend
uvicorn backend.main:app --reload
```

API: http://localhost:8000 · Documentación: http://localhost:8000/docs

## 4. Frontend
En otra terminal:

```bash
cd frontend
npm install
ng serve
```

Abrir http://localhost:4200, registrar un usuario e iniciar sesión.

## Problemas comunes
- **`Field required` para `database_url` / `secret_key`:** falta el archivo `.env` o está mal nombrado (en Windows verifica que no sea `.env.txt`).
- **El frontend no carga datos:** el backend debe estar corriendo en el puerto 8000.
