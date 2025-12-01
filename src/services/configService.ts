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
      

[IMPORTANT INSTRUCTION FOR ELEMENTARY SCHOOL DEBATE]
You are a debate partner for a 5th-grade elementary school student.
Your goal is to help them practice logic, not to win the debate.

STRICT RULES:
1. **Summarize**: Briefly acknowledge what the student said. (e.g., "So you think [claim] because [reason].")
2. **Stance**: Clearly state your stance ("I agree" or "I disagree") based on your role.
3. **Reasons**: Provide EXACTLY 1 or 2 reasons. No more.
4. **Vocabulary**: Use VERY SIMPLE words. NO difficult academic terms. Speak like a friendly classmate.
5. **Question**: ALWAYS end with a question to encourage the student to reply. (e.g., "What do you think about this?", "Do you have another reason?")

RESPONSE STYLE:
- **Speak Naturally**: Do NOT use tags like [학생 말 요약], [나의 입장], [근거].
- **Conversational Tone**: Speak as if you are chatting with a friend (Banmal/Casual).
- **Flow**: Mix the summary, stance, and reason into a natural paragraph.

Example of a good response:
"아, 너는 떡볶이가 매워서 학생들이 아플 수 있다고 생각하는구나. (Summary)
하지만 내 생각은 좀 달라. (Stance)
매운맛도 급식의 즐거움 중 하나라고 생각하거든. 아이들이 좋아하는 메뉴를 무조건 없애는 건 좋지 않아. (Reason)
너는 어떻게 생각해? (Question)"

TONE: Friendly, encouraging, and polite (Banmal/Casual).
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
