# AccuDocs - Accountant Client Document Management System

A production-ready document management system with WhatsApp-based authentication, designed for accountants to securely manage and share client documents.

## 🚀 Features

- **WhatsApp Authentication**: OTP-based login via WhatsApp for clients
- **Admin Dashboard**: Comprehensive admin panel for managing clients and documents
- **Secure Document Storage**: Files stored in AWS S3 with AES-256 encryption
- **Role-Based Access Control**: Admin and client roles with appropriate permissions
- **Real-time Audit Logs**: Complete activity tracking for compliance
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode Support**: User-preferred theme support

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Angular SPA   │────▶│  Express API    │────▶│     MySQL       │
│   (Frontend)    │     │   (Backend)     │     │   (Database)    │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
              ┌─────────┐  ┌─────────┐  ┌─────────┐
              │  Redis  │  │  AWS S3 │  │  Twilio │
              │ (Cache) │  │ (Files) │  │(WhatsApp)│
              └─────────┘  └─────────┘  └─────────┘
```

## 📁 Project Structure

```
AccuDocs/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route handlers
│   │   ├── middlewares/    # Express middleware
│   │   ├── models/         # Sequelize models
│   │   ├── repositories/   # Data access layer
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                # Angular 17 SPA
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/       # Services, guards, interceptors
│   │   │   ├── features/   # Feature modules
│   │   │   └── shared/     # Shared components
│   │   ├── environments/
│   │   └── styles.scss
│   ├── Dockerfile
│   └── package.json
│
├── database/
│   └── schema.sql          # MySQL schema
│
├── nginx/
│   └── nginx.conf          # Nginx configuration
│
└── docker-compose.yml      # Docker orchestration
```

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL 8.0 with Sequelize ORM
- **Cache**: Redis
- **Storage**: AWS S3
- **Authentication**: JWT + OTP (via Twilio WhatsApp)
- **Validation**: Zod
- **Logging**: Winston

### Frontend

- **Framework**: Angular 17
- **UI Library**: Angular Material
- **State Management**: Angular Signals
- **Styling**: SCSS with custom theming
- **HTTP**: Angular HttpClient with interceptors

### DevOps

- **Containerization**: Docker
- **Reverse Proxy**: Nginx
- **Process Manager**: PM2
- **CI/CD**: GitHub Actions (optional)

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- Redis
- AWS S3 bucket
- Twilio account with WhatsApp enabled

### Environment Setup

1. Clone the repository:

```bash
git clone https://github.com/your-org/accudocs.git
cd accudocs
```

2. Backend setup:

```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```

3. Frontend setup:

```bash
cd frontend
npm install
npm start
```

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔐 Security Features

- **JWT Authentication** with access/refresh tokens
- **AES-256-GCM Encryption** for sensitive data
- **Rate Limiting** on authentication endpoints
- **CSRF Protection** via SameSite cookies
- **Helmet.js** security headers
- **Input Validation** with Zod schemas
- **SQL Injection Protection** via Sequelize ORM
- **XSS Protection** via Content Security Policy

## 📚 API Documentation

API documentation is available at `/api-docs` when running the backend server.

### Key Endpoints

| Method | Endpoint                | Description          |
| ------ | ----------------------- | -------------------- |
| POST   | /auth/send-otp          | Send OTP to mobile   |
| POST   | /auth/verify-otp        | Verify OTP and login |
| POST   | /auth/admin-login       | Admin password login |
| GET    | /clients                | List all clients     |
| POST   | /clients                | Create new client    |
| POST   | /documents/upload       | Upload document      |
| GET    | /documents/:id/download | Get download URL     |
| GET    | /logs                   | Get audit logs       |

## 🔧 Configuration

### Environment Variables

| Variable           | Description                          |
| ------------------ | ------------------------------------ |
| NODE_ENV           | Environment (development/production) |
| PORT               | Server port (default: 3000)          |
| DB_HOST            | MySQL host                           |
| DB_NAME            | Database name                        |
| REDIS_HOST         | Redis host                           |
| JWT_SECRET         | JWT signing secret                   |
| AWS_S3_BUCKET      | S3 bucket name                       |
| TWILIO_ACCOUNT_SID | Twilio account SID                   |

See `.env.example` for the complete list.

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

For support, email support@accudocs.example.com
