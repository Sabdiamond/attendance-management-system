"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface StudentData {
  id: string;
  matricNumber: string;
  fullName: string;
  email: string;
  level: number;
  token: string;
}

interface RegisteredCourse {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  level: number;
  sessionName: string;
  semesterName: string;
  registeredAt: string;
}

export default function RegisteredCoursesPage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [courses, setCourses] = useState<RegisteredCourse[]>([]);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    const stored = sessionStorage.getItem("student");

    if (!stored) {
      router.push("/login");
      return;
    }

    const parsedStudent: StudentData = JSON.parse(stored);
    setStudent(parsedStudent);

    const loadCourses = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/course-registrations/student/${parsedStudent.id}`,
          { headers: { Authorization: `Bearer ${parsedStudent.token}` } }
        );

        if (!response.ok) {
          throw new Error("Failed to load registered courses.");
        }

        setCourses(await response.json());
        setStatus("loaded");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    loadCourses();
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
              MY REGISTERED COURSES
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

        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "24px",
          }}
        >
          <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px", color: "#0f172a" }}>
            My Registered Courses
          </h1>

          {status === "loading" && (
            <p style={{ color: "#64748b", fontSize: "14px" }}>Loading...</p>
          )}

          {status === "error" && (
            <p style={{ color: "#dc2626", fontSize: "14px" }}>
              Could not load your registered courses.
            </p>
          )}

          {status === "loaded" && (
            courses.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "14px" }}>
                You are not registered for any courses yet.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
                      <th style={{ padding: "8px", color: "#334155", fontSize: "13px" }}>Code</th>
                      <th style={{ padding: "8px", color: "#334155", fontSize: "13px" }}>Title</th>
                      <th style={{ padding: "8px", color: "#334155", fontSize: "13px" }}>Session</th>
                      <th style={{ padding: "8px", color: "#334155", fontSize: "13px" }}>Semester</th>
                      <th style={{ padding: "8px", color: "#334155", fontSize: "13px" }}>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c) => (
                      <tr key={`${c.courseId}-${c.semesterName}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px", color: "#0f172a", fontSize: "14px" }}>{c.courseCode}</td>
                        <td style={{ padding: "8px", color: "#0f172a", fontSize: "14px" }}>{c.courseTitle}</td>
                        <td style={{ padding: "8px", color: "#0f172a", fontSize: "14px" }}>{c.sessionName}</td>
                        <td style={{ padding: "8px", color: "#0f172a", fontSize: "14px" }}>{c.semesterName}</td>
                        <td style={{ padding: "8px", color: "#0f172a", fontSize: "14px" }}>
                          {new Date(c.registeredAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}