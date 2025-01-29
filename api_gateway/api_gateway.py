from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import httpx
import uvicorn
import jwt
import datetime

SECRET_KEY = "SECRET_KEY"
ALGORITHM = "HS256"
MICROSERVICE_SECRET_KEY = "MICROSERVICE_SECRET_KEY"

SERVICES = {
    "authorization_service": "http://127.0.0.1:8000",
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

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

@app.post("/auth/login")
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

@app.post("/auth/register")
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

@app.get("/protected")
async def protected_route(token: str = Depends(verify_token)):
    if token is None:
        raise HTTPException(status_code=401, detail="Не авторизован")
    return {"message": "Этот ресурс защищён", "user": token["sub"], "token": token}

@app.on_event("shutdown")
async def shutdown_event():
    await http_client.aclose()

if __name__ == "__main__":
    uvicorn.run("api_gateway:app", host="0.0.0.0", port=5000, reload=True)
