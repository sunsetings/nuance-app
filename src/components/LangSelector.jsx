import { useState } from "react";
import { AUTO_DETECT_LANGUAGE, BASE_LANGUAGES, PRO_LANGUAGES, THEMES } from "../lib/constants.js";

function SmallHeart({ size = 14, color, filled = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ display: "block", flexShrink: 0 }}>
      <path
        d="M7 12C7 12 2 8.5 2 5C2 3.5 3.2 2.5 4.7 2.5C5.6 2.5 6.4 2.9 7 3.6C7.6 2.9 8.4 2.5 9.3 2.5C10.8 2.5 12 3.5 12 5C12 8.5 7 12 7 12Z"
        stroke={color}
        strokeWidth="1.4"
        fill={filled ? color : "none"}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LangSelector({
  label,
  value,
  onChange,
  bookmarked,
  onToggleBookmark,
  bookmarkLimit,
  userTier,
  openId,
  setOpenId,
  myId,
  navigate,
  theme,
}) {
  const t = THEMES[theme] || THEMES.dark;
  const [search, setSearch] = useState("");
  const open = openId === myId;
  const isPro = userTier === "pro";
  const canBookmarkAny = userTier !== "guest";
  const visibleBookmarked = canBookmarkAny ? bookmarked : [];
  const canBookmark = visibleBookmarked.length < bookmarkLimit;
  const sortedBaseLanguages = [...BASE_LANGUAGES].sort((a, b) => a.localeCompare(b));
  const sortedProLanguages = [...PRO_LANGUAGES].sort((a, b) => a.localeCompare(b));
  const allLanguages = label === "FROM"
    ? [AUTO_DETECT_LANGUAGE, ...sortedBaseLanguages, ...sortedProLanguages]
    : [...sortedBaseLanguages, ...sortedProLanguages];

  const filterList = (list) => (
    search ? list.filter((item) => item.toLowerCase().includes(search.toLowerCase())) : list
  );

  const bookmarkedFiltered = visibleBookmarked.filter((lang) => filterList([lang]).length > 0);
  const availableLanguages = allLanguages.filter((lang) => !visibleBookmarked.includes(lang));
  const visibleAutoDetect = label === "FROM" && availableLanguages.includes(AUTO_DETECT_LANGUAGE)
    ? [AUTO_DETECT_LANGUAGE]
    : [];
  const baseAvailable = filterList(availableLanguages.filter((lang) => BASE_LANGUAGES.includes(lang)));
  const proAvailable = filterList(availableLanguages.filter((lang) => PRO_LANGUAGES.includes(lang)));
  const showGroupedAvailable = !isPro;

  const handleOpen = () => {
    if (open) {
      setOpenId(null);
      setSearch("");
      return;
    }
    setOpenId(myId);
    setSearch("");
  };

  const handleClose = () => {
    setOpenId(null);
    setSearch("");
  };

  return (
    <div style={{ flex: 1, position: "relative" }}>
      <button
        onClick={handleOpen}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          color: t.text,
          fontSize: 13,
          cursor: "pointer",
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontFamily: "'Lora',Georgia,serif",
        }}
      >
        <span style={{ flex: 1, textAlign: label === "TO" ? "right" : "left" }}>{value}</span>
        {value !== AUTO_DETECT_LANGUAGE && visibleBookmarked.includes(value) && <SmallHeart size={10} color={t.proTag} filled />}
        {PRO_LANGUAGES.includes(value) && (
          <span style={{ fontSize: 7, background: t.proTag, color: "#000", padding: "1px 4px", borderRadius: 3, fontWeight: "bold" }}>
            PRO
          </span>
        )}
        <span style={{ color: t.textFaint, fontSize: 10, marginLeft: 2 }}>{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 12px)",
            left: label === "TO" ? "auto" : "-14px",
            right: label === "TO" ? "-14px" : "auto",
            width: 244,
            background: theme === "light" ? "#faf6ee" : "#1a1a1a",
            borderRadius: 14,
            zIndex: 400,
            overflow: "hidden",
            boxShadow: theme === "light" ? "0 8px 32px rgba(0,0,0,0.1)" : "0 12px 40px rgba(0,0,0,0.7)",
          }}
        >
          <div style={{ padding: "10px 12px 8px" }}>
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search languages…"
              style={{
                width: "100%",
                background: t.surface2,
                border: "none",
                borderRadius: 8,
                padding: "7px 11px",
                color: t.text,
                fontSize: 12,
                outline: "none",
                fontFamily: "'Lora',Georgia,serif",
              }}
            />
          </div>

          {!canBookmarkAny && (
            <div style={{ padding: "6px 14px 8px", borderBottom: `1px solid ${t.borderLight}` }}>
              <button
                onClick={() => {
                  handleClose();
                  navigate("signin_bm");
                }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10, color: t.freeTag, padding: 0, letterSpacing: "0.02em", fontFamily: "'Lora',Georgia,serif" }}
              >
                ✦ Create free account to bookmark languages
              </button>
            </div>
          )}

          {canBookmarkAny && (
            <div style={{ padding: "4px 14px 4px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 9, color: visibleBookmarked.length >= bookmarkLimit ? t.proTag : t.textFaint, letterSpacing: "0.04em" }}>
                {visibleBookmarked.length}/{bookmarkLimit} bookmarked
              </span>
              {!canBookmark && <span style={{ fontSize: 9, color: t.proTag }}>limit reached</span>}
            </div>
          )}

          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {bookmarkedFiltered.length > 0 && (
              <div>
                <div style={{ padding: "6px 14px 3px", fontSize: 9, color: t.textDim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Bookmarked</div>
                {bookmarkedFiltered.map((lang) => (
                  <div key={lang} style={{ display: "flex", alignItems: "center", padding: "8px 14px", background: lang === value ? t.surface : "transparent" }}>
                    <button
                      onClick={() => {
                        onChange(lang);
                        handleClose();
                      }}
                      style={{
                        flex: 1,
                        background: "none",
                        border: "none",
                        color: lang === value ? t.accent : t.textMuted,
                        fontSize: 13,
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontFamily: "'Lora',Georgia,serif",
                      }}
                    >
                      <SmallHeart size={10} color={t.proTag} filled />
                      {lang}
                      {PRO_LANGUAGES.includes(lang) && (
                        <span style={{ fontSize: 7, background: t.proTag, color: "#000", padding: "1px 4px", borderRadius: 3, fontWeight: "bold" }}>
                          PRO
                        </span>
                      )}
                    </button>
                    <button onClick={() => onToggleBookmark(lang)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}>
                      <SmallHeart size={13} color={t.proTag} filled />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {(visibleAutoDetect.length > 0 || baseAvailable.length > 0 || proAvailable.length > 0) && (
              <div>
                {bookmarkedFiltered.length > 0 && <div style={{ height: 1, background: t.borderLight, margin: "2px 12px" }} />}
                <div style={{ padding: "6px 14px 3px", fontSize: 9, color: t.textDim, letterSpacing: "0.1em", textTransform: "uppercase" }}>Available</div>
                {visibleAutoDetect.map((lang) => {
                  const canBookmarkLanguage = false;
                  return (
                  <div key={lang} style={{ display: "flex", alignItems: "center", padding: "8px 14px", background: lang === value ? t.surface : "transparent" }}>
                    <button
                      onClick={() => {
                        onChange(lang);
                        handleClose();
                      }}
                      style={{ flex: 1, background: "none", border: "none", color: lang === value ? t.accent : t.textMuted, fontSize: 13, cursor: "pointer", textAlign: "left", fontFamily: "'Lora',Georgia,serif", display: "flex", alignItems: "center", gap: 6 }}
                    >
                      {lang}
                    </button>
                    {canBookmarkAny && (
                      <button
                        onClick={() => {
                          if (!canBookmarkLanguage) return;
                          onToggleBookmark(lang);
                        }}
                        style={{ background: "none", border: "none", cursor: "default", padding: "2px", display: "flex", alignItems: "center", opacity: 0.3 }}
                      >
                        <SmallHeart size={13} color={t.textFaint} />
                      </button>
                    )}
                  </div>
                )})}
                {baseAvailable.length > 0 && showGroupedAvailable && (
                  <div style={{ padding: "6px 14px 3px", fontSize: 9, color: t.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>Free languages</div>
                )}
                {[...(showGroupedAvailable ? baseAvailable : [...baseAvailable, ...proAvailable])].map((lang) => {
                  const isProLanguage = PRO_LANGUAGES.includes(lang);
                  const canUseLanguage = !isProLanguage || isPro;
                  const canBookmarkLanguage = lang !== AUTO_DETECT_LANGUAGE && canBookmarkAny && (!isProLanguage || isPro);
                  return (
                  <div key={lang} style={{ display: "flex", alignItems: "center", padding: "8px 14px", background: lang === value ? t.surface : "transparent" }}>
                    <button
                      onClick={() => {
                        if (!canUseLanguage) {
                          navigate("upgrade");
                          return;
                        }
                        onChange(lang);
                        handleClose();
                      }}
                      style={{ flex: 1, background: "none", border: "none", color: lang === value ? t.accent : canUseLanguage ? t.textMuted : t.textDim, fontSize: 13, cursor: "pointer", textAlign: "left", fontFamily: "'Lora',Georgia,serif", display: "flex", alignItems: "center", gap: 6, opacity: canUseLanguage ? 1 : 0.72 }}
                    >
                      {lang}
                      {isProLanguage && (
                        <span style={{ fontSize: 7, background: t.proTag, color: "#000", padding: "1px 4px", borderRadius: 3, fontWeight: "bold" }}>
                          PRO
                        </span>
                      )}
                    </button>
                    {canBookmarkAny && (
                      <button
                        onClick={() => {
                          if (!canBookmarkLanguage) {
                            navigate("upgrade");
                            return;
                          }
                          onToggleBookmark(lang);
                        }}
                        style={{ background: "none", border: "none", cursor: canBookmark && canBookmarkLanguage ? "pointer" : "default", padding: "2px", display: "flex", alignItems: "center", opacity: canBookmark && canBookmarkLanguage ? 1 : 0.3 }}
                      >
                        <SmallHeart size={13} color={t.textFaint} />
                      </button>
                    )}
                  </div>
                )})}
                {showGroupedAvailable && proAvailable.length > 0 && (
                  <>
                    <div style={{ height: 1, background: t.borderLight, margin: "2px 12px" }} />
                    <div style={{ padding: "6px 14px 3px", fontSize: 9, color: t.textDim, letterSpacing: "0.08em", textTransform: "uppercase" }}>Pro languages</div>
                    {proAvailable.map((lang) => {
                      const canBookmarkLanguage = false;
                      return (
                      <div key={lang} style={{ display: "flex", alignItems: "center", padding: "8px 14px", background: lang === value ? t.surface : "transparent" }}>
                        <button
                          onClick={() => {
                            navigate("upgrade");
                          }}
                          style={{ flex: 1, background: "none", border: "none", color: t.textDim, fontSize: 13, cursor: "pointer", textAlign: "left", fontFamily: "'Lora',Georgia,serif", display: "flex", alignItems: "center", gap: 6, opacity: 0.72 }}
                        >
                          {lang}
                          <span style={{ fontSize: 7, background: t.proTag, color: "#000", padding: "1px 4px", borderRadius: 3, fontWeight: "bold" }}>
                            PRO
                          </span>
                        </button>
                        {canBookmarkAny && (
                          <button
                            onClick={() => {
                              if (!canBookmarkLanguage) {
                                navigate("upgrade");
                                return;
                              }
                            }}
                            style={{ background: "none", border: "none", cursor: "default", padding: "2px", display: "flex", alignItems: "center", opacity: 0.3 }}
                          >
                            <SmallHeart size={13} color={t.textFaint} />
                          </button>
                        )}
                      </div>
                    )})}
                  </>
                )}
              </div>
            )}

            {bookmarkedFiltered.length === 0 && visibleAutoDetect.length === 0 && baseAvailable.length === 0 && proAvailable.length === 0 && (
              <div style={{ padding: "18px 14px", textAlign: "center", fontSize: 12, color: t.textDim }}>No languages found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
