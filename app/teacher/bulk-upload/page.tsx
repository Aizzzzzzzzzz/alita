// FULL UPDATED TEACHER PAGE WITH BULK STUDENT UPLOAD
// INSTALL FIRST: npm install xlsx

"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../../../lib/supabase";;

// ================= TYPES =================
type BulkStudentRow = {
  full_name: string;
  username: string;
  password: string;
  grade_level: string;
  section: string;
};

// ================= PARSER =================
function parseBulkStudentRow(
  row: Record<string, unknown>,
  index: number
): { data?: BulkStudentRow; error?: string } {
  const full_name = String(row.full_name ?? row.name ?? "").trim();
  const username = String(row.username ?? "").trim();
  const password = String(row.password ?? "").trim();
  const grade_level = String(row.grade_level ?? row.grade ?? "").trim();
  const section = String(row.section ?? "").trim();

  if (!full_name || !username || !password || !grade_level || !section) {
    return {
      error: `Row ${index + 2}: missing required column value.`,
    };
  }

  return {
    data: {
      full_name,
      username,
      password,
      grade_level,
      section,
    },
  };
}

// ================= COMPONENT =================
export default function TeacherBulkUpload() {
  const [message, setMessage] = useState("");

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) throw new Error("No sheet found.");

      const worksheet = workbook.Sheets[firstSheetName];

      const rawRows = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
      }) as Record<string, unknown>[];

      if (rawRows.length === 0) {
        throw new Error("Excel file is empty.");
      }

      const parsedRows: BulkStudentRow[] = [];
      const rowErrors: string[] = [];
      const seenUsernames = new Set<string>();

      rawRows.forEach((row: Record<string, unknown>, index: number) => {
        const { data, error } = parseBulkStudentRow(row, index);

        if (error) {
          rowErrors.push(error);
          return;
        }

        if (!data) return;

        const usernameKey = data.username.toLowerCase();

        if (seenUsernames.has(usernameKey)) {
          rowErrors.push(
            `Row ${index + 2}: duplicate username "${data.username}"`
          );
          return;
        }

        seenUsernames.add(usernameKey);
        parsedRows.push(data);
      });

      if (rowErrors.length > 0) {
        setMessage(rowErrors.join("\n"));
        return;
      }

      const teacherId = localStorage.getItem("teacherId");

      const insertData = parsedRows.map((row) => ({
        teacher_id: teacherId,
        full_name: row.full_name,
        username: row.username,
        password: row.password,
        grade_level: row.grade_level,
        section: row.section,
      }));

      const { error } = await supabase.from("students").insert(insertData);

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Bulk upload successful!");
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Bulk Student Upload</h2>

      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
      />

      <br /><br />

      <a href="/student_bulk_upload_template.xlsx" download>
        Download Sample Excel
      </a>

      <pre style={{ marginTop: 20, color: "red" }}>{message}</pre>
    </div>
  );
}
