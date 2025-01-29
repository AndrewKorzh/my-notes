from fastapi import FastAPI, HTTPException, Request
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import JSONResponse

from pydantic import BaseModel
import jwt
import datetime
import bcrypt
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

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
    
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Все источники
    allow_credentials=True,
    allow_methods=["*"],  # Все HTTP-методы (GET, POST и т. д.)
    allow_headers=["*"],  # Все заголовки
)
app.add_middleware(MicroserviceAuthMiddleware)


@app.get("/all_user_notes/{username}")
async def protected_route(username: str):
    return {"message": f"Это все записи {username}"}


if __name__ == "__main__":
    uvicorn.run("notes:app", host="0.0.0.0", port=8080, reload=True)