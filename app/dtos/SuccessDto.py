from pydantic import BaseModel

class SuccessDto(BaseModel):
    success: bool