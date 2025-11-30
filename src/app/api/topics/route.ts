import { NextResponse } from "next/server";
import { getTopics } from "../../../services/configService";

export async function GET() {
  const topics = getTopics();
  return NextResponse.json(topics);
}
