import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const data = { status: 'okay' };
  return NextResponse.json(data, { status: 200 });
}
