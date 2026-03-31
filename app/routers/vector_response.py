from fastapi import APIRouter, Request
from app.llm_utils.generate_response import generate_response_from_LLM
router = APIRouter()


@router.post("/vector-response")
async def handle_vector_query(request: Request):
    data = await request.json()
    user_message = data.get("message")
    if not user_message:
        return {"error": "Mesajul este obligatoriu."}

    response = await generate_response_from_LLM(user_message)
    return {"response": response}
