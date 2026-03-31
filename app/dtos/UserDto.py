from uuid import UUID
from typing import Optional
from pydantic import BaseModel   #folosesc pydantic pt validare automata, asa cum trebuie in FastAPI, genereaza automat un _init_ (constructor) si face conversia din Json direct (datele din frontend vin sub forma de json)

class UserDto(BaseModel):
    id: UUID
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    gender: Optional[str]
    language: Optional[str]
    country: Optional[str]
    company: Optional[str]

    class Config:
        from_attributes = True
