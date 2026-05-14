const logBox = document.getElementById("log");
const patientIdBox = document.getElementById("patientId");
const appointmentIdBox = document.getElementById("appointmentId");

const adminSection = document.getElementById("adminSection");
const patientSection = document.getElementById("patientSection");
const registerSection = document.getElementById("registerSection");
const appointmentSection = document.getElementById("appointmentSection");

const statsBox = document.getElementById("statsBox");
const appointmentsBox = document.getElementById("appointmentsBox");

let patientId = localStorage.getItem("carepulse-patient-id") || "";
let appointmentId = localStorage.getItem("carepulse-appointment-id") || "";
let adminToken = localStorage.getItem("carepulse-admin-token") || "";

const setLog = (message) => {
  const stamp = new Date().toLocaleTimeString();
  const next = `[${stamp}] ${message}\n${logBox.textContent}`;
  logBox.textContent = next.slice(0, 5000);
};

const request = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

const refreshState = () => {
  patientIdBox.textContent = patientId || "None";
  appointmentIdBox.textContent = appointmentId || "None";
};

const showPatientView = () => {
  adminSection.classList.add("hidden");
  patientSection.classList.remove("hidden");
  registerSection.classList.remove("hidden");
  appointmentSection.classList.remove("hidden");
};

const showAdminView = () => {
  adminSection.classList.remove("hidden");
  patientSection.classList.add("hidden");
  registerSection.classList.add("hidden");
  appointmentSection.classList.add("hidden");
};

const loadStats = async () => {
  if (!adminToken) {
    statsBox.innerHTML = "";
    appointmentsBox.innerHTML = "";
    return;
  }

  const stats = await request("/api/stats", {
    headers: { Authorization: `Bearer ${adminToken}` }
  });

  statsBox.innerHTML = `
    <div><strong>Total</strong><br/>${stats.totalCount}</div>
    <div><strong>Pending</strong><br/>${stats.pendingCount}</div>
    <div><strong>Scheduled</strong><br/>${stats.scheduledCount}</div>
    <div><strong>Cancelled</strong><br/>${stats.cancelledCount}</div>
  `;

  const rows = stats.appointments
    .map(
      (row) => `
      <tr>
        <td>${row.patientName}</td>
        <td>${row.doctorName}</td>
        <td>${new Date(row.scheduleAt).toLocaleString()}</td>
        <td><span class="status-chip status-${row.status}">${row.status}</span></td>
        <td>
          <button class="btn btn-secondary" data-id="${row.id}" data-action="schedule">Schedule</button>
          <button class="btn btn-danger" data-id="${row.id}" data-action="cancel">Cancel</button>
        </td>
      </tr>
    `
    )
    .join("");

  appointmentsBox.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Patient</th>
          <th>Doctor</th>
          <th>Schedule</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  appointmentsBox.querySelectorAll("button[data-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.getAttribute("data-id");
      const action = button.getAttribute("data-action");

      try {
        if (action === "schedule") {
          const doctorName = prompt("Doctor name");
          const scheduleAt = prompt("Schedule date-time (YYYY-MM-DDTHH:mm)");
          if (!doctorName || !scheduleAt) {
            return;
          }
          await request(`/api/appointments/${id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminToken}`
            },
            body: JSON.stringify({ status: "scheduled", doctorName, scheduleAt })
          });
          setLog("Appointment scheduled");
        } else {
          const cancellationReason = prompt("Cancellation reason");
          if (!cancellationReason) {
            return;
          }
          await request(`/api/appointments/${id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminToken}`
            },
            body: JSON.stringify({ status: "cancelled", cancellationReason })
          });
          setLog("Appointment cancelled");
        }

        await loadStats();
      } catch (error) {
        setLog(error.message);
      }
    });
  });
};

refreshState();

document.getElementById("showPatient").addEventListener("click", showPatientView);
document.getElementById("showAdmin").addEventListener("click", async () => {
  showAdminView();
  try {
    await loadStats();
  } catch (error) {
    setLog(error.message);
  }
});

document.getElementById("createPatientForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);

  try {
    const patient = await request("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });

    patientId = patient.id;
    localStorage.setItem("carepulse-patient-id", patientId);
    refreshState();
    setLog(`Patient created: ${patientId}`);
  } catch (error) {
    setLog(error.message);
  }
});

document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!patientId) {
    setLog("Create a patient first");
    return;
  }

  const formData = new FormData(event.currentTarget);

  try {
    await request(`/api/patients/${patientId}`, {
      method: "PUT",
      body: formData
    });
    setLog("Patient profile saved");
  } catch (error) {
    setLog(error.message);
  }
});

document.getElementById("appointmentForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!patientId) {
    setLog("Create a patient first");
    return;
  }

  const values = Object.fromEntries(new FormData(event.currentTarget).entries());

  try {
    const appointment = await request("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, patientId })
    });

    appointmentId = appointment.id;
    localStorage.setItem("carepulse-appointment-id", appointmentId);
    refreshState();
    setLog(`Appointment created: ${appointmentId}`);
  } catch (error) {
    setLog(error.message);
  }
});

document.getElementById("adminLoginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const passkey = new FormData(event.currentTarget).get("passkey");

  try {
    const result = await request("/api/auth/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passkey })
    });

    adminToken = result.token;
    localStorage.setItem("carepulse-admin-token", adminToken);
    setLog("Admin login successful");
    await loadStats();
  } catch (error) {
    setLog(error.message);
  }
});

document.getElementById("refreshStats").addEventListener("click", async () => {
  try {
    await loadStats();
    setLog("Stats refreshed");
  } catch (error) {
    setLog(error.message);
  }
});

document.getElementById("logoutAdmin").addEventListener("click", () => {
  adminToken = "";
  localStorage.removeItem("carepulse-admin-token");
  statsBox.innerHTML = "";
  appointmentsBox.innerHTML = "";
  setLog("Admin logged out");
});

if (adminToken) {
  showAdminView();
  loadStats().catch((error) => setLog(error.message));
}
