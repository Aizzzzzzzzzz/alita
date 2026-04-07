"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<"teacher" | "student">("teacher");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("#7f1d1d");
  const [isLoading, setIsLoading] = useState(false);

  const playSound = (src: string, volume = 0.35) => {
    try {
      const audio = new Audio(src);
      audio.volume = volume;
      audio.play().catch(() => {});
    } catch {}
  };

  async function login() {
    if (username.trim() === "" || password.trim() === "") {
      setMessage("Please enter username and password.");
      setMessageColor("#7f1d1d");
      return;
    }

    setIsLoading(true);
    setMessage("");

    if (selectedRole === "student") {
      const { data: student, error } = await supabase
        .from("students")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .single();

      if (error || !student) {
        setMessage("Invalid student login credentials.");
        setMessageColor("#7f1d1d");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("alitaUser", "student");
      localStorage.setItem("studentId", student.id);
      localStorage.setItem(
        "alitaStudentProfile",
        JSON.stringify({
          id: student.id,
          avatar: student.avatar || "🧒",
          fullName: student.full_name,
          username: student.username,
          grade: student.grade_level,
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

    const { data: teacher, error } = await supabase
      .from("teachers")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (error || !teacher) {
      setMessage("Invalid teacher login credentials.");
      setMessageColor("#7f1d1d");
      setIsLoading(false);
      return;
    }

    localStorage.setItem("alitaUser", "teacher");
    localStorage.setItem("teacherId", teacher.id);

    playSound("/sounds/success.mp3", 0.3);
    setMessage("Teacher login successful!");
    setMessageColor("#065f46");

    setTimeout(() => {
      router.push("/teacher");
    }, 700);
  }

  const isTeacher = selectedRole === "teacher";

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

      {/* Clouds */}
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
            maxWidth: "520px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Logo / Title */}
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
              Choose your role and enter your account
            </p>
          </div>

          {/* Teacher / Student buttons */}
          <div
            style={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
              marginBottom: "22px",
            }}
          >
            <button
              type="button"
              onMouseEnter={() => playSound("/sounds/hover.mp3", 0.12)}
              onClick={() => {
                playSound("/sounds/click.mp3");
                setSelectedRole("teacher");
              }}
              style={{
                border: "4px solid #6a4526",
                background: isTeacher ? "#f5a623" : "#f7d18f",
                color: "#3d2817",
                padding: "18px 12px",
                cursor: "pointer",
                fontFamily: "'Press Start 2P', cursive",
                fontSize: "14px",
                boxShadow: isTeacher ? "0 6px 0 #8f5a16" : "0 6px 0 #ae8450",
              }}
            >
              TEACHER
            </button>

            <button
              type="button"
              onMouseEnter={() => playSound("/sounds/hover.mp3", 0.12)}
              onClick={() => {
                playSound("/sounds/click.mp3");
                setSelectedRole("student");
              }}
              style={{
                border: "4px solid #6a4526",
                background: !isTeacher ? "#7ad14b" : "#d8efb8",
                color: "#28401a",
                padding: "18px 12px",
                cursor: "pointer",
                fontFamily: "'Press Start 2P', cursive",
                fontSize: "14px",
                boxShadow: !isTeacher ? "0 6px 0 #4f8f2d" : "0 6px 0 #8cad68",
              }}
            >
              STUDENT
            </button>
          </div>

          {/* Login box */}
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
              Log in as {isTeacher ? "teacher" : "student"}...
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              <input
                type="text"
                placeholder="USERNAME"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                  background: isTeacher ? "#f5a623" : "#58b63f",
                  color: isTeacher ? "#3d2817" : "#f4fff0",
                  padding: "16px 12px",
                  cursor: "pointer",
                  fontFamily: "'Press Start 2P', cursive",
                  fontSize: "13px",
                  boxShadow: isTeacher ? "0 6px 0 #8f5a16" : "0 6px 0 #377625",
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
            {isTeacher
              ? "Teachers manage quizzes, students, and progress"
              : "Students enter learning worlds and earn stars"}
          </div>
        </div>
      </div>
    </div>
  );
}