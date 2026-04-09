"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type TopBarProps = {
  studentName: string;
  studentPortrait: string;
  onLogout: () => void;
};

const DEFAULT_NAME = "Player";
const DEFAULT_PORTRAIT = "/characters/portraits/warrior.png";

/**
 * PortraitCircle
 * Displays the student's portrait inside a circular frame.
 */
function PortraitCircle({
  src,
  alt,
  className = "",
  imgClassName = "",
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  const safeSrc =
    typeof src === "string" && src.startsWith("/") ? src : DEFAULT_PORTRAIT;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-full border-[4px] border-[#7a4a28] bg-[#f8ebc8] shadow-[0_6px_12px_rgba(0,0,0,0.2)] ${className}`}
    >
      <img
        src={safeSrc}
        alt={alt}
        className={`object-cover ${imgClassName}`}
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}

/**
 * TopBar
 * Main navigation bar for the student pages.
 */
export default function TopBar({
  studentName,
  studentPortrait,
  onLogout,
}: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const mobileNavRef = useRef<HTMLDivElement | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [displayName, setDisplayName] = useState(studentName || DEFAULT_NAME);
  const [displayPortrait, setDisplayPortrait] = useState(
    studentPortrait && studentPortrait.startsWith("/")
      ? studentPortrait
      : DEFAULT_PORTRAIT
  );

  useEffect(() => {
    function loadProfile() {
      const saved = localStorage.getItem("alitaStudentProfile");

      if (saved) {
        try {
          const profile = JSON.parse(saved);

          setDisplayName(profile.fullName || studentName || DEFAULT_NAME);
          setDisplayPortrait(
            typeof profile.avatar === "string" && profile.avatar.startsWith("/")
              ? profile.avatar
              : studentPortrait && studentPortrait.startsWith("/")
              ? studentPortrait
              : DEFAULT_PORTRAIT
          );
          return;
        } catch {}
      }

      setDisplayName(studentName || DEFAULT_NAME);
      setDisplayPortrait(
        studentPortrait && studentPortrait.startsWith("/")
          ? studentPortrait
          : DEFAULT_PORTRAIT
      );
    }

    loadProfile();

    function handleStorageChange() {
      loadProfile();
    }

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleStorageChange);
    };
  }, [studentName, studentPortrait]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setMenuOpen(false);
      }

      if (mobileNavRef.current && !mobileNavRef.current.contains(target)) {
        setNavOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navBase =
    "inline-flex h-[56px] items-center justify-center rounded-[18px] border-[4px] border-[#5b341c] px-5 font-black text-[#5b341c]";

  const navBtn =
    `${navBase} bg-[#f6d28b] shadow-[4px_4px_0_#8a5a35] transition-colors duration-150 hover:bg-[#ffe7a8]`;

  const navBtnActive =
    `${navBase} bg-[#ffe7a8] shadow-[4px_4px_0_#8a5a35]`;

  const mobileBtn =
    "block w-full rounded-[16px] border-[4px] border-[#5b341c] px-4 py-3 text-center font-black text-[#5b341c] bg-[#f6d28b] shadow-[4px_4px_0_#8a5a35] hover:bg-[#ffe7a8]";

  const mobileBtnActive =
    "block w-full rounded-[16px] border-[4px] border-[#5b341c] px-4 py-3 text-center font-black text-[#5b341c] bg-[#ffe7a8] shadow-[4px_4px_0_#8a5a35]";

  const navItems = [
    { href: "/", label: "HOME" },
    { href: "/assessment", label: "QUESTS" },
    { href: "/leaderboard", label: "RANKINGS" },
    { href: "/rewards", label: "REWARDS" },
  ];

  return (
    <header className="border-b-[4px] border-[#5b341c] bg-[#d7b37a] shadow-[0_6px_0_#8a5a35]">
      <div className="mx-auto max-w-7xl px-4 py-4 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/images/final-logo.png"
              alt="ALITA Logo"
              className="h-16 w-16 object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] lg:h-20 lg:w-20"
            />

            <div className="min-w-0">
              <h1 className="text-2xl font-black text-[#5b341c] lg:text-3xl">
                ALITA
              </h1>
              <p className="text-xs font-bold text-[#7a5231] lg:text-sm">
                Voice-Enabled Learning System
              </p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname === item.href ? navBtnActive : navBtn}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-3 rounded-[18px] border-[4px] border-[#5b341c] bg-[#ffe7a8] px-3 py-2 font-black text-[#5b341c] shadow-[4px_4px_0_#8a5a35] lg:px-4"
              >
                <PortraitCircle
                  src={displayPortrait}
                  alt="Student"
                  className="h-10 w-10 lg:h-11 lg:w-11"
                  imgClassName="h-full w-full"
                />
                <span className="hidden max-w-32 truncate lg:inline">
                  {displayName}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-16 z-50 w-56 overflow-hidden rounded-[18px] border-[4px] border-[#5b341c] bg-[#fff3cf] shadow-[6px_6px_0_#8a5a35]">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      router.push("/profile");
                    }}
                    className="block w-full border-b-[3px] border-[#d8b57f] px-4 py-3 text-left font-black text-[#5b341c] hover:bg-[#f7e4b0]"
                  >
                    HERO PROFILE
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                    className="block w-full px-4 py-3 text-left font-black text-red-600 hover:bg-[#f7e4b0]"
                  >
                    LOGOUT
                  </button>
                </div>
              )}
            </div>

            <div className="relative lg:hidden" ref={mobileNavRef}>
              <button
                onClick={() => setNavOpen(!navOpen)}
                className="flex h-12 w-12 items-center justify-center rounded-[16px] border-[4px] border-[#5b341c] bg-[#f6d28b] shadow-[4px_4px_0_#8a5a35]"
              >
                ☰
              </button>

              {navOpen && (
                <div className="absolute right-0 top-16 z-50 w-64 rounded-[20px] border-[4px] border-[#5b341c] bg-[#fff3cf] p-4 shadow-[6px_6px_0_#8a5a35]">
                  <div className="flex flex-col gap-3">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={
                          pathname === item.href ? mobileBtnActive : mobileBtn
                        }
                        onClick={() => setNavOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}