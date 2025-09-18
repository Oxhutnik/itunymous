# main.py - FastAPI backend for itunymous

import os
import json
import time
import random
from typing import Dict, List, Optional, Tuple
from datetime import datetime

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
import socketio
import uvicorn
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Load environment variables
load_dotenv()

# FastAPI app
app = FastAPI(title="itunymous API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"]
)

# Create ASGI app
socket_app = socketio.ASGIApp(sio, app)

# Data models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    hobbies: List[str] = []

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class VerificationRequest(BaseModel):
    email: EmailStr

class VerificationCode(BaseModel):
    email: EmailStr
    code: str

class ChatRequest(BaseModel):
    userId: str

class EndChatRequest(BaseModel):
    roomId: str
    userId: str

class CancelChatRequest(BaseModel):
    userId: str

class SendMessageRequest(BaseModel):
    roomId: str
    sender: str
    message: str

# Global data stores
USERS_FILE = "itunymous_users.json"
MESSAGES_FILE = "chat_messages.json"

verification_codes: Dict[str, Tuple[str, float]] = {}  # email -> (code, expire_time)
waiting_pool: Dict[str, dict] = {}  # userId -> user_data
active_chats: Dict[str, List[str]] = {}  # roomId -> [userId1, userId2]
chat_messages: Dict[str, List[dict]] = {}  # roomId -> messages

# Utility functions
def load_users() -> dict:
    if not os.path.exists(USERS_FILE):
        return {}
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return {}

def save_users(users: dict):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, ensure_ascii=False, indent=2)

def load_messages() -> dict:
    global chat_messages
    if not os.path.exists(MESSAGES_FILE):
        return {}
    try:
        with open(MESSAGES_FILE, "r", encoding="utf-8") as f:
            chat_messages = json.load(f)
    except:
        chat_messages = {}
    return chat_messages

def save_messages():
    with open(MESSAGES_FILE, "w", encoding="utf-8") as f:
        json.dump(chat_messages, f, ensure_ascii=False, indent=2)

# Email sending function
async def send_verification_email(email: str, code: str):
    try:
        # Email configuration
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        sender_email = os.getenv("MAIL_USERNAME")
        sender_password = os.getenv("MAIL_PASSWORD")

        if not sender_email or not sender_password:
            print("Email credentials not found in environment variables")
            return False

        print(f"Attempting to send email from {sender_email} to {email}")

        # Create message
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = email
        msg['Subject'] = "itunymous - Doğrulama Kodu"

        body = f"""
        Merhaba,

        itunymous'a kayıt olmak için doğrulama kodunuz: {code}

        Bu kod 5 dakika içinde geçerliliğini yitirecektir.

        Eğer bu kodu siz talep etmediyseniz, lütfen bu e-postayı dikkate almayın.

        Teşekkürler,
        itunymous Ekibi
        """

        msg.attach(MIMEText(body, 'plain'))

        # Send email
        await aiosmtplib.send(
            msg,
            hostname=smtp_server,
            port=smtp_port,
            username=sender_email,
            password=sender_password,
            start_tls=True
        )

        print(f"Verification email sent successfully to {email}")
        return True

    except aiosmtplib.SMTPAuthenticationError as e:
        print(f"SMTP Authentication Error: {e}")
        print("This usually means the password is incorrect or you need to use an app password for Gmail")
        return False
    except aiosmtplib.SMTPConnectError as e:
        print(f"SMTP Connection Error: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error sending email to {email}: {e}")
        return False

# Load initial data
print("Loading chat messages...")
loaded_messages = load_messages()
print(f"Loaded {len(loaded_messages)} rooms with messages")
for room_id, messages in loaded_messages.items():
    print(f"Room {room_id}: {len(messages)} messages")

# API Endpoints
@app.post("/api/send-verification")
async def send_verification_code(request: VerificationRequest):
    try:
        email = request.email
        if not email:
            raise HTTPException(status_code=400, detail="E-posta adresi gerekli.")

        verification_code = str(random.randint(100000, 999999))
        expire_time = time.time() + 300  # 5 minutes

        verification_codes[email] = (verification_code, expire_time)

        # Send verification email
        email_sent = await send_verification_email(email, verification_code)

        if not email_sent:
            raise HTTPException(status_code=500, detail="E-posta gönderilemedi.")

        return {"message": "Doğrulama kodu başarıyla gönderildi."}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error sending verification: {e}")
        raise HTTPException(status_code=500, detail="E-posta gönderilirken bir hata oluştu.")

