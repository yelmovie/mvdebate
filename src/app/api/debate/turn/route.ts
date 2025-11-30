/**
 * API Route: Debate Turn Handler
 * 
 * Handles student turns and returns AI responses via Upstage API.
 * Server-side only - handles Upstage API calls securely.
 */

import { NextRequest, NextResponse } from "next/server";
import { sendDebateMessage, parseAIResponse, UpstageMessage } from "../../../../services/ai/upstageClient";
import { getSystemPrompt } from "../../../../services/configService";
import type { DebateTurn, DebateLabel } from "../../../../types/domain";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, text, topicTitle, stance, difficulty, turnCount, turnIndex, maxTurns, phase, history, personaId } = body;

    if (!sessionId || !text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "sessionId and text are required" },
        { status: 400 }
      );
    }

    // Create student turn
    const studentTurn: DebateTurn = {
      id: `turn-${Date.now()}-student`,
      sessionId,
      sender: "student",
      text: text.trim(),
      label: "other",
      timestamp: new Date().toISOString()
    };

    try {
      // Get system prompt from config with topic and stance substitution
      const systemPrompt = getSystemPrompt({
        topic: topicTitle,
        stance: stance as "pro" | "con" | undefined,
        turnCount: typeof turnCount === "number" ? turnCount : undefined,
        turnIndex: typeof turnIndex === "number" ? turnIndex : undefined,
        maxTurns: typeof maxTurns === "number" ? maxTurns : undefined,
        phase: phase as "normal" | "closing-warning" | "closing-final" | undefined,
        difficulty: difficulty as "easy" | "hard" | undefined,
        personaId: personaId as string | undefined
      });

      // Construct user message with context (if provided)
      let userMessage = text.trim();
      if (topicTitle && stance) {
        const stanceText = stance === "pro" ? "찬성" : "반대";
        const turnCountText = typeof turnCount === "number" ? `\n지금까지 턴 수: ${turnCount}` : "";
        userMessage = `(메타정보) 현재 토론 주제: ${topicTitle}, 나의 입장: ${stanceText}${turnCountText}\n\n${userMessage}`;
      }

      // Call Upstage API
      const aiResponse = await sendDebateMessage({
        systemPrompt,
        userMessage,
        history: history as UpstageMessage[] || []
      });

      // Parse AI response (handles JSON or plain text)
      const parsed = parseAIResponse(aiResponse.aiMessageText);

      // Create AI turn
      const aiTurn: DebateTurn = {
        id: `turn-${Date.now()}-ai`,
        sessionId,
        sender: "ai",
        text: parsed.aiMessage,
        label: (parsed.label as DebateLabel) || "other",
        timestamp: new Date().toISOString()
      };

      return NextResponse.json({
        turn: studentTurn,
        aiTurn
      });
    } catch (error: any) {
      console.error("[API /debate/turn] AI call failed:", error);

      // Return student turn with friendly error message
      const aiTurn: DebateTurn = {
        id: `turn-${Date.now()}-ai-error`,
        sessionId,
        sender: "ai",
        text: `죄송해요. 지금 AI가 응답하지 못하고 있어요. (${error.message || "오류 발생"}) 잠시 후 다시 시도해 주세요.`,
        label: "other",
        timestamp: new Date().toISOString()
      };

      return NextResponse.json({
        turn: studentTurn,
        aiTurn
      });
    }
  } catch (error: any) {
    console.error("[API /debate/turn] Request error:", error);
    
    return NextResponse.json(
      {
        error: error.message || "Internal server error"
      },
      { status: 500 }
    );
  }
}
