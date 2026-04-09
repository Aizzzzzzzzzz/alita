"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("#7f1d1d");
  const [isLoading, setIsLoading] = useState(false);

  async function sendResetLink() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setMessage("Please enter your admin email.");
      setMessageColor("#7f1d1d");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: "https://alita-pi.vercel.app/reset-password",
      });

      if (error) {
        setMessage(error.message || "Failed to send reset email.");
        setMessageColor("#7f1d1d");
        return;
      }

      setMessage("Password reset email sent. Check your inbox.");
      setMessageColor("#065f46");
    } catch (error) {
      console.error("Reset email error:", error);
      setMessage("Something went wrong while sending reset email.");
      setMessageColor("#7f1d1d");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: "linear-gradient(to bottom, #7ec7f5 0%, #82cdf8 100%)",
        fontFamily: "'Press Start 2P', cursive",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          background: "#f4ecd6",
          border: "4px solid #6a4526",
          boxShadow: "0 8px 0 #8a6a43",
          padding: "24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <div
            style={{
              fontSize: "clamp(22px, 4vw, 38px)",
              lineHeight: 1.2,
              color: "#8b5cf6",
              textShadow: "4px 4px 0 #5b35a8",
              letterSpacing: "2px",
            }}
          >
            ADMIN RECOVERY
          </div>

          <p
            style={{
              marginTop: "14px",
              fontSize: "11px",
              color: "#3d3d3d",
              lineHeight: 1.8,
            }}
          >
            Enter your admin auth email to receive a password reset link
          </p>
        </div>

        <div style={{ display: "grid", gap: "12px" }}>
          <input
            type="email"
            placeholder="ADMIN EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendResetLink();
            }}
            style={{
              width: "100%",
              border: "4px solid #9c835f",
              background: "#fff8e9",
              padding: "14px 12px",
              outline: "none",
              fontFamily: "'Press Start 2P', cursive",
              fontSize: "12px",
              color: "#4a3726",
            }}
          />

          <button
            type="button"
            disabled={isLoading}
            onClick={sendResetLink}
            style={{
              width: "100%",
              border: "4px solid #6a4526",
              background: "#8b5cf6",
              color: "#ffffff",
              padding: "16px 12px",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontFamily: "'Press Start 2P', cursive",
              fontSize: "13px",
              boxShadow: "0 6px 0 #5b35a8",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "SENDING..." : "SEND RESET EMAIL"}
          </button>
        </div>

        <div
          style={{
            minHeight: "28px",
            marginTop: "16px",
            textAlign: "center",
            fontSize: "11px",
            color: messageColor,
            lineHeight: 1.6,
          }}
        >
          {message}
        </div>

        <button
          type="button"
          onClick={() => router.push("/login")}
          style={{
            marginTop: "10px",
            width: "100%",
            border: "4px solid #6a4526",
            background: "#d8cbb2",
            color: "#4a3726",
            padding: "14px 12px",
            cursor: "pointer",
            fontFamily: "'Press Start 2P', cursive",
            fontSize: "12px",
            boxShadow: "0 6px 0 #9b8866",
          }}
        >
          BACK TO LOGIN
        </button>
      </div>
    </div>
  );
}