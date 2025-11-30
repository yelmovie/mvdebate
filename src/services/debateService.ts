/**
 * Debate Service
 * 
 * Handles debate session management and AI turn interactions.
 * Uses Upstage API for AI coaching via API routes.
 */

import { apiFetch } from "./apiClient";
import type { DebateSession, DebateTurn } from "../types/domain";

/**
 * Creates a new debate session
 */
export async function createSession(payload: {
  userId: string;
  topicId: number;
  stance: "pro" | "con";
  difficulty: "easy" | "hard";
  personaId?: string;
}): Promise<DebateSession> {
  return apiFetch<DebateSession>("/api/debate/session", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

/**
 * Sends a student turn and gets AI response via API route
 * 
 * @param sessionId - Current debate session ID
 * @param text - Student's message
 * @param topicTitle - Current debate topic title (optional)
 * @param stance - Current debate stance (optional)
 * @param turnCount - Current turn count (student + AI combined, optional)
 * @returns Student turn + AI turn (if successful)
 */
export async function sendTurn({
  sessionId,
  text,
  topicTitle,
  stance,
  difficulty,
  turnCount,
  turnIndex,
  maxTurns,
  phase,
  history,
  personaId
}: {
  sessionId: string;
  text: string;
  topicTitle?: string;
  stance?: "pro" | "con";
  difficulty?: "easy" | "hard";
  turnCount?: number;
  turnIndex?: number;
  maxTurns?: number;
  phase?: "normal" | "closing-warning" | "closing-final";
  history?: { role: "user" | "assistant"; content: string }[];
  personaId?: string;
}): Promise<{
  turn: DebateTurn;
  aiTurn?: DebateTurn;
}> {
  // Call API route (which handles Upstage API internally)
  const response = await apiFetch<{
    turn: DebateTurn;
    aiTurn?: DebateTurn;
  }>("/api/debate/turn", {
    method: "POST",
    body: JSON.stringify({ sessionId, text, topicTitle, stance, difficulty, turnCount, turnIndex, maxTurns, phase, history, personaId })
  });

  // Client-side safety filter: Remove (※ ...) and (Student: ...) patterns
  if (response.aiTurn && response.aiTurn.text) {
    response.aiTurn.text = response.aiTurn.text
      .replace(/\(※.*?\)/g, "") // Remove (※ ...)
      .replace(/\(Student:.*?\)/g, "") // Remove (Student: ...)
      .replace(/\(.*\)/g, (match: string) => {
        // Remove other parentheses if they look like meta-commentary (heuristic)
        if (match.includes("설명") || match.includes("반박") || match.includes("근거")) {
          return "";
        }
        return match;
      })
      .trim();
  }

  return response;
}
