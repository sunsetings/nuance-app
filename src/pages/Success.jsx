export default function Success() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#050505",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Georgia', serif",
      color: "#f5f1e8",
      padding: 24,
      textAlign: "center",
    }}>
      <div>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
        <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>
          Welcome to tonara Pro
        </h1>
        <p style={{ fontSize: 14, color: "#9a9690", marginBottom: 32, lineHeight: 1.7 }}>
          Your subscription is active. All Pro features are now unlocked.
        </p>
        
          href="/"
          style={{
            display: "inline-block",
            padding: "12px 28px",
            background: "#c8f0a0",
            color: "#0a1a00",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          Start using tonara →
        </a>
      </div>
    </div>
  );
}
