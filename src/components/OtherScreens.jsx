import { useState } from "react";
import { ALL_TONES, FREE_DAILY_CAP, FREE_BOOKMARK_LIMIT, FREE_SAVE_LIMIT, FREE_TONES, GUEST_TONES, PRO_BOOKMARK_LIMIT, PRO_DAILY_CAP, PRO_SAVE_LIMIT, PRO_SAVED_TONE_LIMIT, THEMES, parseToneSelection } from "../lib/constants.js";
import { BottomNav } from "./UI.jsx";
import { supabase } from "../lib/supabase.js";
import { createI18n } from "../lib/i18n.js";

// ─── ACCOUNT ─────────────────────────────────────────────────
export function AccountScreen({ navigate, isPremium, userTier, theme, themePreference = "system", setTheme, localePreference = "device", setLocalePreference, user, savedItems, usageCount = 0, onLogout }) {
  const t = THEMES[theme] || THEMES.dark;
  const copy = createI18n();
  const savedCount = savedItems?.length || 0;
  const dailyRefineCap = isPremium ? PRO_DAILY_CAP : FREE_DAILY_CAP;
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState(null);
  const planRows = [
    { label: copy.t("account.messagesRefinedToday"), value: copy.t("account.perDay", { count: usageCount, cap: dailyRefineCap }), accent: true },
    { label: copy.t("account.tonesAvailable"), value: isPremium ? copy.t("account.all", { count: ALL_TONES.length }) : copy.t("account.ofTotal", { count: FREE_TONES.length, total: ALL_TONES.length }), accent: true },
    { label: copy.t("account.bookmarkedLanguages"), value: copy.t("account.upTo", { count: isPremium ? PRO_BOOKMARK_LIMIT : FREE_BOOKMARK_LIMIT }), accent: true },
    { label: copy.t("account.savedMessages"), value: isPremium ? `${savedCount} / ${PRO_SAVE_LIMIT}` : `${savedCount} / ${FREE_SAVE_LIMIT}`, accent: true },
    { label: copy.t("account.savedTones"), value: isPremium ? copy.t("account.upTo", { count: PRO_SAVED_TONE_LIMIT }) : copy.t("account.proOnly"), accent: false },
  ];
  const displayOptions = [
    { id: "system", label: copy.t("account.system"), icon: "◐" },
    { id: "dark", label: copy.t("account.dark"), icon: "☾" },
    { id: "light", label: copy.t("account.light"), icon: "☀" },
  ];
  const languageOptions = [
    { id: "device", label: copy.t("account.followDevice") },
    { id: "en", label: copy.t("account.english") },
    { id: "ko", label: copy.t("account.korean") },
    { id: "ja", label: copy.t("account.japanese") },
    { id: "es", label: copy.t("account.spanish") },
    { id: "ru", label: copy.t("account.russian") },
    { id: "ar", label: copy.t("account.arabic") },
    { id: "fr", label: copy.t("account.french") },
    { id: "de", label: copy.t("account.german") },
    { id: "vi", label: copy.t("account.vietnamese") },
    { id: "zh-cn", label: copy.t("account.chineseSimplified") },
    { id: "zh-tw", label: copy.t("account.chineseTraditional") },
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
        throw new Error(data.error || copy.t("account.manageSubscriptionError"));
      }

      window.location.href = data.url;
    } catch (error) {
      setPortalError(error.message || copy.t("account.manageSubscriptionError"));
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div style={{ padding: "14px 20px 8px", fontFamily: "'Lora',Georgia,serif", color: t.text, background: t.phoneBg, minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, marginTop: 4 }}>
          <button onClick={() => navigate("home")} style={{ background: "none", border: "none", color: t.textMuted, fontSize: 18, cursor: "pointer" }}>←</button>
          <span style={{ fontSize: 16, fontWeight: "bold", letterSpacing: "-0.3px" }}>{copy.t("account.title")}</span>
        </div>

        <div style={{ background: t.surface, borderRadius: 14, padding: "18px 18px 16px", marginBottom: 18, textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: "bold", color: t.text, marginBottom: 3 }}>{isPremium ? copy.t("account.proPlan") : copy.t("account.freePlan")}</div>
          <div style={{ fontSize: 11, color: t.textDim, marginBottom: 3 }}>{isPremium ? copy.t("account.proSubtitle") : copy.t("account.freeSubtitle")}</div>
          <div style={{ fontSize: 11, color: t.textFaint, letterSpacing: "0.01em" }}>{user?.email || "user@email.com"}</div>
          {!isPremium && (
            <button onClick={() => navigate("upgrade")} style={{ marginTop: 12, padding: "8px 20px", background: t.accent, color: t.accentText, border: "none", borderRadius: 8, fontSize: 12, fontWeight: "bold", cursor: "pointer", fontFamily: "'Lora',Georgia,serif" }}>{copy.t("account.upgradeToPro")}</button>
          )}
        </div>

        {isPremium && (
          <div style={{ background: t.surface, borderRadius: 14, padding: "16px 16px 14px", marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: t.textDim, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>{copy.t("account.subscription")}</div>
            <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.65, marginBottom: 10 }}>
              {copy.t("account.changeBilling")}
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
              {portalLoading ? copy.t("account.openingSettings") : copy.t("account.manageSubscription")}
            </button>
            {portalError && (
              <div style={{ marginTop: 8, fontSize: 11, color: "#e88", lineHeight: 1.5 }}>
                {portalError}
              </div>
            )}
          </div>
        )}

        {planRows.map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: `1px solid ${theme === "light" ? "#d0ccbf" : "#232323"}` }}>
            <span style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.35, minWidth: 0, flex: 1 }}>{item.label}</span>
            <span style={{ fontSize: 12, color: item.accent ? t.accent : t.textFaint, fontWeight: item.accent ? "bold" : "normal", lineHeight: 1.35, textAlign: "right", maxWidth: "44%", flexShrink: 0 }}>
              {item.value}
            </span>
          </div>
        ))}

        <div style={{ height: 14 }} />

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: t.textDim, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>{copy.t("account.display")}</div>
          <div style={{ display: "flex", background: t.surface, borderRadius: 10, padding: 3, gap: 2, marginBottom: 8 }}>
            {displayOptions.map(opt => (
              <button key={opt.id} onClick={() => setTheme(opt.id)} style={{ flex: 1, padding: "7px 4px", borderRadius: 8, border: "none", background: themePreference === opt.id ? t.surface2 : "transparent", color: themePreference === opt.id ? t.text : t.textFaint, fontSize: 9.5, fontFamily: "'Lora',Georgia,serif", cursor: "pointer", fontWeight: themePreference === opt.id ? "bold" : "normal", transition: "all 0.15s", lineHeight: 1.15 }}>
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: t.textDim, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>{copy.t("account.language")}</div>
          <div style={{ position: "relative" }}>
            <select
              value={localePreference}
              onChange={(e) => setLocalePreference?.(e.target.value)}
              style={{
                width: "100%",
                appearance: "none",
                WebkitAppearance: "none",
                background: t.surface,
                color: t.text,
                border: `1px solid ${t.border}`,
                borderRadius: 12,
                padding: "11px 40px 11px 14px",
                fontSize: 12,
                fontFamily: "'Lora',Georgia,serif",
                outline: "none",
                cursor: "pointer",
                lineHeight: 1.2,
              }}
            >
              {languageOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: t.textFaint,
                fontSize: 10,
                pointerEvents: "none",
              }}
            >
              ▾
            </span>
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
          {copy.t("account.signOut")}
        </button>
      </div>

      <div style={{ marginTop: "auto" }}>
        <BottomNav active="account" navigate={navigate} theme={theme} userTier={userTier} />
      </div>
    </div>
  );
}

