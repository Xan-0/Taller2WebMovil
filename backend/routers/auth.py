from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.database import get_db
from models.models import Usuario
from schemas.schemas import UsuarioCreate, UsuarioResponse, UsuarioLogin, UsuarioUpdate
from utils.security import get_current_user, get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/register", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UsuarioCreate, db: Session = Depends(get_db)):
    """Registra un nuevo usuario validando email único y cifrando su contraseña."""
    existing_user = db.query(Usuario).filter((Usuario.email == user_data.email) | (Usuario.nombre == user_data.nombre)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico o el nombre de usuario ya se encuentran registrados."
        )
    
    hashed_password = get_password_hash(user_data.password)
    
    new_user = Usuario(
        nombre=user_data.nombre,
        email=user_data.email,
        password_hash=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(user_data: UsuarioLogin, db: Session = Depends(get_db)):
    """Valida las credenciales usando email y retorna un token JWT firmado con el uid inmutable."""
    user = db.query(Usuario).filter(Usuario.email == user_data.email).first()
    
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas (correo o contraseña inválidos)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generar token JWT usando el 'uid' como sujeto (inmutable ante cambios de nombre)
    access_token = create_access_token(data={"sub": str(user.uid)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": {
            "uid": user.uid,
            "nombre": user.nombre,
            "email": user.email
        }
    }

@router.put("/perfil", response_model=UsuarioResponse)
def actualizar_perfil(
    user_data: UsuarioUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Actualiza el perfil del usuario autenticado (nombre, email, contraseña o configuración)."""
    
    if user_data.nombre is not None:
        nuevo_nombre = user_data.nombre.strip()
        if nuevo_nombre and nuevo_nombre != current_user.nombre:
            existing = db.query(Usuario).filter(Usuario.nombre == nuevo_nombre).first()
            if existing:
                raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso.")
            current_user.nombre = nuevo_nombre

    if user_data.email is not None:
        nuevo_email = user_data.email.strip()
        if nuevo_email and nuevo_email != current_user.email:
            existing = db.query(Usuario).filter(Usuario.email == nuevo_email).first()
            if existing:
                raise HTTPException(status_code=400, detail="El correo electrónico ya está en uso.")
            current_user.email = nuevo_email

    if user_data.password:
        current_user.password_hash = get_password_hash(user_data.password)

    if user_data.configuracion is not None:
        current_user.configuracion = user_data.configuracion

    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/perfil", response_model=UsuarioResponse)
def obtener_perfil(current_user: Usuario = Depends(get_current_user)):
    """Retorna los datos del usuario actual basados en el uid del token."""
    return current_user