from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine, Base
from routers import auth, tareas
import os, uvicorn

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

if __name__ == "__main__":
    # Si Railway pasa un PORT diferente usará ese, si no, usa 8000 por defecto
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)