// ─── UPGRADE ─────────────────────────────────────────────────
export function UpgradeScreen({ navigate, setIsPremium, theme, user, userTier, context = null }) {
  const t = THEMES[theme] || THEMES.dark;
  const copy = createI18n();
  const [checkoutError, setCheckoutError] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const isCurrentPro = userTier === "pro";

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
        throw new Error(data.error || copy.t("upgrade.checkoutError"));
      }

      window.location.href = data.url;
    } catch (error) {
      setCheckoutError(error.message || copy.t("upgrade.checkoutError"));
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
          <span style={{ fontSize: 16, fontWeight: "bold", letterSpacing: "-0.3px", color: t.textMuted }}>{isCurrentPro ? copy.t("upgrade.youreOnPro") : copy.t("upgrade.chooseYourPlan")}</span>
        </div>

        <div style={{ marginBottom: isCurrentPro ? 22 : 18, paddingBottom: 16, borderBottom: `1px solid ${theme === "light" ? "#d0ccbf" : "#232323"}` }}>
          {(isCurrentPro
            ? [
                copy.t("upgrade.currentProLine1", { count: ALL_TONES.length }),
                copy.t("upgrade.currentProLine2"),
              ]
            : context === "tone"
              ? [
                  copy.t("upgrade.toneLine1", { count: ALL_TONES.length }),
                  copy.t("upgrade.toneLine2"),
                ]
              : [
                  copy.t("upgrade.defaultLine1"),
                  copy.t("upgrade.defaultLine2"),
                ]).map((line, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: i === 0 ? 7 : 0 }}>
              <span style={{ color: theme === "light" ? "#2a6a2a" : "#78b86f", fontSize: 12, marginTop: 1, flexShrink: 0 }}>·</span>
              <span style={{ fontSize: 12, color: i === 0 ? t.textMuted : t.textDim, lineHeight: 1.6 }}>{line}</span>
            </div>
          ))}
        </div>

        {isCurrentPro ? (
          <div>
            <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
              <div style={{ fontSize: 10, color: t.textFaint, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                {copy.t("upgrade.proStatus")}
              </div>
              <div style={{ fontSize: 16, fontWeight: "bold", color: t.textMuted, marginBottom: 3 }}>
                {copy.t("upgrade.active")}
              </div>
              <div style={{ fontSize: 11, color: t.textDim, lineHeight: 1.6 }}>
                {copy.t("upgrade.fullPro")}
              </div>
            </div>
            <div style={{ textAlign: "center", fontSize: 10, color: t.textFaint, marginBottom: 12, letterSpacing: "0.03em" }}>
              {copy.t("upgrade.fullProAccess")}
            </div>
            <div style={{ background: t.highlight, border: `1px solid ${t.highlightBorder}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
              {[
                copy.t("upgrade.refinesPerDay", { count: PRO_DAILY_CAP }),
                copy.t("upgrade.allTonesUnlocked", { count: ALL_TONES.length }),
                copy.t("upgrade.languagesAvailable"),
                copy.t("upgrade.bookmarkedLanguages", { count: PRO_BOOKMARK_LIMIT }),
                copy.t("upgrade.savedMessagesAndTones", { messages: PRO_SAVE_LIMIT, tones: PRO_SAVED_TONE_LIMIT }),
              ].map((line) => (
                <div key={line} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                  <span style={{ color: theme === "light" ? "#2a6a2a" : "#78b86f", fontSize: 12, marginTop: 1, flexShrink: 0 }}>·</span>
                  <span style={{ fontSize: 12, color: t.highlightText, lineHeight: 1.6 }}>{line}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate("account")} style={{ width: "100%", padding: "12px 18px", background: "transparent", border: `1px solid ${t.border}`, borderRadius: 10, cursor: "pointer", fontFamily: "'Lora',Georgia,serif", color: t.textMuted, fontSize: 12 }}>
              {copy.t("upgrade.manageInAccount")}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "82px 1fr 1fr 1fr", gap: 5, marginBottom: 5, alignItems: "end" }}>
              <div />
              <div style={{ textAlign: "center", padding: "6px 4px", borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: t.textFaint, opacity: 0.6, letterSpacing: "0.04em" }}>{copy.t("upgrade.guest")}</div>
              </div>
              <div style={{ textAlign: "center", padding: "7px 4px", borderRadius: 8, background: t.surface }}>
                <div style={{ fontSize: 11, fontWeight: "bold", color: t.textMuted }}>{copy.t("upgrade.free")}</div>
              </div>
              <div style={{ textAlign: "center", padding: "7px 4px 6px", borderRadius: 10, background: t.highlight, border: `1px solid ${t.highlightBorder}` }}>
                <div style={{ fontSize: 8, color: theme === "light" ? "#2a6a2a" : "#78b86f", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>{copy.t("upgrade.mostPopular")}</div>
                <div style={{ fontSize: 12, fontWeight: "bold", color: t.highlightText, letterSpacing: "-0.2px" }}>{copy.t("upgrade.pro")}</div>
              </div>
            </div>

            {[
              { label: copy.t("upgrade.rowRefinesPerDay"), guest: "10", free: `${FREE_DAILY_CAP}`, pro: `${PRO_DAILY_CAP}` },
              { label: copy.t("upgrade.rowTonesAvailable"), guest: `${GUEST_TONES.length}`, free: `${FREE_TONES.length}`, pro: copy.t("account.all", { count: ALL_TONES.length }) },
              { label: copy.t("upgrade.rowLanguages"), guest: "14", free: "14", pro: "100" },
              { label: copy.t("upgrade.rowSavedMessages"), guest: "—", free: "3", pro: `${PRO_SAVE_LIMIT}` },
              { label: copy.t("upgrade.rowBookmarks"), guest: "—", free: `${FREE_BOOKMARK_LIMIT}`, pro: `${PRO_BOOKMARK_LIMIT}` },
              { label: copy.t("upgrade.rowSavedTones"), guest: "—", free: "—", pro: "✓" },
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
              {copy.t("upgrade.bestWhenWordingMatters")}
            </div>

            {checkoutError && (
              <div style={{ background: "#2a0a0a", border: "1px solid #6a2020", borderRadius: 10, padding: "10px 14px", marginBottom: 10, fontSize: 12, color: "#e88", textAlign: "center" }}>
                {checkoutError}
              </div>
            )}

            <div>
              {[
                { label: copy.t("upgrade.annual"), plan: "yearly", price: "$29.99 / year", sub: copy.t("upgrade.annualSub"), highlight: true },
                { label: copy.t("upgrade.monthly"), plan: "monthly", price: "$3.99 / month", sub: null },
              ].map(opt => (
                <button key={opt.label} onClick={() => handleCheckout(opt.plan)} disabled={loadingPlan !== null} style={{ width: "100%", padding: opt.highlight ? "14px 18px" : "12px 18px", marginBottom: opt.highlight ? 7 : 8, background: opt.highlight ? t.accent : "transparent", border: opt.highlight ? "none" : `1px solid ${t.border}`, borderRadius: opt.highlight ? 12 : 10, cursor: loadingPlan ? "default" : "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'Lora',Georgia,serif", color: opt.highlight ? t.accentText : t.textMuted, opacity: loadingPlan && loadingPlan !== opt.plan ? 0.55 : 1 }}>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: opt.highlight ? 13 : 12, fontWeight: "bold", letterSpacing: "-0.2px" }}>{opt.label}</div>
                    {opt.sub && <div style={{ fontSize: 10, opacity: 0.75, marginTop: 1 }}>{opt.sub}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: opt.highlight ? 14 : 12, fontWeight: opt.highlight ? "bold" : "normal" }}>
                      {loadingPlan === opt.plan ? copy.t("upgrade.loading") : opt.price}
                    </div>
                  </div>
                </button>
              ))}
              <div style={{ textAlign: "center", fontSize: 10, color: t.textFaint, marginBottom: userTier === "guest" ? 12 : 0, letterSpacing: "0.03em" }}>{copy.t("upgrade.manageAnytime")}</div>
              {userTier === "guest" && (
                <button onClick={() => navigate("signin_nav")} style={{ width: "100%", background: "none", border: "none", color: t.textFaint, fontSize: 11, cursor: "pointer", marginTop: 2, fontFamily: "'Lora',Georgia,serif", letterSpacing: "0.02em" }}>
                  {copy.t("upgrade.createFreeInstead")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CapScreen({ navigate, userTier, theme }) {
  const t = THEMES[theme] || THEMES.dark;
  const copy = createI18n();
  const isGuest = userTier === "guest";
  const isPro = userTier === "pro";
  const variant = isGuest
    ? {
        title: copy.t("cap.guestTitle"),
        subtitle: copy.t("cap.guestSubtitle"),
        primaryLabel: copy.t("cap.createFreeAccount"),
        primaryAction: () => navigate("signin_cap"),
        secondaryLabel: copy.t("cap.seeProPlan"),
        secondaryAction: () => navigate("upgrade"),
        secondaryAccent: false,
      }
    : isPro
      ? {
          title: copy.t("cap.proTitle"),
          subtitle: copy.t("cap.proSubtitle"),
          primaryLabel: null,
          primaryAction: null,
          secondaryLabel: null,
          secondaryAction: null,
          secondaryAccent: false,
        }
      : {
          title: copy.t("cap.freeTitle"),
          subtitle: copy.t("cap.freeSubtitle", { count: ALL_TONES.length }),
          primaryLabel: null,
          primaryAction: null,
          secondaryLabel: copy.t("cap.upgradeToPro"),
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
          {isPro ? copy.t("cap.backToHome") : copy.t("cap.comeBackTomorrow")}
        </button>
      </div>
    </div>
  );
}

// ─── SAVED FAVOURITES ────────────────────────────────────────
export function SavedScreen({ navigate, isPremium, userTier, theme, onOpenSaved, savedItems, setSavedItems, user }) {
  const t = THEMES[theme] || THEMES.dark;
  const copy = createI18n();
  const items = savedItems || [];
  const isGuest = userTier === "guest";
  const saveLimit = isPremium ? PRO_SAVE_LIMIT : FREE_SAVE_LIMIT;

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return copy.t("saved.today");
    if (diffDays === 1) return copy.t("saved.yesterday");
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  return (
    <div style={{ padding: "14px 20px 8px", fontFamily: "'Lora',Georgia,serif", color: t.text, background: t.phoneBg, minHeight: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, marginTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate("home")} style={{ background: "none", border: "none", color: t.textMuted, fontSize: 18, cursor: "pointer" }}>←</button>
          <span style={{ fontSize: 16, fontWeight: "bold", letterSpacing: "-0.3px" }}>{copy.t("saved.title")}</span>
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
          <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 8, letterSpacing: "-0.2px" }}>{copy.t("saved.saveYourBest")}</div>
          <div style={{ fontSize: 12, color: t.textDim, marginBottom: 22, lineHeight: 1.75 }}>{copy.t("saved.guestBody")}</div>
          <button onClick={() => navigate("signin_save")} style={{ width: "100%", padding: "12px", background: t.accent, color: t.accentText, border: "none", borderRadius: 10, fontSize: 13, fontWeight: "bold", cursor: "pointer", marginBottom: 10, fontFamily: "'Lora',Georgia,serif" }}>{copy.t("saved.createFreeAccount")}</button>
          <button onClick={() => navigate("upgrade")} style={{ width: "100%", padding: "10px", background: "transparent", color: t.textFaint, border: "none", fontSize: 11, cursor: "pointer", fontFamily: "'Lora',Georgia,serif" }}>{copy.t("saved.seeProPlan")}</button>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "36px 16px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>♡</div>
          <div style={{ fontSize: 15, fontWeight: "bold", marginBottom: 8 }}>{copy.t("saved.nothingSavedYet")}</div>
          <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.65 }}>
            {isPremium ? copy.t("saved.premiumEmpty") : copy.t("saved.freeEmpty", { count: FREE_SAVE_LIMIT })}
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 10, color: t.textFaint, marginBottom: 12, letterSpacing: "0.04em" }}>{copy.t("saved.reopenHint")}</div>
          {items.map(item => (
            <button key={item.id} onClick={() => {
              const parsedTone = parseToneSelection(item.tone);
              onOpenSaved({
                ...item,
                tone: parsedTone.tone || item.tone,
                toneCount: item.tone_count,
                fromLang: item.from_lang,
                toLang: item.to_lang,
              });
            }} style={{ width: "100%", background: t.surface, border: "none", borderRadius: 10, padding: "11px 14px", marginBottom: 6, textAlign: "left", cursor: "pointer", fontFamily: "'Lora',Georgia,serif" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {item.mode === "refine" ? (
                    <span style={{ padding: "2px 8px", borderRadius: 8, background: t.highlight, fontSize: 10, color: theme === "light" ? "#2a6a2a" : "#78b86f", letterSpacing: "0.04em" }}>
                      {(() => {
                        const parsedTone = parseToneSelection(item.tone);
                        const baseLabel = parsedTone.tone || item.tone;
                        return `${baseLabel}${item.tone_count > 1 ? ` ×${item.tone_count}` : ""}`;
                      })()}
                    </span>
                  ) : <span style={{ padding: "2px 8px", borderRadius: 8, background: t.surface2, fontSize: 10, color: t.textFaint, letterSpacing: "0.04em" }}>{copy.t("saved.quick")}</span>}
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
