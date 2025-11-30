"use client";

import type { Teacher } from "../types/domain";

const TEACHERS_STORAGE_KEY = "teachers_list_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadTeachers(): Teacher[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(TEACHERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Teacher[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveTeachers(teachers: Teacher[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(teachers));
  } catch (error) {
    console.error("[teacherStorage] Failed to save teachers:", error);
  }
}

export function addTeacher(teacher: Teacher): void {
  const all = loadTeachers();
  all.push(teacher);
  saveTeachers(all);
}

export function removeTeacher(teacherId: string): void {
  const all = loadTeachers();
  const filtered = all.filter((t) => t.id !== teacherId);
  saveTeachers(filtered);
}

export function getTeacherById(teacherId: string): Teacher | null {
  const all = loadTeachers();
  return all.find((t) => t.id === teacherId) || null;
}

