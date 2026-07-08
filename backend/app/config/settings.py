from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Union
import json

class Settings(BaseSettings):
    APP_NAME: str = 'Rate Limiting Learning Project'
    APP_VERSION: str = '1.0.0'
    DEBUG: bool = False
    DATABASE_URL: str
    SYNC_DATABASE_URL: str
    REDIS_URL: str = 'redis://localhost:6379'
    SECRET_KEY: str
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DEFAULT_RATE_LIMIT_REQUESTS: int = 100
    DEFAULT_RATE_LIMIT_WINDOW_SECONDS: int = 60
    ALLOWED_ORIGINS: List[str] = ['http://localhost:5173', 'http://localhost:3000']

    @field_validator('ALLOWED_ORIGINS', mode='before')
    @classmethod
    def parse_allowed_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            try:
                decoded = json.loads(v)
                if isinstance(decoded, list):
                    return [str(item) for item in decoded]
            except json.JSONDecodeError:
                pass
            return [x.strip() for x in v.split(',') if x.strip()]
        return v
        
    COOLDOWN_SECONDS: int = 30
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', case_sensitive=False, extra='ignore')
settings = Settings()