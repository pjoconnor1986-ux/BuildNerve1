"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CalendarWorkspace, DrawingRegister, MaterialWorkspace, SafetyWorkspace, SupplierDirectory, TargetedUpdates } from "./operations";

type Priority="Red"|"Amber"|"Green";
type View="home"|"capture"|"agent"|"projects"|"calendar"|"diaries"|"commercial"|"procurement"|"suppliers"|"quality"|"safety"|"documents"|"updates"|"actions"|"activity"|"team";
type Action={id:number|string;item:string;owner:string;project:string;due:string;priority:Priority;status:"Open"|"Closed"};
type CaptureResult={summary:string;diary?:string;actions?:Array<{item:string;owner:string;priority:Priority}>;risks?:string[];commercial?:string[];next?:string[]};

const demoProjects=[
 {name:"Oakfield Housing — Phase 2",client:"Bellway Homes",stage:"Groundworks",progress:63,margin:"11.8%",risk:"Amber" as Priority},
 {name:"Riverside Logistics Park",client:"Main Contractor",stage:"Earthworks & drainage",progress:28,margin:"8.6%",risk:"Red" as Priority},
 {name:"Westgate School",client:"Local Authority",stage:"External works",progress:84,margin:"14.2%",risk:"Green" as Priority}
];
const seedActions:Action[]=[
 {id:1,item:"Confirm 150mm pipe delivery",owner:"Buyer",project:"Oakfield",due:"Today",priority:"Red",status:"Open"},
 {id:2,item:"Complete Plot 48 utility scan",owner:"Engineer",project:"Oakfield",due:"Today",priority:"Red",status:"Open"},
 {id:3,item:"Agree contaminated muck disposal route",owner:"PM",project:"Riverside",due:"Today",priority:"Red",status:"Open"},
 {id:4,item:"Price attenuation instruction",owner:"QS",project:"Riverside",due:"Tomorrow",priority:"Amber",status:"Open"},
 {id:5,item:"Close NCR 014 kerb line",owner:"Foreman",project:"Oakfield",due:"Today",priority:"Amber",status:"Open"}
];
const activities=[
 ["09:42","BuildNerve","Flagged D4 drainage delivery as programme risk","Oakfield"],
 ["09:35","Site Agent","Saved morning diary update","Oakfield"],
 ["09:12","QS","Linked instruction 27 to change event","Riverside"],
 ["08:58","Engineer","Uploaded utility scan record","Oakfield"],
 ["08:40","BuildNerve","Created 3 morning actions from director briefing","Company"]
];
const nav:Array<[View,string,string]>=[
 ["home","Today","⌂"],["capture","Quick Capture","＋"],["agent","BuildNerve AI","✦"],["projects","Projects","▦"],["calendar","Live Calendar","▦"],["diaries","Diaries","▤"],
 ["commercial","Commercial","£"],["procurement","Materials & CVR","▣"],["suppliers","Suppliers","⌂"],["team","Team","♟"],["quality","Quality","✓"],["safety","Safety Forms","⌁"],["documents","Drawings","▧"],["updates","Targeted Updates","◎"],["actions","Actions","!"],["activity","Activity","↺"]
];
function Pill({v}:{v:string}){const c=/red|blocked|critical/i.test(v)?"red":/amber|due|pending/i.test(v)?"amber":/green|ready|passed|approved/i.test(v)?"green":"blue";return <span className={`pill ${c}`}>{v}</span>}
function Card({title,sub,action,children}:{title:string;sub?:string;action?:React.ReactNode;children:React.ReactNode}){return <div className="card"><div className="cardHead"><div><h3>{title}</h3>{sub&&<p>{sub}</p>}</div>{action}</div>{children}</div>}
function Metric({label,value,note}:{label:string;value:string;note?:string}){return <div className="metricBox"><span>{label}</span><strong>{value}</strong>{note&&<small>{note}</small>}</div>}
function Table({headers,rows}:{headers:string[];rows:React.ReactNode[][]}){return <div className="tableWrap"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody></table></div>}

