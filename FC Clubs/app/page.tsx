export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Matchday API</h1>
      <p style={{ marginTop: "0.5rem", color: "#666" }}>API is running. See <code>app/api/</code> for available routes.</p>
      <ul style={{ marginTop: "1rem", lineHeight: 2 }}>
        <li><code>GET /api/auth/me</code></li>
        <li><code>GET /api/standings</code></li>
        <li><code>GET /api/matches</code></li>
        <li><code>GET /api/clubs</code></li>
        <li><code>GET /api/players</code></li>
        <li><code>GET /api/players/leaders</code></li>
        <li><code>GET /api/insights</code></li>
        <li><code>GET /api/profile</code></li>
        <li><code>GET /api/invites</code></li>
        <li><code>GET /api/notifications</code></li>
      </ul>
    </main>
  );
}
