import { useState } from "react";

const THEMES = {
  dark: {
    bg: "#050505",
    text: "#f5f1e8",
    textMuted: "#d0ccc0",
    textDim: "#9a9690",
    surface: "#181818",
    surface2: "#222",
    border: "#333",
    accent: "#c8f0a0",
    accentText: "#0a1a00",
  },
  light: {
    bg: "#e8e4da",
    text: "#1a1a0a",
    textMuted: "#3a3830",
    textDim: "#6a6860",
    surface: "#f0ece3",
    surface2: "#e6e2d8",
    border: "#d0ccbf",
    accent: "#2a7a2a",
    accentText: "#f0ece0",
  },
};

export default function Privacy({ navigate, theme = "dark" }) {
  const t = THEMES[theme];
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const sections = [
    {
      id: "intro",
      title: "Introduction",
      content: `tonara ("we," "us," "our," or "the App") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and otherwise process personal information through our translation and refinement app.

If you have questions about this policy, please contact us at privacy@tonara.app.`,
    },
    {
      id: "collect",
      title: "Information We Collect",
      subsections: [
        {
          title: "Account Information",
          content: `• Email address
• Password (hashed and encrypted)
• Display name (optional)
• Authentication method (email, Google OAuth)`,
        },
        {
          title: "Usage Information",
          content: `• Text you submit for translation or refinement
• Selected languages (from/to)
• Selected tone preferences
• Saved translations and refinements
• Bookmarked languages`,
        },
        {
          title: "Payment Information",
          content: `• Subscription plan (monthly/annual)
• Billing status
• Payment method type (card ending digits only)
• Transaction history`,
        },
        {
          title: "Automatically Collected Data",
          content: `• Device type and operating system
• Browser/app version
• IP address
• Approximate location (country/region only)
• Timestamps of activity
• Features used, frequency of use, session duration`,
        },
      ],
    },
    {
      id: "usage",
      title: "How We Use Your Information",
      content: `We use your information to:
• Provide and maintain the App
• Process payments and subscriptions
• Improve features and fix bugs
• Send essential account emails
• Comply with legal obligations
• Detect and prevent fraud

Your information is retained for the duration of your account plus 30 days, unless required by law.`,
    },
    {
      id: "ai",
      title: "AI Processing",
      content: `Your submitted text is sent to OpenAI (GPT-4o) for refinement and translation.

What happens to your text:
• Processed in real-time; not stored by OpenAI by default
• Sent via encrypted HTTPS
• Covered under OpenAI's privacy policy
• We do not share your data beyond what's necessary

You can review OpenAI's practices at https://openai.com/privacy.`,
    },
    {
      id: "sharing",
      title: "Who We Share Your Information With",
      content: `We share your information only with essential third parties:

• OpenAI — for translation & refinement
• Stripe — for payment processing
• Supabase — for database & authentication
• Vercel — for app hosting (aggregate analytics only)

We do NOT sell, rent, or trade your personal information.`,
    },
    {
      id: "rights",
      title: "Your Rights",
      content: `Depending on your location, you may have the right to:

GDPR (EU/UK):
• Access, correct, or delete your data
• Export your data to another service
• Object to processing

CCPA (California):
• Know what data we collect
• Delete your data
• Opt-out of data sharing

To exercise any right, email privacy@tonara.app with "Data Subject Request" in the subject line. We will respond within 30 days.`,
    },
    {
      id: "security",
      title: "Data Security",
      content: `We protect your information using:
• HTTPS encryption for all data in transit
• Hashed passwords (bcrypt)
• Encrypted sensitive fields at rest
• Limited access to authorized personnel
• OWASP Top 10 security practices

No system is 100% secure. We take reasonable measures to protect your data.`,
    },
    {
      id: "retention",
      title: "Data Retention",
      content: `• Account & profile — until you delete your account
• Saved translations — until you delete or account deleted
• Refinement history — 90 days
• Payment records — 7 years (tax/legal compliance)
• IP logs & analytics — 12 months
• Device/crash logs — 30 days

When you delete your account, all data is removed within 30 days (except where legally required).`,
    },
    {
      id: "third-party",
      title: "Third-Party Services",
      content: `We use these trusted services:

Stripe: Secure payment processing
https://stripe.com/privacy

OpenAI: Text refinement and translation
https://openai.com/privacy

Supabase: Database and authentication
https://supabase.com/privacy`,
    },
    {
      id: "international",
      title: "International Data Transfers",
      content: `Your data may be processed in the United States (OpenAI, Stripe, Vercel) and Australia (Sunset Capital Pty Ltd). By using tonara, you consent to this transfer.

We use Standard Contractual Clauses and service agreements to ensure your data remains protected under applicable privacy laws.`,
    },
    {
      id: "children",
      title: "Children's Privacy",
      content: `tonara is not intended for users under 13. We do not knowingly collect data from children under 13. If we become aware of such collection, we will delete it immediately.

Parents or guardians who believe a child has provided information may contact privacy@tonara.app.`,
    },
    {
      id: "changes",
      title: "Changes to This Policy",
      content: `We may update this Privacy Policy occasionally. Material changes will be announced via:
• Email notification
• In-app notice
• Updated "Last updated" date

Continued use of tonara means you accept the updated policy.`,
    },
    {
      id: "contact",
      title: "Contact Us",
      content: `Privacy questions?
Email: privacy@tonara.app

Data Subject Rights (GDPR/CCPA)?
Email: privacy@tonara.app
Include "Data Subject Request" in subject line

We will respond within 30 days.

Last updated: March 31, 2026`,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.bg,
        color: t.text,
        fontFamily: "'Georgia', serif",
        padding: "20px",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header with back button */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32, marginTop: 10 }}>
          <button
            onClick={() => navigate("account")}
            style={{
              background: "none",
              border: "none",
              color: t.textMuted,
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ←
          </button>
          <h1
            style={{
              fontSize: 28,
              fontWeight: "bold",
              margin: 0,
              letterSpacing: "-0.5px",
            }}
          >
            Privacy Policy
          </h1>
        </div>

        <p
          style={{
            fontSize: 12,
            color: t.textDim,
            marginBottom: 28,
            fontStyle: "italic",
          }}
        >
          Last updated March 31, 2026
        </p>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sections.map((section) => (
            <div
              key={section.id}
              style={{
                border: `1px solid ${t.border}`,
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: t.surface2,
                  border: "none",
                  color: t.text,
                  fontSize: 14,
                  fontWeight: "bold",
                  fontFamily: "'Georgia', serif",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = t.surface)}
                onMouseLeave={(e) => (e.target.style.background = t.surface2)}
              >
                <span>{section.title}</span>
                <span
                  style={{
                    fontSize: 16,
                    color: t.accent,
                    transition: "transform 0.2s",
                    transform: expandedSections[section.id]
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                >
                  ▼
                </span>
              </button>

              {/* Section Content */}
              {expandedSections[section.id] && (
                <div
                  style={{
                    padding: "14px 16px",
                    borderTop: `1px solid ${t.border}`,
                    background: t.bg,
                  }}
                >
                  {section.subsections ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {section.subsections.map((subsection, i) => (
                        <div key={i}>
                          <h4
                            style={{
                              fontSize: 12,
                              fontWeight: "bold",
                              color: t.accent,
                              margin: "0 0 6px 0",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            {subsection.title}
                          </h4>
                          <p
                            style={{
                              fontSize: 12,
                              color: t.textMuted,
                              margin: 0,
                              lineHeight: 1.65,
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {subsection.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p
                      style={{
                        fontSize: 12,
                        color: t.textMuted,
                        margin: 0,
                        lineHeight: 1.65,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {section.content}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div
          style={{
            marginTop: 32,
            padding: 20,
            background: t.surface2,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: t.textMuted,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Questions about your data?{" "}
            <a
              href="mailto:privacy@tonara.app"
              style={{
                color: t.accent,
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Email us
            </a>
          </p>
        </div>

        {/* Spacer for mobile */}
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
