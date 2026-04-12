from pathlib import Path
from urllib.parse import quote_plus

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

REPO_ROOT = Path(__file__).resolve().parents[3]
ROOT_ENV_FILE = REPO_ROOT / ".env"

class Settings(BaseSettings):
    app_name: str = "AI Service"
    version: str = "1.0.0"
    port: int = Field(default=8086, alias="PORT")
    environment: str = Field(default="development", alias="ENVIRONMENT")
    log_level: str = Field(default="info", alias="LOG_LEVEL")
    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")
    gemini_model: str = Field(default="gemini-2.5-flash", alias="GEMINI_MODEL")
    db_host: str = Field(default="127.0.0.1", alias="MYSQL_HOST")
    db_port: int = Field(default=3306, alias="MYSQL_PORT")
    db_name: str = Field(default="planbook_ai", alias="MYSQL_DB")
    db_user: str = Field(default="root", alias="MYSQL_USER")
    db_password: str = Field(default="12345p", alias="MYSQL_PASSWORD")

    model_config = SettingsConfigDict(
        env_file=ROOT_ENV_FILE,
        env_file_encoding="utf-8",
        populate_by_name=True,
        extra="ignore"
    )

    @property
    def sqlalchemy_database_uri(self) -> str:
        encoded_password = quote_plus(self.db_password)
        return (
            f"mysql+pymysql://{self.db_user}:{encoded_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}?charset=utf8mb4"
        )

settings = Settings()