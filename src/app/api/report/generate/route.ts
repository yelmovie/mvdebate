/**
 * API Route: Student Report Generation
 * 
 * 학생의 토론 로그를 기반으로 리포트를 자동 생성합니다.
 */
import { NextRequest, NextResponse } from "next/server";
import { callUpstageJSON } from "@/lib/upstage";

interface DebateLog {
  text: string;
  timestamp: string;
  aiScore?: {
    logic: number;
    clarity: number;
    evidence: number;
    empathy: number;
    engagement: number;
    overall: number;
  };
}

interface ReportData {
  summary: string;
  strengths: string[];
  improvements: string[];
  score_trend_title: string;
  score_trend_summary: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { logs } = body;

    if (!Array.isArray(logs) || logs.length === 0) {
      return NextResponse.json(
        { error: "logs is required and must be a non-empty array" },
        { status: 400 }
      );
    }

    // Combine logs with scores
    const combined = logs
      .map((log: DebateLog, index: number) => {
        const score = log.aiScore?.overall ?? "N/A";
        return `${index + 1}. ${log.text} (점수: ${score}점)`;
      })
      .join("\n");

    const prompt = `
다음 학생의 토론 로그를 기반으로 A4 1장 분량의 리포트를 JSON 형식으로 생성해주세요.

학생 로그 (총 ${logs.length}개 발언):
${combined}

출력 형식 (반드시 JSON만 출력):
{
  "summary": "학생의 전체 토론 활동을 5문장으로 요약한 내용",
  "strengths": ["강점 1", "강점 2", "강점 3"],
  "improvements": ["개선점 1", "개선점 2", "개선점 3"],
  "score_trend_title": "점수 추이 제목 (예: '점진적 성장', '안정적 유지' 등)",
  "score_trend_summary": "점수 추이에 대한 2-3문장 설명"
}

주의사항:
- summary는 5문장으로 작성
- strengths와 improvements는 각각 3개 항목
- 모든 내용은 초등학생이 이해하기 쉬운 언어로 작성
- 격려와 긍정적인 톤 유지
`;

    const result = await callUpstageJSON<ReportData>(prompt);

    // Validation
    if (
      typeof result.summary !== "string" ||
      !Array.isArray(result.strengths) ||
      !Array.isArray(result.improvements) ||
      typeof result.score_trend_title !== "string" ||
      typeof result.score_trend_summary !== "string"
    ) {
      throw new Error("Invalid response format from AI");
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API /report/generate Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}

