import { supabase } from "./supabase";

export async function ensureStudentWallet(studentId: string) {
  if (!studentId) return null;

  const { data: existing, error: selectError } = await supabase
    .from("student_wallets")
    .select("*")
    .eq("student_id", studentId)
    .maybeSingle();

  if (selectError) throw selectError;

  if (existing) return existing;

  const { data, error } = await supabase
    .from("student_wallets")
    .insert([{ student_id: studentId, star_balance: 0, lifetime_stars: 0 }])
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function awardStarsToWallet(studentId: string, stars: number) {
  if (!studentId || stars <= 0) return;

  const wallet = await ensureStudentWallet(studentId);
  if (!wallet) return;

  const nextBalance = (wallet.star_balance || 0) + stars;
  const nextLifetime = (wallet.lifetime_stars || 0) + stars;

  const { error } = await supabase
    .from("student_wallets")
    .update({
      star_balance: nextBalance,
      lifetime_stars: nextLifetime,
      updated_at: new Date().toISOString(),
    })
    .eq("student_id", studentId);

  if (error) throw error;
}

export async function getStudentWallet(studentId: string) {
  if (!studentId) return null;
  return ensureStudentWallet(studentId);
}

export async function getUnlockedCharacterIds(studentId: string) {
  if (!studentId) return [];
  const { data, error } = await supabase
    .from("character_unlocks")
    .select("character_id")
    .eq("student_id", studentId);

  if (error) throw error;

  return (data || []).map((item) => item.character_id);
}

export async function unlockCharacter(
  studentId: string,
  characterId: string,
  cost: number
) {
  if (!studentId) throw new Error("Missing student ID.");

  const wallet = await ensureStudentWallet(studentId);
  if (!wallet) throw new Error("Wallet not found.");

  if ((wallet.star_balance || 0) < cost) {
    throw new Error("Not enough stars.");
  }

  const { data: existing } = await supabase
    .from("character_unlocks")
    .select("id")
    .eq("student_id", studentId)
    .eq("character_id", characterId)
    .maybeSingle();

  if (existing) return { alreadyUnlocked: true };

  const newBalance = wallet.star_balance - cost;

  const { error: unlockError } = await supabase
    .from("character_unlocks")
    .insert([
      {
        student_id: studentId,
        character_id: characterId,
        cost,
      },
    ]);

  if (unlockError) throw unlockError;

  const { error: walletError } = await supabase
    .from("student_wallets")
    .update({
      star_balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("student_id", studentId);

  if (walletError) throw walletError;

  return { alreadyUnlocked: false };
}