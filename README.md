# 🗳️ SUST Student Election Management System

<div align="center">

**A secure, transparent, hall-restricted, panel-based election system for SUST students**

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Demo](#-demo)

</div>

---

## 📋 Overview

A comprehensive election management system designed specifically for Shahjalal University of Science and Technology (SUST). Supports both hall-specific and university-wide elections with complete transparency and security.

## ✨ Features

### 🔐 Authentication & Security

- **Google OAuth 2.0** with SUST email validation
- **JWT-based** authentication
- **Role-based** access control (Student, Admin)
- Automatic profile extraction from email

### 🗳️ Election Management

- **Two election types**: Hall Elections & Main Elections
- **Hall-restricted voting** for hall-specific positions
- **Panel-based** and independent candidacy
- Complete **audit trail** for transparency

### 👥 User Roles

- **Students**: Vote, apply as candidate, view results
- **Admins**: Create elections, approve candidates, manage system

### 🌐 User Interface

- **Full Bengali** language support
- **Responsive design** (mobile, tablet, desktop)
- Intuitive navigation and real-time updates

## 🚀 Tech Stack

| Layer              | Technology                      |
| ------------------ | ------------------------------- |
| **Frontend**       | React 18, React Router, Axios   |
| **Backend**        | Node.js, Express.js             |
| **Database**       | MongoDB, Mongoose ODM           |
| **Authentication** | Passport.js (Google OAuth), JWT |
| **Styling**        | CSS3                            |

## 📦 Installation

### Prerequisites

- Node.js 16+
- MongoDB
- Google Cloud Console account

### Quick Start

```bash
# 1. Clone repository
git clone <your-repo-url>
cd sust-election-system

# 2. Setup environment variables
# Copy example files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Edit server/.env with your credentials:
# - MongoDB URI
# - Google OAuth credentials
# - JWT secrets
# - Cloudinary credentials

# Edit client/.env if needed (default: http://localhost:5001)

# 3. Install dependencies
npm install              # Root dependencies
cd server && npm install # Server dependencies
cd client && npm install # Client dependencies
cd ../..                 # Back to root

# 4. Start development servers
npm run dev              # Starts both servers concurrently

# OR run separately:
# Terminal 1: cd server && npm run dev
# Terminal 2: cd client && npm run dev
```

### Access Points

- 🌐 Frontend: http://localhost:5173
- 🔧 Backend API: http://localhost:5001

## 📁 Project Structure

```
sust-election-system/
├── 📂 server/                 # Backend
│   ├── 📂 config/            # Configuration
│   ├── 📂 models/            # MongoDB models
│   ├── 📂 routes/            # API endpoints
│   ├── 📂 middleware/        # Auth & validation
│   ├── 📄 .env               # Server environment variables
│   └── 📄 index.js           # Entry point
│
├── 📂 client/                # Frontend
│   ├── 📂 public/
│   ├── 📂 src/
│   │   ├── 📂 components/    # Reusable components
│   │   ├── 📂 context/       # React Context
│   │   ├── 📂 pages/         # Page components
│   │   ├── 📄 App.js
│   │   └── 📄 index.js
│   └── 📄 .env               # Client environment variables
│
├── 📄 .env.example           # Environment setup guide
├── 📄 package.json
└── 📄 README.md
```

## 📚 Documentation

| Document                                     | Description                 |
| -------------------------------------------- | --------------------------- |
| [SETUP.md](SETUP.md)                         | Detailed setup instructions |
| [FEATURES.md](FEATURES.md)                   | Complete feature list       |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | API reference               |
| [DEPLOYMENT.md](DEPLOYMENT.md)               | Production deployment guide |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md)     | Quick commands & tips       |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)     | Project overview            |

## 🎯 Key Workflows

### Student Workflow

1. 🔐 Login with SUST email
2. 👤 Complete profile (select hall)
3. 📋 View available elections
4. 🎯 Apply as candidate (optional)
5. ✅ Cast votes during voting period
6. 📊 View results

### Admin Workflow

1. 🔐 Login with admin credentials
2. ➕ Create election
3. 📝 Define positions and panels
4. ✔️ Review and approve candidates
5. 🎛️ Manage election status
6. 📢 Publish results
7. 📋 Review audit logs

## 🔐 Security Features

- ✅ OAuth 2.0 authentication
- ✅ JWT token-based authorization
- ✅ Role-based access control
- ✅ Hall restriction enforcement
- ✅ Duplicate vote prevention
- ✅ Complete audit logging
- ✅ Input validation & sanitization

## 🎨 Screenshots

### Student Dashboard

View elections, apply as candidate, cast votes

### Admin Dashboard

Manage elections, approve candidates, view audit logs

### Voting Interface

Hall-restricted voting with candidate manifestos

## 🛠️ Development

### Available Scripts

```bash
# Option 1: Run from root (both servers concurrently)
npm run dev              # Start both backend and frontend

# Option 2: Run separately from each folder
cd server && npm run dev # Backend with nodemon (auto-reload)
cd client && npm run dev # Frontend with React dev server

# Production
cd server && npm start   # Backend production mode
cd client && npm run build # Build frontend for production

# Installation
npm install              # Install root dependencies
cd server && npm install # Install server dependencies
cd client && npm install # Install client dependencies
```

### Environment Variables

This project uses separate environment files:

**server/.env** (Backend):

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/sust-election
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**client/.env** (Frontend):

```env
REACT_APP_API_URL=http://localhost:5001
```

## 📊 Database Schema

- **Users**: Authentication, profile, role
- **Elections**: Title, type, dates, status
- **Positions**: Election positions, hall-specific flag
- **Panels**: Political panels
- **Candidates**: Applications, manifestos, status
- **Votes**: Anonymous voting records
- **Audit Logs**: Admin action tracking

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for:

- Heroku
- DigitalOcean/AWS/VPS
- Docker

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

Developed for SUST Student Election Management

## 🙏 Acknowledgments

- SUST for inspiration
- Open source community
- All contributors

## 📞 Support

For issues or questions:

- 📖 Check [documentation](#-documentation)
- 🐛 Open an [issue](../../issues)
- 💬 Contact system administrator

## 🎓 Academic Use

Perfect for:

- Portfolio projects
- CV/Resume
- Learning MERN stack
- Understanding OAuth 2.0
- Database design practice
- Security implementation

---

<div align="center">

**Made with ❤️ for SUST Students**

[⬆ Back to Top](#-sust-student-election-management-system)

</div>
