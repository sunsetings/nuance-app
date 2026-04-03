import { useState, useEffect } from "react";
import { getUserTier, PRO_SAVED_TONE_LIMIT, THEMES } from "./lib/constants.js";
import { supabase } from "./lib/supabase.js";
import { PhoneFrame, Toast } from "./components/UI.jsx";
import { AuthScreen } from "./components/AuthScreen.jsx";
import { HomeScreen } from "./components/HomeScreen.jsx";
import { ResultsScreen } from "./components/ResultsScreen.jsx";
import { QuickResultsScreen } from "./components/QuickResultsScreen.jsx";
import { AccountScreen, UpgradeScreen, SavedScreen, CapScreen } from "./components/OtherScreens.jsx";
import { refineAndTranslate, quickTranslate } from "./lib/openai.js";
import { getUsageToday, getSavedTranslations } from "./lib/userdata.js";
import { getQuickTranslationsToday, getRefinesToday, incrementUsage } from "./lib/usage.js";
import { createI18n, UI_LOCALE_STORAGE_KEY, getLocalePreference, isRTLLocale } from "./lib/i18n.js";
import { identifyAnalyticsUser, initAnalytics, resetAnalyticsUser, track, trackScreen } from "./lib/analytics.js";

const LS_SAVED_TONES = "tonara_saved_tones";
const LS_THEME_PREFERENCE = "tonara_theme_preference";
const LS_POST_AUTH_ROUTE = "tonara_post_auth_route";

