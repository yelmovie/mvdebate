
// Simple in-memory store for demonstration
// NOTE: This data clears when the server restarts. 
// For production, replace this with a database (Firestore, Postgres, etc).

import { DebateSession, DebateTurn } from "../types/domain";

// Extend DebateSession to include live status
export interface StudentStatus {
  studentNumber: number; // 1 to 30
  name: string;
  isConnected: boolean;
  currentSessionId?: string;
  topic?: string;
  stance?: "pro" | "con";
  turnCount: number;
  lastActive: string; // ISO date
  evaluation?: any; // Result of debate
}

// Global storage
declare global {
  var _debateMemoryStore: {
    sessions: Record<string, DebateSession>;
    studentStatuses: Record<number, StudentStatus>;
  };
}

// Initialize if not exists
if (!global._debateMemoryStore) {
  global._debateMemoryStore = {
    sessions: {},
    studentStatuses: {},
  };
}

export const memoryStore = {
  // Update student status when they join or make a move
  updateStatus: (studentNumber: number, data: Partial<StudentStatus>) => {
    const current = global._debateMemoryStore.studentStatuses[studentNumber] || {
      studentNumber,
      name: `${studentNumber}번 학생`,
      isConnected: false,
      turnCount: 0,
      lastActive: new Date().toISOString()
    };
    
    global._debateMemoryStore.studentStatuses[studentNumber] = {
      ...current,
      ...data,
      lastActive: new Date().toISOString()
    };
  },

  getAllStatuses: () => {
    return global._debateMemoryStore.studentStatuses;
  },
  
  getSession: (sessionId: string) => {
    return global._debateMemoryStore.sessions[sessionId];
  },
  
  saveSession: (session: DebateSession) => {
    global._debateMemoryStore.sessions[session.id] = session;
  }
};
