from sqlalchemy import Column, DateTime, Integer, Numeric, String, Text, ForeignKey, CheckConstraint, JSON, func
from sqlalchemy.orm import relationship
from database.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    uid = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String, nullable=False, unique=True)
    email = Column(String,  nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    configuracion = Column(JSON, nullable=False, default={"agitar_para_escanear": True})

    # Relaciones
    tareas = relationship("Tarea", back_populates="usuario", cascade="all, delete-orphan")
    eventos_host = relationship("Evento", back_populates="host", cascade="all, delete-orphan")
    asistencias = relationship("Asistencia", back_populates="usuario", cascade="all, delete-orphan")


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
    prioridad = Column(String, nullable=True, default='media')
    categoria = Column(String, nullable=True, default="general")

    __table_args__ = (
        CheckConstraint("inicio_minutos >= 0", name="check_inicio_minutos"),
        CheckConstraint("duracion_minutos >= 1", name="check_duracion_minutos"),
        CheckConstraint("(inicio_minutos + duracion_minutos) < 1440", name="check_limite_dia"),
        CheckConstraint("LOWER(estado) IN ('por hacer', 'en progreso', 'completada')", name="check_estado_valido"),
        CheckConstraint("LOWER(prioridad) IN ('baja', 'media', 'alta') OR prioridad IS NULL", name="check_prioridad_valida"),
        CheckConstraint("LOWER(categoria) IN ('general', 'trabajo', 'estudio') OR categoria IS NULL", name="check_categoria_valida"),
    )

    # Relación inversa con usuario
    usuario = relationship("Usuario", back_populates="tareas")

class Evento(Base):
    __tablename__ = "eventos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    usuario_host = Column(Integer, ForeignKey("usuarios.uid"), nullable=False)
    nombre = Column(String, nullable=False)
    descripcion = Column(Text, nullable=True)
    distancia_maxima_metros = Column(Numeric(10,1), nullable=False, default=200.0)
    ubicacion_url = Column(Text, nullable=False)
    latitud = Column(Numeric(10, 8), nullable=False)
    longitud = Column(Numeric(11, 8), nullable=False)
    fecha_inicio = Column(Text, nullable=False, server_default="now()::date::text")
    duracion_dias = Column(Integer, nullable=False, default=1)

    __table_args__ = (
        CheckConstraint("duracion_dias >= 1", name="check_duracion_dias"),
        CheckConstraint("distancia_maxima_metros >= 10.0", name="check_distancia_maxima"),
    )

    host = relationship("Usuario", back_populates="eventos_host")
    asistencias = relationship("Asistencia", back_populates="evento", cascade="all, delete-orphan")

class Asistencia(Base):
    __tablename__ = "asistencias"

    id_evento = Column(Integer, ForeignKey("eventos.id", ondelete="CASCADE"), primary_key=True)
    uid = Column(Integer, ForeignKey("usuarios.uid", ondelete="CASCADE"), primary_key=True)
    fecha_registro = Column(DateTime, server_default=func.now())

    evento = relationship("Evento", back_populates="asistencias")
    usuario = relationship("Usuario", back_populates="asistencias")