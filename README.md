<div align="center">

<br />

# 🏥 DocLink

### Healthcare management — patient intake, appointments, and admin analytics in one place

<br />

[![Node.js](https://img.shields.io/badge/Node.js-v18+-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Live-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br />

> A full-stack web app for small clinics and healthcare practices — streamlining patient registration, appointment scheduling, and admin oversight from a single dashboard.

<br />

[Features](#-features) · [Tech Stack](#-tech-stack) · [Quick Start](#-quick-start) · [API Reference](#-api-reference)

<br />

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

**🧾 Patient Management**
- Onboarding forms with medical history tracking
- Secure document and ID upload via Multer
- Patient record retrieval and updates

</td>
<td width="50%">

**📅 Appointments**
- Book and manage doctor appointments
- View and filter appointment lists
- Linked to patient records

</td>
</tr>
<tr>
<td width="50%">

**📊 Admin Dashboard**
- Passkey-protected admin login
- Real-time stats via Socket.IO
- Live updates on patient and appointment activity

</td>
<td width="50%">

**⚙️ Infrastructure**
- Auto-initializes PostgreSQL schema on startup
- In-memory fallback when no DB is configured
- JWT-secured endpoints throughout

</td>
</tr>
</table>

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL |
| **Authentication** | JWT |
| **Real-time** | Socket.IO |
| **Frontend** | Vanilla JS, HTML5, CSS3 |
| **File Upload** | Multer |

---

## 📁 Project Structure

```
DocLink/
├── backend/
│   ├── src/
│   │   └── index.js        # Express server & API routes
│   ├── data/
│   │   ├── doctors.js      # Doctor seed data
│   │   └── store.js        # Data operations & business logic
│   ├── db/
│   │   └── schema.sql      # PostgreSQL schema
│   └── storage/            # Uploaded files
└── frontend/
    └── static/
        ├── index.html
        ├── app.js
        └── app.css
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL (optional — falls back to in-memory store)

### Setup

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env
```

Configure `.env`:

```env
PORT=4000
CLIENT_URL=http://localhost:4000
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key-min-32-chars
ADMIN_PASSKEY=your-passkey
```

```bash
npm run dev
# Server running on http://localhost:4000
```

---

## 📡 API Reference

### Patients

```
POST   /api/patients         Register new patient
GET    /api/patients/:id     Get patient details
PUT    /api/patients/:id     Update patient record
```

### Appointments

```
POST   /api/appointments     Book appointment
GET    /api/appointments     List all appointments
```

### Admin

```
POST   /api/admin/login      Admin login (passkey)
GET    /api/stats            Dashboard statistics
```

---

## 💾 Database

Tables are created automatically on startup when `DATABASE_URL` is set:

- `patients` — records and medical history
- `appointments` — bookings and schedules
- `documents` — uploaded files metadata

No `DATABASE_URL`? The app runs with an in-memory store — useful for local development without a database setup.

---

## ⚠️ Security Notes

- Set a strong `ADMIN_PASSKEY` in production — never leave it as a default
- `JWT_SECRET` should be at least 32 characters
- Never commit `.env` to version control
- Enable HTTPS in production

---

## 📄 License

MIT — free to use and modify.

---

<div align="center">

<br />

**[⬆ Back to top](#-doclink)**

</div>
