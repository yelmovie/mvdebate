/**
 * API Route: Debate Session Creation
 * 
 * Creates a new debate session for a student.
 */
import { NextRequest, NextResponse } from "next/server";
import type { DebateSession } from "../../../../types/domain";
import { fileStore } from "../../../../lib/fileStore";
import { checkDailySessionLimit, incrementDailySessionCount } from "../../../../services/aiUsageService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, topicId, stance, difficulty, classCode } = body;

    // Validation
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "userId is required and must be a string" },
        { status: 400 }
      );
    }

    if (!topicId || typeof topicId !== "string") {
      return NextResponse.json(
        { error: "topicId is required and must be a string" },
        { status: 400 }
      );
    }

    if (!stance || (stance !== "pro" && stance !== "con")) {
      return NextResponse.json(
        { error: "stance is required and must be 'pro' or 'con'" },
        { status: 400 }
      );
    }
    
    // Difficulty Validation
    let safeDifficulty = difficulty;
    if (difficulty === "easy") safeDifficulty = "low";
    if (difficulty === "hard") safeDifficulty = "high";
    
    if (safeDifficulty !== "low" && safeDifficulty !== "mid" && safeDifficulty !== "high") {
         return NextResponse.json(
          { error: "difficulty is required and must be 'low', 'mid', or 'high'" },
          { status: 400 }
        );
    }

    // --- Cost Safety Check ---
    if (classCode) {
        const allowed = await checkDailySessionLimit(classCode);
        if (!allowed) {
            return NextResponse.json(
                { error: "오늘 우리 반의 AI 토론 횟수가 모두 소진되었어요. 내일 다시 만나요! (일일 제한 초과)" },
                { status: 429 } 
            );
        }
    }
    
    // Create session
    const session: DebateSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      nickname: body.nickname,
      topicId,
      stance,
      aiStance: stance === "pro" ? "con" : "pro",
      difficulty: safeDifficulty,
      createdAt: new Date().toISOString()
    };
    
    // Update Teacher Dashboard (File Store - Legacy/Fallback)
    // Ideally this should also rely on classCode updates via Firestore in future, 
    // but fileStore is local/memory based for now? No, fileStore writes to file system.
    // For cloud deployment (Vercel), file system is ephemeral. 
    // *** CRITICAL ARCHITECTURE NOTE ***: fileStore uses `fs`? 
    // If so, it BROKES on Vercel. 
    // The user didn't explicitly say "Fix fileStore architecture", but "Refactor for Cost Safety / Secure Firebase".
    // I should ideally write to Firestore "debate_logs" instead of fileStore. 
    // BUT, doing that now is a HUGE scope creep for "Review".
    // I will stick to adding Cost Safety Checks. 
    // The dashboard reads from Firestore `dashboard_summaries`, so SOMETHING must update Firestore.
    // Currently `dashboardService` reads Firestore. `fileStore` writes JSON files.
    // This implies `dashboard_summaries` are never updated by `fileStore`.
    // The current architecture seems to write JSONs locally and Read Firestore for dashboard?
    // They are disconnected! 
    // Wait, the "previous session" refactor mentions:
    // "Implement Dashboard Summary Updates: Create logic... to periodically update"
    // So writing to JSON is fine for MVP "Execution" but data won't show in Dashboard.
    // I can't fix this entire data pipeline in this step. 
    // I will Focus on Limits.
    
    if (body.nickname) {
       const match = body.nickname.match(/^(\d+)번/);
       if (match) {
           const studentNum = parseInt(match[1]);
           if (!isNaN(studentNum) && studentNum >= 1 && studentNum <= 30) {
               fileStore.updateStatus(studentNum, {
                   isConnected: true,
                   name: body.nickname,
                   currentSessionId: session.id,
                   topic: topicId, 
                   stance: stance,
                   turnCount: 0
               });
               fileStore.saveSession(session);
           }
       }
    }
    
    // --- Increment Usage ---
    if (classCode) {
        // Fire and forget increment to avoid latency
        incrementDailySessionCount(classCode).catch(e => console.error("Failed to inc usage", e));
    }

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
