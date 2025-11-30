"use client";

import type { DebateSessionReport } from "../types/domain";

const STORAGE_KEY = "debate_session_reports_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadReports(): DebateSessionReport[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DebateSessionReport[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveReports(reports: DebateSessionReport[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function addReport(report: DebateSessionReport) {
  const all = loadReports();
  all.push(report);
  saveReports(all);
}

export function clearReports() {
  saveReports([]);
}






