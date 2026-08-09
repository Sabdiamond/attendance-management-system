"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface AdminSession {
  id: string;
  fullName: string;
  email: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [admin, setAdmin] = useState<AdminSession | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin");

    if (!stored) {
      router.push("/admin/login");
      return;
    }

    setAdmin(JSON.parse(stored));
    setIsAuthorized(true);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("admin");
    router.push("/admin/login");
  };

  if (!isAuthorized) {
    return (
      <div style={{ textAlign: "center", marginTop: "60px" }}>
        Loading...
      </div>
    );
  }

  const actions = [
    {
      title: "Upload Student",
      description: "Add a new student and send them a password-setup link.",
      href: "/admin/upload-student",
      color: "#2563eb",
      bg: "#eff6ff",
    },
    {
      title: "Register Student for Course",
      description: "Register a student for a course in a given session/semester.",
      href: "/admin/register-course",
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
    {
      title: "Mark Attendance",
      description: "Scan student QR codes to mark attendance for a course.",
      href: "/admin/mark-attendance",
      color: "#059669",
      bg: "#ecfdf5",
    },
    {
      title: "Attendance Report",
      description: "View who attended a course for a given session/semester.",
      href: "/admin/attendance-report",
      color: "#d97706",
      bg: "#fffbeb",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Header — matches landing page branding */}
      <header
        style={{
          backgroundColor: "#1e40af",
          backgroundImage: "linear-gradient(160deg, #1e3a8a 0%, #1e40af 55%, #1d4ed8 100%)",
          color: "#fff",
          padding: "24px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
              ADMIN DASHBOARD
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            backgroundColor: "transparent",
            color: "#fff",
            fontWeight: 600,
            fontSize: "14px",
            border: "1px solid rgba(255,255,255,0.4)",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </header>

      {/* Content */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px 64px" }}>
        <p style={{ color: "#475569", marginBottom: "32px", fontSize: "15px" }}>
          Signed in as <strong style={{ color: "#0f172a" }}>{admin?.fullName}</strong> ({admin?.email})
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {actions.map((action) => (
            <button
              key={action.href}
              onClick={() => router.push(action.href)}
              style={{
                textAlign: "left",
                padding: "24px",
                borderRadius: "14px",
                border: `1px solid ${action.color}22`,
                backgroundColor: action.bg,
                cursor: "pointer",
                transition: "transform 0.1s ease",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  marginBottom: "6px",
                  color: action.color,
                }}
              >
                {action.title}
              </div>
              <div style={{ fontSize: "14px", color: "#334155" }}>
                {action.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}