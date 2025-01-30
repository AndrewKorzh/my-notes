from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import uvicorn
import jwt
import datetime

SECRET_KEY = "SECRET_KEY"
ALGORITHM = "HS256"
MICROSERVICE_SECRET_KEY = "MICROSERVICE_SECRET_KEY"

SERVICES = {
    "authorization_service": "http://127.0.0.1:8000",
    "notes": "http://127.0.0.1:8080",
}



def create_microservice_access_token(data: dict, expires_delta: datetime.timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(datetime.UTC) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.UTC) + datetime.timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, MICROSERVICE_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt



class CustomAsyncClient(httpx.AsyncClient):
    async def send(self, request: httpx.Request, **kwargs) -> httpx.Response:
        # Не надо каждый раз генерить, только если время истеклдо
        token = create_microservice_access_token({"service":"api_gateway"})
        request.headers["authorization-microservice"] = f"Bearer {token}"
        print(f"Sending request to {request.url}")
        return await super().send(request, **kwargs)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
http_client = CustomAsyncClient()

@app.post("/authorization/login")
async def login(request: Request):
    response = await http_client.post(f"{SERVICES['authorization_service']}/login", content=await request.body())
    if response.status_code != 200:
        try:
            error_detail = response.json()["detail"]
        except:
            error_detail = response.json()
        raise HTTPException(
            status_code=response.status_code,
            detail=error_detail
        )
    return response.json()

@app.post("/authorization/register")
async def register(request: Request):
    response = await http_client.post(f"{SERVICES['authorization_service']}/register", content=await request.body())
    if response.status_code != 200:
        try:
            error_detail = response.json()["detail"]
        except:
            error_detail = response.json()
        raise HTTPException(
            status_code=response.status_code,
            detail=error_detail
        )
    return response.json()

def verify_token(request: Request):
    authorization_header = request.headers.get("authorization-client")
    if authorization_header is None:
        raise HTTPException(status_code=403, detail="Authorization header missing")
    if authorization_header.startswith("Bearer "):
        token = authorization_header.split(" ")[1]
    else:
        raise HTTPException(status_code=403, detail="Invalid token format")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=403, detail="Invalid token")
    
@app.get("/notes/all_user_notes")
async def all_user_notes(token: dict = Depends(verify_token)):

    response = await http_client.get(f"{SERVICES['notes']}/all_user_notes/{token["sub"]}")
    if response.status_code != 200:
        try:
            error_detail = response.json()["detail"]
        except:
            error_detail = response.json()
        raise HTTPException(
            status_code=response.status_code,
            detail=error_detail
        )
    return response.json()

class NoteRequest(BaseModel):
    text: str

@app.post("/notes/add_note")
async def add_note(note: NoteRequest, token: dict = Depends(verify_token)):
    text = note.text
    response = await http_client.post(
        f"{SERVICES['notes']}/add_note/{token['sub']}", 
        json={"text": text}
    )

    if response.status_code != 200:
        try:
            error_detail = response.json().get("detail", "Unknown error")
        except:
            error_detail = response.text
        raise HTTPException(
            status_code=response.status_code,
            detail=error_detail
        )

    return response.json()

class DeleteNotesRequest(BaseModel):
    note_ids: list[int]

@app.post("/notes/delete_user_notes")
async def delete_user_notes(delete_request: DeleteNotesRequest, token: dict = Depends(verify_token)):
    note_ids=delete_request.note_ids
    response = await http_client.post(
        f"{SERVICES['notes']}/delete_notes/{token['sub']}", 
        json={"note_ids": note_ids}
    )

    if response.status_code != 200:
        try:
            error_detail = response.json().get("detail", "Unknown error")
        except:
            error_detail = response.text
        raise HTTPException(
            status_code=response.status_code,
            detail=error_detail
        )

    return response.json()


@app.on_event("shutdown")
async def shutdown_event():
    await http_client.aclose()

if __name__ == "__main__":
    uvicorn.run("api_gateway:app", host="0.0.0.0", port=5000, reload=True)
