from sqlalchemy import create_engine #creaza o conexiune intre app(app) si baza de date PostgreSQL
from sqlalchemy.orm import sessionmaker, declarative_base  #permite crearea de sesiuni de lucru cu baza (operatii de adaugare, modificare etc)
import os
from dotenv import load_dotenv


load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
print(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db  # oferă sesiunea către route
    finally:
        db.close()  # când ruta se termină, închide conexiunea
