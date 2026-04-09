"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type AdminRow = {
  id: string;
  full_name: string;
  username: string;
  email: string;
  recovery_email: string | null;
  role: string;
  created_at?: string;
};

type TeacherRow = {
  id: string;
  full_name: string;
  username: string;
  password: string;
  created_at?: string;
};

type StudentRow = {
  id: string;
  full_name: string;
  username: string;
  grade_level: string;
  section: string;
  teacher_id: string;
  created_at?: string;
};

type QuizRow = {
  id: string;
  title: string;
  subject: string;
  grade_level: string;
  quiz_type: string;
  status: string;
  teacher_id: string;
  created_at?: string;
};

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #dbe3ef",
        borderRadius: 18,
        padding: 22,
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <h2
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 800,
            color: "#0f172a",
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
              fontSize: 14,
            }}
          >
            {subtitle}
          </p>
        )}
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
        border: active ? "1px solid #7c3aed" : "1px solid #dbe3ef",
        background: active ? "#7c3aed" : "#ffffff",
        color: active ? "#ffffff" : "#0f172a",
        borderRadius: 14,
        padding: "14px 16px",
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.2s ease",
        boxShadow: active
          ? "0 8px 20px rgba(124, 58, 237, 0.25)"
          : "0 4px 12px rgba(15, 23, 42, 0.05)",
      }}
    >
      {children}
    </button>
  );
}

