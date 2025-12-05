import { NextRequest, NextResponse } from "next/server";
import { sendDebateMessage, parseAIResponse } from "../../../services/ai/upstageClient";
import { getSystemPrompt } from "../../../services/configService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Get system prompt for speech review
    const systemPrompt = getSystemPrompt({
      promptType: "speech_review_helper"
    });

    // Call Upstage API
    const aiResponse = await sendDebateMessage({
      systemPrompt,
      userMessage: text,
      history: [] // No history needed for single sentence check
    });

    // Parse the response
    // The prompt asks for JSON only, so we try to parse it.
    let result;
    try {
      // Clean up markdown code blocks if present
      const cleanText = aiResponse.aiMessageText.replace(/```json\n?|```/g, "").trim();
      result = JSON.parse(cleanText);
    } catch (e) {
      console.error("[API /safety-check] JSON parse failed:", e);
      console.error("Raw response:", aiResponse.aiMessageText);
      
      // Fallback: If parsing fails, we default to allowing it but logging the error,
      // OR we could fail-closed. Given the requirement "possible to save student's speech",
      // we might want to be lenient or just return a generic error.
      // However, for safety, let's return a default "allowed: true" but with a warning log,
      // UNLESS it's clearly garbage.
      // Actually, let's return a safe default structure.
      result = {
        allowed: true,
        reason: "System error (JSON parse failed), allowing by default to prevent blocking valid speech.",
        feedbackForStudent: "",
        flaggedWords: []
      };
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("[API /safety-check] Request error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
