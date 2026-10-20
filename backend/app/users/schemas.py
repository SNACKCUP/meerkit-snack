from pydantic import BaseModel, ConfigDict, Field


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    name: str
    is_active: bool
    roles: list[str] = Field(validation_alias="role_codes", examples=[["USER"]])


class RolesUpdate(BaseModel):
    roles: list[str] = Field(min_length=1, examples=[["USER", "ADMIN"]])


class ActiveUpdate(BaseModel):
    is_active: bool
