# Telegram String Session Generator 🚀

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-131415?style=for-the-badge&logo=railway&logoColor=white)

A premium, fast, and highly secure multi-step SPA for generating **Telethon** and **Pyrogram (V2)** Telegram string sessions directly from your browser. It uses a modern Glassmorphism UI built with React/Vite on the frontend and a Python FastAPI backend.

## Features ✨

- **Multi-Library Support:** Generates String Sessions for both `telethon` and `pyrogram`.
- **In-Memory Secure Generation:** The Python backend handles OTP and 2FA purely in-memory. **Sessions are NEVER stored on the server.**
- **Glassmorphism UI/UX:** A beautiful, responsive, and dark/light adaptable interface.
- **Easy Deployment:** Includes `railway.json` and `nixpacks.toml` for 1-click deployment on Railway.

## Quick 1-Click Deploy 🚄

Host it yourself instantly on Railway! All frontend builds and backend setups are handled automatically by Nixpacks.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

**Don't forget to set the environment variables in Railway:**
- `API_ID`: Your Telegram API ID.
- `API_HASH`: Your Telegram API Hash.

---

## Local Development 💻

### Prerequisites
- Node.js v20+
- Python 3.11+
- A Telegram `API_ID` and `API_HASH` from [my.telegram.org](https://my.telegram.org).

### 1. Setup Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```
*Edit the `.env` file and add your `API_ID` and `API_HASH`.*

Start the FastAPI backend:
```bash
uvicorn main:app --reload --port 8000
```

### 2. Setup Frontend
In a new terminal tab:
```bash
cd frontend
npm install
npm run dev
```

The React frontend will be available at `http://localhost:5173`.

## Security Notice 🔒
This generator does not save or cache any session files or phone numbers. The sessions are immediately returned to the client and discarded from the server's memory. However, never share your session string with anyone as it grants full access to your Telegram account.

## Contributing 🤝
Contributions are welcome! Please check out [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License 📜
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
