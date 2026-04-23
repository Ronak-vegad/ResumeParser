import random
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth_utils import create_access_token, get_current_user, hash_password, verify_password
from database import get_db
from mail import send_otp_email
from models import OtpCode, User
from schemas_auth import (
    LoginRequest,
    MessageResponse,
    ResendOtpRequest,
    SignupRequest,
    TokenResponse,
    UserOut,
    VerifyOtpRequest,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=MessageResponse)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email.lower().strip()).first()
    if existing and existing.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in.",
        )

    if not existing:
        user = User(
            email=data.email.lower().strip(),
            name=data.name.strip(),
            year=data.year,
            password_hash=hash_password(data.password),
            is_verified=False,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user = existing
        user.name = data.name.strip()
        user.year = data.year
        user.password_hash = hash_password(data.password)
        db.commit()
        db.refresh(user)

    db.query(OtpCode).filter(OtpCode.user_id == user.id).delete()
    code = f"{random.randint(0, 9999):04d}"
    expires = datetime.now(timezone.utc) + timedelta(minutes=15)
    db.add(OtpCode(user_id=user.id, code=code, expires_at=expires))
    db.commit()

    try:
        send_otp_email(user.email, code, user.name)
    except Exception as e:  # noqa: BLE001
        print(f"[EMAIL SEND ERROR] {e} — OTP for {user.email}: {code}")

    return MessageResponse(
        message="We sent a 4-digit code to your email. Enter it below to verify your account.",
        email=user.email,
    )


@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(data: VerifyOtpRequest, db: Session = Depends(get_db)):
    email = data.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=400, detail="No signup found for this email.")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="This account is already verified. Please log in.")

    otp_row = db.query(OtpCode).filter(OtpCode.user_id == user.id).first()
    if not otp_row:
        raise HTTPException(status_code=400, detail="No active code. Request a new one from sign up or resend.")

    now = datetime.now(timezone.utc)
    if otp_row.code != data.code:
        raise HTTPException(status_code=400, detail="Invalid verification code.")
    exp = otp_row.expires_at
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if now > exp:
        raise HTTPException(status_code=400, detail="This code has expired. Request a new one.")

    user.is_verified = True
    db.delete(otp_row)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id, user.email)
    return TokenResponse(
        access_token=token,
        user=UserOut.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    email = data.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email with the code we sent before logging in.",
        )
    token = create_access_token(user.id, user.email)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return UserOut.model_validate(user)


@router.post("/resend-otp", response_model=MessageResponse)
def resend_otp(data: ResendOtpRequest, db: Session = Depends(get_db)):
    email = data.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=400, detail="No signup found for this email.")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="This account is already verified. Please log in.")

    db.query(OtpCode).filter(OtpCode.user_id == user.id).delete()
    code = f"{random.randint(0, 9999):04d}"
    expires = datetime.now(timezone.utc) + timedelta(minutes=15)
    db.add(OtpCode(user_id=user.id, code=code, expires_at=expires))
    db.commit()

    try:
        send_otp_email(user.email, code, user.name)
    except Exception as e:  # noqa: BLE001
        print(f"[EMAIL SEND ERROR] {e} — OTP for {user.email}: {code}")

    return MessageResponse(
        message="A new verification code was sent to your email.",
        email=user.email,
    )
