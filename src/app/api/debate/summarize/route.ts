/**
 * API Route: Debate Summary Generator
 * 
 * Summarizes debate conversation into 5 sentences focusing on pro/con arguments and evidence.
 */

import { NextRequest, NextResponse } from "next/server";
import { sendDebateMessage } from "../../../../services/ai/upstageClient";

const SUMMARIZE_SYSTEM_PROMPT = `You are a debate summarizer.

Input: 한국어 토론 대화 전체 로그 (학생과 AI의 메시지).
Goal: 토론의 전체 문장을 나열하지 말고, 찬성/반대 입장의 핵심 주장과 근거만 간단히 정리한다.

출력 규칙:
- 출력은 **한국어**로만 한다.
- 전체 길이는 **약 5문장 내외**로 제한한다.
- 반드시 다음 구조를 지킨다.

1. 오늘 토론 주제를 한 문장으로 정리.
2. 찬성 입장의 핵심 주장 1~2개와 대표 근거 1~2개.
3. 반대 입장의 핵심 주장 1~2개와 대표 근거 1~2개.
4. 마지막 한 문장에 오늘 토론에서 드러난 쟁점이나 차이점을 짧게 정리.

주의:
- 토론에서 나온 문장을 그대로 길게 복사하지 말고, 요약해서 말한다.
- 세부 발언, 개별 예시는 필요할 때만 간단히 한두 개만 언급한다.
- JSON, 목록 기호, 번호 없이 자연스러운 문장들로만 쓴다.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { log } = body;

    if (!log || typeof log !== "string" || log.trim().length === 0) {
      return NextResponse.json(
        { error: "log is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    try {
      // Call Upstage API for summarization
      const aiResponse = await sendDebateMessage({
        systemPrompt: SUMMARIZE_SYSTEM_PROMPT,
        userMessage: log.trim()
      });

      return NextResponse.json({
        summary: aiResponse.aiMessageText.trim()
      });
    } catch (error: any) {
      console.error("[API /debate/summarize] AI call failed:", error);
      
      return NextResponse.json(
        {
          error: error.message || "Failed to generate summary",
          summary: null
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[API /debate/summarize] Request error:", error);
    
    return NextResponse.json(
      {
        error: error.message || "Internal server error"
      },
      { status: 500 }
    );
  }
}


