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
  const recognitionRef = useRef<any>(null);
  const latestTranscriptRef = useRef("");
  const isStoppingRef = useRef(false);

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

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;
    synth.getVoices();

    const handleVoicesChanged = () => {
      synth.getVoices();
    };

    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;

    return () => {
      try {
        recognitionRef.current?.stop();
      } catch { }

      synth.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

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
    latestTranscriptRef.current = "";
    isStoppingRef.current = false;
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
    try {
      recognitionRef.current?.stop();
    } catch { }

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
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, " ");
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
    latestTranscriptRef.current = "";
    isStoppingRef.current = false;
    hasAutoReadRef.current = false;

    try {
      recognitionRef.current?.stop();
    } catch { }

    recognitionRef.current = null;
    setIsListening(false);

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

    const synth = window.speechSynthesis;
    synth.cancel();

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      const isFilipino = selectedSubject === "Filipino";

      utterance.lang = isFilipino ? "fil-PH" : "en-US";
      utterance.rate = isFilipino ? 0.82 : 0.85;
      utterance.pitch = isFilipino ? 1 : 1.05;
      utterance.volume = 1;

      const voices = synth.getVoices();

      const bestVoice =
        voices.find((voice) =>
          isFilipino
            ? voice.lang.toLowerCase().includes("fil")
            : voice.lang.toLowerCase().includes("en")
        ) ||
        voices.find((voice) =>
          isFilipino
            ? voice.name.toLowerCase().includes("filip")
            : voice.name.toLowerCase().includes("english")
        ) ||
        voices[0];

      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      synth.speak(utterance);
    }, 120);
  }

  function readQuestionAndChoices() {
    if (!currentQuestion) return;
    speakText(
      `${currentQuestion.question} ... The choices are ... ${currentQuestion.choices.join(" ... ")}.`
    );
  }

  function readSpecialQuestionAndChoices() {
    if (!currentSpecialQuestion) return;
    speakText(
      `${currentSpecialQuestion.question_text} ... The choices are ... ${[
        currentSpecialQuestion.choice_a,
        currentSpecialQuestion.choice_b,
        currentSpecialQuestion.choice_c,
        currentSpecialQuestion.choice_d,
      ].join(" ... ")}.`
    );
  }

  function mapVoiceToPremadeChoice(transcript: string) {
    if (!currentQuestion) return "";

    const spoken = normalizeText(transcript);

    for (const choice of currentQuestion.choices) {
      const normalizedChoice = normalizeText(choice);

      if (normalizedChoice === spoken) return choice;
      if (spoken.includes(normalizedChoice)) return choice;
      if (normalizedChoice.includes(spoken) && spoken.length >= 2) return choice;
    }

    if (
      spoken === "a" ||
      spoken === "letter a" ||
      spoken === "option a" ||
      spoken === "first" ||
      spoken === "number one"
    ) {
      return currentQuestion.choices[0];
    }

    if (
      spoken === "b" ||
      spoken === "letter b" ||
      spoken === "option b" ||
      spoken === "second" ||
      spoken === "number two"
    ) {
      return currentQuestion.choices[1];
    }

    if (
      spoken === "c" ||
      spoken === "letter c" ||
      spoken === "option c" ||
      spoken === "third" ||
      spoken === "number three"
    ) {
      return currentQuestion.choices[2];
    }

    if (
      spoken === "d" ||
      spoken === "letter d" ||
      spoken === "option d" ||
      spoken === "fourth" ||
      spoken === "number four"
    ) {
      return currentQuestion.choices[3];
    }

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
      const normalizedChoice = normalizeText(choice);

      if (normalizedChoice === spoken) return choice;
      if (spoken.includes(normalizedChoice)) return choice;
      if (normalizedChoice.includes(spoken) && spoken.length >= 2) return choice;
    }

    if (
      spoken === "a" ||
      spoken === "letter a" ||
      spoken === "option a" ||
      spoken === "first" ||
      spoken === "number one"
    ) {
      return choices[0];
    }

    if (
      spoken === "b" ||
      spoken === "letter b" ||
      spoken === "option b" ||
      spoken === "second" ||
      spoken === "number two"
    ) {
      return choices[1];
    }

    if (
      spoken === "c" ||
      spoken === "letter c" ||
      spoken === "option c" ||
      spoken === "third" ||
      spoken === "number three"
    ) {
      return choices[2];
    }

    if (
      spoken === "d" ||
      spoken === "letter d" ||
      spoken === "option d" ||
      spoken === "fourth" ||
      spoken === "number four"
    ) {
      return choices[3];
    }

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
    speakText("Correct answer ... Good job ... Next level unlocked.");
  }

  function handleWrongPremadeAnswer(choice: string) {
    const nextWrongAttempts = wrongAttempts + 1;
    setRecognizedChoice(choice);
    setWrongAttempts(nextWrongAttempts);

    if (nextWrongAttempts >= 3) {
      setVoiceMessage("You used all 3 attempts.");
      setShowTryAgain(true);
      speakText("You used all three attempts ... Press try again.");
    } else {
      setVoiceMessage(`Wrong answer. Attempt ${nextWrongAttempts} of 3.`);
      speakText(`Wrong answer ... Attempt ${nextWrongAttempts} of 3.`);
    }
  }

  async function submitPremadeAnswer(choice: string) {
    if (!currentQuestion) return;

    const normalizedChoice = normalizeText(choice);
    const isCorrect = currentQuestion.answers.some(
      (answer) => normalizeText(answer) === normalizedChoice
    );

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
      speakText("Correct answer ... Next question.");
      setTimeout(() => {
        setSpecialQuestionIndex(nextIndex);
        setRecognizedChoice("");
        setHeardText("");
        setVoiceMessage("");
        setAiPromptText("");
        latestTranscriptRef.current = "";
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
      speakText("Special quiz finished ... Good job.");
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
      speakText("You used all three attempts ... Press try again.");
    } else {
      setVoiceMessage(`Wrong answer. Attempt ${nextWrongAttempts} of 3.`);
      speakText(`Wrong answer ... Attempt ${nextWrongAttempts} of 3.`);
    }
  }

  async function submitSpecialAnswer(choice: string) {
    if (!currentSpecialQuestion) return;
    const isCorrect = normalizeText(choice) === normalizeText(currentSpecialQuestion.correct_answer);
    if (isCorrect) await handleCorrectSpecialAnswer(choice);
    else handleWrongSpecialAnswer(choice);
  }

  async function processTranscript(finalTranscript: string) {
    const transcript = finalTranscript.trim();

    setHeardText(transcript);
    setIsListening(false);

    if (!transcript) {
      setVoiceMessage("No voice captured. Tap the mic and try again.");
      setAiPromptText("I didn't hear anything. Tap the mic and try again.");
      return;
    }

    if (viewMode === "premade") {
      const matchedChoice = mapVoiceToPremadeChoice(transcript);

      if (matchedChoice) {
        setRecognizedChoice(matchedChoice);
        setVoiceMessage(`Recognized: ${matchedChoice}`);
        setAiPromptText(`I heard ${matchedChoice}. Let me check your answer.`);
        await submitPremadeAnswer(matchedChoice);
      } else {
        setRecognizedChoice("");
        setVoiceMessage("Voice detected, but no matching choice was found.");
        setAiPromptText("I heard your voice, but I could not match it to the choices.");
      }
    } else {
      const matchedChoice = mapVoiceToSpecialChoice(transcript);

      if (matchedChoice) {
        setRecognizedChoice(matchedChoice);
        setVoiceMessage(`Recognized: ${matchedChoice}`);
        setAiPromptText(`I heard ${matchedChoice}. Let me check your answer.`);
        await submitSpecialAnswer(matchedChoice);
      } else {
        setRecognizedChoice("");
        setVoiceMessage("Voice detected, but no matching choice was found.");
        setAiPromptText("I heard your voice, but I could not match it to the choices.");
      }
    }
  }

  function startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceMessage("Voice recognition is not supported on this browser.");
      setAiPromptText("Voice recognition is not supported on this browser.");
      return;
    }

    if (recognitionRef.current || isListening || showTryAgain) return;

    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    latestTranscriptRef.current = "";
    isStoppingRef.current = false;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = selectedSubject === "Filipino" ? "fil-PH" : "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    setVoiceMessage("Listening... tap the mic again to stop.");
    setAiPromptText("I'm listening...");
    setHeardText("");
    setRecognizedChoice("");

    recognition.onresult = (event: any) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }

      const cleanTranscript = transcript.trim();
      latestTranscriptRef.current = cleanTranscript;
      setHeardText(cleanTranscript);
    };

    recognition.onerror = (event: any) => {
      const error = event?.error || "unknown";

      if (error === "no-speech") {
        setVoiceMessage("No speech detected. Tap the mic and try again.");
        setAiPromptText("I didn't hear anything.");
      } else if (error === "not-allowed" || error === "service-not-allowed") {
        setVoiceMessage("Microphone permission was denied.");
        setAiPromptText("Please allow microphone access.");
      } else {
        setVoiceMessage("Voice recognition failed. Please try again.");
        setAiPromptText("Voice recognition failed. Please try again.");
      }

      setIsListening(false);
      recognitionRef.current = null;
      isStoppingRef.current = false;
    };

    recognition.onend = async () => {
      const finalTranscript = latestTranscriptRef.current.trim();

      recognitionRef.current = null;
      setIsListening(false);

      if (!isStoppingRef.current) return;

      isStoppingRef.current = false;
      await processTranscript(finalTranscript);
    };

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
      setVoiceMessage("Could not start voice recognition.");
      setAiPromptText("Could not start voice recognition.");
    }
  }

  function stopVoiceRecognition() {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    isStoppingRef.current = true;
    setVoiceMessage("Processing your answer...");
    setAiPromptText("Let me check what I heard...");

    try {
      recognition.stop();
    } catch {
      isStoppingRef.current = false;
      setIsListening(false);
      recognitionRef.current = null;
    }
  }

  function tryAgain() {
    setHeardText("");
    setVoiceMessage("");
    setRecognizedChoice("");
    setWrongAttempts(0);
    setShowTryAgain(false);
    setAiPromptText("");
    latestTranscriptRef.current = "";
    isStoppingRef.current = false;
    hasAutoReadRef.current = false;

    try {
      recognitionRef.current?.stop();
    } catch { }

    recognitionRef.current = null;
    setIsListening(false);

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
    latestTranscriptRef.current = "";
    isStoppingRef.current = false;
    hasAutoReadRef.current = false;

    try {
      recognitionRef.current?.stop();
    } catch { }

    recognitionRef.current = null;
    setIsListening(false);
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
                onVoiceStart={startVoiceRecognition}
                onVoiceEnd={stopVoiceRecognition}
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
                onVoiceStart={startVoiceRecognition}
                onVoiceEnd={stopVoiceRecognition}
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