"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function JoinTeam() {
  const [token, setToken] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
    const supabase = createClient();
    supabase?.auth.getUser().then(({ data }) => setUserEmail(data.user?.email || ""));
  }, []);

  async function authenticate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createClient();
    if (!supabase) {
      setMessage("Account services are unavailable.");
      setBusy(false);
      return;
    }
    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (result.error) {
      setMessage(result.error.message);
      setBusy(false);
      return;
    }
    if (mode === "signup") {
      setMessage("Account created. Verify your email, then reopen this invitation link.");
      setBusy(false);
      return;
    }
    setUserEmail(result.data.user?.email || email);
    setBusy(false);
  }

  async function accept(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createClient();
    if (!supabase) {
      setMessage("Account services are unavailable.");
      setBusy(false);
      return;
    }
    const { error } = await supabase.rpc("accept_team_invitation", {
      p_token: token,
      p_full_name: name,
    });
    if (error) {
      setMessage(error.message);
      setBusy(false);
      return;
    }
    location.href = "/";
  }

  return (
    <main className="authPage">
      <aside className="authAside onboardingAside">
        <div className="authLogo"><span>BN</span><b>BuildNerve</b></div>
        <div className="authPitch">
          <span className="authKicker">TEAM INVITATION</span>
          <h1>Join your company&apos;s BuildNerve workspace.</h1>
          <p>Work from the same projects, priorities and evidence as the rest of your team.</p>
        </div>
        <div className="authProof">
          <span>✓ Role-controlled access</span><span>✓ Private company records</span><span>✓ Complete activity trail</span>
        </div>
      </aside>
      <section className="authCard">
        <div className="authBrand"><b>BN</b><div><h1>BuildNerve</h1><p>Team invitation</p></div></div>
        <span className="authKicker">SECURE WORKSPACE ACCESS</span>
        <h2>{userEmail ? "Accept your invitation" : "Sign in to continue"}</h2>
        <p className="authIntro">{userEmail ? "Signed in as " + userEmail + ". Your email must match the invitation." : "Use the email address that your Company Owner invited."}</p>
        {!token ? (
          <p className="authMsg" role="alert">This invitation link is incomplete.</p>
        ) : userEmail ? (
          <form onSubmit={accept}>
            <label>Your full name<input required minLength={2} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Smith" /></label>
            <button className="authPrimary" disabled={busy}>{busy ? "Joining workspace…" : "Accept invitation"}</button>
          </form>
        ) : (
          <>
            <form onSubmit={authenticate}>
              <label>Email address<input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Invited email address" /></label>
              <label>Password<input type="password" required minLength={8} autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" /></label>
              <button className="authPrimary" disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
            </form>
            <button className="authSwitch" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(""); }}>{mode === "signin" ? "Need an account? Create one" : "Already registered? Sign in"}</button>
          </>
        )}
        {message && <p className="authMsg" role="alert">{message}</p>}
      </section>
    </main>
  );
}
