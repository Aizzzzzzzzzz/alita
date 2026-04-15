import { SUBJECTS } from "../data";
import { SpecialQuiz } from "../types";

type Props = {
  studentName: string;
  studentAvatar: string;
  studentFullCharacter: string;
  viewMode: "premade" | "special";
  setViewMode: (mode: "premade" | "special") => void;
  onOpenSubject: (subject: string) => void;
  specialQuizzes: SpecialQuiz[];
  onOpenSpecialQuiz: (quiz: SpecialQuiz) => void;
  onResetSpecial: () => void;
  onHeroImageError: () => void;
};

const DEFAULT_PORTRAIT = "/characters/portraits/warrior.png";
const DEFAULT_FULL_CHARACTER = "/characters/full/warrior.png";

export default function AssessmentHome({
  studentName,
  studentAvatar,
  studentFullCharacter,
  viewMode,
  setViewMode,
  onOpenSubject,
  specialQuizzes,
  onOpenSpecialQuiz,
  onResetSpecial,
  onHeroImageError,
}: Props) {
  const safeAvatar =
    typeof studentAvatar === "string" && studentAvatar.startsWith("/")
      ? studentAvatar
      : DEFAULT_PORTRAIT;

  const safeFullCharacter =
    typeof studentFullCharacter === "string" && studentFullCharacter.startsWith("/")
      ? studentFullCharacter
      : DEFAULT_FULL_CHARACTER;

  return (
    <div>
      <section className="mb-8">
        <div className="animate-panel relative overflow-hidden rounded-[28px] border-4 border-[#5b341c] bg-[linear-gradient(180deg,#f7e9bd_0%,#e2bf79_100%)] p-6 shadow-[0_6px_0_#8a5a35,0_14px_20px_rgba(0,0,0,0.18)]">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="hero-glow" />
          </div>

          <div className="grid items-center gap-6 md:grid-cols-[140px_1fr]">
            <div className="animate-avatar mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-[26px] border-4 border-[#5b341c] bg-[#fff3cf] text-6xl shadow-[0_6px_0_#8a5a35,0_10px_16px_rgba(0,0,0,0.16)]">
              <img
                src={safeAvatar}
                alt="Student avatar"
                className="h-24 w-24 object-contain"
                style={{ imageRendering: "pixelated" }}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <p className="inline-block rounded-[12px] border-4 border-[#26441d] bg-[#ffee8f] px-3 py-1 text-sm font-black text-[#213b19]">
                  PLAYER READY
                </p>
                <span className="animate-sparkle text-xl">⭐</span>
                <span className="animate-sparkle text-lg" style={{ animationDelay: "0.4s" }}>
                  ⭐
                </span>
              </div>

              <h2 className="text-3xl font-black text-[#5b341c] md:text-5xl">
                Ready for your next quest, {studentName}?
              </h2>

              <p className="mt-3 text-base font-bold text-[#6e472a] md:text-lg">
                Enter a learning world, answer by voice, unlock levels, and collect stars like a true pixel hero.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          marginTop: "18px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => {
            setViewMode("premade");
            onResetSpecial();
          }}
          style={{
            fontSize: "12px",
            lineHeight: 1.4,
            padding: "14px 20px",
            borderRadius: "18px",
            border: "4px solid #5b341c",
            background: viewMode === "premade" ? "#8fd36b" : "#f6d28b",
            color: viewMode === "premade" ? "#213b19" : "#5b341c",
            boxShadow: viewMode === "premade" ? "0 4px 0 #5d8f43" : "0 4px 0 #8a5a35",
            fontWeight: 900,
          }}
        >
          QUESTS
        </button>

        <button
          onClick={() => {
            setViewMode("special");
            onResetSpecial();
          }}
          style={{
            fontSize: "12px",
            lineHeight: 1.4,
            padding: "14px 20px",
            borderRadius: "18px",
            border: "4px solid #5b341c",
            background: viewMode === "special" ? "#8fd36b" : "#f6d28b",
            color: viewMode === "special" ? "#213b19" : "#5b341c",
            boxShadow: viewMode === "special" ? "0 4px 0 #5d8f43" : "0 4px 0 #8a5a35",
            fontWeight: 900,
          }}
        >
          SPECIAL QUESTS
        </button>
      </div>

      {viewMode === "premade" && (
        <>
          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "280px",
              marginTop: "8px",
              marginBottom: "28px",
            }}
          >
            <div
              className="animate-soft-drift"
              style={{
                position: "relative",
                width: "260px",
                height: "260px",
                display: "flex",
                justifyContent: "center",
                alignItems: "end",
              }}
            >
              <div
                className="animate-hero-shadow"
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "130px",
                  height: "28px",
                  borderRadius: "999px",
                  background:
                    "radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.18) 40%, transparent 80%)",
                  filter: "blur(3px)",
                  zIndex: 1,
                }}
              />

              <img
                src={safeFullCharacter}
                alt="Selected Hero"
                className="animate-hero-bounce"
                onError={onHeroImageError}
                style={{
                  position: "relative",
                  zIndex: 2,
                  maxHeight: "220px",
                  width: "auto",
                  objectFit: "contain",
                  imageRendering: "pixelated",
                  filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.2))",
                }}
              />
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {SUBJECTS.map((subject, index) => (
              <button
                key={subject.name}
                onClick={() => onOpenSubject(subject.name)}
                className="group"
                style={{
                  animation: `subjectFloat 2.8s ease-in-out infinite`,
                  animationDelay: `${index * 0.25}s`,
                }}
              >
                <img
                  src={subject.image}
                  alt={subject.name}
                  className="mx-auto w-full max-w-[260px] object-contain transition duration-300 group-hover:scale-110 group-active:scale-95 drop-shadow-[0_16px_0_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_10px_30px_rgba(0,0,0,0.7)]"
                />
              </button>
            ))}
          </div>
        </>
      )}

      {viewMode === "special" && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {specialQuizzes.map((quiz) => (
            <button
              key={quiz.id}
              onClick={() => onOpenSpecialQuiz(quiz)}
              className="rounded-[28px] border-4 border-[#5b341c] bg-[linear-gradient(180deg,#f7e9bd_0%,#e2bf79_100%)] p-6 text-center shadow-[0_6px_0_#8a5a35,0_14px_20px_rgba(0,0,0,0.18)]"
            >
              <div className="mb-3 text-5xl">✨</div>
              <h4 className="text-2xl font-black text-[#5b341c]">{quiz.title}</h4>
              <p className="mt-2 font-bold text-[#7a5231]">{quiz.subject}</p>
              <p className="mt-1 text-sm font-bold text-[#8a5a35]">{quiz.grade_level}</p>
            </button>
          ))}

          {specialQuizzes.length === 0 && (
            <div className="col-span-full rounded-[30px] border-4 border-[#4d4d4d] bg-[linear-gradient(180deg,#e6e6e6_0%,#c9c9c9_100%)] p-8 text-center shadow-[0_8px_0_#7a7a7a,0_16px_24px_rgba(0,0,0,0.18)]">
              <div className="mb-2 text-4xl">📜</div>
              <p className="text-lg font-black text-[#404040]">No Special Quest available yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}