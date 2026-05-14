import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import http from "http";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { Server as SocketIOServer } from "socket.io";

import { doctors } from "../data/doctors.js";
import {
  createAppointment,
  createPatient,
  getAppointmentById,
  getPatientById,
  getStats,
  listAppointments,
  updateAppointment,
  updatePatient
} from "../data/store.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = http.createServer(app);
const publicDir = path.resolve(__dirname, "../../frontend/static");
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:4000",
    methods: ["GET", "POST", "PUT", "PATCH"]
  }
});

const uploadsDir = path.resolve(__dirname, "../storage");
fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_, __, callback) => callback(null, uploadsDir),
    filename: (_, file, callback) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      callback(null, `${Date.now()}-${safeName}`);
    }
  })
});

const jwtSecret = process.env.JWT_SECRET || "carepulse-secret";
const adminPasskey = process.env.ADMIN_PASSKEY || "111111";

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:4000" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));
app.use("/uploads", express.static(uploadsDir));

const signAdminToken = () => jwt.sign({ role: "admin" }, jwtSecret, { expiresIn: "8h" });

const requireAdmin = (request, response, next) => {
  const authHeader = request.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return response.status(401).json({ message: "Missing admin token" });
  }

  try {
    request.admin = jwt.verify(token, jwtSecret);
    next();
  } catch {
    return response.status(401).json({ message: "Invalid or expired admin token" });
  }
};

const emitDashboardUpdate = async () => {
  const stats = await getStats();
  io.emit("dashboard:update", stats);
};

app.get("/api/health", (_, response) => {
  response.json({ ok: true });
});

app.get("/api/doctors", (_, response) => {
  response.json({ doctors });
});

app.post("/api/auth/admin", (request, response) => {
  const { passkey } = request.body;

  if (!passkey || passkey !== adminPasskey) {
    return response.status(401).json({ message: "Invalid admin passkey" });
  }

  response.json({ token: signAdminToken() });
});

app.post("/api/patients", async (request, response) => {
  const { name, email, phone } = request.body;

  if (!name || !email || !phone) {
    return response.status(400).json({ message: "Name, email, and phone are required" });
  }

  const patient = await createPatient({ name, email, phone });
  response.status(201).json(patient);
});

app.get("/api/patients/:id", async (request, response) => {
  const patient = await getPatientById(request.params.id);

  if (!patient) {
    return response.status(404).json({ message: "Patient not found" });
  }

  response.json(patient);
});

app.put("/api/patients/:id", upload.single("identificationDocument"), async (request, response) => {
  const payload = {
    ...request.body,
    treatmentConsent: request.body.treatmentConsent === "true",
    disclosureConsent: request.body.disclosureConsent === "true",
    privacyConsent: request.body.privacyConsent === "true",
    identificationDocumentPath: request.file ? `/uploads/${request.file.filename}` : request.body.identificationDocumentPath || ""
  };

  if (payload.birthDate) {
    payload.birthDate = new Date(payload.birthDate).toISOString().slice(0, 10);
  }

  const patient = await updatePatient(request.params.id, payload);

  if (!patient) {
    return response.status(404).json({ message: "Patient not found" });
  }

  response.json(patient);
});

app.post("/api/appointments", async (request, response) => {
  const { patientId, doctorName, scheduleAt, reason, note } = request.body;

  if (!patientId || !doctorName || !scheduleAt || !reason) {
    return response.status(400).json({ message: "patientId, doctorName, scheduleAt, and reason are required" });
  }

  const appointment = await createAppointment({
    patientId,
    doctorName,
    scheduleAt: new Date(scheduleAt).toISOString(),
    reason,
    note
  });

  io.emit("appointment:created", appointment);
  await emitDashboardUpdate();
  response.status(201).json(appointment);
});

app.get("/api/appointments", requireAdmin, async (_, response) => {
  response.json(await listAppointments());
});

app.get("/api/appointments/:id", async (request, response) => {
  const appointment = await getAppointmentById(request.params.id);

  if (!appointment) {
    return response.status(404).json({ message: "Appointment not found" });
  }

  response.json(appointment);
});

app.patch("/api/appointments/:id", requireAdmin, async (request, response) => {
  const { doctorName, scheduleAt, reason, note, status, cancellationReason } = request.body;

  const appointment = await updateAppointment(request.params.id, {
    doctorName,
    scheduleAt: scheduleAt ? new Date(scheduleAt).toISOString() : undefined,
    reason,
    note,
    status,
    cancellationReason
  });

  if (!appointment) {
    return response.status(404).json({ message: "Appointment not found" });
  }

  io.emit("appointment:updated", appointment);
  await emitDashboardUpdate();
  response.json(appointment);
});

app.get("/api/stats", requireAdmin, async (_, response) => {
  response.json(await getStats());
});

app.get("*", (request, response, next) => {
  if (request.path.startsWith("/api") || request.path.startsWith("/uploads")) {
    return next();
  }

  response.sendFile(path.join(publicDir, "index.html"));
});

io.on("connection", (socket) => {
  socket.emit("dashboard:update", { message: "connected" });
});

const port = Number(process.env.PORT || 4000);
server.listen(port, () => {
  console.log(`DocLink API running on http://localhost:${port}`);
});
