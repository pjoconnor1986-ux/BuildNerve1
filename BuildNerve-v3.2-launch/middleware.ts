import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request:NextRequest){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key) return NextResponse.next();
  let response=NextResponse.next({request});
  const supabase=createServerClient(url,key,{cookies:{
    getAll:()=>request.cookies.getAll(),
    setAll(items){ items.forEach(({name,value})=>request.cookies.set(name,value)); response=NextResponse.next({request}); items.forEach(({name,value,options})=>response.cookies.set(name,value,options)); }
  }});
  const {data:{user}}=await supabase.auth.getUser();
  const p=request.nextUrl.pathname;
  const publicPath=p.startsWith("/login")||p.startsWith("/api/health")||p.startsWith("/_next")||p==="/manifest.webmanifest";
  if(!user&&!publicPath){ const u=request.nextUrl.clone();u.pathname="/login";return NextResponse.redirect(u); }
  if(user&&p==="/login"){ const u=request.nextUrl.clone();u.pathname="/";return NextResponse.redirect(u); }
  return response;
}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};
