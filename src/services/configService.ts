import { DEBATE_TOPICS } from "../data/debateTopics";
import systemPrompts from "../config/systemPrompt.json";
import rubricsData from "../config/rubrics.json";
import { PERSONAS } from "../config/personas";
import appSettingsJson from "../config/appSettings.json";
import type { Topic, Rubric } from "../types/domain";

export function getTopics(): Topic[] {
  return DEBATE_TOPICS;
}

export function getSystemPrompt(options?: {
  promptType?: "debate_coach" | "debate_battle_prompt" | "speech_review_helper";
  topic?: string;
  stance?: "pro" | "con";
  turnCount?: number;
  turnIndex?: number;
  maxTurns?: number;
  phase?: "normal" | "closing-warning" | "closing-final";
  difficulty?: "low" | "mid" | "high";
  personaId?: string;
  aiStance?: "pro" | "con";
  level?: "High" | "Mid" | "Low";
  grade?: string;
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
  
  // 2. 변수 치환
  if (options) {
    const { topic, stance, aiStance, turnCount, turnIndex, maxTurns, phase, difficulty, personaId, level, grade } = options;

    if (topic) prompt = prompt.replace(/\{\{topic\}\}/g, topic);

    // 난이도(difficulty)를 level로 매핑
    let effectLevel = level || "Low";
    if (!level && difficulty) {
       switch (difficulty) {
           case "high": effectLevel = "High"; break;
           case "mid": effectLevel = "Mid"; break;
           case "low": default: effectLevel = "Low"; break;
       }
    }

    prompt = prompt.replace(/\{\{level\}\}/g, effectLevel);
    prompt = prompt.replace(/\{\{grade\}\}/g, grade || "초등 4학년");

    if (stance) {
      const stanceText = stance === "pro" ? "찬성" : "반대";
      // aiStance가 명시적으로 있으면 그것을 쓰고, 없으면 학생 반대로
      const aiStanceText = aiStance 
        ? (aiStance === "pro" ? "찬성" : "반대")
        : (stance === "pro" ? "반대" : "찬성");
      
      // debate_coach는 {{stance}}만 사용 (학생 입장 위주)
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

    // [변경] 기존 하드코딩된 난이도별 프롬프트 추가 로직 제거
    // 이유: systemPrompt.json 내부의 [Difficulty System]이 이를 대체함.
    
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
