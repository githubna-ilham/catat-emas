export default function Home() {
  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Gold Price API</h1>
      <p>API harga emas dari berbagai sumber.</p>
      <h2>Endpoints</h2>
      <ul>
        <li><code>GET /api/gold-prices/vendors</code> — List vendor aktif</li>
        <li><code>GET /api/gold-prices/:key</code> — Harga emas by vendor</li>
      </ul>
      <p>Header: <code>X-API-Key: your-api-key</code></p>
    </div>
  );
}
