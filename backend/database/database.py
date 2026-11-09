import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Parámetros de configuración por defecto
DB_NAME = 'taller2_WM_db'
DB_USER = 'postgres'
DB_PASS = 'postgres'
DB_PORT = '5432'

"""
URL de conexión a PostgreSQL (si no existe DATABASE_URL se usa el texto formateado)
- puede configurarse mediante variables de entorno del sistema operativo actual
- cambiar DB_USER y DB_PASS por usuario y contraseña del servidor postgresql si es diferente
- cambiar puerto 5432 si el tuyo es diferente
- la base de datos 'taller2_WM_db' debe estar creado previamente en postgresql
(no es necesario que las tablas estén creadas)
"""
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@localhost:{DB_PORT}/{DB_NAME}"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependencia para obtener la sesión de base de datos en cada request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()