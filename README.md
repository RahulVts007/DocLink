# DocLink

Streamlined healthcare management: patient registration, appointment booking, and admin dashboard in one platform.

A modern healthcare application built with Node.js, Express, PostgreSQL, and JWT authentication. DocLink simplifies patient intake, doctor appointments, and healthcare administration with a clean, responsive interface.

## ✨ Features

- **Patient Intake & Registration** – Easy-to-use forms for patient onboarding with medical history tracking
- **Document Upload** – Secure upload of identification and medical documents
- **Appointment Booking** – Schedule and manage appointments with doctors
- **JWT Authentication** – Secure admin access with passkey-based login
- **Admin Dashboard** – Real-time analytics and patient management
- **Socket.IO Integration** – Live updates for admin operations
- **PostgreSQL Support** – Robust data storage with automatic schema initialization
- **Fallback Storage** – In-memory store when `DATABASE_URL` is not configured
- **Responsive Design** – Clean, modern UI that works on all devices

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Setup environment variables**
```bash
cp .env.example .env
```

3. **Configure your `.env` file**
```env
PORT=4000
CLIENT_URL=http://localhost:4000
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your_secret_key_here
ADMIN_PASSKEY=111111
```

4. **Start the development server**
```bash
npm run dev
```

Server runs on **http://localhost:4000**

## 📁 Project Structure

```
DocLink/
├── backend/
│   ├── src/
│   │   └── index.js           # Express server & API endpoints
│   ├── data/
│   │   ├── doctors.js         # Doctor data
│   │   └── store.js           # Data operations & business logic
│   ├── db/
│   │   └── schema.sql         # PostgreSQL schema
│   └── storage/               # Uploaded files storage
├── frontend/
│   └── static/
│       ├── index.html         # Main HTML
│       ├── app.js             # Client-side logic
│       ├── app.css            # Styling
│       └── assets/            # Images, icons, and GIFs
└── package.json
```

## 🔑 Admin Access

- **Passkey**: `111111` (configurable via `ADMIN_PASSKEY` in `.env`)
- Access admin dashboard to view patient stats and manage appointments in real-time

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **Authentication** | JWT (JSON Web Tokens) |
| **Real-time** | Socket.IO |
| **Frontend** | Vanilla JavaScript, HTML5, CSS3 |
| **File Upload** | Multer |

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Serve frontend |
| POST | `/api/patients` | Create patient |
| GET | `/api/patients/:id` | Get patient details |
| PUT | `/api/patients/:id` | Update patient |
| POST | `/api/appointments` | Book appointment |
| GET | `/api/appointments` | List appointments |
| POST | `/api/admin/login` | Admin login |
| GET | `/api/stats` | Dashboard statistics |

## 💾 Database

The app automatically creates required tables on startup when `DATABASE_URL` is configured:
- `patients` – Patient records and medical history
- `appointments` – Appointment bookings and schedules
- `documents` – Uploaded medical documents

## 🎯 Use Cases

✓ Small to medium clinics and healthcare practices
✓ Doctor-patient appointment management
✓ Patient intake automation
✓ Medical record organization
✓ Admin analytics and insights

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `CLIENT_URL` | Frontend URL | `http://localhost:4000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key` |
| `ADMIN_PASSKEY` | Admin login passkey | `111111` |

## 📦 Scripts

```bash
npm run dev      # Start development server with hot-reload
npm run start    # Start production server
npm run build    # Build command
```

## ⚠️ Security Notes

- Change `ADMIN_PASSKEY` in production
- Use strong `JWT_SECRET` (min 32 characters)
- Keep `.env` file secure and never commit to git
- Enable HTTPS in production
- Validate all user inputs on backend

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and pull requests.

---

**Built with ❤️ for healthcare providers and patients**
