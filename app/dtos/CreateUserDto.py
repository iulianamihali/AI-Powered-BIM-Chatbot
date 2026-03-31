from pydantic import BaseModel   #folosesc pydantic pt validare automata, asa cum trebuie in FastAPI, genereaza automat un _init_ (constructor) si face conversia din Json direct (datele din frontend vin sub forma de json)

class CreateUserDto(BaseModel):
    name: str
    email: str

    class Config:
        from_attributes = True
