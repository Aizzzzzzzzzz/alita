"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TopBar from "../components/topbar";
import { supabase } from "../../lib/supabase";
import {
  getStudentWallet,
  getUnlockedCharacterIds,
  unlockCharacter,
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

export default function RewardsPage() {
  const router = useRouter();

  const [studentName, setStudentName] = useState("Student");
  const [studentPortrait, setStudentPortrait] = useState(
    "/characters/portraits/warrior.png"
  );
  const [studentId, setStudentId] = useState("");
  const [starBalance, setStarBalance] = useState(0);
  const [unlockedCharacters, setUnlockedCharacters] = useState<string[]>([
    "warrior",
  ]);
  const [selectedCharacterId, setSelectedCharacterId] = useState("warrior");
  const [message, setMessage] = useState("");
  const [buyingId, setBuyingId] = useState("");
  const [equippingId, setEquippingId] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("alitaUser");
    if (!user) {
      router.push("/login");
      return;
    }

    const currentStudentId = localStorage.getItem("studentId") || "";
    setStudentId(currentStudentId);

    const savedData = localStorage.getItem("alitaStudentProfile");
    if (savedData) {
      const profile = JSON.parse(savedData);
      setStudentName(profile.fullName || "Student");
      setStudentPortrait(profile.avatar || "/characters/portraits/warrior.png");
      setSelectedCharacterId(profile.characterId || "warrior");
    }

    if (currentStudentId) {
      loadShopData(currentStudentId);
    }
  }, [router]);

  async function loadShopData(id: string) {
    try {
      const wallet = await getStudentWallet(id);
      const unlocked = await getUnlockedCharacterIds(id);

      setStarBalance(wallet?.star_balance || 0);
      setUnlockedCharacters(["warrior", ...(unlocked || [])]);
    } catch (error) {
      console.error(error);
    }
  }

  function isUnlocked(character: CharacterOption) {
    return character.free || unlockedCharacters.includes(character.id);
  }

  function isEquipped(character: CharacterOption) {
    return selectedCharacterId === character.id;
  }

  async function handleEquip(character: CharacterOption) {
    if (!studentId || !isUnlocked(character)) return;

    try {
      setEquippingId(character.id);
      setMessage("");

      const savedData = localStorage.getItem("alitaStudentProfile");
      const existingProfile = savedData ? JSON.parse(savedData) : {};

      const updatedProfile = {
        ...existingProfile,
        id: studentId,
        characterId: character.id,
        avatar: character.portrait,
        fullCharacter: character.full,
        fullName: existingProfile.fullName || studentName || "Student",
      };

      localStorage.setItem("alitaStudentProfile", JSON.stringify(updatedProfile));

      setSelectedCharacterId(character.id);
      setStudentPortrait(character.portrait);

      await supabase
        .from("students")
        .update({
          avatar: character.portrait,
          full_character: character.full,
        })
        .eq("id", studentId);

      setMessage(`${character.name} equipped successfully!`);
    } catch (error) {
      console.error(error);
      setMessage("Failed to equip character.");
    } finally {
      setEquippingId("");
    }
  }

  async function handleBuy(character: CharacterOption) {
    if (!studentId || character.free || isUnlocked(character)) return;

    try {
      setBuyingId(character.id);
      setMessage("");

      await unlockCharacter(studentId, character.id, character.cost);
      await loadShopData(studentId);

      setMessage(`${character.name} unlocked successfully!`);
    } catch (error: any) {
      setMessage(error?.message || "Failed to buy character.");
    } finally {
      setBuyingId("");
    }
  }

  function logout() {
    localStorage.removeItem("alitaUser");
    localStorage.removeItem("studentId");
    localStorage.removeItem("teacherId");
    router.push("/login");
  }

  return (
    <div
      className="relative min-h-screen overflow-hidden text-[#2c1b10]"
      style={{
        background:
          "linear-gradient(rgba(44,27,16,0.18), rgba(44,27,16,0.18)), url('/ui/rewards/shop-bg.png') center/cover no-repeat",
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="sparkle sparkle-1" />
        <span className="sparkle sparkle-2" />
        <span className="sparkle sparkle-3" />
        <span className="sparkle sparkle-4" />
        <span className="sparkle sparkle-5" />
        <span className="sparkle sparkle-6" />
      </div>

      <div className="relative z-10">
        <TopBar
          studentName={studentName}
          studentPortrait={studentPortrait}
          onLogout={logout}
        />

        <main className="mx-auto max-w-7xl px-5 py-8 md:px-10">
          <div className="overflow-hidden rounded-[28px] border-[4px] border-[#7a4a28] bg-[#8b5a2b] shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
            <div className="bg-[#ead7ad] px-6 py-8 text-center">
              <h2 className="text-2xl font-black tracking-wide text-[#2f170d] md:text-5xl">
                REWARDS SHOP
              </h2>
              <p className="mt-3 text-base font-bold text-[#51311f] md:text-lg">
                Buy locked heroes using stars earned from quests.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="inline-block rounded-2xl border-[3px] border-[#8a5a35] bg-[#fff3cf] px-5 py-3 font-black text-[#5b341c] shadow-sm">
              Your Stars: ⭐ {starBalance}
            </div>

            <Link
              href="/profile"
              className="inline-flex items-center justify-center rounded-[16px] border-[4px] border-[#355e2b] bg-[#8fd36b] px-5 py-3 font-black text-[#23411a] shadow-[4px_4px_0_#5d8f43] transition hover:-translate-y-1 hover:bg-[#9be875]"
            >
              GO TO PROFILE
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {characterOptions.map((character, index) => {
              const unlocked = isUnlocked(character);
              const equipped = isEquipped(character);
              const isBuying = buyingId === character.id;
              const isEquipping = equippingId === character.id;

              return (
                <div
                  key={character.id}
                  className="reward-card overflow-hidden rounded-[24px] border-[4px] border-[#6a452d] bg-[#f4e7bf] shadow-[0_10px_20px_rgba(0,0,0,0.22)]"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="border-b-[4px] border-[#8a5a35] bg-[#d7b37a] px-4 py-3 text-center">
                    <h3 className="text-lg font-black text-[#5b341c]">
                      {character.name}
                    </h3>
                  </div>

                  <div className="p-5">
                    <div className="character-stage flex h-28 items-center justify-center rounded-[18px] border-[3px] border-[#8a5a35] bg-[#fff7df]">
                      <img
                        src={character.full}
                        alt={character.name}
                        className={`character-image h-20 w-auto object-contain ${
                          unlocked ? "" : "grayscale"
                        }`}
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="font-black text-[#5b341c]">
                        {character.free ? "FREE" : `⭐ ${character.cost}`}
                      </p>
                      <p className="text-sm font-black text-[#7a5231]">
                        {equipped
                          ? "EQUIPPED"
                          : unlocked
                          ? "OWNED"
                          : "LOCKED"}
                      </p>
                    </div>

                    <button
                      onClick={() => handleEquip(character)}
                      disabled={!unlocked || equipped || isEquipping}
                      className={`mt-4 w-full rounded-[16px] border-[4px] px-4 py-3 text-center font-black transition ${
                        unlocked && !equipped
                          ? "border-[#355e2b] bg-[#dff3c5] text-[#23411a] shadow-[4px_4px_0_#5d8f43] hover:-translate-y-1"
                          : "cursor-not-allowed border-[#7c6c58] bg-[#d7ccb7] text-[#6b5b4f]"
                      }`}
                    >
                      {equipped
                        ? "EQUIPPED"
                        : isEquipping
                        ? "EQUIPPING..."
                        : "EQUIP"}
                    </button>

                    {character.free ? (
                      <div className="mt-4 rounded-[16px] border-[3px] border-[#355e2b] bg-[#dff3c5] px-4 py-3 text-center font-black text-[#23411a]">
                        DEFAULT HERO
                      </div>
                    ) : unlocked ? (
                      <div className="mt-4 rounded-[16px] border-[3px] border-[#355e2b] bg-[#dff3c5] px-4 py-3 text-center font-black text-[#23411a]">
                        UNLOCKED
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBuy(character)}
                        disabled={isBuying || starBalance < character.cost}
                        className={`mt-4 w-full rounded-[16px] border-[4px] px-4 py-3 text-center font-black shadow-[4px_4px_0_#8a5a35] transition ${
                          starBalance >= character.cost
                            ? "border-[#5b341c] bg-[#f6d28b] text-[#5b341c] hover:-translate-y-1 hover:bg-[#ffe7a8]"
                            : "cursor-not-allowed border-[#7c6c58] bg-[#d7ccb7] text-[#6b5b4f]"
                        }`}
                      >
                        {isBuying ? "BUYING..." : `BUY FOR ⭐ ${character.cost}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {message && (
            <div className="mt-6 inline-block rounded-2xl border-[3px] border-[#4d7b35] bg-[#dff3c5] px-5 py-3 font-black text-[#23411a] shadow-sm">
              {message}
            </div>
          )}
        </main>
      </div>

      <style jsx global>{`
        .reward-card {
          animation: rewardFloat 4.5s ease-in-out infinite;
          will-change: transform;
        }

        .character-image {
          animation: heroBounce 2.4s ease-in-out infinite;
          transform-origin: center bottom;
        }

        .character-stage {
          position: relative;
          overflow: hidden;
        }

        .character-stage::after {
          content: "";
          position: absolute;
          bottom: 10px;
          left: 50%;
          width: 82px;
          height: 14px;
          transform: translateX(-50%);
          background: radial-gradient(
            ellipse at center,
            rgba(0, 0, 0, 0.24) 0%,
            rgba(0, 0, 0, 0.08) 60%,
            transparent 100%
          );
          border-radius: 999px;
          animation: shadowBounce 2.4s ease-in-out infinite;
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
          left: 7%;
          top: 88%;
          animation-duration: 12s;
          animation-delay: 0s;
        }

        .sparkle-2 {
          left: 18%;
          top: 74%;
          animation-duration: 15s;
          animation-delay: 1s;
        }

        .sparkle-3 {
          left: 38%;
          top: 82%;
          animation-duration: 14s;
          animation-delay: 2s;
        }

        .sparkle-4 {
          left: 62%;
          top: 76%;
          animation-duration: 16s;
          animation-delay: 1.5s;
        }

        .sparkle-5 {
          left: 80%;
          top: 86%;
          animation-duration: 13s;
          animation-delay: 3s;
        }

        .sparkle-6 {
          left: 92%;
          top: 72%;
          animation-duration: 17s;
          animation-delay: 2.5s;
        }

        @keyframes rewardFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes heroBounce {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          25% {
            transform: translateY(-6px) scale(1.02);
          }
          50% {
            transform: translateY(-12px) scale(1.03);
          }
          75% {
            transform: translateY(-5px) scale(1.015);
          }
        }

        @keyframes shadowBounce {
          0%,
          100% {
            transform: translateX(-50%) scaleX(1);
            opacity: 0.28;
          }
          50% {
            transform: translateX(-50%) scaleX(0.8);
            opacity: 0.16;
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
      `}</style>
    </div>
  );
}