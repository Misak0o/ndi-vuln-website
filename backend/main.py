from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from fastapi.middleware.cors import CORSMiddleware

# --- Configuration ---
# ATTENTION : Clé secrète faible utilisée intentionnellement pour le défi !
SECRET_KEY = "secret"
ALGORITHM = "HS256"

app = FastAPI()

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schéma d'authentification ---
# Cela dit à FastAPI de chercher le token dans le header "Authorization: Bearer <token>"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# --- Fonctions de sécurité ---
def create_access_token(data: dict):
    """Crée un token JWT."""
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user_role(token: str = Depends(oauth2_scheme)):
    """Décode le token et retourne le rôle de l'utilisateur."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        role: str = payload.get("role")
        if role is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return role


# --- Routes de l'API ---
@app.get("/")
async def get_guest_token():
    """
    Génère un token JWT pour un utilisateur 'guest' avec des privilèges limités.
    C'est le point de départ pour l'utilisateur du défi.
    """
    guest_token = create_access_token(data={"role": "guest"})
    return {"token": guest_token}


@app.get("/admin")
async def read_admin_panel(current_user_role: str = Depends(get_current_user_role)):
    """
    Une route protégée qui n'est accessible qu'aux utilisateurs avec le rôle 'MaitreDuCafe'.
    C'est l'objectif final du défi pour l'utilisateur.
    """
    if current_user_role != "MaitreDuCafe":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès refusé. Seuls les vrais amateurs de café peuvent passer.",
        )
    return {"message": "Félicitations ! La machine à café vous reconnaît comme son Maître. Un pouvoir immense implique d'immenses cafés."}