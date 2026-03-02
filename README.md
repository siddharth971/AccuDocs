# 📄 AccuDocs - Intelligent Document Management System

[![GitHub](https://img.shields.io/badge/GitHub-siddharth971-blue)](https://github.com/siddharth971/AccuDocs)
[![Backend API](https://img.shields.io/badge/Backend%20API-Live-brightgreen)](https://accudocs.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 🎯 Executive Summary

**AccuDocs** is a production-ready, cloud-based Revenue Management & Document System designed specifically for Chartered Accountants (CA) and tax consultant firms in India. It streamlines GST-compliant invoicing, recurring billing, risk-predictive collections, and secure document sharing with **WhatsApp automation**. AccuDocs is built to replace manual Tally billing and Excel trackers, reducing collection times and scaling smoothly to 10,000+ firms.

### Core Value Proposition

- **Automated Invoicing & GST Engine** computing state-specific taxes seamlessly
- **Intelligent Recurring Billing** for monthly/yearly retainers
- **Predictive Risk Scoring** for proactive payment collection
- **WhatsApp Engine** for instant document and reminder delivery
- **Centralized Cloud Hub** for enforcing Client → Year → Category structure
- **Enterprise-Grade Security** with strict RBAC and immutable audit logs

---

## 🚀 Key Features

### 1. **Revenue Management & GST Calculation**

- ✅ State-aware automated GST (IGST/CGST/SGST) splits
- ✅ Pro-rata credit note generation and adjustments
- ✅ FIFO-based advance payment auto-allocations
- ✅ Professional PDF generation via PDFKit

### 2. **WhatsApp Automation & Reminders**

- ✅ Automated Invoice PDF delivery via WhatsApp
- ✅ Scheduled overdue payment reminders (1-day, 7-day, critical)
- ✅ Automated "Payment Received" acknowledgement receipts
- ✅ WhatsApp Web.js automation for document delivery

### 2. **Admin Dashboard**

### 3. **Intelligence & Predictive Collections**

- 📊 **Risk Scoring Logic (0-100)**: Grades clients based on historical delays
- 📉 Real-time revenue pipeline forecasting via scheduled billing patterns
- ⚠️ Advance expiry warnings and predictive alerts for missed deadlines
- 📈 Comprehensive organizational finance dashboards

### 4. **Automated Recurring Billing**

- 🔄 Auto-creation of standard retainer invoices (Monthly/Quarterly/Yearly)
- ⚙️ Intelligent state-machine transitions (Draft → Issued → Overdue)
- ⏰ Node-cron triggers running background tasks for collection queues

### 3. **Secure File Storage**

- 🔐 AWS S3 integration with encryption
- 📦 Multi-file upload capability
- 📥 Batch download with ZIP compression
- 🔒 Secure pre-signed URLs for file access
- ⏰ File expiration and lifecycle management

### 4. **Role-Based Access Control (RBAC)**

- 👨‍💼 **Admin Role**: Full system access, user management, compliance oversight
- 👤 **Client Role**: Access to own documents and folders only
- 📋 **Staff Role**: Limited access based on assigned clients
- 🔐 **Granular Permissions**: Assign specific document/folder access

### 5. **Audit & Compliance**

- 📝 Immutable audit logs middleware covering all mutating events
- 🔍 Exact timeline tracking for entity creation/updates
- ✅ Adherence to standard Indian tax compliance mandates
- 🔐 Complete Database row-level isolation per firm (Organization ID logic)

### 6. **Client Management (CRM)**

- 📇 Client profiles with metadata
- 📅 Deadline tracking and notifications
- 📋 Checklist templates for compliance tasks
- 📈 Client portfolio management
- 🏷️ Auto-tagging with client metadata

### 7. **Document Versioning**

- 🔄 Document version history
- 🕐 Last modified tracking
- 📌 Version comparison and rollback
- 💬 Comment and annotation support

### 8. **Responsive User Interface**

- 📱 Mobile-friendly design
- 🎨 Dark mode and light mode themes
- ⚡ Real-time updates with WebSockets
- 🖱️ Intuitive drag-and-drop interface
- ♿ Accessibility-first design

---

## 🛠️ Technology Stack

### Backend Architecture

| Component            | Technology          | Details                                   |
| -------------------- | ------------------- | ----------------------------------------- |
| **Runtime**          | Node.js 20+         | Async, event-driven architecture          |
| **Framework**        | Express.js          | Lightweight web framework with TypeScript |
| **Language**         | TypeScript          | Type-safe development                     |
| **Database**         | PostgreSQL / SQLite | Production: PostgreSQL, Local: SQLite     |
| **ORM**              | Sequelize           | SQL query builder with TypeScript support |
| **WhatsApp Engine**  | WhatsApp-Web/Twilio | Omnichannel message delivery systems      |
| **Storage**          | AWS S3              | Cloud object storage with CDN support     |
| **PDF Engine**       | PDFKit              | On-the-fly highly structured invoice gen  |
| **Cache**            | Redis               | In-memory data store for sessions         |
| **Validation**       | Zod                 | Runtime type validation                   |
| **Security**         | bcryptjs, JWT       | Password hashing and authentication       |
| **API Docs**         | Swagger/OpenAPI     | Interactive API documentation             |
| **Logging**          | Winston + Custom ID | Immutable DB audit trails + log rotation  |
| **Cron Jobs**        | node-cron           | Master daemon for automated pipelines     |
| **Real-time**        | Socket.io           | WebSocket communication                   |
| **Rate Limiting**    | express-rate-limit  | Endpoint DDOS resilience / Throttling     |
| **Security Headers** | Helmet              | HTTP security headers                     |

### Frontend Stack

| Component            | Technology                     | Details                     |
| -------------------- | ------------------------------ | --------------------------- |
| **Framework**        | Angular 17+                    | Modern frontend framework   |
| **Language**         | TypeScript                     | Type-safe client-side code  |
| **Styling**          | TailwindCSS + Angular Material | Utility-first CSS framework |
| **State Management** | Signals & RxJS                 | Reactive programming        |
| **HTTP Client**      | Axios & HttpClient             | API communication           |
| **Icons**            | Heroicons                      | Beautiful icon library      |
| **Data Tables**      | ngx-datatable                  | Advanced table component    |
| **Notifications**    | ngneat/hot-toast               | Toast notifications         |
| **Routing**          | Angular Router                 | Client-side routing         |

### DevOps & Deployment

| Component            | Technology     | Details                          |
| -------------------- | -------------- | -------------------------------- |
| **Containerization** | Docker         | Microservices containerization   |
| **Orchestration**    | Docker Compose | Multi-container management       |
| **Deployment**       | Render         | Cloud hosting platform           |
| **CI/CD**            | GitHub Actions | Automated testing and deployment |
| **Process Manager**  | PM2            | Production process management    |

---

## 📋 Project Structure

```
AccuDocs/
├── backend/                          # Node.js/Express API
│   ├── src/
│   │   ├── app.ts                   # Express app configuration
│   │   ├── server.ts                # Server entry point
│   │   ├── config/                  # Configuration files
│   │   │   ├── database.config.ts
│   │   │   ├── env.config.ts
│   │   │   ├── redis.config.ts
│   │   │   ├── s3.config.ts
│   │   │   └── scheduler.ts
│   │   ├── controllers/             # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── document.controller.ts
│   │   │   ├── client.controller.ts
│   │   │   ├── upload.controller.ts
│   │   │   └── ...
│   │   ├── services/                # Business logic
│   │   ├── repositories/            # Data access layer
│   │   ├── models/                  # Database models
│   │   ├── middlewares/             # Express middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── rateLimit.middleware.ts
│   │   │   └── validate.middleware.ts
│   │   ├── routes/                  # API route definitions
│   │   ├── modules/                 # Feature modules
│   │   │   ├── auth/
│   │   │   ├── client/
│   │   │   ├── notification/
│   │   │   └── user/
│   │   ├── utils/                   # Utility functions
│   │   ├── shared/                  # Shared types/constants
│   │   └── main/
│   │       └── container.ts         # Dependency injection
│   ├── tests/                       # Jest test files
│   ├── scripts/                     # Utility scripts
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── ecosystem.config.js          # PM2 config
│   └── Dockerfile
│
├── frontend/                        # Angular application
│   ├── src/
│   │   ├── index.html
│   │   ├── main.ts
│   │   ├── styles.scss
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   ├── pipes/
│   │   │   └── app.config.ts
│   │   └── environments/
│   ├── package.json
│   ├── angular.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── DESIGN_SYSTEM.md
│   └── Dockerfile
│
├── database/
│   └── schema.sql                   # Database schema
│
├── docs/
│   ├── architecture/
│   │   └── database-design.md       # Database design documentation
│   └── ...
│
├── nginx/
│   └── nginx.conf                   # Nginx reverse proxy config
│
├── docker-compose.yml               # Multi-container setup
├── README.md                        # Quick start guide
├── PROJECT_PITCH.md                 # Business case
├── PROJECT_BENEFITS.md              # ROI and benefits
├── SECURITY.md                      # Security policy
└── start-local.bat                  # Windows startup script
```

---

## 🌍 Live Environment

| Service               | URL                                                                                  | Status  |
| --------------------- | ------------------------------------------------------------------------------------ | ------- |
| **Backend API**       | [https://accudocs.onrender.com](https://accudocs.onrender.com)                       | ✅ Live |
| **API Documentation** | [https://accudocs.onrender.com/api-docs](https://accudocs.onrender.com/api-docs)     | ✅ Live |
| **Frontend**          | [https://siddharth971.github.io/AccuDocs/](https://siddharth971.github.io/AccuDocs/) | ✅ Live |

---

## 💼 Business Benefits

### 1. **Eliminates "The Search Hunt" (Time Saver)**

- **Before**: Finding "Client's 2023 ITR" takes 5-10 minutes
- **After**: Retrieval time drops from 10 minutes to **5 seconds**
- **Impact**: Staff saves ~2 hours daily per person

### 2. **WhatsApp Automation (Productivity Multiplier)**

- **Before**: 7-step manual process to send documents via WhatsApp
- **After**: One-click "Send to WhatsApp" button
- **Impact**: Staff can handle **3x more** client requests per day

### 3. **Data Security (Risk Mitigation)**

- **Before**: Employees copy files to personal phones, creating data leak risk
- **After**: Server-side WhatsApp integration with zero file exposure
- **Impact**: **100% control** over client data ownership

### 4. **Version Control (Accuracy)**

- **Before**: Confusion between `Final.pdf`, `Final_v2.pdf`, `Final_Print.pdf`
- **After**: Clear version history with timestamps
- **Impact**: Never send wrong/outdated documents to clients

### 5. **Predictive Payments (Cash Flow)**

- **Before**: Unpredictable cash collections and high unbilled ledgers
- **After**: AI scoring uncovers bad payment behaviors automatically
- **Impact**: Massive reductions in Days Sales Outstanding (DSO)

### 6. **Audit Readiness (Compliance)**

- **Automated audit trails** for every action via Immutable Middlewares
- **Compliance-ready reports** enforcing organizational bounds
- **Eliminates days of panic** during audits

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or v20+ (recommended)
- **Docker**: Optional, for containerized deployment
- **PostgreSQL**: For production (SQLite for local development)
- **AWS Account**: For S3 storage (optional for local dev)
- **WhatsApp Account**: For WhatsApp automation testing

### 1️⃣ Clone Repository

```bash
git clone https://github.com/siddharth971/AccuDocs.git
cd AccuDocs
```

### 2️⃣ Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file from template
cp .env.example .env

# Edit .env with your configuration
# Required: JWT_SECRET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, etc.

# Run in development mode (uses SQLite)
npm run dev

# Backend will start at http://localhost:5000
```

### 3️⃣ Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm start

# Frontend will be available at http://localhost:4200
```

### 4️⃣ Run with Docker Compose

```bash
# From project root
docker-compose up -d --build

# Services will be available at:
# - Backend: http://localhost:5000
# - Frontend: http://localhost:80
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

### 5️⃣ Database Setup

```bash
# Optionally run migrations (if available)
cd backend
npm run migrate

# Seed with sample data (if needed)
npm run seed
```

---

## 📚 API Documentation

An interactive Swagger documentation is available at:

```
http://localhost:5000/api-docs
```

Common API endpoints include:

- `POST /api/auth/login` - WhatsApp login
- `POST /api/auth/verify-otp` - OTP verification
- `GET /api/clients` - List all clients
- `POST /api/documents/upload` - Upload document
- `POST /api/documents/:id/send-whatsapp` - Send via WhatsApp
- `GET /api/documents/:id` - Get document details

---

## 🏗️ Architecture Overview

### Layered Architecture

```
┌─────────────────────────┐
│   Angular Frontend      │
│ (UI Components, Forms)  │
└────────────┬────────────┘
             │ HTTP/REST
┌────────────▼────────────┐
│  Express.js API Server  │
│  (Controllers, Routes)  │
├────────────────────────┤
│   Service Layer        │
│  (Business Logic)      │
├────────────────────────┤
│ Repository Pattern     │
│  (Data Access)         │
├────────────────────────┤
│   PostgreSQL + Redis   │
│   AWS S3 Storage       │
└────────────────────────┘
```

### Key Design Patterns

- **MVC Architecture**: Separation of controllers, services, and repositories
- **Repository Pattern**: Data access abstraction
- **Dependency Injection**: Using tsyringe for IoC container
- **Middleware Pipeline**: Authentication, validation, error handling
- **JWT-Based Auth**: Stateless authentication
- **RESTful API**: Standard HTTP methods and status codes

---

## 🔐 Security Features

### Authentication & Authorization

- ✅ WhatsApp-based OTP authentication
- ✅ JWT token-based sessions
- ✅ Role-Based Access Control (RBAC)
- ✅ Password hashing with bcryptjs
- ✅ Rate limiting on sensitive endpoints

### Data Protection

- ✅ HTTPS/TLS encryption in transit
- ✅ Encrypted storage in S3
- ✅ Database encryption at rest
- ✅ Pre-signed URLs with expiration
- ✅ CORS protection and CSRF tokens

### Compliance & Audit

- ✅ Complete audit logging
- ✅ GDPR compliance considerations
- ✅ Data retention policies
- ✅ Security headers (Helmet.js)
- ✅ Input validation and sanitization (Zod)

### Reporting Vulnerabilities

See [SECURITY.md](SECURITY.md) for vulnerability reporting guidelines.

---

## 📦 Deployment

### Development Environment

```bash
npm run dev           # Backend
npm start             # Frontend
```

### Production Deployment

#### Option 1: Render (Recommended)

- Connected to GitHub repository
- Automatic deployments on push
- Environment variables configured in dashboard
- See current live instance: [accudocs.onrender.com](https://accudocs.onrender.com)

#### Option 2: Docker

```bash
# Build images
docker build -t accudocs-backend ./backend
docker build -t accudocs-frontend ./frontend

# Run with compose
docker-compose -f docker-compose.yml up -d
```

#### Option 3: Traditional Server (PM2)

```bash
# Build backend
cd backend
npm run build

# Start with PM2
npm run start:prod    # Uses ecosystem.config.js
```

### Environment Variables

Create `.env` file in backend directory:

```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/accudocs
DATABASE_DIALECT=postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRY=7d

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=bucket-name

# Redis
REDIS_URL=redis://localhost:6379

# WhatsApp
WHATSAPP_PHONE_NUMBER=your-phone-number

# Frontend URL
FRONTEND_URL=http://localhost:4200

# Server
PORT=5000
NODE_ENV=development
```

---

## 🧪 Testing

### Run Backend Tests

```bash
cd backend
npm test
npm test -- --coverage
```

### Run Frontend Tests

```bash
cd frontend
npm test
```

### Integration Tests

```bash
cd backend
npm run test:integration
```

---

## 📊 Performance Metrics

- **API Response Time**: < 200ms (average)
- **Database Query Optimization**: Indexed key columns
- **Concurrent Users**: Supports 1000+ simultaneous connections
- **File Upload**: Supports files up to 5GB via S3
- **Caching**: Redis for session and frequently accessed data
- **CDN**: S3 CloudFront integration for fast file delivery

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation

---

## 📝 License

This project is licensed under the **MIT License** - see LICENSE file for details.

---

## 🆘 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/siddharth971/AccuDocs/issues)
- **Discussions**: [GitHub Discussions](https://github.com/siddharth971/AccuDocs/discussions)
- **Email**: support@accudocs.example.com
- **Documentation**: Check [docs/](docs/) folder

---

## 🎯 Roadmap

### v1.1 (Q2 2026)

- [ ] Advanced document OCR
- [ ] AI-powered document categorization
- [ ] Custom workflow automation
- [ ] Multi-language support

### v1.2 (Q3 2026)

- [ ] Mobile app (iOS & Android)
- [ ] Advanced analytics dashboard
- [ ] Integration with accounting software
- [ ] Email automation

### v2.0 (Q4 2026)

- [ ] AI-powered insights and recommendations
- [ ] Advanced compliance reporting
- [ ] API marketplace
- [ ] White-label solution

---

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by Google Drive and Dropbox
- Community feedback and contributions
- Open-source libraries and frameworks

---

**Last Updated**: February 27, 2026

Made with ❤️ by Siddharth
