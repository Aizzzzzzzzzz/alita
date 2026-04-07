import { LEVEL_BOOK_PNG, LEVEL_LOCK_PNG, quizData } from "../data";
import { ProgressData } from "../types";

type Props = {
  selectedSubject: string;
  progressData: ProgressData;
  onBack: () => void;
  onStartLevel: (index: number) => void;
};

export default function SubjectLevels({
  selectedSubject,
  progressData,
  onBack,
  onStartLevel,
}: Props) {
  return (
    <div>
      <div className="mb-6 flex justify-center">
        <button
          onClick={onBack}
          className="rounded-[18px] border-4 border-[#4d4d4d] bg-[#cfcfcf] px-6 py-3 font-black text-[#2f2f2f] shadow-[4px_4px_0_#8a8a8a]"
        >
          ← BACK TO WORLDS
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {quizData[selectedSubject].map((_, index) => {
          const levelKey = `level${index + 1}`;
          const levelProgress = progressData[selectedSubject]?.[levelKey];
          const isLocked = !levelProgress?.unlocked;

          return (
            <div key={levelKey} className="flex justify-center">
              <button
                onClick={() => {
                  if (!isLocked) onStartLevel(index);
                }}
                disabled={isLocked}
                className="relative transition-transform duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: isLocked ? "not-allowed" : "pointer",
                  opacity: isLocked ? 0.7 : 1,
                }}
              >
                <img
                  src={LEVEL_BOOK_PNG}
                  alt={`Level ${index + 1}`}
                  className="h-[240px] w-[180px] object-contain"
                  style={{
                    imageRendering: "pixelated",
                    filter: isLocked
                      ? "grayscale(40%) brightness(0.85)"
                      : "drop-shadow(0 10px 15px rgba(0,0,0,0.3))",
                  }}
                />

                {isLocked && (
                  <img
                    src={LEVEL_LOCK_PNG}
                    alt="Locked"
                    className="absolute left-1/2 top-[40%] h-13 w-12 -translate-x-1/2 -translate-y-1/2"
                    style={{ imageRendering: "pixelated" }}
                  />
                )}

                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                  <div className="mt-10" />
                  <h4 className="text-lg font-black text-[#d6d5d4]">LEVEL {index + 1}</h4>
                  <p className="mt-1 text-sm font-bold text-[#c9c7c6]">
                    {isLocked ? "Locked" : levelProgress?.completed ? "Cleared" : "Open"}
                  </p>
                  <p className="mt-2 text-sm font-black text-[#c98a00]">
                    {levelProgress?.stars && levelProgress.stars > 0 ? "⭐".repeat(levelProgress.stars) : "No Stars"}
                  </p>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}