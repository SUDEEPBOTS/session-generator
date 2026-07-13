from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
import asyncio

# Load environment variables
load_dotenv()
API_ID = os.getenv("API_ID")
API_HASH = os.getenv("API_HASH")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

clients = {}

class SendCodeReq(BaseModel):
    phone_number: str
    library: str

class VerifyCodeReq(BaseModel):
    phone_number: str
    phone_code_hash: str
    code: str
    password: Optional[str] = None
    library: str

@app.post("/api/send_code")
async def send_code(req: SendCodeReq):
    if not API_ID or not API_HASH:
        raise HTTPException(status_code=500, detail="API_ID or API_HASH not set in .env")

    phone = req.phone_number
    library = req.library.lower()

    if library == "pyrogram":
        from pyrogram import Client
        client = Client(f"session_{phone}", api_id=int(API_ID), api_hash=API_HASH, in_memory=True)
        await client.connect()
        try:
            sent_code = await client.send_code(phone)
            clients[phone] = {"client": client, "lib": "pyrogram"}
            return {"phone_code_hash": sent_code.phone_code_hash}
        except Exception as e:
            await client.disconnect()
            raise HTTPException(status_code=400, detail=str(e))

    elif library == "telethon":
        from telethon import TelegramClient
        from telethon.sessions import StringSession
        client = TelegramClient(StringSession(), int(API_ID), API_HASH)
        await client.connect()
        try:
            sent_code = await client.send_code_request(phone)
            clients[phone] = {"client": client, "lib": "telethon"}
            return {"phone_code_hash": sent_code.phone_code_hash}
        except Exception as e:
            await client.disconnect()
            raise HTTPException(status_code=400, detail=str(e))
    else:
        raise HTTPException(status_code=400, detail="Invalid library")

@app.post("/api/verify_code")
async def verify_code(req: VerifyCodeReq):
    phone = req.phone_number
    if phone not in clients:
        raise HTTPException(status_code=400, detail="Session expired or not found. Request code again.")

    session_data = clients[phone]
    client = session_data["client"]
    lib = session_data["lib"]

    try:
        if lib == "pyrogram":
            try:
                await client.sign_in(phone, req.phone_code_hash, req.code)
            except Exception as e:
                if "SessionPasswordNeeded" in str(e):
                    if not req.password:
                        return {"needs_password": True}
                    await client.check_password(req.password)
                else:
                    raise e
            
            session_string = await client.export_session_string()
            await client.disconnect()
            del clients[phone]
            return {"session_string": session_string}

        elif lib == "telethon":
            try:
                await client.sign_in(phone, req.code, phone_code_hash=req.phone_code_hash)
            except Exception as e:
                if "SessionPasswordNeededError" in str(type(e).__name__):
                    if not req.password:
                        return {"needs_password": True}
                    await client.sign_in(password=req.password)
                else:
                    raise e
            
            session_string = client.session.save()
            await client.disconnect()
            del clients[phone]
            return {"session_string": session_string}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Serve the React SPA fallback
@app.exception_handler(404)
async def custom_404_handler(request, exc):
    return FileResponse("../frontend/dist/index.html")

# Mount the static files
app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="static")
