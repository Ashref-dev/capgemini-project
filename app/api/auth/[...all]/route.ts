import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Auth endpoints are served by individual routes" },
    { status: 404 }
  );
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: "Auth endpoints are served by individual routes" },
    { status: 404 }
  );
}
