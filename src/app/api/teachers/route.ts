/**
 * API Route: 관리용 선생님 목록 (교사 관리 페이지용)
 * 
 * 교사 관리 페이지에서는 전체 정보(이메일 포함)를 반환합니다.
 */

/**
 * API Route: 관리용 선생님 목록 (교사 관리 페이지용)
 * 
 * 교사 관리 페이지에서는 전체 정보(이메일 포함)를 반환합니다.
 * 
 * 주의: 서버 사이드에서 localStorage를 직접 사용할 수 없으므로,
 * 실제 프로덕션에서는 DB를 사용해야 합니다.
 * 현재는 클라이언트 컴포넌트에서 직접 teacherStorage를 사용하는 것을 권장합니다.
 */

import { NextRequest, NextResponse } from "next/server";
import type { Teacher } from "../../../types/domain";

// 서버 사이드에서는 localStorage를 사용할 수 없으므로 빈 배열 반환
// 실제 프로덕션에서는 DB에서 조회해야 함
function loadTeachersServer(): Teacher[] {
  // TODO: 실제 프로덕션에서는 DB에서 로드
  return [];
}

function addTeacherServer(teacher: Teacher): void {
  // TODO: 실제 프로덕션에서는 DB에 저장
  // 현재는 클라이언트에서 직접 teacherStorage 사용 권장
}

function removeTeacherServer(teacherId: string): void {
  // TODO: 실제 프로덕션에서는 DB에서 삭제
  // 현재는 클라이언트에서 직접 teacherStorage 사용 권장
}

export async function GET() {
  try {
    const teachers = loadTeachersServer();
    return NextResponse.json({ teachers });
  } catch (error: any) {
    console.error("[API /teachers] GET Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load teachers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { displayName, email } = body;

    if (!displayName || !email) {
      return NextResponse.json(
        { error: "displayName and email are required" },
        { status: 400 }
      );
    }

    const newTeacher: Teacher = {
      id: `teacher-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      displayName: displayName.trim(),
      email: email.trim()
    };

    addTeacherServer(newTeacher);

    return NextResponse.json({ teacher: newTeacher });
  } catch (error: any) {
    console.error("[API /teachers] POST Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add teacher" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("id");

    if (!teacherId) {
      return NextResponse.json(
        { error: "teacherId is required" },
        { status: 400 }
      );
    }

    removeTeacherServer(teacherId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API /teachers] DELETE Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove teacher" },
      { status: 500 }
    );
  }
}

