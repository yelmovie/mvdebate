
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    // Use environment variable or fallback to default for this project context
    // In a real production app, strictly use ENV. 
    // Here we allow 5050 as fallback if ENV is not set, to ensure it works immediately for the user.
    const CORRECT_PASSWORD = process.env.TEACHER_PASSWORD || "5050";

    if (password === CORRECT_PASSWORD) {
      // Set a cookie for simple session management
      cookies().set("teacher_auth", "true", { 
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 // 1 day
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, message: "비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
