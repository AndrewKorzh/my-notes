from fastapi import FastAPI, HTTPException, Request
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse

from pydantic import BaseModel
import jwt
import datetime
import bcrypt
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from db_handler import DBHandler

DB_PATH = "user_auth.db"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
SECRET_KEY = "SECRET_KEY"
MICROSERVICE_SECRET_KEY = "MICROSERVICE_SECRET_KEY"


class MicroserviceAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        token = request.headers.get("authorization-microservice")
        if token and token.startswith("Bearer "):
            token = token.split(" ")[1]
            try:
                payload = jwt.decode(token, MICROSERVICE_SECRET_KEY, algorithms=[ALGORITHM])
                request.state.service = payload
            except jwt.ExpiredSignatureError:
                return self._generate_error_response("Токен микросервиса истёк")
            except jwt.InvalidTokenError:
                return self._generate_error_response("Недействительный токен микросервиса")

        else:
            return self._generate_error_response("Отсутствует 'authorization-microservice' или начало не с 'Bearer '")
        
        return await call_next(request)

    def _generate_error_response(self, error_detail: str):
        return JSONResponse(
            status_code=401,
            content={"detail": error_detail}
        )


class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Все источники
    allow_credentials=True,
    allow_methods=["*"],  # Все HTTP-методы (GET, POST и т. д.)
    allow_headers=["*"],  # Все заголовки
)
app.add_middleware(MicroserviceAuthMiddleware)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
    
def create_access_token(data: dict, expires_delta: datetime.timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(datetime.UTC) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.UTC) + datetime.timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

@app.post("/login", response_model=Token)
async def login(request: LoginRequest):
    db = DBHandler(DB_PATH)
    if not db.user_exists(request.username):
        raise HTTPException(status_code=400, detail="Пользователь не существует")
    expected_password_hash = db.get_password(request.username)
    if not expected_password_hash:
        raise HTTPException(status_code=400, detail="Пароль не найден")
    if isinstance(expected_password_hash, bytes):
        expected_password_hash = expected_password_hash.decode('utf-8')

    verification = verify_password(request.password, expected_password_hash)
    if not verification:
        raise HTTPException(status_code=400, detail="Неверный пароль")
    access_token = create_access_token(data={"sub": request.username})
    db.close()

    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/register", response_model=Token)
async def registration(request: RegisterRequest):
    print(request.json())
    db = DBHandler(DB_PATH)
    if db.user_exists(request.username):
        raise HTTPException(status_code=400, detail="Такой пользователь существует")
    
    db.add_user(username=request.username, password_hash=hash_password(request.password))
    access_token = create_access_token(data={"sub": request.username})
    db.close()

    return {"access_token": access_token, "token_type": "bearer"}


if __name__ == "__main__":
    uvicorn.run("authorization:app", host="0.0.0.0", port=8000, reload=True)



