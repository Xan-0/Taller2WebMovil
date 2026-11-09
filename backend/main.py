from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database.database import engine, Base
from backend.routers import auth, tareas

# Crear las tablas en la base de datos si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API Gestor de Tareas - Taller 2",
    version="1.0.0"
)

# Agrega aquí la URL pública donde se despliegue tu Angular
origins = [
    "https://frontend-production-b9da.up.railway.app",
    "http://localhost:4200" # Para pruebas locales
]

# Configuración de CORS para permitir peticiones desde Angular (localhost:4200)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # En producción se recomienda restringir dominios
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir los routers
app.include_router(auth.router)
app.include_router(tareas.router)

@app.get("/")
def root():
    return {"message": "Bienvenido al Back-end del Taller 2 - FastAPI funcionando correctamente"}