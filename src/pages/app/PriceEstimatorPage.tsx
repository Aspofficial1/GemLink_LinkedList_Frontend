import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, TrendingUp, TrendingDown,
  Minus, RefreshCw, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { getAllGems } from "../../api/api";

// =============================================================
// API helpers
// =============================================================
const BASE_URL = "http://localhost:4567/api";

async function fetchEstimateForGem(gemId: string) {
  const res = await fetch(`${BASE_URL}/estimate/${gemId}`);
  return res.json();
}

async function fetchMarketOverview() {
  const res = await fetch(`${BASE_URL}/estimate/overview`);
  return res.json();
}

// =============================================================
// Sub-components
// =============================================================
const StatusBadge: React.FC<{ estimate: any }> = ({ estimate }) => (
  <span
    style={{
      background:    estimate.pricingStatusColor     || "#F3F4F6",
      color:         estimate.pricingStatusTextColor || "#374151",
      fontSize:      12,
      fontWeight:    700,
      padding:       "4px 14px",
      borderRadius:  20,
      letterSpacing: 0.3,
    }}
  >
    {estimate.pricingStatusLabel || estimate.pricingStatus}
  </span>
);

const RangeBar: React.FC<{
  low: number; mid: number; high: number; actual: number;
}> = ({ low, mid, high, actual }) => {
  const min   = Math.min(low, actual) * 0.9;
  const max   = Math.max(high, actual) * 1.1;
  const range = max - min || 1;

  const pct = (val: number) =>
    Math.max(0, Math.min(100, ((val - min) / range) * 100));

  return (
    <div className="relative h-10 w-full">
      {/* Track */}
      <div className="absolute top-4 left-0 right-0 h-2 bg-surface-2 rounded-full" />

      {/* Estimated range band */}
      <div
        className="absolute top-4 h-2 rounded-full"
        style={{
          left:       `${pct(low)}%`,
          width:      `${pct(high) - pct(low)}%`,
          background: "rgba(27,79,138,0.15)",
          border:     "1px solid rgba(27,79,138,0.35)",
        }}
      />

      {/* Mid dot */}
      <div
        className="absolute w-3 h-3 rounded-full border-2 border-white"
        style={{
          top:        "10px",
          left:       `calc(${pct(mid)}% - 6px)`,
          background: "#1B4F8A",
          boxShadow:  "0 1px 4px rgba(27,79,138,0.5)",
        }}
        title={`Mid estimate: Rs. ${mid.toLocaleString()}`}
      />

      {/* Actual dot */}
      <div
        className="absolute w-3 h-3 rounded-full border-2 border-white"
        style={{
          top:        "10px",
          left:       `calc(${pct(actual)}% - 6px)`,
          background: actual < mid ? "#166534" : "#991B1B",
          boxShadow:  "0 1px 4px rgba(0,0,0,0.25)",
        }}
        title={`Actual: Rs. ${actual.toLocaleString()}`}
      />

      {/* Labels */}
      <div className="absolute -bottom-5 flex justify-between w-full text-[10px] text-text-muted select-none">
        <span>Rs. {Math.round(low / 1000)}K</span>
        <span>Mid Rs. {Math.round(mid / 1000)}K</span>
        <span>Rs. {Math.round(high / 1000)}K</span>
      </div>
    </div>
  );
};

