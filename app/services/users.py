from sqlalchemy.orm import Session
from app.models.Users import User
from app.dtos.CreateUserDto import CreateUserDto
from app.dtos.UserDto import UserDto
from app.auth import get_management_token
import requests
from decouple import config

AUTH0_DOMAIN = config("AUTH0_DOMAIN")

import uuid

# Caută un user după auth0_id
def get_user_by_id(db: Session, id: str):
    user = db.query(User).filter(User.id == id).first()
    if user:
        print(
            f"User from DB1: {user.name}, {user.email}, {user.phone}, {user.gender}, {user.language}, {user.country}, {user.company}")

        return UserDto.model_validate(user)
    return None
def get_user_by_auth0_id(db: Session, auth0_id: str):
    user = db.query(User).filter(User.auth0_id == auth0_id).first()
    if user:
        print("User from DB2:", user.name, user.email, user.phone, user.gender, user.language, user.country,
              user.company)

        return UserDto.model_validate(user)
    return None

# Creează un user nou dacă nu există
def create_user(db: Session, user_data: CreateUserDto, auth0_id):
    db_user = User(
        id=uuid.uuid4(),
        auth0_id=auth0_id,
        name=user_data.name,
        email=user_data.email
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return UserDto.model_validate(db_user)

def update_user(
    db: Session,
    id: str,
    name: str = None,
    email: str = None,
    phone: str = None,
    gender: str = None,
    language: str = None,
    country: str = None,
    company: str = None,
):
    user = db.query(User).filter(User.id == id).first()
    if not user:
        return None

    if name is not None and name.strip() != "":
        user.name = name
    if email is not None and email.strip() != "":
        user.email = email
    if phone is not None and phone.strip() != "":
        user.phone = phone
    if gender is not None and gender.strip() != "":
        user.gender = gender
    if language is not None and language.strip() != "":
        user.language = language
    if country is not None and country.strip() != "":
        user.country = country
    if company is not None and company.strip() != "":
        user.company = company

    print("Actualizare user:", name, email, phone, gender, language, country, company)

    db.commit()
    db.refresh(user)
    return UserDto.model_validate(user)

# Stergere utilizator
def delete_user_completely(db: Session, auth0_id: str):
    # 1. Ștergere din Auth0
    token = get_management_token()
    url = f"https://{AUTH0_DOMAIN}/api/v2/users/{auth0_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    response = requests.delete(url, headers=headers)
    print("Auth0 delete status:", response.status_code)

    if response.status_code != 204:
        raise Exception("Eroare la ștergerea utilizatorului din Auth0.")

    # 2. Ștergere din PostgreSQL
    user = db.query(User).filter(User.auth0_id == auth0_id).first()
    if not user:
        raise Exception("Utilizatorul nu există în baza de date.")
    db.delete(user)
    db.commit()

