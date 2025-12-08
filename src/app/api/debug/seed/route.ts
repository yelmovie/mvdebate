import { NextResponse } from "next/server";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../../firebase"; // Adjust path if needed, likely ../../../firebase
import { USER_ROLES } from "../../../../config/authConfig";

export async function GET() {
  try {
    // Requires using the server-side firebase or ensuring client SDK works in route (usually works for simple key-based auth)
    // Note: 'db' import might be client-sdk based. In Next.js App Router, this runs on server but uses client SDK config if not admin-sdk.
    // Assuming client SDK is initialized in ../../../firebase.ts
    
    const dummyId = "dummy-student-" + Date.now();
    
    await setDoc(doc(db, "users", dummyId), {
      uid: dummyId,
      email: "test_student@example.com",
      displayName: "테스트 학생",
      name: "테스트 학생", // Real name
      role: USER_ROLES.STUDENT,
      classCode: "A5252", // Matching the teacher's code
      studentNumber: 1,
      level: 3,
      totalScore: 450,
      photoURL: null,
      schoolName: "Test School",
      coupons: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      provider: "password"
    });

    return NextResponse.json({ success: true, message: "Created dummy student for class A5252" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
