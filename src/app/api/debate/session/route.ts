/**
 * API Route: Debate Session Creation
 * 
 * Creates a new debate session for a student.
 */
import { NextRequest, NextResponse } from "next/server";
import type { DebateSession } from "../../../../types/domain";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, topicId, stance, difficulty } = body;

    // Validation
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "userId is required and must be a string" },
        { status: 400 }
      );
    }

    if (!topicId || typeof topicId !== "number") {
      return NextResponse.json(
        { error: "topicId is required and must be a number" },
        { status: 400 }
      );
    }

    if (!stance || (stance !== "pro" && stance !== "con")) {
      return NextResponse.json(
        { error: "stance is required and must be 'pro' or 'con'" },
        { status: 400 }
      );
    }
    
    if (!difficulty || (difficulty !== "easy" && difficulty !== "hard")) {
      return NextResponse.json(
        { error: "difficulty is required and must be 'easy' or 'hard'" },
        { status: 400 }
      );
    }

    // Create session
    const session: DebateSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      topicId,
      stance,
      difficulty,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json(session);
  } catch (error: any) {
    console.error("[API /debate/session] Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Internal server error"
      },
      { status: 500 }
    );
  }
}
