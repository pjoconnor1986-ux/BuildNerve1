"use client";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Login(){
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [mode,setMode]=useState<"login"|"signup">("login");
 const [msg,setMsg]=useState("");
 const [busy,setBusy]=useState(false);

 async function submit(e:FormEvent){
  e.preventDefault();
  setBusy(true);
  setMsg("");
  const supabase=createClient();
  if(!supabase){setMsg("BuildNerve account services are not configured.");setBusy(false);return;}
  const result=mode==="login"
   ?await supabase.auth.signInWithPassword({email,password})
   :await supabase.auth.signUp({email,password});
  if(result.error){setMsg(result.error.message);setBusy(false);return;}
  if(mode==="signup"){setMsg("Account created. Check your email to verify it, then return to complete company setup.");setBusy(false);return;}
  location.href="/";
 }

 return <main className="authPage">
  <aside className="authAside">
   <div className="authLogo"><span>BN</span><b>BuildNerve</b></div>
   <div className="authPitch">
    <span className="authKicker">CONSTRUCTION INTELLIGENCE</span>
    <h1>Know what needs attention before it costs you.</h1>
    <p>One operational view across projects, actions, commercial exposure and site records.</p>
   </div>
   <div className="authProof"><span>✓ Private company workspaces</span><span>✓ AI-assisted project control</span><span>✓ Human approval for critical decisions</span></div>
  </aside>
  <section className="authCard">
   <div className="authBrand"><b>BN</b><div><h1>BuildNerve</h1><p>Construction intelligence, connected.</p></div></div>
   <span className="authKicker">{mode==="login"?"WELCOME BACK":"START YOUR 14-DAY TRIAL"}</span>
   <h2>{mode==="login"?"Sign in to your workspace":"Create your account"}</h2>
   <p className="authIntro">{mode==="login"?"Access your company projects and priorities.":"Set up a secure company workspace in a few minutes."}</p>
   <form onSubmit={submit}>
    <label>Email address<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.co.uk"/></label>
    <label>Password<input type="password" autoComplete={mode==="login"?"current-password":"new-password"} minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/></label>
    <button className="authPrimary" disabled={busy}>{busy?"Please wait…":mode==="login"?"Sign in securely":"Create account"}</button>
   </form>
   {msg&&<p className="authMsg" role="alert">{msg}</p>}
   <button className="authSwitch" onClick={()=>{setMode(mode==="login"?"signup":"login");setMsg("");}}>{mode==="login"?"New to BuildNerve? Create an account":"Already have an account? Sign in"}</button>
   <small className="authLegal">Safety-critical approvals remain with authorised competent people.</small>
  </section>
 </main>
}
