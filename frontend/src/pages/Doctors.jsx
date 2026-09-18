import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const styles = {
  page: { padding: "40px 30px", background: "#F5F8FF", minHeight: "90vh" },
  title: { fontSize: "28px", fontWeight: "bold", color: "#1A73E8", marginBottom: "8px" },
  sub: { color: "#666", marginBottom: "30px" },
  searchRow: { display: "flex", gap: "12px", marginBottom: "30px", flexWrap: "wrap" },
  input: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "15px", minWidth: "200px" },
  btn: { padding: "10px 20px", background: "#1A73E8", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "15px" },
  grid: { display: "flex", flexWrap: "wrap", gap: "20px" },
  card: { background: "#fff", borderRadius: "12px", padding: "24px", width: "280px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" },
  avatar: { width: "60px", height: "60px", background: "#1A73E8", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "24px", marginBottom: "14px" },
  name: { fontWeight: "bold", fontSize: "17px", color: "#222", marginBottom: "4px" },
  spec: { color: "#1A73E8", fontSize: "14px", marginBottom: "8px" },
  info: { color: "#666", fontSize: "13px", marginBottom: "4px" },
  bookBtn: { display: "block", marginTop: "16px", textAlign: "center", background: "#1A73E8", color: "#fff", padding: "10px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", fontSize: "14px" },
  empty: { textAlign: "center", color: "#888", fontSize: "16px", padding: "60px" },
  loading: { textAlign: "center", color: "#1A73E8", fontSize: "16px", padding: "60px" },
};

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState({ specialization: "", city: "" });

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.specialization) params.specialization = search.specialization;
      if (search.city) params.city = search.city;
      const { data } = await api.get("/doctors", { params });
      setDoctors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setSearch({ specialization: "", city: "" });
    setLoading(true);
    try {
      const { data } = await api.get("/doctors");
      setDoctors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadDoctors = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/doctors");
        setDoctors(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDoctors();
  }, []);

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Find a Doctor</h2>
      <p style={styles.sub}>Browse our verified doctors and book an appointment</p>

      <div style={styles.searchRow}>
        <input style={styles.input} placeholder="Specialization (e.g. Cardiologist)"
          value={search.specialization} onChange={(e) => setSearch({ ...search, specialization: e.target.value })} />
        <input style={styles.input} placeholder="City (e.g. Lahore)"
          value={search.city} onChange={(e) => setSearch({ ...search, city: e.target.value })} />
        <button style={styles.btn} onClick={fetchDoctors}>Search</button>
        <button style={{ ...styles.btn, background: "#888" }} onClick={handleClear}>Clear</button>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading doctors...</div>
      ) : doctors.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <p>No doctors found. Try different search terms.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {doctors.map((doc) => (
            <div key={doc._id} style={styles.card}>
              <div style={styles.avatar}>👨‍⚕️</div>
              <div style={styles.name}>Dr. {doc.user?.name || "Unknown"}</div>
              <div style={styles.spec}>{doc.specialization}</div>
              <div style={styles.info}>📍 {doc.city || "N/A"}</div>
              <div style={styles.info}>🎓 {doc.qualifications || "N/A"}</div>
              <div style={styles.info}>⏳ {doc.experienceYears} years experience</div>
              <div style={styles.info}>💰 Rs. {doc.consultationFee} fee</div>
              <Link to={`/book/${doc._id}`} style={styles.bookBtn}>Book Appointment</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
