"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("#7f1d1d");
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
  let mounted = true;

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY" || session) {
      if (mounted) setIsReady(true);
    }
  });

  // force check once
  supabase.auth.getSession().then(({ data }) => {
    if (data?.session && mounted) {
      setIsReady(true);
    }
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

  async function updatePassword() {
    if (!isReady) {
      setMessage("Open this page using the reset link from your email.");
      setMessageColor("#7f1d1d");
      return;
    }

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setMessage("Please enter your new password.");
      setMessageColor("#7f1d1d");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setMessageColor("#7f1d1d");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageColor("#7f1d1d");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword.trim(),
      });

      if (error) {
        setMessage(error.message || "Failed to update password.");
        setMessageColor("#7f1d1d");
        return;
      }

      setMessage("Password updated successfully. Redirecting to login...");
      setMessageColor("#065f46");

      await supabase.auth.signOut();

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      console.error("Update password error:", error);
      setMessage("Something went wrong while updating password.");
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
            RESET PASSWORD
          </div>

          <p
            style={{
              marginTop: "14px",
              fontSize: "11px",
              color: "#3d3d3d",
              lineHeight: 1.8,
            }}
          >
            Create a new password for your admin account
          </p>
        </div>

        <div style={{ display: "grid", gap: "12px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="NEW PASSWORD"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                width: "100%",
                border: "4px solid #9c835f",
                background: "#fff8e9",
                padding: "14px 52px 14px 12px",
                outline: "none",
                fontFamily: "'Press Start 2P', cursive",
                fontSize: "12px",
                color: "#4a3726",
              }}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "18px",
                lineHeight: 1,
                padding: 0,
              }}
            >
              {showNewPassword ? "🙈" : "👁"}
            </button>
          </div>

          <div style={{ position: "relative", width: "100%" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="CONFIRM PASSWORD"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") updatePassword();
              }}
              style={{
                width: "100%",
                border: "4px solid #9c835f",
                background: "#fff8e9",
                padding: "14px 52px 14px 12px",
                outline: "none",
                fontFamily: "'Press Start 2P', cursive",
                fontSize: "12px",
                color: "#4a3726",
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "18px",
                lineHeight: 1,
                padding: 0,
              }}
            >
              {showConfirmPassword ? "🙈" : "👁"}
            </button>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={updatePassword}
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
            {isLoading ? "SAVING..." : "UPDATE PASSWORD"}
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