import os

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Depends

from routers import get_user_info
from schemas import UserPayload

load_dotenv()


app = FastAPI()


@app.get("/healthy")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}

@app.get("/secure")
async def root(user:UserPayload=Depends(get_user_info)):
    return {"message": "Hello {user.username}. You have been granted access to our service"}


if __name__ == "__main__":
    uvicorn.run("main:app", host=os.getenv("APP_HOST", "0.0.0.0"), port= int(os.getenv("APP_PORT", 7000)), reload=True)