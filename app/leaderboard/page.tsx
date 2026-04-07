"use client";

// React hooks
import { useEffect, useMemo, useState } from "react";

// Next.js router for page navigation
import { useRouter } from "next/navigation";

// Your reusable top navigation bar
import TopBar from "../components/topbar";

// Supabase connection
import { supabase } from "../../lib/supabase";

// Type for each leaderboard row
type Row = {
  student_id: string;
  name: string;
  avatar: string;
  score: number;
  stars: number;
};

// Small animated background lights / glow
function AnimatedWorldBackground() {
  return (
    <>
      {/* dark overlay */}
      <div className="pointer-events-none absolute inset-0 bg-black/15" />

      {/* top left glow */}
      <div className="pointer-events-none absolute left-[6%] top-[10%] h-16 w-32 rounded-full bg-white/20 blur-sm animate-pulse" />

      {/* top right glow */}
      <div className="pointer-events-none absolute right-[12%] top-[14%] h-20 w-40 rounded-full bg-white/20 blur-sm animate-pulse" />

      {/* bottom left glow */}
      <div className="pointer-events-none absolute bottom-[10%] left-[12%] h-24 w-24 rounded-full bg-[#9be6ff]/20 blur-2xl" />

      {/* bottom right glow */}
      <div className="pointer-events-none absolute bottom-[16%] right-[10%] h-32 w-32 rounded-full bg-[#ffe38a]/10 blur-2xl" />
    </>
  );
}

// Reusable outer panel/card
function PixelPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[18px] border-[4px] border-[#31485d] bg-white/10 backdrop-blur-md shadow-[0_10px_0_#223344,0_18px_40px_rgba(0,0,0,0.35)] ${className}`}
    >
      {/* top decorative line */}
      <div className="absolute inset-x-0 top-0 h-[4px] bg-[#88a9c4]" />

      {/* bottom decorative line */}
      <div className="absolute inset-x-0 bottom-0 h-[4px] bg-[#223344]" />

      {children}
    </div>
  );
}

