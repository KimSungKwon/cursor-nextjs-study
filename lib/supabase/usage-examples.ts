/**
 * Supabase 클라이언트 사용 예시
 *
 * TODO: 나중에 Auth 연동 및 RLS(Row Level Security) 정책을 설정할 예정
 */

// ---------------------------------------------------------------------------
// 1) 클라이언트 컴포넌트에서 데이터 가져오기
//    getSupabaseBrowserClient() → from("products").select("*")
// ---------------------------------------------------------------------------
//
// "use client";
//
// import { useEffect } from "react";
// import { getSupabaseBrowserClient } from "@/lib/supabase/client";
//
// export function ProductList() {
//   useEffect(() => {
//     const supabase = getSupabaseBrowserClient();
//
//     supabase
//       .from("products")
//       .select("*")
//       .then(({ data, error }) => {
//         if (error) throw error;
//         console.log(data);
//       });
//   }, []);
//
//   return <div>상품 목록</div>;
// }

// ---------------------------------------------------------------------------
// 2) 서버 액션에서 데이터 생성
//    createClient() → from("orders").insert(...)
// ---------------------------------------------------------------------------
//
// "use server";
//
// import { createClient as getSupabaseServerClient } from "@/lib/supabase/server";
//
// export async function createOrder(input: {
//   userId: string;
//   productId: string;
//   quantity: number;
// }) {
//   const supabase = await getSupabaseServerClient();
//
//   const { data, error } = await supabase
//     .from("orders")
//     .insert({
//       user_id: input.userId,
//       product_id: input.productId,
//       quantity: input.quantity,
//     })
//     .select()
//     .single();
//
//   if (error) throw error;
//   return data;
// }

export {};
