<div align="center">

# 🗂️ Team Task Manager

### A full-stack project management system with role-based access, milestone tracking, and real-time progress monitoring.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Railway](https://img.shields.io/badge/Deployed_on-Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)](https://railway.app/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)

---

[✨ Features](#-features) • [🏗️ Architecture](#%EF%B8%8F-architecture) • [🚀 Quick Start](#-quick-start) • [📡 API Reference](#-api-reference) • [🗄️ Database Schema](#%EF%B8%8F-database-schema) • [☁️ Deployment](#%EF%B8%8F-deployment)

</div>

---

## 📌 Overview

**Team Task Manager** is a production-ready, full-stack web application designed to help teams collaborate efficiently. It provides a clean separation between **Admin** and **Member** roles — admins create projects, assign tasks, and track team performance, while members focus on updating milestone progress through an intuitive drag slider interface.

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with bcrypt password hashing
- Token persistence via `localStorage` with auto-logout on expiry (401 handling)
- Protected routes with role-based access control (RBAC)

### 👑 Admin Capabilities
| Feature | Description |
|--------|-------------|
| Project Management | Create, view, and delete projects (cascade deletes tasks) |
| Task Creation | Create tasks with title, description, due date, and multiple milestones |
| Team Assignment | Assign tasks to specific team members |
| Dashboard | View statistics: total members, tasks, in-progress, and overdue |
| Performance Tracking | Monitor each member's overall progress and milestone counts |

### 👤 Member Capabilities
| Feature | Description |
|--------|-------------|
| Task View | See only tasks assigned to them |
| Milestone Progress | Update progress via drag slider (0–100%) |
| Personal Dashboard | View active tasks, completed milestones, and overall progress % |

### 📊 Milestone Tracking (Core Feature)
Progress can be updated through:
- 🎚️ **Draggable slider** (range input, 0–100)
- 🔢 **Number input** with +/– controls
- ⚡ **Quick action buttons** — `0%` `25%` `50%` `75%` `100%`

| Progress | Status | Color |
|----------|--------|-------|
| `0%` | Not Done | 🔘 Gray |
| `1–99%` | Working | 🟡 Yellow/Orange |
| `100%` | Completed | 🟢 Green |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 18)                  │
│  React Bootstrap · Axios · Context API · React Hot Toast    │
└───────────────────────────┬─────────────────────────────────┘
                            │  REST API (JSON)
┌───────────────────────────▼─────────────────────────────────┐
│                     BACKEND (FastAPI)                       │
│         JWT Auth · Pydantic Validation · SQLAlchemy ORM     │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    DATABASE (PostgreSQL)                     │
│              users · projects · tasks · milestones          │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Backend | FastAPI (Python 3.11) | Auto docs, Pydantic validation, async support |
| Database | PostgreSQL + SQLAlchemy | Production-ready, concurrent connections |
| Auth | JWT + bcrypt | Stateless, scalable, REST-friendly |
| Frontend | React 18 + Hooks | Component reuse, large ecosystem |
| UI | React Bootstrap 5 | Rapid prototyping, consistent design |
| HTTP | Axios with interceptors | Centralized error handling |
| Deploy | Railway.app | Free PostgreSQL tier, GitHub auto-deploy |

---

## 📁 Project Structure

<details>
<summary><b>🖥️ Backend</b></summary>

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # Database connection
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # JWT authentication
│   ├── dependencies.py      # FastAPI dependencies
│   └── routers/
│       ├── auth.py          # Auth endpoints
│       ├── projects.py      # Project endpoints
│       ├── tasks.py         # Task endpoints
│       └── members.py       # Member endpoints
├── requirements.txt
├── Procfile                 # Railway start command
├── runtime.txt              # Python version
└── .env
```

</details>

<details>
<summary><b>🌐 Frontend</b></summary>

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── LoadingSpinner.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── MemberDashboard.jsx
│   │   ├── Projects.jsx
│   │   ├── ProjectDetails.jsx
│   │   ├── Members.jsx
│   │   ├── MyTasks.jsx
│   │   └── TaskDetails.jsx
│   ├── services/
│   │   └── api.js           # Axios configuration
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication state
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
└── .env.production
```

</details>

---

## 🚀 Quick Start

### Prerequisites
- Python `3.11+`
- Node.js `18+`
- PostgreSQL (or SQLite for local dev)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/AbhinuYadav/team-task-manager.git
cd team-task-manager
```

### 2️⃣ Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate          # Mac/Linux
# venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Initialize database
python init_db.py

# Run the server
python run.py
```

> 🟢 Backend will be live at `http://localhost:8000`  
> 📄 Swagger docs available at `http://localhost:8000/docs`

### 3️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

> 🟢 Frontend will be live at `http://localhost:3000`

---

## ⚙️ Environment Variables

### Backend `.env`

