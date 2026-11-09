import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.config import settings

"""
URL de conexión a PostgreSQL
- puede configurarse mediante variables de entorno en tu archivo .env
- la base de datos debe estar creado previamente en postgresql
(no es necesario que las tablas estén creadas)
"""
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependencia para obtener la sesión de base de datos en cada request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()