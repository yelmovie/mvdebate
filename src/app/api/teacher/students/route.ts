import { NextResponse } from "next/server";
import { fileStore } from "../../../../lib/fileStore";

export const dynamic = 'force-dynamic';

export async function GET() {
  const statuses = fileStore.getAllStatuses();
  return NextResponse.json({
    students: statuses
  });
}
