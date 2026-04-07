"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "../components/topbar";
import { supabase } from "../../lib/supabase";
import { awardStarsToWallet } from "../../lib/rewards";

import { createDefaultProgress, mergeProgress, quizData } from "./data";
import { ProgressData, ProgressRow, SpecialQuestion, SpecialQuiz } from "./types";

import AssessmentHome from "./components/AssessmentHome";
import ProfileGuideModal from "./components/ProfileGuideModal";
import QuestionScreen from "./components/QuestionScreen";
import ResultScreen from "./components/ResultScreen";
import SubjectLevels from "./components/SubjectLevels";

export default function AssessmentPage() {
  const router = useRouter();
  const hasAutoReadRef = useRef(false);

  const [studentName, setStudentName] = useState("Student");
  const [studentAvatar, setStudentAvatar] = useState("🧒");
  const [studentFullCharacter, setStudentFullCharacter] = useState("🧒");
  const [studentId, setStudentId] = useState("");
  const [studentGrade, setStudentGrade] = useState("Grade 3");
  const [showProfileGuide, setShowProfileGuide] = useState(false);

  const [viewMode, setViewMode] = useState<"premade" | "special">("premade");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedLevelIndex, setSelectedLevelIndex] = useState<number | null>(null);

  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [heardText, setHeardText] = useState("");
  const [voiceMessage, setVoiceMessage] = useState("");
  const [recognizedChoice, setRecognizedChoice] = useState("");
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [progressData, setProgressData] = useState<ProgressData>(createDefaultProgress());
  const [aiPromptText, setAiPromptText] = useState("");

  const [specialQuizzes, setSpecialQuizzes] = useState<SpecialQuiz[]>([]);
  const [selectedSpecialQuiz, setSelectedSpecialQuiz] = useState<SpecialQuiz | null>(null);
  const [specialQuestions, setSpecialQuestions] = useState<SpecialQuestion[]>([]);
  const [specialQuestionIndex, setSpecialQuestionIndex] = useState(0);
  const [specialCorrectCount, setSpecialCorrectCount] = useState(0);
  const [showSpecialResult, setShowSpecialResult] = useState(false);

  const currentQuestion = useMemo(() => {
    if (!selectedSubject || selectedLevelIndex === null) return null;
    return quizData[selectedSubject][selectedLevelIndex] || null;
  }, [selectedSubject, selectedLevelIndex]);

  const currentSpecialQuestion = useMemo(() => {
    return specialQuestions[specialQuestionIndex] || null;
  }, [specialQuestions, specialQuestionIndex]);

  function getBackground() {
    const isQuestionScreen =
      (viewMode === "premade" && selectedSubject && selectedLevelIndex !== null) ||
      (viewMode === "special" && selectedSpecialQuiz);

    if (!selectedSubject && !selectedSpecialQuiz) {
      return "/images/background/assessment-bg.png";
    }

    const activeSubject = selectedSubject || selectedSpecialQuiz?.subject || "";

    switch (activeSubject) {
      case "Math":
      case "English":
      case "Filipino":
      case "Science":
        return isQuestionScreen ? "/ui/assessment/quest.png" : "/ui/assessment/quest-bg.png";
      default:
        return "/images/background/assessment-bg.png";
    }
  }

  useEffect(() => {
    const user = localStorage.getItem("alitaUser");
    if (!user) {
      router.push("/login");
      return;
    }

    let loadedAvatar = "🧒";
    let loadedFullCharacter = "🧒";

    const savedProfile = localStorage.getItem("alitaStudentProfile");
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);

      loadedAvatar = profile.avatar || "🧒";
      loadedFullCharacter = profile.fullCharacter || profile.avatar || "🧒";

      setStudentName(profile.fullName || "Student");
      setStudentAvatar(loadedAvatar);
      setStudentFullCharacter(loadedFullCharacter);
      setStudentId(profile.id || localStorage.getItem("studentId") || "");
      setStudentGrade(profile.grade || "Grade 3");
    } else {
      setStudentId(localStorage.getItem("studentId") || "");
    }

    const needsProfileSetup = localStorage.getItem("alitaNeedsProfileSetup");
    const isDefaultProfile = loadedAvatar === "🧒" && loadedFullCharacter === "🧒";

    if (needsProfileSetup === "true" && isDefaultProfile) {
      setShowProfileGuide(true);
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, [router]);

  useEffect(() => {
    if (!studentId) return;

    async function loadStudentProgress() {
      const { data, error } = await supabase
        .from("student_progress")
        .select("subject, level_number, unlocked, completed, stars")
        .eq("student_id", studentId)
        .order("subject", { ascending: true })
        .order("level_number", { ascending: true });

      if (error) {
        const localProgress = localStorage.getItem(`alitaProgress_${studentId}`);
        if (localProgress) {
          setProgressData(JSON.parse(localProgress));
        } else {
          const defaults = createDefaultProgress();
          setProgressData(defaults);
          localStorage.setItem(`alitaProgress_${studentId}`, JSON.stringify(defaults));
        }
        return;
      }

      if (!data || data.length === 0) {
        const defaults = createDefaultProgress();
        setProgressData(defaults);
        localStorage.setItem(`alitaProgress_${studentId}`, JSON.stringify(defaults));
        await syncProgressToSupabase(defaults, studentId);
        return;
      }

      const merged = mergeProgress(data as ProgressRow[]);
      setProgressData(merged);
      localStorage.setItem(`alitaProgress_${studentId}`, JSON.stringify(merged));
    }

    loadStudentProgress();
  }, [studentId]);

  useEffect(() => {
    if (viewMode === "special" && studentGrade) {
      fetchSpecialQuizzes();
    }
  }, [viewMode, studentGrade]);

  useEffect(() => {
    if (
      viewMode === "premade" &&
      selectedSubject &&
      selectedLevelIndex !== null &&
      currentQuestion &&
      !showResult &&
      !hasAutoReadRef.current
    ) {
      hasAutoReadRef.current = true;
      const timer = setTimeout(() => readQuestionAndChoices(), 500);
      return () => clearTimeout(timer);
    }

    if (
      viewMode === "special" &&
      currentSpecialQuestion &&
      !showSpecialResult &&
      !hasAutoReadRef.current
    ) {
      hasAutoReadRef.current = true;
      const timer = setTimeout(() => readSpecialQuestionAndChoices(), 500);
      return () => clearTimeout(timer);
    }
  }, [
    viewMode,
    selectedSubject,
    selectedLevelIndex,
    currentQuestion,
    showResult,
    currentSpecialQuestion,
    showSpecialResult,
  ]);

  async function syncProgressToSupabase(updatedProgress: ProgressData, activeStudentId?: string) {
    const targetStudentId = activeStudentId || studentId;
    if (!targetStudentId) return;

    const rows = Object.entries(updatedProgress).flatMap(([subject, levels]) =>
      Object.entries(levels).map(([levelKey, data]) => ({
        student_id: targetStudentId,
        subject,
        level_number: Number(levelKey.replace("level", "")),
        unlocked: data.unlocked,
        completed: data.completed,
        stars: data.stars,
        updated_at: new Date().toISOString(),
      }))
    );

    await supabase.from("student_progress").upsert(rows, {
      onConflict: "student_id,subject,level_number",
    });
  }

  async function fetchSpecialQuizzes() {
    const { data } = await supabase
      .from("quizzes")
      .select("*")
      .eq("quiz_type", "custom")
      .eq("grade_level", studentGrade)
      .eq("status", "published")
      .order("created_at", { ascending: false });

    setSpecialQuizzes((data || []) as SpecialQuiz[]);
  }

  async function openSpecialQuiz(quiz: SpecialQuiz) {
    const { data } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quiz.id)
      .order("created_at", { ascending: true });

    setSelectedSpecialQuiz(quiz);
    setSpecialQuestions((data || []) as SpecialQuestion[]);
    setSpecialQuestionIndex(0);
    setSpecialCorrectCount(0);
    setShowSpecialResult(false);
    setWrongAttempts(0);
    setRecognizedChoice("");
    setHeardText("");
    setVoiceMessage("");
    setAiPromptText("");
    setShowTryAgain(false);
    hasAutoReadRef.current = false;
  }

  async function saveProgress(updatedProgress: ProgressData) {
    setProgressData(updatedProgress);
    localStorage.setItem(`alitaProgress_${studentId}`, JSON.stringify(updatedProgress));
    await syncProgressToSupabase(updatedProgress);
  }

  async function saveQuizResult(quizId: string, score: number, attempts: number, stars: number) {
    if (!studentId || !quizId) return;

    await supabase.from("results").insert([
      { student_id: studentId, quiz_id: quizId, score, attempts, stars },
    ]);

    if (stars > 0) {
      await awardStarsToWallet(studentId, stars);
    }
  }

  async function ensurePremadeQuizRecord(subject: string, levelNumber: number) {
    const title = `${subject} Level ${levelNumber}`;

    const { data: existing } = await supabase
      .from("quizzes")
      .select("id")
      .eq("quiz_type", "premade")
      .eq("title", title)
      .eq("subject", subject)
      .eq("grade_level", studentGrade)
      .maybeSingle();

    if (existing?.id) return existing.id;

    const { data: inserted, error } = await supabase
      .from("quizzes")
      .insert([
        {
          title,
          subject,
          grade_level: studentGrade,
          quiz_type: "premade",
          instructions: "System pre-made quiz",
        },
      ])
      .select("id")
      .single();

    if (error) return null;
    return inserted.id;
  }

  function logout() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    localStorage.removeItem("alitaUser");
    localStorage.removeItem("studentId");
    localStorage.removeItem("teacherId");
    router.push("/login");
  }

  function goToProfileSetup() {
    localStorage.removeItem("alitaNeedsProfileSetup");
    setShowProfileGuide(false);
    router.push("/profile");
  }

  function normalizeText(text: string) {
    return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, " ");
  }

  function getCurrentLevelKey() {
    if (selectedLevelIndex === null) return "";
    return `level${selectedLevelIndex + 1}`;
  }

  function resetAllState() {
    setHeardText("");
    setVoiceMessage("");
    setRecognizedChoice("");
    setWrongAttempts(0);
    setShowResult(false);
    setShowTryAgain(false);
    setEarnedStars(0);
    setAiPromptText("");
    hasAutoReadRef.current = false;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  function openSubject(subject: string) {
    setSelectedSubject(subject);
    setSelectedLevelIndex(null);
    resetAllState();
  }

  function startLevel(levelIndex: number) {
    if (!selectedSubject) return;
    const levelKey = `level${levelIndex + 1}`;
    const levelProgress = progressData[selectedSubject]?.[levelKey];
    if (!levelProgress?.unlocked) return;

    setSelectedLevelIndex(levelIndex);
    resetAllState();
  }

  function getStarsFromAttempts(wrongCount: number) {
    if (wrongCount === 0) return 3;
    if (wrongCount === 1) return 2;
    if (wrongCount === 2) return 1;
    return 0;
  }

  function speakText(text: string) {
    setAiPromptText(text);

    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedSubject === "Filipino" ? "fil-PH" : "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  function readQuestionAndChoices() {
    if (!currentQuestion) return;
    speakText(`${currentQuestion.question}. The choices are: ${currentQuestion.choices.join(", ")}.`);
  }

  function readSpecialQuestionAndChoices() {
    if (!currentSpecialQuestion) return;
    speakText(
      `${currentSpecialQuestion.question_text}. The choices are: ${[
        currentSpecialQuestion.choice_a,
        currentSpecialQuestion.choice_b,
        currentSpecialQuestion.choice_c,
        currentSpecialQuestion.choice_d,
      ].join(", ")}.`
    );
  }

  function mapVoiceToPremadeChoice(transcript: string) {
    if (!currentQuestion) return "";
    const spoken = normalizeText(transcript);

    for (const choice of currentQuestion.choices) {
      if (normalizeText(choice) === spoken) return choice;
    }

    if (["a", "letter a", "option a", "first"].includes(spoken)) return currentQuestion.choices[0];
    if (["b", "letter b", "option b", "second"].includes(spoken)) return currentQuestion.choices[1];
    if (["c", "letter c", "option c", "third"].includes(spoken)) return currentQuestion.choices[2];
    if (["d", "letter d", "option d", "fourth"].includes(spoken)) return currentQuestion.choices[3];
    return "";
  }

  function mapVoiceToSpecialChoice(transcript: string) {
    if (!currentSpecialQuestion) return "";
    const spoken = normalizeText(transcript);
    const choices = [
      currentSpecialQuestion.choice_a,
      currentSpecialQuestion.choice_b,
      currentSpecialQuestion.choice_c,
      currentSpecialQuestion.choice_d,
    ];

    for (const choice of choices) {
      if (normalizeText(choice) === spoken) return choice;
    }

    if (["a", "letter a", "option a", "first"].includes(spoken)) return choices[0];
    if (["b", "letter b", "option b", "second"].includes(spoken)) return choices[1];
    if (["c", "letter c", "option c", "third"].includes(spoken)) return choices[2];
    if (["d", "letter d", "option d", "fourth"].includes(spoken)) return choices[3];
    return "";
  }

  async function handleCorrectPremadeAnswer(choice: string) {
    if (!selectedSubject || selectedLevelIndex === null) return;

    const stars = getStarsFromAttempts(wrongAttempts);
    const levelKey = getCurrentLevelKey();
    const updatedProgress: ProgressData = JSON.parse(JSON.stringify(progressData));

    updatedProgress[selectedSubject][levelKey].completed = true;
    updatedProgress[selectedSubject][levelKey].stars = stars;

    const nextLevelIndex = selectedLevelIndex + 1;
    const nextLevelKey = `level${nextLevelIndex + 1}`;
    if (updatedProgress[selectedSubject][nextLevelKey]) {
      updatedProgress[selectedSubject][nextLevelKey].unlocked = true;
    }

    await saveProgress(updatedProgress);

    const premadeQuizId = await ensurePremadeQuizRecord(selectedSubject, selectedLevelIndex + 1);
    if (premadeQuizId) {
      await saveQuizResult(premadeQuizId, 1, wrongAttempts + 1, stars);
    }

    setRecognizedChoice(choice);
    setEarnedStars(stars);
    setVoiceMessage("Correct answer!");
    setShowResult(true);
    setShowTryAgain(false);
    speakText("Correct answer. Good job. Next level unlocked.");
  }

  function handleWrongPremadeAnswer(choice: string) {
    const nextWrongAttempts = wrongAttempts + 1;
    setRecognizedChoice(choice);
    setWrongAttempts(nextWrongAttempts);

    if (nextWrongAttempts >= 3) {
      setVoiceMessage("You used all 3 attempts.");
      setShowTryAgain(true);
      speakText("You used all three attempts. Press try again.");
    } else {
      setVoiceMessage(`Wrong answer. Attempt ${nextWrongAttempts} of 3.`);
      speakText(`Wrong answer. Attempt ${nextWrongAttempts} of 3.`);
    }
  }

  async function submitPremadeAnswer(choice: string) {
    if (!currentQuestion) return;
    const isCorrect = normalizeText(choice) === normalizeText(currentQuestion.answer);
    if (isCorrect) await handleCorrectPremadeAnswer(choice);
    else handleWrongPremadeAnswer(choice);
  }

  async function handleCorrectSpecialAnswer(choice: string) {
    const nextCorrectCount = specialCorrectCount + 1;
    const nextIndex = specialQuestionIndex + 1;

    setRecognizedChoice(choice);
    setSpecialCorrectCount(nextCorrectCount);
    setVoiceMessage("Correct answer!");
    setWrongAttempts(0);
    setShowTryAgain(false);

    if (nextIndex < specialQuestions.length) {
      speakText("Correct answer. Next question.");
      setTimeout(() => {
        setSpecialQuestionIndex(nextIndex);
        setRecognizedChoice("");
        setHeardText("");
        setVoiceMessage("");
        setAiPromptText("");
        hasAutoReadRef.current = false;
      }, 900);
    } else {
      const totalQuestions = specialQuestions.length;
      const stars =
        totalQuestions === 0
          ? 0
          : nextCorrectCount === totalQuestions
            ? 3
            : nextCorrectCount >= Math.ceil(totalQuestions * 0.7)
              ? 2
              : nextCorrectCount >= Math.ceil(totalQuestions * 0.4)
                ? 1
                : 0;

      if (selectedSpecialQuiz) {
        await saveQuizResult(selectedSpecialQuiz.id, nextCorrectCount, 1, stars);
      }

      setEarnedStars(stars);
      speakText("Special quiz finished. Good job.");
      setShowSpecialResult(true);
    }
  }

  function handleWrongSpecialAnswer(choice: string) {
    const nextWrongAttempts = wrongAttempts + 1;
    setRecognizedChoice(choice);
    setWrongAttempts(nextWrongAttempts);

    if (nextWrongAttempts >= 3) {
      setVoiceMessage("You used all 3 attempts.");
      setShowTryAgain(true);
      speakText("You used all three attempts. Press try again.");
    } else {
      setVoiceMessage(`Wrong answer. Attempt ${nextWrongAttempts} of 3.`);
      speakText(`Wrong answer. Attempt ${nextWrongAttempts} of 3.`);
    }
  }

  async function submitSpecialAnswer(choice: string) {
    if (!currentSpecialQuestion) return;
    const isCorrect = normalizeText(choice) === normalizeText(currentSpecialQuestion.correct_answer);
    if (isCorrect) await handleCorrectSpecialAnswer(choice);
    else handleWrongSpecialAnswer(choice);
  }

  function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceMessage("Voice recognition is not supported on this browser.");
      return;
    }

    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    const recognition = new SpeechRecognition();
    recognition.lang = selectedSubject === "Filipino" ? "fil-PH" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setVoiceMessage("Listening...");
    setAiPromptText("Listening...");
    setHeardText("");

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setHeardText(transcript);

      if (viewMode === "premade") {
        const matchedChoice = mapVoiceToPremadeChoice(transcript);
        if (matchedChoice) {
          setRecognizedChoice(matchedChoice);
          setVoiceMessage(`Recognized: ${matchedChoice}`);
          setAiPromptText(`I heard ${matchedChoice}. Let me check your answer.`);
          setTimeout(() => submitPremadeAnswer(matchedChoice), 400);
        } else {
          setRecognizedChoice("");
          setVoiceMessage("Voice detected, but no matching choice was found.");
          setAiPromptText("I heard your voice, but I could not match it to A, B, C, or D.");
        }
      } else {
        const matchedChoice = mapVoiceToSpecialChoice(transcript);
        if (matchedChoice) {
          setRecognizedChoice(matchedChoice);
          setVoiceMessage(`Recognized: ${matchedChoice}`);
          setAiPromptText(`I heard ${matchedChoice}. Let me check your answer.`);
          setTimeout(() => submitSpecialAnswer(matchedChoice), 400);
        } else {
          setRecognizedChoice("");
          setVoiceMessage("Voice detected, but no matching choice was found.");
          setAiPromptText("I heard your voice, but I could not match it to A, B, C, or D.");
        }
      }
    };

    recognition.onerror = () => {
      setVoiceMessage("Voice recognition failed. Please try again.");
      setAiPromptText("Voice recognition failed. Please try again.");
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  }

  function tryAgain() {
    setHeardText("");
    setVoiceMessage("");
    setRecognizedChoice("");
    setWrongAttempts(0);
    setShowTryAgain(false);
    setAiPromptText("");
    hasAutoReadRef.current = false;

    if (viewMode === "premade") readQuestionAndChoices();
    else readSpecialQuestionAndChoices();
  }

  function goBackToSubjects() {
    setSelectedSubject(null);
    setSelectedLevelIndex(null);
    setAiPromptText("");
    resetAllState();
  }

  function goBackToLevels() {
    setSelectedLevelIndex(null);
    setAiPromptText("");
    resetAllState();
  }

  function backToSpecialQuizList() {
    setSelectedSpecialQuiz(null);
    setSpecialQuestions([]);
    setSpecialQuestionIndex(0);
    setSpecialCorrectCount(0);
    setShowSpecialResult(false);
    setWrongAttempts(0);
    setRecognizedChoice("");
    setHeardText("");
    setVoiceMessage("");
    setAiPromptText("");
    setShowTryAgain(false);
    hasAutoReadRef.current = false;
  }

  return (
    <div
      className="relative min-h-screen w-screen bg-cover bg-center bg-no-repeat text-[#2c1b10]"
      style={{
        backgroundImage: `url('${getBackground()}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-black/18" />

      {showProfileGuide && (
        <ProfileGuideModal
          onGoProfile={goToProfileSetup}
          onSkip={() => {
            localStorage.removeItem("alitaNeedsProfileSetup");
            setShowProfileGuide(false);
          }}
        />
      )}

      <div className="relative z-10">
        <TopBar studentName={studentName} studentPortrait={studentAvatar} onLogout={logout} />

        <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
          {!selectedSubject && !selectedSpecialQuiz && (
            <AssessmentHome
              studentName={studentName}
              studentAvatar={studentAvatar}
              studentFullCharacter={studentFullCharacter}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onOpenSubject={openSubject}
              specialQuizzes={specialQuizzes}
              onOpenSpecialQuiz={openSpecialQuiz}
              onResetSpecial={backToSpecialQuizList}
              onHeroImageError={() => setStudentFullCharacter("🧒")}
            />
          )}

          {viewMode === "premade" && selectedSubject && selectedLevelIndex === null && (
            <SubjectLevels
              selectedSubject={selectedSubject}
              progressData={progressData}
              onBack={goBackToSubjects}
              onStartLevel={startLevel}
            />
          )}

          {viewMode === "premade" &&
            selectedSubject &&
            selectedLevelIndex !== null &&
            currentQuestion &&
            !showResult && (
              <QuestionScreen
                title={`${selectedSubject.toUpperCase()} • LEVEL ${selectedLevelIndex + 1}`}
                questionText={currentQuestion.question}
                choices={currentQuestion.choices}
                wrongAttempts={wrongAttempts}
                speechSupported={speechSupported}
                isListening={isListening}
                showTryAgain={showTryAgain}
                recognizedChoice={recognizedChoice}
                heardText={heardText}
                voiceMessage={voiceMessage}
                aiPromptText={aiPromptText}
                onBack={goBackToLevels}
                onRead={readQuestionAndChoices}
                onTryAgain={tryAgain}
                onVoice={startVoiceRecognition}
              />
            )}

          {viewMode === "premade" &&
            selectedSubject &&
            selectedLevelIndex !== null &&
            currentQuestion &&
            showResult && (
              <ResultScreen
                title="LEVEL CLEARED!"
                subtitle={`${studentName}, you completed ${selectedSubject} Level ${selectedLevelIndex + 1}.`}
                earnedStars={earnedStars}
                wrongAttempts={wrongAttempts}
                onPrimary={goBackToLevels}
                primaryLabel="BACK TO LEVELS"
                onSecondary={() => {
                  if (!selectedSubject || selectedLevelIndex === null) return;
                  const nextLevelIndex = selectedLevelIndex + 1;
                  if (nextLevelIndex < quizData[selectedSubject].length) {
                    startLevel(nextLevelIndex);
                  } else {
                    goBackToLevels();
                  }
                }}
                secondaryLabel="NEXT LEVEL →"
                onTertiary={goBackToSubjects}
                tertiaryLabel="CHANGE WORLD"
              />
            )}

          {viewMode === "special" &&
            selectedSpecialQuiz &&
            currentSpecialQuestion &&
            !showSpecialResult && (
              <QuestionScreen
                title={`${selectedSpecialQuiz.title.toUpperCase()} • QUESTION ${specialQuestionIndex + 1}/${specialQuestions.length}`}
                questionText={currentSpecialQuestion.question_text}
                choices={[
                  currentSpecialQuestion.choice_a,
                  currentSpecialQuestion.choice_b,
                  currentSpecialQuestion.choice_c,
                  currentSpecialQuestion.choice_d,
                ]}
                wrongAttempts={wrongAttempts}
                speechSupported={speechSupported}
                isListening={isListening}
                showTryAgain={showTryAgain}
                recognizedChoice={recognizedChoice}
                heardText={heardText}
                voiceMessage={voiceMessage}
                aiPromptText={aiPromptText}
                onBack={backToSpecialQuizList}
                onRead={readSpecialQuestionAndChoices}
                onTryAgain={tryAgain}
                onVoice={startVoiceRecognition}
              />
            )}

          {viewMode === "special" && selectedSpecialQuiz && showSpecialResult && (
            <ResultScreen
              title="SPECIAL QUEST COMPLETE!"
              subtitle={`${studentName}, you finished ${selectedSpecialQuiz.title}.`}
              earnedStars={earnedStars}
              scoreText={`Score: ${specialCorrectCount} / ${specialQuestions.length}`}
              onPrimary={backToSpecialQuizList}
              primaryLabel="BACK TO SPECIAL QUESTS"
              onSecondary={goBackToSubjects}
              secondaryLabel="CHANGE MODE"
            />
          )}
        </main>
      </div>
    </div>
  );
}