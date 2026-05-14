import { randomUUID } from "crypto";

import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim();
const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null;

const memory = {
  patients: [],
  appointments: []
};

let schemaReady = false;

const patientRowToDto = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  birthDate: row.birth_date,
  gender: row.gender,
  address: row.address,
  occupation: row.occupation,
  emergencyContactName: row.emergency_contact_name,
  emergencyContactNumber: row.emergency_contact_number,
  primaryPhysician: row.primary_physician,
  insuranceProvider: row.insurance_provider,
  insurancePolicyNumber: row.insurance_policy_number,
  allergies: row.allergies,
  currentMedication: row.current_medication,
  familyMedicalHistory: row.family_medical_history,
  pastMedicalHistory: row.past_medical_history,
  identificationType: row.identification_type,
  identificationNumber: row.identification_number,
  identificationDocumentPath: row.identification_document_path,
  treatmentConsent: row.treatment_consent,
  disclosureConsent: row.disclosure_consent,
  privacyConsent: row.privacy_consent,
  stage: row.stage,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const appointmentRowToDto = (row) => ({
  id: row.id,
  patientId: row.patient_id,
  patientName: row.patient_name,
  patientEmail: row.patient_email,
  patientPhone: row.patient_phone,
  doctorName: row.doctor_name,
  scheduleAt: row.schedule_at,
  reason: row.reason,
  note: row.note,
  status: row.status,
  cancellationReason: row.cancellation_reason,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const ensureSchema = async () => {
  if (!pool || schemaReady) {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS patients (
      id uuid PRIMARY KEY,
      name text NOT NULL,
      email text NOT NULL,
      phone text NOT NULL,
      birth_date date,
      gender text,
      address text,
      occupation text,
      emergency_contact_name text,
      emergency_contact_number text,
      primary_physician text,
      insurance_provider text,
      insurance_policy_number text,
      allergies text,
      current_medication text,
      family_medical_history text,
      past_medical_history text,
      identification_type text,
      identification_number text,
      identification_document_path text,
      treatment_consent boolean DEFAULT false,
      disclosure_consent boolean DEFAULT false,
      privacy_consent boolean DEFAULT false,
      stage text NOT NULL DEFAULT 'draft',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id uuid PRIMARY KEY,
      patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      patient_name text NOT NULL,
      patient_email text NOT NULL,
      patient_phone text NOT NULL,
      doctor_name text NOT NULL,
      schedule_at timestamptz NOT NULL,
      reason text NOT NULL,
      note text,
      status text NOT NULL DEFAULT 'pending',
      cancellation_reason text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  schemaReady = true;
};

const memoryClone = (value) => JSON.parse(JSON.stringify(value));

export const createPatient = async ({ name, email, phone }) => {
  if (!pool) {
    const patient = {
      id: randomUUID(),
      name,
      email,
      phone,
      stage: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    memory.patients.push(patient);
    return memoryClone(patient);
  }

  await ensureSchema();
  const id = randomUUID();
  const result = await pool.query(
    `
      INSERT INTO patients (id, name, email, phone, stage)
      VALUES ($1, $2, $3, $4, 'draft')
      RETURNING *;
    `,
    [id, name, email, phone]
  );

  return patientRowToDto(result.rows[0]);
};

export const getPatientById = async (id) => {
  if (!pool) {
    return memoryClone(memory.patients.find((patient) => patient.id === id) || null);
  }

  await ensureSchema();
  const result = await pool.query("SELECT * FROM patients WHERE id = $1 LIMIT 1;", [id]);
  return result.rows[0] ? patientRowToDto(result.rows[0]) : null;
};

export const updatePatient = async (id, payload) => {
  if (!pool) {
    const existing = memory.patients.find((patient) => patient.id === id);
    if (!existing) {
      return null;
    }

    Object.assign(existing, payload, {
      stage: "registered",
      updatedAt: new Date().toISOString()
    });
    return memoryClone(existing);
  }

  await ensureSchema();
  const values = [
    id,
    payload.name ?? null,
    payload.email ?? null,
    payload.phone ?? null,
    payload.birthDate ?? null,
    payload.gender ?? null,
    payload.address ?? null,
    payload.occupation ?? null,
    payload.emergencyContactName ?? null,
    payload.emergencyContactNumber ?? null,
    payload.primaryPhysician ?? null,
    payload.insuranceProvider ?? null,
    payload.insurancePolicyNumber ?? null,
    payload.allergies ?? null,
    payload.currentMedication ?? null,
    payload.familyMedicalHistory ?? null,
    payload.pastMedicalHistory ?? null,
    payload.identificationType ?? null,
    payload.identificationNumber ?? null,
    payload.identificationDocumentPath ?? null,
    Boolean(payload.treatmentConsent),
    Boolean(payload.disclosureConsent),
    Boolean(payload.privacyConsent)
  ];

  const result = await pool.query(
    `
      UPDATE patients
      SET
        name = COALESCE($2, name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        birth_date = COALESCE($5, birth_date),
        gender = COALESCE($6, gender),
        address = COALESCE($7, address),
        occupation = COALESCE($8, occupation),
        emergency_contact_name = COALESCE($9, emergency_contact_name),
        emergency_contact_number = COALESCE($10, emergency_contact_number),
        primary_physician = COALESCE($11, primary_physician),
        insurance_provider = COALESCE($12, insurance_provider),
        insurance_policy_number = COALESCE($13, insurance_policy_number),
        allergies = COALESCE($14, allergies),
        current_medication = COALESCE($15, current_medication),
        family_medical_history = COALESCE($16, family_medical_history),
        past_medical_history = COALESCE($17, past_medical_history),
        identification_type = COALESCE($18, identification_type),
        identification_number = COALESCE($19, identification_number),
        identification_document_path = COALESCE($20, identification_document_path),
        treatment_consent = COALESCE($21, treatment_consent),
        disclosure_consent = COALESCE($22, disclosure_consent),
        privacy_consent = COALESCE($23, privacy_consent),
        stage = 'registered',
        updated_at = now()
      WHERE id = $1
      RETURNING *;
    `,
    values
  );

  return result.rows[0] ? patientRowToDto(result.rows[0]) : null;
};

export const createAppointment = async ({ patientId, doctorName, scheduleAt, reason, note }) => {
  if (!pool) {
    const patient = memory.patients.find((entry) => entry.id === patientId);
    const appointment = {
      id: randomUUID(),
      patientId,
      patientName: patient?.name || "Unknown patient",
      patientEmail: patient?.email || "",
      patientPhone: patient?.phone || "",
      doctorName,
      scheduleAt,
      reason,
      note: note || "",
      status: "pending",
      cancellationReason: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    memory.appointments.unshift(appointment);
    return memoryClone(appointment);
  }

  await ensureSchema();
  const patient = await getPatientById(patientId);
  const id = randomUUID();
  const result = await pool.query(
    `
      INSERT INTO appointments (
        id,
        patient_id,
        patient_name,
        patient_email,
        patient_phone,
        doctor_name,
        schedule_at,
        reason,
        note,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
      RETURNING *;
    `,
    [
      id,
      patientId,
      patient?.name || "Unknown patient",
      patient?.email || "",
      patient?.phone || "",
      doctorName,
      scheduleAt,
      reason,
      note || ""
    ]
  );

  return appointmentRowToDto(result.rows[0]);
};

export const listAppointments = async () => {
  if (!pool) {
    return memoryClone(memory.appointments).sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  await ensureSchema();
  const result = await pool.query("SELECT * FROM appointments ORDER BY created_at DESC;");
  return result.rows.map(appointmentRowToDto);
};

export const getAppointmentById = async (id) => {
  if (!pool) {
    return memoryClone(memory.appointments.find((appointment) => appointment.id === id) || null);
  }

  await ensureSchema();
  const result = await pool.query("SELECT * FROM appointments WHERE id = $1 LIMIT 1;", [id]);
  return result.rows[0] ? appointmentRowToDto(result.rows[0]) : null;
};

export const updateAppointment = async (id, payload) => {
  if (!pool) {
    const appointment = memory.appointments.find((entry) => entry.id === id);
    if (!appointment) {
      return null;
    }

    Object.assign(appointment, payload, {
      updatedAt: new Date().toISOString()
    });
    return memoryClone(appointment);
  }

  await ensureSchema();
  const result = await pool.query(
    `
      UPDATE appointments
      SET
        doctor_name = COALESCE($2, doctor_name),
        schedule_at = COALESCE($3, schedule_at),
        reason = COALESCE($4, reason),
        note = COALESCE($5, note),
        status = COALESCE($6, status),
        cancellation_reason = COALESCE($7, cancellation_reason),
        updated_at = now()
      WHERE id = $1
      RETURNING *;
    `,
    [
      id,
      payload.doctorName ?? null,
      payload.scheduleAt ?? null,
      payload.reason ?? null,
      payload.note ?? null,
      payload.status ?? null,
      payload.cancellationReason ?? null
    ]
  );

  return result.rows[0] ? appointmentRowToDto(result.rows[0]) : null;
};

export const getStats = async () => {
  const appointments = await listAppointments();
  return {
    totalCount: appointments.length,
    pendingCount: appointments.filter((appointment) => appointment.status === "pending").length,
    scheduledCount: appointments.filter((appointment) => appointment.status === "scheduled").length,
    cancelledCount: appointments.filter((appointment) => appointment.status === "cancelled").length,
    appointments
  };
};
