import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BlurText from "../../components/reactbits/BlurText";
import { getAllAlerts, resolveAlert } from "../../api/api";

const alertBadge: Record<string, { bg: string; text: string }> = {
  ORIGIN_MISMATCH: { bg: "bg-danger-bg", text: "text-danger" },
  MISSING_CERTIFICATE: { bg: "bg-warning-bg", text: "text-warning" },
  LOCATION_INCONSISTENCY: { bg: "bg-[#EDE9FE]", text: "text-[#5B21B6]" },
  MISSING_MINING_STAGE: { bg: "bg-danger-bg", text: "text-danger" },
  EMPTY_LOCATION: { bg: "bg-warning-bg", text: "text-warning" },
  UNKNOWN: { bg: "bg-surface-2", text: "text-text-muted" },
};

const AlertsPage: React.FC = () => {
  const [filter, setFilter] = useState("all");
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const tabs = [
    "all",
    "unresolved",
    "resolved",
    "ORIGIN_MISMATCH",
    "MISSING_CERTIFICATE",
  ];

  // Load all alerts from API on mount
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await getAllAlerts();
        if (res.success && res.data) {
          const data = res.data as any;
          // API returns { unresolved: [...], unresolvedCount: N, ... }
          // We use the unresolved array and mark them all as unresolved
          const unresolvedList: any[] = (data.unresolved || []).map(
            (a: any) => ({ ...a, resolved: false })
          );
          setAlerts(unresolvedList);
        }
      } catch (err) {
        console.error("Failed to load alerts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  // Filter alerts based on active tab
  const filtered = alerts.filter(a => {
    if (filter === "all") return true;
    if (filter === "unresolved") return !a.resolved;
    if (filter === "resolved") return a.resolved;
    return a.alertType === filter;
  });

  // Mark an alert as resolved via API then update local state
  const handleResolve = async (alertId: number) => {
    setResolvingId(alertId);
    try {
      const res = await resolveAlert(alertId);
      if (res.success) {
        setAlerts(prev =>
          prev.map(al =>
            al.id === alertId ? { ...al, resolved: true } : al
          )
        );
      } else {
        console.error("Failed to resolve alert:", res.message);
      }
    } catch (err) {
      console.error("Error resolving alert:", err);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Filter tabs */}
      <div className="flex gap-4 border-b border-border pb-0">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`pb-3 text-sm font-medium capitalize transition-colors ${
              filter === t
                ? "text-text-primary border-b-2 border-gold"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {t === "ORIGIN_MISMATCH"
              ? "Origin Mismatch"
              : t === "MISSING_CERTIFICATE"
              ? "Missing Certificate"
              : t}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12 text-text-muted text-sm">
          Loading alerts...
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-text-muted text-sm">
          No alerts found for this filter.
        </div>
      )}

      {/* Alert cards */}
      <div className="space-y-4">
        <AnimatePresence mode="sync">
          {filtered.map(a => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`bg-card border border-border rounded-xl p-5 border-l-4 ${
                a.resolved ? "border-l-border-strong" : "border-l-danger"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    alertBadge[a.alertType]?.bg || alertBadge.UNKNOWN.bg
                  } ${
                    alertBadge[a.alertType]?.text || alertBadge.UNKNOWN.text
                  }`}
                >
                  {a.alertTypeLabel ||
                    (a.alertType || "UNKNOWN").replace(/_/g, " ")}
                </span>
                <span className="text-xs text-text-muted">
                  {a.date || "Unknown date"}
                </span>
              </div>

              <p className="text-sm font-semibold text-blue-gem font-mono mb-1">
                {a.gemId || "—"}
              </p>

              <BlurText
                text={a.message || "No message available."}
                delay={30}
                direction="bottom"
                animateBy="words"
                className="text-sm text-text-secondary mb-3"
              />

              {/* Recommendation from API */}
              {a.recommendation && (
                <p className="text-xs text-text-muted mb-3 italic">
                  {a.recommendation}
                </p>
              )}

              <div className="flex justify-between items-center">
                <button className="text-sm text-blue-gem font-medium">
                  View Gem
                </button>
                {!a.resolved && (
                  <button
                    onClick={() => handleResolve(a.id)}
                    disabled={resolvingId === a.id}
                    className="h-8 px-3 bg-primary text-primary-foreground rounded-md text-xs font-semibold disabled:opacity-50"
                  >
                    {resolvingId === a.id ? "Resolving..." : "Mark Resolved"}
                  </button>
                )}
                {a.resolved && (
                  <span className="text-xs text-success font-medium">
                    Resolved
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AlertsPage;