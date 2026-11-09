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

# Configuración de CORS para permitir peticiones desde Angular (localhost:4200)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir los routers (asegúrate de que en auth.py y tareas.py el APIRouter tenga sus prefix o rutas definidas)
app.include_router(auth.router)
app.include_router(tareas.router)

@app.get("/")
def root():
    return {"message": "Bienvenido al Back-end del Taller 2 - FastAPI funcionando correctamente"}