"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TopBar from "../components/topbar";
import { supabase } from "../../lib/supabase";
import {
  getStudentWallet,
  getUnlockedCharacterIds,
} from "../../lib/rewards";

type CharacterOption = {
  id: string;
  name: string;
  portrait: string;
  full: string;
  cost: number;
  free?: boolean;
};

const characterOptions: CharacterOption[] = [
  {
    id: "warrior",
    name: "Warrior",
    portrait: "/characters/portraits/warrior.png",
    full: "/characters/full/warrior.png",
    cost: 0,
    free: true,
  },
  {
    id: "rogue",
    name: "Rogue",
    portrait: "/characters/portraits/rogue.png",
    full: "/characters/full/rogue.png",
    cost: 8,
  },
  {
    id: "cleric",
    name: "Cleric",
    portrait: "/characters/portraits/cleric.png",
    full: "/characters/full/cleric.png",
    cost: 10,
  },
  {
    id: "ranger",
    name: "Ranger",
    portrait: "/characters/portraits/ranger.png",
    full: "/characters/full/ranger.png",
    cost: 10,
  },
  {
    id: "fairy",
    name: "Fairy",
    portrait: "/characters/portraits/fairy.png",
    full: "/characters/full/fairy.png",
    cost: 10,
  },
  {
    id: "ninja",
    name: "Ninja",
    portrait: "/characters/portraits/ninja.png",
    full: "/characters/full/ninja.png",
    cost: 10,
  },
  {
    id: "bard",
    name: "Bard",
    portrait: "/characters/portraits/bard.png",
    full: "/characters/full/bard.png",
    cost: 10,
  },
  {
    id: "necromancer",
    name: "Necromancer",
    portrait: "/characters/portraits/necromancer.png",
    full: "/characters/full/necromancer.png",
    cost: 10,
  },
  {
    id: "king",
    name: "King",
    portrait: "/characters/portraits/king.png",
    full: "/characters/full/king.png",
    cost: 10,
  },
  {
    id: "queen",
    name: "Queen",
    portrait: "/characters/portraits/queen.png",
    full: "/characters/full/queen.png",
    cost: 10,
  },
  {
    id: "druid",
    name: "Druid",
    portrait: "/characters/portraits/druid.png",
    full: "/characters/full/druid.png",
    cost: 10,
  },
  {
    id: "monk",
    name: "Monk",
    portrait: "/characters/portraits/monk.png",
    full: "/characters/full/monk.png",
    cost: 10,
  },
  {
    id: "samurai",
    name: "Samurai",
    portrait: "/characters/portraits/samurai.png",
    full: "/characters/full/samurai.png",
    cost: 10,
  },
  {
    id: "pirate",
    name: "Pirate",
    portrait: "/characters/portraits/pirate.png",
    full: "/characters/full/pirate.png",
    cost: 10,
  },
  {
    id: "wizard",
    name: "Wizard",
    portrait: "/characters/portraits/wizard.png",
    full: "/characters/full/wizard.png",
    cost: 10,
  },
];

const DEFAULT_CHARACTER = characterOptions[0];

function AnimatedWorldBackground() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-100"
        style={{ backgroundImage: "url('/images/background/profile-bg.png')" }}
      />
      <div className="bg-drift-layer pointer-events-none absolute inset-[-4%] opacity-25" />
      <div className="pointer-events-none absolute inset-0 bg-black/25" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-white/10 to-transparent" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="sparkle sparkle-1" />
        <span className="sparkle sparkle-2" />
        <span className="sparkle sparkle-3" />
        <span className="sparkle sparkle-4" />
        <span className="sparkle sparkle-5" />
        <span className="sparkle sparkle-6" />
      </div>
    </>
  );
}

