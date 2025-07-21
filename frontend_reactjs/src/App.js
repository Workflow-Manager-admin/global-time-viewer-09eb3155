import React, { useState, useEffect, useMemo } from "react";
import "./App.css";

// List of time zones - can be extended as needed. For demo: main cities from every continent.
const AVAILABLE_TIMEZONES = [
  { city: "New York", tz: "America/New_York", country: "USA" },
  { city: "London", tz: "Europe/London", country: "UK" },
  { city: "Paris", tz: "Europe/Paris", country: "France" },
  { city: "Dubai", tz: "Asia/Dubai", country: "UAE" },
  { city: "Moscow", tz: "Europe/Moscow", country: "Russia" },
  { city: "Beijing", tz: "Asia/Shanghai", country: "China" },
  { city: "Tokyo", tz: "Asia/Tokyo", country: "Japan" },
  { city: "Sydney", tz: "Australia/Sydney", country: "Australia" },
  { city: "Mumbai", tz: "Asia/Kolkata", country: "India" },
  { city: "Sao Paulo", tz: "America/Sao_Paulo", country: "Brazil" },
  { city: "Cape Town", tz: "Africa/Johannesburg", country: "South Africa" },
  { city: "Los Angeles", tz: "America/Los_Angeles", country: "USA" },
  { city: "Berlin", tz: "Europe/Berlin", country: "Germany" },
  { city: "Singapore", tz: "Asia/Singapore", country: "Singapore" },
  { city: "Seoul", tz: "Asia/Seoul", country: "South Korea" },
  { city: "Bangkok", tz: "Asia/Bangkok", country: "Thailand" },
  { city: "Toronto", tz: "America/Toronto", country: "Canada" },
];

// Helpers for localStorage
const WATCHLIST_KEY = "world_clock_watchlist";
function loadWatchlist() {
  try {
    const list = JSON.parse(window.localStorage.getItem(WATCHLIST_KEY));
    if (Array.isArray(list)) {
      return list;
    }
    return ["Europe/London", "America/New_York"];
  } catch {
    return ["Europe/London", "America/New_York"];
  }
}
function saveWatchlist(list) {
  window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
}

// Format time using Intl.DateTimeFormat
function getTimeInZone(tz) {
  const d = new Date();
  return new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: tz,
  }).format(d);
}

/**
 * ClockCard displays the time in a single timezone
 * PUBLIC_INTERFACE
 */
function ClockCard({ tz, city, country, onRemove, accentColor }) {
  const [now, setNow] = useState(getTimeInZone(tz));
  useEffect(() => {
    // Update every second for live time.
    const id = setInterval(() => setNow(getTimeInZone(tz)), 1000);
    return () => clearInterval(id);
  }, [tz]);
  return (
    <div className="clock-card">
      <div className="clock-city">
        <span>{city}, {country}</span>
        {onRemove && (
          <button className="remove-btn" title="Remove this city" onClick={() => onRemove(tz)} aria-label={`Remove ${city}`}>
            ×
          </button>
        )}
      </div>
      <div className="clock-time" style={{ color: accentColor }}>{now}</div>
      <div className="clock-tz">{tz}</div>
    </div>
  );
}

/**
 * Sidebar component for city/timezone search and selection.
 * PUBLIC_INTERFACE
 */
function Sidebar({ availableTimezones, onAdd, watchlist, accentColor, secondaryColor }) {
  const [query, setQuery] = useState("");
  // Filter out watchlist already included.
  const options = useMemo(() => {
    let q = query.trim().toLowerCase();
    return availableTimezones
      .filter(
        ({ tz, city, country }) =>
          !watchlist.includes(tz) &&
          (tz.toLowerCase().includes(q) ||
            city.toLowerCase().includes(q) ||
            country.toLowerCase().includes(q))
      )
      .slice(0, 10);
  }, [query, availableTimezones, watchlist]);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">Add City</div>
      <input
        type="text"
        placeholder="Search city or timezone"
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="search-input"
        aria-label="Search city or timezone"
      />
      <div className="city-results">
        {options.length === 0 && query.length > 0 && (
          <div className="no-city" style={{ color: secondaryColor }}>No match.</div>
        )}
        {options.map(({ tz, city, country }) => (
          <button
            key={tz}
            className="city-option"
            onClick={() => {
              onAdd(tz);
              setQuery(""); // clear to encourage further search
            }}
            style={{
              borderColor: accentColor,
            }}
            aria-label={`Add ${city}, ${country}`}
          >
            {city}, <span className="country">{country}</span>
            <div className="tz-label">{tz}</div>
          </button>
        ))}
      </div>
    </aside>
  );
}

/**
 * Main World Clock App
 * PUBLIC_INTERFACE
 */
function App() {
  // The watchlist stores tz database names.
  const [watchlist, setWatchlist] = useState(() => loadWatchlist());

  const { accent, primary, secondary } = LIGHT_COLORS;

  // Add to watchlist
  // PUBLIC_INTERFACE
  function handleAdd(tz) {
    if (!watchlist.includes(tz)) {
      const updated = [...watchlist, tz];
      setWatchlist(updated);
      saveWatchlist(updated);
    }
  }

  // Remove from watchlist
  // PUBLIC_INTERFACE
  function handleRemove(tz) {
    const updated = watchlist.filter(zone => zone !== tz);
    setWatchlist(updated);
    saveWatchlist(updated);
  }

  // Populate card info
  const cards = useMemo(
    () =>
      watchlist
        .map(tz =>
          AVAILABLE_TIMEZONES.find(z => z.tz === tz)
            ? AVAILABLE_TIMEZONES.find(z => z.tz === tz)
            : { tz: tz, city: tz.split("/").pop().replace("_", " "), country: "" }
        ),
    [watchlist]
  );

  return (
    <div className="global-clock-app">
      <header className="top-header" style={{ background: primary }}>
        <span className="header-title" style={{ color: accent }}>
          🌍 World Clock
        </span>
      </header>
      <div className="main-content">
        <Sidebar
          availableTimezones={AVAILABLE_TIMEZONES}
          onAdd={handleAdd}
          watchlist={watchlist}
          accentColor={accent}
          secondaryColor={secondary}
        />
        <main className="clocks-area">
          {cards.length === 0 ? (
            <div className="empty-msg">No cities in your watchlist.</div>
          ) : (
            cards.map(z => (
              <ClockCard
                key={z.tz}
                {...z}
                onRemove={handleRemove}
                accentColor={accent}
              />
            ))
          )}
        </main>
      </div>
      <footer className="footer">
        <span>
          World Clock – Powered by React |{' '}
          <a href="https://github.com/kavia-ai" rel="noopener noreferrer" target="_blank">
            GitHub
          </a>
        </span>
      </footer>
    </div>
  );
}

// Colors: primary (#1e293b), secondary (#64748b), accent (#38bdf8)
const LIGHT_COLORS = {
  accent: "#38bdf8",
  primary: "#1e293b",
  secondary: "#64748b",
};

export default App;