export default function Home(){
 const [view,setView]=useState<View>("home"); const [menu,setMenu]=useState(false); const [companyName,setCompanyName]=useState("Loading workspace…"); const [projects,setProjects]=useState(demoProjects.slice(0,0)); const [workspaceReady,setWorkspaceReady]=useState(false); const [actions,setActions]=useState<Action[]>([]);
 const [capture,setCapture]=useState(""); const [capResult,setCapResult]=useState<CaptureResult|null>(null); const [capBusy,setCapBusy]=useState(false);
 const [q,setQ]=useState(""); const [thinking,setThinking]=useState(false); const [chat,setChat]=useState([{role:"agent",text:"Morning. Tell me what happened on site or ask what needs attention. I’ll turn information into useful next actions."}]);
 useEffect(()=>{let active=true;(async()=>{try{const response=await fetch("/api/bootstrap",{cache:"no-store"});const data=await response.json();if(data.needsOnboarding){location.href="/onboarding";return;}if(active&&data.mode==="live"){const liveProjects=(data.projects||[]).map((p:any)=>({name:p.name,client:p.client||"Not set",stage:p.status==="live"?"Live project":p.status,progress:Number(p.programme_percent||0),margin:p.forecast_value&&p.forecast_cost?`${(((Number(p.forecast_value)-Number(p.forecast_cost))/Number(p.forecast_value))*100).toFixed(1)}%`:"—",risk:"Green" as Priority,id:p.id}));const projectNames=new Map(liveProjects.map((p:any)=>[p.id,p.name]));setCompanyName(data.organisation?.name||"Your company");setProjects(liveProjects);setActions((data.actions||[]).map((a:any)=>({id:a.id,item:a.title,owner:"Unassigned",project:projectNames.get(a.project_id)||"Company",due:a.due_at?new Date(a.due_at).toLocaleDateString("en-GB"):"No due date",priority:(String(a.priority).toLowerCase()==="red"?"Red":String(a.priority).toLowerCase()==="green"?"Green":"Amber") as Priority,status:String(a.status).toLowerCase()==="closed"?"Closed":"Open"})));setWorkspaceReady(true);}}catch{if(active)setCompanyName("Workspace unavailable");}})();return()=>{active=false};},[]);
 const open=actions.filter(a=>a.status==="Open"), reds=open.filter(a=>a.priority==="Red");
 const context=useMemo(()=>({projects,actions,materials:[{item:"150mm drainage pipe",project:"Oakfield",stock:"24m",need:"96m",eta:"Tomorrow 10:00",risk:"Red"},{item:"C25/30 concrete",project:"Oakfield",stock:"0",need:"18m³",eta:"Not booked",risk:"Amber"}],commercial:[{project:"Oakfield",unpriced:"£148k"},{project:"Riverside",unpriced:"£162k"}]}),[actions]);
 const title=nav.find(n=>n[0]===view)?.[1]||"Today";
 async function ask(text=q){const m=text.trim();if(!m||thinking)return;setQ("");setChat(c=>[...c,{role:"user",text:m}]);setThinking(true);try{const r=await fetch('/api/agent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:m,context})});const d=await r.json();setChat(c=>[...c,{role:"agent",text:d.reply||d.error||'No response'}])}catch{setChat(c=>[...c,{role:"agent",text:"I couldn't reach the BuildNerve service."}])}finally{setThinking(false)}}
 async function runCapture(){const text=capture.trim();if(!text||capBusy)return;setCapBusy(true);setCapResult(null);try{const r=await fetch('/api/capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,project:projects[0]?.name||'Company'})});const d=await r.json();setCapResult(d);if(d.actions?.length){setActions(a=>[...d.actions.map((x:any,i:number)=>({id:Date.now()+i,item:x.item,owner:x.owner||'Site Agent',project:'Oakfield',due:'Today',priority:x.priority||'Amber',status:'Open' as const})),...a])}}catch{setCapResult({summary:'Capture could not be processed. Your note remains on screen so it is not lost.'})}finally{setCapBusy(false)}}
 function openAgent(prompt:string){setView('agent');setMenu(false);setTimeout(()=>ask(prompt),20)}
 return <div className="shell">
  <aside className={menu?'sidebar open':'sidebar'}>
   <div className="brand"><div className="logo">BN</div><div><b>BuildNerve</b><span>Construction intelligence</span></div></div>
   <div className="company"><small>{companyName.toUpperCase()}</small><b>{projects.length} live {projects.length===1?"project":"projects"}</b><span>{workspaceReady?"Private company workspace":"Loading secure workspace…"}</span></div>
   <nav>{nav.map(([id,label,icon])=><button key={id} className={view===id?'active':''} onClick={()=>{setView(id);setMenu(false)}}><i>{icon}</i>{label}{id==='actions'&&open.length>0?<em>{open.length}</em>:null}</button>)}</nav>
   <div className="sideFoot"><span className="dot"/>Online <small>BuildNerve v3.2</small></div>
  </aside>
  <main>
   <header className="topbar"><button className="menu" onClick={()=>setMenu(!menu)}>☰</button><div><span className="eyebrow">YOUR CONSTRUCTION COPILOT</span><h1>{title}</h1></div><div className="topActions"><span className="critical">{reds.length} critical</span><button onClick={()=>setView('capture')}>＋ Quick Capture</button></div></header>

   {view==='home'&&<section>
    <div className="welcome"><div><span className="eyebrow gold">COMPANY CONTROL</span><h2>Morning. Here’s what needs your attention.</h2><p>BuildNerve prioritises the few things most likely to affect safety, programme or margin.</p></div><button onClick={()=>openAgent('Give me a concise director briefing for today and tell me only what needs intervention')}>✦ Brief me</button></div>
    <div className="quickStrip"><button onClick={()=>setView('capture')}><b>＋</b><span><strong>Tell BuildNerve</strong><small>Record anything in seconds</small></span></button><button onClick={()=>openAgent('Plan tomorrow across all sites')}>🗓 <span><strong>Plan tomorrow</strong><small>Labour, plant, materials</small></span></button><button onClick={()=>openAgent('What can cost us money this week?')}>£ <span><strong>Protect margin</strong><small>Changes, delays, records</small></span></button><button onClick={()=>openAgent('What is not ready to start?')}>⚠ <span><strong>Check readiness</strong><small>Permits, QA, materials</small></span></button></div>
    <div className="metrics"><Metric label="Critical interventions" value={String(reds.length)} note="Needs a person today"/><Metric label="Live projects" value={String(projects.length)} note="In your workspace"/><Metric label="Open actions" value={String(open.length)} note="Across your company"/><Metric label="Workspace" value={workspaceReady?"Ready":"Loading"} note="Private and tenant-separated"/></div>
    <div className="grid two"><Card title="Intervention queue" sub="Ranked by likely business impact" action={<button className="linkBtn" onClick={()=>openAgent('Rank every open issue by cost, programme and safety impact')}>Re-rank with AI →</button>}>
      {open.length===0&&<p className="muted">No open actions yet. Use Quick Capture to create your first site record.</p>}{open.slice(0,5).map(a=><div className="intervention" key={a.id}><Pill v={a.priority}/><div><b>{a.item}</b><span>{a.project} · {a.owner} · {a.due}</span></div><button onClick={()=>setActions(actions.map(x=>x.id===a.id?{...x,status:'Closed'}:x))}>Done</button></div>)}
     </Card><Card title="Project pulse" sub="No hunting through reports">{projects.length===0&&<p className="muted">Your projects will appear here after onboarding.</p>}{projects.map(p=><div className="project" key={p.name}><div><b>{p.name}</b><span>{p.stage} · {p.progress}% complete</span></div><div><strong>{p.margin}</strong><Pill v={p.risk}/></div></div>)}</Card></div>
    <div className="grid three"><Card title="Today on site"><Row a="Operatives" b="74"/><Row a="Active gangs" b="12"/><Row a="Excavations" b="7"/><Row a="Deliveries" b="14"/></Card><Card title="Agent work completed"><Row a="Actions created" b="8"/><Row a="Risks escalated" b="3"/><Row a="Records linked" b="17"/><Row a="Briefings prepared" b="4"/></Card><Card title="Next best action"><div className="nextBest"><span>01</span><div><b>Resolve Riverside disposal route</b><p>Highest current programme and cost exposure.</p></div></div><button className="wide" onClick={()=>openAgent('Help me resolve the Riverside contaminated muck disposal risk')}>Work this issue →</button></Card></div>
   </section>}

   {view==='capture'&&<section className="captureLayout"><Card title="Tell BuildNerve once" sub="Type or dictate what happened. BuildNerve structures it into records and proposed actions.">
    <div className="captureBox"><textarea value={capture} onChange={e=>setCapture(e.target.value)} placeholder="Example: Pipe delivery is late. D4 stopped at 11:20. Move drainage gang to Road 3 tomorrow. Client engineer instructed us to expose the fibre service before continuing."/><div className="captureTools"><span>🎙 Voice-ready workflow</span><button onClick={runCapture} disabled={capBusy}>{capBusy?'Analysing…':'✦ Understand & act'}</button></div></div>
    <div className="examples"><span>Try:</span><button onClick={()=>setCapture('D4 stopped at 11:20 because the 150mm pipe delivery did not arrive. Move the gang to Road 3 tomorrow and chase the supplier.')}>Delay + action</button><button onClick={()=>setCapture('Client engineer instructed us to deepen MH22 by 450mm. Photos taken and instruction received on site.')}>Instruction/change</button><button onClick={()=>setCapture('Plot 48 cannot start excavation because the CAT scan has not been completed.')}>Readiness issue</button></div>
   </Card>
   {capResult&&<Card title="BuildNerve understood" sub="Review before anything consequential is committed"><div className="understood"><h4>{capResult.summary}</h4>{capResult.diary&&<Result label="Diary record" items={[capResult.diary]}/>}<Result label="Actions created" items={(capResult.actions||[]).map(a=>`${a.item} — ${a.owner} (${a.priority})`)}/><Result label="Risks detected" items={capResult.risks||[]}/><Result label="Commercial evidence" items={capResult.commercial||[]}/><Result label="Suggested next steps" items={capResult.next||[]}/></div><div className="approval"><span>Human approval is required for safety-critical permits, inspections and contractual commitments.</span><button onClick={()=>setView('actions')}>Review actions →</button></div></Card>}
   </section>}

   {view==='agent'&&<section className="grid agentGrid"><Card title="Ask BuildNerve" sub="One assistant across site, office and commercial"><div className="chat">{chat.map((m,i)=><div key={i} className={`msg ${m.role}`}>{m.text}</div>)}{thinking&&<div className="msg agent">Analysing current records…</div>}</div><form className="ask" onSubmit={e=>{e.preventDefault();ask()}}><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Ask naturally: what should I do first today?"/><button>Send</button></form><div className="chips"><button onClick={()=>ask('What should I do first today?')}>First priority</button><button onClick={()=>ask('Plan tomorrow')}>Tomorrow plan</button><button onClick={()=>ask('Find margin leakage')}>Margin leakage</button><button onClick={()=>ask('Find missing records')}>Missing records</button></div></Card><Card title="Agentic mode" sub="BuildNerve can prepare work, not just answer questions"><AgentStep n="1" t="Observe" d="Read project records and new captures"/><AgentStep n="2" t="Reason" d="Connect site, programme, commercial and QA signals"/><AgentStep n="3" t="Prepare" d="Draft records, actions, plans and evidence packs"/><AgentStep n="4" t="Escalate" d="Put the right issue in front of the right person"/><AgentStep n="5" t="Learn" d="Use accepted/closed actions to improve priorities"/><div className="guard">Safety-critical approvals and binding commercial commitments stay with authorised humans.</div></Card></section>}

   {view==='projects'&&<section><Card title="Projects" sub="Simple portfolio view"><Table headers={["Project","Client","Stage","Progress","Margin","Risk"]} rows={projects.map(p=>[p.name,p.client,p.stage,`${p.progress}%`,p.margin,<Pill key={p.name} v={p.risk}/>])}/></Card></section>}
   {view==='calendar'&&<CalendarWorkspace projects={projects}/>} 
   {view==='diaries'&&<section className="grid two"><Card title="Today’s diaries" sub="Capture once; reuse everywhere"><Table headers={["Project","Status","Last update","Issues"]} rows={[["Oakfield","Draft","11:28","2"],["Riverside","Live","10:54","3"],["Westgate","Live","10:31","0"]]}/><button className="wide" onClick={()=>setView('capture')}>＋ Add site update</button></Card><Card title="Automatic reuse"><Row a="End-of-day report" b="Prepared"/><Row a="Commercial evidence links" b="4"/><Row a="Actions extracted" b="6"/><Row a="Programme risks" b="2"/><button className="wide" onClick={()=>openAgent('Draft today’s end-of-day reports from all captured site information')}>✦ Draft reports</button></Card></section>}
   {view==='commercial'&&<section><div className="metrics"><Metric label="Forecast revenue" value="£8.38m"/><Metric label="Forecast margin" value="11.1%"/><Metric label="Unpriced change" value="£310k"/><Metric label="Evidence gaps" value="3"/></div><Card title="Commercial attention" sub="Site evidence connected to value"><Table headers={["Project","Event","Value","Evidence","Status"]} rows={[["Riverside","Attenuation instruction","£162k","Diary + instruction",<Pill key="a" v="Amber"/>],["Oakfield","Utility clash / delay","TBC","Diary + photos",<Pill key="b" v="Pending"/>],["Oakfield","Drainage revision","£148k","Drawing + instruction",<Pill key="c" v="Amber"/>]]}/><button className="wide" onClick={()=>openAgent('Review all commercial events and identify which evidence or notices need attention')}>✦ Protect margin</button></Card></section>}
   {view==='procurement'&&<MaterialWorkspace projects={projects}/>} 
   {view==='suppliers'&&<SupplierDirectory/>}
   {view==='quality'&&<section className="grid two"><Card title="Quality readiness"><Row a="Hold points due" b="6"/><Row a="Open NCRs" b="4"/><Row a="Overdue NCRs" b="1"/><Row a="Handover records" b="82%"/></Card><Card title="BuildNerve QA Agent"><p className="muted">Checks what is due, what evidence is missing and what is about to be covered up before records are complete.</p><button className="wide" onClick={()=>openAgent('Find today’s QA risks and anything at risk of being covered up without records')}>✦ Check QA now</button></Card></section>}
   {view==='safety'&&<SafetyWorkspace projects={projects}/>} 
   {view==='documents'&&<DrawingRegister projects={projects}/>} 
   {view==='updates'&&<TargetedUpdates projects={projects}/>} 
   {view==='team'&&<TeamPanel/>}
   {view==='actions'&&<section><Card title="Actions" sub="One accountable queue"><Table headers={["Action","Project","Owner","Due","Priority","Status"]} rows={actions.map(a=>[a.item,a.project,a.owner,a.due,<Pill key={a.id} v={a.priority}/>,<button key={`${a.id}b`} className="statusBtn" onClick={()=>setActions(actions.map(x=>x.id===a.id?{...x,status:x.status==='Open'?'Closed':'Open'}:x))}>{a.status}</button>])}/></Card></section>}
   {view==='activity'&&<section><Card title="Activity & evidence trail" sub="Who/what changed, when, and why"><Table headers={["Time","Actor","Activity","Project"]} rows={activities}/><div className="auditNote">Production version: every AI-created action, edited record, approval and document link should be written to an immutable audit event.</div></Card></section>}
  </main>
  <button className="fab" onClick={()=>setView('capture')}>＋</button>
 </div>
}
function Row({a,b}:{a:string;b:string}){return <div className="row"><span>{a}</span><b>{b}</b></div>}
function Result({label,items}:{label:string;items:string[]}){if(!items.length)return null;return <div className="result"><b>{label}</b>{items.map((x,i)=><div key={i}>• {x}</div>)}</div>}
function AgentStep({n,t,d}:{n:string;t:string;d:string}){return <div className="agentStep"><span>{n}</span><div><b>{t}</b><small>{d}</small></div></div>}


type TeamMember={id:string;full_name:string;role:string;created_at:string};
type TeamInvite={id:string;email:string;role:string;expires_at:string;accepted_at:string|null;created_at:string};
const roleNames:Record<string,string>={company_owner:"Company Owner",director:"Director",admin:"Administrator",pm:"Project Manager",site_manager:"Site Manager",qs:"Quantity Surveyor",buyer:"Buyer",viewer:"Viewer"};
const roleHelp:Record<string,string>={director:"Company-wide visibility and oversight",admin:"Manage the workspace and invite people",pm:"Manage projects, actions and delivery",site_manager:"Run site records, safety and quality",qs:"Commercial events, costs and CVR",buyer:"Suppliers, orders and delivery dates",viewer:"Read-only access to company information"};

function TeamPanel(){
 const [members,setMembers]=useState<TeamMember[]>([]);
 const [invites,setInvites]=useState<TeamInvite[]>([]);
 const [email,setEmail]=useState("");
 const [role,setRole]=useState("pm");
 const [link,setLink]=useState("");
 const [message,setMessage]=useState("");
 const [busy,setBusy]=useState(false);
 const [invitedEmail,setInvitedEmail]=useState("");

 async function load(){
  const supabase=createClient();
  if(!supabase)return;
  const [memberResult,inviteResult]=await Promise.all([
   supabase.from("profiles").select("id,full_name,role,created_at").order("created_at"),
   supabase.from("team_invitations").select("id,email,role,expires_at,accepted_at,created_at").order("created_at",{ascending:false})
  ]);
  if(memberResult.data)setMembers(memberResult.data as TeamMember[]);
  if(inviteResult.data)setInvites(inviteResult.data as TeamInvite[]);
 }
 useEffect(()=>{load()},[]);

 async function invite(event:React.FormEvent){
  event.preventDefault();setBusy(true);setMessage("");setLink("");
  const supabase=createClient();
  if(!supabase){setMessage("Team services are unavailable.");setBusy(false);return}
  const {data,error}=await supabase.rpc("create_team_invitation",{p_email:email,p_role:role});
  if(error){setMessage(error.message);setBusy(false);return}
  const result=data as {token:string;expires_at:string};
  const newLink=location.origin+"/join?token="+result.token;
  setLink(newLink);setInvitedEmail(email);
  await navigator.clipboard.writeText(newLink).catch(()=>undefined);
  setMessage("Invite ready and copied. Send it to "+email+" using the button below.");
  setEmail("");setBusy(false);load();
 }

 async function copy(){
  await navigator.clipboard.writeText(link);
  setMessage("Invitation link copied.");
 }

 function shareByEmail(){
  const subject=encodeURIComponent("You’re invited to join "+(document.querySelector(".company small")?.textContent||"our BuildNerve workspace"));
  const body=encodeURIComponent("You’ve been invited to join our BuildNerve workspace as "+(roleNames[role]||role)+".\n\nOpen your secure invitation:\n"+link+"\n\nThis private link expires after 7 days and is tied to your email address.");
  location.href=`mailto:${invitedEmail}?subject=${subject}&body=${body}`;
 }

 function inviteAgain(invite:TeamInvite){setEmail(invite.email);setRole(invite.role);setLink("");setInvitedEmail("");setMessage("Ready to create a fresh link for "+invite.email+". Check the role, then press Create & copy invite link.");document.querySelector(".teamInvite")?.scrollIntoView({behavior:"smooth",block:"center"})}

 return <section className="teamLayout">
  <Card title="Invite someone in two quick steps" sub="Enter their email, choose what they do, then BuildNerve copies a secure link for you.">
   <form className="teamInvite" onSubmit={invite}>
    <label><span className="stepLabel"><b>1</b> Their work email</span><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@company.co.uk"/></label>
    <fieldset className="roleChoices"><legend><span className="stepLabel"><b>2</b> What will they do?</span></legend>{Object.entries(roleNames).filter(([key])=>key!=="company_owner").map(([key,label])=><label className={role===key?"selected":""} key={key}><input type="radio" name="teamRole" value={key} checked={role===key} onChange={()=>setRole(key)}/><span><strong>{label}</strong><small>{roleHelp[key]}</small></span></label>)}</fieldset>
    <button className="invitePrimary" disabled={busy}>{busy?"Creating secure link…":"Create & copy invite link"}</button>
   </form>
   {message&&<p className="teamMessage">{message}</p>}
   {link&&<div className="inviteSuccess"><div><span>✓</span><div><b>Invitation ready</b><small>{invitedEmail} · {roleNames[role]}</small></div></div><div className="inviteActions"><button onClick={shareByEmail}>✉ Open email</button><button className="secondary" onClick={copy}>Copy again</button></div><input readOnly value={link}/></div>}
   <p className="muted">The person creates their own password. Links are single-use, tied to their email, and expire after 7 days.</p>
  </Card>
  <Card title="Company team" sub={members.length+" active "+(members.length===1?"member":"members")}>
   <div className="teamGrid">{members.map(member=><div className="teamMember" key={member.id}><span className="teamAvatar">{(member.full_name||"?").split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase()}</span><div><b>{member.full_name||"Unnamed member"}</b><small>Joined {new Date(member.created_at).toLocaleDateString("en-GB")}</small></div><Pill v={roleNames[member.role]||member.role}/></div>)}</div>
  </Card>
  <Card title="Pending invitations" sub="A simple record of who has been invited">
   {invites.filter(x=>!x.accepted_at).length===0?<p className="muted">No pending invitations.</p>:<Table headers={["Email","Role","Expires","Action"]} rows={invites.filter(x=>!x.accepted_at).map(x=>[x.email,roleNames[x.role]||x.role,new Date(x.expires_at).toLocaleDateString("en-GB"),<button className="statusBtn" key={x.id} onClick={()=>inviteAgain(x)}>Invite again</button>])}/>} 
  </Card>
 </section>
}
