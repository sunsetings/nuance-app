import { useState } from "react";
import { supabase } from "../lib/supabase.js";
import { THEMES } from "../lib/constants.js";
import { createI18n, isRTLLocale } from "../lib/i18n.js";

const LS_POST_AUTH_ROUTE = "tonara_post_auth_route";

const SIGNIN_CONTEXT = {
  nav: { title: "Create your free account", sub: "Save messages, bookmark languages, and get 30 refines a day." },
  save: { title: "Save this translation", sub: "Free account — save up to 3 translations." },
  bm: { title: "Bookmark languages", sub: "Sign up free — bookmark 1 language for quick access." },
  tone: { title: "Create your free account", sub: "Quick sign up to unlock all 5 Free tones, save messages, and get 30 refines a day." },
  cap: { title: "You’ve used today’s 10 guest refines", sub: "Create a free account for 30 refines a day, 5 tones, and saved messages." },
  default: { title: "Welcome to tonara.", sub: "" },
};

const POST_AUTH_ROUTE = {
  nav: "home",
  save: "home",
  bm: "home",
  tone: "home",
  cap: "home",
  default: "home",
};

export function AuthScreen({ theme, onAuth, navigate, context = "nav", navContext = null }) {
  const t = THEMES[theme] || THEMES.dark;
  const copy = createI18n();
  const isRTL = isRTLLocale(copy.locale);
  const [mode, setMode] = useState("signup"); // "login" | "signup" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const ctx = SIGNIN_CONTEXT[context] || SIGNIN_CONTEXT.default;
  const showBenefits = context === "nav" || context === "tone";
  const isSignup = mode === "signup";
  const localizedContext = copy.t(`auth.contexts.${context}`) || copy.t("auth.contexts.default");
  const displayTitle = mode === "forgot" ? copy.t("auth.resetPassword") : isSignup ? copy.t("auth.createFreeAccount") : copy.t("auth.welcomeBack");
  const displaySubtitle = mode === "forgot"
    ? copy.t("auth.resetPasswordHelp")
    : isSignup
      ? (localizedContext?.sub || ctx.sub || copy.t("auth.contexts.nav.sub"))
      : copy.t("auth.signinSubtitle");
  const benefitItems = context === "tone"
    ? [
        { icon: "◈", text: copy.t("auth.benefitTone1") },
        { icon: "◐", text: copy.t("auth.benefitTone2") },
      ]
    : [
        { icon: "◈", text: copy.t("auth.benefitNav1") },
        { icon: "◐", text: copy.t("auth.benefitNav2") },
      ];

  const resolvePostAuthTarget = ({ forOAuth = false } = {}) => {
    const returnScreen = typeof navContext?.returnScreen === "string" ? navContext.returnScreen : null;

    if (forOAuth) {
      if (returnScreen === "account") return "account";
      return POST_AUTH_ROUTE[context] || POST_AUTH_ROUTE.default;
    }

    if (returnScreen) return returnScreen;
    return POST_AUTH_ROUTE[context] || POST_AUTH_ROUTE.default;
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      setError(copy.t("auth.enterEmailPassword"));
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError(copy.t("auth.passwordsDoNotMatch"));
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess(copy.t("auth.checkEmailConfirm"));
        setMode("login");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.user);
        navigate?.(resolvePostAuthTarget());
      }
    } catch (e) {
      setError(e.message || "Something went wrong — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!email) { setError(copy.t("auth.enterEmailFirst")); return; }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setSuccess(copy.t("auth.passwordResetSent"));
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
      localStorage.setItem(LS_POST_AUTH_ROUTE, resolvePostAuthTarget({ forOAuth: true }));
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/app` },
      });
      if (error) throw error;
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: "14px 22px 28px",
      fontFamily: "'Lora',Georgia,serif",
      color: t.text, background: t.phoneBg,
      display: "flex", flexDirection: "column",
      minHeight: "100%", boxSizing: "border-box",
      direction: isRTL ? "rtl" : "ltr",
    }} dir={isRTL ? "rtl" : "ltr"}>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 8 }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, marginTop: 6, height: 36 }}>
          <button onClick={() => navigate?.("__back")} style={{ position: "absolute", left: isRTL ? "auto" : 0, right: isRTL ? 0 : "auto", background: "none", border: "none", color: t.textDim, fontSize: 18, cursor: "pointer", lineHeight: 1, padding: 0 }}>{isRTL ? "→" : "←"}</button>
          <span style={{ fontSize: 24, fontWeight: "bold", letterSpacing: "-0.5px" }}>tonara.</span>
        </div>

          <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 17, fontWeight: "bold", marginBottom: 7, letterSpacing: "-0.2px" }}>
            {displayTitle}
          </div>
          <div style={{ fontSize: 12, color: t.textDim, lineHeight: 1.75, maxWidth: 290, margin: "0 auto" }}>
            {displaySubtitle}
          </div>
        </div>

        {showBenefits && mode !== "forgot" && (
          <div style={{ marginBottom: 22, padding: "15px 16px", background: t.surface, borderRadius: 12 }}>
            {benefitItems.map((item, index, arr) => (
              <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: index < arr.length - 1 ? 11 : 0, marginBottom: index < arr.length - 1 ? 11 : 0, borderBottom: index < arr.length - 1 ? `1px solid ${t.borderLight}` : "none" }}>
                <span style={{ fontSize: 13, color: t.accentDim, width: 16, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: 12, color: t.textMuted, textAlign: isRTL ? "right" : "left" }}>{item.text}</span>
              </div>
            ))}
          </div>
        )}

        {mode !== "forgot" && (
          <div style={{ display: "flex", background: t.surface, borderRadius: 10, padding: 3, gap: 2, marginBottom: 12 }}>
            {[{ id: "signup", label: copy.t("auth.createAccount") }, { id: "login", label: copy.t("auth.signIn") }].map(opt => (
              <button key={opt.id} onClick={() => { setMode(opt.id); setError(null); }} style={{
                flex: 1, padding: "8px 6px", borderRadius: 8, border: "none",
                background: mode === opt.id ? t.surface2 : "transparent",
                color: mode === opt.id ? t.text : t.textFaint,
                fontSize: 12, cursor: "pointer", fontWeight: mode === opt.id ? "bold" : "normal",
                fontFamily: "'Lora',Georgia,serif",
                lineHeight: 1.15,
                minHeight: 34,
              }}>
                {opt.label}
              </button>
            ))}
          </div>
        )}

      {/* Google button */}
        {mode !== "forgot" && (
          <>
            <button onClick={handleGoogle} disabled={loading} style={{
              width: "100%", padding: "12px 16px",
              background: t.surface, border: `1px solid ${t.border2}`,
              borderRadius: 12, color: t.text,
              fontSize: 13, fontFamily: "'Lora',Georgia,serif",
              cursor: "pointer", marginBottom: 16,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "all 0.2s",
              lineHeight: 1.2,
            }}>
              <span style={{ fontSize: 14, fontWeight: "bold", fontFamily: "sans-serif", color: t.textDim }}>G</span>
              {copy.t("auth.continueWithGoogle")}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, background: t.border }} />
              <span style={{ fontSize: 11, color: t.textFaint }}>{copy.t("auth.or")}</span>
              <div style={{ flex: 1, height: 1, background: t.border }} />
            </div>
          </>
        )}

        <div style={{ marginBottom: 8 }}>
          <input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={copy.t("auth.emailAddress")}
            style={{
              width: "100%", padding: "11px 14px",
              background: t.surface, border: `1px solid ${t.border}`,
              borderRadius: 10, color: t.text, fontSize: 13,
              fontFamily: "'Lora',Georgia,serif", outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {mode !== "forgot" && (
          <div style={{ marginBottom: mode === "signup" ? 8 : 8 }}>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder={copy.t("auth.password")}
              style={{
                width: "100%", padding: "11px 14px",
                background: t.surface, border: `1px solid ${t.border}`,
                borderRadius: 10, color: t.text, fontSize: 13,
                fontFamily: "'Lora',Georgia,serif", outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}

        {mode === "signup" && (
          <div style={{ marginBottom: 14 }}>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder={copy.t("auth.confirmPassword")}
              style={{
                width: "100%", padding: "11px 14px",
                background: t.surface, border: `1px solid ${t.border}`,
                borderRadius: 10, color: t.text, fontSize: 13,
                fontFamily: "'Lora',Georgia,serif", outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}

        {mode === "login" && (
          <div style={{ textAlign: "right", marginBottom: 14, display: "none" }}>
            <button onClick={() => { setMode("forgot"); setError(null); }} style={{
              background: "none", border: "none",
              color: t.textDim, fontSize: 11,
              cursor: "pointer", fontFamily: "'Lora',Georgia,serif",
            }}>{copy.t("auth.forgotPassword")}</button>
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
          width: "100%", padding: "13px",
          background: t.accent, color: t.accentText,
          border: "none", borderRadius: 12,
          fontSize: 14, fontFamily: "'Lora',Georgia,serif",
          fontWeight: "bold", cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.7 : 1, transition: "opacity 0.2s",
          marginBottom: 10, marginTop: mode === "forgot" ? 18 : 0,
          letterSpacing: "-0.1px",
        }}>
          {loading ? copy.t("auth.loading") : mode === "login" ? copy.t("auth.signIn") : mode === "signup" ? copy.t("auth.createFreeAccountButton") : copy.t("auth.sendResetEmail")}
        </button>
      </div>

      <div style={{ textAlign: "center", marginTop: "auto", paddingTop: 14 }}>
        {mode === "forgot" ? (
          <button onClick={() => { setMode("login"); setError(null); setSuccess(null); }} style={{ background: "none", border: "none", color: t.textFaint, cursor: "pointer", fontSize: 11, fontFamily: "'Lora',Georgia,serif" }}>← {copy.t("auth.backToSignIn")}</button>
        ) : (
          <button onClick={() => navigate?.("home")} style={{ background: "none", border: "none", color: t.textFaint, fontSize: 11, cursor: "pointer", fontFamily: "'Lora',Georgia,serif" }}>{copy.t("auth.continueAsGuest")}</button>
        )}
      </div>
    </div>
  );
}
