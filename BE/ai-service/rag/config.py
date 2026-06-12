import os
from pydantic_settings import BaseSettings
from pathlib import Path
from dotenv import load_dotenv

root_env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=root_env_path)

class Settings(BaseSettings):
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    
    # Construct Database URL
    pg_user: str = os.getenv("POSTGRES_USER", "admin")
    pg_pass: str = os.getenv("POSTGRES_PASSWORD", "12345")
    pg_host: str = os.getenv("POSTGRES_HOST", "localhost")
    pg_port: str = os.getenv("POSTGRES_PORT", "5432")
    pg_db: str = os.getenv("POSTGRES_DB", "hrtech_db")
    database_url: str = f"postgresql+psycopg2://{pg_user}:{pg_pass}@{pg_host}:{pg_port}/{pg_db}"
    
    java_backend_url: str = os.getenv("JAVA_BACKEND_URL", "")

    # Model configuration
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "")
    embedding_model: str = os.getenv("OLLAMA_EMBEDDING_MODEL", "")
    llm_model: str = os.getenv("GEMINI_MODEL", "")
    
    # Internal auth
    internal_api_key: str = os.getenv("INTERNAL_API_KEY", "")

settings = Settings()
