from sqlalchemy import Column, Integer, String, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from backend.database.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    uid = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    """
    email = Column(String, unique=True, nullable=True)
    configuracion = Column(JSON, nullable=True, default={})
    """

    # Relación con tareas (un usuario tiene muchas tareas)
    tareas = relationship("Tarea", back_populates="usuario", cascade="all, delete-orphan")


class Tarea(Base):
    __tablename__ = "tareas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)  # Recomendado para el CRUD
    uid = Column(Integer, ForeignKey("usuarios.uid"), nullable=False)
    titulo = Column(Text, nullable=False)
    descripcion = Column(Text, nullable=True)
    fecha = Column(Text, nullable=False, server_default="now()::date::text")
    inicio_minutos = Column(Integer, nullable=False, default=0)
    duracion_minutos = Column(Integer, nullable=False, default=90)
    estado = Column(String, nullable=False, default="por hacer")
    prioridad = Column(String, nullable=True)
    #categoria = Column(String, nullable=True, default="general")

    __table_args__ = (
        CheckConstraint("inicio_minutos >= 0", name="check_inicio_minutos"),
        CheckConstraint("duracion_minutos >= 1", name="check_duracion_minutos"),
        CheckConstraint("(inicio_minutos + duracion_minutos) < 1440", name="check_limite_dia"),
        CheckConstraint("LOWER(estado) IN ('por hacer', 'en progreso', 'completada')", name="check_estado_valido"),
        CheckConstraint("LOWER(prioridad) IN ('baja', 'media', 'alta') OR prioridad IS NULL", name="check_prioridad_valida"),
    )

    # Relación inversa con usuario
    usuario = relationship("Usuario", back_populates="tareas")