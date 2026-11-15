from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database.database import get_db
from models.models import Evento, Asistencia, Usuario
from schemas.schemas import EventoCreate, EventoResponse, AsistenciaCreate, AsistenciaResponse
from utils.security import get_current_user
from utils.distance import calcular_distancia_metros

router = APIRouter(prefix="/eventos", tags=["Eventos y Asistencia"])


@router.post("", response_model=EventoResponse, status_code=status.HTTP_201_CREATED)
def crear_evento(
    evento: EventoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Crea un evento asociado al usuario autenticado como host."""
    nuevo_evento = Evento(
        usuario_host=current_user.uid,
        **evento.model_dump()
    )
    db.add(nuevo_evento)
    db.commit()
    db.refresh(nuevo_evento)
    return nuevo_evento


@router.get("", response_model=List[EventoResponse])
def listar_eventos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Lista todos los eventos disponibles (el id es el número identificador para confirmar visita)."""
    return db.query(Evento).order_by(Evento.fecha_inicio.desc(), Evento.id.desc()).all()


@router.get("/mis-asistencias", response_model=List[int])
def mis_asistencias(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Ids de los eventos a los que el usuario ya confirmó su visita."""
    filas = db.query(Asistencia).filter(Asistencia.uid == current_user.uid).all()
    return [a.id_evento for a in filas]


@router.post("/asistencia", response_model=AsistenciaResponse, status_code=status.HTTP_201_CREATED)
def registrar_asistencia(
    asistencia: AsistenciaCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """
    Confirma la visita a un evento por su número identificador (ingresado a mano
    o leído desde un QR en la app móvil). Si el cliente envía coordenadas, se valida
    además la proximidad con Haversine.
    """
    evento = db.query(Evento).filter(Evento.id == asistencia.id_evento).first()
    if not evento:
        raise HTTPException(status_code=404, detail="El evento especificado no existe.")

    existente = db.query(Asistencia).filter(
        Asistencia.id_evento == asistencia.id_evento,
        Asistencia.uid == current_user.uid
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya te encuentras registrado en este evento.")

    # Validación de proximidad solo si el dispositivo entregó su ubicación
    if asistencia.latitud_actual is not None and asistencia.longitud_actual is not None:
        distancia = calcular_distancia_metros(
            float(evento.latitud), float(evento.longitud),
            asistencia.latitud_actual, asistencia.longitud_actual
        )
        radio_permitido = float(evento.distancia_maxima_metros)
        if distancia > radio_permitido:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Estás muy lejos del evento ({round(distancia, 1)} m). Acércate a menos de {radio_permitido} m para confirmar."
            )

    nueva_asistencia = Asistencia(
        id_evento=asistencia.id_evento,
        uid=current_user.uid
    )
    db.add(nueva_asistencia)
    db.commit()
    db.refresh(nueva_asistencia)
    return nueva_asistencia


@router.delete("/{evento_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_evento(
    evento_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Elimina un evento (solo su host)."""
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    if evento.usuario_host != current_user.uid:
        raise HTTPException(status_code=403, detail="Solo el creador del evento puede eliminarlo")
    db.delete(evento)
    db.commit()
    return None
