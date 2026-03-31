import { useState, useEffect } from "react";
import { getUserTier, THEMES } from "./lib/constants.js";
import { supabase } from "./lib/supabase.js";
import { PhoneFrame } from "./components/UI.jsx";
import { AuthScreen } from "./components/AuthScreen.jsx";
import { HomeScreen } from "./components/HomeScreen.jsx";
import { ResultsScreen } from "./components/ResultsScreen.jsx";
import { QuickResultsScreen } from "./components/QuickResultsScreen.jsx";
import { AccountScreen, UpgradeScreen, SavedScreen, CapScreen } from "./components/OtherScreens.jsx";
import { refineAndTranslate, quickTranslate } from "./lib/openai.js";
import { getUsageToday, incrementUsageDB, getSavedTranslations } from "./lib/userdata.js";

const SCREEN_LABELS = {
  home: "Home", results: "Results — Refine",
  quickresults: "Results — Quick", account: "Account",
  upgrade: "Upgrade to Pro", saved: "Saved Favourites",
  signin_nav: "Sign In (account / nav)",
  signin_save: "Sign In (save)",
  signin_bm: "Sign In (bookmark)",
  signin_tone: "Sign In (tone unlock)",
  signin_cap: "Sign In (cap hit)",
  cap: "Daily Cap Hit",
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [screen, setScreen] = useState("home");
  const [isPremium, setIsPremium] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [openedSavedItem, setOpenedSavedItem] = useState(null);
  const [translationData, setTranslationData] = useState(null);
  const [usageCount, setUsageCount] = useState(0);
  const [recentTones, setRecentTones] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [savedItems, setSavedItems] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const t = THEMES[theme] || THEMES.dark;
  const userTier = getUserTier(user, isPremium);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user.id);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user.id);
      } else {
        setUser(null);
        setUsageCount(0);
        setSavedItems([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId) => {
    try {
      const [count, saved, profile] = await Promise.all([
        getUsageToday(userId),
        getSavedTranslations(userId),
        supabase.from("profiles").select("is_pro").eq("id", userId).single(),
      ]);
      setUsageCount(count);
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

  const navigate = s => {
    if (s !== "results" && s !== "quickresults") setOpenedSavedItem(null);
    setScreen(s);
  };

  const handleOpenSaved = item => {
    setOpenedSavedItem(item);
    setScreen(item.mode === "quick" ? "quickresults" : "results");
  };

  const addRecentTone = tone => {
    setRecentTones(prev => [tone, ...prev.filter(t => t !== tone)].slice(0, 5));
  };

  const handleTranslate = async ({ text, tone, fromLang, toLang, mode }) => {
    setIsTranslating(true);
    try {
      if (mode === "quick") {
        const result = await quickTranslate({ text, fromLang, toLang });
        if (user) { const count = await incrementUsageDB(user.id); setUsageCount(count); }
        setTranslationData({ original: text, translated: result.translated, fromLang, toLang, tone, mode: "quick" });
        setScreen("quickresults");
      } else {
        const result = await refineAndTranslate({ text, tone, fromLang, toLang, toneCount: 1 });
        if (user) { const count = await incrementUsageDB(user.id); setUsageCount(count); }
        addRecentTone(tone);
        setTranslationData({ original: text, refined: result.refined, translated: result.translated, fromLang, toLang, tone, toneCount: 1, mode: "refine" });
        setScreen("results");
      }
    } catch (e) {
      console.error("Translation failed:", e);
      setTranslationData({ original: text, refined: "Translation failed — check your API key.", translated: "", fromLang, toLang, tone, toneCount: 1, mode });
      setScreen(mode === "quick" ? "quickresults" : "results");
    } finally {
      setIsTranslating(false);
    }
  };

  const props = { navigate, isPremium, userTier, theme, usageCount, user };

  const renderScreen = () => {
    if (screen.startsWith("signin_")) {
      return <AuthScreen theme={theme} onAuth={handleAuth} navigate={navigate} context={screen.replace("signin_", "")} />;
    }
    switch (screen) {
      case "home": return <HomeScreen {...props} onTranslate={handleTranslate} isTranslating={isTranslating} />;
      case "results": return <ResultsScreen {...props} initialData={translationData} savedItem={openedSavedItem} setUsageCount={setUsageCount} recentTones={recentTones} onAddRecentTone={addRecentTone} savedItems={savedItems} setSavedItems={setSavedItems} user={user} />;
      case "quickresults": return <QuickResultsScreen {...props} initialData={translationData} savedItem={openedSavedItem} savedItems={savedItems} setSavedItems={setSavedItems} user={user} />;
      case "account": return user ? <AccountScreen {...props} setIsPremium={setIsPremium} setTheme={setTheme} onLogout={handleLogout} savedItems={savedItems} /> : <AuthScreen theme={theme} onAuth={handleAuth} navigate={navigate} />;
      case "upgrade": return <UpgradeScreen {...props} setIsPremium={setIsPremium} user={user} />;
      case "saved": return <SavedScreen {...props} onOpenSaved={handleOpenSaved} savedItems={savedItems} setSavedItems={setSavedItems} />;
      case "cap": return <CapScreen {...props} />;
      default: return <HomeScreen {...props} onTranslate={handleTranslate} />;
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#c8f0a0", fontSize: 24, fontFamily: "'Lora',Georgia,serif" }}>tonara.</div>
      </div>
    );
  }

  const screenContent = renderScreen();

  if (isMobile) {
    return (
      <div style={{
        minHeight: "100vh", width: "100%",
        background: theme === "light" ? "#faf8f3" : "#0f0f0f",
        fontFamily: "'Lora',Georgia,serif",
        display: "flex", flexDirection: "column",
      }}>
        {isTranslating && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: theme === "light" ? "#faf8f3" : "#1c1c1c", borderRadius: 20, padding: "28px 40px", textAlign: "center", border: `1px solid ${t.border2}` }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>✦</div>
              <div style={{ fontSize: 14, color: t.textMuted, fontFamily: "'Lora',Georgia,serif" }}>translating…</div>
            </div>
          </div>
        )}
        {screenContent}
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
    }}>
      {isTranslating && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: theme === "light" ? "#faf8f3" : "#1c1c1c", borderRadius: 20, padding: "28px 40px", textAlign: "center", border: `1px solid ${t.border2}` }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>✦</div>
            <div style={{ fontSize: 14, color: t.textMuted, fontFamily: "'Lora',Georgia,serif" }}>translating…</div>
          </div>
        </div>
      )}

      <PhoneFrame theme={theme}>
        {screenContent}
      </PhoneFrame>

      <div style={{ color: theme === "light" ? "#1a1a0a" : "#f5f1e8", maxWidth: 256 }}>
        <div style={{ fontSize: 11, color: t.textDim, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>Interactive Preview</div>
        <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 3 }}>tonara.</div>
        <div style={{ fontSize: 12, color: t.textDim, marginBottom: 4, lineHeight: 1.6 }}>✓ AI runs server-side</div>
        <div style={{ fontSize: 12, color: t.textDim, marginBottom: 22, lineHeight: 1.6 }}>{user ? `✓ ${user.email}` : "◎ Not logged in"}</div>
        {user && (
          <>
            <div style={{ fontSize: 10, color: t.textFaint, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Screens</div>
            {Object.entries(SCREEN_LABELS).map(([id, label]) => (
              <button key={id} onClick={() => navigate(id)} style={{
                display: "block", width: "100%", textAlign: "left", padding: "7px 11px", marginBottom: 3,
                background: screen === id ? (theme === "light" ? "#e0dcd2" : "#181818") : "transparent",
                border: `1px solid ${screen === id ? (theme === "light" ? "#ccc" : t.border) : "transparent"}`,
                borderLeft: `2px solid ${screen === id ? t.accent : "transparent"}`,
                borderRadius: 7, color: screen === id ? (theme === "light" ? "#1a1a0a" : "#f5f1e8") : t.textDim,
                fontSize: 12, cursor: "pointer", fontFamily: "'Lora',Georgia,serif",
              }}>{label}</button>
            ))}
            <button onClick={handleLogout} style={{ marginTop: 12, width: "100%", padding: "8px", background: "transparent", border: `1px solid ${t.border}`, borderRadius: 8, color: t.textDim, fontSize: 11, cursor: "pointer", fontFamily: "'Lora',Georgia,serif" }}>Sign out</button>
          </>
        )}
      </div>
    </div>
  );
}
