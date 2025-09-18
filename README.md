# itunymous

itunymous is a modern real-time chat app for anonymous conversations based on user interests, fostering secure connections in the digital world.

## Features
- **Anonymity**: Hide real identities during chats.
- **Interest-Based Matching**: Connect users with shared hobbies.
- **Security**: Email verification for safe registration.
- **Real-Time Chat**: Instant messaging via WebSocket.
- **User-Friendly UI**: Responsive design with dark theme and mobile support.

## Technology Stack
### Frontend
- Next.js 15, React 19, TypeScript, Tailwind CSS, Socket.IO Client.

### Backend
- FastAPI, Python 3.8+, Socket.IO Server, Uvicorn, Gmail SMTP for email verification.

## How It Works
1. **Registration**: Users sign up with email and verify via a 5-minute code.
2. **Profile Setup**: Specify interests for matching.
3. **Matching**: System pairs users with similar interests from a waiting pool.
4. **Chatting**: Real-time conversations in private rooms; view history, end sessions anytime.
5. **Sessions**: Automatic management; frontend connects to backend at localhost:5000.

## Requirements
- Node.js 18+, Python 3.8+, npm/yarn, Git.

## Installation
```bash
git clone https://github.com/username/itunymous.git
cd itunymous
cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt
cd ../app && npm install
```

## Environment Setup
Create `backend/.env`:
```env
MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_app_password
```
*Notes: Use Gmail app password; don't commit .env; create .env.example.*

## Running
1. **Backend**:
   ```bash
   cd backend
   source venv/bin/activate  # Windows: venv\Scripts\activate
   python main.py
   ```
   Runs on `http://localhost:5000`.

2. **Frontend**:
   ```bash
   cd ../app
   npm run dev
   ```
   Runs on `http://localhost:3000`.
