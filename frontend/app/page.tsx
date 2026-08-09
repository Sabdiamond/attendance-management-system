"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#1e40af",
        backgroundImage: "linear-gradient(160deg, #1e3a8a 0%, #1e40af 55%, #1d4ed8 100%)",
        color: "#fff",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 40px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Image
            src="/icons/icon-192.png"
            alt="Saberedowo University Logo"
            width={44}
            height={44}
            style={{ borderRadius: "10px" }}
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: "16px", lineHeight: 1.2 }}>
              Saberedowo University
            </div>
            <div style={{ fontSize: "11px", color: "#bfdbfe", letterSpacing: "0.5px" }}>
              SHOWERS OF MERCY · EST. 2026
            </div>
          </div>
        </div>
      </header>

      {/* Hero — fills remaining screen, centered */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "24px 40px",
        }}
      >
        <div style={{ maxWidth: "680px" }}>
          <p
            style={{
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "1.5px",
              color: "#fbbf24",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Attendance Management System
          </p>
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: "20px",
            }}
          >
            Attendance, tracked the smart way.
          </h1>
          <p
            style={{
              fontSize: "17px",
              color: "#dbeafe",
              lineHeight: 1.7,
              marginBottom: "36px",
              maxWidth: "520px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            No roll calls. No spreadsheets. No stress. Just scan, track, done. Built for Saberedowo University's students and staff
          </p>

          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <button
              onClick={() => router.push("/login")}
              style={{
                padding: "16px 32px",
                borderRadius: "10px",
                backgroundColor: "#fff",
                color: "#1e40af",
                fontWeight: 700,
                fontSize: "16px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Student Login
            </button>
            <button
              onClick={() => router.push("/admin/login")}
              style={{
                padding: "16px 32px",
                borderRadius: "10px",
                backgroundColor: "transparent",
                color: "#fff",
                fontWeight: 700,
                fontSize: "16px",
                border: "2px solid rgba(255,255,255,0.5)",
                cursor: "pointer",
              }}
            >
              Admin Login
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          padding: "20px 40px",
          fontSize: "13px",
          color: "#93c5fd",
          textAlign: "center",
          borderTop: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        © {new Date().getFullYear()} Saberedowo University Attendance System
      </footer>
    </div>
  );
}