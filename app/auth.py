from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from dotenv import load_dotenv
from pathlib import Path
import os
import requests

# Încarcă .env
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# Variabilele de autentificare
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
API_AUDIENCE = os.getenv("API_AUDIENCE")
ALGORITHMS = os.getenv("ALGORITHMS", "RS256")

# Sistem de extragere a tokenului din request
token_auth_scheme = HTTPBearer()


def verify_jwt(token: str):
    try:
        print("Token primit:", token)
        print("Audience setat în server:", API_AUDIENCE)
        print("Issuer setat în server:", f"https://{AUTH0_DOMAIN}/")
        # Luăm cheia publică de la Auth0
        jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
        jwks = requests.get(jwks_url).json()

        # Citim header-ul JWT-ului să aflăm "kid"
        unverified_header = jwt.get_unverified_header(token)

        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }

        if rsa_key:
            # Decodăm și verificăm tokenul
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=[ALGORITHMS],
                audience=API_AUDIENCE,
                issuer=f"https://{AUTH0_DOMAIN}/"
            )
            return payload

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token invalid: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Eroare la autentificare: {str(e)}"
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalid"
    )


# Dependency FastAPI pentru rutele protejate
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(token_auth_scheme)):
    token = credentials.credentials
    return verify_jwt(
        token)  # returneaza dictionar cu mai multe chei care contin informatii din auth0, precum id il gasim in cheia sub


def get_management_token():
    url = f"https://{AUTH0_DOMAIN}/oauth/token"
    payload = {
        "client_id": os.getenv("AUTH0_M2M_CLIENT_ID"),
        "client_secret": os.getenv("AUTH0_M2M_CLIENT_SECRET"),
        "audience": os.getenv("AUTH0_MGMT_AUDIENCE"),
        "grant_type": "client_credentials"
    }
    response = requests.post(url, json=payload)
    response.raise_for_status()
    return response.json()["access_token"]