import re
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9_]{3,50}$")


class SignupRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        username = value.strip()
        if not USERNAME_PATTERN.match(username):
            raise ValueError(
                "Username must be 3-50 characters and contain only letters, numbers, or underscores"
            )
        return username.lower()

    @field_validator("first_name", "last_name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        return value.strip()

    @model_validator(mode="after")
    def passwords_match(self) -> "SignupRequest":
        if self.password != self.confirm_password:
            raise ValueError("Password and confirm password do not match")
        return self


class LoginRequest(BaseModel):
    identifier: str = Field(..., min_length=1, description="Email or username")
    password: str = Field(..., min_length=1, max_length=128)


class UpdatePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1, max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)

    @model_validator(mode="after")
    def passwords_match(self) -> "UpdatePasswordRequest":
        if self.new_password != self.confirm_password:
            raise ValueError("New password and confirm password do not match")
        if self.current_password == self.new_password:
            raise ValueError("New password must be different from current password")
        return self


class UpdateUsernameRequest(BaseModel):
    current_username: str = Field(..., min_length=3, max_length=50)
    new_username: str = Field(..., min_length=3, max_length=50)

    @field_validator("current_username", "new_username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        username = value.strip()
        if not USERNAME_PATTERN.match(username):
            raise ValueError(
                "Username must be 3-50 characters and contain only letters, numbers, or underscores"
            )
        return username.lower()

    @model_validator(mode="after")
    def usernames_differ(self) -> "UpdateUsernameRequest":
        if self.current_username == self.new_username:
            raise ValueError("New username must be different from current username")
        return self


class DeleteAccountRequest(BaseModel):
    identifier: str = Field(
        ...,
        min_length=1,
        description="Your email address or username",
    )
    password: str = Field(..., min_length=1, max_length=128)


class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    username: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class MessageResponse(BaseModel):
    message: str
