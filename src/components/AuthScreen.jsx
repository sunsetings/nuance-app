import { useState } from "react";
import { supabase } from "../lib/supabase.js";
import { THEMES } from "../lib/constants.js";

export function AuthScreen({ theme, onAuth }) {
  const t = THEMES[theme] || THEMES.dark;
  const [mode, setMode] = useState("login"); // "login" | "signup" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async () => {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Check your email to confirm your account, then log in.");
        setMode("login");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
      }
    } catch (e) {
      setError(e.message || "Something went wrong — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!email) { setError("Enter your email address first."); return; }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setSuccess("Password reset email sent — check your inbox.");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: "40px 28px 28px",
      fontFamily: "'Lora',Georgia,serif",
      color: t.text, background: t.phoneBg,
      display: "flex", flexDirection: "column",
      minHeight: "100%", boxSizing: "border-box",
    }}>
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 36, marginTop: 20 }}>
        <div style={{ fontSize: 28, fontWeight: "bold", letterSpacing: "-0.5px", marginBottom: 6 }}>nuance.</div>
        <div style={{ fontSize: 12, color: t.textDim }}>
          {mode === "login" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset your password"}
        </div>
      </div>

      {/* Google button */}
      {mode !== "forgot" && (
        <>
          <button onClick={handleGoogle} disabled={loading} style={{
            width: "100%", padding: "13px",
            background: t.surface, border: `1px solid ${t.border2}`,
            borderRadius: 12, color: t.textMuted,
            fontSize: 13, fontFamily: "'Lora',Georgia,serif",
            cursor: "pointer", marginBottom: 16,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "all 0.2s",
          }}>
            <span style={{ fontSize: 16 }}>G</span> Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: t.border }} />
            <span style={{ fontSize: 11, color: t.textFaint }}>or</span>
            <div style={{ flex: 1, height: 1, background: t.border }} />
          </div>
        </>
      )}

      {/* Email */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: t.textDim, letterSpacing: "0.1em", marginBottom: 6 }}>EMAIL</div>
        <input
          type="email" value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          style={{
            width: "100%", padding: "12px 14px",
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 10, color: t.text, fontSize: 13,
            fontFamily: "'Lora',Georgia,serif", outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Password */}
      {mode !== "forgot" && (
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 10, color: t.textDim, letterSpacing: "0.1em", marginBottom: 6 }}>PASSWORD</div>
          <input
            type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="••••••••"
            style={{
              width: "100%", padding: "12px 14px",
              background: t.surface, border: `1px solid ${t.border}`,
              borderRadius: 10, color: t.text, fontSize: 13,
              fontFamily: "'Lora',Georgia,serif", outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      )}

      {/* Forgot password link */}
      {mode === "login" && (
        <div style={{ textAlign: "right", marginBottom: 18 }}>
          <button onClick={() => { setMode("forgot"); setError(null); }} style={{
            background: "none", border: "none",
            color: t.textDim, fontSize: 11,
            cursor: "pointer", fontFamily: "'Lora',Georgia,serif",
          }}>Forgot password?</button>
        </div>
      )}

      {/* Error / success */}
      {error && (
        <div style={{
          background: "#2a0a0a", border: "1px solid #6a2020",
          borderRadius: 8, padding: "10px 13px", marginBottom: 12,
          fontSize: 12, color: "#e88",
        }}>{error}</div>
      )}
      {success && (
        <div style={{
          background: t.highlight, border: `1px solid ${t.highlightBorder}`,
          borderRadius: 8, padding: "10px 13px", marginBottom: 12,
          fontSize: 12, color: t.accent,
        }}>{success}</div>
      )}

      {/* Main CTA */}
      <button onClick={mode === "forgot" ? handleForgot : handleSubmit} disabled={loading} style={{
        width: "100%", padding: "14px",
        background: t.accent, color: t.accentText,
        border: "none", borderRadius: 12,
        fontSize: 14, fontFamily: "'Lora',Georgia,serif",
        fontWeight: "bold", cursor: loading ? "default" : "pointer",
        opacity: loading ? 0.7 : 1, transition: "opacity 0.2s",
        marginBottom: 16, marginTop: mode === "login" ? 0 : 18,
      }}>
        {loading ? "…" : mode === "login" ? "Log in" : mode === "signup" ? "Create account" : "Send reset email"}
      </button>

      {/* Toggle mode */}
      <div style={{ textAlign: "center", fontSize: 12, color: t.textDim }}>
        {mode === "login" ? (
          <>Don't have an account?{" "}
            <button onClick={() => { setMode("signup"); setError(null); }} style={{ background: "none", border: "none", color: t.accent, cursor: "pointer", fontSize: 12, fontFamily: "'Lora',Georgia,serif" }}>Sign up</button>
          </>
        ) : mode === "signup" ? (
          <>Already have an account?{" "}
            <button onClick={() => { setMode("login"); setError(null); }} style={{ background: "none", border: "none", color: t.accent, cursor: "pointer", fontSize: 12, fontFamily: "'Lora',Georgia,serif" }}>Log in</button>
          </>
        ) : (
          <button onClick={() => { setMode("login"); setError(null); }} style={{ background: "none", border: "none", color: t.accent, cursor: "pointer", fontSize: 12, fontFamily: "'Lora',Georgia,serif" }}>← Back to login</button>
        )}
      </div>

      {/* Terms */}
      <div style={{ marginTop: "auto", paddingTop: 24, textAlign: "center", fontSize: 10, color: t.textFaint, lineHeight: 1.6 }}>
        By continuing you agree to our Terms of Service and Privacy Policy
      </div>
    </div>
  );
}
