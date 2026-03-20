import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import BlurText from "../../components/reactbits/BlurText";
import { Search, ShieldCheck, AlertTriangle, GitBranch, Eye, ChevronRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getAllGems, getDashboardSummary, getPriceHistory } from "../../api/api";

const stageBadge: Record<string, { bg: string; text: string }> = {
  MINING: { bg: "bg-warning-bg", text: "text-warning" },
  CUTTING: { bg: "bg-[#EDE9FE]", text: "text-[#5B21B6]" },
  TRADING: { bg: "bg-blue-gem-light", text: "text-blue-gem" },
  EXPORTING: { bg: "bg-success-bg", text: "text-success" },
  BUYING: { bg: "bg-[#FCE7F3]", text: "text-[#9D174D]" },
};

const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState({
    totalGems: 0,
    ceylonVerified: 0,
    unresolvedAlerts: 0,
    totalStages: 0,
    ceylonRate: "0.0%",
    avgStages: "0.0",
  });

  const [gems, setGems] = useState<any[]>([]);
  const [priceChartData, setPriceChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch dashboard summary for stat cards
        const summaryRes = await getDashboardSummary();
        if (summaryRes.success && summaryRes.data) {
          setSummary(summaryRes.data as any);
        }

        // Fetch all gems for the table
        const gemsRes = await getAllGems();
        if (gemsRes.success && gemsRes.data) {
          setGems((gemsRes.data as any[]).slice(0, 10));
        }

        // Fetch price history for the first gem for the chart
        const allGemsData = gemsRes.data as any[];
        if (allGemsData && allGemsData.length > 0) {
          const firstGemId = allGemsData[0].gemId;
          const priceRes = await getPriceHistory(firstGemId);
          if (priceRes.success && priceRes.data) {
            const pd = priceRes.data as any;
            if (pd.priceData && pd.priceData.length > 0) {
              const chartPoints = pd.priceData.map((p: any) => ({
                stage: p.stageShortLabel || p.stageName,
                gem1: p.price / 1000,
              }));
              setPriceChartData(chartPoints);
            }
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const cards = [
    {
      label: "Total Gems Registered",
      value: loading ? "..." : summary.totalGems.toLocaleString(),
      icon: Search,
      trend: `${summary.ceylonRate} verified`,
      borderColor: "border-l-blue-gem",
    },
    {
      label: "Ceylon Verified",
      value: loading ? "..." : summary.ceylonVerified.toLocaleString(),
      icon: ShieldCheck,
      trend: summary.ceylonRate + " rate",
      borderColor: "border-l-success",
    },
    {
      label: "Fraud Alerts",
      value: loading ? "..." : summary.unresolvedAlerts.toLocaleString(),
      icon: AlertTriangle,
      trend: summary.unresolvedAlerts === 0 ? "All clear" : `${summary.unresolvedAlerts} need review`,
      borderColor: "border-l-danger",
    },
    {
      label: "Total Stages Recorded",
      value: loading ? "..." : summary.totalStages.toLocaleString(),
      icon: GitBranch,
      trend: `avg ${summary.avgStages} per gem`,
      borderColor: "border-l-gold",
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-card border border-border rounded-xl p-6 border-l-[3px] ${c.borderColor}`}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-[13px] font-medium text-text-muted">{c.label}</span>
              <c.icon size={18} className="text-text-muted" />
            </div>
            <p className="font-display text-[32px] font-bold text-text-primary">{c.value}</p>
            <span className="text-xs text-success font-medium">{c.trend}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <BlurText text="Recent Gems" delay={60} direction="top" animateBy="words" className="text-base font-semibold text-text-primary" />
            <button className="text-sm text-blue-gem font-medium">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-text-muted text-left border-b border-border">
                  {["Gem ID", "Type", "Origin", "Stage", "Weight", "Price", "Status", ""].map(h => (
                    <th key={h} className="pb-3 pr-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-text-muted text-sm">
                      Loading gems...
                    </td>
                  </tr>
                ) : gems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-text-muted text-sm">
                      No gems registered yet.
                    </td>
                  </tr>
                ) : (
                  gems.map(g => (
                    <tr key={g.gemId} className="border-b border-surface-2 hover:bg-surface transition-colors">
                      <td className="py-3 pr-4 font-semibold text-blue-gem font-mono">
                        {(g.gemId || "").slice(0, 15)}
                      </td>
                      <td className="py-3 pr-4">{g.gemType || "—"}</td>
                      <td className="py-3 pr-4 text-text-muted">
                        {g.origin ? g.origin.split(",").pop()?.trim() : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            stageBadge[g.currentStage]?.bg || "bg-surface-2"
                          } ${stageBadge[g.currentStage]?.text || "text-text-muted"}`}
                        >
                          {g.currentStage || "—"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right">
                        {g.currentWeight ? `${g.currentWeight} ct` : "—"}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        {g.currentPrice
                          ? `Rs. ${Number(g.currentPrice).toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            g.verified
                              ? "bg-success-bg text-success"
                              : "bg-danger-bg text-danger"
                          }`}
                        >
                          {g.verified ? "VERIFIED" : "UNVERIFIED"}
                        </span>
                      </td>
                      <td className="py-3 flex gap-1">
                        <button className="p-1 rounded hover:bg-surface-2">
                          <Eye size={14} className="text-text-muted" />
                        </button>
                        <button className="p-1 rounded hover:bg-surface-2">
                          <ChevronRight size={14} className="text-text-muted" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <BlurText
            text="Price Appreciation by Stage"
            delay={60}
            direction="top"
            animateBy="words"
            className="text-base font-semibold text-text-primary mb-4"
          />
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={priceChartData.length > 0 ? priceChartData : [
              { stage: "Mine", gem1: 50 },
              { stage: "Cut", gem1: 150 },
              { stage: "Trade", gem1: 350 },
              { stage: "Export", gem1: 850 },
            ]}>
              <CartesianGrid stroke="#F4F4F4" />
              <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ border: "1px solid #E8E8E8", borderRadius: 8, padding: 12 }}
                formatter={(value: any) => [`Rs. ${(value * 1000).toLocaleString()}`, ""]}
              />
              <Line
                type="monotone"
                dataKey="gem1"
                stroke="#1B4F8A"
                strokeWidth={2}
                dot={{ r: 5 }}
                name="Price (thousands)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;