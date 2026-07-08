from datetime import datetime
from sqlalchemy import Integer, String, DateTime, Float, ForeignKey, Column
from sqlalchemy.orm import relationship
from app.database.base import Base

class RequestLog(Base):
    __tablename__ = 'request_logs'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    endpoint = Column(String(200), nullable=False)
    ip_address = Column(String(50), nullable=False)
    request_time = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String(20), nullable=False)
    http_status = Column(Integer, nullable=False)
    response_time = Column(Float, nullable=False)
    user = relationship('User', back_populates='logs')

    def __repr__(self) -> str:
        return f'<RequestLog endpoint={self.endpoint} status={self.status} http={self.http_status}>'