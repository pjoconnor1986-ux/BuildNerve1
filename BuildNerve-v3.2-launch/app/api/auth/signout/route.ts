import { NextResponse } from "next/server";import { createClient } from "@/lib/supabase/server";
export async function POST(req:Request){const s=await createClient();if(s)await s.auth.signOut();return NextResponse.redirect(new URL("/login",req.url),303);}
