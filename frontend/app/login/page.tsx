"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function StudentLoginPage() {
  const router = useRouter();
  const [matricNumber, setMatricNumber] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matricNumber,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `Request failed with status ${response.status}`);
      }

      const student = await response.json();

      sessionStorage.setItem("student", JSON.stringify(student));

      router.push("/student/profile");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    color: "#0f172a",
    backgroundColor: "#fff",
  };

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
              STUDENT LOGIN
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push("/")}
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
          ← Home
        </button>
      </header>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "60px 24px" }}>
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "24px",
          }}
        >
          <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "20px", color: "#0f172a" }}>
            Student Login
          </h1>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, color: "#0f172a" }}>
                Matric Number
              </label>
              <input
                type="text"
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, color: "#0f172a" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
              />
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
              }}
            >
              {status === "loading" ? "Logging in..." : "Login"}
            </button>

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