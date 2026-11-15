from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine, Base
from routers import auth, tareas, eventos
import os, uvicorn

# Crear las tablas en la base de datos si no existen
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API Gestor de Tareas - Taller 2",
    version="1.1.0"
)

origins = [
    "https://frontend-production-b9da.up.railway.app",
    "http://localhost:4200",      # Pruebas locales (ng serve)
    # Origenes del WebView de Capacitor en Android / iOS
    "https://localhost",          # androidScheme: 'https' (configurado en capacitor.config.ts)
    "http://localhost",
    "capacitor://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tareas.router)
app.include_router(eventos.router)

@app.get("/")
def root():
    return {"message": "Bienvenido al Back-end del Taller 2 - FastAPI funcionando correctamente"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
