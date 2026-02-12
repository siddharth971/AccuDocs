# 📄 AccuDocs - Accountant Client Document Management System

AccuDocs is a production-ready document management system designed for accountants to securely manage and share client documents. It features **WhatsApp-based authentication** (via WhatsApp Web.js) and a modern Angular frontend.

## 🔗 Live Demo

- **Backend API**: [https://accudocs.onrender.com](https://accudocs.onrender.com)
- **API Documentation**: [https://accudocs.onrender.com/api-docs](https://accudocs.onrender.com/api-docs)
- **Frontend**: [https://siddharth971.github.io/AccuDocs/](https://siddharth971.github.io/AccuDocs/) (Live)

---

## 🚀 Key Features

- **WhatsApp Authentication**: Login via OTP sent securely to your WhatsApp (No Twilio costs!).
- **Admin Dashboard**: Comprehensive panel for managing clients, folders, and documents.
- **Secure Storage**: Files are stored in **AWS S3** with encryption.
- **Role-Based Access**: Granular permissions for Admins and Clients.
- **Audit Logs**: Track every action for compliance.
- **Responsive UI**: Built with Angular 17 and TailwindCSS/Material.

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js 20+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (Production) / SQLite (Local/Dev)
- **ORM**: Sequelize
- **WhatsApp**: `whatsapp-web.js` (running with Puppeteer)
- **Storage**: AWS S3
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI

### Frontend

- **Framework**: Angular 17
- **Styling**: TailwindCSS + Angular Material
- **State Management**: Signals & RxJS
- **HTTP**: Axios & Angular HttpClient

### DevOps

- **Deployment**: Render (Docker)
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions

---

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or v20 recommended)
- Docker (optional, for containerized run)
- PostgreSQL (or use embedded SQLite for local dev)

### 1️⃣ Backend Setup

```bash
# Clone the repository
git clone https://github.com/siddharth971/AccuDocs.git
cd AccuDocs/backend

# Install dependencies
npm install

# Configure Environment
cp .env.example .env
# Edit .env and set your secrets (AWS, JWT, etc.)

# Run Locally (uses SQLite by default)
npm run dev
```

### 2️⃣ Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Run Locally
npm start
```

Access the frontend at `http://localhost:4200`.

---

## 🐳 Docker Deployment

You can run the entire stack using Docker Compose:

```bash
docker-compose up -d --build
```

---

## 🔐 Security Features

- **JWT Authentication**: Secure access and refresh (7 days) tokens.
- **Rate Limiting**: Protects against brute-force attacks.
- **Input Validation**: Strict Zod schemas for all API inputs.
- **Helmet.js**: Sets secure HTTP headers.
- **CORS Config**: Restricted to trusted domains.

## 📚 API Documentation

Full API documentation is available via Swagger UI.

- **Local**: `http://localhost:3000/api-docs`
- **Production**: `https://accudocs.onrender.com/api-docs`

---

## 📧 Support

For support or modifications, please contact the development team.
