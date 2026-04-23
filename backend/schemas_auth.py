from pydantic import BaseModel, EmailStr, Field, field_validator


class SignupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    year: int
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("year")
    @classmethod
    def year_range(cls, v: int) -> int:
        if v not in (1, 2, 3, 4):
            raise ValueError("Year must be 1, 2, 3, or 4")
        return v


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=4, max_length=4)

    @field_validator("code")
    @classmethod
    def digits_only(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError("Code must be 4 digits")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ResendOtpRequest(BaseModel):
    email: EmailStr


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    year: int

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class MessageResponse(BaseModel):
    message: str
    email: str | None = None
