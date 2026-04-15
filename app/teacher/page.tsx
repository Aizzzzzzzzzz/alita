"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import * as XLSX from "xlsx";

type Student = {
  id: string;
  name: string;
  username: string;
  password: string;
  grade: string;
  section: string;
};

type TeacherQuiz = {
  id: string;
  title: string;
  subject: string;
  grade_level: string;
  status: "draft" | "published" | "archived";
  created_at?: string;
};

type TeacherQuestion = {
  id: string;
  quiz_id: string;
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_answer: string;
};

type BulkStudentRow = {
  full_name: string;
  username: string;
  password: string;
  grade_level: string;
  section: string;
  age?: number | null;
  guardian_name?: string;
};

type ResultRow = {
  id: string;
  student_id: string;
  quiz_id: string;
  score: number;
  attempts: number;
  stars: number;
  completed_at: string;
};

type ProgressStudentRow = {
  student_id: string;
  student_name: string;
  grade: string;
  section: string;
  quizzes_taken: number;
  total_score: number;
  average_score: number;
  average_stars: number;
  total_attempts: number;
  last_activity: string;
  completed_levels: number;
  progress_stars: number;
};

type RecentAttemptRow = {
  id: string;
  student_name: string;
  quiz_title: string;
  subject: string;
  score: number;
  stars: number;
  attempts: number;
  completed_at: string;
};

type SubjectSummary = {
  subject: string;
  total_attempts: number;
  total_score: number;
  average_score: number;
};

type StudentProgressRow = {
  student_id: string;
  subject: string;
  level_number: number;
  unlocked: boolean;
  completed: boolean;
  stars: number;
};

const BULK_TEMPLATE_HEADERS = [
  "full_name",
  "username",
  "password",
  "grade_level",
  "section",
  "age",
  "guardian_name",
];

function normalizeHeader(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, "_");
}

function normalizeCell(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeGradeValue(value: unknown) {
  const raw = normalizeCell(value).toLowerCase();
  if (raw === "3" || raw === "grade 3" || raw === "g3" || raw === "grade3") return "Grade 3";
  if (raw === "4" || raw === "grade 4" || raw === "g4" || raw === "grade4") return "Grade 4";
  if (raw === "5" || raw === "grade 5" || raw === "g5" || raw === "grade5") return "Grade 5";
  return normalizeCell(value);
}

function parseBulkStudentRow(
  row: Record<string, unknown>,
  index: number
): { data?: BulkStudentRow; error?: string } {
  const normalizedRow = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normalizeHeader(key), value])
  ) as Record<string, unknown>;

  const full_name = normalizeCell(
    normalizedRow.full_name ?? normalizedRow.name ?? normalizedRow.student_name
  );
  const username = normalizeCell(normalizedRow.username);
  const password = normalizeCell(normalizedRow.password);
  const grade_level = normalizeGradeValue(
    normalizedRow.grade_level ?? normalizedRow.grade
  );
  const section = normalizeCell(normalizedRow.section);
  const guardian_name = normalizeCell(
    normalizedRow.guardian_name ?? normalizedRow.guardian
  );

  const ageRaw = normalizeCell(normalizedRow.age);
  const age = ageRaw ? Number(ageRaw) : null;

  if (!full_name) return { error: `Row ${index + 2}: full_name is required.` };
  if (!username) return { error: `Row ${index + 2}: username is required.` };
  if (!password) return { error: `Row ${index + 2}: password is required.` };
  if (!grade_level) return { error: `Row ${index + 2}: grade_level is required.` };
  if (!section) return { error: `Row ${index + 2}: section is required.` };

  if (!["Grade 3", "Grade 4", "Grade 5"].includes(grade_level)) {
    return { error: `Row ${index + 2}: grade_level must be Grade 3, Grade 4, or Grade 5.` };
  }

  if (ageRaw && Number.isNaN(age)) {
    return { error: `Row ${index + 2}: age must be a number if provided.` };
  }

  return {
    data: {
      full_name,
      username,
      password,
      grade_level,
      section,
      age,
      guardian_name,
    },
  };
}

function SectionCard({
  title,
  subtitle,
  children,
  right,
  isTabletOrBelow,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
  isTabletOrBelow: boolean;
}) {
  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #dbe3ef",
        borderRadius: 18,
        padding: isTabletOrBelow ? 16 : 22,
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isTabletOrBelow ? "column" : "row",
          alignItems: isTabletOrBelow ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              fontSize: isTabletOrBelow ? 20 : 24,
              fontWeight: 800,
              color: "#0f172a",
              wordBreak: "break-word",
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              style={{
                margin: "6px 0 0 0",
                color: "#64748b",
                fontWeight: 500,
                fontSize: isTabletOrBelow ? 13 : 14,
                lineHeight: 1.5,
                wordBreak: "break-word",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function MenuButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        border: active ? "1px solid #2563eb" : "1px solid #dbe3ef",
        background: active ? "#2563eb" : "#ffffff",
        color: active ? "#ffffff" : "#0f172a",
        borderRadius: 14,
        padding: "14px 16px",
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.2s ease",
        boxShadow: active
          ? "0 8px 20px rgba(37, 99, 235, 0.25)"
          : "0 4px 12px rgba(15, 23, 42, 0.05)",
      }}
    >
      {children}
    </button>
  );
}

function ScrollTable({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {children}
    </div>
  );
}

