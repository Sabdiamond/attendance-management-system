"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

function SetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        router.push("/");
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setStatus("error");
      setErrorMessage("No setup token found in the link. Please use the link from your email.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus("error");
      setErrorMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students/set-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `Request failed with status ${response.status}`);
      }

      setStatus("success");
      setNewPassword("");
      setConfirmPassword("");
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
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
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
              SET YOUR PASSWORD
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "40px 24px 64px" }}>
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            padding: "24px",
          }}
        >
          {status === "success" ? (
            <div>
              <p style={{ color: "#16a34a", marginBottom: "8px", fontWeight: 600 }}>
                Password set successfully!
              </p>
              <p style={{ color: "#475569", fontSize: "14px" }}>
                You can now log in with your matric number and new password. Redirecting you to the homepage...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, color: "#0f172a" }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "4px", fontWeight: 600, color: "#0f172a" }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                {status === "loading" ? "Setting Password..." : "Set Password"}
              </button>

              {status === "error" && (
                <p style={{ color: "#dc2626" }}>Error: {errorMessage}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", marginTop: "60px" }}>Loading...</div>}>
      <SetPasswordForm />
    </Suspense>
  );
}