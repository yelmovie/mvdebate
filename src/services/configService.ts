import topicsJson from "../config/topics.json";
import systemPrompts from "../config/systemPrompt.json";
import rubricsData from "../config/rubrics.json";
import { PERSONAS } from "../config/personas";
import appSettingsJson from "../config/appSettings.json";
import type { Topic, Rubric } from "../types/domain";



export function getTopics(): Topic[] {
  return topicsJson as Topic[];
}

export function getSystemPrompt(options?: {
  promptType?: "debate_coach" | "debate_battle_prompt";
  topic?: string;
  stance?: "pro" | "con";
  turnCount?: number;
  turnIndex?: number;
  maxTurns?: number;
  phase?: "normal" | "closing-warning" | "closing-final";
  difficulty?: "easy" | "hard";
  personaId?: string;
}): string {
  const promptType = options?.promptType || "debate_battle_prompt";
  
  const sp = systemPrompts as {
    [key: string]: {
      role: string;
      name: string;
      content: string[];
    };
  };
  
  const selectedPrompt = sp[promptType];
  if (!selectedPrompt) {
    console.warn(`[configService] Prompt type "${promptType}" not found, using "debate_coach"`);
    const fallback = sp["debate_coach"];
    if (!fallback) {
      throw new Error("Default prompt 'debate_coach' not found in systemPrompt.json");
    }
    return fallback.content.join("\n");
  }
  
  let prompt = selectedPrompt.content.join("\n");
  
  // 치환 변수 처리
  if (options) {
    const { topic, stance, turnIndex, maxTurns, phase, personaId } = options;
    
    // topic 치환
    if (topic) {
      prompt = prompt.replace(/\{\{topic\}\}/g, topic);
    }
    
    // stance 치환 (pro -> 찬성, con -> 반대)
    if (stance) {
      const stanceText = stance === "pro" ? "찬성" : "반대";
      const aiStanceText = stance === "pro" ? "반대" : "찬성"; // AI는 학생과 반대 입장
      
      // debate_coach는 {{stance}}만 사용
      prompt = prompt.replace(/\{\{stance\}\}/g, stanceText);
      
      // debate_battle_prompt는 {{studentStance}}와 {{aiStance}} 사용
      prompt = prompt.replace(/\{\{studentStance\}\}/g, stanceText);
      prompt = prompt.replace(/\{\{aiStance\}\}/g, aiStanceText);
    }
    
    // turnIndex, maxTurns, phase 치환 (debate_battle_prompt용)
    if (typeof turnIndex === "number") {
      prompt = prompt.replace(/\{\{turnIndex\}\}/g, String(turnIndex));
    }
    if (typeof maxTurns === "number") {
      prompt = prompt.replace(/\{\{maxTurns\}\}/g, String(maxTurns));
    }
    if (phase) {
      prompt = prompt.replace(/\{\{phase\}\}/g, phase);
    }

    // 난이도별 어조 및 어휘 조정
    if (options.difficulty === "easy") {
      prompt += `
      
[IMPORTANT INSTRUCTION FOR EASY MODE]
- Target Audience: Elementary school student (Lower grades).
- Tone: Friendly classmate (Banmal/Casual). NOT a teacher.
- Vocabulary: VERY SIMPLE. NO difficult words (e.g., '판례', '무주물', '사회적 비용' -> X).
- Language: PURE KOREAN. NEVER use English words.
- Logic: Simple and direct.
- If you use difficult words, the student will cry. Be kind and easy.
`;
    } else if (options.difficulty === "hard") {
      prompt += `
      
[IMPORTANT INSTRUCTION FOR HARD MODE]
- The user is a middle/high school student.
- Use formal and academic vocabulary appropriate for debate.
- Be critical and logical. Challenge the user's logic sharply.
- Point out logical fallacies if any.
- Expect high-quality arguments from the user.
`;
    }

    // Persona Injection (Apply regardless of difficulty)
    if (personaId) {
      const persona = PERSONAS.find(p => p.id === personaId);
      if (persona) {
        prompt += `
[IMPORTANT: PERSONA INSTRUCTION]
You are now "${persona.name}".
Style: ${persona.style}
Rules:
${persona.prompt}

Act ONLY as this persona. Do not break character.
IMPORTANT: Do NOT output any text in parentheses like (※ ...) or (Student: ...). Output ONLY the spoken words.
`;
      }
    }
  }
  
  return prompt;
}

export function getAppSettings() {
  return appSettingsJson as {
    ai: { model: string; temperature: number; maxTurnsPerSession: number };
    safety: { blockCategories: string[]; maxTopicDifficultyForKids: number };
    ui: { maxMessageLength: number; autosaveIntervalMs: number };
  };
}

export function getRubrics(): Record<string, Rubric> {
  return rubricsData as unknown as Record<string, Rubric>;
}
