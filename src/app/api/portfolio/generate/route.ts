/**
 * API Route: Student Portfolio Generation
 * 
 * 학생의 전체 학기 토론 로그를 기반으로 성장 포트폴리오를 생성합니다.
 */
import { NextRequest, NextResponse } from "next/server";
import { callUpstageJSON } from "@/lib/upstage";

interface DebateLog {
  text: string;
  timestamp: string;
  aiScore?: {
    overall: number;
  };
}

interface PortfolioData {
  overallSummary: string;
  growthTimeline: string[];
  keywordCloud: string[];
  badges: string[];
  level: "초급" | "중급" | "상급" | "마스터";
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

    // Combine all logs
    const allLogs = logs
      .map((log: DebateLog, index: number) => `${index + 1}. ${log.text}`)
      .join("\n");

    // Calculate average score
    const scores = logs
      .map((log: DebateLog) => log.aiScore?.overall ?? 0)
      .filter((score: number) => score > 0);
    const avgScore = scores.length > 0
      ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
      : 0;

    const prompt = `
학생의 전체 학기 토론 로그를 기반으로 성장 포트폴리오 요약을 생성해주세요.

학생 토론 로그 (총 ${logs.length}개 발언):
${allLogs}

평균 점수: ${avgScore.toFixed(1)}점

출력 형식 (반드시 JSON만 출력):
{
  "overallSummary": "학생의 전체 학기 성장을 요약한 3-4문장",
  "growthTimeline": ["1주차 성장 포인트", "2주차 성장 포인트", "3주차 성장 포인트"],
  "keywordCloud": ["자주 사용한 키워드 1", "자주 사용한 키워드 2", "자주 사용한 키워드 3", "자주 사용한 키워드 4", "자주 사용한 키워드 5"],
  "badges": ["획득한 배지 1", "획득한 배지 2", "획득한 배지 3"],
  "level": "초급" | "중급" | "상급" | "마스터"
}

레벨 판정 기준:
- 초급: 평균 60점 미만 또는 발언 10개 미만
- 중급: 평균 60-75점
- 상급: 평균 75-90점
- 마스터: 평균 90점 이상

주의사항:
- growthTimeline은 3개 항목
- keywordCloud는 5개 키워드
- badges는 3개 배지
- 모든 내용은 초등학생이 이해하기 쉬운 언어로 작성
- 격려와 긍정적인 톤 유지
`;

    const result = await callUpstageJSON<PortfolioData>(prompt);

    // Validation
    if (
      typeof result.overallSummary !== "string" ||
      !Array.isArray(result.growthTimeline) ||
      !Array.isArray(result.keywordCloud) ||
      !Array.isArray(result.badges) ||
      !["초급", "중급", "상급", "마스터"].includes(result.level)
    ) {
      throw new Error("Invalid response format from AI");
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API /portfolio/generate Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate portfolio" },
      { status: 500 }
    );
  }
}

