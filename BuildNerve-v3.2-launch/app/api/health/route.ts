import { NextResponse } from "next/server";
export async function GET(){
 const supabaseConfigured=Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
 return NextResponse.json({ok:true,service:"BuildNerve",version:"3.2-launch",supabaseConfigured,aiConfigured:Boolean(process.env.OPENAI_API_KEY),features:["quick-capture","agent","auth","multi-tenant-data","private-documents","audit-foundation","pwa"]});
}
