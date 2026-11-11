from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.database import get_db
from models.models import Evento, Asistencia, Usuario
from schemas.schemas import EventoCreate, EventoResponse, AsistenciaCreate, AsistenciaResponse
from utils.security import get_current_user
from utils.distance import calcular_distancia_metros

router = APIRouter(prefix="/eventos", tags=["Eventos y Geocalización"])

@router.post("", response_model=EventoResponse, status_code=status.HTTP_201_CREATED)
def crear_evento(
    evento: EventoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Crea un nuevo evento geolocalizado asociado al usuario autenticado como host."""
    nuevo_evento = Evento(
        usuario_host=current_user.uid,
        **evento.dict()
    )
    db.add(nuevo_evento)
    db.commit()
    db.refresh(nuevo_evento)
    return nuevo_evento

@router.get("", response_model=List[EventoResponse])
def listar_eventos(db: Session = Depends(get_db)):
    """Lista todos los eventos disponibles para los usuarios."""
    return db.query(Evento).all()

@router.post("/asistencia", response_model=AsistenciaResponse, status_code=status.HTTP_201_CREATED)
def registrar_asistencia(
    asistencia: AsistenciaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Valida la proximidad mediante GPS (Haversine) y registra la asistencia 
    al escanear el QR del evento.
    """
    evento = db.query(Evento).filter(Evento.id == asistencia.id_evento).first()
    if not evento:
        raise HTTPException(status_code=404, detail="El evento especificado no existe.")

    # Validar si ya está registrado
    existente = db.query(Asistencia).filter(
        Asistencia.id_evento == asistencia.id_evento,
        Asistencia.uid == current_user.uid
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya te encuentras registrado en este evento.")

    # Calcular distancia real en metros entre el usuario y el evento
    distancia = calcular_distancia_metros(
        float(evento.latitud), float(evento.longitud),
        asistencia.latitud_actual, asistencia.longitud_actual
    )

    # Usar el radio dinámico configurado en el evento
    radio_permitido = float(evento.distancia_maxima_metros)
    
    if distancia > radio_permitido:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Estás muy lejos del evento ({round(distancia, 1)} metros). Acércate a menos de {radio_permitido}m para hacer check-in."
        )

    # Registrar asistencia si cumple la validación de proximidad
    nueva_asistencia = Asistencia(
        id_evento=asistencia.id_evento,
        uid=current_user.uid
    )
    db.add(nueva_asistencia)
    db.commit()
    db.refresh(nueva_asistencia)
    return nueva_asistencia