from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Configuración de SQLite local
SQLALCHEMY_DATABASE_URL = "sqlite:///./taller.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# <--- ¡Asegúrate de que esta función esté aquí! --->
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()