"use client";

const TEACHER_EMAIL_STORAGE_KEY = "teacher_email_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getTeacherEmail(): string {
  if (!isBrowser()) return "";
  try {
    const email = window.localStorage.getItem(TEACHER_EMAIL_STORAGE_KEY);
    return email || "";
  } catch {
    return "";
  }
}

export function setTeacherEmail(email: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(TEACHER_EMAIL_STORAGE_KEY, email);
  } catch (error) {
    console.error("[teacherSettingsStorage] Failed to save email:", error);
  }
}

