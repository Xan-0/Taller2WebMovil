from pydantic import BaseModel, Field
from typing import Optional

# --- Esquemas de Usuario ---
class UsuarioCreate(BaseModel):
    """
    Sirve para HTTP PUT
    """
    nombre: str
    password: str  # Contraseña en texto plano que el backend cifrará
    # email: Optional[str] = None

class UsuarioResponse(BaseModel):
    """
    Sirve para HTTP GET
    """
    uid: int
    nombre: str
    # email: Optional[str] = None

    class Config:
        from_attributes = True

class UsuarioLogin(BaseModel):
    """
    Esquema para recibir los datos de inicio de sesión de forma limpia desde Angular:
    """
    nombre: str
    password: str

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    password: Optional[str] = None


# --- Esquemas de Tarea (CRUD) (delete no requiere una clase) ---
class TareaCreate(BaseModel):
    """
    Sirve para HTTP POST
    """
    titulo: str
    descripcion: Optional[str] = None
    fecha: str
    inicio_minutos: int = Field(ge=0, lt=1440)
    duracion_minutos: int = Field(ge=1)
    estado: str = "por hacer"
    prioridad: Optional[str] = None
    #categoria: Optional[str] = "general"

class TareaUpdate(BaseModel):
    """
    Sirve para HTTP PUT
    """
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    fecha: Optional[str] = None
    inicio_minutos: Optional[int] = Field(default=None, ge=0, lt=1440)
    duracion_minutos: Optional[int] = Field(default=None, ge=1)
    estado: Optional[str] = None
    prioridad: Optional[str] = None
    #categoria: Optional[str] = "general"

class TareaResponse(BaseModel):
    """
    Sirve para HTTP GET
    """
    id: int
    uid: int
    titulo: str
    descripcion: Optional[str] = None
    fecha: str
    inicio_minutos: int
    duracion_minutos: int
    estado: str
    prioridad: Optional[str] = None
    #categoria: Optional[str] = "general"

    class Config:
        from_attributes = True