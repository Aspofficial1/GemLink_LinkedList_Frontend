import React, { useEffect, useState } from "react";
import BlurText from "../../components/reactbits/BlurText";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getAllGems, compareGems } from "../../api/api";

const ComparePage: React.FC = () => {
  const [gem1Id, setGem1Id]           = useState("");
  const [gem2Id, setGem2Id]           = useState("");
  const [allGems, setAllGems]         = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading]         = useState(false);
  const [loadingGems, setLoadingGems] = useState(true);
  const [error, setError]             = useState("");

  // Load all gems for the dropdowns
  useEffect(() => {
    const fetchGems = async () => {
      try {
        const res = await getAllGems();
        if (res.success && res.data) {
          const gems = res.data as any[];
          setAllGems(gems);
          if (gems.length >= 2) {
            setGem1Id(gems[0].gemId);
            setGem2Id(gems[1].gemId);
          } else if (gems.length === 1) {
            setGem1Id(gems[0].gemId);
          }
        }
      } catch (err) {
        console.error("Failed to load gems:", err);
      } finally {
        setLoadingGems(false);
      }
    };
    fetchGems();
  }, []);

  // Fetch comparison whenever both gem IDs are set and different
  useEffect(() => {
    if (!gem1Id || !gem2Id || gem1Id === gem2Id) {
      setComparisonData(null);
      return;
    }

    const fetchComparison = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await compareGems(gem1Id, gem2Id);
        if (res.success && res.data) {
          setComparisonData(res.data);
        } else {
          setComparisonData(null);
          setError(res.message || "Comparison failed.");
        }
      } catch (err) {
        console.error("Failed to compare gems:", err);
        setComparisonData(null);
        setError("Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [gem1Id, gem2Id]);

  const metrics: any[]   = comparisonData?.comparisonRows || [];
  const barData: any[]   = comparisonData?.chartData      || [];
  const gem1Type: string = comparisonData?.gem1Type       || gem1Id;
  const gem2Type: string = comparisonData?.gem2Type       || gem2Id;

  const gem1Wins = metrics.filter((m: any) => m.gem1Wins).length;
  const gem2Wins = metrics.filter((m: any) => m.gem2Wins).length;

  return (
    <div className="p-8 space-y-6">

      {/* Page header */}
      <div>
        <BlurText
          text="Gem Comparison"
          delay={70}
          direction="top"
          animateBy="words"
          className="font-display text-2xl font-bold text-text-primary"
        />
        <BlurText
          text="Compare two gems side by side across all metrics"
          delay={40}
          direction="bottom"
          animateBy="words"
          className="text-sm text-text-muted mt-1"
        />
      </div>

      {/* Gem selector dropdowns */}
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { val: gem1Id, set: setGem1Id, label: "Gem 1", color: "#1B4F8A" },
          { val: gem2Id, set: setGem2Id, label: "Gem 2", color: "#C9A84C" },
        ].map((sel, idx) => (
          <div key={idx}>
            <div
              className="flex items-center gap-2 mb-2"
            >
              <span
                style={{ background: sel.color }}
                className="w-3 h-3 rounded-full inline-block"
              />
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                {sel.label}
              </span>
            </div>
            <select
              value={sel.val}
              onChange={e => sel.set(e.target.value)}
              disabled={loadingGems}
              className="w-full h-11 px-3 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
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
          </div>
        ))}
      </div>

      {/* Not enough gems warning */}
      {!loadingGems && allGems.length < 2 && (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <p className="text-text-primary font-semibold text-base mb-1">
            Need at least 2 gems to compare
          </p>
          <p className="text-text-muted text-sm">
            Register another gem first using the Register Gem page.
          </p>
        </div>
      )}

      {/* Same gem selected warning */}
      {!loading && gem1Id && gem2Id && gem1Id === gem2Id && (
        <div className="bg-card border border-border rounded-2xl p-6 text-center">
          <p className="text-text-muted text-sm">
            Please select two different gems to compare.
          </p>
        </div>
      )}

      {/* API error */}
      {error && (
        <div className="bg-danger-bg border border-danger rounded-xl px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-16 text-text-muted text-sm">
          Comparing gems...
        </div>
      )}

      {/* Comparison content */}
      {!loading && comparisonData && gem1Id !== gem2Id && (
        <>
          {/* Winner summary cards */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Gem 1 wins */}
            <div
              className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center gap-2"
              style={{ borderTop: "3px solid #1B4F8A" }}
            >
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                {gem1Type}
              </span>
              <span
                className="text-4xl font-bold"
                style={{ color: "#1B4F8A" }}
              >
                {gem1Wins}
              </span>
              <span className="text-xs text-text-muted">metrics won</span>
            </div>

            {/* VS badge */}
            <div className="bg-surface-2 border border-border rounded-2xl p-5 flex flex-col items-center justify-center gap-1">
              <span className="text-2xl font-bold text-text-primary">VS</span>
              {comparisonData.overallWinnerLabel && (
                <span className="text-xs text-text-muted text-center mt-1">
                  {comparisonData.overallWinnerLabel}
                </span>
              )}
            </div>

            {/* Gem 2 wins */}
            <div
              className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center gap-2"
              style={{ borderTop: "3px solid #C9A84C" }}
            >
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                {gem2Type}
              </span>
              <span
                className="text-4xl font-bold"
                style={{ color: "#C9A84C" }}
              >
                {gem2Wins}
              </span>
              <span className="text-xs text-text-muted">metrics won</span>
            </div>
          </div>

          {/* Comparison table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Table header */}
            <div
              className="grid grid-cols-3 text-xs font-semibold uppercase tracking-wider text-white"
            >
              <div
                className="p-4 text-left"
                style={{ background: "#1B4F8A" }}
              >
                {gem1Type}
              </div>
              <div
                className="p-4 text-center"
                style={{ background: "#0A0A0A" }}
              >
                Metric
              </div>
              <div
                className="p-4 text-right"
                style={{ background: "#C9A84C" }}
              >
                {gem2Type}
              </div>
            </div>

            {/* Table rows */}
            {metrics.map((m: any, i: number) => (
              <div
                key={m.metric}
                className={`grid grid-cols-3 text-sm border-t border-border transition-colors hover:bg-surface-2 ${
                  i % 2 === 0 ? "" : "bg-surface"
                }`}
              >
                <div
                  className={`p-4 font-medium ${
                    m.gem1Wins
                      ? "text-success font-semibold"
                      : "text-text-secondary"
                  }`}
                  style={
                    m.gem1Wins
                      ? { background: "rgba(22,101,52,0.06)" }
                      : {}
                  }
                >
                  <div className="flex items-center gap-2">
                    {m.gem1Wins && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0"
                      />
                    )}
                    {m.value1}
                  </div>
                </div>

                <div className="p-4 text-center text-text-muted font-semibold text-xs uppercase tracking-wide border-x border-border">
                  {m.metric}
                </div>

                <div
                  className={`p-4 text-right font-medium ${
                    m.gem2Wins
                      ? "text-success font-semibold"
                      : "text-text-secondary"
                  }`}
                  style={
                    m.gem2Wins
                      ? { background: "rgba(22,101,52,0.06)" }
                      : {}
                  }
                >
                  <div className="flex items-center justify-end gap-2">
                    {m.value2}
                    {m.gem2Wins && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Price comparison bar chart */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <p className="text-base font-semibold text-text-primary mb-6">
              Price Comparison by Stage
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={
                  barData.length > 0
                    ? barData
                    : [
                        { stage: "Mine",   gem1: 0, gem2: 0 },
                        { stage: "Cut",    gem1: 0, gem2: 0 },
                        { stage: "Trade",  gem1: 0, gem2: 0 },
                        { stage: "Export", gem1: 0, gem2: 0 },
                      ]
                }
                barGap={6}
                barCategoryGap="30%"
              >
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
                    border: "1px solid #E8E8E8",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 13,
                  }}
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                  formatter={(value: any) => [
                    `Rs. ${(value * 1000).toLocaleString()}`,
                    "",
                  ]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
                />
                <Bar
                  dataKey="gem1"
                  fill="#1B4F8A"
                  name={gem1Type}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
                <Bar
                  dataKey="gem2"
                  fill="#C9A84C"
                  name={gem2Type}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default ComparePage;