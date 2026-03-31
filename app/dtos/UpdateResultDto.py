from pydantic import BaseModel

class UpdateResultDto(BaseModel):
    title: str