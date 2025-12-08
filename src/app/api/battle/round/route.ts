/**
 * API Route: Battle Round
 * 
 * 배틀의 한 라운드를 처리합니다.
 */
import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { callUpstageJSON } from "@/lib/upstage";

interface BattleLog {
  studentId: string;
  nickname: string;
  text: string;
  timestamp: any;
  round: number;
}

interface BattleResponse {
  response: string;
  score?: {
    logic: number;
    clarity: number;
    evidence: number;
    empathy: number;
    engagement: number;
    overall: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { battleId, studentId, text } = body;

    if (!battleId || !studentId || !text) {
      return NextResponse.json(
        { error: "battleId, studentId, and text are required" },
        { status: 400 }
      );
    }

    const battleRef = doc(db, "battles", battleId);
    const battleSnap = await getDoc(battleRef);

    if (!battleSnap.exists()) {
      return NextResponse.json(
        { error: "Battle not found" },
        { status: 404 }
      );
    }

    const battle = battleSnap.data();
    const participant = battle.participants.find((p: any) => p.studentId === studentId);

    if (!participant) {
      return NextResponse.json(
        { error: "Student is not a participant in this battle" },
        { status: 403 }
      );
    }

    // Evaluate the turn
    const evalResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/eval/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const score = evalResponse.ok ? await evalResponse.json() : null;

    // Generate AI opponent response
    const opponent = battle.participants.find((p: any) => p.studentId !== studentId);
    const previousLogs = battle.logs || [];
    const lastLogs = previousLogs.slice(-4); // Last 4 exchanges

    const contextPrompt = `
토론 주제: ${battle.topic}

${opponent.nickname}의 입장: ${opponent.nickname}는 이 주제에 대해 반대 입장입니다.

최근 대화:
${lastLogs.map((log: BattleLog) => `${log.nickname}: ${log.text}`).join("\n")}

${participant.nickname}의 발언: ${text}

이제 ${opponent.nickname}가 ${participant.nickname}의 발언에 대해 반박하거나 자신의 입장을 강화하는 발언을 해야 합니다.
초등학생 수준의 언어로, 논리적이고 예의 바른 톤으로 응답해주세요.

반드시 JSON 형식만 출력:
{
  "response": "AI의 응답 내용"
}
`;

    const aiResponse = await callUpstageJSON<BattleResponse>(contextPrompt);

    // Add logs
    const newLog: BattleLog = {
      studentId: studentId,
      nickname: participant.nickname,
      text: text,
      timestamp: serverTimestamp(),
      round: battle.round || 1,
    };

    const aiLog: BattleLog = {
      studentId: "ai",
      nickname: opponent.nickname + " (AI)",
      text: aiResponse.response,
      timestamp: serverTimestamp(),
      round: battle.round || 1,
    };

    await updateDoc(battleRef, {
      logs: arrayUnion(newLog, aiLog),
      round: (battle.round || 1) + 1,
    });

    return NextResponse.json({
      success: true,
      studentLog: { ...newLog, score },
      aiLog: aiLog,
      nextRound: (battle.round || 1) + 1,
    });
  } catch (error: any) {
    console.error("[API /battle/round Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to process battle round" },
      { status: 500 }
    );
  }
}

