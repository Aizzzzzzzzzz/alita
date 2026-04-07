"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "./components/topbar";

const SUBJECTS = [
  { name: "MATH", image: "/ui/homepage/math.png" },
  { name: "ENGLISH", image: "/ui/homepage/english.png" },
  { name: "FILIPINO", image: "/ui/homepage/filipino.png" },
  { name: "SCIENCE", image: "/ui/homepage/science.png" },
];

export default function HomePage() {
  const [studentName, setStudentName] = useState("Student");
  const [studentAvatar, setStudentAvatar] = useState(
    "/characters/portraits/warrior.png"
  );
  const [leftCharacter, setLeftCharacter] = useState(
    "/ui/assessment/Guide-Char.png"
  );
  const [rightCharacter, setRightCharacter] = useState(
    "/ui/assessment/Guide-Char.png"
  );

  const router = useRouter();

  function logout() {
    localStorage.removeItem("alitaUser");
    localStorage.removeItem("studentId");
    localStorage.removeItem("teacherId");
    router.push("/login");
  }

  useEffect(() => {
    const user = localStorage.getItem("alitaUser");

    if (!user) {
      router.push("/login");
      return;
    }

    const savedProfile = localStorage.getItem("alitaStudentProfile");

    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setStudentName(profile.fullName || "Student");
      setStudentAvatar(profile.avatar || "/characters/portraits/warrior.png");
      setLeftCharacter(profile.fullCharacter || "/characters/full/warrior.png");
      setRightCharacter(profile.fullCharacter || "/characters/full/warrior.png");
    }
  }, [router]);

  function openSubject() {
    router.push("/assessment");
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-cover bg-center text-[#2c1b10]"
      style={{ backgroundImage: "url('/ui/homepage/home-bg.png')" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "rgba(0,0,0,0.15)" }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.10), transparent)",
        }}
      />

      <div className="relative z-10">
        <TopBar
          studentName={studentName}
          studentPortrait={studentAvatar}
          onLogout={logout}
        />

        <main className="relative mx-auto flex min-h-[calc(100vh-90px)] max-w-7xl items-center justify-center px-4 py-8 md:px-8">
          <div
            className="absolute left-4 bottom-8 hidden lg:block"
            style={{ pointerEvents: "none" }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  width: "96px",
                  height: "24px",
                  borderRadius: "999px",
                  background: "rgba(0,0,0,0.25)",
                  filter: "blur(8px)",
                  animation: "shadowBounce 1.8s ease-in-out infinite",
                }}
              />
              <img
                src={leftCharacter}
                alt="Left character"
                className="relative z-10 h-[220px] w-auto object-contain"
                style={{
                  imageRendering: "pixelated",
                  animation: "heroBounce 1.8s ease-in-out infinite",
                  filter: "drop-shadow(0 10px 12px rgba(0,0,0,0.25))",
                }}
              />
            </div>
          </div>

          <div
            className="absolute right-4 bottom-8 hidden lg:block"
            style={{ pointerEvents: "none" }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  width: "96px",
                  height: "24px",
                  borderRadius: "999px",
                  background: "rgba(0,0,0,0.25)",
                  filter: "blur(8px)",
                  animation: "shadowBounce 1.8s ease-in-out infinite",
                }}
              />
              <img
                src={rightCharacter}
                alt="Right character"
                className="relative z-10 h-[220px] w-auto object-contain"
                style={{
                  transform: "scaleX(-1)",
                  imageRendering: "pixelated",
                  animation: "heroBounce 1.8s ease-in-out infinite",
                  filter: "drop-shadow(0 10px 12px rgba(0,0,0,0.25))",
                }}
              />
            </div>
          </div>

          <div className="w-full max-w-[860px] text-center">
            <div className="mb-8">
              <h1
                className="text-4xl font-black tracking-wide md:text-6xl"
                style={{
                  color: "#f4f0dd",
                  textShadow: "3px 3px 0 #3f2a1b",
                }}
              >
                WELCOME TO ALITA
              </h1>
              <p
                className="mt-3 text-sm font-bold md:text-xl"
                style={{
                  color: "#f8e9c8",
                  textShadow: "2px 2px 0 #5b341c",
                }}
              >
                Start your learning adventure
              </p>
            </div>

            <button
              onClick={() => router.push("/assessment")}
              className="mb-10 transition duration-150 hover:scale-105 active:scale-90"
              style={{
                background: "transparent",
                border: "none",
                animation: "buttonBounce 0.95s ease-in-out infinite",
              }}
            >
              <img
                src="/ui/homepage/start.png"
                alt="Start Quest"
                className="w-[300px] object-contain md:w-[380px]"
                style={{
                  imageRendering: "pixelated",
                  filter: "drop-shadow(0 14px 0 rgba(0,0,0,0.65))",
                }}
              />
            </button>

            <div className="mx-auto grid max-w-[760px] grid-cols-2 gap-5 md:gap-6">
              {SUBJECTS.map((subject, index) => (
                <button
                  key={subject.name}
                  onClick={openSubject}
                  className="group relative"
                  style={{
                    background: "transparent",
                    border: "none",
                  }}
                >
                  <img
                    src={subject.image}
                    alt={subject.name}
                    className="w-full h-auto object-contain transition duration-200 group-hover:scale-105 group-active:scale-95"
                    style={{
                      imageRendering: "pixelated",
                      filter: "drop-shadow(0 14px 0 rgba(0,0,0,0.65))",
                      animation: "subjectBounce 2.8s ease-in-out infinite",
                      animationDelay: `${index * 0.18}s`,
                      transformOrigin: "center bottom",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        @keyframes heroBounce {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes shadowBounce {
          0%,
          100% {
            transform: scaleX(1);
            opacity: 0.28;
          }
          50% {
            transform: scaleX(0.78);
            opacity: 0.12;
          }
        }

        @keyframes buttonBounce {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes subjectBounce {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.03);
          }
        }
      `}</style>
    </div>
  );
}