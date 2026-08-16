"use client";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Onboarding(){
 const [company,setCompany]=useState(""); const [name,setName]=useState(""); const [role,setRole]=useState("director"); const [msg,setMsg]=useState(""); const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent){
  e.preventDefault(); setBusy(true); setMsg("");
  const s=createClient(); if(!s){setMsg("Supabase is not configured.");setBusy(false);return;}
  const {data:{user}}=await s.auth.getUser(); if(!user){location.href="/login";return;}
  const {error}=await s.rpc("create_organisation_for_current_user",{p_name:company,p_full_name:name,p_role:role});
  if(error){setMsg(error.message);setBusy(false);return;}
  location.href="/";
 }
 return <main className="authPage"><section className="authCard wide"><div className="authBrand"><b>BN</b><div><h1>Set up BuildNerve</h1><p>Create your company workspace.</p></div></div><form onSubmit={submit}><label>Construction business<input required value={company} onChange={e=>setCompany(e.target.value)} placeholder="e.g. ABC Groundworks Ltd"/></label><label>Your name<input required value={name} onChange={e=>setName(e.target.value)}/></label><label>Role<select value={role} onChange={e=>setRole(e.target.value)}><option value="director">Director</option><option value="pm">Project Manager</option><option value="qs">Quantity Surveyor</option><option value="site_agent">Site Agent</option><option value="engineer">Engineer</option><option value="foreman">Foreman</option><option value="buyer">Buyer</option></select></label><button className="authPrimary" disabled={busy}>{busy?"Creating workspace…":"Create company workspace"}</button></form>{msg&&<p className="authMsg">{msg}</p>}</section></main>
}
