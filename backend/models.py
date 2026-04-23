from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    year = Column(Integer, nullable=False)  # 1–4
    password_hash = Column(String(255), nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    otp = relationship("OtpCode", back_populates="user", uselist=False, cascade="all, delete-orphan")


class OtpCode(Base):
    __tablename__ = "otp_codes"
    __table_args__ = (UniqueConstraint("user_id", name="uq_otp_user"),)

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    code = Column(String(4), nullable=False)
    expires_at = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="otp")
