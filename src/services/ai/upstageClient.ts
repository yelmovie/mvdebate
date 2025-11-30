/**
 * Upstage API Client for Debate AI
 * 
 * Handles all communication with Upstage API for debate coaching.
 * Single Responsibility: API communication only.
 */
import { cleanMarkdownCodeBlock, extractJson } from "../../utils/textUtils";
export interface UpstageMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface UpstageRequest {
  model: string;
  messages: UpstageMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface UpstageResponse {
  choices?: Array<{
    message?: {
      role?: string;
      content?: string;
    };
  }>;
  error?: {
    message?: string;
    type?: string;
  };
}

export interface DebateAIResponse {
  aiMessageText: string;
  rawResponse?: UpstageResponse;
}

/**
 * Sends a debate message to Upstage API
 * 
 * @param systemPrompt - System prompt for the AI coach
 * @param userMessage - User's debate message
 * @returns Promise with AI response text
 * @throws Error if API key is missing or request fails
 */
export async function sendDebateMessage({
  systemPrompt,
  userMessage,
  history = []
}: {
  systemPrompt: string;
  userMessage: string;
  history?: UpstageMessage[];
}): Promise<DebateAIResponse> {
  // Validate API key
  const apiKey = process.env.UPSTAGE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "UPSTAGE_API_KEY is not set. Please add it to .env.local file."
    );
  }

  // Prepare request
  const requestBody: UpstageRequest = {
    model: "solar-pro",
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      ...history,
      {
        role: "user",
        content: userMessage
      }
    ],
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 500,
    stream: false
  };

  try {
    // Make API call
    const response = await fetch("https://api.upstage.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      // 보안: API 키나 민감 정보가 포함될 수 있는 전체 응답은 로그하지 않음
      console.error(`[Upstage API] HTTP ${response.status}: Request failed`);
      throw new Error(
        `Upstage API request failed: ${response.status} ${response.statusText}`
      );
    }

    // Parse response
    const data: UpstageResponse = await response.json();

    // Extract AI message
    const aiText =
      data.choices?.[0]?.message?.content?.trim() ?? "";

    if (!aiText) {
      console.error("[Upstage API] Empty response:", data);
      throw new Error("Upstage API returned empty response");
    }

    return {
      aiMessageText: aiText,
      rawResponse: data
    };
  } catch (error: any) {
    // Network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.error("[Upstage API] Network error:", error.message);
      throw new Error("Network error: Could not connect to Upstage API");
    }

    // Re-throw known errors
    if (error instanceof Error) {
      throw error;
    }

    // Unknown errors
    console.error("[Upstage API] Unknown error:", error);
    throw new Error("An unexpected error occurred while calling Upstage API");
  }
}

/**
 * Safely parses AI response - extracts structured data from JSON
 * New format: { aiMessage, labels, nextStep, keepStance, offTopicHandled }
 */
export function parseAIResponse(text: string): {
  aiMessage: string;
  label?: string;
  labels?: string[];
  nextStep?: string;
  keepStance?: string;
  offTopicHandled?: boolean;
  tips?: string;
} {
  // 1. Try to extract JSON using utility
  const parsed = extractJson(text);

  if (parsed && typeof parsed === "object") {
    const message = parsed.aiMessage || parsed.message || parsed.content;
    
    // If we found a message, we assume it's a valid response object
    if (message) {
      let aiMessage = typeof message === "string" ? message : JSON.stringify(message);
      
      // Safety: Remove leaked labels from text (e.g. "**labels**: ...")
      aiMessage = aiMessage.replace(/\*\*labels\*\*:\s*\[.*?\]/gi, "").trim();
      aiMessage = aiMessage.replace(/"labels":\s*\[.*?\]/gi, "").trim();

      let labels: string[] | undefined;
      if (Array.isArray(parsed.labels)) {
        labels = parsed.labels;
      } else if (parsed.label) {
        labels = [parsed.label];
      }

      return {
        aiMessage,
        label: labels?.[0],
        labels,
        nextStep: parsed.nextStep || "reason",
        keepStance: parsed.keepStance,
        offTopicHandled: parsed.offTopicHandled,
        tips: parsed.tips
      };
    }
  }

  // 2. Fallback: Manual regex for partial JSON or just plain text
  const cleaned = cleanMarkdownCodeBlock(text);

  // Check for "aiMessage" field even if JSON is invalid
  const aiMessageMatch = cleaned.match(/"aiMessage"\s*:\s*"([^"]+)"/);
  if (aiMessageMatch) {
    return {
      aiMessage: aiMessageMatch[1],
      label: "other",
      nextStep: "reason",
      offTopicHandled: false
    };
  }

  // 3. Final Fallback: Treat entire text as message
  return {
    aiMessage: cleaned,
    label: "other",
    nextStep: "reason",
    offTopicHandled: false
  };
}





