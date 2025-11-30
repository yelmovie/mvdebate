import { create } from "zustand";
import type { Topic, DebateSession, DebateTurn, DebateLabel, AiEvaluation } from "../types/domain";

interface DebateState {
  currentUserId?: string;
  nickname?: string;
  currentTopic?: Topic;
  stance?: "pro" | "con";
  session?: DebateSession;
  turns: DebateTurn[];
  isLoading: boolean;
  isEnded: boolean;
  evaluation?: AiEvaluation;
  error?: string;
  selectedPersonaId?: string; // Added persona state

  // 구조화된 주장 요소
  claim?: string;
  reasons: string[];
  evidences: string[];
  expectedCounter?: string;
  rebuttal?: string;

  // actions
  setUser: (id: string, nickname: string) => void;
  setTopic: (topic: Topic) => void;
  setStance: (stance: "pro" | "con") => void;
  setPersonaId: (id: string) => void; // Added persona action
  startSession: (session: DebateSession) => void;
  addTurn: (turn: DebateTurn) => void;
  setStructureFromLabel: (label: DebateLabel, text: string) => void;
  setLoading: (loading: boolean) => void;
  setEnded: (ended: boolean) => void;
  setEvaluation: (evaluation: AiEvaluation) => void;
  setError: (msg?: string) => void;
  reset: () => void;
}

export const useDebateStore = create<DebateState>((set) => ({
  turns: [],
  reasons: [],
  evidences: [],
  isLoading: false,
  isEnded: false,

  setUser: (id, nickname) => set({ currentUserId: id, nickname }),
  setTopic: (topic) => set({ currentTopic: topic }),
  setStance: (stance) => set({ stance }),
  setPersonaId: (id) => set({ selectedPersonaId: id }),
  startSession: (session) => set({ session, turns: [] }),
  addTurn: (turn) =>
    set((state) => ({ turns: [...state.turns, turn] })),
  setStructureFromLabel: (label, text) =>
    set((state) => {
      if (label === "claim") {
        return { ...state, claim: text };
      }
      if (label === "reason") {
        return { ...state, reasons: [...state.reasons, text] };
      }
      if (label === "evidence") {
        return { ...state, evidences: [...state.evidences, text] };
      }
      if (label === "counterargument") {
        return { ...state, expectedCounter: text };
      }
      if (label === "rebuttal") {
        return { ...state, rebuttal: text };
      }
      return state;
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setEnded: (isEnded) => set({ isEnded }),
  setEvaluation: (evaluation) => set({ evaluation }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      currentTopic: undefined,
      stance: undefined,
      session: undefined,
      turns: [],
      claim: undefined,
      reasons: [],
      evidences: [],
      expectedCounter: undefined,
      rebuttal: undefined,
      isEnded: false,
      evaluation: undefined,
      error: undefined,
      selectedPersonaId: undefined
    })
}));
