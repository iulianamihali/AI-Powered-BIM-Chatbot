import uuid
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.dtos.ConversationDto import ConversationDto
from app.models.Conversations import Conversation
from app.dtos.AddConversationDto import AddConversationDto
from app.models.Messages import Message
import uuid
from datetime import datetime
from uuid import UUID
from app.models.Users import User

def get_conversations_by_user_id(db: Session, user_id: str) -> list[ConversationDto]:
    conversations = db.query(Conversation).filter(Conversation.user_id == user_id).all()
    return [ConversationDto.model_validate(conv) for conv in conversations]

def add_conversation_by_user_id(db:Session, add_model:AddConversationDto):
    db_conversation = Conversation(
        id=uuid.uuid4(),
        user_id=add_model.user_id,
        title=add_model.title,
    )
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return ConversationDto.model_validate(db_conversation)

def delete_conversation_by_user_id(db:Session, conversation_id):
    messages = db.query(Message).filter(Message.conversation_id == conversation_id).all()

    for message in messages:
        db.delete(message)

    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    db.delete(conversation)
    db.commit()

    return {"message": "Conversation and its messages deleted successfully."}

def update_conversation_title(
    db: Session, conv_id: UUID, new_title: str, auth0_id: str
):
    user = db.query(User).filter(User.auth0_id == auth0_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    conv = (
        db.query(Conversation)
        .filter(Conversation.id == conv_id and Conversation.user_id == user.id)
        .first()
    )
    if not conv:
        return None
    conv.title = new_title
    db.commit()
    db.refresh(conv)
    return conv

def delete_conversation(db: Session, conv_id: UUID, auth0_id: str) -> bool:
    user = db.query(User).filter_by(auth0_id=auth0_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    conv = db.query(Conversation).filter(Conversation.id == conv_id, Conversation.user_id == user.id).first()
    if not conv:
        return False
    db.query(Message).filter(Message.conversation_id == conv.id).delete(synchronize_session=False)
    db.delete(conv)
    db.commit()
    return True

def create_conversation(db: Session, user_id: uuid.UUID, title: str) -> Conversation:
    new_conversation = Conversation(
        id=uuid.uuid4(),
        user_id=user_id,
        title=title[:50],
        created_at=datetime.utcnow(),
        last_updated=datetime.utcnow()
    )
    db.add(new_conversation)
    db.commit()
    db.refresh(new_conversation)
    return new_conversation