from fastapi import Request, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from typing import Optional, Tuple
import time
import redis.asyncio as redis

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.base import get_db
from app.models import RateLimitConfig, RequestLog
from app.config.settings import settings

optional_jwt_bearer = HTTPBearer(auto_error=False)

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

async def get_client_identifier(request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_jwt_bearer)) -> Tuple[str, str, Optional[int]]:
    
    client_ip = request.client.host if request.client else "127.0.0.1"

    if credentials:
        try:
            token = credentials.credentials
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id_str = payload.get("sub")
            if user_id_str:
                return (f"user:{user_id_str}", client_ip, int(user_id_str))
        except JWTError:
            pass
    return (f"ip:{client_ip}", client_ip, None)


async def get_rate_limit_config(db: AsyncSession = Depends(get_db)) -> RateLimitConfig:
    result = await db.execute(select(RateLimitConfig).limit(1))
    config = result.scalars().first()
    if not config:
        return RateLimitConfig(requests_allowed=100, window_seconds=60)
    return config


async def check_rate_limit(
    request: Request,
    client_info: Tuple[str, str, Optional[int]] = Depends(get_client_identifier),
    config: RateLimitConfig = Depends(get_rate_limit_config),
    db: AsyncSession = Depends(get_db)
):
    client_id, client_ip, user_id = client_info
    
    now = time.time()
    window_start = now - config.window_seconds
    redis_key = f"rate_limit:{client_id}"
    await redis_client.zremrangebyscore(redis_key, 0, window_start)
    request_count = await redis_client.zcard(redis_key)
    was_blocked = request_count >= config.requests_allowed
    log = RequestLog(
        user_id=user_id,
        ip_address=client_ip,
        endpoint=request.url.path,
        method=request.method,
        was_blocked=was_blocked
    )
    db.add(log)
    await db.commit()
    if was_blocked:
        raise HTTPException(status_code=429, detail="Too Many Requests")
    await redis_client.zadd(redis_key, {str(now): now})
    await redis_client.expire(redis_key, config.window_seconds)
