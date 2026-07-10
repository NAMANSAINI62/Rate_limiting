from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.core.dependencies import require_role
from app.models import RateLimitConfig, RequestLog
from app.schemas.admin import RateLimitConfigUpdate, RateLimitConfigResponse, RequestLogResponse

# Security Lock: Every endpoint in this router requires 'admin' role
router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
    dependencies=[Depends(require_role(['admin']))]
)

@router.get('/logs', response_model=List[RequestLogResponse])
async def get_request_logs(limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(RequestLog).order_by(RequestLog.timestamp.desc()).limit(limit)
    )
    return result.scalars().all()

@router.get('/config', response_model=RateLimitConfigResponse)
async def get_config(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RateLimitConfig).limit(1))
    config = result.scalars().first()
    
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
        
    return config

@router.put('/config', response_model=RateLimitConfigResponse)
async def update_config(
    config_update: RateLimitConfigUpdate,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(RateLimitConfig).limit(1))
    config = result.scalars().first()
    
    if not config:
        raise HTTPException(status_code=404, detail="Configuration not found")
        
    if config_update.requests_allowed is not None:
        config.requests_allowed = config_update.requests_allowed
    if config_update.window_seconds is not None:
        config.window_seconds = config_update.window_seconds
    if config_update.enabled is not None:
        config.enabled = config_update.enabled
        
    await db.commit()
    await db.refresh(config)
    return config
