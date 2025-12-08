
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiter (per instance)
// In a serverless environment like Vercel, this is not perfect but effectively limits "single instance abuse".
// Ideally use Redis (KV), but for this MVP, memory is fine to stop basic loops.
const rateLimit = new Map<string, { count: number; lastReset: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const LIMIT = 20; // 20 requests per minute per IP

export function middleware(request: NextRequest) {
  // Only apply to AI turn generation
  if (request.nextUrl.pathname.startsWith("/api/debate/turn")) {
    const ip = request.ip || "unknown";
    const now = Date.now();

    const record = rateLimit.get(ip) || { count: 0, lastReset: now };

    if (now - record.lastReset > WINDOW_MS) {
      record.count = 0;
      record.lastReset = now;
    }

    record.count++;
    rateLimit.set(ip, record);

    if (record.count > LIMIT) {
      return new NextResponse(
        JSON.stringify({ 
          error: "Too Many Requests", 
          message: "잠시 후 다시 시도해 주세요. (요청 횟수 초과)" 
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/debate/turn/:path*",
};
