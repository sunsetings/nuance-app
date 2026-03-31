import { useState } from "react";
import { THEMES, FREE_DAILY_CAP, PRO_DAILY_CAP, PRO_SAVE_LIMIT, PRO_SAVE_WARN, FREE_BOOKMARK_LIMIT, PRO_BOOKMARK_LIMIT } from "../lib/constants.js";
import { BottomNav } from "./UI.jsx";

// ─── ACCOUNT ─────────────────────────────────────────────────
export function AccountScreen({ navigate, isPremium, userTier, theme, setTheme, usageCount, user, onLogout, savedItems }) {
  const t = THEMES[theme] || THEMES.dark;
  const savedCount = savedItems?.length || 0;

  return (
    <div style={{ padding: "14px 20px 8px", fontFamily: "'Lora',Georgia,serif", color: t.text, background: t.phoneBg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, marginTop: 4 }}>
        <button onClick={() => navigate("home")} style={{ background: "none", border: "none", color: t.textMuted, fontSize: 18, cursor: "pointer" }}>←</button>
        <span style={{ fontSize: 16, fontWeight: "bold", letterSpacing: "-0.3px" }}>Account</span>
      </div>

      <div style={{ background: isPremium ? t.highlight : t.surface, borderRadius: 14, padding: "18px", marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontSize: 15, fontWeight: "bold", color: isPremium ? t.highlightText : t.text, marginBottom: 3 }}>{isPremium ? "✦ Pro Member" : "Free Plan"}</div>
        <div style={{ fontSize: 11, color: t.textFaint, letterSpacing: "0.04em" }}>{user?.email || "user@email.com"}</div>
        {!isPremium && (
          <button onClick={() => navigate("upgrade")} style={{ marginTop: 12, padding: "8px 20px", background: t.accent, color: t.accentText, border: "none", borderRadius: 8, fontSize: 12, fontWeight: "bold", cursor: "pointer", fontFamily: "'Lora',Georgia,serif" }}>✦ Go Pro →</button>
        )}
      </div>

      {[
        { label: "Daily refines", value: isPremium ? `${usageCount} / ${PRO_DAILY_CAP} today` : `${usageCount} / ${FREE_DAILY_CAP} today` },
        { label: "Tones", value: isPremium ? "All 20" : "4 of 20" },
        { label: "Dictation", value: isPremium ? "Enabled" : "Locked", locked: !isPremium },
        { label: "Bookmarked languages", value: isPremium ? `Up to ${PRO_BOOKMARK_LIMIT}` : `Up to ${FREE_BOOKMARK_LIMIT}` },
        { label: "Saved favourites", value: isPremium ? `${savedCount} / ${PRO_SAVE_LIMIT}` : "Locked", locked: !isPremium, warn: isPremium && savedCount >= PRO_SAVE_WARN },
      ].map((item, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${theme === "light" ? "#d0ccbf" : "#232323"}` }}>
          <span style={{ fontSize: 12, color: t.textMuted }}>{item.label}</span>
          <span style={{ fontSize: 12, color: item.locked ? t.textFaint : item.warn ? t.proTag : t.accent }}>
            {item.locked ? "Pro only" : item.value}
          </span>
        </div>
      ))}

      <div style={{ height: 14 }} />

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: t.textDim, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>Display</div>
        <div style={{ display: "flex", background: t.surface, borderRadius: 10, padding: 3, gap: 2 }}>
          {[{ id: "dark", icon: "🌙", label: "Dark" }, { id: "light", icon: "☀️", label: "Light" }].map(opt => (
            <button key={opt.id} onClick={() => setTheme(opt.id)} style={{ flex: 1, padding: "7px 2px", borderRadius: 8, border: "none", background: theme === opt.id ? t.surface2 : "transparent", color: theme === opt.id ? t.text : t.textFaint, fontSize: 10, fontFamily: "'Lora',Georgia,serif", cursor: "pointer", fontWeight: theme === opt.id ? "bold" : "normal", transition: "all 0.15s" }}>
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>

      <button onClick={onLogout} style={{ width: "100%", padding: "11px", background: "transparent", border: `1px solid ${t.border}`, borderRadius: 9, color: t.textDim, fontSize: 13, cursor: "pointer", fontFamily: "'Lora',Georgia,serif", marginBottom: 4 }}>
        Sign out
      </button>

      <BottomNav active="account" navigate={navigate} theme={theme} userTier={userTier} />
    </div>
  );
}

// ─── UPGRADE ─────────────────────────────────────────────────
export function UpgradeScreen({ navigate, setIsPremium, theme, user }) {
  const t = THEMES[theme] || THEMES.dark;
  return (
    <div style={{ padding: "16px 20px 28px", fontFamily: "'Lora',Georgia,serif", color: t.text, background: t.phoneBg }}>
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
        { label: "Tones", guest: "2", free: "4", pro: "All 20" },
        { label: "Languages", guest: "13", free: "13", pro: "52" },
        { label: "Saved messages", guest: "—", free: "3", pro: `${PRO_SAVE_LIMIT}` },
        { label: "Bookmarks", guest: "—", free: `${FREE_BOOKMARK_LIMIT}`, pro: `${PRO_BOOKMARK_LIMIT}` },
        { label: "Dictation", guest: "—", free: "—", pro: "✓" },
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

      <div>
        {[
          { label: "Annual", plan: "yearly", price: "$59.99 / year", sub: "$5.00 / mo — save 37%", highlight: true },
          { label: "Monthly", plan: "monthly", price: "$7.99 / month", sub: null },
        ].map(opt => (
          <button key={opt.label} onClick={async () => {
            const priceId = opt.plan === "yearly"
              ? import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID
              : import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID;
            const res = await fetch("/api/create-checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ priceId, userId: user?.id, userEmail: user?.email }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
          }} style={{ width: "100%", padding: opt.highlight ? "14px 18px" : "12px 18px", marginBottom: opt.highlight ? 7 : 8, background: opt.highlight ? t.accent : "transparent", border: opt.highlight ? "none" : `1px solid ${t.border}`, borderRadius: opt.highlight ? 12 : 10, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Lora',Georgia,serif", color: opt.highlight ? t.accentText : t.textMuted }}>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: opt.highlight ? 13 : 12, fontWeight: "bold", letterSpacing: "-0.2px" }}>{opt.label}</div>
              {opt.sub && <div style={{ fontSize: 10, opacity: 0.75, marginTop: 1 }}>{opt.sub}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: opt.highlight ? 14 : 12, fontWeight: opt.highlight ? "bold" : "normal" }}>{opt.price}</div>
            </div>
          </button>
        ))}
        <div style={{ textAlign: "center", fontSize: 10, color: t.textFaint, marginBottom: 12, letterSpacing: "0.03em" }}>Manage subscription anytime</div>
        <button onClick={() => navigate("account")} style={{ width: "100%", background: "none", border: "none", color: t.textFaint, fontSize: 11, cursor: "pointer", marginTop: 2, fontFamily: "'Lora',Georgia,serif", letterSpacing: "0.02em" }}>
          Sign up free instead
        </button>
      </div>
    </div>
  );
}// ─── SAVED FAVOURITES ────────────────────────────────────────
export function SavedScreen({ navigate, isPremium, userTier, theme, onOpenSaved, savedItems, setSavedItems, user }) {
  const t = THEMES[theme] || THEMES.dark;
  const items = savedItems || [];

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
    <div style={{ padding: "14px 20px 8px", fontFamily: "'Lora',Georgia,serif", color: t.text, background: t.phoneBg }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, marginTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate("home")} style={{ background: "none", border: "none", color: t.textMuted, fontSize: 18, cursor: "pointer" }}>←</button>
          <span style={{ fontSize: 16, fontWeight: "bold", letterSpacing: "-0.3px" }}>Saved</span>
        </div>
        {isPremium && <span style={{ fontSize: 10, color: t.textFaint, letterSpacing: "0.04em" }}>{items.length} / {PRO_SAVE_LIMIT}</span>}
      </div>

      {!isPremium ? (
        <div style={{ textAlign: "center", padding: "24px 16px" }}>
          <div style={{ position: "relative", marginBottom: 20 }}>
            <div style={{ background: t.surface, borderRadius: 10, padding: "12px 14px", opacity: 0.25, pointerEvents: "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ padding: "2px 8px", borderRadius: 8, background: t.highlight, fontSize: 10, color: theme === "light" ? "#2a6a2a" : "#78b86f" }}>Polite ×2</span>
                <span style={{ fontSize: 10, color: t.textFaint }}>Today</span>
              </div>
              <div style={{ fontSize: 12, color: t.textMuted }}>I need this report done by Friday…</div>
            </div>
          </div>
          <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 8, letterSpacing: "-0.2px" }}>Save your best translations</div>
          <div style={{ fontSize: 12, color: t.textDim, marginBottom: 22, lineHeight: 1.75 }}>Upgrade to save translations here and reopen them later.</div>
          <button onClick={() => navigate("upgrade")} style={{ width: "100%", padding: "12px", background: t.accent, color: t.accentText, border: "none", borderRadius: 10, fontSize: 13, fontWeight: "bold", cursor: "pointer", marginBottom: 8, fontFamily: "'Lora',Georgia,serif" }}>✦ Go Pro</button>
          <button onClick={() => navigate("home")} style={{ width: "100%", padding: "10px", background: "transparent", color: t.textFaint, border: "none", fontSize: 11, cursor: "pointer", fontFamily: "'Lora',Georgia,serif" }}>Back to home</button>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "36px 16px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>♡</div>
          <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 8 }}>Nothing saved yet</div>
          <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.65 }}>Tap the heart on any translation to save it here.</div>
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
      <BottomNav active="saved" navigate={navigate} theme={theme} userTier={userTier} />
    </div>
  );
}
