# RFP Agent
Agentic AI RFP automation system built for EY Techathon 6.0 with Master Agent + 5 Worker Agents architecture.

## Features
- **Portal Discovery**: Automated RFP scanning from tender portals
- **Product Matching**: AI-powered Spec Match percentages
- **Cost Calculation**: Complete pricing with testing fees and contingency
- **Proposal Generation**: Professional PDF proposals
- **Multi-Agent System**: Sales, Master, Technical, Pricing, and Proposal Generator agents

## Tech Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS v4
- **Backend**: Node.js, Express.js, MongoDB
- **Python Service**: FastAPI, PyPDF2, Spacy
- **Authentication**: JWT
- **File Processing**: Camelot, OCR

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB

### Installation

**Backend Setup**
```bash
cd backend
npm install
npm start
```

**Python Service Setup**
```bash
cd python-service
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python -m uvicorn app:app --reload --port 8001
```

**Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`

## Environment Variables

**Backend (.env)**
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PYTHON_SERVICE_URL=http://localhost:8001
NODE_ENV=development
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## API Endpoints
- **Auth**: `/api/auth/signup`, `/api/auth/login`
- **RFP**: `/api/rfp/upload`, `/api/rfp/list`
- **Products**: `/api/product/list`, `/api/product/match`
- **Dashboard**: `/api/dashboard/calculate-price`, `/api/dashboard/create-proposal`

## Deployment

**Render (Backend & Python)**
1. Create Web Service
2. Set Root Directory: `backend` or `python-service`
3. Add environment variables
4. Deploy

**Vercel (Frontend)**
1. Import repository
2. Set Root Directory: `frontend`
3. Add `NEXT_PUBLIC_API_URL`
4. Deploy

## Project Structure
```
├── frontend/          # Next.js app
├── backend/           # Express.js API
├── python-service/    # FastAPI PDF processing
└── README.md
```

Built for EY Techathon 6.0 - Problem Statement 4
