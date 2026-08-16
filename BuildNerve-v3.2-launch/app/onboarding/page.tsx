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

 return <main className="authPage">
  <aside className="authAside onboardingAside">
   <div className="authLogo"><span>BN</span><b>BuildNerve</b></div>
   <div className="authPitch">
    <span className="authKicker">WORKSPACE SETUP</span>
    <h1>Start with the company and project that matter today.</h1>
    <p>BuildNerve creates a private operating environment for your team, records and AI insights.</p>
   </div>
   <ol className="setupSteps">
    <li className="complete"><span>1</span><div><b>Account secured</b><small>Your verified BuildNerve identity</small></div></li>
    <li className="current"><span>2</span><div><b>Company workspace</b><small>Business and first live project</small></div></li>
    <li><span>3</span><div><b>Invite your team</b><small>Roles and permissions come next</small></div></li>
   </ol>
  </aside>
  <section className="authCard onboardingCard">
   <div className="authBrand"><b>BN</b><div><h1>BuildNerve</h1><p>Private company setup</p></div></div>
   <span className="authKicker">STEP 2 OF 3</span>
   <h2>Create your workspace</h2>
   <p className="authIntro">Tell us the essentials. You can add more projects and company details later.</p>
   <form onSubmit={submit} className="onboardingForm">
    <label>Company name<input required minLength={2} value={company} onChange={e=>setCompany(e.target.value)} placeholder="e.g. ABC Groundworks Ltd"/></label>
    <label>Your full name<input required minLength={2} value={name} onChange={e=>setName(e.target.value)} autoComplete="name" placeholder="e.g. Alex Smith"/></label>
    <label>Your access level<div className="roleField"><span>Company Owner</span><small>Full workspace administration</small></div></label>
    <label>First live project<input required minLength={2} value={project} onChange={e=>setProject(e.target.value)} placeholder="e.g. Oakfield Housing — Phase 1"/></label>
    <label>Client <span className="optional">(optional)</span><input value={client} onChange={e=>setClient(e.target.value)} placeholder="e.g. Main Contractor Ltd"/></label>
    <button className="authPrimary" disabled={busy}>{busy?"Creating your private workspace…":"Create company workspace"}</button>
   </form>
   {msg&&<p className="authMsg" role="alert">{msg}</p>}
   <div className="privacyNote"><span>✓</span><p><b>Private by design</b>Your company and project records are separated from every other customer.</p></div>
  </section>
 </main>
}
