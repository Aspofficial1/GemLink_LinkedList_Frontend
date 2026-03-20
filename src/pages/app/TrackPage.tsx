import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import BlurText from "../../components/reactbits/BlurText";
import { getAllGems, getGemById, getFraudRiskScore } from "../../api/api";

const TrackPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState("BS-1773990209789");
  const [selectedGem, setSelectedGem] = useState<string | null>("BS-1773990209789");
  const [reversed, setReversed] = useState(false);
  const [allGems, setAllGems] = useState<any[]>([]);
  const [gemDetail, setGemDetail] = useState<any>(null);
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingGems, setLoadingGems] = useState(true);

  // Load all gem IDs for the quick select chips
  useEffect(() => {
    const fetchAllGems = async () => {
      try {
        const res = await getAllGems();
        if (res.success && res.data) {
          setAllGems(res.data as any[]);
        }
      } catch (err) {
        console.error("Failed to load gems:", err);
      } finally {
        setLoadingGems(false);
      }
    };
    fetchAllGems();
  }, []);

  // Load gem detail and risk score when selectedGem changes
  useEffect(() => {
    if (!selectedGem) return;

    const fetchGemData = async () => {
      setLoading(true);
      try {
        const [gemRes, riskRes] = await Promise.all([
          getGemById(selectedGem),
          getFraudRiskScore(selectedGem),
        ]);

        if (gemRes.success && gemRes.data) {
          setGemDetail(gemRes.data);
        } else {
          setGemDetail(null);
        }

        if (riskRes.success && riskRes.data) {
          setRiskData(riskRes.data);
        } else {
          setRiskData(null);
        }
      } catch (err) {
        console.error("Failed to load gem detail:", err);
        setGemDetail(null);
        setRiskData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGemData();
  }, [selectedGem]);

  // Handle search button click
  const handleSearch = () => {
    if (searchInput.trim()) {
      setSelectedGem(searchInput.trim());
      setReversed(false);
    }
  };

  // Handle Enter key in search box
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  // Build display journey from API data
  const stageHistory: any[] = gemDetail?.stageHistory || [];
  const displayJourney = reversed ? [...stageHistory].reverse() : stageHistory;

  // Risk score values from API
  const riskScore = riskData?.score ?? 0;
  const riskColor =
    riskScore <= 30 ? "#166534" : riskScore <= 60 ? "#92400E" : "#991B1B";
  const circumference = 2 * Math.PI * 65;

  // Risk factors from API
  const riskFactors: any[] = riskData?.riskFactors || [];

  return (
    <div className="p-8 space-y-6">
      {/* Search bar */}
      <div className="relative">
        <Search
          size={20}
          className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          placeholder="Enter Gem ID, gem type, or miner name..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-14 pl-12 pr-36 border-[1.5px] border-border rounded-xl text-base bg-background focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold"
        >
          Search
        </button>
      </div>

      {/* Quick select chips */}
      <div className="flex gap-2 flex-wrap">
        {loadingGems ? (
          <span className="text-xs text-text-muted">Loading gems...</span>
        ) : (
          allGems.map(g => (
            <button
              key={g.gemId}
              onClick={() => {
                setSelectedGem(g.gemId);
                setSearchInput(g.gemId);
                setReversed(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                selectedGem === g.gemId
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-surface border-border text-text-secondary hover:bg-surface-2"
              }`}
            >
              {(g.gemId || "").slice(0, 15)}
            </button>
          ))
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12 text-text-muted text-sm">
          Loading gem journey...
        </div>
      )}

      {/* Not found state */}
      {!loading && selectedGem && !gemDetail && (
        <div className="text-center py-12 text-text-muted text-sm">
          Gem not found: {selectedGem}
        </div>
      )}

      {/* Journey timeline and risk score */}
      {!loading && displayJourney.length > 0 && (
        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          {/* Timeline */}
          <div className="bg-surface border border-border rounded-2xl p-8 overflow-x-auto">
            <div className="flex gap-4 min-w-max">
              {displayJourney.map((s: any, i: number) => {
                const isCurrent = s.isCurrent;
                return (
                  <React.Fragment key={i}>
                    <motion.div
                      initial={{ opacity: 0, x: reversed ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`w-[200px] border rounded-xl p-5 flex-shrink-0 ${
                        isCurrent
                          ? "border-2 border-gold bg-[#FFFDF5]"
                          : "border-border bg-card"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold mx-auto mb-3">
                        {reversed ? stageHistory.length - i : i + 1}
                      </div>
                      <p className="text-[13px] font-semibold text-text-primary text-center">
                        {s.stageLabel || s.stageType}
                      </p>
                      <p className="text-xs text-text-muted text-center mt-1">
                        {s.location}
                      </p>
                      <p className="text-xs text-text-muted text-center">
                        {s.personName}
                      </p>
                      <p className="text-[11px] text-text-muted text-center mt-1">
                        {s.date}
                      </p>
                      <div className="text-xs font-semibold text-text-primary text-center mt-2">
                        {s.weightInCarats} ct |{" "}
                        Rs. {Number(s.priceInRupees).toLocaleString()}
                      </div>
                    </motion.div>

                    {i < displayJourney.length - 1 && (
                      <div className="flex items-center flex-shrink-0">
                        <svg width="60" height="24" viewBox="0 0 60 24">
                          <path
                            d="M0,12 L48,12 M42,6 L48,12 L42,18"
                            stroke="#D0D0D0"
                            strokeWidth="1.5"
                            fill="none"
                          />
                        </svg>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={() => setReversed(!reversed)}
                className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-semibold"
              >
                {reversed ? "View Forward" : "View Backward"}
              </button>
              <span className="text-sm text-text-muted">
                {reversed
                  ? "Backward traversal using prev pointer"
                  : "Forward traversal using next pointer"}{" "}
                — only possible with Doubly Linked List
              </span>
            </div>
          </div>

          {/* Fraud Risk Score */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center">
            <BlurText
              text="Fraud Risk Score"
              delay={60}
              direction="top"
              animateBy="words"
              className="text-sm font-semibold text-text-primary mb-4"
            />
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="65"
                fill="none"
                stroke="#E8E8E8"
                strokeWidth="10"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="65"
                fill="none"
                stroke={riskColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{
                  strokeDashoffset:
                    circumference - (circumference * riskScore) / 100,
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
              />
              <text
                x="80"
                y="75"
                textAnchor="middle"
                className="font-display text-4xl font-extrabold"
                fill={riskColor}
              >
                {riskScore}
              </text>
              <text x="80" y="95" textAnchor="middle" className="text-xs" fill="#888">
                Risk Score
              </text>
            </svg>

            <div className="w-full mt-4 space-y-2">
              {riskFactors.length > 0
                ? riskFactors.map((f: any) => (
                    <div
                      key={f.factorName}
                      className="flex items-center justify-between text-[13px]"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            f.active ? "bg-danger" : "bg-success"
                          }`}
                        />
                        <span className="text-text-secondary">{f.factorName}</span>
                      </div>
                      <span
                        className={
                          f.active
                            ? "text-danger font-medium"
                            : "text-success font-medium"
                        }
                      >
                        {f.active ? `+${f.points}` : "0"}
                      </span>
                    </div>
                  ))
                : [
                    { factor: "Missing Certificate", active: false },
                    { factor: "Origin Verified", active: false },
                    { factor: "Weight Discrepancy", active: false },
                    { factor: "Multiple Owners", active: false },
                  ].map(f => (
                    <div
                      key={f.factor}
                      className="flex items-center justify-between text-[13px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-success" />
                        <span className="text-text-secondary">{f.factor}</span>
                      </div>
                      <span className="text-success font-medium">0</span>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackPage;