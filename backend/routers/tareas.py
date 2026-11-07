from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database.database import get_db
from backend.models.models import Tarea, Usuario
from backend.schemas.schemas import TareaCreate, TareaUpdate, TareaResponse
from backend.utils.security import get_current_user

router = APIRouter(prefix="/tareas", tags=["Tareas"])

@router.post("/", response_model=TareaResponse, status_code=status.HTTP_201_CREATED)
def crear_tarea(
    tarea: TareaCreate, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    """Crea una nueva tarea para el usuario autenticado."""
    nueva_tarea = Tarea(
        uid=current_user.uid,
        **tarea.dict()
    )
    db.add(nueva_tarea)
    db.commit()
    db.refresh(nueva_tarea)
    return nueva_tarea

@router.get("/", response_model=List[TareaResponse])
def listar_tareas(
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    """Lista todas las tareas del usuario autenticado."""
    tareas = (
        db.query(Tarea)
        .order_by(Tarea.fecha.asc(), Tarea.inicio_minutos.asc())
        .filter(Tarea.uid == current_user.uid)
        .all()
        )
    return tareas

@router.put("/{tarea_id}", response_model=TareaResponse)
def actualizar_tarea(
    tarea_id: int, 
    tarea_update: TareaUpdate, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    """Actualiza una tarea existente del usuario autenticado."""
    tarea = db.query(Tarea).filter(Tarea.id == tarea_id, Tarea.uid == current_user.uid).first()
    if not tarea:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarea no encontrada")
    
    update_data = tarea_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(tarea, key, value)
        
    db.commit()
    db.refresh(tarea)
    return tarea

@router.delete("/{tarea_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_tarea(
    tarea_id: int, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    """Elimina una tarea del usuario autenticado."""
    tarea = db.query(Tarea).filter(Tarea.id == tarea_id, Tarea.uid == current_user.uid).first()
    if not tarea:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarea no encontrada")
    
    db.delete(tarea)
    db.commit()
    return None