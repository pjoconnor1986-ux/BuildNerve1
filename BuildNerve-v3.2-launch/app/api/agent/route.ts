import { NextResponse } from "next/server";

function fallback(message:string, context:any){
 const t=message.toLowerCase();
 const actions=(context?.actions||[]).filter((a:any)=>a.status!=="Closed");
 const red=actions.filter((a:any)=>a.priority==="Red");
 const mat=(context?.materials||[]).filter((m:any)=>m.risk!=="Green");
 const projects=context?.projects||[];
 const comm=context?.commercials||[];

 if(t.includes("director")||t.includes("brief")){
  return `Director briefing:\n\n• ${red.length} critical actions need intervention.\n• ${mat.length} procurement items are amber/red.\n• Portfolio: ${projects.map((p:any)=>`${p.name} ${p.risk}`).join("; ")}.\n• Unpriced / forecast change should be reviewed alongside current site records.\n\nTop interventions:\n${red.slice(0,4).map((a:any,i:number)=>`${i+1}. ${a.item} — ${a.project}, owner ${a.owner}, due ${a.due}`).join("\n")}`;
 }
 if(t.includes("cost")||t.includes("commercial")||t.includes("money")||t.includes("notice")||t.includes("variation")){
  return `Commercial watch:\n${comm.map((c:any)=>`• ${c.project}: forecast ${c.forecast}, cost ${c.cost}, margin ${c.margin}, change ${c.change}.`).join("\n")}\n\nBuildNerve should link site diaries, instructions, photos and programme impact to each change item so the commercial team can act while evidence is current.`;
 }
 if(t.includes("procurement")||t.includes("material")||t.includes("buy")){
  return `Procurement priorities:\n${mat.map((m:any)=>`• ${m.risk.toUpperCase()} — ${m.item} on ${m.project}: ${m.stock} on hand vs ${m.need} need; ETA ${m.eta}.`).join("\n")}\n\nRecommended workflow: confirm critical ETA, create owner/action, then re-plan affected gangs if supply cannot meet demand.`;
 }
 if(t.includes("programme")||t.includes("risk")){
  return `Programme / risk view:\n${red.map((a:any)=>`• RED — ${a.project}: ${a.item}`).join("\n")}\n\nRank these against float, gang dependency, procurement lead time and commercial exposure before the daily coordination meeting.`;
 }
 if(t.includes("tender")){
  return `Tender Agent workflow:\n1. Ingest drawings, specifications, BoQ, prelims and clarifications.\n2. Extract scope inclusions/exclusions, quantities, programme constraints, testing and temporary works requirements.\n3. Build risk register and clarification list.\n4. Track supplier/subcontractor quotations.\n5. Create tender assumptions and handover pack if won.\n6. Preserve source references for every extracted obligation.`;
 }
 return `BuildNerve can act as a company-level construction assistant. Ask for a director briefing, programme risks, procurement plan, commercial review, labour/plant optimisation, QA gaps, permit readiness or tender review.`;
}

export async function POST(req:Request){
 try{
  const body=await req.json();
  const message=String(body.message||"").trim();
  const context=body.context||{};
  if(!message)return NextResponse.json({error:"Message required"},{status:400});
  const key=process.env.OPENAI_API_KEY;
  if(!key)return NextResponse.json({reply:fallback(message,context),mode:"demo"});

  const response=await fetch("https://api.openai.com/v1/responses",{
   method:"POST",
   headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},
   body:JSON.stringify({
    model:process.env.OPENAI_MODEL||"gpt-5",
    input:[
     {role:"system",content:[{type:"input_text",text:"You are BuildNerve, an AI operating assistant for UK construction contractors. Think like a strong construction director, project manager, site agent, QS, buyer and QA coordinator while respecting role boundaries. Be practical, concise and commercial. Use only supplied company/project records for project-specific claims. Never issue permits, certify inspections, authorise excavations, approve temporary works, or replace competent-person decisions. Instead identify missing controls, risks, evidence and named actions. Always favour traceable records and human approval for safety-critical and contractual commitments."}]},
     {role:"user",content:[{type:"input_text",text:`Company records:\n${JSON.stringify(context)}\n\nRequest: ${message}`}]}
    ]
   })
  });
  if(!response.ok){
   const errorText=await response.text();
   console.error("[api/agent] OpenAI request failed",{status:response.status,error:errorText.slice(0,1000)});
   return NextResponse.json({reply:fallback(message,context),mode:"fallback"});
  }
  const data=await response.json();
  return NextResponse.json({reply:data.output_text||fallback(message,context),mode:"ai"});
 }catch{
  return NextResponse.json({error:"BuildNerve could not process this request."},{status:500});
 }
}