// =============================================================
// Main PriceEstimatorPage
// =============================================================
const PriceEstimatorPage: React.FC = () => {
  const [allGems, setAllGems]                 = useState<any[]>([]);
  const [selectedGem, setSelectedGem]         = useState("");
  const [searchInput, setSearchInput]         = useState("");
  const [estimate, setEstimate]               = useState<any>(null);
  const [overview, setOverview]               = useState<any>(null);
  const [loading, setLoading]                 = useState(false);
  const [loadingGems, setLoadingGems]         = useState(true);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [error, setError]                     = useState("");
  const [showBreakdown, setShowBreakdown]     = useState(false);

  // Load all gems
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

  // Load market overview
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchMarketOverview();
        if (res.success) setOverview(res.data);
      } catch (e) { console.error(e); }
      finally { setLoadingOverview(false); }
    })();
  }, []);

  // Load estimate when gem changes
  useEffect(() => {
    if (selectedGem) loadEstimate(selectedGem);
  }, [selectedGem]);

  const loadEstimate = async (gemId: string) => {
    setLoading(true);
    setError("");
    setEstimate(null);
    setShowBreakdown(false);
    try {
      const res = await fetchEstimateForGem(gemId);
      if (res.success && res.data) setEstimate(res.data);
      else setError(res.message || "Failed to load estimate.");
    } catch (e) {
      setError("Could not connect to the server.");
    } finally { setLoading(false); }
  };

  const handleSearch = () => {
    if (searchInput.trim()) setSelectedGem(searchInput.trim());
  };

  // Chart data — price in thousands
  const chartData = (estimate?.priceHistory || []).map((h: any) => ({
    stage:  (h.stageName || `Stage ${h.stageNumber}`).replace(" Stage", ""),
    priceK: Math.round(h.price / 1000),
  }));

  const priceHistory: any[] = estimate?.priceHistory        || [];
  const breakdown:    any[] = estimate?.calculationBreakdown|| [];

  return (
    <div className="p-8 space-y-6">

      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Price Estimator
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Estimated market value based on gem type, weight, origin, and journey stages
        </p>
      </div>

      {/* Market overview cards */}
      {overview && !loadingOverview && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            {
              label: "Total Gems",
              value: overview.totalGems || 0,
              color: "#1B4F8A",
            },
            {
              label: "Est. Portfolio",
              value: `Rs. ${Math.round((overview.totalEstimatedValue || 0) / 1000)}K`,
              color: "#1B4F8A",
            },
            {
              label: "Underpriced",
              value: overview.underpricedCount || 0,
              color: "#166534",
            },
            {
              label: "Overpriced",
              value: overview.overpricedCount || 0,
              color: "#991B1B",
            },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                {card.label}
              </p>
              <p className="text-2xl font-bold" style={{ color: card.color }}>
                {card.value}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Gem selector */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            placeholder="Type Gem ID to estimate..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            className="w-full h-11 pl-11 pr-28 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-3 bg-primary text-primary-foreground rounded-lg text-xs font-semibold"
          >
            Estimate
          </button>
        </div>

        {/* Dropdown */}
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
            onClick={() => selectedGem && loadEstimate(selectedGem)}
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
          Calculating market estimate...
        </div>
      )}

      {/* Estimate result */}
      {!loading && estimate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-5"
        >

          {/* ── Main estimate card ────────────────────────────── */}
          <div className="bg-card border border-border rounded-2xl p-8">

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <p className="font-mono text-xs text-text-muted mb-1">
                  {estimate.gemId}
                </p>
                <h2 className="text-xl font-bold text-text-primary">
                  {estimate.gemType}
                </h2>
                <p className="text-sm text-text-muted mt-1">
                  {estimate.currentWeight} ct &middot; {estimate.stageCount} stages &middot;{" "}
                  {estimate.isCeylonVerified ? "✓ Ceylon Verified" : "Unverified Origin"}
                </p>
              </div>
              <StatusBadge estimate={estimate} />
            </div>

            {/* Low / Mid / High estimate */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {[
                { label: "Low Estimate",  value: estimate.estimatedLow,  dim: true  },
                { label: "Mid Estimate",  value: estimate.estimatedMid,  dim: false },
                { label: "High Estimate", value: estimate.estimatedHigh, dim: true  },
              ].map(item => (
                <div
                  key={item.label}
                  className={`rounded-xl p-4 text-center border ${
                    item.dim
                      ? "bg-surface border-border"
                      : "bg-primary border-primary"
                  }`}
                >
                  <p className={`text-xs mb-1 ${item.dim ? "text-text-muted" : "text-white/70"}`}>
                    {item.label}
                  </p>
                  <p className={`text-xl font-bold ${item.dim ? "text-text-primary" : "text-white"}`}>
                    Rs. {Number(item.value).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Range bar */}
            <div className="mb-12 px-2">
              <p className="text-xs text-text-muted mb-5">
                Estimated range vs actual price
              </p>
              <RangeBar
                low={estimate.estimatedLow}
                mid={estimate.estimatedMid}
                high={estimate.estimatedHigh}
                actual={estimate.actualCurrentPrice}
              />
              <div className="flex gap-5 mt-9 text-xs text-text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
                  Mid estimate
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-700 inline-block" />
                  Actual price (below estimate)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-700 inline-block" />
                  Actual price (above estimate)
                </span>
              </div>
            </div>

            {/* Actual vs deviation */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-surface border border-border rounded-xl p-4">
                <p className="text-xs text-text-muted mb-1">Actual Current Price</p>
                <p className="text-2xl font-bold text-text-primary">
                  Rs. {Number(estimate.actualCurrentPrice).toLocaleString()}
                </p>
              </div>
              <div className="bg-surface border border-border rounded-xl p-4">
                <p className="text-xs text-text-muted mb-1">Deviation from Estimate</p>
                <div className="flex items-center gap-2 mt-1">
                  {estimate.deviationPercent > 0
                    ? <TrendingUp   size={20} className="text-red-600" />
                    : estimate.deviationPercent < 0
                    ? <TrendingDown size={20} className="text-green-700" />
                    : <Minus        size={20} className="text-text-muted" />
                  }
                  <p className="text-2xl font-bold text-text-primary">
                    {estimate.deviationPercent > 0 ? "+" : ""}
                    {estimate.deviationPercent}%
                  </p>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  {estimate.deviationLabel}
                </p>
              </div>
            </div>

            {/* Recommendation */}
            {estimate.recommendation && (
              <div className="bg-surface border border-border rounded-xl p-4">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                  Recommendation
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {estimate.recommendation}
                </p>
              </div>
            )}
          </div>

          {/* ── Price history chart ──────────────────────────── */}
          {chartData.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-base font-semibold text-text-primary mb-6">
                Price Appreciation Across Stages (Rs. thousands)
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="#F0F0F0" vertical={false} />
                  <XAxis
                    dataKey="stage"
                    tick={{ fontSize: 12, fill: "#888" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#888" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `${v}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      border:       "1px solid #E8E8E8",
                      borderRadius: 10,
                      fontSize:     13,
                      padding:      "10px 14px",
                    }}
                    formatter={(v: any) => [
                      `Rs. ${(v * 1000).toLocaleString()}`,
                      "Price",
                    ]}
                  />
                  <ReferenceLine
                    y={Math.round(estimate.estimatedMid / 1000)}
                    stroke="#1B4F8A"
                    strokeDasharray="5 5"
                    label={{
                      value:    "Estimate",
                      fontSize: 10,
                      fill:     "#1B4F8A",
                      position: "insideTopRight",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="priceK"
                    stroke="#1B4F8A"
                    strokeWidth={2.5}
                    dot={{ r: 5, fill: "#1B4F8A", strokeWidth: 0 }}
                    activeDot={{ r: 7 }}
                    name="Price (Rs.K)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Calculation breakdown ────────────────────────── */}
          {breakdown.length > 0 && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowBreakdown(!showBreakdown)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-surface-2 transition-colors"
              >
                <p className="text-sm font-semibold text-text-primary">
                  How was this estimated? — Step by step breakdown
                </p>
                {showBreakdown
                  ? <ChevronUp   size={18} className="text-text-muted" />
                  : <ChevronDown size={18} className="text-text-muted" />
                }
              </button>

              <AnimatePresence>
                {showBreakdown && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden border-t border-border"
                  >
                    <div className="p-6 space-y-5">

                      {/* Multiplier chips */}
                      <div className="grid md:grid-cols-3 gap-3">
                        {[
                          { label: "Weight Multiplier", value: `${estimate.weightMultiplier}x` },
                          { label: "Origin Multiplier", value: `${estimate.originMultiplier}x` },
                          { label: "Stage Multiplier",  value: `${estimate.stageMultiplier}x`  },
                        ].map(m => (
                          <div
                            key={m.label}
                            className="bg-surface border border-border rounded-xl p-3 text-center"
                          >
                            <p className="text-xs text-text-muted">{m.label}</p>
                            <p className="text-xl font-bold text-primary mt-0.5">
                              {m.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Steps */}
                      <div className="space-y-3">
                        {breakdown.map((step: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-start justify-between gap-4 text-sm pb-3 border-b border-border last:border-0 last:pb-0"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-text-primary">
                                {step.label}
                              </p>
                              <p className="text-xs text-text-muted mt-0.5">
                                {step.description}
                              </p>
                            </div>
                            <p className="font-mono font-bold text-primary whitespace-nowrap">
                              Rs. {Number(step.runningTotal).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ── Stage price history table ────────────────────── */}
          {priceHistory.length > 0 && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <p className="text-sm font-semibold text-text-primary">
                  Price at Each Stage
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface text-xs text-text-muted">
                      <th className="p-3 text-left font-medium">#</th>
                      <th className="p-3 text-left font-medium">Stage</th>
                      <th className="p-3 text-left font-medium">Location</th>
                      <th className="p-3 text-left font-medium">Date</th>
                      <th className="p-3 text-right font-medium">Weight</th>
                      <th className="p-3 text-right font-medium">Price</th>
                      <th className="p-3 text-right font-medium">Value Added</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceHistory.map((h: any, i: number) => (
                      <tr
                        key={i}
                        className="border-t border-border hover:bg-surface transition-colors"
                      >
                        <td className="p-3 text-text-muted">{h.stageNumber}</td>
                        <td className="p-3 font-medium text-text-primary">
                          {h.stageName}
                        </td>
                        <td className="p-3 text-text-secondary">{h.location}</td>
                        <td className="p-3 text-text-secondary">{h.date}</td>
                        <td className="p-3 text-right text-text-secondary">
                          {h.weight} ct
                        </td>
                        <td className="p-3 text-right font-semibold text-text-primary">
                          Rs. {Number(h.price).toLocaleString()}
                        </td>
                        <td className="p-3 text-right">
                          {h.priceIncrease > 0 ? (
                            <span className="text-green-700 font-medium">
                              +Rs. {Number(h.priceIncrease).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default PriceEstimatorPage;