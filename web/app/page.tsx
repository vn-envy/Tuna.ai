export default function Home() {
  return (
    <main className="page">
      <div className="container">
        <div className="brand">
          <span className="fin" aria-hidden>
            ◢
          </span>
          <span className="wordmark">Tuna</span>
        </div>

        <h1 className="headline">Plan once. Tuna keeps swimming.</h1>

        <p className="lede">
          A migratory AI travel agent. Tell Tuna where you&apos;re going. It plans the trip, then
          keeps watching every variable that could change it — prices, schedules, weather,
          advisories — and tells you the moment something shifts.
        </p>

        <div className="status">
          <div className="status-row">
            <span className="status-dot" />
            <span>Day 1 — Tuna is in the water.</span>
          </div>
          <p className="status-note">
            Building in public.{" "}
            <a href="https://github.com/Builder-Neekhil/tuna" target="_blank" rel="noreferrer">
              Follow the build →
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
