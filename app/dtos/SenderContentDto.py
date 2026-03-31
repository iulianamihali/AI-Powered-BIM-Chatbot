from datetime import datetime
from uuid import UUID

from pydantic import BaseModel
class SenderContentDto(BaseModel):
    conversation_id:UUID
    sender:str
    content:str
    created_at:datetime
    class Config:
        from_attributes = True