function getSystemTheme() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(preference) {
  return preference === "system" ? getSystemTheme() : preference;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [screen, setScreen] = useState("home");
  const [previousScreen, setPreviousScreen] = useState("home");
  const [screenContext, setScreenContext] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [themePreference, setThemePreference] = useState(() => localStorage.getItem(LS_THEME_PREFERENCE) || "system");
  const [theme, setTheme] = useState(() => resolveTheme(localStorage.getItem(LS_THEME_PREFERENCE) || "system"));
  const [localePreference, setLocalePreference] = useState(() => getLocalePreference());
  const copy = createI18n(localePreference === "device" ? undefined : localePreference);
  const isRTL = isRTLLocale(copy.locale);
  const [openedSavedItem, setOpenedSavedItem] = useState(null);
  const [translationData, setTranslationData] = useState(null);
  const [usageCount, setUsageCount] = useState(() => getRefinesToday());
  const [quickUsageCount, setQuickUsageCount] = useState(() => getQuickTranslationsToday());
  const [recentTones, setRecentTones] = useState([]);
  const [savedTones, setSavedTones] = useState(() => {
    try {
      const stored = localStorage.getItem(LS_SAVED_TONES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [savedItems, setSavedItems] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const t = THEMES[theme] || THEMES.dark;
  const userTier = getUserTier(user, isPremium);
  const visibleSavedTones = userTier === "pro" ? savedTones : [];

  const consumePostAuthRoute = () => {
    const target = localStorage.getItem(LS_POST_AUTH_ROUTE);
    if (!target) return null;
    localStorage.removeItem(LS_POST_AUTH_ROUTE);
    return target;
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    track("app_open", {
      ui_locale: copy.locale,
      locale_preference: localePreference,
      is_mobile: window.innerWidth <= 768,
      device_locale: navigator.language || "",
    });
  }, []);

  useEffect(() => {
    setQuickUsageCount(getQuickTranslationsToday());
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_SAVED_TONES, JSON.stringify(savedTones));
  }, [savedTones]);

  useEffect(() => {
    localStorage.setItem(LS_THEME_PREFERENCE, themePreference);
    setTheme(resolveTheme(themePreference));
  }, [themePreference]);

  const applyLocalePreference = (nextPreference) => {
    if (nextPreference === "device") {
      localStorage.removeItem(UI_LOCALE_STORAGE_KEY);
    } else {
      localStorage.setItem(UI_LOCALE_STORAGE_KEY, nextPreference);
    }
    setLocalePreference(nextPreference);
    track("ui_language_changed", {
      locale_preference: nextPreference,
      previous_locale: copy.locale,
      user_tier: userTier,
    });
  };

  useEffect(() => {
    if (themePreference !== "system" || typeof window.matchMedia !== "function") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setTheme(mediaQuery.matches ? "dark" : "light");
    handleChange();
    mediaQuery.addEventListener?.("change", handleChange);
    return () => mediaQuery.removeEventListener?.("change", handleChange);
  }, [themePreference]);

  useEffect(() => {
    const dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = copy.locale;
    document.documentElement.dir = dir;
    document.body.dir = dir;
  }, [copy.locale, isRTL]);

  useEffect(() => {
    trackScreen(screen, {
      user_tier: userTier,
      ui_locale: copy.locale,
      context: screenContext || "",
    });
    if (screen === "upgrade") {
      track("upgrade_viewed", {
        user_tier: userTier,
        context: screenContext || "default",
      });
    }
    if (screen === "cap") {
      track("cap_hit", {
        user_tier: userTier,
      });
    }
  }, [screen, userTier, copy.locale, screenContext]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user.id);
        const pendingRoute = consumePostAuthRoute();
        if (pendingRoute) setScreen(pendingRoute);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user.id);
        const pendingRoute = consumePostAuthRoute();
        if (pendingRoute) setScreen(pendingRoute);
      } else {
        setUser(null);
        setUsageCount(getRefinesToday());
        setQuickUsageCount(getQuickTranslationsToday());
        setSavedItems([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.id) {
      identifyAnalyticsUser(user.id, {
        email: user.email || "",
        user_tier: userTier,
        ui_locale: copy.locale,
      });
      return;
    }
    resetAnalyticsUser();
  }, [user?.id, user?.email, userTier, copy.locale]);

  const loadUserData = async (userId) => {
    try {
      const [count, quickCount, saved, profile] = await Promise.all([
        getUsageToday(userId, "refine"),
        getUsageToday(userId, "quick"),
        getSavedTranslations(userId),
        supabase.from("profiles").select("is_pro").eq("id", userId).single(),
      ]);
      setUsageCount(count);
      setQuickUsageCount(quickCount);
      setSavedItems(saved);
      setIsPremium(profile?.data?.is_pro === true);
    } catch (e) {
      console.error("Failed to load user data:", e);
    }
  };

  const handleAuth = (user) => {
    setUser(user);
    loadUserData(user.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setScreen("home");
  };

  const navigate = (target) => {
    if (target === "__back") {
      setScreen(previousScreen || "home");
      return;
    }

    const nextScreen = typeof target === "string" ? target : target?.screen;
    const nextContext = typeof target === "object" ? target?.context ?? null : null;
    if (!nextScreen) return;

    if (nextScreen !== "results" && nextScreen !== "quickresults") setOpenedSavedItem(null);
    if (nextScreen !== screen) setPreviousScreen(screen);
    setScreenContext(nextContext);
    setScreen(nextScreen);
  };

  const handleOpenSaved = item => {
    setOpenedSavedItem(item);
    setScreen(item.mode === "quick" ? "quickresults" : "results");
  };

  const addRecentTone = tone => {
    setRecentTones(prev => [tone, ...prev.filter(t => t !== tone)].slice(0, 5));
  };

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 4200);
  };

  const toggleSavedTone = (tone) => {
    setSavedTones((prev) => {
      if (prev.includes(tone)) {
        return prev.filter((item) => item !== tone);
      }
      if (prev.length >= PRO_SAVED_TONE_LIMIT) {
        showToast("You can save up to 5 tones. Unsave one to make room for another.");
        return prev;
      }
      return [tone, ...prev];
    });
  };

  const handleTranslate = async ({ text, tone, toneCount = 1, fromLang, toLang, mode }) => {
    const cap = userTier === "pro" ? 300 : userTier === "free" ? 30 : 10;
    if (mode === "quick" && quickUsageCount >= cap) {
      showToast(copy.t("app.standardTranslationsCap", { cap }));
      track("cap_hit", { user_tier: userTier, mode: "quick", cap });
      return;
    }

    track(mode === "quick" ? "translate_only_started" : "refine_started", {
      user_tier: userTier,
      from_lang: fromLang,
      to_lang: toLang,
      tone: mode === "quick" ? "" : tone,
      tone_strength: mode === "quick" ? 0 : toneCount,
      char_count: text.length,
    });

    setIsTranslating(true);
    try {
      if (mode === "quick") {
        const result = await quickTranslate({ text, fromLang, toLang });
        const resolvedFromLang = result.sourceLanguage || fromLang;
        if (user) {
          setQuickUsageCount((prev) => prev + 1);
        } else {
          const updated = incrementUsage("quick");
          setQuickUsageCount(updated.count);
        }
        setTranslationData({ original: text, translated: result.translated, fromLang: resolvedFromLang, toLang, tone, mode: "quick" });
        track("translate_only_succeeded", {
          user_tier: userTier,
          from_lang: resolvedFromLang,
          to_lang: toLang,
          char_count: text.length,
        });
        setScreen("quickresults");
      } else {
        const result = await refineAndTranslate({ text, tone, fromLang, toLang, toneCount });
        const resolvedFromLang = result.sourceLanguage || fromLang;
        if (user) {
          setUsageCount((prev) => prev + 1);
        }
        addRecentTone(tone);
        setTranslationData({ original: text, refined: result.refined, translated: result.translated, fromLang: resolvedFromLang, toLang, tone, toneCount, mode: "refine" });
        track("refine_succeeded", {
          user_tier: userTier,
          from_lang: resolvedFromLang,
          to_lang: toLang,
          tone,
          tone_strength: toneCount,
          char_count: text.length,
        });
        setScreen("results");
      }
    } catch (e) {
      console.error(copy.t("app.translationFailed"), e);
      setTranslationData({ original: text, refined: copy.t("app.translationFailed"), translated: "", fromLang, toLang, tone, toneCount, mode });
      track(mode === "quick" ? "translate_only_failed" : "refine_failed", {
        user_tier: userTier,
        from_lang: fromLang,
        to_lang: toLang,
        tone: mode === "quick" ? "" : tone,
        tone_strength: mode === "quick" ? 0 : toneCount,
        error: e?.message || "unknown_error",
      });
      setScreen(mode === "quick" ? "quickresults" : "results");
    } finally {
      setIsTranslating(false);
    }
  };

  const props = { navigate, isPremium, userTier, theme, usageCount, user };

  const renderScreen = () => {
    if (screen.startsWith("signin_")) {
      return <AuthScreen theme={theme} onAuth={handleAuth} navigate={navigate} context={screen.replace("signin_", "")} navContext={{ ...(screenContext || {}), returnScreen: previousScreen }} />;
    }
    switch (screen) {
      case "home": return <HomeScreen {...props} onTranslate={handleTranslate} isTranslating={isTranslating} savedTones={visibleSavedTones} onToggleSavedTone={toggleSavedTone} navContext={screenContext} />;
      case "results": return <ResultsScreen {...props} initialData={translationData} savedItem={openedSavedItem} setUsageCount={setUsageCount} recentTones={recentTones} savedTones={visibleSavedTones} onToggleSavedTone={toggleSavedTone} onAddRecentTone={addRecentTone} savedItems={savedItems} setSavedItems={setSavedItems} user={user} />;
      case "quickresults": return <QuickResultsScreen {...props} initialData={translationData} savedItem={openedSavedItem} savedItems={savedItems} setSavedItems={setSavedItems} user={user} />;
      case "account": return user ? <AccountScreen {...props} themePreference={themePreference} setTheme={setThemePreference} localePreference={localePreference} setLocalePreference={applyLocalePreference} savedItems={savedItems} onLogout={handleLogout} /> : <AuthScreen theme={theme} onAuth={handleAuth} navigate={navigate} navContext={{ ...(screenContext || {}), returnScreen: "account" }} />;
      case "upgrade": return <UpgradeScreen {...props} setIsPremium={setIsPremium} user={user} context={screenContext} />;
      case "saved": return <SavedScreen {...props} onOpenSaved={handleOpenSaved} savedItems={savedItems} setSavedItems={setSavedItems} />;
      case "cap": return <CapScreen {...props} />;
      default: return <HomeScreen {...props} onTranslate={handleTranslate} />;
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: THEMES[theme]?.bg || THEMES.light.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: THEMES[theme]?.accent || THEMES.light.accent, fontSize: 24, fontFamily: "'Lora',Georgia,serif" }}>tonara.</div>
      </div>
    );
  }

  const screenContent = renderScreen();

  if (isMobile) {
    return (
      <div style={{
        minHeight: "100dvh",
        height: "100dvh",
        width: "100%",
        background: theme === "light" ? "#faf8f3" : "#0f0f0f",
        fontFamily: "'Lora',Georgia,serif",
        display: "flex", flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        direction: isRTL ? "rtl" : "ltr",
      }} dir={isRTL ? "rtl" : "ltr"}>
        <Toast message={toastMessage} visible={toastVisible} theme={theme} />
        {isTranslating && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: theme === "light" ? "#faf8f3" : "#1c1c1c", borderRadius: 20, padding: "28px 40px", textAlign: "center", border: `1px solid ${t.border2}` }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>✦</div>
              <div style={{ fontSize: 14, color: t.textMuted, fontFamily: "'Lora',Georgia,serif" }}>{copy.t("app.translating")}</div>
            </div>
          </div>
        )}
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          {screenContent}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: theme === "light" ? "#dedad0" : "#050505",
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 48, padding: 40, fontFamily: "'Lora',Georgia,serif",
      transition: "background 0.3s",
      direction: isRTL ? "rtl" : "ltr",
    }} dir={isRTL ? "rtl" : "ltr"}>
      {isTranslating && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: theme === "light" ? "#faf8f3" : "#1c1c1c", borderRadius: 20, padding: "28px 40px", textAlign: "center", border: `1px solid ${t.border2}` }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>✦</div>
            <div style={{ fontSize: 14, color: t.textMuted, fontFamily: "'Lora',Georgia,serif" }}>{copy.t("app.translating")}</div>
          </div>
        </div>
      )}

      <PhoneFrame theme={theme}>
        <Toast message={toastMessage} visible={toastVisible} theme={theme} />
        {screenContent}
      </PhoneFrame>

      <div style={{ color: theme === "light" ? "#1a1a0a" : "#f5f1e8", maxWidth: 256, textAlign: isRTL ? "right" : "left" }}>
        <div style={{ fontSize: 11, color: t.textDim, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>{copy.t("app.interactivePreview")}</div>
        <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 3 }}>tonara.</div>
        <div style={{ fontSize: 12, color: t.textDim, marginBottom: 4, lineHeight: 1.6 }}>✓ {copy.t("app.aiRunsServerSide")}</div>
        <div style={{ fontSize: 12, color: t.textDim, marginBottom: 22, lineHeight: 1.6 }}>{user ? `✓ ${user.email}` : `◎ ${copy.t("app.notLoggedIn")}`}</div>
        {user && (
          <>
            <div style={{ fontSize: 10, color: t.textFaint, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>{copy.t("app.screens")}</div>
            {Object.entries(copy.t("app.screenLabels")).map(([id, label]) => (
              <button key={id} onClick={() => navigate(id)} style={{
                display: "block", width: "100%", textAlign: isRTL ? "right" : "left", padding: "7px 11px", marginBottom: 3,
                background: screen === id ? (theme === "light" ? "#e0dcd2" : "#181818") : "transparent",
                border: `1px solid ${screen === id ? (theme === "light" ? "#ccc" : t.border) : "transparent"}`,
                borderLeft: isRTL ? "2px solid transparent" : `2px solid ${screen === id ? t.accent : "transparent"}`,
                borderRight: isRTL ? `2px solid ${screen === id ? t.accent : "transparent"}` : "2px solid transparent",
                borderRadius: 7, color: screen === id ? (theme === "light" ? "#1a1a0a" : "#f5f1e8") : t.textDim,
                fontSize: 12, cursor: "pointer", fontFamily: "'Lora',Georgia,serif",
              }}>{label}</button>
            ))}
            <button onClick={handleLogout} style={{ marginTop: 12, width: "100%", padding: "8px", background: "transparent", border: `1px solid ${t.border}`, borderRadius: 8, color: t.textDim, fontSize: 11, cursor: "pointer", fontFamily: "'Lora',Georgia,serif" }}>{copy.t("app.signOut")}</button>
          </>
        )}
      </div>
    </div>
  );
}
