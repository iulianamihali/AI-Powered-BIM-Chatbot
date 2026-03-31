from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ResponseMessageLLMDto(BaseModel):
    conversation_id: UUID
    content: str
    created_at: datetime


    class Config:
        from_attributes = True