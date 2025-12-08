/**
 * Upstage API Client
 * 
 * 모든 AI 호출은 서버 사이드에서만 사용됩니다.
 * 프론트엔드에서 직접 호출하지 마세요.
 */

export interface UpstageMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface UpstageResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Upstage Solar LLM 호출
 * @param prompt 사용자 프롬프트
 * @param systemPrompt 시스템 프롬프트 (선택)
 * @param temperature 온도 설정 (기본 0.2)
 * @returns AI 응답 텍스트
 */
export async function callUpstage(
  prompt: string,
  systemPrompt?: string,
  temperature: number = 0.2
): Promise<string> {
  const apiKey = process.env.UPSTAGE_API_KEY;

  if (!apiKey) {
    throw new Error("UPSTAGE_API_KEY is not set in environment variables");
  }

  const messages: UpstageMessage[] = [];
  
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  
  messages.push({ role: "user", content: prompt });

  try {
    const response = await fetch("https://api.upstage.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "solar-oslo",
        messages: messages,
        temperature: temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upstage API error: ${response.status} - ${errorText}`);
    }

    const data: UpstageResponse = await response.json();
    return data.choices?.[0]?.message?.content ?? "";
  } catch (error) {
    console.error("[Upstage API Error]", error);
    throw error;
  }
}

/**
 * JSON 응답을 파싱하는 헬퍼 함수
 */
export async function callUpstageJSON<T>(
  prompt: string,
  systemPrompt?: string,
  temperature: number = 0.2
): Promise<T> {
  const response = await callUpstage(prompt, systemPrompt, temperature);
  
  try {
    // JSON 코드 블록 제거
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch (error) {
    console.error("[Upstage JSON Parse Error]", error);
    console.error("Raw response:", response);
    throw new Error("Failed to parse AI response as JSON");
  }
}

