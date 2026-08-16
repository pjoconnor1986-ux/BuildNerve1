import { NextResponse } from "next/server";
export async function GET(){return NextResponse.json({items:[{at:new Date().toISOString(),actor:"BuildNerve",event:"Activity API online",project:"System"}]})}
export async function POST(req:Request){const body=await req.json();return NextResponse.json({ok:true,event:{id:crypto.randomUUID(),at:new Date().toISOString(),...body}},{status:201})}
