"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("#7f1d1d");
  const [isLoading, setIsLoading] = useState(false);
  const [adminFailedTries, setAdminFailedTries] = useState(0);

  const playSound = (src: string, volume = 0.35) => {
    try {
      const audio = new Audio(src);
      audio.volume = volume;
      audio.play().catch(() => {});
    } catch {}
  };

  async function login() {
    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setMessage("Please enter your username or email and password.");
      setMessageColor("#7f1d1d");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      // clear old sessions first
      localStorage.removeItem("alitaUser");
      localStorage.removeItem("adminId");
      localStorage.removeItem("teacherId");
      localStorage.removeItem("studentId");
      localStorage.removeItem("alitaStudentProfile");

      // =========================
      // 1) CHECK ADMIN FIRST
      // =========================
      const { data: adminProfile } = await supabase
        .from("admins")
        .select("*")
        .or(`username.eq.${cleanIdentifier},email.eq.${cleanIdentifier}`)
        .maybeSingle();

      if (adminProfile) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminProfile.email,
          password: cleanPassword,
        });

        if (!error && data.user) {
          // reset failed tries when admin logs in successfully
          setAdminFailedTries(0);

          localStorage.setItem("alitaUser", "admin");
          localStorage.setItem("adminId", data.user.id);
          localStorage.removeItem("teacherId");
          localStorage.removeItem("studentId");

          playSound("/sounds/success.mp3", 0.3);
          setMessage("Admin login successful!");
          setMessageColor("#065f46");

          setTimeout(() => {
            router.push("/admin");
          }, 700);
          return;
        } else {
          // count only failed admin login attempts
          const nextFailedTries = adminFailedTries + 1;
          setAdminFailedTries(nextFailedTries);

          if (nextFailedTries >= 3) {
            const goToForgotPassword = window.confirm(
              "Forget password?"
            );

            if (goToForgotPassword) {
              setAdminFailedTries(0);
              router.push("/forgot-password");
              return;
            } else {
              setMessage("Admin login failed.");
              setMessageColor("#7f1d1d");
              return;
            }
          }

          setMessage(
            `Admin login failed. Attempt ${nextFailedTries}/3.`
          );
          setMessageColor("#7f1d1d");
          return;
        }
      }

      // if not admin, reset admin failed tries
      setAdminFailedTries(0);

      // =========================
      // 2) CHECK TEACHER
      // =========================
      const { data: teacher } = await supabase
        .from("teachers")
        .select("*")
        .eq("username", cleanIdentifier)
        .eq("password", cleanPassword)
        .maybeSingle();

      if (teacher) {
        localStorage.setItem("alitaUser", "teacher");
        localStorage.setItem("teacherId", teacher.id);
        localStorage.removeItem("adminId");
        localStorage.removeItem("studentId");

        playSound("/sounds/success.mp3", 0.3);
        setMessage("Teacher login successful!");
        setMessageColor("#065f46");

        setTimeout(() => {
          router.push("/teacher");
        }, 700);
        return;
      }

      // =========================
      // 3) CHECK STUDENT
      // =========================
      const { data: student } = await supabase
        .from("students")
        .select("*")
        .eq("username", cleanIdentifier)
        .eq("password", cleanPassword)
        .maybeSingle();

      if (student) {
        localStorage.setItem("alitaUser", "student");
        localStorage.setItem("studentId", student.id);
        localStorage.removeItem("teacherId");
        localStorage.removeItem("adminId");

        localStorage.setItem(
          "alitaStudentProfile",
          JSON.stringify({
            id: student.id,
            avatar:
              student.avatar && student.avatar.startsWith("/")
                ? student.avatar
                : "/characters/portraits/warrior.png",
            fullCharacter:
              student.full_character && student.full_character.startsWith("/")
                ? student.full_character
                : "/characters/full/warrior.png",
            characterId: "warrior",
            fullName: student.full_name || "",
            username: student.username || "",
            grade: student.grade_level || "Grade 3",
            section: student.section || "",
            guardian: student.guardian_name || "",
          })
        );

        playSound("/sounds/success.mp3", 0.3);
        setMessage("Student login successful!");
        setMessageColor("#065f46");

        setTimeout(() => {
          router.push("/");
        }, 700);
        return;
      }

      setMessage("Invalid login credentials.");
      setMessageColor("#7f1d1d");
    } catch {
      setMessage("Something went wrong during login.");
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
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(to bottom, #7ec7f5 0%, #82cdf8 100%)",
        fontFamily: "'Press Start 2P', cursive",
      }}
    >
      <style jsx>{`
        @keyframes cloudDrift1 {
          0% {
            transform: translateX(-220px);
          }
          100% {
            transform: translateX(calc(100vw + 260px));
          }
        }

        @keyframes cloudDrift2 {
          0% {
            transform: translateX(-280px);
          }
          100% {
            transform: translateX(calc(100vw + 320px));
          }
        }

        @keyframes cloudDrift3 {
          0% {
            transform: translateX(-240px);
          }
          100% {
            transform: translateX(calc(100vw + 300px));
          }
        }
      `}</style>

      <div
        style={{
          position: "absolute",
          top: "35px",
          left: 0,
          width: "130px",
          height: "42px",
          background: "#eaf6ff",
          boxShadow:
            "38px 0 #eaf6ff, 76px 0 #eaf6ff, 18px -18px #eaf6ff, 56px -18px #eaf6ff, 94px -8px #eaf6ff",
          opacity: 0.95,
          animation: "cloudDrift1 34s linear infinite",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "105px",
          left: 0,
          width: "95px",
          height: "34px",
          background: "#eaf6ff",
          boxShadow:
            "28px 0 #eaf6ff, 56px 0 #eaf6ff, 14px -14px #eaf6ff, 42px -14px #eaf6ff",
          opacity: 0.88,
          animation: "cloudDrift2 42s linear infinite",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "70px",
          left: 0,
          width: "150px",
          height: "48px",
          background: "#eaf6ff",
          boxShadow:
            "42px 0 #eaf6ff, 84px 0 #eaf6ff, 20px -18px #eaf6ff, 62px -22px #eaf6ff, 106px -10px #eaf6ff",
          opacity: 0.92,
          animation: "cloudDrift3 50s linear infinite",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "150px",
          left: 0,
          width: "110px",
          height: "36px",
          background: "#eaf6ff",
          boxShadow:
            "30px 0 #eaf6ff, 60px 0 #eaf6ff, 16px -14px #eaf6ff, 46px -16px #eaf6ff",
          opacity: 0.8,
          animation: "cloudDrift1 58s linear infinite",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px 16px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "560px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div
              style={{
                fontSize: "clamp(28px, 5vw, 54px)",
                lineHeight: 1.1,
                color: "#f59b22",
                textShadow: "4px 4px 0 #9a5a12",
                letterSpacing: "3px",
              }}
            >
              ALITA
            </div>

            <div
              style={{
                fontSize: "clamp(28px, 5vw, 54px)",
                lineHeight: 1.1,
                color: "#ff5ca8",
                textShadow: "4px 4px 0 #b0356f",
                letterSpacing: "3px",
                marginTop: "6px",
              }}
            >
              LOGIN
            </div>

            <p
              style={{
                marginTop: "16px",
                fontSize: "11px",
                color: "#2f3b46",
                lineHeight: 1.8,
              }}
            >
              Enter your username or email to continue
            </p>
          </div>

          <div
            style={{
              width: "100%",
              background: "#f4ecd6",
              border: "4px solid #6a4526",
              boxShadow: "0 8px 0 #8a6a43",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#5e4a34",
                marginBottom: "18px",
                lineHeight: 1.6,
              }}
            >
              One login only for admin, teacher, and student
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              <input
                type="text"
                placeholder="USERNAME OR EMAIL"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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

              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") login();
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
                  onClick={() => setShowPassword((prev) => !prev)}
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
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>

              <button
                type="button"
                disabled={isLoading}
                onMouseEnter={() => playSound("/sounds/hover.mp3", 0.12)}
                onClick={() => {
                  playSound("/sounds/click.mp3");
                  login();
                }}
                style={{
                  width: "100%",
                  marginTop: "4px",
                  border: "4px solid #6a4526",
                  background: "#f5a623",
                  color: "#3d2817",
                  padding: "16px 12px",
                  cursor: "pointer",
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: "13px",
                  boxShadow: "0 6px 0 #8f5a16",
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? "LOADING..." : "LOGIN"}
              </button>
            </div>

            <div
              style={{
                minHeight: "28px",
                marginTop: "16px",
                textAlign: "center",
                fontSize: "11px",
                color: messageColor,
                lineHeight: 1.5,
              }}
            >
              {message}
            </div>
          </div>

          <div
            style={{
              marginTop: "26px",
              textAlign: "center",
              fontSize: "11px",
              color: "#42505c",
              lineHeight: 1.8,
            }}
          >
            The system will detect automatically if you are admin, teacher, or
            student
          </div>
        </div>
      </div>
    </div>
  );
}