// Reusable pixel-style button
function PixelButton({
  children,
  className = "",
  onClick,
  active = false,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-[10px] border-[3px] px-3 py-2 text-xs font-black tracking-wide transition active:translate-y-[2px]
      ${
        active
          ? "border-[#6e5620] bg-[#e2c15f] text-[#3c2b06] shadow-[0_4px_0_#8d6c20]"
          : "border-[#2f4254] bg-[#5f7488] text-[#eef7ff] shadow-[0_4px_0_#31485d]"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export default function LeaderboardPage() {
  const router = useRouter();

  // Full leaderboard rows
  const [rows, setRows] = useState<Row[]>([]);

  // Loading state while fetching data
  const [loading, setLoading] = useState(true);

  // Current logged in student id
  const [studentId, setStudentId] = useState("");

  // Current logged in student name
  const [studentName, setStudentName] = useState("Student");

  // Current logged in student portrait
  const [studentAvatar, setStudentAvatar] = useState(
    "/characters/portraits/warrior.png"
  );

  // Search input value
  const [search, setSearch] = useState("");

  // Filter state
  const [filter, setFilter] = useState<"all" | "month">("all");

  // Current pagination page
  const [page, setPage] = useState(1);

  // How many rows per page
  const pageSize = 10;

  // Run once on page load
  useEffect(() => {
    // Check if student is logged in
    const user = localStorage.getItem("alitaUser");

    // If no login data, go back to login page
    if (!user) {
      router.push("/login");
      return;
    }

    // Get saved student id
    const savedStudentId = localStorage.getItem("studentId") || "";

    // Get saved profile data
    const profile = JSON.parse(
      localStorage.getItem("alitaStudentProfile") || "{}"
    );

    // Save to state
    setStudentId(savedStudentId);
    setStudentName(profile.fullName || "Student");
    setStudentAvatar(profile.avatar || "/characters/portraits/warrior.png");

    // Load leaderboard data
    loadLeaderboard();
  }, [router]);

  // Fetch results and student info from Supabase
  async function loadLeaderboard() {
    setLoading(true);

    // Get all result rows
    const { data: results } = await supabase
      .from("results")
      .select("student_id, score, stars");

    // Get all students
    const { data: students } = await supabase
      .from("students")
      .select("id, full_name, avatar");

    // Create a map for quick student lookup
    const map = new Map<string, { name: string; avatar: string }>();

    students?.forEach((s) => {
      map.set(s.id, {
        name: s.full_name,
        avatar: s.avatar || "🧒",
      });
    });

    // Group scores by student
    const grouped = new Map<string, Row>();

    results?.forEach((r) => {
      // If student row does not exist yet, create it
      if (!grouped.has(r.student_id)) {
        grouped.set(r.student_id, {
          student_id: r.student_id,
          name: map.get(r.student_id)?.name || "Student",
          avatar: map.get(r.student_id)?.avatar || "🧒",
          score: 0,
          stars: 0,
        });
      }

      // Add the result score/stars into that student's total
      const row = grouped.get(r.student_id)!;
      row.score += r.score;
      row.stars += r.stars;
    });

    // Sort leaderboard by score first, then stars
    const sorted = Array.from(grouped.values()).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.stars - a.stars;
    });

    // Save sorted rows
    setRows(sorted);

    // Stop loading state
    setLoading(false);
  }

  // Logout function
  function logout() {
    localStorage.removeItem("alitaUser");
    localStorage.removeItem("studentId");
    localStorage.removeItem("teacherId");
    router.push("/login");
  }

  // Handles avatar display
  // If avatar is an image path, show img
  // If avatar is emoji/text, show span
  const renderAvatar = (avatar: string, className: string) => {
    const isImage = typeof avatar === "string" && avatar.startsWith("/");

    if (isImage) {
      return (
        <img
          src={avatar}
          alt="Student Avatar"
          className={`h-full w-full object-cover ${className}`}
        />
      );
    }

    return <span className={className}>{avatar}</span>;
  };

  // Filter rows by search and future filter option
  const filteredRows = useMemo(() => {
    let list = [...rows];

    // Search by student name
    if (search.trim()) {
      list = list.filter((r) =>
        r.name.toLowerCase().includes(search.trim().toLowerCase())
      );
    }

    // Placeholder for future month filter logic
    if (filter === "month") {
      list = [...list];
    }

    return list;
  }, [rows, search, filter]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  // Current visible rows only
  const pagedRows = filteredRows.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Make sure page never goes above total pages
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  // Find current student's rank
  const myRank =
    filteredRows.findIndex((r) => r.student_id === studentId) !== -1
      ? filteredRows.findIndex((r) => r.student_id === studentId) + 1
      : null;

  // Find current student's full row
  const myRow = filteredRows.find((r) => r.student_id === studentId);

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-cover bg-center bg-no-repeat text-white"
      style={{ backgroundImage: "url('/ui/leaderboard/leaderboard-bg.png')" }}
    >
      {/* decorative background */}
      <AnimatedWorldBackground />

      <div className="relative z-10">
        {/* top navigation bar */}
        <TopBar
          studentName={studentName}
          studentPortrait={studentAvatar}
          onLogout={logout}
        />

        {/* page content wrapper */}
        <main className="mx-auto max-w-6xl px-3 py-6 sm:px-4 md:px-8 md:py-8">
          <div className="mx-auto max-w-5xl">
            <PixelPanel className="p-3 md:p-5">
              {/* title header */}
              <div className="mb-4 rounded-[14px] border-[3px] border-[#6c5230] bg-[#5a6f83] px-4 py-3 shadow-[0_4px_0_#31485d]">
                <div className="text-center text-sm font-black uppercase tracking-[1.5px] text-[#ffe08a] md:text-lg">
                  Leaderboards
                </div>
              </div>

              {/* top controls */}
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                {/* search + filter */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 md:flex-1">
                  {/* search box */}
                  <div className="flex flex-1 items-center rounded-[10px] border-[3px] border-[#263949] bg-[#2e4356] px-3 py-2 shadow-[0_4px_0_#1d2a36]">
                    <input
                      type="text"
                      placeholder="Search"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="w-full bg-transparent text-sm font-bold text-white placeholder:text-[#b8ccdb] outline-none"
                    />
                    <span className="ml-2 text-sm">🔍</span>
                  </div>

                  {/* all time filter button */}
                  <PixelButton
                    active={filter === "all"}
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setFilter("all");
                      setPage(1);
                    }}
                  >
                    All Time
                  </PixelButton>
                </div>

                {/* trophy icon */}
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border-[3px] border-[#2f4254] bg-[#5f7488] shadow-[0_4px_0_#31485d]">
                    🏆
                  </div>
                </div>
              </div>

              {/* table header */}
              {/* mobile: only Rank, Player Name, Score */}
              {/* md and up: Rank, Player Name, Score, Stars */}
              <div className="mb-2 grid grid-cols-[50px_minmax(0,1fr)_70px] md:grid-cols-[70px_1fr_130px_90px] rounded-[10px] border-[3px] border-[#3a5267] bg-[#547087] px-2 md:px-3 py-2 text-[10px] md:text-xs font-black uppercase tracking-wide text-[#ffe08a] shadow-[0_4px_0_#31485d]">
                <div>Rank</div>
                <div>Player Name</div>
                <div className="text-center">Score</div>
                <div className="hidden md:block text-center">Stars</div>
              </div>

              {/* table body wrapper */}
              <div className="rounded-[14px] border-[3px] border-[#31485d] bg-[#31485d]/60 p-2 shadow-inner">
                {loading ? (
                  // loading state
                  <div className="flex h-[420px] items-center justify-center text-lg font-black text-[#ffe08a]">
                    Loading leaderboard...
                  </div>
                ) : pagedRows.length === 0 ? (
                  // empty state
                  <div className="flex h-[420px] items-center justify-center text-lg font-black text-[#ffe08a]">
                    No results found.
                  </div>
                ) : (
                  // actual rows
                  <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                    {pagedRows.map((r, index) => {
                      // Actual leaderboard rank
                      const actualRank = (page - 1) * pageSize + index + 1;

                      // Check if this row belongs to current student
                      const isMe = r.student_id === studentId;

                      return (
                        <div
                          key={r.student_id}
                          className={`grid grid-cols-[50px_minmax(0,1fr)_70px] md:grid-cols-[70px_1fr_130px_90px] items-center rounded-[10px] border-[3px] px-2 md:px-3 py-2 text-xs md:text-sm font-black shadow-[0_4px_0_rgba(0,0,0,0.18)]
                          ${
                            isMe
                              ? "border-[#d2a33a] bg-gradient-to-r from-[#6c3f86] via-[#5a4f97] to-[#7e5c2f] text-[#ffe08a]"
                              : "border-[#466177] bg-[#5d7890]/95 text-white"
                          }`}
                        >
                          {/* rank column */}
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="text-xs text-[#ffe08a]">
                              {actualRank}
                            </span>
                          </div>

                          {/* player name column */}
                          {/* min-w-0 is important so truncate works correctly */}
                          <div className="flex min-w-0 items-center gap-2 md:gap-3 overflow-hidden">
                            {/* avatar */}
                            <div className="flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border-[2px] border-[#243746] bg-[#d9ecff] text-lg">
                              {renderAvatar(r.avatar, "text-lg")}
                            </div>

                            {/* player name */}
                            <span className="block min-w-0 truncate uppercase tracking-wide">
                              {r.name}
                            </span>
                          </div>

                          {/* score column */}
                          <div className="text-center tabular-nums">
                            {r.score.toLocaleString()}
                          </div>

                          {/* stars column hidden on mobile */}
                          <div className="hidden md:block text-center tabular-nums">
                            ⭐ {r.stars}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* bottom controls */}
              <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                {/* jump to my rank */}
                <PixelButton
                  className="w-full md:w-auto"
                  onClick={() => {
                    if (!myRank) return;
                    const targetPage = Math.ceil(myRank / pageSize);
                    setPage(targetPage);
                  }}
                >
                  My Rank {myRank ? `#${myRank}` : ""}
                </PixelButton>

                {/* pagination */}
                <div className="flex flex-wrap items-center justify-center gap-2 self-center">
                  <PixelButton
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    ◀ Previous
                  </PixelButton>

                  <div className="rounded-[10px] border-[3px] border-[#2f4254] bg-[#2e4356] px-4 py-2 text-xs font-black text-[#d9ebf8] shadow-[0_4px_0_#1d2a36]">
                    Page {page} / {totalPages}
                  </div>

                  <PixelButton
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next ▶
                  </PixelButton>
                </div>

                {/* close button */}
                <PixelButton
                  className="w-full md:w-auto"
                  onClick={() => router.push("/assessment")}
                >
                  Close
                </PixelButton>
              </div>

              {/* current student summary card */}
              {myRow && (
                <div className="mt-4 rounded-[12px] border-[3px] border-[#3a5267] bg-[#2f4254]/90 px-4 py-3 shadow-[0_4px_0_#1d2a36]">
                  <div className="flex flex-col gap-3 text-sm font-black text-[#dfefff] md:flex-row md:items-center md:justify-between">
                    {/* left side info */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[8px] border-[2px] border-[#243746] bg-[#d9ecff]">
                        {renderAvatar(myRow.avatar, "text-lg")}
                      </div>

                      <div className="min-w-0">
                        <div className="truncate uppercase tracking-wide text-[#ffe08a]">
                          {myRow.name}
                        </div>
                        <div className="text-xs text-[#b9d3e7]">
                          Your current leaderboard standing
                        </div>
                      </div>
                    </div>

                    {/* right side stats */}
                    <div className="flex flex-wrap gap-3">
                      <div>Rank: #{myRank ?? "-"}</div>
                      <div>Score: {myRow.score.toLocaleString()}</div>
                      <div>Stars: ⭐ {myRow.stars}</div>
                    </div>
                  </div>
                </div>
              )}
            </PixelPanel>
          </div>
        </main>
      </div>
    </div>
  );
}