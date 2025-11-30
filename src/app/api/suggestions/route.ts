import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// 제안 목록 조회 (GET)
export async function GET() {
  // 파일 시스템을 사용할 수 없으므로 빈 목록 반환
  // 또는 "이메일로 전송됩니다" 같은 메시지를 포함할 수 있음
  return NextResponse.json({ 
    suggestions: [],
    message: "Suggestions are now sent directly to the developer via email." 
  });
}

// 제안 등록 (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nickname, content } = body;

    if (!nickname || !content) {
      return NextResponse.json({ error: "Nickname and content are required" }, { status: 400 });
    }

    // 환경 변수 확인
    const mailUser = process.env.MAIL_USER;
    const mailPass = process.env.MAIL_PASS;

    if (!mailUser || !mailPass) {
      console.error("[API /suggestions] Mail credentials not configured");
      return NextResponse.json(
        { error: "Server configuration error (Email)" },
        { status: 500 }
      );
    }

    // 이메일 발송
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: mailUser,
        pass: mailPass,
      },
    });

    const emailSubject = `[MovieSSam Debate Lab] 새로운 제안 (${nickname})`;
    const emailBody = `
[새로운 제안이 도착했습니다]

작성자: ${nickname}
작성일: ${new Date().toLocaleString("ko-KR")}

내용:
${content}

---
MovieSSam Debate Lab
    `;

    await transporter.sendMail({
      from: mailUser,
      to: mailUser, // 개발자 본인에게 전송
      subject: emailSubject,
      text: emailBody,
    });

    return NextResponse.json({ 
      success: true, 
      message: "제안이 개발자에게 이메일로 전송되었습니다." 
    });

  } catch (error: any) {
    console.error("[API /suggestions] POST error:", error);
    return NextResponse.json({ error: "Failed to send suggestion" }, { status: 500 });
  }
}

// 제안 삭제 (DELETE) - 더 이상 사용하지 않음
export async function DELETE(request: NextRequest) {
  return NextResponse.json({ error: "Not supported" }, { status: 405 });
}
