import { NextResponse } from "next/server";

type ProductRouteContext = {
  params: Promise<{ productId: string }>;
};

export async function GET(_request: Request, context: ProductRouteContext) {
  const { productId } = await context.params;
  return NextResponse.json({ productId, product: null });
}

export async function PATCH(_request: Request, context: ProductRouteContext) {
  const { productId } = await context.params;
  return NextResponse.json({ productId, message: "상품 수정 placeholder" });
}

export async function DELETE(_request: Request, context: ProductRouteContext) {
  const { productId } = await context.params;
  return NextResponse.json({ productId, message: "상품 삭제 placeholder" });
}
