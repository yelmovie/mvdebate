import { DebateSessionReport } from "../types/domain";

const HISTORY_KEY = "debate_history";

/**
 * Saves a completed debate session to local history.
 */
export function saveSessionToHistory(report: DebateSessionReport) {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    const history: DebateSessionReport[] = historyJson ? JSON.parse(historyJson) : [];
    
    // Add new report to the beginning
    history.unshift(report);
    
    // Limit history to 100 items to prevent storage issues
    if (history.length > 100) {
      history.length = 100;
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save debate history:", error);
  }
}

/**
 * Retrieves all saved debate sessions from local history.
 */
export function getSessionHistory(): DebateSessionReport[] {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error("Failed to load debate history:", error);
    return [];
  }
}

/**
 * Clears the debate history.
 */
export function clearSessionHistory() {
  localStorage.removeItem(HISTORY_KEY);
}
