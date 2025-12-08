/**
 * API Route: Battle Matching
 * 
 * 배틀 큐에서 두 명의 학생을 매칭합니다.
 */
import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { callUpstageJSON } from "@/lib/upstage";

interface BattleQueueEntry {
  id: string;
  studentId: string;
  nickname: string;
  classCode: string;
  readyAt: any;
}

interface BattleTopic {
  topic: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { classCode } = body;

    if (!classCode || typeof classCode !== "string") {
      return NextResponse.json(
        { error: "classCode is required and must be a string" },
        { status: 400 }
      );
    }

    // Get queue for this class
    const queueRef = collection(db, "battleQueue");
    const q = query(queueRef, where("classCode", "==", classCode));
    const snapshot = await getDocs(q);

    const queue: BattleQueueEntry[] = [];
    snapshot.forEach((doc) => {
      queue.push({ id: doc.id, ...doc.data() } as BattleQueueEntry);
    });

    // Sort by readyAt (oldest first)
    queue.sort((a, b) => {
      const aTime = a.readyAt?.toMillis?.() || 0;
      const bTime = b.readyAt?.toMillis?.() || 0;
      return aTime - bTime;
    });

    // Match pairs
    if (queue.length < 2) {
      return NextResponse.json({
        matched: false,
        message: "대기 중인 학생이 2명 미만입니다.",
        queueCount: queue.length,
      });
    }

    const pair1 = queue[0];
    const pair2 = queue[1];

    // Generate topic using Upstage
    const topicPrompt = `
초등학생이 토론할 수 있는 난이도 적당한 토론 주제를 1개 생성해주세요.
주제는 찬반이 명확하게 나뉠 수 있어야 하고, 초등학생 수준에 맞아야 합니다.

반드시 JSON 형식만 출력:
{
  "topic": "토론 주제 내용"
}

예시: { "topic": "학교에서 스마트폰 사용을 허용해야 한다" }
`;

    const topicResult = await callUpstageJSON<BattleTopic>(topicPrompt);

    // Create battle
    const battleId = `battle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const battleRef = doc(db, "battles", battleId);

    await setDoc(battleRef, {
      classCode: classCode,
      participants: [
        { studentId: pair1.studentId, nickname: pair1.nickname },
        { studentId: pair2.studentId, nickname: pair2.nickname },
      ],
      topic: topicResult.topic,
      round: 1,
      logs: [],
      winner: null,
      createdAt: serverTimestamp(),
      status: "active",
    });

    // Remove from queue
    await deleteDoc(doc(db, "battleQueue", pair1.id));
    await deleteDoc(doc(db, "battleQueue", pair2.id));

    return NextResponse.json({
      matched: true,
      battleId: battleId,
      participants: [
        { studentId: pair1.studentId, nickname: pair1.nickname },
        { studentId: pair2.studentId, nickname: pair2.nickname },
      ],
      topic: topicResult.topic,
    });
  } catch (error: any) {
    console.error("[API /battle/match Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to match battle" },
      { status: 500 }
    );
  }
}

