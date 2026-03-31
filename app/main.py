import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import users, chat_response
from app.routers import conversations
from app.routers import messages
from app.routers import vector_response
from fastapi.staticfiles import StaticFiles

from app.llm_utils.generate_response_from_docx import generate_response_from_docx

app = FastAPI()

os.makedirs("uploads", exist_ok=True)
print("Folder uploads creat la:", os.path.abspath("uploads"))
# Montează ruta statică pentru a servi fișierele din browser
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads") #montam ruta pt ca fiecare cerere care incepe cu /uploads sa aiba fisierele redirectionate spre folderul uploads/

# Adăugăm CORS ca să putem comunica cu frontend-ul
origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Creează automat toate tabelele
@app.on_event("startup")
def on_startup():
    print("Verific tabelele în baza de date...")
    Base.metadata.create_all(bind=engine)
    print("Tabele verificate/create!")

# Include rutele
app.include_router(users.router)
app.include_router(conversations.router)
app.include_router(messages.router)
app.include_router(vector_response.router)
app.include_router(chat_response.router)