export default function AdminPage() {
  const router = useRouter();

  const [currentAdmin, setCurrentAdmin] = useState<AdminRow | null>(null);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "account" | "teachers" | "students" | "quizzes"
  >("overview");

  const [teacherForm, setTeacherForm] = useState({
    full_name: "",
    username: "",
    password: "",
  });

  const [accountForm, setAccountForm] = useState({
    full_name: "",
    username: "",
    email: "",
    recovery_email: "",
  });

  const [statusMessage, setStatusMessage] = useState("");
  const [statusColor, setStatusColor] = useState("#16a34a");
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    checkAdminSession();
  }, []);

  async function checkAdminSession() {
    setPageLoading(true);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      localStorage.removeItem("alitaUser");
      localStorage.removeItem("adminId");
      router.push("/login");
      return;
    }

    localStorage.setItem("alitaUser", "admin");
    localStorage.setItem("adminId", user.id);

    const { data: adminProfile, error: adminError } = await supabase
      .from("admins")
      .select("*")
      .eq("id", user.id)
      .single();

    if (adminError || !adminProfile) {
      await supabase.auth.signOut();
      localStorage.removeItem("alitaUser");
      localStorage.removeItem("adminId");
      router.push("/login");
      return;
    }

    setCurrentAdmin(adminProfile as AdminRow);
    setAccountForm({
      full_name: adminProfile.full_name || "",
      username: adminProfile.username || "",
      email: adminProfile.email || "",
      recovery_email: adminProfile.recovery_email || "",
    });

    await loadAllData();
    setPageLoading(false);
  }

  async function loadAllData() {
    await Promise.all([loadTeachers(), loadStudents(), loadQuizzes()]);
  }

  async function loadTeachers() {
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setStatusMessage(error.message);
      setStatusColor("#dc2626");
      return;
    }

    setTeachers((data || []) as TeacherRow[]);
  }

  async function loadStudents() {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setStatusMessage(error.message);
      setStatusColor("#dc2626");
      return;
    }

    setStudents((data || []) as StudentRow[]);
  }

  async function loadQuizzes() {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setStatusMessage(error.message);
      setStatusColor("#dc2626");
      return;
    }

    setQuizzes((data || []) as QuizRow[]);
  }

  async function updateAdminAccount() {
    if (!currentAdmin) return;

    if (
      accountForm.full_name.trim() === "" ||
      accountForm.username.trim() === "" ||
      accountForm.email.trim() === ""
    ) {
      setStatusMessage("Please complete all required admin profile fields.");
      setStatusColor("#dc2626");
      return;
    }

    const { error } = await supabase
      .from("admins")
      .update({
        full_name: accountForm.full_name.trim(),
        username: accountForm.username.trim(),
        email: accountForm.email.trim().toLowerCase(),
        recovery_email: accountForm.recovery_email.trim()
          ? accountForm.recovery_email.trim().toLowerCase()
          : null,
      })
      .eq("id", currentAdmin.id);

    if (error) {
      setStatusMessage(error.message);
      setStatusColor("#dc2626");
      return;
    }

    setStatusMessage("Admin profile updated successfully.");
    setStatusColor("#16a34a");

    const { data, error: reloadError } = await supabase
      .from("admins")
      .select("*")
      .eq("id", currentAdmin.id)
      .single();

    if (reloadError) {
      setStatusMessage(reloadError.message);
      setStatusColor("#dc2626");
      return;
    }

    if (data) {
      setCurrentAdmin(data as AdminRow);
      setAccountForm({
        full_name: data.full_name || "",
        username: data.username || "",
        email: data.email || "",
        recovery_email: data.recovery_email || "",
      });
    }
  }

  async function addTeacher() {
    if (
      teacherForm.full_name.trim() === "" ||
      teacherForm.username.trim() === "" ||
      teacherForm.password.trim() === ""
    ) {
      setStatusMessage("Please fill in all teacher fields.");
      setStatusColor("#dc2626");
      return;
    }

    const { error } = await supabase.from("teachers").insert([
      {
        full_name: teacherForm.full_name.trim(),
        username: teacherForm.username.trim(),
        password: teacherForm.password.trim(),
      },
    ]);

    if (error) {
      setStatusMessage(error.message);
      setStatusColor("#dc2626");
      return;
    }

    setTeacherForm({
      full_name: "",
      username: "",
      password: "",
    });

    setStatusMessage("Teacher account added successfully.");
    setStatusColor("#16a34a");
    await loadTeachers();
  }

  async function deleteTeacher(id: string) {
    const confirmed = window.confirm("Are you sure you want to delete this teacher?");
    if (!confirmed) return;

    const { error } = await supabase.from("teachers").delete().eq("id", id);

    if (error) {
      setStatusMessage(error.message);
      setStatusColor("#dc2626");
      return;
    }

    setStatusMessage("Teacher deleted successfully.");
    setStatusColor("#16a34a");
    await loadAllData();
  }

  async function deleteStudent(id: string) {
    const confirmed = window.confirm("Are you sure you want to delete this student?");
    if (!confirmed) return;

    try {
      const { error: resultsError } = await supabase
        .from("results")
        .delete()
        .eq("student_id", id);
      if (resultsError) throw resultsError;

      const { error: progressError } = await supabase
        .from("student_progress")
        .delete()
        .eq("student_id", id);
      if (progressError) throw progressError;

      const { error: walletError } = await supabase
        .from("student_wallets")
        .delete()
        .eq("student_id", id);
      if (walletError) throw walletError;

      const { error: unlocksError } = await supabase
        .from("character_unlocks")
        .delete()
        .eq("student_id", id);
      if (unlocksError) throw unlocksError;

      const { error: studentError } = await supabase
        .from("students")
        .delete()
        .eq("id", id);
      if (studentError) throw studentError;

      setStatusMessage("Student deleted successfully.");
      setStatusColor("#16a34a");
      await loadAllData();
    } catch (error: any) {
      setStatusMessage(error.message || "Failed to delete student.");
      setStatusColor("#dc2626");
    }
  }

  async function deleteQuiz(id: string) {
    const confirmed = window.confirm("Are you sure you want to delete this quiz?");
    if (!confirmed) return;

    const { error } = await supabase.from("quizzes").delete().eq("id", id);

    if (error) {
      setStatusMessage(error.message);
      setStatusColor("#dc2626");
      return;
    }

    setStatusMessage("Quiz deleted successfully.");
    setStatusColor("#16a34a");
    await loadQuizzes();
  }

  async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem("alitaUser");
    localStorage.removeItem("adminId");
    localStorage.removeItem("teacherId");
    localStorage.removeItem("studentId");
    router.push("/login");
  }

  const totalTeachers = teachers.length;
  const totalStudents = students.length;
  const totalQuizzes = quizzes.length;

  const publishedQuizzes = useMemo(() => {
    return quizzes.filter((q) => q.status === "published").length;
  }, [quizzes]);

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
  };

  const primaryButton: React.CSSProperties = {
    border: "none",
    background: "#7c3aed",
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

  if (pageLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #faf5ff 0%, #f4f7ff 100%)",
          color: "#7c3aed",
          fontSize: 20,
          fontWeight: 800,
        }}
      >
        Loading admin panel...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #faf5ff 0%, #f4f7ff 100%)",
        color: "#0f172a",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #e9d5ff",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "#7c3aed",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 20,
                boxShadow: "0 10px 20px rgba(124, 58, 237, 0.25)",
              }}
            >
              A
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>
                Admin Panel
              </h1>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 14 }}>
                ALITA system maintenance dashboard
              </p>
            </div>
          </div>

          <button onClick={logout} style={dangerButton}>
            Logout
          </button>
        </div>
      </header>

      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: 24,
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: 20,
        }}
      >
        <aside
          style={{
            background: "#ffffff",
            border: "1px solid #e9d5ff",
            borderRadius: 18,
            padding: 16,
            height: "fit-content",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
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
            <MenuButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
              Overview
            </MenuButton>
            <MenuButton active={activeTab === "account"} onClick={() => setActiveTab("account")}>
              Admin Profile
            </MenuButton>
            <MenuButton active={activeTab === "teachers"} onClick={() => setActiveTab("teachers")}>
              Teacher Accounts
            </MenuButton>
            <MenuButton active={activeTab === "students"} onClick={() => setActiveTab("students")}>
              Student Accounts
            </MenuButton>
            <MenuButton active={activeTab === "quizzes"} onClick={() => setActiveTab("quizzes")}>
              Quiz Management
            </MenuButton>
          </div>
        </aside>

        <main style={{ display: "grid", gap: 20 }}>
          {activeTab === "overview" && (
            <SectionCard
              title="System Overview"
              subtitle="Quick summary of teachers, students, and quizzes."
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  { label: "Teachers", value: totalTeachers },
                  { label: "Students", value: totalStudents },
                  { label: "Quizzes", value: totalQuizzes },
                  { label: "Published", value: publishedQuizzes },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      background: "#faf5ff",
                      border: "1px solid #e9d5ff",
                      borderRadius: 14,
                      padding: 16,
                    }}
                  >
                    <p style={{ margin: 0, color: "#64748b", fontWeight: 700, fontSize: 13 }}>
                      {item.label}
                    </p>
                    <p style={{ margin: "10px 0 0 0", fontSize: 30, fontWeight: 800 }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {activeTab === "account" && (
            <SectionCard
              title="Admin Profile Settings"
              subtitle="Update the admin profile, email, and recovery email."
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <input
                  placeholder="Full name"
                  value={accountForm.full_name}
                  onChange={(e) => setAccountForm({ ...accountForm, full_name: e.target.value })}
                  style={inputStyle}
                />

                <input
                  placeholder="Username"
                  value={accountForm.username}
                  onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value })}
                  style={inputStyle}
                />

                <input
                  placeholder="Email"
                  value={accountForm.email}
                  onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                  style={inputStyle}
                />

                <input
                  placeholder="Recovery Email"
                  value={accountForm.recovery_email}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, recovery_email: e.target.value })
                  }
                  style={inputStyle}
                />
              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={updateAdminAccount} style={primaryButton}>
                  Save Admin Profile
                </button>
                <p style={{ margin: 0, fontWeight: 700, color: statusColor }}>{statusMessage}</p>
              </div>

              <div
                style={{
                  marginTop: 18,
                  padding: 16,
                  borderRadius: 14,
                  background: "#faf5ff",
                  border: "1px solid #e9d5ff",
                }}
              >
                <p style={{ margin: 0, fontWeight: 700, color: "#334155" }}>
                  Current Admin:
                </p>
                <p style={{ margin: "8px 0 0 0", color: "#7c3aed", fontWeight: 800 }}>
                  {currentAdmin?.full_name || "No admin loaded"}
                </p>
                <p style={{ margin: "8px 0 0 0", color: "#475569", fontWeight: 700 }}>
                  Username: {currentAdmin?.username || "-"}
                </p>
                <p style={{ margin: "8px 0 0 0", color: "#475569", fontWeight: 700 }}>
                  Email: {currentAdmin?.email || "-"}
                </p>
                <p style={{ margin: "8px 0 0 0", color: "#475569", fontWeight: 700 }}>
                  Recovery Email: {currentAdmin?.recovery_email || "-"}
                </p>
              </div>
            </SectionCard>
          )}

          {activeTab === "teachers" && (
            <SectionCard
              title="Teacher Account Management"
              subtitle="Create and delete teacher accounts."
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <input
                  placeholder="Full name"
                  value={teacherForm.full_name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, full_name: e.target.value })}
                  style={inputStyle}
                />
                <input
                  placeholder="Username"
                  value={teacherForm.username}
                  onChange={(e) => setTeacherForm({ ...teacherForm, username: e.target.value })}
                  style={inputStyle}
                />
                <input
                  placeholder="Password"
                  value={teacherForm.password}
                  onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <button onClick={addTeacher} style={primaryButton}>
                  Add Teacher
                </button>
                <p style={{ margin: 0, fontWeight: 700, color: statusColor }}>{statusMessage}</p>
              </div>

              <div style={{ marginTop: 20, overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    border: "1px solid #e9d5ff",
                    borderRadius: 14,
                    overflow: "hidden",
                  }}
                >
                  <thead style={{ background: "#faf5ff" }}>
                    <tr>
                      {["Name", "Username", "Password", "Actions"].map((head) => (
                        <th
                          key={head}
                          style={{
                            padding: "14px 12px",
                            textAlign: "left",
                            fontSize: 14,
                            color: "#334155",
                            borderBottom: "1px solid #e9d5ff",
                          }}
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((teacher, index) => (
                      <tr key={teacher.id} style={{ background: index % 2 === 0 ? "#fff" : "#fcfcff" }}>
                        <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9", fontWeight: 600 }}>
                          {teacher.full_name}
                        </td>
                        <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                          {teacher.username}
                        </td>
                        <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                          {teacher.password}
                        </td>
                        <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                          <button onClick={() => deleteTeacher(teacher.id)} style={dangerButton}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {teachers.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          style={{
                            padding: 24,
                            textAlign: "center",
                            color: "#64748b",
                            fontWeight: 600,
                          }}
                        >
                          No teachers yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {activeTab === "students" && (
            <SectionCard
              title="Student Accounts"
              subtitle="View and delete all students in the system."
            >
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    minWidth: 900,
                    border: "1px solid #e9d5ff",
                    borderRadius: 14,
                    overflow: "hidden",
                  }}
                >
                  <thead style={{ background: "#faf5ff" }}>
                    <tr>
                      {["Name", "Username", "Grade", "Section", "Teacher ID", "Actions"].map((head) => (
                        <th
                          key={head}
                          style={{
                            padding: "14px 12px",
                            textAlign: "left",
                            fontSize: 14,
                            color: "#334155",
                            borderBottom: "1px solid #e9d5ff",
                          }}
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={student.id} style={{ background: index % 2 === 0 ? "#fff" : "#fcfcff" }}>
                        <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9", fontWeight: 600 }}>
                          {student.full_name}
                        </td>
                        <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                          {student.username}
                        </td>
                        <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                          {student.grade_level}
                        </td>
                        <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                          {student.section}
                        </td>
                        <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                          {student.teacher_id}
                        </td>
                        <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                          <button onClick={() => deleteStudent(student.id)} style={dangerButton}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            padding: 24,
                            textAlign: "center",
                            color: "#64748b",
                            fontWeight: 600,
                          }}
                        >
                          No students yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {activeTab === "quizzes" && (
            <SectionCard
              title="Quiz Management"
              subtitle="View and delete quizzes for maintenance."
            >
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    minWidth: 1000,
                    border: "1px solid #e9d5ff",
                    borderRadius: 14,
                    overflow: "hidden",
                  }}
                >
                  <thead style={{ background: "#faf5ff" }}>
                    <tr>
                      {["Title", "Subject", "Grade", "Type", "Status", "Teacher ID", "Actions"].map((head) => (
                        <th
                          key={head}
                          style={{
                            padding: "14px 12px",
                            textAlign: "left",
                            fontSize: 14,
                            color: "#334155",
                            borderBottom: "1px solid #e9d5ff",
                          }}
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {quizzes.map((quiz, index) => (
                      <tr key={quiz.id} style={{ background: index % 2 === 0 ? "#fff" : "#fcfcff" }}>
                        <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9", fontWeight: 600 }}>
                          {quiz.title}
                        </td>
                        <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                          {quiz.subject}
                        </td>
                        <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                          {quiz.grade_level}
                        </td>
                        <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                          {quiz.quiz_type}
                        </td>
                        <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                          {quiz.status}
                        </td>
                        <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                          {quiz.teacher_id}
                        </td>
                        <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                          <button onClick={() => deleteQuiz(quiz.id)} style={dangerButton}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {quizzes.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          style={{
                            padding: 24,
                            textAlign: "center",
                            color: "#64748b",
                            fontWeight: 600,
                          }}
                        >
                          No quizzes yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}
        </main>
      </div>
    </div>
  );
}