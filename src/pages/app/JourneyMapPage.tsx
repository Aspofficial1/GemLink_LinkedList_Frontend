import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search, RefreshCw, ArrowRight, ArrowLeft } from "lucide-react";
import { getAllGems } from "../../api/api";

// =============================================================
// Leaflet loaded via CDN — no npm install needed
// CSS and JS are injected dynamically on first render
// =============================================================
declare const L: any;

// =============================================================
// API helpers
// =============================================================
const BASE_URL = "http://localhost:4567/api";

async function fetchJourneyMapData(gemId: string) {
  const res = await fetch(`${BASE_URL}/map/${gemId}`);
  return res.json();
}

// =============================================================
// Constants
// =============================================================
const PIN_COLORS: Record<string, string> = {
  MINING:    "#1B4F8A",
  CUTTING:   "#C9A84C",
  TRADING:   "#166534",
  EXPORTING: "#7C3AED",
  BUYING:    "#DC2626",
};

const PIN_LABELS: Record<string, string> = {
  MINING:    "Mine",
  CUTTING:   "Cut",
  TRADING:   "Trade",
  EXPORTING: "Export",
  BUYING:    "Buyer",
};

// Sri Lanka bounds for checking domestic vs international
const LAT_MIN = 5.8, LAT_MAX = 10.0;
const LNG_MIN = 79.6, LNG_MAX = 82.0;

// =============================================================
// LeafletMap component
// Uses real OpenStreetMap tiles — shows actual Sri Lanka map
// =============================================================
const LeafletMap: React.FC<{
  pins:     any[];
  reversed: boolean;
  center:   [number, number];
}> = ({ pins, reversed, center }) => {
  const mapRef    = useRef<HTMLDivElement>(null);
  const mapObjRef = useRef<any>(null);
  const layersRef = useRef<any[]>([]);

  // ── Inject Leaflet CSS + JS on mount ──────────────────────
  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link  = document.createElement("link");
      link.id     = "leaflet-css";
      link.rel    = "stylesheet";
      link.href   =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    if (!(window as any).L) {
      const script  = document.createElement("script");
      script.src    =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (mapObjRef.current) {
        mapObjRef.current.remove();
        mapObjRef.current = null;
      }
    };
  }, []);

  // ── Re-render pins when data changes ──────────────────────
  useEffect(() => {
    if (mapObjRef.current) renderPins();
  }, [pins, reversed]);

  // ── Initialise the Leaflet map ─────────────────────────────
  const initMap = () => {
    if (!mapRef.current || mapObjRef.current) return;
    if (!(window as any).L) { setTimeout(initMap, 300); return; }

    const map = (window as any).L.map(mapRef.current, {
      center:          center,
      zoom:            8,
      zoomControl:     true,
      scrollWheelZoom: true,
    });

    // Real OpenStreetMap tiles — actual Sri Lanka roads, coastline, labels
    (window as any).L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }
    ).addTo(map);

    mapObjRef.current = map;
    renderPins();
  };

  // ── Render all pins and route line ────────────────────────
  const renderPins = () => {
    const map = mapObjRef.current;
    if (!map || !(window as any).L) return;

    // Clear old layers
    layersRef.current.forEach(l => {
      try { map.removeLayer(l); } catch (_) {}
    });
    layersRef.current = [];

    const displayPins = reversed ? [...pins].reverse() : pins;
    if (displayPins.length === 0) return;

    const latLngs: [number, number][] = [];

    displayPins.forEach((pin: any, i: number) => {
      if (!pin.lat || !pin.lng) return;

      const color  = pin.pinColor || PIN_COLORS[pin.stageType] || "#1B4F8A";
      const label  = PIN_LABELS[pin.stageType] || pin.stageType || "";
      const isHead = i === 0;
      const isTail = i === displayPins.length - 1;
      const size   = isHead || isTail ? 38 : 30;

      // Custom HTML circle icon
      const icon = (window as any).L.divIcon({
        className: "",
        iconSize:  [size, size],
        iconAnchor:[size / 2, size / 2],
        popupAnchor: [0, -(size / 2) - 4],
        html: `
          <div style="
            width:${size}px;
            height:${size}px;
            border-radius:50%;
            background:${color};
            border:3px solid white;
            box-shadow:0 2px 10px rgba(0,0,0,0.35)
              ${isHead || isTail ? `, 0 0 0 5px ${color}33` : ""};
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:${size > 32 ? 12 : 10}px;
            font-weight:800;
            color:white;
            font-family:system-ui,sans-serif;
          ">${i + 1}</div>
        `,
      });

      const marker = (window as any).L.marker([pin.lat, pin.lng], { icon });

      // Rich popup
      const certRow = pin.certificateNumber
        ? `<div style="margin-top:5px;padding-top:5px;border-top:1px solid #f0f0f0;">
             <span style="font-size:11px;color:#666;">🏅 Cert: ${pin.certificateNumber}</span>
           </div>`
        : "";
      const flightRow = pin.flightNumber
        ? `<div><span style="font-size:11px;color:#666;">✈️ Flight: ${pin.flightNumber} → ${pin.destinationCountry || ""}</span></div>`
        : "";
      const priceChange = pin.priceChangeFromPrev > 0
        ? `<span style="color:#166534;font-size:11px;">+Rs. ${Number(pin.priceChangeFromPrev).toLocaleString()}</span>`
        : "";

      marker.bindPopup(`
        <div style="font-family:system-ui,sans-serif;min-width:200px;max-width:240px;">
          <div style="
            background:${color};color:white;
            padding:9px 13px;border-radius:10px 10px 0 0;
            font-weight:700;font-size:13px;
          ">
            ${i + 1}. ${pin.stageLabel || pin.stageType}
          </div>
          <div style="
            padding:11px 13px;background:white;
            border-radius:0 0 10px 10px;
            border:1px solid #eee;border-top:none;
          ">
            <div style="margin-bottom:4px;font-size:12px;color:#444;">
              📍 <b>${pin.location}</b>
            </div>
            <div style="margin-bottom:3px;font-size:12px;color:#555;">
              👤 ${pin.personName}
            </div>
            <div style="margin-bottom:3px;font-size:12px;color:#555;">
              📅 ${pin.date}
            </div>
            <div style="margin-bottom:3px;font-size:12px;color:#555;">
              ⚖️ ${pin.weightInCarats} carats
            </div>
            <div style="font-size:13px;font-weight:700;color:${color};">
              Rs. ${Number(pin.priceInRupees).toLocaleString()}
              ${priceChange ? `&nbsp;&nbsp;${priceChange}` : ""}
            </div>
            ${certRow}
            ${flightRow}
          </div>
        </div>
      `, { maxWidth: 260 });

      // Always-visible label above pin
      marker.bindTooltip(`<b>${label}</b>`, {
        permanent:  true,
        direction:  "top",
        offset:     [0, -(size / 2) - 2],
        className:  "",
        opacity:    1,
      });

      marker.addTo(map);
      layersRef.current.push(marker);
      latLngs.push([pin.lat, pin.lng]);
    });

    // Dashed route polyline connecting all pins
    if (latLngs.length >= 2) {
      const line = (window as any).L.polyline(latLngs, {
        color:     "#1B4F8A",
        weight:    3,
        opacity:   0.65,
        dashArray: "12 7",
      }).addTo(map);
      layersRef.current.push(line);
    }

    // Auto-fit bounds to show all pins
    if (latLngs.length === 1) {
      map.setView(latLngs[0], 10);
    } else if (latLngs.length > 1) {
      const bounds = (window as any).L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 13 });
    }
  };

  return (
    <div
      ref={mapRef}
      style={{
        width:        "100%",
        height:       520,
        borderRadius: 14,
        overflow:     "hidden",
        zIndex:       0,
        border:       "1px solid #E8E8E8",
      }}
    />
  );
};

