import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const statusColors = {
  Pending: { background: "#FFF8E1", color: "#F9A825" },
  Confirmed: { background: "#E8F5E9", color: "#2E7D32" },
  Completed: { background: "#E3F2FD", color: "#1565C0" },
  Cancelled: { background: "#FFEBEE", color: "#C62828" },
};

const styles = {
  page: { padding: "40px 30px", background: "#F5F8FF", minHeight: "90vh" },
  title: { fontSize: "28px", fontWeight: "bold", color: "#1A73E8", marginBottom: "8px" },
  sub: { color: "#666", marginBottom: "30px" },
  card: { background: "#fff", borderRadius: "12px", padding: "24px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" },
  doctorName: { fontWeight: "bold", fontSize: "17px", color: "#222", marginBottom: "4px" },
  spec: { color: "#1A73E8", fontSize: "14px", marginBottom: "8px" },
  info: { color: "#555", fontSize: "14px", marginBottom: "3px" },
  badge: (status) => ({ display: "inline-block", padding: "5px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "bold", ...statusColors[status] }),
  cancelBtn: { padding: "8px 16px", background: "#fff", color: "#c0392b", border: "1px solid #c0392b", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "bold" },
  empty: { textAlign: "center", color: "#888", fontSize: "16px", padding: "60px" },
  loading: { textAlign: "center", color: "#1A73E8", fontSize: "16px", padding: "60px" },
};

export default function MyAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/appointments?patient=${user._id}`);
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchAppointments();
  }, [user, navigate, fetchAppointments]);

  const cancelAppointment = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await api.put(`/appointments/${id}`, { status: "Cancelled" });
      fetchAppointments();
    } catch (err) {
      alert("Failed to cancel. Try again.");
    }
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>My Appointments</h2>
      <p style={styles.sub}>Track and manage your booked appointments</p>

      {loading ? (
        <div style={styles.loading}>Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
          <p>No appointments yet. <a href="/doctors" style={{ color: "#1A73E8" }}>Browse doctors</a> to book one.</p>
        </div>
      ) : (
        appointments.map((apt) => (
          <div key={apt._id} style={styles.card}>
            <div>
              <div style={styles.doctorName}>👨‍⚕️ Dr. {apt.doctor?.user?.name || "Doctor"}</div>
              <div style={styles.spec}>{apt.doctor?.specialization}</div>
              <div style={styles.info}>📅 Date: <strong>{apt.date}</strong></div>
              <div style={styles.info}>🕐 Time: <strong>{apt.time}</strong></div>
              {apt.notes && <div style={styles.info}>📝 Notes: {apt.notes}</div>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
              <span style={styles.badge(apt.status)}>{apt.status}</span>
              {apt.status === "Pending" && (
                <button style={styles.cancelBtn} onClick={() => cancelAppointment(apt._id)}>Cancel</button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
