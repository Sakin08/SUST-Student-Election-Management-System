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

- **Google OAuth 2.0** with SUST email validation (@student.sust.edu)
- **JWT-based** authentication with secure token management
- **Role-based** access control (Student, Admin, Super Admin)
- Automatic profile extraction from email
- Session management with secure cookies
- Password-less authentication

### 🗳️ Election Management

#### Election Types

- **Main Elections**: University-wide student council elections
- **Hall Elections**: Hall-specific council elections with hall restrictions
- **Society Elections**: Department-specific society elections
- **CR Elections**: Class Representative elections by department and batch

#### Election Features

- **Multi-position elections**: Create multiple positions in one election
- **Panel-based candidacy**: Support for political panels with logos and descriptions
- **Independent candidacy**: Students can run without panel affiliation
- **Application fees**: Optional payment integration for candidate applications
- **Voting time restrictions**: Set specific voting hours (HH:MM format)
- **Real-time countdown**: Live countdown timer during voting period
- **Voter eligibility management**: Upload and manage eligible voter lists
- **Hall-based filtering**: Automatic filtering of positions and candidates by hall

### 👥 User Roles & Permissions

#### Students

- ✅ View eligible elections based on hall/department/batch
- ✅ Apply as candidate with manifesto and photo
- ✅ Upload candidate photo (Cloudinary integration)
- ✅ Pay application fees via SSLCommerz (if required)
- ✅ Cast votes during voting period
- ✅ View election results and statistics
- ✅ Track application status
- ✅ Delete applications from completed elections
- ✅ Update profile with hall selection
- ❌ Cannot vote in elections they're not eligible for
- ❌ Cannot apply for multiple positions in same election

#### Admins

- ✅ Create and manage all types of elections
- ✅ Define positions with hall/department/batch restrictions
- ✅ Create and manage panels
- ✅ Approve or reject candidate applications
- ✅ Manage voter eligibility lists (CSV upload)
- ✅ Change election status (Created → Candidate Finalized → Voting → Completed)
- ✅ Set voting time windows
- ✅ View all elections without filtering
- ✅ Access audit logs for transparency
- ✅ View candidate details and manifestos
- ❌ Cannot vote in any election
- ❌ Cannot edit or delete elections (Super Admin only)

#### Super Admins

- ✅ All admin permissions
- ✅ **Edit election details** (title, dates, fees, type)
- ✅ **Delete elections** completely
- ✅ Full system control
- ❌ Cannot vote in any election

### 🎨 User Interface

- **Full Bengali (বাংলা) language support** throughout the system
- **Modern, responsive design** with Tailwind CSS
- **Gradient-based color schemes** for better visual hierarchy
- **Real-time updates** and live status indicators
- **Progress tracking** during voting
- **Animated transitions** with Framer Motion
- **Mobile-first approach** (works on all devices)
- **Intuitive navigation** with persistent tab states
- **Profile photo display** in navbar
- **Status badges** with color coding
- **Empty states** with helpful messages
- **Loading states** for better UX

### 📊 Voting System

- **Secret ballot**: Anonymous voting with no vote tracking to voters
- **One vote per position**: Prevents duplicate voting
- **Real-time vote counting**: Instant result calculation
- **Voting time enforcement**: Automatic time window validation
- **Progress tracking**: Shows completed vs remaining positions
- **Candidate details modal**: View full manifesto before voting
- **Vote confirmation**: Clear feedback after successful vote
- **Eligibility checks**: Multiple layers of voter validation
- **Hall-based restrictions**: Automatic filtering for hall elections

### 📈 Results & Analytics

- **Real-time results**: Instant calculation after voting ends
- **Winner determination**: Automatic winner identification (handles ties)
- **Vote percentage**: Shows vote distribution
- **Ranking system**: Candidates ranked by vote count
- **PDF export**: Download results with Bangla support (optimized file size)
- **Visual presentation**: Color-coded winner highlighting
- **Candidate photos**: Display in results
- **Panel information**: Show panel affiliation in results

### 💳 Payment Integration

- **SSLCommerz integration**: Secure payment gateway for Bangladesh
- **Application fee collection**: Optional fees for candidate applications
- **Payment verification**: Automatic payment status checking
- **Payment history**: Track all transactions
- **Auto-submission**: Automatic application submission after successful payment
- **Payment recovery**: Resume application after payment completion

### 📸 Media Management

- **Cloudinary integration**: Cloud-based image storage
- **Candidate photo upload**: Support for candidate profile pictures
- **Image optimization**: Automatic compression and resizing
- **Secure URLs**: CDN-delivered images
- **Profile photos**: User profile picture support

### 🔍 Admin Tools

- **Comprehensive dashboard**: 4-tab interface (Elections, Candidates, Voters, Audit)
- **Tab persistence**: URL-based tab state (survives page refresh)
- **Candidate approval workflow**: Review and approve/reject applications
- **Voter management**: Upload CSV, add individual voters, bulk operations
- **Audit logging**: Complete action history with timestamps
- **Election editing**: Modify election details (Super Admin only)
- **Status management**: Control election lifecycle
- **Voting time setup**: Configure voting windows

### 📋 Audit & Transparency

- **Complete audit trail**: All admin actions logged
- **Timestamped records**: When and who performed actions
- **Action details**: What was changed
- **Election-specific logs**: Filter by election
- **Admin identification**: Track which admin made changes
- **Immutable logs**: Cannot be deleted or modified

### 🛡️ Security Features

- ✅ OAuth 2.0 authentication
- ✅ JWT token-based authorization
- ✅ Role-based access control (RBAC)
- ✅ Hall/department/batch restriction enforcement
- ✅ Duplicate vote prevention
- ✅ Admin voting prevention
- ✅ Complete audit logging
- ✅ Input validation & sanitization
- ✅ Secure file uploads
- ✅ Payment verification
- ✅ Session management
- ✅ CORS protection
- ✅ Environment variable security

### 🎯 Additional Features

- **Candidate profile page**: View all applications with status
- **Application deletion**: Remove applications from completed elections
- **Election details page**: Comprehensive election information
- **Countdown timers**: Real-time countdown to voting end
- **Status indicators**: Visual election status badges
- **Responsive cards**: Modern card-based UI with gradients
- **Search and filter**: Easy navigation through elections
- **Error handling**: User-friendly error messages in Bangla
- **Loading states**: Smooth loading animations
- **Empty states**: Helpful messages when no data available

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
