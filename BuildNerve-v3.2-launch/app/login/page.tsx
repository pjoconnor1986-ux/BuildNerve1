"use client";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Login(){
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [mode,setMode]=useState<"login"|"signup">("login"); const [msg,setMsg]=useState("");
 async function submit(e:FormEvent){ e.preventDefault(); const s=createClient(); if(!s){setMsg("Demo mode: add Supabase environment variables to enable accounts.");return;}
  const result=mode==="login"?await s.auth.signInWithPassword({email,password}):await s.auth.signUp({email,password});
  if(result.error){setMsg(result.error.message);return;}
  if(mode==="signup"){setMsg("Account created. Check your email if confirmation is enabled, then complete company setup.");return;}
  location.href="/";
 }
 return <main className="authPage"><section className="authCard"><div className="authBrand"><b>BN</b><div><h1>BuildNerve</h1><p>Construction intelligence, connected.</p></div></div><h2>{mode==="login"?"Sign in":"Create your account"}</h2><form onSubmit={submit}><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="authPrimary">{mode==="login"?"Sign in":"Create account"}</button></form>{msg&&<p className="authMsg">{msg}</p>}<button className="authSwitch" onClick={()=>setMode(mode==="login"?"signup":"login")}>{mode==="login"?"New to BuildNerve? Create an account":"Already have an account? Sign in"}</button><small>Safety-critical approvals remain with authorised competent people.</small></section></main>
}
