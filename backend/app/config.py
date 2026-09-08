from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o"
    LLM_MODEL_MINI: str = "gpt-4o-mini"
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    SIMILARITY_THRESHOLD: float = 0.72
    CHUNK_SIZE: int = 3000
    CHUNK_OVERLAP: int = 200
    DATABASE_PATH: str = str(PROJECT_ROOT / "data" / "facts.db")
    CHROMA_PATH: str = str(PROJECT_ROOT / "data" / "chroma")
    UPLOAD_DIR: str = str(PROJECT_ROOT / "data" / "uploads")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
