/**
 * API Route: AI 토론 평가
 * 
 * 토론 대화 로그를 받아서 AI가 평가 점수와 코멘트를 생성합니다.
 */

import { NextRequest, NextResponse } from "next/server";
import { sendDebateMessage } from "../../../../services/ai/upstageClient";

const EVALUATION_SYSTEM_PROMPT = `너는 초등학생 토론을 평가하는 엄격한 교사 역할이다.
입력으로 토론 주제와 대화 기록이 주어진다.

[매우 중요한 평가 원칙]
1. **무의미한 입력(예: "asdf", "ㅋㅋㅋ", "...", "ㅇㅇ")이나 장난스러운 입력은 가차 없이 모든 항목 1점을 부여한다.**
2. **주제와 전혀 상관없는 엉뚱한 이야기(예: 급식 메뉴 물어보기, 게임 이야기 등)는 '주제 충실도' 1점을 부여한다.**
3. **내용이 너무 짧거나(단답형), 논리적인 문장이 아니면 낮은 점수를 부여한다.**
4. "학생이니까 좋게 봐주자"는 태도는 버려라. **오직 내용의 질로만 냉정하게 평가하라.**

[평가 기준]
1. 주장 명확성(clarity): 학생이 자신의 입장을 분명하게 말했는가? (1~5점)
   - 1점: 무슨 말인지 모르겠거나, 장난/무의미한 입력.
   - 5점: 주장이 매우 명확하고 논리적임.
2. 근거 사용(evidence): 주장에 맞는 구체적인 이유/예시를 제시했는가? (1~5점)
   - 1점: 근거가 없거나, "그냥"이라고 함.
   - 5점: 구체적인 사례와 논리적인 이유를 듦.
3. 주제 충실도(relevance): 주제에서 벗어나지 않고 말했는가? (1~5점)
   - 1점: 주제와 무관한 소리를 함.
   - 5점: 주제에 완벽하게 집중함.

[출력 형식(JSON)]
{
  "clarity": 1~5,
  "evidence": 1~5,
  "relevance": 1~5,
  "comment": "한글로 짧은 총평. 잘한 점과 개선할 점을 모두 포함. (장난친 경우 따끔하게 지적할 것)"
}

지금부터 JSON만 출력하고, 설명은 쓰지 마.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, log } = body;

    if (!topic || !log || typeof topic !== "string" || typeof log !== "string" || log.trim().length === 0) {
      return NextResponse.json(
        { error: "topic과 log가 필요합니다." },
        { status: 400 }
      );
    }

    try {
      // 평가 프롬프트 구성
      const userPrompt = `
주제: "${topic}"

대화 기록:
${log}
      `.trim();

      // Upstage API 호출
      const aiResponse = await sendDebateMessage({
        systemPrompt: EVALUATION_SYSTEM_PROMPT,
        userMessage: userPrompt
      });

      // JSON 파싱
      let evaluation;
      try {
        // 마크다운 코드 블록 제거
        let cleaned = aiResponse.aiMessageText.trim();
        cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "");
        cleaned = cleaned.replace(/\n?```\s*$/i, "");
        
        evaluation = JSON.parse(cleaned);
        
        // 필수 필드 검증
        if (typeof evaluation.clarity !== "number" || 
            typeof evaluation.evidence !== "number" || 
            typeof evaluation.relevance !== "number" ||
            typeof evaluation.comment !== "string") {
          throw new Error("Invalid evaluation format");
        }
        
        // 점수 범위 검증 (1~5)
        evaluation.clarity = Math.max(1, Math.min(5, Math.round(evaluation.clarity)));
        evaluation.evidence = Math.max(1, Math.min(5, Math.round(evaluation.evidence)));
        evaluation.relevance = Math.max(1, Math.min(5, Math.round(evaluation.relevance)));
      } catch (parseError) {
        console.error("[API /debate/evaluate] JSON parse error:", parseError);
        console.error("[API /debate/evaluate] Raw response:", aiResponse.aiMessageText);
        
        // 파싱 실패 시 기본값 반환
        evaluation = {
          clarity: 3,
          evidence: 3,
          relevance: 3,
          comment: "평가 생성 중 오류가 발생했습니다. 다시 시도해 주세요."
        };
      }

      return NextResponse.json({ evaluation });
    } catch (error: any) {
      console.error("[API /debate/evaluate] AI call failed:", error);
      
      return NextResponse.json(
        {
          error: error.message || "평가 생성 실패",
          evaluation: null
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[API /debate/evaluate] Request error:", error);
    
    return NextResponse.json(
      {
        error: error.message || "Internal server error"
      },
      { status: 500 }
    );
  }
}

