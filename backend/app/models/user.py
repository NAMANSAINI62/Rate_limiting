from datetime import datetime
from sqlalchemy import Integer, String, DateTime, Column
from sqlalchemy.orm import relationship
from app.database.base import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String(20), default='user', nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    logs = relationship('RequestLog', back_populates='user', cascade='all, delete-orphan')

    def __repr__(self) -> str:
        return f'<User username={self.username} role={self.role}>'