@app.post("/api/verify-code")
async def verify_code(request: VerificationCode):
    email = request.email
    code = request.code

    if not email or not code:
        raise HTTPException(status_code=400, detail="E-posta ve kod gerekli.")

    entry = verification_codes.get(email)
    if not entry:
        raise HTTPException(status_code=400, detail="Kod bulunamadı veya süresi doldu.")

    saved_code, expire_time = entry
    if time.time() > expire_time:
        del verification_codes[email]
        raise HTTPException(status_code=400, detail="Kodun süresi doldu.")

    if code != saved_code:
        raise HTTPException(status_code=400, detail="Kod yanlış.")

    return {"message": "Kod doğrulandı."}

@app.post("/api/register")
async def register_user(request: UserRegister):
    users = load_users()

    if request.email in users:
        raise HTTPException(status_code=400, detail="Bu e-posta ile zaten kayıt olunmuş.")

    users[request.email] = {
        "password": request.password,
        "hobbies": request.hobbies,
        "status": "available",
        "userId": request.email,
        "current_chat": None
    }

    save_users(users)
    return {"message": "Kayıt başarılı."}

@app.post("/api/login")
async def login_user(request: UserLogin):
    users = load_users()
    user = users.get(request.email)

    if not user or user['password'] != request.password:
        raise HTTPException(status_code=401, detail="E-posta veya şifre yanlış.")

    return {
        "message": "Giriş başarılı.",
        "userId": user['userId'],
        "hobbies": user['hobbies']
    }

@app.post("/api/chat/request")
async def request_chat(request: ChatRequest):
    user_id = request.userId

    if not user_id:
        raise HTTPException(status_code=400, detail="Kullanıcı kimliği gerekli.")

    users = load_users()
    requester = users.get(user_id)

    if not requester:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

    if requester.get('status') == 'busy':
        raise HTTPException(status_code=400, detail="Zaten aktif bir sohbettesiniz.")

    if user_id in waiting_pool:
        raise HTTPException(status_code=400, detail="Zaten eşleşme bekliyorsunuz.")

    # Find best match
    best_match = None
    max_common_hobbies = 0

    for waiting_id, waiting_user in waiting_pool.items():
        if waiting_id != user_id:
            common_hobbies = len(
                set(requester['hobbies']) &
                set(waiting_user['hobbies'])
            )
            if common_hobbies > max_common_hobbies:
                max_common_hobbies = common_hobbies
                best_match = waiting_user

    if best_match and max_common_hobbies > 0:
        # Match found
        room_id = f"room_{int(time.time())}_{random.randint(1000,9999)}"

        users[user_id]['status'] = 'busy'
        users[user_id]['current_chat'] = room_id
        users[best_match['userId']]['status'] = 'busy'
        users[best_match['userId']]['current_chat'] = room_id

        del waiting_pool[best_match['userId']]

        active_chats[room_id] = [user_id, best_match['userId']]

        save_users(users)

        # Notify both users with separate data
        match_data_user1 = {
            "roomId": room_id,
            "commonHobbies": max_common_hobbies,
            "partner": best_match['userId'],
            "targetUser": user_id
        }

        match_data_user2 = {
            "roomId": room_id,
            "commonHobbies": max_common_hobbies,
            "partner": user_id,
            "targetUser": best_match['userId']
        }

        print(f"Emitting match_found to {user_id} with data: {match_data_user1}")
        await sio.emit('match_found', match_data_user1, to=user_id)
        print(f"Emitting match_found to {best_match['userId']} with data: {match_data_user2}")
        await sio.emit('match_found', match_data_user2, to=best_match['userId'])

        return {
            "status": "matched",
            "roomId": room_id,
            "commonHobbies": max_common_hobbies
        }
    else:
        # No match found, add to waiting pool
        waiting_pool[user_id] = requester
        return {
            "status": "waiting",
            "message": "Uygun eşleşme bekleniyor..."
        }

