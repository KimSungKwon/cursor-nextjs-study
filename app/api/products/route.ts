import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ products: [] });
}

export async function POST() {
  return NextResponse.json({ message: "상품 생성 placeholder" }, { status: 201 });
}
