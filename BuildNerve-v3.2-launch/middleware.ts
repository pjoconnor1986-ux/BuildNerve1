import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request:NextRequest){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.next();

 let response=NextResponse.next({request});
 const supabase=createServerClient(url,key,{cookies:{
  getAll:()=>request.cookies.getAll(),
  setAll(items){
   items.forEach(({name,value})=>request.cookies.set(name,value));
   response=NextResponse.next({request});
   items.forEach(({name,value,options})=>response.cookies.set(name,value,options));
  }
 }});

 const {data:{user}}=await supabase.auth.getUser();
 const path=request.nextUrl.pathname;
 const publicPath=path.startsWith("/login")||path.startsWith("/api/health")||path.startsWith("/_next")||path==="/manifest.webmanifest";

 if(!user&&!publicPath){
  const next=request.nextUrl.clone();
  next.pathname="/login";
  return NextResponse.redirect(next);
 }
 if(!user)return response;

 const {data:profile}=await supabase.from("profiles").select("id").eq("id",user.id).maybeSingle();

 if(!profile&&path!=="/onboarding"&&!path.startsWith("/api/health")&&!path.startsWith("/api/auth/")){
  const next=request.nextUrl.clone();
  next.pathname="/onboarding";
  return NextResponse.redirect(next);
 }
 if(profile&&(path==="/login"||path==="/onboarding")){
  const next=request.nextUrl.clone();
  next.pathname="/";
  return NextResponse.redirect(next);
 }
 if(!profile&&path==="/login"){
  const next=request.nextUrl.clone();
  next.pathname="/onboarding";
  return NextResponse.redirect(next);
 }

 return response;
}

export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};
