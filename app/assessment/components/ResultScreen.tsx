type Props = {
  title: string;
  subtitle: string;
  earnedStars: number;
  wrongAttempts?: number;
  scoreText?: string;
  onPrimary: () => void;
  onSecondary: () => void;
  onTertiary?: () => void;
  primaryLabel: string;
  secondaryLabel: string;
  tertiaryLabel?: string;
};

export default function ResultScreen({
  title,
  subtitle,
  earnedStars,
  wrongAttempts,
  scoreText,
  onPrimary,
  onSecondary,
  onTertiary,
  primaryLabel,
  secondaryLabel,
  tertiaryLabel,
}: Props) {
  return (
    <div className="rounded-[30px] border-4 border-[#5b341c] bg-[linear-gradient(180deg,#f4e2b7_0%,#e5c27f_100%)] p-6 text-center shadow-[0_8px_0_#8a5a35,0_16px_24px_rgba(0,0,0,0.22)] md:p-8">
      <h2 className="text-3xl font-black text-[#5b341c] md:text-5xl">{title}</h2>
      <p className="mt-3 text-lg font-bold text-[#7a5231]">{subtitle}</p>

      <div className="mt-6 rounded-[30px] border-4 border-[#355e2b] bg-[linear-gradient(180deg,#bfe88b_0%,#8fd36b_100%)] p-6 shadow-[0_8px_0_#5d8f43,0_16px_24px_rgba(0,0,0,0.18)]">
        {wrongAttempts !== undefined && (
          <p className="mt-3 text-lg font-black text-[#2a55a0]">Hearts Used: {wrongAttempts}</p>
        )}

        {scoreText && (
          <p className="mt-3 text-lg font-black text-[#2a55a0]">{scoreText}</p>
        )}

        <p
          style={{
            marginTop: "14px",
            fontWeight: 900,
            color: "#c98a00",
            fontSize: "clamp(40px, 6vw, 70px)",
            letterSpacing: "10px",
            textShadow: "0 4px 0 #8a5a35, 0 6px 12px rgba(0,0,0,0.3)",
            animation: "starPop 0.5s ease",
          }}
        >
          {earnedStars > 0 ? "⭐".repeat(earnedStars) : "No Stars"}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button
          onClick={onPrimary}
          className="rounded-[18px] border-4 border-[#5b341c] bg-[#f6d28b] px-6 py-3 font-black text-[#5b341c] shadow-[4px_4px_0_#8a5a35]"
        >
          {primaryLabel}
        </button>

        <button
          onClick={onSecondary}
          className="rounded-[18px] border-4 border-[#355e2b] bg-[#8fd36b] px-6 py-3 font-black text-[#213b19] shadow-[4px_4px_0_#5d8f43]"
        >
          {secondaryLabel}
        </button>

        {onTertiary && tertiaryLabel && (
          <button
            onClick={onTertiary}
            className="rounded-[18px] border-4 border-[#4d4d4d] bg-[#cfcfcf] px-6 py-3 font-black text-[#2f2f2f] shadow-[4px_4px_0_#8a8a8a]"
          >
            {tertiaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}