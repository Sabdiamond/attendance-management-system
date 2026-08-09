"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Course {
  id: string;
  code: string;
  title: string;
  level: number;
}

interface SessionItem {
  id: string;
  name: string;
}

interface Semester {
  id: string;
  name: string;
}

interface AttendanceRow {
  studentId: string;
  matricNumber: string;
  fullName: string;
  isPresent: boolean;
  timestamp: string | null;
}

const LEVELS = [100, 200, 300, 400, 500];

function getAuthHeaders() {
  const adminData = JSON.parse(sessionStorage.getItem("admin") || "{}");
  return { Authorization: `Bearer ${adminData.token}` };
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  color: "#0f172a",
  backgroundColor: "#fff",
  fontSize: "14px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "6px",
  fontWeight: 600,
  color: "#1e293b",
  fontSize: "14px",
};

export default function AttendanceReportPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "loaded" | "error">("idle");

  useEffect(() => {
    const stored = sessionStorage.getItem("admin");

    if (!stored) {
      router.push("/admin/login");
      return;
    }

    setIsAuthorized(true);
  }, [router]);

  useEffect(() => {
    if (!isAuthorized) return;

    const loadInitialData = async () => {
      try {
        const [coursesRes, sessionsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/list`, { headers: getAuthHeaders() }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/list`, { headers: getAuthHeaders() }),
        ]);

        setCourses(await coursesRes.json());
        setSessions(await sessionsRes.json());
      } catch (err) {
        console.error("Failed to load initial data:", err);
      }
    };

    loadInitialData();
  }, [isAuthorized]);

  useEffect(() => {
    if (!selectedSessionId) {
      setSemesters([]);
      setSelectedSemesterId("");
      return;
    }

    const loadSemesters = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/semesters/list?sessionId=${selectedSessionId}`,
          { headers: getAuthHeaders() }
        );
        setSemesters(await response.json());
      } catch (err) {
        console.error("Failed to load semesters:", err);
      }
    };

    loadSemesters();
  }, [selectedSessionId]);

  const filteredCourses = selectedLevel
    ? courses.filter((c) => c.level === Number(selectedLevel))
    : [];

  const canViewReport =
    selectedSessionId && selectedSemesterId && selectedLevel && selectedCourseId;

  const handleViewReport = async () => {
    setStatus("loading");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/course?courseId=${selectedCourseId}&sessionId=${selectedSessionId}&semesterId=${selectedSemesterId}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        throw new Error("Failed to load attendance report.");
      }

      setRows(await response.json());
      setStatus("loaded");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const presentCount = rows.filter((r) => r.isPresent).length;

  const handleLogout = () => {
    sessionStorage.removeItem("admin");
    router.push("/admin/login");
  };

  if (!isAuthorized) {
    return (
      <div style={{ textAlign: "center", marginTop: "60px", color: "#1e293b" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <header
        style={{
          backgroundImage:
            "linear-gradient(160deg, #1e3a8a 0%, #1e40af 55%, #1d4ed8 100%)",
          color: "#fff",
          padding: "24px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <Image
            src="/icons/icon-192.png"
            alt="Saberedowo University"
            width={44}
            height={44}
            style={{ borderRadius: "10px" }}
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: "16px" }}>Saberedowo University</div>
            <div
              style={{
                fontSize: "11px",
                letterSpacing: "0.5px",
                color: "#bfdbfe",
                textTransform: "uppercase",
                marginTop: "2px",
              }}
            >
              Attendance Report
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            border: "1px solid rgba(255,255,255,0.4)",
            backgroundColor: "transparent",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          Logout
        </button>
      </header>

      {/* Content */}
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px" }}>
        <button
          onClick={() => router.push("/admin/dashboard")}
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
          ← Back to Dashboard
        </button>

        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "24px",
          }}
        >
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              marginBottom: "20px",
              color: "#0f172a",
            }}
          >
            Attendance Report
          </h1>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
            <div>
              <label style={labelStyle}>Session</label>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                style={selectStyle}
              >
                <option value="">Select a session</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Semester</label>
              <select
                value={selectedSemesterId}
                onChange={(e) => setSelectedSemesterId(e.target.value)}
                disabled={!selectedSessionId}
                style={selectStyle}
              >
                <option value="">Select a semester</option>
                {semesters.map((sm) => (
                  <option key={sm.id} value={sm.id}>
                    {sm.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => {
                  setSelectedLevel(e.target.value);
                  setSelectedCourseId("");
                }}
                style={selectStyle}
              >
                <option value="">Select a level</option>
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl} Level
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                disabled={!selectedLevel}
                style={selectStyle}
              >
                <option value="">
                  {selectedLevel && filteredCourses.length === 0
                    ? "No courses at this level"
                    : "Select a course"}
                </option>
                {filteredCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleViewReport}
              disabled={!canViewReport || status === "loading"}
              style={{
                padding: "12px",
                borderRadius: "10px",
                backgroundColor: canViewReport ? "#1e40af" : "#94a3b8",
                color: "#fff",
                fontWeight: 700,
                border: "none",
                cursor: canViewReport ? "pointer" : "not-allowed",
                fontSize: "14px",
              }}
            >
              {status === "loading" ? "Loading..." : "View Report"}
            </button>
          </div>

          {status === "error" && (
            <p style={{ color: "#dc2626", fontSize: "14px" }}>
              Could not load the attendance report.
            </p>
          )}

          {status === "loaded" && (
            <>
              <p style={{ color: "#475569", marginBottom: "16px", fontSize: "14px" }}>
                {presentCount} of {rows.length} students present
              </p>

              {rows.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: "14px" }}>
                  No students are registered for this course/session/semester.
                </p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                        <th style={{ padding: "8px", color: "#334155", fontSize: "13px" }}>Matric Number</th>
                        <th style={{ padding: "8px", color: "#334155", fontSize: "13px" }}>Name</th>
                        <th style={{ padding: "8px", color: "#334155", fontSize: "13px" }}>Status</th>
                        <th style={{ padding: "8px", color: "#334155", fontSize: "13px" }}>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.studentId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px", color: "#0f172a", fontSize: "14px" }}>{r.matricNumber}</td>
                          <td style={{ padding: "8px", color: "#0f172a", fontSize: "14px" }}>{r.fullName}</td>
                          <td style={{ padding: "8px" }}>
                            <span
                              style={{
                                padding: "2px 10px",
                                borderRadius: "999px",
                                fontSize: "13px",
                                fontWeight: 600,
                                backgroundColor: r.isPresent ? "#dcfce7" : "#fee2e2",
                                color: r.isPresent ? "#166534" : "#991b1b",
                              }}
                            >
                              {r.isPresent ? "Present" : "Absent"}
                            </span>
                          </td>
                          <td style={{ padding: "8px", color: "#0f172a", fontSize: "14px" }}>
                            {r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}