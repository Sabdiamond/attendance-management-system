"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Html5Qrcode } from "html5-qrcode";

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

interface ScanResult {
  id: string;
  message: string;
  success: boolean;
}

const LEVELS = [100, 200, 300, 400, 500];
const SCANNER_ELEMENT_ID = "qr-scanner-region";

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

export default function MarkAttendancePage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminId, setAdminId] = useState("");

  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin");

    if (!stored) {
      router.push("/admin/login");
      return;
    }

    const parsed = JSON.parse(stored);
    setAdminId(parsed.id);
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

  const canStartScanning =
    selectedSessionId && selectedSemesterId && selectedLevel && selectedCourseId;

  const handleScanSuccess = async (decodedText: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    let parsedPayload: { id: string; matricNumber: string; fullName: string };

    try {
      parsedPayload = JSON.parse(decodedText);
    } catch {
      setScanResults((prev) => [
        { id: crypto.randomUUID(), message: "Invalid QR code — could not read data.", success: false },
        ...prev,
      ]);
      isProcessingRef.current = false;
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attendance/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          studentId: parsedPayload.id,
          courseId: selectedCourseId,
          sessionId: selectedSessionId,
          semesterId: selectedSemesterId,
          markedByAdminId: adminId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setScanResults((prev) => [
          {
            id: crypto.randomUUID(),
            message: `${parsedPayload.matricNumber} — ${parsedPayload.fullName}: ${errorText}`,
            success: false,
          },
          ...prev,
        ]);
      } else {
        const result = await response.json();
        setScanResults((prev) => [
          {
            id: crypto.randomUUID(),
            message: `${result.matricNumber} — ${result.fullName}: marked present.`,
            success: true,
          },
          ...prev,
        ]);
      }
    } catch (err) {
      setScanResults((prev) => [
        {
          id: crypto.randomUUID(),
          message: err instanceof Error ? err.message : "Network error while marking attendance.",
          success: false,
        },
        ...prev,
      ]);
    }

    setTimeout(() => {
      isProcessingRef.current = false;
    }, 1500);
  };

  const startScanning = async () => {
    setScanResults([]);
    setIsScanning(true);

    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // Fires continuously while no QR code is in frame — intentionally ignored
        }
      );
    } catch (err) {
      console.error("Failed to start camera:", err);
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Failed to stop camera:", err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

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
              Mark Attendance
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
      <div style={{ maxWidth: "1020px", margin: "0 auto", padding: "40px 24px" }}>
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

        <h1
          style={{
            fontSize: "20px",
            fontWeight: 700,
            marginBottom: "20px",
            color: "#0f172a",
          }}
        >
          Mark Attendance
        </h1>

        <div
          style={{
            display: "flex",
            gap: "24px",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {/* Left column: form + start/stop control */}
          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "24px",
              flex: "1 1 380px",
              minWidth: "320px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
              <div>
                <label style={labelStyle}>Session</label>
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  disabled={isScanning}
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
                  disabled={!selectedSessionId || isScanning}
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
                  disabled={isScanning}
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
                  disabled={!selectedLevel || isScanning}
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
            </div>

            {!isScanning ? (
              <button
                onClick={startScanning}
                disabled={!canStartScanning}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  backgroundColor: canStartScanning ? "#1e40af" : "#94a3b8",
                  color: "#fff",
                  fontWeight: 700,
                  border: "none",
                  cursor: canStartScanning ? "pointer" : "not-allowed",
                  fontSize: "14px",
                }}
              >
                Start Scanning
              </button>
            ) : (
              <button
                onClick={stopScanning}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  backgroundColor: "#b91c1c",
                  color: "#fff",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Stop Scanning
              </button>
            )}
          </div>

          {/* Right column: camera feed + scan log */}
          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "24px",
              flex: "1 1 380px",
              minWidth: "320px",
            }}
          >
            <div
              id={SCANNER_ELEMENT_ID}
              style={{ width: "100%", borderRadius: "10px", overflow: "hidden" }}
            />

            {scanResults.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
                <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Scan Log</h2>
                {scanResults.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      backgroundColor: r.success ? "#dcfce7" : "#fee2e2",
                      color: r.success ? "#166534" : "#991b1b",
                      fontSize: "14px",
                    }}
                  >
                    {r.message}
                  </div>
                ))}
              </div>
            )}

            {!isScanning && scanResults.length === 0 && (
              <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "12px" }}>
                Camera preview and scan results will appear here once scanning starts.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}