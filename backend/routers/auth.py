from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.models.models import Usuario
from backend.schemas.schemas import UsuarioCreate, UsuarioResponse, UsuarioLogin, UsuarioUpdate
from backend.utils.security import get_current_user, get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/register", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UsuarioCreate, db: Session = Depends(get_db)):
    """Registra un nuevo usuario cifrando su contraseña."""
    existing_user = db.query(Usuario).filter(Usuario.nombre == user_data.nombre).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya se encuentra registrado."
        )
    
    hashed_password = get_password_hash(user_data.password)
    
    new_user = Usuario(
        nombre=user_data.nombre,
        password_hash=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(user_data: UsuarioLogin, db: Session = Depends(get_db)):
    """Valida las credenciales del usuario y retorna un token JWT."""
    user = db.query(Usuario).filter(Usuario.nombre == user_data.nombre).first()
    
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas (usuario o contraseña inválidos)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generar token JWT incluyendo el nombre y el uid
    access_token = create_access_token(data={"sub": user.nombre, "uid": user.uid})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": {
            "uid": user.uid,
            "nombre": user.nombre
        }
    }

@router.put("/perfil", response_model=UsuarioResponse)
def actualizar_perfil(
    user_data: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Actualiza el perfil del usuario autenticado (nombre y/o contraseña)."""
    
    # Si desea cambiar el nombre, verificamos que no pertenezca a otro usuario
    if user_data.nombre and user_data.nombre != current_user.nombre:
        existing_user = db.query(Usuario).filter(Usuario.nombre == user_data.nombre).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre de usuario ya se encuentra en uso."
            )
        current_user.nombre = user_data.nombre

    # Si desea cambiar la contraseña, la encriptamos de forma segura
    if user_data.password:
        current_user.password_hash = get_password_hash(user_data.password)

    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/perfil", response_model=UsuarioResponse)
def obtener_perfil(
    current_user: Usuario = Depends(get_current_user)
):
    """Retorna los datos del usuario autenticado actual basándose en su token JWT."""
    return current_user