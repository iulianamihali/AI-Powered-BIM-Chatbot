from typing import List
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

from app.auth import get_current_user  # funcția care validează tokenul și extrage userul
from app.database import get_db
from app.dtos.AddConversationDto import AddConversationDto
from app.dtos.ConversationDto import ConversationDto
from app.dtos.ResponseMessageLLMDto import ResponseMessageLLMDto
from app.llm_utils.generate_response import generate_response_from_LLM
from app.models.Conversations import Conversation
from app.services.conversations import get_conversations_by_user_id, add_conversation_by_user_id
from app.services.messages import add_message
from app.services.conversations import update_conversation_title
from app.services.conversations import delete_conversation
from app.dtos.UpdateConversationDto import UpdateConversationDto
from app.dtos.UpdateResultDto import UpdateResultDto
from app.dtos.SuccessDto import SuccessDto
from fastapi import APIRouter, Depends, HTTPException, status
from uuid import UUID
router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"]
)

@router.get("/all_conversations/{user_id}", response_model=List[ConversationDto])
def get_all_conversations(user_id: str,
                          db: Session = Depends(get_db),
                          current_user: dict = Depends(get_current_user)  # validare token Auth0
                          ):
    return get_conversations_by_user_id(db, user_id)


@router.put(
    "/edit/{conversation_id}",
    response_model=UpdateResultDto,
    status_code=status.HTTP_200_OK,
)
def edit_conversation(
    conversation_id: UUID,
    update: UpdateConversationDto,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    conv = update_conversation_title(
        db, conversation_id, update.title, current_user["sub"]
    )
    if not conv:
        raise HTTPException(
            status_code=404,
            detail="Conversația nu există sau nu aparține utilizatorului.",
        )
    return {"title": conv.title}


@router.delete(
    "/delete/{conversation_id}",
    response_model=SuccessDto,
    status_code=status.HTTP_200_OK,
)
def remove_conversation(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    ok = delete_conversation(db, conversation_id, current_user["sub"])
    if not ok:
        raise HTTPException(
            status_code=404,
            detail="Conversația nu există sau nu aparține utilizatorului.",
        )
    return {"success": True}
@router.post("/add_conversation")
async def add_conversation(add_model:AddConversationDto,
                     db:Session = Depends(get_db),
                     current_user: dict = Depends(get_current_user)  # validare token Auth0
                     ):
    conversation_dto = add_conversation_by_user_id(db, add_model)
    print(conversation_dto)
    return conversation_dto

