/**
 * API Route: Start Battle
 * 
 * 배틀을 시작하고 초기 설정을 완료합니다.
 */
import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { battleId } = body;

    if (!battleId || typeof battleId !== "string") {
      return NextResponse.json(
        { error: "battleId is required and must be a string" },
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

    if (battle.status !== "active") {
      return NextResponse.json(
        { error: "Battle is not in active status" },
        { status: 400 }
      );
    }

    // Update battle status
    await updateDoc(battleRef, {
      status: "started",
      startedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      battleId: battleId,
      topic: battle.topic,
      participants: battle.participants,
    });
  } catch (error: any) {
    console.error("[API /battle/start Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to start battle" },
      { status: 500 }
    );
  }
}

