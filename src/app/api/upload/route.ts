import { NextResponse } from "next/server";

// File upload functionality is temporarily disabled
export async function POST() {
  return NextResponse.json(
    { error: "File upload is currently disabled" },
    { status: 501 },
  );
}