// =============================================================
// Main JourneyMapPage
// =============================================================
const JourneyMapPage: React.FC = () => {
  const [allGems, setAllGems]         = useState<any[]>([]);
  const [selectedGem, setSelectedGem] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [mapData, setMapData]         = useState<any>(null);
  const [loading, setLoading]         = useState(false);
  const [loadingGems, setLoadingGems] = useState(true);
  const [reversed, setReversed]       = useState(false);
  const [error, setError]             = useState("");
  const [activePin, setActivePin]     = useState<number | null>(null);

  // Load all gems for dropdown
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllGems();
        if (res.success && res.data) {
          const gems = res.data as any[];
          setAllGems(gems);
          if (gems.length > 0) setSelectedGem(gems[0].gemId);
        }
      } catch (e) { console.error(e); }
      finally { setLoadingGems(false); }
    })();
  }, []);

  // Load map data when gem changes
  useEffect(() => {
    if (selectedGem) loadMapData(selectedGem);
  }, [selectedGem]);

  const loadMapData = async (gemId: string) => {
    setLoading(true);
    setError("");
    setMapData(null);
    setReversed(false);
    setActivePin(null);
    try {
      const res = await fetchJourneyMapData(gemId);
      if (res.success && res.data) setMapData(res.data);
      else setError(res.message || "Failed to load journey map.");
    } catch (e) {
      setError("Could not connect to the server.");
    } finally { setLoading(false); }
  };

  const handleSearch = () => {
    if (searchInput.trim()) setSelectedGem(searchInput.trim());
  };

  const pins: any[]        = mapData?.pins || [];
  const stats: any         = mapData?.routeStats || {};
  const displayPins        = reversed ? [...pins].reverse() : pins;
  const mapCenter: [number, number] = mapData?.mapCenter
    ? [mapData.mapCenter.lat, mapData.mapCenter.lng]
    : [7.8731, 80.7718];

  const intlPins = pins.filter(
    (p: any) =>
      !(p.lat >= LAT_MIN && p.lat <= LAT_MAX &&
        p.lng >= LNG_MIN && p.lng <= LNG_MAX)
  );

  return (
    <div className="p-8 space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Journey Map
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Visual map of the gem journey — each Doubly Linked List node plotted
          as a GPS pin on the real Sri Lanka map
        </p>
      </div>

      {/* Gem selector */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            placeholder="Type Gem ID to view journey map..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            className="w-full h-11 pl-11 pr-28 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-3 bg-primary text-primary-foreground rounded-lg text-xs font-semibold"
          >
            View Map
          </button>
        </div>

        <div className="flex gap-2">
          <select
            value={selectedGem}
            onChange={e => {
              setSelectedGem(e.target.value);
              setSearchInput(e.target.value);
            }}
            disabled={loadingGems}
            className="flex-1 h-11 px-3 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {loadingGems ? (
              <option>Loading gems...</option>
            ) : (
              allGems.map(g => (
                <option key={g.gemId} value={g.gemId}>
                  {g.gemId} — {g.gemType || "Unknown"}
                </option>
              ))
            )}
          </select>
          <button
            onClick={() => selectedGem && loadMapData(selectedGem)}
            className="h-11 w-11 flex items-center justify-center border border-border rounded-xl bg-card hover:bg-surface-2 transition-colors"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin text-primary" : "text-text-muted"}
            />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="border border-red-200 bg-red-50 rounded-xl px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-text-muted text-sm">
          Building journey map...
        </div>
      )}

      {/* Map content */}
      {!loading && mapData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-5"
        >

          {/* Gem overview + traversal toggle */}
          <div className="bg-card border border-border rounded-2xl px-6 py-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs text-text-muted">{mapData.gemId}</p>
              <p className="text-lg font-bold text-text-primary mt-0.5">
                {mapData.gemType}
              </p>
              <p className="text-sm text-text-muted mt-1">
                {mapData.totalStages} stage{mapData.totalStages !== 1 ? "s" : ""} &middot;{" "}
                {mapData.totalDistance} km total &middot;{" "}
                {mapData.domesticStages} domestic &middot;{" "}
                {mapData.internationalStages} international &middot;{" "}
                {mapData.isCeylonVerified ? "✓ Ceylon Verified" : "Unverified Origin"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setReversed(false)}
                className={`h-9 px-4 rounded-lg text-sm font-semibold flex items-center gap-2 border transition-all ${
                  !reversed
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-text-secondary hover:bg-surface-2"
                }`}
              >
                <ArrowRight size={14} /> Forward
              </button>
              <button
                onClick={() => setReversed(true)}
                className={`h-9 px-4 rounded-lg text-sm font-semibold flex items-center gap-2 border transition-all ${
                  reversed
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-text-secondary hover:bg-surface-2"
                }`}
              >
                <ArrowLeft size={14} /> Backward
              </button>
            </div>
          </div>

          {/* Traversal note */}
          <p className="text-xs text-text-muted">
            {reversed
              ? "← Backward traversal using prev pointer — Doubly Linked List tail → head"
              : "→ Forward traversal using next pointer — Doubly Linked List head → tail"}
          </p>

          {/* Map + stats grid */}
          <div className="grid lg:grid-cols-[1fr_300px] gap-6">

            {/* Real Leaflet map */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <LeafletMap
                pins={pins}
                reversed={reversed}
                center={mapCenter}
              />
              {/* International destinations */}
              {intlPins.length > 0 && (
                <div className="bg-surface border border-border rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-text-primary mb-2">
                    International Destinations ({intlPins.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {intlPins.map((pin: any, i: number) => (
                      <span
                        key={i}
                        className="text-xs bg-card border border-border rounded-lg px-2 py-1"
                      >
                        {pin.stageNumber}. {pin.location}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right panel */}
            <div className="space-y-4">
              {/* Route stats */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <p className="text-sm font-semibold text-text-primary">
                  Route Statistics
                </p>
                {[
                  { label: "Total Distance",    value: `${stats.totalDistanceKm || 0} km` },
                  { label: "Journey Duration",  value: `${stats.journeyDays || 0} days` },
                  { label: "Total Stages",       value: stats.totalStages || 0 },
                  { label: "Unique Locations",   value: stats.uniqueLocations || 0 },
                  { label: "Domestic Stages",    value: stats.domesticStages || 0 },
                  { label: "International",      value: stats.internationalStages || 0 },
                  { label: "Price Appreciation", value: `Rs. ${Number(stats.totalPriceAppreciation || 0).toLocaleString()}` },
                  { label: "Appreciation %",     value: `${stats.appreciationPercent || 0}%` },
                ].map(row => (
                  <div
                    key={row.label}
                    className="flex justify-between text-sm border-b border-border pb-2.5 last:border-0 last:pb-0"
                  >
                    <span className="text-text-muted">{row.label}</span>
                    <span className="font-semibold text-text-primary">{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Pin legend */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <p className="text-sm font-semibold text-text-primary mb-3">
                  Pin Legend
                </p>
                <div className="space-y-2.5">
                  {Object.entries(PIN_COLORS).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-3 text-sm">
                      <div
                        className="w-5 h-5 rounded-full flex-shrink-0"
                        style={{
                          background: color,
                          border:     "2px solid white",
                          boxShadow:  "0 1px 4px rgba(0,0,0,0.25)",
                        }}
                      />
                      <span className="text-text-secondary capitalize">
                        {type.toLowerCase().replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-text-muted mt-4 pt-3 border-t border-border">
                  Click any pin on the map to see full stage details popup.
                </p>
              </div>
            </div>
          </div>

          {/* Stage details table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <p className="text-sm font-semibold text-text-primary">
                Stage Details — {reversed ? "Backward" : "Forward"} Traversal
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface text-xs text-text-muted">
                    <th className="p-3 text-left font-medium">#</th>
                    <th className="p-3 text-left font-medium">Stage</th>
                    <th className="p-3 text-left font-medium">Location</th>
                    <th className="p-3 text-left font-medium">Person</th>
                    <th className="p-3 text-left font-medium">Date</th>
                    <th className="p-3 text-right font-medium">Weight</th>
                    <th className="p-3 text-right font-medium">Price</th>
                    <th className="p-3 text-right font-medium">Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {displayPins.map((pin: any, i: number) => {
                    const color = pin.pinColor || PIN_COLORS[pin.stageType] || "#1B4F8A";
                    return (
                      <tr
                        key={i}
                        className={`border-t border-border transition-colors cursor-pointer ${
                          activePin === i ? "bg-blue-50" : "hover:bg-surface"
                        }`}
                        onClick={() => setActivePin(activePin === i ? null : i)}
                      >
                        <td className="p-3">
                          <span
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white inline-flex"
                            style={{ background: color }}
                          >
                            {i + 1}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-text-primary">
                          {pin.stageLabel || pin.stageType}
                        </td>
                        <td className="p-3 text-text-secondary">
                          {pin.location}
                          {pin.isInternational && (
                            <span className="ml-1.5 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                              Intl
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-text-secondary">{pin.personName}</td>
                        <td className="p-3 text-text-secondary">{pin.date}</td>
                        <td className="p-3 text-right text-text-secondary">
                          {pin.weightInCarats} ct
                        </td>
                        <td className="p-3 text-right font-semibold text-text-primary">
                          Rs. {Number(pin.priceInRupees).toLocaleString()}
                        </td>
                        <td className="p-3 text-right text-text-muted text-xs">
                          {pin.distanceFromPrev > 0
                            ? `${pin.distanceFromPrev} km`
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Origin → Current summary */}
          {mapData.originPin && mapData.currentPin && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-sm font-semibold text-text-primary mb-4">
                Journey Summary — Head Node → Tail Node
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 bg-surface border border-border rounded-xl p-4 min-w-[160px]">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                    Origin (Head Node)
                  </p>
                  <p className="font-semibold text-text-primary">
                    {mapData.originPin.location}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {mapData.originPin.personName} · {mapData.originPin.date}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Rs. {Number(mapData.originPin.priceInRupees).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-col items-center text-text-muted">
                  <ArrowRight size={20} />
                  <p className="text-[10px] mt-1">{mapData.totalDistance} km</p>
                </div>
                <div className="flex-1 bg-primary border border-primary rounded-xl p-4 min-w-[160px]">
                  <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">
                    Current (Tail Node)
                  </p>
                  <p className="font-semibold text-white">
                    {mapData.currentPin.location}
                  </p>
                  <p className="text-xs text-white/70 mt-0.5">
                    {mapData.currentPin.personName} · {mapData.currentPin.date}
                  </p>
                  <p className="text-xs text-white/70 mt-0.5">
                    Rs. {Number(mapData.currentPin.priceInRupees).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default JourneyMapPage;