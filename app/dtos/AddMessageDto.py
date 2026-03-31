from uuid import UUID

from pydantic import BaseModel


class AddMessageDto(BaseModel):
    conversation_id:UUID
    sender: str
    content: str
    class Config:
        from_attributes = True
