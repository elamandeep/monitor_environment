from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import ee



from pydantic_models import Response


# your creds
# ee.Authenticate()
ee.Initialize(project="XXXX")

from api import router

origins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
    "http://127.0.0.1",
]


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    r = Response(data=[], successMesssage="API is working!!")
    return JSONResponse(content=r.model_dump(), status_code=200)


app.include_router(router)


if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)
