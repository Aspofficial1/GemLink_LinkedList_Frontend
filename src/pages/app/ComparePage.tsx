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
  const [gem1Id, setGem1Id] = useState("");
  const [gem2Id, setGem2Id] = useState("");
  const [allGems, setAllGems] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingGems, setLoadingGems] = useState(true);

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

  // Fetch comparison whenever both gem IDs are set
  useEffect(() => {
    if (!gem1Id || !gem2Id || gem1Id === gem2Id) return;

    const fetchComparison = async () => {
      setLoading(true);
      try {
        const res = await compareGems(gem1Id, gem2Id);
        if (res.success && res.data) {
          setComparisonData(res.data);
        } else {
          setComparisonData(null);
        }
      } catch (err) {
        console.error("Failed to compare gems:", err);
        setComparisonData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [gem1Id, gem2Id]);

  // Build metrics rows from API comparison data
  const metrics: any[] = comparisonData?.comparisonRows || [];

  // Build bar chart data from API chart data
  const barData: any[] = comparisonData?.chartData || [];

  // Gem type labels for table header
  const gem1Type = comparisonData?.gem1Type || gem1Id;
  const gem2Type = comparisonData?.gem2Type || gem2Id;

  return (
    <div className="p-8 space-y-6">
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
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { val: gem1Id, set: setGem1Id },
          { val: gem2Id, set: setGem2Id },
        ].map((sel, idx) => (
          <div key={idx} className="space-y-2">
            <select
              value={sel.val}
              onChange={e => sel.set(e.target.value)}
              className="w-full h-10 px-3 border border-border rounded-lg text-sm bg-background"
              disabled={loadingGems}
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

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12 text-text-muted text-sm">
          Comparing gems...
        </div>
      )}

      {/* Same gem selected warning */}
      {!loading && gem1Id && gem2Id && gem1Id === gem2Id && (
        <div className="text-center py-6 text-text-muted text-sm">
          Please select two different gems to compare.
        </div>
      )}

      {/* Comparison table and chart */}
      {!loading && comparisonData && gem1Id !== gem2Id && (
        <>
          {/* Comparison table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-2 text-text-muted">
                  <th className="p-4 text-left font-medium">{gem1Type}</th>
                  <th className="p-4 text-center font-medium">Metric</th>
                  <th className="p-4 text-right font-medium">{gem2Type}</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m: any, i: number) => (
                  <tr key={m.metric} className={i % 2 ? "bg-surface" : ""}>
                    <td
                      className={`p-4 ${
                        m.gem1Wins
                          ? "bg-success-bg text-success font-semibold"
                          : "text-text-secondary"
                      }`}
                    >
                      {m.value1}
                    </td>
                    <td className="p-4 text-center text-text-muted font-medium">
                      {m.metric}
                    </td>
                    <td
                      className={`p-4 text-right ${
                        m.gem2Wins
                          ? "bg-success-bg text-success font-semibold"
                          : "text-text-secondary"
                      }`}
                    >
                      {m.value2}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Overall winner banner */}
          {comparisonData.overallWinnerLabel && (
            <div className="text-center text-sm font-semibold text-text-primary py-2">
              {comparisonData.overallWinnerLabel}
            </div>
          )}

          {/* Price comparison bar chart */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <BlurText
              text="Price Comparison by Stage"
              delay={60}
              direction="top"
              animateBy="words"
              className="text-base font-semibold text-text-primary mb-4"
            />
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={
                  barData.length > 0
                    ? barData
                    : [
                        { stage: "Mine", gem1: 0, gem2: 0 },
                        { stage: "Cut", gem1: 0, gem2: 0 },
                        { stage: "Trade", gem1: 0, gem2: 0 },
                        { stage: "Export", gem1: 0, gem2: 0 },
                      ]
                }
              >
                <CartesianGrid stroke="#F4F4F4" />
                <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={v => `${v}k`}
                />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #E8E8E8",
                    borderRadius: 8,
                    padding: 12,
                  }}
                  formatter={(value: any) => [
                    `Rs. ${(value * 1000).toLocaleString()}`,
                    "",
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="gem1"
                  fill="#1B4F8A"
                  name={gem1Type}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="gem2"
                  fill="#C9A84C"
                  name={gem2Type}
                  radius={[4, 4, 0, 0]}
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