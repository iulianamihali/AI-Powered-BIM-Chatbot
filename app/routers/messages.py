import os
import shutil
import uuid
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user  # funcția care validează tokenul și extrage userul
from app.database import get_db
from app.dtos.AddMessageDto import AddMessageDto
from app.dtos.ResponseMessageLLMDto import ResponseMessageLLMDto
from app.dtos.SenderContentDto import SenderContentDto
from app.llm_utils.generate_response_from_LLM import generate_response_from_LLM
from app.services.messages import get_all_messages_by_conversation_id

from app.models.Conversations import Conversation

from app.llm_utils.generate_response_from_docx import generate_response_from_docx
from app.models.Users import User

from app.services.messages import add_message

router = APIRouter(
    prefix="/message",
    tags=["Messages"]
)

# Creare user nou
@router.post("/add_message", response_model=ResponseMessageLLMDto)
async def create_message_endpoint(
    message_model:AddMessageDto,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)  # validare token Auth0
):
    response_from_LLM = await generate_response_from_LLM(message_model.content)
    print("response from llm: " + response_from_LLM)
    print("content trimis"+ message_model.content)

    sender = message_model.sender
    if message_model.sender not in ("user", "bot"):
        # dacă vine email sau altceva, consider 'user'
        message_model.sender = "user"

    print("sende " + message_model.sender)
    # salvez mesajul utilizatorului
    add_message(db, message_model.conversation_id, message_model.sender, message_model.content)
    bot_message = add_message(db, message_model.conversation_id, "bot", response_from_LLM)
    return bot_message

@router.get("/all_conversation/{conversation_id}", response_model=List[SenderContentDto])
def all_conversation(
        conversation_id:UUID,
        db: Session = Depends(get_db),
        current_user: dict = Depends(get_current_user)  # validare token Auth0

):
    return get_all_messages_by_conversation_id(db,conversation_id)

@router.post("/upload-file/{user_id}")
async def upload_docx(user_id: uuid.UUID, file: UploadFile = File(...), db: Session = Depends(get_db)):
    os.makedirs("uploads", exist_ok=True)  # cream folderul daca nu exista

    # Verificăm extensia
    if not file.filename.endswith(".docx"):
        return {"error": "Fișierul trebuie să fie .docx"}

    print(file.filename)
    #verificam daca userul exista
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilizatorul nu a fost găsit")

    permanent_path = f"uploads/{file.filename}"
    with open(permanent_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    abs_path = os.path.abspath(permanent_path)
    print("Salvăm fișierul în:", abs_path)
    print("Salvăm fișierul în:", permanent_path)
    #Citim și procesăm conținutul .docx

    try:
        bot_response = await generate_response_from_docx(permanent_path)
    except Exception as e:
        print("Eroare la citirea .docx:", e)
        return {"error": "Nu s-a putut extrage textul din fișier."}
    new_conversation = Conversation(
        user_id=user.id,
        title=file.filename[:255]
    )
    db.add(new_conversation)
    db.commit()
    db.refresh(new_conversation)

    add_message(db, new_conversation.id, "user", f"[Fișier încărcat]: {file.filename}")
    add_message(db, new_conversation.id, "bot", bot_response)

    return {
        "conversation_id": new_conversation.id,
        "bot_response": bot_response,
        "file_url": f"/uploads/{file.filename}" #link accesibil din frontend
    }