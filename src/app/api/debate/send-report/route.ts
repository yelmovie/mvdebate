/**
 * API Route: Debate Report 이메일 발송
 *
 * AI 평가 결과와 토론 로그를 받아 교사 이메일로 전송합니다.
 */

import { NextRequest, NextResponse } from "next/server";
import type { AiEvaluation, Teacher } from "../../../../types/domain";

/**
 * 서버 사이드에서 선생님 정보 조회
 * 
 * 주의: localStorage는 서버에서 사용할 수 없으므로,
 * 실제 프로덕션에서는 DB에서 조회해야 합니다.
 */
async function getTeacherByIdServer(teacherId: string): Promise<Teacher | null> {
  // TODO: 실제 프로덕션에서는 DB에서 조회
  // 예: return await db.teachers.findUnique({ where: { id: teacherId } });
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      teacherId,
      teacherEmail,      // 임시: 클라이언트에서 전달 (프로덕션에서는 제거)
      teacherDisplayName, // 임시: 클라이언트에서 전달 (프로덕션에서는 제거)
      studentName,
      topic,
      stance,
      evaluation,
      log
    } = body;

    // 필수 필드 검증
    if (!studentName || !topic || !evaluation || !log) {
      return NextResponse.json(
        { error: "studentName, topic, evaluation, and log are required" },
        { status: 400 }
      );
    }

    // teacherId 또는 teacherEmail 중 하나는 필수
    let finalTeacherEmail: string;
    let finalTeacherDisplayName: string;

    if (teacherId) {
      // 서버에서 이메일 조회 (프로덕션 방식)
      const teacher = await getTeacherByIdServer(teacherId);
      if (!teacher) {
        return NextResponse.json(
          { error: "선생님을 찾을 수 없습니다." },
          { status: 404 }
        );
      }
      finalTeacherEmail = teacher.email;
      finalTeacherDisplayName = teacher.displayName;
    } else if (teacherEmail) {
      // 임시: 클라이언트에서 전달 (개발 환경)
      finalTeacherEmail = teacherEmail;
      finalTeacherDisplayName = teacherDisplayName || "선생님";
    } else {
      return NextResponse.json(
        { error: "teacherId or teacherEmail is required" },
        { status: 400 }
      );
    }

    // 평가 데이터 검증
    if (!evaluation.clarity || !evaluation.evidence || !evaluation.relevance || !evaluation.comment) {
      return NextResponse.json(
        { error: "Invalid evaluation format" },
        { status: 400 }
      );
    }

    // 이메일 본문 생성
    const emailBody = generateEmailText({
      studentName,
      topic,
      stance,
      evaluation: evaluation as AiEvaluation,
      log
    });

    // 환경 변수 확인
    const mailUser = process.env.MAIL_USER;
    const mailPass = process.env.MAIL_PASS;
    const isProduction = process.env.NODE_ENV === "production";

    // 이메일 설정 확인
    if (!mailUser || !mailPass) {
      if (isProduction) {
        console.error("[API /debate/send-report] Mail credentials missing in production");
        return NextResponse.json(
          {
            error: "이메일 서버가 설정되지 않았습니다. 관리자에게 문의하세요.",
            details: "MAIL_USER and MAIL_PASS environment variables are required"
          },
          { status: 500 }
        );
      } else {
        // 개발 환경이고 설정이 없으면 가짜 성공
        console.log("[API /debate/send-report] Dev mode: Email skipped (no credentials)");
        return NextResponse.json({
          success: true,
          message: "이메일 발송이 완료되었습니다. (개발 모드: 발송 생략)",
        });
      }
    }

    // 이메일 발송 (nodemailer 사용)
    try {
      const nodemailer = require("nodemailer");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: mailUser,
          pass: mailPass,
        },
      });
      
      await transporter.sendMail({
        from: mailUser,
        to: finalTeacherEmail,
        subject: `[AI 모의 토론 평가] ${studentName} - ${topic}`,
        text: emailBody,
      });

      console.log(`[API /debate/send-report] Email sent successfully to ${finalTeacherEmail}`);

      return NextResponse.json({
        success: true,
        message: "이메일 발송이 완료되었습니다.",
      });
    } catch (emailError: any) {
      console.error("[API /debate/send-report] Email send failed:", emailError);
      return NextResponse.json(
        {
          error: "이메일 발송 중 오류가 발생했습니다.",
          details: emailError.message || "Unknown error"
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[API /debate/send-report] Request error:", error);
    return NextResponse.json(
      {
        error: error.message || "Internal server error"
      },
      { status: 500 }
    );
  }
}

/**
 * 이메일 본문 생성
 */
function generateEmailText(data: {
  studentName: string;
  topic: string;
  stance: string;
  evaluation: AiEvaluation;
  log: string;
}): string {
  const { studentName, topic, stance, evaluation, log } = data;

  const lines = [
    `${studentName} 학생의 AI 모의 토론 평가 결과`,
    "",
    `주제: ${topic}`,
    `입장: ${stance}`,
    `생성일: ${new Date().toLocaleString("ko-KR")}`,
    "",
    "=== AI 토론 평가 ===",
    "",
    `1. 주장 명확성: ${evaluation.clarity}/5`,
    `2. 근거 사용: ${evaluation.evidence}/5`,
    `3. 주제 충실도: ${evaluation.relevance}/5`,
    "",
    "총평:",
    evaluation.comment,
    "",
    "=== 대화 로그 ===",
    log,
    "",
    "---",
    "MovieSSam Debate Lab"
  ];

  return lines.join("\n");
}

/**
 * 이메일 발송 함수 (nodemailer 사용 - 라이브러리 설치 후 활성화)
 */
// async function sendEmail({
//   to,
//   subject,
//   text,
//   pdfBuffer
// }: {
//   to: string;
//   subject: string;
//   text: string;
//   pdfBuffer: Buffer;
// }): Promise<void> {
//   const nodemailer = require("nodemailer");
//
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.MAIL_USER,
//       pass: process.env.MAIL_PASS
//     }
//   });
//
//   await transporter.sendMail({
//     from: process.env.MAIL_USER,
//     to,
//     subject,
//     text,
//     attachments: [
//       {
//         filename: "debate-report.pdf",
//         content: pdfBuffer
//       }
//     ]
//   });
// }

