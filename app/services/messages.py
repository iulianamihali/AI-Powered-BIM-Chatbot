import uuid
from uuid import UUID

from sqlalchemy.orm import Session

from app.dtos.ResponseMessageLLMDto import ResponseMessageLLMDto
from app.dtos.SenderContentDto import SenderContentDto
from app.models.Messages import Message


def add_message(db:Session, conversation_id:UUID, sender:str, content:str):
    message = Message(
        id=uuid.uuid4(),
        conversation_id=conversation_id,
        sender=sender,
        content=content,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return ResponseMessageLLMDto.model_validate(message)


def get_all_messages_by_conversation_id(db: Session, conversation_id: UUID) -> list[SenderContentDto]:
    messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at).all()
    return [SenderContentDto.model_validate(message) for message in messages]