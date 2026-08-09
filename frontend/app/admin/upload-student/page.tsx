"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Papa from "papaparse";

interface BulkRowResult {
  matricNumber: string;
  success: boolean;
  message: string;
}

interface BulkUploadResponse {
  totalRows: number;
  successCount: number;
  failureCount: number;
  results: BulkRowResult[];
}

interface CsvRow {
  matricNumber: string;
  fullName: string;
  email: string;
  level: string;
}

export default function UploadStudentPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [matricNumber, setMatricNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [bulkStatus, setBulkStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [bulkErrorMessage, setBulkErrorMessage] = useState("");
  const [bulkResult, setBulkResult] = useState<BulkUploadResponse | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin");

    if (!stored) {
      router.push("/admin/login");
      return;
    }

    setIsAuthorized(true);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const adminData = JSON.parse(sessionStorage.getItem("admin") || "{}");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminData.token}`,
        },
        body: JSON.stringify({
          matricNumber,
          fullName,
          email,
          level: Number(level),
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `Request failed with status ${response.status}`);
      }

      setStatus("success");
      setMatricNumber("");
      setFullName("");
      setEmail("");
      setLevel("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setCsvFile(file);
    setBulkStatus("idle");
    setBulkResult(null);
    setBulkErrorMessage("");
  };

  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleBulkUpload = async () => {
    if (!csvFile) return;

    setBulkStatus("loading");
    setBulkErrorMessage("");
    setBulkResult(null);

    Papa.parse<CsvRow>(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (parsed) => {
        try {
          const rows = parsed.data
            .filter((row) => row.matricNumber && row.fullName && row.email)
            .map((row) => ({
              matricNumber: row.matricNumber.trim(),
              fullName: row.fullName.trim(),
              email: row.email.trim(),
              level: Number(row.level),
            }));

          if (rows.length === 0) {
            setBulkStatus("error");
            setBulkErrorMessage("No valid rows found in the CSV file.");
            return;
          }

          const adminData = JSON.parse(sessionStorage.getItem("admin") || "{}");

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students/bulk`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${adminData.token}`,
            },
            body: JSON.stringify(rows),
          });

          if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || `Request failed with status ${response.status}`);
          }

          const result: BulkUploadResponse = await response.json();
          setBulkResult(result);
          setBulkStatus("done");
        } catch (err) {
          setBulkStatus("error");
          setBulkErrorMessage(err instanceof Error ? err.message : "Something went wrong");
        }
      },
      error: (err) => {
        setBulkStatus("error");
        setBulkErrorMessage(err.message || "Failed to parse CSV file.");
      },
    });
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin");
    router.push("/admin/login");
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    color: "#0f172a",
    backgroundColor: "#fff",
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
              UPLOAD STUDENT
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

      <div style={{ maxWidth: "980px", margin: "0 auto", padding: "40px 24px 64px" }}>
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
            display: "flex",
            gap: "24px",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {/* Single student upload */}
          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "24px",
              flex: "1 1 420px",
              minWidth: "320px",
            }}
          >
            <h1 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", color: "#0f172a" }}>
              Upload Single Student
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
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, color: "#0f172a" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, color: "#0f172a" }}>
                  Level
                </label>
                <input
                  type="number"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                style={{
                  padding: "14px",
                  borderRadius: "10px",
                  backgroundColor: "#1e40af",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "15px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {status === "loading" ? "Uploading..." : "Upload Student"}
              </button>

              {status === "success" && (
                <p style={{ color: "#16a34a" }}>Student uploaded successfully.</p>
              )}
              {status === "error" && (
                <p style={{ color: "#dc2626" }}>Error: {errorMessage}</p>
              )}
            </form>
          </div>

          {/* Bulk CSV upload */}
          <div
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "24px",
              flex: "1 1 420px",
              minWidth: "320px",
            }}
          >
            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "#0f172a" }}>
              Bulk Upload via CSV
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>
              CSV columns: <code>matricNumber, fullName, email, level</code> (header row required)
            </p>

            {/* Hidden native input, triggered by styled button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCsvFileChange}
              style={{ display: "none" }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <button
                type="button"
                onClick={handleChooseFileClick}
                style={{
                  padding: "10px 18px",
                  borderRadius: "8px",
                  backgroundColor: "#eff6ff",
                  color: "#1e40af",
                  fontWeight: 600,
                  fontSize: "14px",
                  border: "1px solid #1e40af",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Choose File
              </button>
              <span
                style={{
                  fontSize: "13px",
                  color: csvFile ? "#0f172a" : "#94a3b8",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {csvFile ? csvFile.name : "No file chosen"}
              </span>
            </div>

            <button
              onClick={handleBulkUpload}
              disabled={!csvFile || bulkStatus === "loading"}
              style={{
                display: "block",
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                backgroundColor: csvFile ? "#1e40af" : "#94a3b8",
                color: "#fff",
                fontWeight: 700,
                fontSize: "15px",
                border: "none",
                cursor: csvFile ? "pointer" : "not-allowed",
              }}
            >
              {bulkStatus === "loading" ? "Uploading..." : "Upload CSV"}
            </button>

            {bulkStatus === "error" && (
              <p style={{ color: "#dc2626", marginTop: "12px", fontSize: "14px" }}>
                Error: {bulkErrorMessage}
              </p>
            )}

            {bulkStatus === "done" && bulkResult && (
              <div style={{ marginTop: "16px" }}>
                <p style={{ color: "#0f172a", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>
                  {bulkResult.successCount} of {bulkResult.totalRows} students uploaded successfully.
                </p>

                <div
                  style={{
                    maxHeight: "240px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {bulkResult.results.map((r, idx) => (
                    <div
                      key={`${r.matricNumber}-${idx}`}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "6px",
                        backgroundColor: r.success ? "#dcfce7" : "#fee2e2",
                        color: r.success ? "#166534" : "#991b1b",
                        fontSize: "13px",
                      }}
                    >
                      {r.matricNumber || "(missing matric number)"}: {r.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}