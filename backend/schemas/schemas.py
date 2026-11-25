from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime

# --- Esquemas de Usuario ---
class UsuarioCreate(BaseModel):
    nombre: str
    email: EmailStr
    password: str  # Contraseña en texto plano que el backend cifrará

class UsuarioResponse(BaseModel):
    uid: int
    nombre: str
    email: str
    configuracion: Dict[str, Any] = {}

    class Config:
        from_attributes = True

class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    configuracion: Optional[Dict[str, Any]] = None


# --- Esquemas de Tarea (CRUD) ---
class TareaCreate(BaseModel):
    id_evento: Optional[int]
    titulo: str
    descripcion: Optional[str] = None
    fecha: str
    inicio_minutos: int = Field(ge=0, lt=1440)
    duracion_minutos: int = Field(ge=1)
    estado: str = "por hacer"
    prioridad: Optional[str] = "media"
    categoria: Optional[str] = "general"

class TareaUpdate(BaseModel):
    id_evento: Optional[int] = None
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    fecha: Optional[str] = None
    inicio_minutos: Optional[int] = Field(default=None, ge=0, lt=1440)
    duracion_minutos: Optional[int] = Field(default=None, ge=1)
    estado: Optional[str] = None
    prioridad: Optional[str] = None
    categoria: Optional[str] = None

class TareaResponse(BaseModel):
    id: int
    uid: int
    id_evento: Optional[int] = None
    titulo: str
    descripcion: Optional[str] = None
    fecha: str
    inicio_minutos: int
    duracion_minutos: int
    estado: str
    prioridad: Optional[str] = None
    categoria: Optional[str] = None

    class Config:
        from_attributes = True


# --- Esquemas de Eventos y Asistencias ---
class EventoCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    distancia_maxima_metros: float = Field(ge=10, default=200.0)
    ubicacion_url: str
    latitud: float = Field(ge=-90, le=90)
    longitud: float = Field(ge=-180, le=180)
    fecha_inicio: str
    duracion_dias: int = Field(ge=1, default=1)

class EventoResponse(BaseModel):
    id: int
    usuario_host: int
    nombre: str
    descripcion: Optional[str] = None
    distancia_maxima_metros: float
    ubicacion_url: str
    latitud: float
    longitud: float
    fecha_inicio: str
    duracion_dias: int

    class Config:
        from_attributes = True

class AsistenciaCreate(BaseModel):
    id_evento: int
    # Coordenadas opcionales: si el dispositivo las entrega se valida la proximidad
    latitud_actual: Optional[float] = Field(default=None, ge=-90, le=90)
    longitud_actual: Optional[float] = Field(default=None, ge=-180, le=180)

class AsistenciaResponse(BaseModel):
    id_evento: int
    uid: int
    fecha_registro: Optional[datetime] = None

    class Config:
        from_attributes = True
