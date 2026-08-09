"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface AttendanceEntry {
  attendanceRecordId: string;
  courseCode: string;
  courseTitle: string;
  sessionName: string;
  semesterName: string;
  timestamp: string;
}

interface StudentSession {
  id: string;
  fullName: string;
  matricNumber: string;
  token: string;
}

export default function StudentAttendancePage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [records, setRecords] = useState<AttendanceEntry[]>([]);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    const stored = sessionStorage.getItem("student");

    if (!stored) {
      router.push("/login");
      return;
    }

    setStudent(JSON.parse(stored));
    setIsAuthorized(true);
  }, [router]);

  useEffect(() => {
    if (!isAuthorized || !student) return;

    const loadAttendance = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/student/${student.id}`,
          { headers: { Authorization: `Bearer ${student.token}` } }
        );

        if (!response.ok) {
          throw new Error("Failed to load attendance records.");
        }

        setRecords(await response.json());
        setStatus("loaded");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    loadAttendance();
  }, [isAuthorized, student]);

  const handleLogout = () => {
    sessionStorage.removeItem("student");
    router.push("/login");
  };

  if (!isAuthorized) {
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
              MY ATTENDANCE
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
        <button
          onClick={() => router.push("/student/profile")}
          style={{
            background: "none",
            border: "none",
            color: "#1e40af",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "16px",
            padding: 0,
          }}
        >
          ← Back to Profile
        </button>

        <p style={{ color: "#475569", marginBottom: "24px" }}>
          {student?.fullName} — {student?.matricNumber}
        </p>

        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "8px 24px",
          }}
        >
          {status === "loading" && (
            <p style={{ padding: "16px 0", color: "#475569" }}>Loading attendance records...</p>
          )}
          {status === "error" && (
            <p style={{ padding: "16px 0", color: "#dc2626" }}>Could not load attendance records.</p>
          )}

          {status === "loaded" && records.length === 0 && (
            <p style={{ padding: "16px 0", color: "#64748b" }}>No attendance records yet.</p>
          )}

          {status === "loaded" && records.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ padding: "14px 8px", color: "#0f172a" }}>Course</th>
                  <th style={{ padding: "14px 8px", color: "#0f172a" }}>Session</th>
                  <th style={{ padding: "14px 8px", color: "#0f172a" }}>Semester</th>
                  <th style={{ padding: "14px 8px", color: "#0f172a" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.attendanceRecordId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 8px", color: "#334155" }}>
                      {r.courseCode} — {r.courseTitle}
                    </td>
                    <td style={{ padding: "14px 8px", color: "#334155" }}>{r.sessionName}</td>
                    <td style={{ padding: "14px 8px", color: "#334155" }}>{r.semesterName}</td>
                    <td style={{ padding: "14px 8px", color: "#334155" }}>
                      {new Date(r.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}