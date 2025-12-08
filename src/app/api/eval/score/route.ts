/**
 * API Route: Debate Turn AI Evaluation
 * 
 * 학생의 토론 발언을 Upstage AI로 평가합니다.
 */
import { NextRequest, NextResponse } from "next/server";
import { callUpstageJSON } from "@/lib/upstage";

interface EvaluationScore {
  logic: number;
  clarity: number;
  evidence: number;
  empathy: number;
  engagement: number;
  overall: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "text is required and must be a string" },
        { status: 400 }
      );
    }

    const prompt = `
다음 학생 발언을 0~100점의 5개 항목으로 평가해줘.

평가 항목:
- logic: 논리성 (논리적 사고와 추론 능력)
- clarity: 명확성 (의사 전달의 명확함)
- evidence: 근거 제시 (구체적 근거와 예시)
- empathy: 공감 능력 (상대방 입장 이해)
- engagement: 참여도 (적극적 참여와 열정)

각 항목은 0~100점 사이의 정수로 평가하고,
overall은 5개 항목의 평균값(소수점 첫째자리 반올림)으로 계산해줘.

반드시 JSON 형식만 출력하고, 다른 설명은 포함하지 마세요:

{
  "logic": 85,
  "clarity": 90,
  "evidence": 75,
  "empathy": 80,
  "engagement": 88,
  "overall": 84
}

학생 발언:
"${text}"
`;

    const result = await callUpstageJSON<EvaluationScore>(prompt);

    // Validation
    if (
      typeof result.logic !== "number" ||
      typeof result.clarity !== "number" ||
      typeof result.evidence !== "number" ||
      typeof result.empathy !== "number" ||
      typeof result.engagement !== "number" ||
      typeof result.overall !== "number"
    ) {
      throw new Error("Invalid response format from AI");
    }

    // Round overall to integer
    result.overall = Math.round(result.overall);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API /eval/score Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to evaluate debate turn" },
      { status: 500 }
    );
  }
}