@app.post("/api/chat/end")
async def end_chat(request: EndChatRequest):
    room_id = request.roomId
    user_id = request.userId

    if not room_id or not user_id:
        raise HTTPException(status_code=400, detail="Oda ID ve kullanıcı ID gerekli.")

    users = load_users()

    if user_id in users:
        users[user_id]['status'] = 'available'
        users[user_id]['current_chat'] = None

    if room_id in active_chats:
        participants = active_chats[room_id]
        del active_chats[room_id]

        for participant in participants:
            if participant in users and participant != user_id:
                users[participant]['status'] = 'available'
                users[participant]['current_chat'] = None

    save_users(users)

    # Notify room
    await sio.emit('chat_ended', {"message": "Sohbet sonlandırıldı."}, room=room_id)

    return {"message": "Sohbet sonlandırıldı."}

@app.post("/api/chat/cancel")
async def cancel_chat_request(request: CancelChatRequest):
    user_id = request.userId

    if not user_id:
        raise HTTPException(status_code=400, detail="Kullanıcı kimliği gerekli.")

    if user_id in waiting_pool:
        del waiting_pool[user_id]
        return {"message": "Eşleşme isteği iptal edildi."}
    else:
        raise HTTPException(status_code=400, detail="Bekleyen eşleşme isteği bulunamadı.")

@app.get("/api/chat/check-active")
async def check_active_chat(userId: str = Query(...)):
    if not userId:
        raise HTTPException(status_code=400, detail="Kullanıcı kimliği gerekli.")

    users = load_users()
    user = users.get(userId)

    if not user:
        return {"hasActiveChat": False}

    has_active_chat = user.get('status') == 'busy' and user.get('current_chat') is not None
    return {"hasActiveChat": has_active_chat}

@app.get("/api/chat/get-room")
async def get_user_room(userId: str = Query(...)):
    if not userId:
        raise HTTPException(status_code=400, detail="Kullanıcı kimliği gerekli.")

    users = load_users()
    user = users.get(userId)

    if not user:
        return {"roomId": None}

    room_id = user.get('current_chat')
    return {"roomId": room_id}

@app.get("/api/chat/messages/{room_id}")
async def get_room_messages(room_id: str, since: float = 0.0):
    if room_id not in chat_messages:
        return {"messages": []}

    if since > 0:
        filtered_messages = [msg for msg in chat_messages[room_id] if msg['timestamp'] > since]
        return {"messages": filtered_messages}
    else:
        return {"messages": chat_messages[room_id]}

@app.post("/api/chat/send-message")
async def send_message(request: SendMessageRequest):
    room_id = request.roomId
    sender = request.sender
    message = request.message

    if room_id not in chat_messages:
        chat_messages[room_id] = []

    message_data = {
        'sender': sender,
        'message': message,
        'timestamp': time.time()
    }

    chat_messages[room_id].append(message_data)
    save_messages()

    return {"status": "message sent"}

# Socket.IO event handlers
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def join_room(sid, data):
    room = data['room']
    username = data['username']
    print(f"User {username} joining room {room}")
    await sio.enter_room(sid, room)
    await sio.emit('user_joined', f"{username} odaya katıldı.", room=room)

@sio.event
async def join_user_room(sid, data):
    user_id = data['userId']
    print(f"User {user_id} (socket {sid}) joining user room")
    await sio.enter_room(sid, user_id)
    print(f"User {user_id} successfully joined user room")

@sio.event
async def leave_room(sid, data):
    room = data['room']
    username = data['username']
    print(f"User {username} (socket {sid}) leaving room {room}")

    # Update user status if they're leaving their active chat
    users = load_users()
    if username in users:
        current_chat = users[username].get('current_chat')
        if current_chat == room:
            users[username]['status'] = 'available'
            users[username]['current_chat'] = None
            save_users(users)
            print(f"User {username} status updated to available")

    await sio.leave_room(sid, room)
    await sio.emit('user_left', f"{username} odadan ayrıldı.", room=room)
    print(f"User {username} left room {room} and notification sent")

if __name__ == "__main__":
    uvicorn.run(socket_app, host="0.0.0.0", port=5000)