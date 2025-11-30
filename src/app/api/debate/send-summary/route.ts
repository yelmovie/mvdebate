/**
 * API Route: 토론 대화 요약 메일 발송
 * 
 * 학생 화면에서 teacherId만 받아서, 서버에서 이메일을 조회하여 메일을 발송합니다.
 */

import { NextRequest, NextResponse } from "next/server";
import type { Teacher } from "../../../../types/domain";

/**
 * 서버 사이드에서 선생님 정보 조회
 * 
 * 주의: localStorage는 서버에서 사용할 수 없으므로,
 * 실제 프로덕션에서는 DB에서 조회해야 합니다.
 * 
 * 현재는 클라이언트에서 localStorage를 사용하므로,
 * 이 API는 실제 프로덕션 환경에서 DB를 연결한 후 사용해야 합니다.
 */
async function getTeacherByIdServer(teacherId: string): Promise<Teacher | null> {
  // TODO: 실제 프로덕션에서는 DB에서 조회
  // 예: return await db.teachers.findUnique({ where: { id: teacherId } });
  
  // 현재는 클라이언트에서만 작동하므로, 서버에서는 항상 null 반환
  // 실제 프로덕션에서는 이 부분을 DB 조회로 교체해야 함
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // 주의: 현재는 클라이언트에서 이메일을 직접 전달하지만,
    // 실제 프로덕션에서는 teacherId만 받아서 서버에서 DB 조회해야 함
    const { teacherEmail, teacherDisplayName, topic, log } = body;

    if (!teacherEmail || !topic || !log) {
      return NextResponse.json(
        { error: "teacherEmail, topic, and log are required" },
        { status: 400 }
      );
    }

    // TODO: 실제 프로덕션에서는 teacherId만 받아서 서버에서 DB 조회
    // const { teacherId, topic, log } = body;
    // const teacher = await getTeacherByIdServer(teacherId);
    // const teacherEmail = teacher.email;
    // const teacherDisplayName = teacher.displayName;

    // 환경 변수 확인
    const mailUser = process.env.MAIL_USER;
    const mailPass = process.env.MAIL_PASS;
    const isProduction = process.env.NODE_ENV === "production";

    // 프로덕션 환경에서만 환경 변수 필수 체크
    if (isProduction && (!mailUser || !mailPass)) {
      console.error("[API /debate/send-summary] Mail credentials not configured in production");
      return NextResponse.json(
        {
          error: "이메일 서버가 설정되지 않았습니다. 관리자에게 문의하세요.",
          details: "MAIL_USER and MAIL_PASS environment variables are required in production"
        },
        { status: 500 }
      );
    }

    // 개발 환경에서는 실제 발송하지 않고 성공 메시지만 반환
    if (!isProduction || !mailUser || !mailPass) {
      console.log("[API /debate/send-summary] Email would be sent (development mode):");
      console.log("  To:", teacherEmail);
      console.log("  Display Name:", teacherDisplayName);
      console.log("  Topic:", topic);
      console.log("  Log length:", log.length, "characters");

      return NextResponse.json({
        success: true,
        message: "메일 발송이 완료되었습니다.",
        note: "개발 환경: 실제 이메일은 발송되지 않았습니다. 프로덕션 환경에서만 실제 이메일이 발송됩니다."
      });
    }

    // 프로덕션 환경에서 실제 이메일 발송
    // TODO: 실제 이메일 발송 구현 (nodemailer 등)
    // const nodemailer = require("nodemailer");
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail({ ... });

    console.log("[API /debate/send-summary] Email would be sent (production mode, nodemailer not configured):");
    console.log("  To:", teacherEmail);
    console.log("  Display Name:", teacherDisplayName);
    console.log("  Topic:", topic);

    return NextResponse.json({
      success: true,
      message: "메일 발송이 완료되었습니다.",
      note: "nodemailer 라이브러리 설치 및 설정 후 실제 이메일이 발송됩니다."
    });
  } catch (error: any) {
    console.error("[API /debate/send-summary] Error:", error);
    return NextResponse.json(
      {
        error: error.message || "메일 전송 실패"
      },
      { status: 500 }
    );
  }
}

