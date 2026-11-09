from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Configuración para indicarle dónde buscar el archivo .env
    model_config = SettingsConfigDict(env_file="backend/.env", extra="ignore")

# Instancia global de configuración
settings = Settings()