function HangingBoard({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="relative mx-auto w-full pt-10">
      <div className="absolute left-[18%] top-0 h-10 w-1 bg-[#6b3f22]" />
      <div className="absolute right-[18%] top-0 h-10 w-1 bg-[#6b3f22]" />
      <div className="absolute left-[calc(18%-7px)] top-8 h-4 w-4 rounded-full border-[3px] border-[#6b3f22] bg-[#e7d2a4]" />
      <div className="absolute right-[calc(18%-7px)] top-8 h-4 w-4 rounded-full border-[3px] border-[#6b3f22] bg-[#e7d2a4]" />

      <div className="overflow-hidden rounded-[28px] border-[4px] border-[#7a4a28] bg-[#8b5a2b] shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
        <div className="bg-[#ead7ad] px-6 py-8 text-center">
          <h2 className="text-2xl font-black tracking-wide text-[#2f170d] md:text-5xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 text-base font-bold text-[#51311f] md:text-lg">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SoftQuestCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[20px] border-[4px] border-[#6a452d] bg-[#4b3428]/80 shadow-[0_14px_30px_rgba(0,0,0,0.35)] backdrop-blur-[2px] ${className}`}
    >
      <div className="bg-[#d2c0a0]">{children}</div>
    </div>
  );
}

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
  return (
    <div
      className={`portrait-pulse flex items-center justify-center overflow-hidden rounded-full border-[4px] border-[#7a4a28] bg-[#f8ebc8] shadow-[0_8px_20px_rgba(0,0,0,0.2)] ${className}`}
    >
      <img src={src} alt={alt} className={`object-cover ${imgClassName}`} />
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterOption>(DEFAULT_CHARACTER);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [grade, setGrade] = useState("Grade 3");
  const [section, setSection] = useState("");
  const [guardian, setGuardian] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [starBalance, setStarBalance] = useState(0);
  const [unlockedCharacters, setUnlockedCharacters] = useState<string[]>([
    "warrior",
  ]);

  useEffect(() => {
    const user = localStorage.getItem("alitaUser");

    if (!user) {
      router.push("/login");
      return;
    }

    const currentStudentId = localStorage.getItem("studentId") || "";
    const savedData = localStorage.getItem("alitaStudentProfile");

    if (savedData) {
      const profile = JSON.parse(savedData);

      const matchedCharacter =
        characterOptions.find((char) => char.id === profile.characterId) ||
        characterOptions.find((char) => char.portrait === profile.avatar) ||
        DEFAULT_CHARACTER;

      setSelectedCharacter(matchedCharacter);
      setFullName(profile.fullName || "");
      setUsername(profile.username || "");
      setGrade(profile.grade || "Grade 3");
      setSection(profile.section || "");
      setGuardian(profile.guardian || "");
    }

    if (currentStudentId) {
      loadRewardData(currentStudentId);
    }
  }, [router]);

  async function loadRewardData(id: string) {
    try {
      const wallet = await getStudentWallet(id);
      const unlocked = await getUnlockedCharacterIds(id);

      setStarBalance(wallet?.star_balance || 0);
      setUnlockedCharacters(["warrior", ...(unlocked || [])]);
    } catch (error) {
      console.error("Failed to load reward data:", error);
    }
  }

  function isUnlocked(character: CharacterOption) {
    return character.free || unlockedCharacters.includes(character.id);
  }

  async function saveCharacter(character: CharacterOption) {
    if (!isUnlocked(character)) return;

    try {
      setIsSaving(true);
      setSelectedCharacter(character);
      setMessage("");

      const currentStudentId = localStorage.getItem("studentId");

      const profileData = {
        id: currentStudentId || "",
        characterId: character.id,
        avatar: character.portrait,
        fullCharacter: character.full,
        fullName,
        username,
        grade,
        section,
        guardian,
      };

      localStorage.setItem("alitaStudentProfile", JSON.stringify(profileData));

      if (currentStudentId) {
        await supabase
          .from("students")
          .update({
            avatar: character.portrait,
            full_character: character.full,
          })
          .eq("id", currentStudentId);
      }

      setMessage(`${character.name} selected successfully!`);
    } catch (error) {
      setMessage("Failed to update character.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  }

  function logout() {
    localStorage.removeItem("alitaUser");
    localStorage.removeItem("studentId");
    localStorage.removeItem("teacherId");
    router.push("/login");
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-[#2c1b10]">
      <AnimatedWorldBackground />

      <div className="relative z-10">
        <TopBar
          studentName={fullName || "Student"}
          studentPortrait={selectedCharacter.portrait}
          onLogout={logout}
        />

        <main className="mx-auto max-w-7xl px-5 py-8 md:px-10">
          <HangingBoard
            title="HERO PROFILE"
            subtitle="Locked heroes can be bought in the Rewards Shop."
          />

          <div className="mt-6 inline-block rounded-2xl border-[3px] border-[#8a5a35] bg-[#fff3cf] px-5 py-3 font-black text-[#5b341c] shadow-sm">
            Stars Available: ⭐ {starBalance}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
            <SoftQuestCard className="profile-card-float">
              <div className="p-5">
                <div className="rounded-[18px] border-[4px] border-[#6a452d] bg-[#7f5a43] p-4 shadow-inner">
                  <div className="mx-auto mb-4 flex justify-center">
                    <PortraitCircle
                      src={selectedCharacter.portrait}
                      alt={selectedCharacter.name}
                      className="h-28 w-28"
                      imgClassName="h-full w-full"
                    />
                  </div>

                  <div className="character-stage mb-4 flex justify-center rounded-[16px] border-[4px] border-[#5c3925] bg-[#d8c19b] p-3">
                    <img
                      src={selectedCharacter.full}
                      alt={selectedCharacter.name}
                      className="main-character-bounce h-56 w-auto object-contain drop-shadow-[0_12px_10px_rgba(0,0,0,0.25)]"
                    />
                  </div>

                  <h2 className="text-center text-3xl font-black text-[#fff3dc]">
                    {fullName || "Student Name"}
                  </h2>

                  <p className="mt-1 text-center text-lg font-black text-[#f7ddb0]">
                    PLAYER
                  </p>

                  <p className="mb-5 text-center text-base font-black text-[#f4d29c]">
                    {selectedCharacter.name}
                  </p>

                  <div className="space-y-3 text-left">
                    <div className="rounded-xl border-[3px] border-[#8a5a35] bg-[#f9efd0] px-4 py-3 font-black text-[#5b341c] shadow-sm">
                      Username: {username || "Not set"}
                    </div>
                    <div className="rounded-xl border-[3px] border-[#8a5a35] bg-[#f9efd0] px-4 py-3 font-black text-[#5b341c] shadow-sm">
                      Grade: {grade || "Not set"}
                    </div>
                    <div className="rounded-xl border-[3px] border-[#8a5a35] bg-[#f9efd0] px-4 py-3 font-black text-[#5b341c] shadow-sm">
                      Section: {section || "Not set"}
                    </div>
                  </div>
                </div>
              </div>
            </SoftQuestCard>

            <SoftQuestCard className="profile-card-float-delayed">
              <div className="p-6 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-3xl font-black text-[#2f170d] md:text-5xl">
                      YOUR CHARACTERS
                    </h3>

                    <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-[#5c3c2a]">
                      Only unlocked characters can be selected here.
                    </p>
                  </div>

                  <Link
                    href="/rewards"
                    className="inline-flex items-center justify-center rounded-[18px] border-[4px] border-[#355e2b] bg-[#8fd36b] px-3 py-3 font-black text-[#3b3b12] shadow-[4px_4px_0_#5d8f43] transition hover:-translate-y-1"
                  >
                    GO TO REWARDS
                  </Link>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {characterOptions.map((character, index) => {
                    const isSelected = selectedCharacter.id === character.id;
                    const unlocked = isUnlocked(character);

                    return (
                      <button
                        key={character.id}
                        type="button"
                        onClick={() => unlocked && saveCharacter(character)}
                        disabled={!unlocked || isSaving}
                        className={`character-card group rounded-[20px] border-[3px] p-3 shadow-sm transition duration-200 ${isSelected
                            ? "border-[#1ca83c] bg-[#eef8d4] shadow-[0_0_0_4px_rgba(28,168,60,0.15)]"
                            : unlocked
                              ? "border-[#9a673f] bg-[#f4e7bf] hover:-translate-y-1 hover:shadow-md"
                              : "cursor-not-allowed border-[#7c6c58] bg-[#d7ccb7] opacity-70"
                          } ${isSaving ? "opacity-80" : ""}`}
                        style={{ animationDelay: `${index * 0.12}s` }}
                        title={character.name}
                      >
                        <div className="relative flex h-28 items-center justify-center rounded-[16px] bg-[#fff7df]">
                          <img
                            src={character.portrait}
                            alt={character.name}
                            className={`character-icon h-20 w-20 object-contain transition ${unlocked ? "group-hover:scale-105" : "grayscale"
                              }`}
                          />
                          {!unlocked && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-[16px] bg-black/20">
                              <span className="rounded-full bg-[#5b341c] px-3 py-1 text-xs font-black text-[#fff3cf]">
                                LOCKED
                              </span>
                            </div>
                          )}
                        </div>

                        <p className="mt-3 text-center text-base font-black text-[#5b341c]">
                          {character.name}
                        </p>

                        <p className="mt-1 text-center text-xs font-black text-[#7a5231]">
                          {unlocked
                            ? "READY TO USE"
                            : `BUY IN SHOP • ⭐ ${character.cost}`}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {message && (
                  <div className="mt-6 inline-block rounded-2xl border-[3px] border-[#4d7b35] bg-[#dff3c5] px-5 py-3 font-black text-[#23411a] shadow-sm">
                    {message}
                  </div>
                )}
              </div>
            </SoftQuestCard>
          </div>
        </main>
      </div>

      <style jsx global>{`
        .bg-drift-layer {
          background-image: url("/images/background/profile-bg.png");
          background-size: cover;
          background-position: center;
          animation: bgDrift 18s ease-in-out infinite alternate;
          transform: scale(1.08);
          filter: blur(2px);
        }

        .main-character-bounce {
          animation: heroBounce 2.2s ease-in-out infinite;
          transform-origin: center bottom;
        }

        .character-card {
          animation: cardFloat 4s ease-in-out infinite;
          will-change: transform;
        }

        .character-icon {
          animation: iconBreathe 2.6s ease-in-out infinite;
        }

        .portrait-pulse {
          animation: portraitPulse 2.8s ease-in-out infinite;
        }

        .profile-card-float {
          animation: softPanelFloat 4.6s ease-in-out infinite;
        }

        .profile-card-float-delayed {
          animation: softPanelFloat 5.4s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        .character-stage {
          position: relative;
          overflow: hidden;
        }

        .character-stage::after {
          content: "";
          position: absolute;
          bottom: 12px;
          left: 50%;
          width: 90px;
          height: 18px;
          transform: translateX(-50%);
          background: radial-gradient(
            ellipse at center,
            rgba(0, 0, 0, 0.24) 0%,
            rgba(0, 0, 0, 0.08) 60%,
            transparent 100%
          );
          border-radius: 999px;
          animation: shadowBounce 2.2s ease-in-out infinite;
        }

        .sparkle {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: rgba(255, 239, 184, 0.55);
          box-shadow: 0 0 20px rgba(255, 239, 184, 0.5);
          animation: sparkleFloat linear infinite;
        }

        .sparkle-1 {
          left: 8%;
          top: 82%;
          animation-duration: 13s;
          animation-delay: 0s;
        }

        .sparkle-2 {
          left: 20%;
          top: 68%;
          animation-duration: 16s;
          animation-delay: 2s;
        }

        .sparkle-3 {
          left: 42%;
          top: 78%;
          animation-duration: 15s;
          animation-delay: 1s;
        }

        .sparkle-4 {
          left: 64%;
          top: 72%;
          animation-duration: 18s;
          animation-delay: 3s;
        }

        .sparkle-5 {
          left: 80%;
          top: 84%;
          animation-duration: 14s;
          animation-delay: 1.5s;
        }

        .sparkle-6 {
          left: 92%;
          top: 76%;
          animation-duration: 17s;
          animation-delay: 4s;
        }

        @keyframes heroBounce {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          25% {
            transform: translateY(-8px) scale(1.02);
          }
          50% {
            transform: translateY(-14px) scale(1.03);
          }
          75% {
            transform: translateY(-7px) scale(1.015);
          }
        }

        @keyframes shadowBounce {
          0%,
          100% {
            transform: translateX(-50%) scaleX(1);
            opacity: 0.28;
          }
          50% {
            transform: translateX(-50%) scaleX(0.78);
            opacity: 0.16;
          }
        }

        @keyframes bgDrift {
          0% {
            transform: scale(1.08) translate3d(-10px, -8px, 0);
          }
          50% {
            transform: scale(1.12) translate3d(12px, -2px, 0);
          }
          100% {
            transform: scale(1.1) translate3d(-6px, 10px, 0);
          }
        }

        @keyframes sparkleFloat {
          0% {
            transform: translateY(0) scale(0.8);
            opacity: 0;
          }
          15% {
            opacity: 0.8;
          }
          50% {
            transform: translateY(-180px) scale(1);
            opacity: 0.7;
          }
          100% {
            transform: translateY(-340px) scale(0.7);
            opacity: 0;
          }
        }

        @keyframes cardFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes iconBreathe {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.06);
          }
        }

        @keyframes portraitPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.04);
          }
        }

        @keyframes softPanelFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </div>
  );
}