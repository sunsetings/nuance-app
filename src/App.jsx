import { useState, useEffect } from "react";
import { THEMES } from "./lib/constants.js";
import { PhoneFrame } from "./components/UI.jsx";
import { HomeScreen } from "./components/HomeScreen.jsx";
import { ResultsScreen } from "./components/ResultsScreen.jsx";
import { QuickResultsScreen } from "./components/QuickResultsScreen.jsx";
import { AccountScreen, UpgradeScreen, SavedScreen } from "./components/OtherScreens.jsx";
import { refineAndTranslate, quickTranslate } from "./lib/openai.js";
import { getRefinesToday, incrementUsage } from "./lib/usage.js";

// ─── API KEY ─────────────────────────────────────────────────
// In production this comes from environment variables (Vercel).
// For local testing, paste your key here temporarily.
// IMPORTANT: Never share or commit your API key publicly.
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";

const SCREEN_LABELS = {
  home: "Home",
  results: "Results — Refine",
  quickresults: "Results — Quick",
  account: "Account",
  upgrade: "Upgrade to Pro",
  saved: "Saved Favourites",
};

export default function App() {
  const [screen, setScreen] = useState("home");
  const [isPremium, setIsPremium] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [openedSavedItem, setOpenedSavedItem] = useState(null);
  const [translationData, setTranslationData] = useState(null);
  const [usageCount, setUsageCount] = useState(getRefinesToday());
  const [recentTones, setRecentTones] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);

  const t = THEMES[theme] || THEMES.dark;

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

  // Called when user taps Translate on Home screen
  const handleTranslate = async ({ text, tone, fromLang, toLang, mode }) => {
    setIsTranslating(true);
    try {
      if (mode === "quick") {
        const result = await quickTranslate({ text, fromLang, toLang, apiKey: API_KEY });
        const updated = incrementUsage();
        setUsageCount(updated.count);
        setTranslationData({ original: text, translated: result.translated, fromLang, toLang, tone, mode: "quick" });
        setScreen("quickresults");
      } else {
        const result = await refineAndTranslate({ text, tone, fromLang, toLang, toneCount: 1, apiKey: API_KEY });
        const updated = incrementUsage();
        setUsageCount(updated.count);
        addRecentTone(tone);
        setTranslationData({ original: text, refined: result.refined, translated: result.translated, fromLang, toLang, tone, toneCount: 1, mode: "refine" });
        setScreen("results");
      }
    } catch (e) {
      console.error("Translation failed:", e);
      // Still navigate but with error data
      setTranslationData({ original: text, refined: "Translation failed — check your API key.", translated: "", fromLang, toLang, tone, toneCount: 1, mode });
      setScreen(mode === "quick" ? "quickresults" : "results");
    } finally {
      setIsTranslating(false);
    }
  };

  const props = { navigate, isPremium, theme, usageCount };

  const renderScreen = () => {
    switch (screen) {
      case "home":
        return <HomeScreen {...props} onTranslate={handleTranslate} isTranslating={isTranslating} />;
      case "results":
        return (
          <ResultsScreen
            {...props}
            initialData={translationData}
            savedItem={openedSavedItem}
            setUsageCount={setUsageCount}
            apiKey={API_KEY}
            recentTones={recentTones}
            onAddRecentTone={addRecentTone}
          />
        );
      case "quickresults":
        return <QuickResultsScreen {...props} initialData={translationData} savedItem={openedSavedItem} />;
      case "account":
        return <AccountScreen {...props} setIsPremium={setIsPremium} setTheme={setTheme} />;
      case "upgrade":
        return <UpgradeScreen {...props} setIsPremium={setIsPremium} />;
      case "saved":
        return <SavedScreen {...props} onOpenSaved={handleOpenSaved} />;
      default:
        return <HomeScreen {...props} onTranslate={handleTranslate} />;
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: theme === "light" ? "#dedad0" : "#050505",
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 48, padding: 40,
      fontFamily: "'Lora',Georgia,serif",
      transition: "background 0.3s",
    }}>
      {/* Loading overlay */}
      {isTranslating && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: theme === "light" ? "#faf8f3" : "#1c1c1c",
            borderRadius: 20, padding: "28px 40px",
            textAlign: "center", border: `1px solid ${t.border2}`,
          }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>✦</div>
            <div style={{ fontSize: 14, color: t.textMuted, fontFamily: "'Lora',Georgia,serif" }}>translating…</div>
          </div>
        </div>
      )}

      <PhoneFrame theme={theme}>{renderScreen()}</PhoneFrame>

      {/* Sidebar — dev navigation panel */}
      <div style={{ color: theme === "light" ? "#1a1a0a" : "#f5f1e8", maxWidth: 256 }}>
        <div style={{ fontSize: 11, color: t.textDim, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>Interactive Preview</div>
        <div style={{ fontSize: 24, fontWeight: "bold", marginBottom: 3 }}>nuance.</div>
        <div style={{ fontSize: 12, color: t.textDim, marginBottom: 22, lineHeight: 1.6 }}>
          {API_KEY ? "✓ API key loaded" : "⚠ No API key — add VITE_OPENAI_API_KEY"}
        </div>

        <div style={{ fontSize: 10, color: t.textFaint, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Screens</div>
        {Object.entries(SCREEN_LABELS).map(([id, label]) => (
          <button key={id} onClick={() => navigate(id)} style={{
            display: "block", width: "100%", textAlign: "left",
            padding: "7px 11px", marginBottom: 3,
            background: screen === id ? (theme === "light" ? "#e0dcd2" : "#181818") : "transparent",
            border: `1px solid ${screen === id ? (theme === "light" ? "#ccc" : t.border) : "transparent"}`,
            borderLeft: `2px solid ${screen === id ? t.accent : "transparent"}`,
            borderRadius: 7,
            color: screen === id ? (theme === "light" ? "#1a1a0a" : "#f5f1e8") : t.textDim,
            fontSize: 12, cursor: "pointer",
            fontFamily: "'Lora',Georgia,serif",
          }}>{label}</button>
        ))}

        <div style={{
          marginTop: 16, padding: "13px 14px",
          background: t.highlight, border: `1px solid ${t.highlightBorder}`,
          borderRadius: 9, fontSize: 11,
          color: theme === "light" ? "#2a6a2a" : "#8adc8a",
          lineHeight: 1.8,
        }}>
          <strong>To use real AI:</strong><br />
          Add your OpenAI key to<br />
          a <code>.env</code> file as:<br />
          <code>VITE_OPENAI_API_KEY=sk-...</code>
        </div>
      </div>
    </div>
  );
}
