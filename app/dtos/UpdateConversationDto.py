from pydantic import BaseModel

class UpdateConversationDto(BaseModel):
    title: str