import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key) return null;
  const store=await cookies();
  return createServerClient(url,key,{cookies:{
    getAll(){ return store.getAll(); },
    setAll(items){
      try{ items.forEach(({name,value,options})=>store.set(name,value,options)); }catch{}
    }
  }});
}

export async function requireUser(){
  const supabase=await createClient();
  if(!supabase) return {supabase:null,user:null,profile:null,demo:true};
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) return {supabase,user:null,profile:null,demo:false};
  const {data:profile}=await supabase.from("profiles").select("*").eq("id",user.id).single();
  return {supabase,user,profile,demo:false};
}
