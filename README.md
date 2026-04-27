# VitalMind - AI Health Assistant 🏥

VitalMind is a premium, AI-powered health assistant designed to provide accurate, empathetic, and professional medical guidance. Built with a modern tech stack involving RAG (Retrieval-Augmented Generation) and advanced LLMs, VitalMind helps users understand symptoms, treatments, and wellness while ensuring medical safety protocols.


<p align="center">
  <img src="https://github.com/user-attachments/assets/7ada4bc4-dc5f-401c-846a-59471ddc9eb8" width="600" alt="VitalMind Logo">
</p>


## 🔗 Live Demo
[https://vitalmind-xi.vercel.app](https://vitalmind-xi.vercel.app)

## ✨ Features

- **🧠 Intelligent Diagnosis**: Advanced AI chatbot for medical guidance on symptoms and wellness.
- **📄 Report Analysis (RAG)**: Upload medical documents for AI-powered context-aware analysis using Pinecone vector storage.
- **📸 Medicine Identification**: Upload images of medicine for AI-assisted identification and information.
- **🛡️ Safety Protocols**: Built-in medical safety engine to block harmful or out-of-scope requests.
- **🌟 Premium UI**: Stunning dark-mode interface with glassmorphism, GSAP animations, and Lucide React icons.
- **🔐 Secure Auth**: Full authentication system with JWT and secure password hashing.

## 🚀 Tech Stack

### Frontend
- **React 18** (Vite)
- **GSAP** (Smooth animations)
- **Lucide React** (Modern iconography)
- **Vanilla CSS** (Custom, premium styling)

### Backend
- **Node.js & Express**
- **MongoDB** (User and Chat persistence)
- **LangChain** (AI orchestration)
- **Groq (Llama 3.1)** (High-speed LLM)
- **Pinecone** (Vector database for RAG)
- **HuggingFace Transformers** (Local embeddings)
- **Cloudinary** (Image management)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Groq API Key
- Pinecone API Key
- Cloudinary account

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/vitalmind.git
cd vitalmind
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name
TAVILY_API_KEY=your_tavily_key
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL=your_backend_api_url
```

Start the frontend:
```bash
npm run dev
```

## 📂 Project Structure

```text
vitalmind/
├── backend/
│   ├── config/         # DB and Cloudinary config
│   ├── controllers/    # Route logic
│   ├── middleware/     # Auth and Safety
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   ├── utils/          # AI Agent and RAG logic
│   └── index.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Auth and State management
│   │   ├── pages/      # Main views (Chat, Home, etc.)
│   │   ├── utils/      # API helpers
│   │   └── App.jsx
└── README.md
```

## ⚠️ Disclaimer

VitalMind is an AI health assistant and is **not** a replacement for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. In case of emergency, contact your local emergency services immediately.


