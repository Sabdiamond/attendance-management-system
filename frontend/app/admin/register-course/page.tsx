"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Student {
  id: string;
  fullName: string;
  matricNumber: string;
  level: number;
}

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

export default function RegisterCoursePage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

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
        const [studentsRes, coursesRes, sessionsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students/list`, { headers: getAuthHeaders() }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses/list`, { headers: getAuthHeaders() }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/list`, { headers: getAuthHeaders() }),
        ]);

        setStudents(await studentsRes.json());
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

  const filteredStudents = selectedLevel
    ? students.filter((s) => s.level === Number(selectedLevel))
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/course-registrations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          studentId: selectedStudentId,
          courseId: selectedCourseId,
          sessionId: selectedSessionId,
          semesterId: selectedSemesterId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `Request failed with status ${response.status}`);
      }

      setStatus("success");
      setSelectedStudentId("");
      setSelectedCourseId("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  };

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
              Register Student for Course
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
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "40px 24px" }}>
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
            Register Student for Course
          </h1>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Session</label>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                required
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
                required
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
                  setSelectedStudentId("");
                }}
                required
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
                required
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

            <div>
              <label style={labelStyle}>Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
                disabled={!selectedLevel}
                style={selectStyle}
              >
                <option value="">
                  {selectedLevel && filteredStudents.length === 0
                    ? "No students at this level"
                    : "Select a student"}
                </option>
                {filteredStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.matricNumber} — {s.fullName}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              style={{
                padding: "12px",
                borderRadius: "10px",
                backgroundColor: "#1e40af",
                color: "#fff",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                marginTop: "4px",
              }}
            >
              {status === "loading" ? "Registering..." : "Register Course"}
            </button>

            {status === "success" && (
              <p style={{ color: "#16a34a", fontSize: "14px", margin: 0 }}>
                Student registered for course successfully.
              </p>
            )}
            {status === "error" && (
              <p style={{ color: "#dc2626", fontSize: "14px", margin: 0 }}>
                Error: {errorMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}