from pydantic import BaseModel
from typing import Optional

class UpdateUserDto(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    language: Optional[str] = None
    country: Optional[str] = None
    company: Optional[str] = None

    class Config:
        from_attributes = True
