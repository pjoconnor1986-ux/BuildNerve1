"use client";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Onboarding(){
 const [company,setCompany]=useState("");
 const [name,setName]=useState("");
 const [project,setProject]=useState("");
 const [client,setClient]=useState("");
 const [msg,setMsg]=useState("");
 const [busy,setBusy]=useState(false);

 async function submit(e:FormEvent){
  e.preventDefault();
  setBusy(true);
  setMsg("");
  const supabase=createClient();
  if(!supabase){setMsg("BuildNerve is not configured yet.");setBusy(false);return;}
  const {data:{user}}=await supabase.auth.getUser();
  if(!user){location.href="/login";return;}
  const {error}=await supabase.rpc("onboard_company",{
   p_company_name:company,
   p_full_name:name,
   p_project_name:project,
   p_client:client||null
  });
  if(error){setMsg(error.message);setBusy(false);return;}
  location.href="/";
 }

 return <main className="authPage"><section className="authCard wide">
  <div className="authBrand"><b>BN</b><div><h1>Welcome to BuildNerve</h1><p>Create your private company workspace and first live project.</p></div></div>
  <div className="guard"><strong>14-day trial setup</strong><br/>You will be the Company Owner. Team invitations are the next setup stage.</div>
  <form onSubmit={submit}>
   <label>Company name<input required minLength={2} value={company} onChange={e=>setCompany(e.target.value)} placeholder="e.g. ABC Groundworks Ltd"/></label>
   <label>Your full name<input required minLength={2} value={name} onChange={e=>setName(e.target.value)} autoComplete="name" placeholder="e.g. Alex Smith"/></label>
   <label>Your role<input value="Company Owner" disabled aria-label="Your role"/></label>
   <label>First project<input required minLength={2} value={project} onChange={e=>setProject(e.target.value)} placeholder="e.g. Oakfield Housing — Phase 1"/></label>
   <label>Client <span className="muted">(optional)</span><input value={client} onChange={e=>setClient(e.target.value)} placeholder="e.g. Main Contractor Ltd"/></label>
   <button className="authPrimary" disabled={busy}>{busy?"Creating your private workspace…":"Create BuildNerve workspace"}</button>
  </form>
  {msg&&<p className="authMsg" role="alert">{msg}</p>}
  <p className="muted">Your company and project records are separated from every other BuildNerve customer.</p>
 </section></main>
}