export default function TeacherPage() {
  const router = useRouter();

  const [screenWidth, setScreenWidth] = useState(1440);
  const [students, setStudents] = useState<Student[]>([]);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    grade: "Grade 3",
    section: "",
  });

  const [statusMessage, setStatusMessage] = useState("");
  const [statusColor, setStatusColor] = useState("#16a34a");
  const [bulkFileName, setBulkFileName] = useState("");
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkStatusMessage, setBulkStatusMessage] = useState("");
  const [bulkStatusColor, setBulkStatusColor] = useState("#16a34a");
  const [activeTab, setActiveTab] = useState<"students" | "specialQuiz" | "progress">("students");

  const [quizTitle, setQuizTitle] = useState("");
  const [quizSubject, setQuizSubject] = useState("Math");
  const [quizGrade, setQuizGrade] = useState("Grade 3");
  const [currentQuizId, setCurrentQuizId] = useState<string | null>(null);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  const [questionText, setQuestionText] = useState("");
  const [choiceA, setChoiceA] = useState("");
  const [choiceB, setChoiceB] = useState("");
  const [choiceC, setChoiceC] = useState("");
  const [choiceD, setChoiceD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const [teacherQuizzes, setTeacherQuizzes] = useState<TeacherQuiz[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<TeacherQuestion[]>([]);

  const [results, setResults] = useState<ResultRow[]>([]);
  const [progressRows, setProgressRows] = useState<ProgressStudentRow[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<RecentAttemptRow[]>([]);
  const [subjectSummary, setSubjectSummary] = useState<SubjectSummary[]>([]);
  const [progressLoading, setProgressLoading] = useState(false);

  const isPhone = screenWidth <= 640;
  const isTabletOrBelow = screenWidth <= 1024;
  const isSmallLaptop = screenWidth <= 1280;

  useEffect(() => {
    const checkScreen = () => setScreenWidth(window.innerWidth);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    const user = localStorage.getItem("alitaUser");
    const teacherId = localStorage.getItem("teacherId");

    if (user !== "teacher" || !teacherId || teacherId === "null" || teacherId === "undefined") {
      router.push("/login");
      return;
    }

    loadStudents();
    loadTeacherQuizzes();
    loadProgressData();
  }, [router]);

  async function loadStudents() {
    const teacherId = localStorage.getItem("teacherId");

    if (!teacherId || teacherId === "null" || teacherId === "undefined") {
      setStatusMessage("Teacher session not found. Please log in again.");
      setStatusColor("#dc2626");
      return;
    }

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });

    if (error) {
      setStatusMessage(error.message);
      setStatusColor("#dc2626");
      return;
    }

    setStudents(
      (data || []).map((student) => ({
        id: student.id,
        name: student.full_name,
        username: student.username,
        password: student.password,
        grade: student.grade_level,
        section: student.section || "",
      }))
    );
  }

  async function loadTeacherQuizzes() {
    const teacherId = localStorage.getItem("teacherId");

    if (!teacherId || teacherId === "null" || teacherId === "undefined") {
      return;
    }

    const { data } = await supabase
      .from("quizzes")
      .select("*")
      .eq("teacher_id", teacherId)
      .eq("quiz_type", "custom")
      .order("created_at", { ascending: false });

    setTeacherQuizzes((data || []) as TeacherQuiz[]);
  }

  async function loadQuizQuestions(quizId: string) {
    const { data } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("created_at", { ascending: true });

    setQuizQuestions((data || []) as TeacherQuestion[]);
  }

  async function loadProgressData() {
    setProgressLoading(true);
    const teacherId = localStorage.getItem("teacherId");

    if (!teacherId || teacherId === "null" || teacherId === "undefined") {
      setProgressLoading(false);
      return;
    }

    const { data: teacherStudents, error: studentsError } = await supabase
      .from("students")
      .select("id, full_name, grade_level, section")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });

    if (studentsError) {
      setProgressLoading(false);
      return;
    }

    const studentIds = (teacherStudents || []).map((student) => student.id);

    if (studentIds.length === 0) {
      setResults([]);
      setProgressRows([]);
      setRecentAttempts([]);
      setSubjectSummary([]);
      setProgressLoading(false);
      return;
    }

    const [{ data: resultData }, { data: progressDataRows }] = await Promise.all([
      supabase
        .from("results")
        .select("*")
        .in("student_id", studentIds)
        .order("completed_at", { ascending: false }),
      supabase
        .from("student_progress")
        .select("student_id, subject, level_number, unlocked, completed, stars")
        .in("student_id", studentIds),
    ]);

    const quizIds = Array.from(new Set((resultData || []).map((item) => item.quiz_id)));

    let quizData: TeacherQuiz[] = [];
    if (quizIds.length > 0) {
      const { data: quizzesData } = await supabase
        .from("quizzes")
        .select("id, title, subject, grade_level, status, created_at")
        .in("id", quizIds);

      quizData = (quizzesData || []) as TeacherQuiz[];
    }

    const studentMap = new Map(
      (teacherStudents || []).map((student) => [
        student.id,
        {
          full_name: student.full_name,
          grade_level: student.grade_level,
          section: student.section || "",
        },
      ])
    );

    const quizMap = new Map(
      quizData.map((quiz) => [
        quiz.id,
        {
          title: quiz.title,
          subject: quiz.subject,
        },
      ])
    );

    const progressGrouped = new Map<string, { completed_levels: number; progress_stars: number }>();
    for (const row of (progressDataRows || []) as StudentProgressRow[]) {
      if (!progressGrouped.has(row.student_id)) {
        progressGrouped.set(row.student_id, { completed_levels: 0, progress_stars: 0 });
      }

      const info = progressGrouped.get(row.student_id)!;
      if (row.completed) info.completed_levels += 1;
      info.progress_stars += row.stars || 0;
    }

    const grouped = new Map<string, ProgressStudentRow>();
    for (const student of teacherStudents || []) {
      const progressInfo = progressGrouped.get(student.id) || {
        completed_levels: 0,
        progress_stars: 0,
      };

      grouped.set(student.id, {
        student_id: student.id,
        student_name: student.full_name,
        grade: student.grade_level,
        section: student.section || "",
        quizzes_taken: 0,
        total_score: 0,
        average_score: 0,
        average_stars: 0,
        total_attempts: 0,
        last_activity: "",
        completed_levels: progressInfo.completed_levels,
        progress_stars: progressInfo.progress_stars,
      });
    }

    for (const item of (resultData || []) as ResultRow[]) {
      const row = grouped.get(item.student_id);
      if (!row) continue;

      row.quizzes_taken += 1;
      row.total_score += item.score || 0;
      row.total_attempts += item.attempts || 0;
      row.average_stars += item.stars || 0;
      if (!row.last_activity) row.last_activity = item.completed_at;
    }

    const progressList = Array.from(grouped.values()).map((row) => ({
      ...row,
      average_score: row.quizzes_taken > 0 ? Number((row.total_score / row.quizzes_taken).toFixed(2)) : 0,
      average_stars: row.quizzes_taken > 0 ? Number((row.average_stars / row.quizzes_taken).toFixed(2)) : 0,
    }));

    progressList.sort((a, b) => {
      if (b.completed_levels !== a.completed_levels) return b.completed_levels - a.completed_levels;
      if (b.total_score !== a.total_score) return b.total_score - a.total_score;
      return b.quizzes_taken - a.quizzes_taken;
    });

    const recent: RecentAttemptRow[] = ((resultData || []) as ResultRow[]).slice(0, 8).map((item) => ({
      id: item.id,
      student_name: studentMap.get(item.student_id)?.full_name || "Student",
      quiz_title: quizMap.get(item.quiz_id)?.title || "Quiz",
      subject: quizMap.get(item.quiz_id)?.subject || "Unknown",
      score: item.score || 0,
      stars: item.stars || 0,
      attempts: item.attempts || 0,
      completed_at: item.completed_at,
    }));

    const subjectGrouped = new Map<string, SubjectSummary>();
    for (const item of (resultData || []) as ResultRow[]) {
      const subject = quizMap.get(item.quiz_id)?.subject || "Unknown";

      if (!subjectGrouped.has(subject)) {
        subjectGrouped.set(subject, {
          subject,
          total_attempts: 0,
          total_score: 0,
          average_score: 0,
        });
      }

      const current = subjectGrouped.get(subject)!;
      current.total_attempts += 1;
      current.total_score += item.score || 0;
    }

    const subjectList = Array.from(subjectGrouped.values()).map((item) => ({
      ...item,
      average_score: item.total_attempts > 0 ? Number((item.total_score / item.total_attempts).toFixed(2)) : 0,
    }));

    subjectList.sort((a, b) => b.total_attempts - a.total_attempts);

    setResults((resultData || []) as ResultRow[]);
    setProgressRows(progressList);
    setRecentAttempts(recent);
    setSubjectSummary(subjectList);
    setProgressLoading(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function resetStudentForm(message?: string, color?: string) {
    setForm({
      name: "",
      username: "",
      password: "",
      grade: "Grade 3",
      section: "",
    });
    setEditingStudentId(null);

    if (message) {
      setStatusMessage(message);
      setStatusColor(color || "#16a34a");
    }
  }

  async function saveStudent() {
    if (
      form.name.trim() === "" ||
      form.username.trim() === "" ||
      form.password.trim() === "" ||
      form.section.trim() === ""
    ) {
      setStatusMessage("Please fill in all student account fields.");
      setStatusColor("#dc2626");
      return;
    }

    const teacherId = localStorage.getItem("teacherId");

    if (!teacherId || teacherId === "null" || teacherId === "undefined") {
      setStatusMessage("Teacher session not found. Please log in again.");
      setStatusColor("#dc2626");
      router.push("/login");
      return;
    }

    if (editingStudentId) {
      const { error } = await supabase
        .from("students")
        .update({
          full_name: form.name,
          username: form.username,
          password: form.password,
          grade_level: form.grade,
          section: form.section,
        })
        .eq("id", editingStudentId)
        .eq("teacher_id", teacherId);

      if (error) {
        setStatusMessage(error.message);
        setStatusColor("#dc2626");
        return;
      }

      resetStudentForm("Student account updated successfully.", "#16a34a");
    } else {
      const { error } = await supabase.from("students").insert([
        {
          teacher_id: teacherId,
          full_name: form.name,
          username: form.username,
          password: form.password,
          grade_level: form.grade,
          section: form.section,
          avatar: "🧒",
        },
      ]);

      if (error) {
        setStatusMessage(error.message);
        setStatusColor("#dc2626");
        return;
      }

      resetStudentForm("Student account added successfully.", "#16a34a");
    }

    await loadStudents();
    await loadProgressData();
  }

  async function deleteStudent(id: string) {
    const confirmed = window.confirm("Are you sure you want to delete this student account?");
    if (!confirmed) return;

    try {
      const { error: resultsError } = await supabase.from("results").delete().eq("student_id", id);
      if (resultsError) throw resultsError;

      const { error: progressError } = await supabase.from("student_progress").delete().eq("student_id", id);
      if (progressError) throw progressError;

      const { error: walletError } = await supabase.from("student_wallets").delete().eq("student_id", id);
      if (walletError) throw walletError;

      const { error: unlocksError } = await supabase.from("character_unlocks").delete().eq("student_id", id);
      if (unlocksError) throw unlocksError;

      const { error: studentError } = await supabase.from("students").delete().eq("id", id);
      if (studentError) throw studentError;

      if (editingStudentId === id) {
        resetStudentForm("Deleted student account that was being edited.", "#dc2626");
      } else {
        setStatusMessage("Student account deleted.");
        setStatusColor("#dc2626");
      }

      loadStudents();
      loadProgressData();
    } catch (error: any) {
      setStatusMessage(error.message || "Failed to delete student.");
      setStatusColor("#dc2626");
    }
  }

  function editStudent(student: Student) {
    setEditingStudentId(student.id);
    setForm({
      name: student.name,
      username: student.username,
      password: student.password,
      grade: student.grade,
      section: student.section,
    });

    setStatusMessage("Student data loaded. You can now update this account.");
    setStatusColor("#2563eb");
  }

  function cancelEditStudent() {
    resetStudentForm("Edit cancelled.", "#64748b");
  }

  function downloadStudentTemplate() {
    const workbook = XLSX.utils.book_new();

    const templateSheet = XLSX.utils.json_to_sheet([
      {
        full_name: "Juan Dela Cruz",
        username: "juan_grade3_a",
        password: "1234",
        grade_level: "Grade 3",
        section: "Section A",
        age: 9,
        guardian_name: "Maria Dela Cruz",
      },
      {
        full_name: "Ana Santos",
        username: "ana_grade3_a",
        password: "1234",
        grade_level: "Grade 3",
        section: "Section A",
        age: 8,
        guardian_name: "Ramon Santos",
      },
      {
        full_name: "Leo Garcia",
        username: "leo_grade4_b",
        password: "1234",
        grade_level: "Grade 4",
        section: "Section B",
        age: 10,
        guardian_name: "Liza Garcia",
      },
    ]);

    templateSheet["!cols"] = [
      { wch: 24 },
      { wch: 20 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 10 },
      { wch: 24 },
    ];

    const instructionsSheet = XLSX.utils.aoa_to_sheet([
      ["Student Bulk Upload Template"],
      [""],
      ["Required columns", "full_name, username, password, grade_level, section"],
      ["Optional columns", "age, guardian_name"],
      ["Allowed grade_level values", "Grade 3, Grade 4, Grade 5"],
      [""],
      ["Notes"],
      ["1", "One row = one student account"],
      ["2", "Do not change the header names"],
      ["3", "Usernames must be unique"],
      ["4", "Single student edit/add still works for corrections after upload"],
    ]);

    instructionsSheet["!cols"] = [{ wch: 24 }, { wch: 70 }];

    XLSX.utils.book_append_sheet(workbook, templateSheet, "Students_Template");
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");
    XLSX.writeFile(workbook, "student_bulk_upload_template.xlsx");
  }

  async function handleBulkStudentUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setBulkFileName(file.name);
    setBulkStatusMessage("");
    setBulkStatusColor("#16a34a");
    setBulkUploading(true);

    try {
      const teacherId = localStorage.getItem("teacherId");

      if (!teacherId || teacherId === "null" || teacherId === "undefined") {
        setBulkStatusMessage("Teacher session not found. Please log in again.");
        setBulkStatusColor("#dc2626");
        setBulkUploading(false);
        router.push("/login");
        return;
      }

      const fileBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(fileBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new Error("The Excel file has no worksheet.");
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
        defval: "",
      });

      if (rawRows.length === 0) {
        throw new Error("The Excel file is empty.");
      }

      const parsedRows: BulkStudentRow[] = [];
      const rowErrors: string[] = [];
      const seenUsernames = new Set<string>();

      rawRows.forEach((row, index) => {
        const { data, error } = parseBulkStudentRow(row, index);

        if (error) {
          rowErrors.push(error);
          return;
        }

        if (!data) return;

        const usernameKey = data.username.toLowerCase();

        if (seenUsernames.has(usernameKey)) {
          rowErrors.push(`Row ${index + 2}: duplicate username "${data.username}" found in file.`);
          return;
        }

        seenUsernames.add(usernameKey);
        parsedRows.push(data);
      });

      if (rowErrors.length > 0) {
        setBulkStatusMessage(
          `Upload stopped. Please fix these issues: ${rowErrors.slice(0, 5).join(" | ")}${rowErrors.length > 5 ? " | ..." : ""
          }`
        );
        setBulkStatusColor("#dc2626");
        setBulkUploading(false);
        return;
      }

      const usernames = parsedRows.map((row) => row.username);

      const { data: existingStudents, error: existingStudentsError } = await supabase
        .from("students")
        .select("username")
        .in("username", usernames);

      if (existingStudentsError) {
        throw existingStudentsError;
      }

      if ((existingStudents || []).length > 0) {
        const duplicateUsernames = (existingStudents || []).map((student) => student.username).join(", ");
        setBulkStatusMessage(`Upload stopped. These usernames already exist: ${duplicateUsernames}`);
        setBulkStatusColor("#dc2626");
        setBulkUploading(false);
        return;
      }

      const payload = parsedRows.map((row) => ({
        teacher_id: teacherId,
        full_name: row.full_name,
        username: row.username,
        password: row.password,
        grade_level: row.grade_level,
        section: row.section,
        age: row.age,
        guardian_name: row.guardian_name || null,
        avatar: "🧒",
      }));

      const chunkSize = 100;
      for (let index = 0; index < payload.length; index += chunkSize) {
        const chunk = payload.slice(index, index + chunkSize);
        const { error } = await supabase.from("students").insert(chunk);

        if (error) {
          throw error;
        }
      }

      setBulkStatusMessage(`Bulk upload successful. ${payload.length} student accounts created.`);
      setBulkStatusColor("#16a34a");
      await loadStudents();
      await loadProgressData();
    } catch (error: any) {
      setBulkStatusMessage(error.message || "Failed to upload student accounts.");
      setBulkStatusColor("#dc2626");
    } finally {
      setBulkUploading(false);
    }
  }

  async function createSpecialQuiz() {
    if (quizTitle.trim() === "") {
      alert("Please enter a quiz title.");
      return;
    }

    const teacherId = localStorage.getItem("teacherId");

    if (!teacherId || teacherId === "null" || teacherId === "undefined") {
      alert("Teacher session not found. Please log in again.");
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("quizzes")
      .insert([
        {
          teacher_id: teacherId,
          title: quizTitle,
          subject: quizSubject,
          grade_level: quizGrade,
          quiz_type: "custom",
          status: "draft",
          instructions: "Teacher-made Special Quiz",
        },
      ])
      .select()
      .single();

    if (error || !data) {
      alert(error?.message || "Failed to create quiz.");
      return;
    }

    setCurrentQuizId(data.id);
    setEditingQuizId(data.id);
    setQuizTitle(data.title);
    setQuizSubject(data.subject);
    setQuizGrade(data.grade_level);
    await loadTeacherQuizzes();
    await loadQuizQuestions(data.id);
    alert("Special Quiz created! You can now add questions.");
  }

  async function updateQuizDetails() {
    if (!editingQuizId) {
      alert("Open a quiz first.");
      return;
    }

    if (quizTitle.trim() === "") {
      alert("Quiz title is required.");
      return;
    }

    const { error } = await supabase
      .from("quizzes")
      .update({
        title: quizTitle,
        subject: quizSubject,
        grade_level: quizGrade,
      })
      .eq("id", editingQuizId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadTeacherQuizzes();
    alert("Quiz updated successfully.");
  }

  async function updateQuizStatus(quizId: string, status: "draft" | "published" | "archived") {
    if (status === "published") {
      const { count, error: countError } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true })
        .eq("quiz_id", quizId);

      if (countError) {
        alert(countError.message);
        return;
      }

      if (!count || count === 0) {
        alert("You cannot publish a quiz with no questions.");
        return;
      }
    }

    const { error } = await supabase.from("quizzes").update({ status }).eq("id", quizId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadTeacherQuizzes();
    await loadProgressData();
  }

  async function addQuestionToQuiz() {
    if (!currentQuizId) {
      alert("Create or open a quiz first.");
      return;
    }

    if (
      questionText.trim() === "" ||
      choiceA.trim() === "" ||
      choiceB.trim() === "" ||
      choiceC.trim() === "" ||
      choiceD.trim() === "" ||
      correctAnswer.trim() === ""
    ) {
      alert("Please complete all question fields.");
      return;
    }

    const { error } = await supabase.from("questions").insert([
      {
        quiz_id: currentQuizId,
        question_text: questionText,
        choice_a: choiceA,
        choice_b: choiceB,
        choice_c: choiceC,
        choice_d: choiceD,
        correct_answer: correctAnswer,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    clearQuestionForm();
    await loadQuizQuestions(currentQuizId);
    alert("Question added!");
  }

  async function openQuizForEditing(quiz: TeacherQuiz) {
    setCurrentQuizId(quiz.id);
    setEditingQuizId(quiz.id);
    setQuizTitle(quiz.title);
    setQuizSubject(quiz.subject);
    setQuizGrade(quiz.grade_level);
    clearQuestionForm();
    await loadQuizQuestions(quiz.id);
    if (isTabletOrBelow) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editQuestion(question: TeacherQuestion) {
    setEditingQuestionId(question.id);
    setQuestionText(question.question_text);
    setChoiceA(question.choice_a);
    setChoiceB(question.choice_b);
    setChoiceC(question.choice_c);
    setChoiceD(question.choice_d);
    setCorrectAnswer(question.correct_answer);
  }

  async function updateQuestion() {
    if (!editingQuestionId) {
      alert("No question selected for editing.");
      return;
    }

    if (
      questionText.trim() === "" ||
      choiceA.trim() === "" ||
      choiceB.trim() === "" ||
      choiceC.trim() === "" ||
      choiceD.trim() === "" ||
      correctAnswer.trim() === ""
    ) {
      alert("Please complete all question fields.");
      return;
    }

    const { error } = await supabase
      .from("questions")
      .update({
        question_text: questionText,
        choice_a: choiceA,
        choice_b: choiceB,
        choice_c: choiceC,
        choice_d: choiceD,
        correct_answer: correctAnswer,
      })
      .eq("id", editingQuestionId);

    if (error) {
      alert(error.message);
      return;
    }

    const activeQuizId = currentQuizId;
    clearQuestionForm();

    if (activeQuizId) {
      await loadQuizQuestions(activeQuizId);
    }

    alert("Question updated successfully.");
  }

  function clearQuestionForm() {
    setEditingQuestionId(null);
    setQuestionText("");
    setChoiceA("");
    setChoiceB("");
    setChoiceC("");
    setChoiceD("");
    setCorrectAnswer("");
  }

  async function deleteQuestion(questionId: string) {
    const { error } = await supabase.from("questions").delete().eq("id", questionId);

    if (error) {
      alert(error.message);
      return;
    }

    if (currentQuizId) {
      await loadQuizQuestions(currentQuizId);
    }
  }

  async function deleteSpecialQuiz(quizId: string) {
    const { error } = await supabase.from("quizzes").delete().eq("id", quizId);

    if (error) {
      alert(error.message);
      return;
    }

    if (currentQuizId === quizId) {
      setCurrentQuizId(null);
      setEditingQuizId(null);
      setQuizQuestions([]);
      setQuizTitle("");
      setQuizSubject("Math");
      setQuizGrade("Grade 3");
      clearQuestionForm();
    }

    await loadTeacherQuizzes();
    await loadProgressData();
    alert("Quiz deleted.");
  }

  function logout() {
    localStorage.removeItem("alitaUser");
    localStorage.removeItem("teacherId");
    localStorage.removeItem("studentId");
    router.push("/login");
  }

  function formatDate(dateValue: string) {
    if (!dateValue) return "-";
    return new Date(dateValue).toLocaleString();
  }

  const totalStudents = students.length;
  const totalQuizzes = teacherQuizzes.length;
  const totalAttempts = results.length;

  const averageScore = useMemo(() => {
    if (results.length === 0) return 0;
    const total = results.reduce((sum, item) => sum + (item.score || 0), 0);
    return Number((total / results.length).toFixed(2));
  }, [results]);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    background: "#fff",
    fontSize: 14,
    outline: "none",
    color: "#0f172a",
    boxSizing: "border-box",
    minWidth: 0,
  };

  const primaryButton: React.CSSProperties = {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
  };

  const successButton: React.CSSProperties = {
    border: "none",
    background: "#16a34a",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
  };

  const warningButton: React.CSSProperties = {
    border: "none",
    background: "#f59e0b",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
  };

  const dangerButton: React.CSSProperties = {
    border: "none",
    background: "#ef4444",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
  };

  const neutralButton: React.CSSProperties = {
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#0f172a",
    padding: "12px 16px",
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
  };

  const statCardsColumns = isPhone ? "1fr" : isTabletOrBelow ? "1fr 1fr" : "repeat(4, minmax(0, 1fr))";
  const studentFormColumns = isPhone ? "1fr" : isTabletOrBelow ? "1fr 1fr" : "repeat(5, minmax(0, 1fr))";
  const questionChoiceColumns = isPhone ? "1fr" : "repeat(2, minmax(0, 1fr))";
  const subjectRecentColumns = isTabletOrBelow ? "1fr" : "1fr 1fr";
  const specialQuizColumns = isPhone ? "1fr" : "repeat(3, minmax(0, 1fr))";
  const pageColumns = isTabletOrBelow
    ? "1fr"
    : isSmallLaptop
      ? "220px minmax(0, 1fr)"
      : "260px minmax(0, 1fr)";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%)",
        color: "#0f172a",
        overflowX: "hidden",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 60,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #dbe3ef",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: isPhone ? "12px 14px" : "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "#2563eb",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 20,
                boxShadow: "0 10px 20px rgba(37, 99, 235, 0.25)",
                flexShrink: 0,
              }}
            >
              T
            </div>
            <div style={{ minWidth: 0 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: isPhone ? 20 : isTabletOrBelow ? 24 : 28,
                  fontWeight: 800,
                  wordBreak: "break-word",
                }}
              >
                Teacher Panel
              </h1>

            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >

            <button
              onClick={logout}
              style={{
                ...dangerButton,
                padding: isPhone ? "10px 14px" : "12px 16px",
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: isPhone ? 12 : 24,
          display: "grid",
          gridTemplateColumns: pageColumns,
          gap: 20,
          alignItems: "start",
        }}
      >
        <aside
          style={{
            background: "#ffffff",
            border: "1px solid #dbe3ef",
            borderRadius: 18,
            padding: 16,
            height: "fit-content",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            position: isTabletOrBelow ? "static" : "sticky",
            top: 96,
            minWidth: 0,
          }}
        >
          <p
            style={{
              margin: "0 0 14px 0",
              color: "#64748b",
              fontWeight: 700,
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Navigation
          </p>

          <div style={{ display: "grid", gap: 10 }}>
            <MenuButton active={activeTab === "students"} onClick={() => setActiveTab("students")}>
              Student Accounts
            </MenuButton>

            <MenuButton active={activeTab === "specialQuiz"} onClick={() => setActiveTab("specialQuiz")}>
              Special Quiz
            </MenuButton>

            <MenuButton
              active={activeTab === "progress"}
              onClick={() => {
                setActiveTab("progress");
                loadProgressData();
              }}
            >
              Progress Tracking
            </MenuButton>
          </div>
        </aside>

        <main style={{ display: "grid", gap: 20, minWidth: 0 }}>
          {activeTab === "students" && (
            <SectionCard
              title="Student Account Management"
              subtitle="Create students one by one, edit missed details, or upload many accounts at once from Excel."
              isTabletOrBelow={isTabletOrBelow}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: studentFormColumns,
                  gap: 12,
                }}
              >
                <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" style={inputStyle} />
                <input name="username" value={form.username} onChange={handleChange} placeholder="Username" style={inputStyle} />
                <input name="password" value={form.password} onChange={handleChange} placeholder="Password" style={inputStyle} />
                <select name="grade" value={form.grade} onChange={handleChange} style={inputStyle}>
                  <option>Grade 3</option>
                  <option>Grade 4</option>
                  <option>Grade 5</option>
                </select>
                <input name="section" value={form.section} onChange={handleChange} placeholder="Section" style={inputStyle} />
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  flexDirection: isTabletOrBelow ? "column" : "row",
                  alignItems: isTabletOrBelow ? "stretch" : "center",
                  gap: 12,
                }}
              >
                <button onClick={saveStudent} style={{ ...primaryButton, width: isTabletOrBelow ? "100%" : "auto" }}>
                  {editingStudentId ? "Update Student" : "Add Student"}
                </button>

                {editingStudentId && (
                  <button
                    onClick={cancelEditStudent}
                    style={{ ...neutralButton, width: isTabletOrBelow ? "100%" : "auto" }}
                  >
                    Cancel Edit
                  </button>
                )}

                {!!statusMessage && (
                  <p style={{ margin: 0, fontWeight: 700, color: statusColor, wordBreak: "break-word" }}>{statusMessage}</p>
                )}
              </div>

              <div
                style={{
                  marginTop: 18,
                  border: "1px dashed #cbd5e1",
                  borderRadius: 16,
                  padding: isTabletOrBelow ? 14 : 18,
                  background: "#f8fafc",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: isTabletOrBelow ? "column" : "row",
                    alignItems: isTabletOrBelow ? "stretch" : "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Bulk Create Student Accounts</h3>
                    <p
                      style={{
                        margin: "8px 0 0 0",
                        color: "#64748b",
                        fontWeight: 500,
                        lineHeight: 1.5,
                        wordBreak: "break-word",
                      }}
                    >
                      Upload one Excel file with the columns: {BULK_TEMPLATE_HEADERS.join(", ")}.
                      The single student form above stays available for quick corrections and manual edits.
                    </p>
                  </div>

                  <button onClick={downloadStudentTemplate} style={{ ...neutralButton, width: isTabletOrBelow ? "100%" : "auto" }}>
                    Download Sample Excel
                  </button>
                </div>

                <div
                  style={{
                    marginTop: 14,
                    display: "grid",
                    gridTemplateColumns: isTabletOrBelow ? "1fr" : "minmax(0, 1fr) auto",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleBulkStudentUpload}
                    style={{ ...inputStyle, padding: "10px 12px" }}
                  />

                  <div
                    style={{
                      border: "1px solid #dbe3ef",
                      background: "#fff",
                      borderRadius: 12,
                      padding: "12px 14px",
                      fontWeight: 700,
                      color: bulkUploading ? "#f59e0b" : "#334155",
                      textAlign: isTabletOrBelow ? "left" : "center",
                    }}
                  >
                    {bulkUploading ? "Uploading..." : bulkFileName ? `Last file: ${bulkFileName}` : "Ready for upload"}
                  </div>
                </div>

                {!!bulkStatusMessage && (
                  <p style={{ margin: "12px 0 0 0", fontWeight: 700, color: bulkStatusColor, wordBreak: "break-word" }}>
                    {bulkStatusMessage}
                  </p>
                )}
              </div>

              <div style={{ marginTop: 20 }}>
                <div
                  style={{
                    maxHeight: 400,
                    overflowY: "auto",
                    border: "1px solid #dbe3ef",
                    borderRadius: 14,
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "separate",
                      borderSpacing: 0,
                      minWidth: 760,
                      borderRadius: 14,
                      border: "1px solid #dbe3ef",
                      overflow: "hidden",
                    }}
                  >
                    <thead style={{ background: "#eff6ff" }}>
                      <tr>
                        {["Name", "Username", "Password", "Grade", "Section", "Actions"].map((head) => (
                          <th
                            key={head}
                            style={{
                              padding: "14px 12px",
                              textAlign: "left",
                              fontSize: 14,
                              color: "#334155",
                              borderBottom: "1px solid #dbe3ef",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {students.map((student, index) => (
                        <tr key={student.id} style={{ background: index % 2 === 0 ? "#fff" : "#f8fafc" }}>
                          <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0", fontWeight: 600 }}>{student.name}</td>
                          <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>{student.username}</td>
                          <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>{student.password}</td>
                          <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{student.grade}</td>
                          <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>{student.section}</td>
                          <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                              <button onClick={() => editStudent(student)} style={primaryButton}>
                                Edit
                              </button>
                              <button onClick={() => deleteStudent(student.id)} style={dangerButton}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {students.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#64748b", fontWeight: 600 }}>
                            No students yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </SectionCard>
          )}

          {activeTab === "specialQuiz" && (
            <div style={{ display: "grid", gap: 20, minWidth: 0 }}>
              <SectionCard
                title="Special Quiz Builder"
                subtitle="Create teacher-made quizzes and manage their status."
                isTabletOrBelow={isTabletOrBelow}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: specialQuizColumns,
                    gap: 12,
                  }}
                >
                  <input value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="Quiz title" style={inputStyle} />
                  <select value={quizSubject} onChange={(e) => setQuizSubject(e.target.value)} style={inputStyle}>
                    <option>Math</option>
                    <option>English</option>
                    <option>Filipino</option>
                    <option>Science</option>
                  </select>
                  <select value={quizGrade} onChange={(e) => setQuizGrade(e.target.value)} style={inputStyle}>
                    <option>Grade 3</option>
                    <option>Grade 4</option>
                    <option>Grade 5</option>
                  </select>
                </div>

                <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 10 }}>
                  <button onClick={createSpecialQuiz} style={successButton}>
                    Create Quiz
                  </button>
                  {editingQuizId && (
                    <button onClick={updateQuizDetails} style={primaryButton}>
                      Update Quiz
                    </button>
                  )}
                </div>
              </SectionCard>

              <SectionCard
                title="Teacher-Made Quizzes"
                subtitle="Open, publish, archive, or delete custom quizzes."
                isTabletOrBelow={isTabletOrBelow}
              >
                <div style={{ display: "grid", gap: 12 }}>
                  {teacherQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      style={{
                        border: "1px solid #dbe3ef",
                        borderRadius: 14,
                        padding: 16,
                        background: "#f8fafc",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: isTabletOrBelow ? "column" : "row",
                          justifyContent: "space-between",
                          alignItems: isTabletOrBelow ? "flex-start" : "center",
                          gap: 12,
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, wordBreak: "break-word" }}>{quiz.title}</h3>
                          <p style={{ margin: "6px 0 0 0", color: "#64748b", fontWeight: 600 }}>
                            {quiz.subject} • {quiz.grade_level}
                          </p>
                          <p style={{ margin: "8px 0 0 0", fontWeight: 700 }}>
                            Status:{" "}
                            <span
                              style={{
                                color:
                                  quiz.status === "published"
                                    ? "#16a34a"
                                    : quiz.status === "archived"
                                      ? "#64748b"
                                      : "#f59e0b",
                              }}
                            >
                              {quiz.status}
                            </span>
                          </p>
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          <button onClick={() => openQuizForEditing(quiz)} style={primaryButton}>
                            Open
                          </button>
                          <button onClick={() => updateQuizStatus(quiz.id, "published")} style={successButton}>
                            Publish
                          </button>
                          <button onClick={() => updateQuizStatus(quiz.id, "draft")} style={warningButton}>
                            Unpublish
                          </button>
                          <button onClick={() => updateQuizStatus(quiz.id, "archived")} style={neutralButton}>
                            Archive
                          </button>
                          <button onClick={() => deleteSpecialQuiz(quiz.id)} style={dangerButton}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {teacherQuizzes.length === 0 && (
                    <div
                      style={{
                        border: "1px dashed #cbd5e1",
                        borderRadius: 14,
                        padding: 18,
                        textAlign: "center",
                        color: "#64748b",
                        fontWeight: 600,
                      }}
                    >
                      No special quizzes yet.
                    </div>
                  )}
                </div>
              </SectionCard>

              {currentQuizId && (
                <SectionCard
                  title={editingQuestionId ? "Edit Question" : "Add Questions to Selected Quiz"}
                  subtitle="Build the quiz items and mark the correct answer."
                  isTabletOrBelow={isTabletOrBelow}
                >
                  <div style={{ display: "grid", gap: 12 }}>
                    <textarea
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Question text"
                      style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
                    />

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: questionChoiceColumns,
                        gap: 12,
                      }}
                    >
                      <input value={choiceA} onChange={(e) => setChoiceA(e.target.value)} placeholder="Choice A" style={inputStyle} />
                      <input value={choiceB} onChange={(e) => setChoiceB(e.target.value)} placeholder="Choice B" style={inputStyle} />
                      <input value={choiceC} onChange={(e) => setChoiceC(e.target.value)} placeholder="Choice C" style={inputStyle} />
                      <input value={choiceD} onChange={(e) => setChoiceD(e.target.value)} placeholder="Choice D" style={inputStyle} />
                    </div>

                    <input
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      placeholder="Correct answer"
                      style={inputStyle}
                    />

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {editingQuestionId ? (
                        <>
                          <button onClick={updateQuestion} style={primaryButton}>
                            Update Question
                          </button>
                          <button onClick={clearQuestionForm} style={neutralButton}>
                            Cancel Edit
                          </button>
                        </>
                      ) : (
                        <button onClick={addQuestionToQuiz} style={successButton}>
                          Add Question
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
                    {quizQuestions.map((question, index) => (
                      <div
                        key={question.id}
                        style={{
                          border: "1px solid #dbe3ef",
                          borderRadius: 14,
                          background: "#f8fafc",
                          padding: 16,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: isTabletOrBelow ? "column" : "row",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, color: "#2563eb", fontWeight: 800 }}>Question {index + 1}</p>
                            <p style={{ margin: "10px 0", fontWeight: 800, fontSize: 17, wordBreak: "break-word" }}>{question.question_text}</p>
                            <div style={{ color: "#475569", fontWeight: 600, display: "grid", gap: 4 }}>
                              <p style={{ margin: 0, wordBreak: "break-word" }}>A. {question.choice_a}</p>
                              <p style={{ margin: 0, wordBreak: "break-word" }}>B. {question.choice_b}</p>
                              <p style={{ margin: 0, wordBreak: "break-word" }}>C. {question.choice_c}</p>
                              <p style={{ margin: 0, wordBreak: "break-word" }}>D. {question.choice_d}</p>
                              <p style={{ margin: "8px 0 0 0", color: "#16a34a", fontWeight: 800, wordBreak: "break-word" }}>
                                Correct: {question.correct_answer}
                              </p>
                            </div>
                          </div>

                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            <button onClick={() => editQuestion(question)} style={primaryButton}>
                              Edit
                            </button>
                            <button onClick={() => deleteQuestion(question.id)} style={dangerButton}>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {quizQuestions.length === 0 && (
                      <div
                        style={{
                          border: "1px dashed #cbd5e1",
                          borderRadius: 14,
                          padding: 18,
                          textAlign: "center",
                          color: "#64748b",
                          fontWeight: 600,
                        }}
                      >
                        No questions added yet.
                      </div>
                    )}
                  </div>
                </SectionCard>
              )}
            </div>
          )}

          {activeTab === "progress" && (
            <div style={{ display: "grid", gap: 20, minWidth: 0 }}>
              <SectionCard
                title="Progress Tracking Dashboard"
                subtitle="Monitor student activity, quiz performance, and subject summaries."
                right={
                  <button onClick={loadProgressData} style={{ ...warningButton, width: isPhone ? "100%" : "auto" }}>
                    Refresh Data
                  </button>
                }
                isTabletOrBelow={isTabletOrBelow}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: statCardsColumns,
                    gap: 12,
                  }}
                >
                  {[
                    { label: "Total Students", value: totalStudents },
                    { label: "Special Quizzes", value: totalQuizzes },
                    { label: "Total Results", value: totalAttempts },
                    { label: "Average Score", value: averageScore },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #dbe3ef",
                        borderRadius: 14,
                        padding: 16,
                        minWidth: 0,
                      }}
                    >
                      <p style={{ margin: 0, color: "#64748b", fontWeight: 700, fontSize: 13 }}>{item.label}</p>
                      <p style={{ margin: "10px 0 0 0", fontSize: isPhone ? 24 : 30, fontWeight: 800, wordBreak: "break-word" }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Student Progress" subtitle="Overall progress and latest activity per student." isTabletOrBelow={isTabletOrBelow}>
                {progressLoading ? (
                  <p style={{ margin: 0, color: "#64748b", fontWeight: 600 }}>Loading progress...</p>
                ) : (
                  <ScrollTable>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                        minWidth: 1100,
                        border: "1px solid #dbe3ef",
                        borderRadius: 14,
                        overflow: "hidden",
                      }}
                    >
                      <thead style={{ background: "#eff6ff" }}>
                        <tr>
                          {[
                            "Student",
                            "Grade",
                            "Section",
                            "Levels Done",
                            "Progress Stars",
                            "Quizzes Taken",
                            "Total Score",
                            "Avg Score",
                            "Avg Stars",
                            "Attempts",
                            "Last Activity",
                          ].map((head) => (
                            <th
                              key={head}
                              style={{
                                padding: "14px 12px",
                                textAlign: "left",
                                fontSize: 14,
                                color: "#334155",
                                borderBottom: "1px solid #dbe3ef",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {head}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {progressRows.map((row, index) => (
                          <tr key={row.student_id} style={{ background: index % 2 === 0 ? "#fff" : "#f8fafc" }}>
                            <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0", fontWeight: 700 }}>{row.student_name}</td>
                            <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{row.grade}</td>
                            <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>{row.section}</td>
                            <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>{row.completed_levels}</td>
                            <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>{row.progress_stars}</td>
                            <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>{row.quizzes_taken}</td>
                            <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>{row.total_score}</td>
                            <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>{row.average_score}</td>
                            <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>{row.average_stars}</td>
                            <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>{row.total_attempts}</td>
                            <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>
                              {row.last_activity ? formatDate(row.last_activity) : "-"}
                            </td>
                          </tr>
                        ))}

                        {progressRows.length === 0 && (
                          <tr>
                            <td colSpan={11} style={{ padding: 24, textAlign: "center", color: "#64748b", fontWeight: 600 }}>
                              No student progress yet. Let students answer quizzes first.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </ScrollTable>
                )}
              </SectionCard>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: subjectRecentColumns,
                  gap: 20,
                  minWidth: 0,
                }}
              >
                <SectionCard title="Subject Performance" subtitle="Attempts and average performance by subject." isTabletOrBelow={isTabletOrBelow}>
                  <div style={{ display: "grid", gap: 12 }}>
                    {subjectSummary.map((item) => (
                      <div
                        key={item.subject}
                        style={{
                          border: "1px solid #dbe3ef",
                          borderRadius: 14,
                          padding: 16,
                          background: "#f8fafc",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: isPhone ? "column" : "row",
                            justifyContent: "space-between",
                            alignItems: isPhone ? "flex-start" : "center",
                            gap: 10,
                          }}
                        >
                          <h4 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{item.subject}</h4>
                          <span
                            style={{
                              background: "#fff",
                              border: "1px solid #dbe3ef",
                              borderRadius: 999,
                              padding: "6px 10px",
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#475569",
                            }}
                          >
                            {item.total_attempts} attempts
                          </span>
                        </div>

                        <div
                          style={{
                            marginTop: 12,
                            display: "grid",
                            gridTemplateColumns: isPhone ? "1fr" : "1fr 1fr",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              background: "#fff",
                              border: "1px solid #dbe3ef",
                              borderRadius: 12,
                              padding: 14,
                            }}
                          >
                            <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 700 }}>Total Score</p>
                            <p style={{ margin: "8px 0 0 0", fontSize: 24, fontWeight: 800 }}>{item.total_score}</p>
                          </div>
                          <div
                            style={{
                              background: "#fff",
                              border: "1px solid #dbe3ef",
                              borderRadius: 12,
                              padding: 14,
                            }}
                          >
                            <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 700 }}>Average Score</p>
                            <p style={{ margin: "8px 0 0 0", fontSize: 24, fontWeight: 800 }}>{item.average_score}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {subjectSummary.length === 0 && (
                      <div
                        style={{
                          border: "1px dashed #cbd5e1",
                          borderRadius: 14,
                          padding: 18,
                          textAlign: "center",
                          color: "#64748b",
                          fontWeight: 600,
                        }}
                      >
                        No subject data yet.
                      </div>
                    )}
                  </div>
                </SectionCard>

                <SectionCard title="Recent Quiz Attempts" subtitle="Latest quiz activity from your students." isTabletOrBelow={isTabletOrBelow}>
                  <div
                    style={{
                      display: "grid",
                      gap: 10,
                      maxHeight: 520,
                      overflowY: "auto",
                      paddingRight: 6,
                    }}
                  >
                    {recentAttempts.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          border: "1px solid #dbe3ef",
                          borderRadius: 14,
                          padding: 16,
                          background: "#f8fafc",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: isTabletOrBelow ? "column" : "row",
                            justifyContent: "space-between",
                            gap: 8,
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <h4 style={{ margin: 0, fontSize: 17, fontWeight: 800, wordBreak: "break-word" }}>{item.student_name}</h4>
                            <p style={{ margin: "6px 0 0 0", color: "#64748b", fontWeight: 600, wordBreak: "break-word" }}>
                              {item.quiz_title} • {item.subject}
                            </p>
                          </div>
                          <div style={{ color: "#64748b", fontSize: 13, fontWeight: 600 }}>
                            {formatDate(item.completed_at)}
                          </div>
                        </div>

                        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 10 }}>
                          <div style={{ background: "#fff", border: "1px solid #dbe3ef", borderRadius: 12, padding: "8px 10px" }}>
                            <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 700 }}>Score</p>
                            <p style={{ margin: "6px 0 0 0", fontWeight: 800 }}>{item.score}</p>
                          </div>
                          <div style={{ background: "#fff", border: "1px solid #dbe3ef", borderRadius: 12, padding: "8px 10px" }}>
                            <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 700 }}>Stars</p>
                            <p style={{ margin: "6px 0 0 0", fontWeight: 800 }}>{item.stars} ⭐</p>
                          </div>
                          <div style={{ background: "#fff", border: "1px solid #dbe3ef", borderRadius: 12, padding: "8px 10px" }}>
                            <p style={{ margin: 0, fontSize: 12, color: "#64748b", fontWeight: 700 }}>Attempts</p>
                            <p style={{ margin: "6px 0 0 0", fontWeight: 800 }}>{item.attempts}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {recentAttempts.length === 0 && (
                      <div
                        style={{
                          border: "1px dashed #cbd5e1",
                          borderRadius: 14,
                          padding: 18,
                          textAlign: "center",
                          color: "#64748b",
                          fontWeight: 600,
                        }}
                      >
                        No recent attempts yet.
                      </div>
                    )}
                  </div>
                </SectionCard>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}