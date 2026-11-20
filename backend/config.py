from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    # formatos
    \n
    DATABASE_URL: "postgresql+psycopg2://usuario:clave@localhost:puerto/database" o "postgresql+psycopg2://usuario:clave@servidor:puerto/database"
    \n
    SECRET_KEY: clave privada hexadecimal para el decodificador JWT
    \n
    ALGORITHM: (HS, RS, ES) x (256, 384, 512), por ejemplo; ES256 o HS512
    \n
    ACCESS_TOKEN_EXPIRE_MINUTES: número positivo en minutos de duración de la sesión
    \n
    """
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Configuración para indicarle dónde buscar el archivo .env
    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")

# Instancia global de configuración
settings = Settings()