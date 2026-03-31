from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import Depends
from app.database import get_db
from app.llm_utils.generate_response_from_LLM import generate_response_from_LLM
from fastapi import APIRouter, HTTPException

from app.models.Conversations import Conversation
from app.models.Users import User
from app.services.conversations import create_conversation
from app.services.messages import add_message

router = APIRouter()

@router.post("/chat_response")
async def test_llm_endpoint(data: dict):
    user_message = data.get("message")
    if not user_message:
        return {"error": "Mesajul este obligatoriu."}
    response = await generate_response_from_LLM(user_message)
    print("LLM Response:", response)
    return {"response": response}


@router.post("/chat/{user_id}")
async def chat_with_llm(user_id: UUID, user_message: str, db: Session = Depends(get_db)):
    #găsim userul
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilizatorul nu a fost găsit")

    new_conversation = create_conversation(db, user.id, user_message)

    #salvăm mesajul utilizatorului
    add_message(db, new_conversation.id, "user", user_message)

    bot_response = await generate_response_from_LLM(user_message)

    add_message(db, new_conversation.id, "bot", bot_response)

    return {
        "conversation_id": new_conversation.id,
        "user_message": user_message,
        "bot_response": bot_response
    }