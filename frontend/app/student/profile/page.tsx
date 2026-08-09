"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import QRCode from "qrcode";

interface StudentData {
  id: string;
  matricNumber: string;
  fullName: string;
  email: string;
  level: number;
}

export default function StudentProfilePage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    const stored = sessionStorage.getItem("student");

    if (!stored) {
      router.push("/login");
      return;
    }

    const parsedStudent: StudentData = JSON.parse(stored);
    setStudent(parsedStudent);

    const qrData = JSON.stringify({
      id: parsedStudent.id,
      matricNumber: parsedStudent.matricNumber,
      fullName: parsedStudent.fullName,
    });

    QRCode.toDataURL(qrData, { width: 240, margin: 2 })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error("Failed to generate QR code:", err));
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("student");
    router.push("/login");
  };

  if (!student) {
    return (
      <div style={{ textAlign: "center", marginTop: "60px" }}>
        Loading...
      </div>
    );
  }

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
              STUDENT PROFILE
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
        <div
          style={{
            display: "flex",
            gap: "24px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              flex: "1 1 300px",
              textAlign: "left",
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "24px",
            }}
          >
            <p style={{ marginBottom: "10px", color: "#0f172a" }}>
              <strong>Full Name:</strong> {student.fullName}
            </p>
            <p style={{ marginBottom: "10px", color: "#0f172a" }}>
              <strong>Matric Number:</strong> {student.matricNumber}
            </p>
            <p style={{ marginBottom: "10px", color: "#0f172a" }}>
              <strong>Email:</strong> {student.email}
            </p>
            <p style={{ color: "#0f172a" }}>
              <strong>Level:</strong> {student.level}
            </p>
          </div>

          {qrCodeUrl && (
            <div
              style={{
                flex: "1 1 300px",
                textAlign: "center",
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "24px",
              }}
            >
              <p style={{ fontWeight: 700, marginBottom: "12px", color: "#1e40af" }}>
                My Attendance QR Code
              </p>
              <img
                src={qrCodeUrl}
                alt="Student QR Code"
                style={{ borderRadius: "8px", maxWidth: "100%" }}
              />
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => router.push("/student/attendance")}
            style={{
              flex: "1 1 220px",
              maxWidth: "300px",
              padding: "14px 20px",
              borderRadius: "10px",
              backgroundColor: "#1e40af",
              color: "#fff",
              fontWeight: 700,
              fontSize: "15px",
              border: "none",
              cursor: "pointer",
            }}
          >
            View My Attendance
          </button>

          <button
            onClick={() => router.push("/student/registered-courses")}
            style={{
              flex: "1 1 220px",
              maxWidth: "300px",
              padding: "14px 20px",
              borderRadius: "10px",
              backgroundColor: "#fff",
              color: "#1e40af",
              fontWeight: 700,
              fontSize: "15px",
              border: "1px solid #1e40af",
              cursor: "pointer",
            }}
          >
            View My Registered Courses
          </button>
        </div>
      </div>
    </div>
  );
}