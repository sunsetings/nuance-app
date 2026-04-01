import { useState } from "react";
import { ALL_TONES, FREE_DAILY_CAP, FREE_BOOKMARK_LIMIT, FREE_SAVE_LIMIT, GUEST_TONES, PRO_BOOKMARK_LIMIT, PRO_DAILY_CAP, PRO_SAVE_LIMIT, PRO_SAVED_TONE_LIMIT, THEMES } from "../lib/constants.js";
import { BottomNav } from "./UI.jsx";
import { supabase } from "../lib/supabase.js";

// ─── ACCOUNT ─────────────────────────────────────────────────
export function AccountScreen({ navigate, isPremium, userTier, theme, themePreference = "system", setTheme, user, savedItems, usageCount = 0, onLogout }) {
  const t = THEMES[theme] || THEMES.dark;
  const savedCount = savedItems?.length || 0;
  const dailyRefineCap = isPremium ? PRO_DAILY_CAP : FREE_DAILY_CAP;
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState(null);
  const planRows = [
    { label: "Daily refines", value: `${usageCount}/${dailyRefineCap} a day`, accent: true },
    { label: "Tones", value: isPremium ? `All ${ALL_TONES.length}` : `4 of ${ALL_TONES.length}`, accent: true },
    { label: "Bookmarked languages", value: isPremium ? `Up to ${PRO_BOOKMARK_LIMIT}` : `Up to ${FREE_BOOKMARK_LIMIT}`, accent: true },
    { label: "Saved messages", value: isPremium ? `${savedCount} / ${PRO_SAVE_LIMIT}` : `${savedCount} / ${FREE_SAVE_LIMIT}`, accent: true },
    { label: "Saved tones", value: isPremium ? `Up to ${PRO_SAVED_TONE_LIMIT}` : "Pro only", accent: false },
  ];
  const displayOptions = [
    { id: "system", label: "System", icon: "◐" },
    { id: "dark", label: "Dark", icon: "☾" },
    { id: "light", label: "Light", icon: "☀" },
  ];

  const handleManagePlan = async () => {
    if (!user?.id || portalLoading) return;
    setPortalError(null);
    setPortalLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        navigate("signin_nav");
        return;
      }

      const res = await fetch("/api/create-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Couldn't open subscription settings.");
      }

      window.location.href = data.url;
    } catch (error) {
      setPortalError(error.message || "Couldn't open subscription settings.");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div style={{ padding: "14px 20px 8px", fontFamily: "'Lora',Georgia,serif", color: t.text, background: t.phoneBg, minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, marginTop: 4 }}>
          <button onClick={() => navigate("home")} style={{ background: "none", border: "none", color: t.textMuted, fontSize: 18, cursor: "pointer" }}>←</button>
          <span style={{ fontSize: 16, fontWeight: "bold", letterSpacing: "-0.3px" }}>Account</span>
        </div>

        <div style={{ background: t.surface, borderRadius: 14, padding: "18px 18px 16px", marginBottom: 18, textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: "bold", color: t.text, marginBottom: 3 }}>{isPremium ? "Pro Plan" : "Free Plan"}</div>
          <div style={{ fontSize: 11, color: t.textFaint, letterSpacing: "0.01em" }}>{user?.email || "user@email.com"}</div>
          {!isPremium && (
            <button onClick={() => navigate("upgrade")} style={{ marginTop: 12, padding: "8px 20px", background: t.accent, color: t.accentText, border: "none", borderRadius: 8, fontSize: 12, fontWeight: "bold", cursor: "pointer", fontFamily: "'Lora',Georgia,serif" }}>✦ Go Pro →</button>
          )}
        </div>

        {isPremium && (
          <div style={{ background: t.surface, borderRadius: 14, padding: "16px 16px 14px", marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: t.textDim, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>Subscription</div>
            <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.65, marginBottom: 10 }}>
              Change between monthly and annual billing, or cancel your Pro plan.
            </div>
            <button
              onClick={handleManagePlan}
              disabled={portalLoading}
              style={{
                width: "100%",
                padding: "11px 14px",
                background: t.accent,
                color: t.accentText,
                border: "none",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: "bold",
                cursor: portalLoading ? "default" : "pointer",
                fontFamily: "'Lora',Georgia,serif",
                opacity: portalLoading ? 0.7 : 1,
              }}
            >
              {portalLoading ? "Opening subscription settings…" : "Manage subscription"}
            </button>
            {portalError && (
              <div style={{ marginTop: 8, fontSize: 11, color: "#e88", lineHeight: 1.5 }}>
                {portalError}
              </div>
            )}
          </div>
        )}

        {planRows.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${theme === "light" ? "#d0ccbf" : "#232323"}` }}>
            <span style={{ fontSize: 12, color: t.textMuted }}>{item.label}</span>
            <span style={{ fontSize: 12, color: item.accent ? t.accent : t.textFaint, fontWeight: item.accent ? "bold" : "normal" }}>
              {item.value}
            </span>
          </div>
        ))}

        <div style={{ height: 14 }} />

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: t.textDim, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>Display</div>
          <div style={{ display: "flex", background: t.surface, borderRadius: 10, padding: 3, gap: 2, marginBottom: 8 }}>
            {displayOptions.map(opt => (
              <button key={opt.id} onClick={() => setTheme(opt.id)} style={{ flex: 1, padding: "7px 2px", borderRadius: 8, border: "none", background: themePreference === opt.id ? t.surface2 : "transparent", color: themePreference === opt.id ? t.text : t.textFaint, fontSize: 10, fontFamily: "'Lora',Georgia,serif", cursor: "pointer", fontWeight: themePreference === opt.id ? "bold" : "normal", transition: "all 0.15s" }}>
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            width: "100%",
            padding: "11px 14px",
            background: "transparent",
            border: `1px solid ${t.border}`,
            borderRadius: 10,
            color: t.textDim,
            fontSize: 12,
            cursor: "pointer",
            fontFamily: "'Lora',Georgia,serif",
            marginBottom: 12,
          }}
        >
          Sign out
        </button>
      </div>

      <div style={{ marginTop: "auto" }}>
        <BottomNav active="account" navigate={navigate} theme={theme} userTier={userTier} />
      </div>
    </div>
  );
}

// ─── UPGRADE ─────────────────────────────────────────────────
export function UpgradeScreen({ navigate, setIsPremium, theme, user, userTier }) {
  const t = THEMES[theme] || THEMES.dark;
  const [checkoutError, setCheckoutError] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleCheckout = async (plan) => {
    if (!user?.id) {
      navigate("signin_nav");
      return;
    }

    setCheckoutError(null);
    setLoadingPlan(plan);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        navigate("signin_nav");
        return;
      }

      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Couldn't open checkout. Please try again.");
      }

      window.location.href = data.url;
    } catch (error) {
      setCheckoutError(error.message || "Couldn't open checkout. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };
  return (
    <div style={{ padding: "16px 20px 28px", fontFamily: "'Lora',Georgia,serif", color: t.text, background: t.phoneBg, minHeight: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 8 }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 4, marginBottom: 14, height: 36 }}>
          <button onClick={() => navigate("home")} style={{ position: "absolute", left: 0, background: "none", border: "none", color: t.textMuted, fontSize: 18, cursor: "pointer", lineHeight: 1, padding: 0 }}>←</button>
          <span style={{ fontSize: 26, fontWeight: "bold", letterSpacing: "-0.5px", color: t.text }}>tonara.</span>
        </div>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: "bold", letterSpacing: "-0.3px", color: t.textMuted }}>Choose your plan</span>
        </div>

        <div style={{ marginBottom: 18, paddingBottom: 16, borderBottom: `1px solid ${theme === "light" ? "#d0ccbf" : "#232323"}` }}>
          {[
            "Avoid sounding awkward, rude, or off",
            "More tones, more languages, more control",
          ].map((line, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: i === 0 ? 7 : 0 }}>
              <span style={{ color: theme === "light" ? "#2a6a2a" : "#78b86f", fontSize: 12, marginTop: 1, flexShrink: 0 }}>·</span>
              <span style={{ fontSize: 12, color: i === 0 ? t.textMuted : t.textDim, lineHeight: 1.6 }}>{line}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "82px 1fr 1fr 1fr", gap: 5, marginBottom: 5, alignItems: "end" }}>
          <div />
          <div style={{ textAlign: "center", padding: "6px 4px", borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: t.textFaint, opacity: 0.6, letterSpacing: "0.04em" }}>Guest</div>
          </div>
          <div style={{ textAlign: "center", padding: "7px 4px", borderRadius: 8, background: t.surface }}>
            <div style={{ fontSize: 11, fontWeight: "bold", color: t.textMuted }}>Free</div>
          </div>
          <div style={{ textAlign: "center", padding: "7px 4px 6px", borderRadius: 10, background: t.highlight, border: `1px solid ${t.highlightBorder}` }}>
            <div style={{ fontSize: 8, color: theme === "light" ? "#2a6a2a" : "#78b86f", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>Most popular</div>
            <div style={{ fontSize: 12, fontWeight: "bold", color: t.highlightText, letterSpacing: "-0.2px" }}>Pro</div>
          </div>
        </div>

        {[
          { label: "Daily refines", guest: "10", free: `${FREE_DAILY_CAP}`, pro: `${PRO_DAILY_CAP}` },
          { label: "Tones", guest: `${GUEST_TONES.length}`, free: "4", pro: `All ${ALL_TONES.length}` },
          { label: "Languages", guest: "14", free: "14", pro: "53" },
          { label: "Saved messages", guest: "—", free: "3", pro: `${PRO_SAVE_LIMIT}` },
          { label: "Bookmarks", guest: "—", free: `${FREE_BOOKMARK_LIMIT}`, pro: `${PRO_BOOKMARK_LIMIT}` },
          { label: "Dictation", guest: "✓", free: "✓", pro: "✓" },
          { label: "Saved tones", guest: "—", free: "—", pro: "✓" },
        ].map((row, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "82px 1fr 1fr 1fr", gap: 5, marginBottom: 4, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: t.textDim, lineHeight: 1.3 }}>{row.label}</span>
            <div style={{ textAlign: "center", padding: "6px 2px", borderRadius: 6 }}><span style={{ fontSize: 10, color: t.textFaint, opacity: 0.55 }}>{row.guest}</span></div>
            <div style={{ textAlign: "center", padding: "6px 4px", borderRadius: 6, background: t.surface }}><span style={{ fontSize: 10, color: t.textMuted }}>{row.free}</span></div>
            <div style={{ textAlign: "center", padding: "6px 4px", borderRadius: 6, background: t.highlight, border: `1px solid ${t.highlightBorder}` }}><span style={{ fontSize: 10, color: t.accent }}>{row.pro}</span></div>
          </div>
        ))}

        <div style={{ height: 14 }} />

        <div style={{ textAlign: "center", fontSize: 10, color: t.textFaint, marginBottom: 12, letterSpacing: "0.03em" }}>
          Best for everyday use and important conversations
        </div>

        {checkoutError && (
          <div style={{ background: "#2a0a0a", border: "1px solid #6a2020", borderRadius: 10, padding: "10px 14px", marginBottom: 10, fontSize: 12, color: "#e88", textAlign: "center" }}>
            {checkoutError}
          </div>
        )}

        <div>
          {[
            { label: "Annual", plan: "yearly", price: "$59.99 / year", sub: "$5.00 / mo — save 37%", highlight: true },
            { label: "Monthly", plan: "monthly", price: "$7.99 / month", sub: null },
          ].map(opt => (
            <button key={opt.label} onClick={() => handleCheckout(opt.plan)} disabled={loadingPlan !== null} style={{ width: "100%", padding: opt.highlight ? "14px 18px" : "12px 18px", marginBottom: opt.highlight ? 7 : 8, background: opt.highlight ? t.accent : "transparent", border: opt.highlight ? "none" : `1px solid ${t.border}`, borderRadius: opt.highlight ? 12 : 10, cursor: loadingPlan ? "default" : "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Lora',Georgia,serif", color: opt.highlight ? t.accentText : t.textMuted, opacity: loadingPlan && loadingPlan !== opt.plan ? 0.55 : 1 }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: opt.highlight ? 13 : 12, fontWeight: "bold", letterSpacing: "-0.2px" }}>{opt.label}</div>
                {opt.sub && <div style={{ fontSize: 10, opacity: 0.75, marginTop: 1 }}>{opt.sub}</div>}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: opt.highlight ? 14 : 12, fontWeight: opt.highlight ? "bold" : "normal" }}>
                  {loadingPlan === opt.plan ? "Loading…" : opt.price}
                </div>
              </div>
            </button>
          ))}
          <div style={{ textAlign: "center", fontSize: 10, color: t.textFaint, marginBottom: userTier === "guest" ? 12 : 0, letterSpacing: "0.03em" }}>Manage subscription anytime</div>
          {userTier === "guest" && (
            <button onClick={() => navigate("signin_nav")} style={{ width: "100%", background: "none", border: "none", color: t.textFaint, fontSize: 11, cursor: "pointer", marginTop: 2, fontFamily: "'Lora',Georgia,serif", letterSpacing: "0.02em" }}>
              Sign up free instead
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CapScreen({ navigate, userTier, theme }) {
  const t = THEMES[theme] || THEMES.dark;
  const isGuest = userTier === "guest";
  const isPro = userTier === "pro";
  const variant = isGuest
    ? {
        title: "You've used today's 10 refines",
        subtitle: "Sign up free — 30 seconds, 30 refines a day.",
        primaryLabel: "Sign up free — 30 refines/day",
        primaryAction: () => navigate("signin_cap"),
        secondaryLabel: "View Pro plan →",
        secondaryAction: () => navigate("upgrade"),
        secondaryAccent: false,
      }
    : isPro
      ? {
          title: "You've used today's 500 refines",
          subtitle: "Come back tomorrow for another 500 refines.",
          primaryLabel: null,
          primaryAction: null,
          secondaryLabel: null,
          secondaryAction: null,
          secondaryAccent: false,
        }
      : {
          title: "You've used today's 30 refines",
          subtitle: "Upgrade to Pro for 500 refines a day.",
          primaryLabel: null,
          primaryAction: null,
          secondaryLabel: "✦ Upgrade to Pro — 500/day",
          secondaryAction: () => navigate("upgrade"),
          secondaryAccent: true,
        };

  return (
    <div style={{ padding: "14px 20px 28px", color: t.text, background: t.phoneBg, minHeight: "100%", display: "flex", flexDirection: "column", fontFamily: "'Lora',Georgia,serif" }}>
      <button onClick={() => navigate("home")} style={{ background: "none", border: "none", color: t.textDim, fontSize: 18, cursor: "pointer", alignSelf: "flex-start", marginTop: 4, marginBottom: 20 }}>←</button>

      <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingBottom: 70 }}>
        <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 10, letterSpacing: "-0.2px" }}>
          {variant.title}
        </div>
        <div style={{ fontSize: 12, color: t.textDim, lineHeight: 1.75, marginBottom: 8, maxWidth: 270 }}>
          {variant.subtitle}
        </div>
        <div style={{ height: 20 }} />

        {variant.primaryLabel && variant.primaryAction && (
          <button onClick={variant.primaryAction} style={{ width: "100%", maxWidth: 270, padding: "13px", background: t.accent, color: t.accentText, border: "none", borderRadius: 11, fontSize: 13, fontWeight: "bold", cursor: "pointer", marginBottom: 8, fontFamily: "'Lora',Georgia,serif" }}>
            {variant.primaryLabel}
          </button>
        )}

        {variant.secondaryLabel && variant.secondaryAction && (
          <button onClick={variant.secondaryAction} style={{ width: "100%", maxWidth: 270, padding: "11px", background: variant.secondaryAccent ? t.accent : "transparent", border: variant.secondaryAccent ? "none" : `1px solid ${t.border}`, borderRadius: 11, fontSize: 12, fontWeight: variant.secondaryAccent ? "bold" : "normal", cursor: "pointer", color: variant.secondaryAccent ? t.accentText : t.textDim, marginBottom: 8, fontFamily: "'Lora',Georgia,serif" }}>
            {variant.secondaryLabel}
          </button>
        )}

        <button onClick={() => navigate("home")} style={{ background: "none", border: "none", color: t.textFaint, fontSize: 11, cursor: "pointer", fontFamily: "'Lora',Georgia,serif" }}>
          Come back tomorrow
        </button>
      </div>
    </div>
  );
}

// ─── SAVED FAVOURITES ────────────────────────────────────────
export function SavedScreen({ navigate, isPremium, userTier, theme, onOpenSaved, savedItems, setSavedItems, user }) {
  const t = THEMES[theme] || THEMES.dark;
  const items = savedItems || [];
  const isGuest = userTier === "guest";
  const saveLimit = isPremium ? PRO_SAVE_LIMIT : FREE_SAVE_LIMIT;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  return (
    <div style={{ padding: "14px 20px 8px", fontFamily: "'Lora',Georgia,serif", color: t.text, background: t.phoneBg, minHeight: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, marginTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate("home")} style={{ background: "none", border: "none", color: t.textMuted, fontSize: 18, cursor: "pointer" }}>←</button>
          <span style={{ fontSize: 16, fontWeight: "bold", letterSpacing: "-0.3px" }}>Saved</span>
        </div>
        {!isGuest && <span style={{ fontSize: 10, color: t.textFaint, letterSpacing: "0.04em" }}>{items.length} / {saveLimit}</span>}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 8 }}>
      {isGuest ? (
        <div style={{ textAlign: "center", padding: "8px 16px 0" }}>
          <div style={{ position: "relative", marginBottom: 22, marginTop: 8 }}>
            <div style={{ background: t.surface, borderRadius: 10, padding: "10px 14px", opacity: 0.25, pointerEvents: "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ padding: "2px 8px", borderRadius: 8, background: t.highlight, fontSize: 10, color: theme === "light" ? "#2a6a2a" : "#78b86f" }}>Polite ×2</span>
                <span style={{ fontSize: 10, color: t.textFaint }}>Today</span>
              </div>
              <div style={{ fontSize: 12, color: t.textMuted }}>I need this report done by Friday...</div>
            </div>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: t.textFaint }}>🔒</div>
          </div>
          <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 8, letterSpacing: "-0.2px" }}>Save your best translations</div>
          <div style={{ fontSize: 12, color: t.textDim, marginBottom: 22, lineHeight: 1.75 }}>Sign up free to save up to 3 translations. Reopen any time to keep refining.</div>
          <button onClick={() => navigate("signin_save")} style={{ width: "100%", padding: "12px", background: t.accent, color: t.accentText, border: "none", borderRadius: 10, fontSize: 13, fontWeight: "bold", cursor: "pointer", marginBottom: 10, fontFamily: "'Lora',Georgia,serif" }}>Sign up free</button>
          <button onClick={() => navigate("upgrade")} style={{ width: "100%", padding: "10px", background: "transparent", color: t.textFaint, border: "none", fontSize: 11, cursor: "pointer", fontFamily: "'Lora',Georgia,serif" }}>View Pro plan →</button>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "36px 16px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>♡</div>
          <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 8 }}>Nothing saved yet</div>
          <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.65 }}>
            {isPremium ? "Tap the heart on any translation to save it here." : `Tap the heart on any translation to save up to ${FREE_SAVE_LIMIT} here.`}
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 10, color: t.textFaint, marginBottom: 12, letterSpacing: "0.04em" }}>Tap any item to reopen and refine.</div>
          {items.map(item => (
            <button key={item.id} onClick={() => onOpenSaved({
              ...item,
              tone: item.tone,
              toneCount: item.tone_count,
              fromLang: item.from_lang,
              toLang: item.to_lang,
            })} style={{ width: "100%", background: t.surface, border: "none", borderRadius: 10, padding: "11px 14px", marginBottom: 6, textAlign: "left", cursor: "pointer", fontFamily: "'Lora',Georgia,serif" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {item.mode === "refine"
                    ? <span style={{ padding: "2px 8px", borderRadius: 8, background: t.highlight, fontSize: 10, color: theme === "light" ? "#2a6a2a" : "#78b86f", letterSpacing: "0.04em" }}>{item.tone}{item.tone_count > 1 ? ` ×${item.tone_count}` : ""}</span>
                    : <span style={{ padding: "2px 8px", borderRadius: 8, background: t.surface2, fontSize: 10, color: t.textFaint, letterSpacing: "0.04em" }}>Quick</span>
                  }
                  <span style={{ fontSize: 10, color: t.textFaint }}>→ {item.to_lang}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, color: t.textFaint }}>{formatDate(item.created_at)}</span>
                  <span style={{ fontSize: 12, color: t.textDim }}>›</span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.5 }}>
                {item.original?.substring(0, 60)}{item.original?.length > 60 ? "…" : ""}
              </div>
            </button>
          ))}
        </>
      )}
      </div>
      <div style={{ marginTop: "auto" }}>
        <BottomNav active="saved" navigate={navigate} theme={theme} userTier={userTier} />
      </div>
    </div>
  );
}
