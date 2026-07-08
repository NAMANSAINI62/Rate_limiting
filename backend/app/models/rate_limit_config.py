from sqlalchemy import Integer, Boolean, Column
from app.database.base import Base

class RateLimitConfig(Base):
    __tablename__ = 'rate_limit_config'
    id = Column(Integer, primary_key=True, index=True)
    requests_allowed = Column(Integer, default=100, nullable=False)
    window_seconds = Column(Integer, default=60, nullable=False)
    enabled = Column(Boolean, default=True, nullable=False)

    def __repr__(self) -> str:
        return f'<RateLimitConfig allowed={self.requests_allowed} window={self.window_seconds} enabled={self.enabled}>'