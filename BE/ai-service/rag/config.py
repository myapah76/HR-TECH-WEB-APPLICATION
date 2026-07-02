import os
from pydantic_settings import BaseSettings
from pathlib import Path
from dotenv import load_dotenv

# Load single global .env file located at the project root
root_env_path = Path(__file__).resolve().parent.parent.parent.parent / '.env'
load_dotenv(dotenv_path=root_env_path, override=True)

class Settings(BaseSettings):
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    java_backend_url: str = os.getenv("JAVA_BACKEND_URL", "")
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "")
    embedding_model: str = os.getenv("OLLAMA_EMBEDDING_MODEL", "")
    llm_model: str = os.getenv("GEMINI_MODEL", "")
    internal_api_key: str = os.getenv("INTERNAL_API_KEY", "")

    @property
    def database_url(self) -> str:
        pg_user = os.getenv("POSTGRES_USER", "")
        pg_pass = os.getenv("POSTGRES_PASSWORD", "")
        pg_host = os.getenv("POSTGRES_HOST", "")
        pg_port = os.getenv("POSTGRES_PORT", "")
        pg_db = os.getenv("POSTGRES_DB", "")
        return f"postgresql+psycopg2://{pg_user}:{pg_pass}@{pg_host}:{pg_port}/{pg_db}"

settings = Settings()
