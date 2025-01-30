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

DB_PATH = "notes.db"
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
    
class NoteRequest(BaseModel):
    text: str

class DeleteNotesRequest(BaseModel):
    note_ids: list[int]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Все источники
    allow_credentials=True,
    allow_methods=["*"],  # Все HTTP-методы (GET, POST и т. д.)
    allow_headers=["*"],  # Все заголовки
)
app.add_middleware(MicroserviceAuthMiddleware)

# Добавить проверочки чтобы ошибки мониторить
@app.get("/all_user_notes/{username}")
async def all_user_notes(username: str):
    db = DBHandler(DB_PATH)
    notes = db.get_notes_by_user(username=username)
    return {"message": f"Это все записи {username}", "notes":notes}

@app.post("/add_note/{username}")
async def add_note(username: str, note: NoteRequest):
    db = DBHandler(DB_PATH)
    success = db.add_note(username=username, text=note.text)
    if success:
        return {"message": f"Заметка добавлена для {username}"}
    else:
        raise HTTPException(status_code=500, detail="Ошибка при добавлении заметки")
    
# удалять лучше списком
@app.post("/delete_notes/{username}")
async def delete_notes(username: str, delete_request: DeleteNotesRequest):
    db = DBHandler(DB_PATH)
    success = db.delete_notes(username=username, note_ids=delete_request.note_ids)
    if success:
        return {"message": f"Заметки {delete_request.note_ids} успешно удалены для {username}"}
    else:
        raise HTTPException(status_code=400, detail="Ошибка при удалении заметок или заметки не принадлежат пользователю")

if __name__ == "__main__":
    uvicorn.run("notes:app", host="0.0.0.0", port=8080, reload=True)