```env
DATABASE_URL=postgresql://user:password@localhost:5432/taskmanager
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend `.env`

```env
REACT_APP_API_URL=http://localhost:8000/api
```

---

## 📡 API Reference

### 🔐 Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/auth/signup` | Register new user | Public |
| `POST` | `/api/auth/login` | Login & get JWT token | Public |
| `GET` | `/api/auth/me` | Get current user info | Authenticated |

### 📁 Projects

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/projects` | Create a new project | Admin |
| `GET` | `/api/projects` | List all projects | Authenticated |
| `GET` | `/api/projects/{id}` | Get project details | Authenticated |
| `DELETE` | `/api/projects/{id}` | Delete project | Admin |

### ✅ Tasks

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/tasks` | Create task with milestones | Admin |
| `GET` | `/api/tasks` | Get tasks (filtered by role) | Authenticated |
| `GET` | `/api/tasks/{id}` | Get task details | Authenticated |
| `PUT` | `/api/tasks/{id}` | Update task | Admin |
| `DELETE` | `/api/tasks/{id}` | Delete task | Admin |

### 🎯 Milestones

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `POST` | `/api/tasks/{id}/milestones/{mid}/progress` | Update milestone progress (0–100%) | Member/Admin |

### 👥 Admin / Members

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| `GET` | `/api/members` | List all members | Admin |
| `GET` | `/api/members/dashboard` | Dashboard statistics | Admin |
| `GET` | `/api/members/member-tasks` | Member task summary | Admin |

---

## 🗄️ Database Schema

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │   projects   │       │    tasks     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │──┐    │ id (PK)      │──┐    │ id (PK)      │
│ email        │  │    │ name         │  │    │ title        │
│ username     │  │    │ description  │  └───▶│ project_id   │
│ hashed_pwd   │  └───▶│ created_by   │       │ assigned_to  │──┐
│ role         │       │ created_at   │       │ created_by   │  │
│ is_active    │       └──────────────┘       │ due_date     │  │
│ created_at   │                              └──────┬───────┘  │
└──────────────┘                                     │          │
        ▲                                            ▼          │
        │                                   ┌──────────────┐    │
        │                                   │  milestones  │    │
        │                                   ├──────────────┤    │
        │                                   │ id (PK)      │    │
        │                                   │ title        │    │
        │                                   │ description  │    │
        │                                   │ task_id (FK) │    │
        │                                   └──────┬───────┘    │
        │                                          │            │
        │                              ┌───────────▼──────────┐ │
        │                              │  milestone_progress  │ │
        │                              ├──────────────────────┤ │
        └──────────────────────────────│ member_id (FK)       │◀┘
                                       │ milestone_id (FK)    │
                                       │ progress_percentage  │
                                       │ status               │
                                       │ last_updated         │
                                       └──────────────────────┘
```

---

## ☁️ Deployment

### Railway — Backend

```
Build Command : pip install -r requirements.txt
Start Command : uvicorn app.main:app --host 0.0.0.0 --port $PORT
Plugin        : PostgreSQL (DATABASE_URL auto-configured)
```

### Railway — Frontend

```
Build Command : npm install && npm run build
Start Command : npx serve -s build -l $PORT
Env Variable  : REACT_APP_API_URL = <your-backend-url>/api
```

### Steps

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → Deploy from GitHub
3. Select the `backend/` folder → Add **PostgreSQL** plugin
4. Create another project → Select `frontend/` folder → Add the API URL variable
5. 🎉 Done!

---

## 🧪 Testing

```bash
# Register an admin user
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","username":"admin","password":"admin123","role":"admin"}'

# Login and get token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Use token for protected routes
curl -X GET http://localhost:8000/api/projects \
  -H "Authorization: Bearer <your_token>"
```

---

## 🐞 Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Verify `DATABASE_URL` in `.env` and run `python init_db.py` |
| Frontend can't connect | Check `REACT_APP_API_URL` and backend CORS config |
| Progress not saving | Verify user is assigned to the task and JWT token is valid |
| 401 errors | Token expired — log in again |
| 403 errors | You're trying to access an admin-only route as a member |

---

## 🔭 Roadmap

- [ ] 📎 File attachments for tasks
- [ ] 📧 Email notifications for task assignments
- [ ] 💬 Comment system on tasks
- [ ] ⏱️ Time tracking per milestone
- [ ] 📄 Export reports (PDF / CSV)
- [ ] 🌙 Dark mode support
- [ ] 📱 Mobile-responsive improvements
- [ ] ⚡ WebSocket for real-time updates
- [ ] 📋 Task templates
- [ ] 💬 Team chat integration

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your branch: `git checkout -b feature/awesome-feature`
3. Commit your changes: `git commit -m 'Add awesome feature'`
4. Push to the branch: `git push origin feature/awesome-feature`
5. Open a Pull Request

---

<div align="center">

## 👨‍💻 Author

**Abhinav Yadav**

[![GitHub](https://img.shields.io/badge/GitHub-@AbhinuYadav-181717?style=for-the-badge&logo=github)](https://github.com/AbhinuYadav)

---

*Built with ❤️ using FastAPI and React*

⭐ **Star this repo if you found it helpful!** ⭐

</div>
