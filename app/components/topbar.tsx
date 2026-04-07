"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type TopBarProps = {
  studentName: string;
  studentPortrait: string;
  onLogout: () => void;
};

/**
 * PortraitCircle
 * Displays the student's portrait inside a circular frame.
 * If the src is an image path, it shows the image.
 * Otherwise, it shows the value as text/emoji fallback.
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
  // Check if the portrait source is an image path
  const isImage = typeof src === "string" && src.startsWith("/");

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-full border-[4px] border-[#7a4a28] bg-[#f8ebc8] shadow-[0_6px_12px_rgba(0,0,0,0.2)] ${className}`}
    >
      {isImage ? (
        <img src={src} alt={alt} className={`object-cover ${imgClassName}`} />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-lg">
          {src}
        </div>
      )}
    </div>
  );
}

/**
 * TopBar
 * Main navigation bar for the student pages.
 * Shows:
 * - ALITA logo and title
 * - Desktop navigation buttons
 * - Student dropdown menu
 * - Mobile hamburger navigation
 */
export default function TopBar({
  studentName,
  studentPortrait,
  onLogout,
}: TopBarProps) {
  // Next.js router for page navigation
  const router = useRouter();

  // Get current page path so active nav button can be highlighted
  const pathname = usePathname();

  // Reference for the profile dropdown area
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Reference for the mobile navigation area
  const mobileNavRef = useRef<HTMLDivElement | null>(null);

  // State for opening/closing the profile dropdown
  const [menuOpen, setMenuOpen] = useState(false);

  // State for opening/closing the mobile navigation
  const [navOpen, setNavOpen] = useState(false);

  /**
   * useEffect
   * Handles closing the dropdown menu and mobile menu
   * when the user clicks outside of them.
   */
  useEffect(() => {
    /**
     * handleClickOutside
     * Detects clicks outside the dropdown and mobile nav,
     * then closes them automatically.
     */
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

    // Cleanup event listener when component unmounts
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Base style shared by desktop nav buttons
  const navBase =
    "inline-flex h-[56px] items-center justify-center rounded-[18px] border-[4px] border-[#5b341c] px-5 font-black text-[#5b341c]";

  // Default desktop nav button style
  const navBtn =
    `${navBase} bg-[#f6d28b] shadow-[4px_4px_0_#8a5a35] transition-colors duration-150 hover:bg-[#ffe7a8]`;

  // Active desktop nav button style
  const navBtnActive =
    `${navBase} bg-[#ffe7a8] shadow-[4px_4px_0_#8a5a35]`;

  // Default mobile nav button style
  const mobileBtn =
    "block w-full rounded-[16px] border-[4px] border-[#5b341c] px-4 py-3 text-center font-black text-[#5b341c] bg-[#f6d28b] shadow-[4px_4px_0_#8a5a35] hover:bg-[#ffe7a8]";

  // Active mobile nav button style
  const mobileBtnActive =
    "block w-full rounded-[16px] border-[4px] border-[#5b341c] px-4 py-3 text-center font-black text-[#5b341c] bg-[#ffe7a8] shadow-[4px_4px_0_#8a5a35]";

  // Navigation items shown in both desktop and mobile menus
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
          {/* Left side: logo and system title */}
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

          {/* Desktop navigation buttons */}
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

          {/* Right side: profile dropdown and mobile menu button */}
          <div className="flex items-center gap-3">
            {/* Student profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-3 rounded-[18px] border-[4px] border-[#5b341c] bg-[#ffe7a8] px-3 py-2 font-black text-[#5b341c] shadow-[4px_4px_0_#8a5a35] lg:px-4"
              >
                <PortraitCircle
                  src={studentPortrait}
                  alt="Student"
                  className="h-10 w-10 lg:h-11 lg:w-11"
                  imgClassName="h-full w-full"
                />
                <span className="hidden lg:inline max-w-32 truncate">
                  {studentName}
                </span>
              </button>

              {/* Dropdown menu content */}
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

            {/* Mobile hamburger navigation */}
            <div className="relative lg:hidden" ref={mobileNavRef}>
              <button
                onClick={() => setNavOpen(!navOpen)}
                className="flex h-12 w-12 items-center justify-center rounded-[16px] border-[4px] border-[#5b341c] bg-[#f6d28b] shadow-[4px_4px_0_#8a5a35]"
              >
                ☰
              </button>

              {/* Mobile nav dropdown */}
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