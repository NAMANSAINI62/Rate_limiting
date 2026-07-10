from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RateLimitConfigUpdate(BaseModel):
    requests_allowed: Optional[int] = None
    window_seconds: Optional[int] = None
    enabled: Optional[bool] = None

class RateLimitConfigResponse(BaseModel):
    id: int
    requests_allowed: int
    window_seconds: int
    enabled: bool

    class Config:
        from_attributes = True

class RequestLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    endpoint: str
    method: str
    ip_address: str
    was_blocked: bool
    timestamp: datetime

    class Config:
        from_attributes = True
