"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "../components/topbar";
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
  const [message, setMessage] = useState("");
  const [buyingId, setBuyingId] = useState("");

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
      setStudentPortrait(
        profile.avatar || "/characters/portraits/warrior.png"
      );
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
      className="min-h-screen text-[#2c1b10]"
      style={{
        background:
          "linear-gradient(rgba(44,27,16,0.18), rgba(44,27,16,0.18)), url('/ui/rewards/shop-bg.png') center/cover no-repeat",
      }}
    >
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

        <div className="mt-6 inline-block rounded-2xl border-[3px] border-[#8a5a35] bg-[#fff3cf] px-5 py-3 font-black text-[#5b341c] shadow-sm">
          Your Stars: ⭐ {starBalance}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {characterOptions.map((character) => {
            const unlocked = isUnlocked(character);
            const isBuying = buyingId === character.id;

            return (
              <div
                key={character.id}
                className="overflow-hidden rounded-[24px] border-[4px] border-[#6a452d] bg-[#f4e7bf] shadow-[0_10px_20px_rgba(0,0,0,0.22)]"
              >
                <div className="border-b-[4px] border-[#8a5a35] bg-[#d7b37a] px-4 py-3 text-center">
                  <h3 className="text-lg font-black text-[#5b341c]">
                    {character.name}
                  </h3>
                </div>

                <div className="p-5">
                  <div className="flex h-25 items-center justify-center rounded-[18px] border-[3px] border-[#8a5a35] bg-[#fff7df]">
                    <img
                      src={character.full}
                      alt={character.name}
                      className={`h-20 w-auto object-contain ${
                        unlocked ? "" : "grayscale"
                      }`}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="font-black text-[#5b341c]">
                      {character.free ? "FREE" : `⭐ ${character.cost}`}
                    </p>
                    <p className="text-sm font-black text-[#7a5231]">
                      {unlocked ? "OWNED" : "LOCKED"}
                    </p>
                  </div>

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
  );
}