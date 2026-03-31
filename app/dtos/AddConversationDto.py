from uuid import UUID

from pydantic import BaseModel

class AddConversationDto(BaseModel):
        user_id: UUID
        title: str
        sender: str

        class Config:
                from_attributes = True
