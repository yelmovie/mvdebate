/**
 * API Route: 공개용 선생님 목록 (학생 화면용)
 * 
 * 학생 화면에서는 이메일을 절대 보내지 않고, id와 displayName만 반환합니다.
 */

import { NextResponse } from "next/server";
import type { PublicTeacher } from "../../../types/domain";

// 주의: 이 API는 서버 사이드에서 실행되므로 localStorage를 직접 사용할 수 없습니다.
// 실제 프로덕션에서는 DB에서 로드해야 합니다.
// 현재는 빈 배열을 반환하며, 클라이언트 컴포넌트에서 직접 teacherStorage를 사용하는 것을 권장합니다.
export async function GET() {
  try {
    // TODO: 실제 프로덕션에서는 DB에서 로드
    // 현재는 빈 배열 반환 (클라이언트에서 직접 teacherStorage 사용 권장)
    const teachers: PublicTeacher[] = [];

    // 🔒 학생에게는 email을 절대 보내지 않음
    const publicTeachers: PublicTeacher[] = teachers.map((t) => ({
      id: t.id,
      displayName: t.displayName
    }));

    return NextResponse.json({ teachers: publicTeachers });
  } catch (error: any) {
    console.error("[API /teachers-public] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load teachers" },
      { status: 500 }
    );
  }
}

