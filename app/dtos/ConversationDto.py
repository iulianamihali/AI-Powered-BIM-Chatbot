from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class ConversationDto(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    created_at: datetime
    last_updated: datetime

    class Config:
        from_attributes = True
