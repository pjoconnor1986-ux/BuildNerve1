const checks = [
  ["NEXT_PUBLIC_SUPABASE_URL", Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL), "Required for accounts and database"],
  ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY), "Required for Supabase client/auth"],
  ["OPENAI_API_KEY", Boolean(process.env.OPENAI_API_KEY), "Optional: enables live BuildNerve AI"],
];
console.log("\nBuildNerve launch doctor\n------------------------");
let fatal=false;
for (const [name,ok,note] of checks){
  console.log(`${ok?"✓":"✗"} ${name} — ${note}`);
  if(!ok && !name.startsWith("OPENAI_")) fatal=true;
}
console.log(fatal?"\nNOT READY: add the missing required environment variables.":"\nEnvironment looks ready for a live deployment.");
process.exitCode=fatal?1:0;
