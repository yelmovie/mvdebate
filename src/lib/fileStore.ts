
import fs from 'fs';
import path from 'path';
import { type DebateSession } from '../types/domain';

// Using the same interface as memoryStore
export interface StudentStatus {
  studentNumber: number;
  name: string;
  isConnected: boolean;
  currentSessionId?: string;
  topic?: string;
  stance?: "pro" | "con";
  turnCount: number;
  lastActive: string;
}

interface DB {
  studentStatuses: Record<number, StudentStatus>;
  sessions: Record<string, DebateSession>;
}

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadDB(): DB {
  if (!fs.existsSync(DB_PATH)) {
    return { studentStatuses: {}, sessions: {} };
  }
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to load DB", e);
    return { studentStatuses: {}, sessions: {} };
  }
}

function saveDB(db: DB) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error("Failed to save DB", e);
  }
}

export const fileStore = {
  // Sync wrapper for simplicity, though async usage is better for performance.
  // For this MVP scale (30 students), fs.writeFileSync is acceptable.

  updateStatus: (studentNumber: number, data: Partial<StudentStatus>) => {
    const db = loadDB();
    const current = db.studentStatuses[studentNumber] || {
      studentNumber,
      name: `${studentNumber}번 학생`,
      isConnected: false,
      turnCount: 0,
      lastActive: new Date().toISOString()
    };
    
    db.studentStatuses[studentNumber] = {
      ...current,
      ...data,
      lastActive: new Date().toISOString()
    };
    saveDB(db);
  },

  getAllStatuses: () => {
    const db = loadDB();
    return db.studentStatuses;
  },

  saveSession: (session: DebateSession) => {
    const db = loadDB();
    db.sessions[session.id] = session;
    saveDB(db);
  },

  getSession: (sessionId: string) => {
    const db = loadDB();
    return db.sessions[sessionId];
  }
};
