import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Clock, Plus, Trash2, Edit3,
  Shield, FileText, Tag, RefreshCw,
} from "lucide-react";
import { getAllGems } from "../../api/api";

// =============================================================
// API helpers
// =============================================================
const BASE_URL = "http://localhost:4567/api";

async function fetchAllAuditLogs(action?: string) {
  let url = `${BASE_URL}/audit`;
  if (action) url += `?action=${action}`;
  const res = await fetch(url);
  return res.json();
}

async function fetchAuditLogsForGem(gemId: string, action?: string) {
  let url = `${BASE_URL}/audit/gem/${gemId}`;
  if (action) url += `?action=${action}`;
  const res = await fetch(url);
  return res.json();
}

async function fetchAuditSummary() {
  const res = await fetch(`${BASE_URL}/audit/summary`);
  return res.json();
}

// =============================================================
// Constants
// =============================================================
const ACTION_FILTERS = [
  { label: "All",          value: "" },
  { label: "Added",        value: "STAGE_ADDED" },
  { label: "Updated",      value: "STAGE_UPDATED" },
  { label: "Deleted",      value: "STAGE_DELETED" },
  { label: "Registered",   value: "GEM_REGISTERED" },
  { label: "Gem Deleted",  value: "GEM_DELETED" },
  { label: "Certificate",  value: "CERTIFICATE_ADDED" },
  { label: "Export",       value: "EXPORT_ADDED" },
  { label: "Notes",        value: "NOTE_ADDED" },
];

// =============================================================
// Helper components
// =============================================================
const ActionBadge: React.FC<{ log: any }> = ({ log }) => (
  <span
    style={{
      background:    log.actionColor     || "#F3F4F6",
      color:         log.actionTextColor || "#374151",
      fontSize:      11,
      fontWeight:    700,
      padding:       "2px 10px",
      borderRadius:  20,
      letterSpacing: 0.3,
      whiteSpace:    "nowrap",
    }}
  >
    {log.actionLabel || log.action}
  </span>
);

const ActionIcon: React.FC<{ action: string }> = ({ action }) => {
  const p = { size: 14 };
  if (action.includes("DELETED"))     return <Trash2  {...p} />;
  if (action.includes("UPDATED"))     return <Edit3   {...p} />;
  if (action.includes("ADDED") || action.includes("REGISTERED"))
                                      return <Plus    {...p} />;
  if (action.includes("CERTIFICATE")) return <Shield  {...p} />;
  if (action.includes("EXPORT"))      return <FileText{...p} />;
  if (action.includes("NOTE"))        return <Tag     {...p} />;
  return <Clock {...p} />;
};

// =============================================================
// Main AuditPage
// =============================================================
const AuditPage: React.FC = () => {
  const [allGems, setAllGems]           = useState<any[]>([]);
  const [selectedGem, setSelectedGem]   = useState("all");
  const [searchInput, setSearchInput]   = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [logs, setLogs]                 = useState<any[]>([]);
  const [summary, setSummary]           = useState<any>(null);
  const [loading, setLoading]           = useState(false);
  const [loadingGems, setLoadingGems]   = useState(true);
  const [expandedLog, setExpandedLog]   = useState<number | null>(null);
  const [error, setError]               = useState("");

  // ── Load all gems for dropdown ──────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllGems();
        if (res.success && res.data) setAllGems(res.data as any[]);
      } catch (e) { console.error(e); }
      finally { setLoadingGems(false); }
    })();
  }, []);

  // ── Load summary on mount ───────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchAuditSummary();
        if (res.success) setSummary(res.data);
      } catch (e) { console.error(e); }
    })();
  }, []);

  // ── Reload logs when gem or filter changes ──────────────────
  useEffect(() => { loadLogs(); }, [selectedGem, activeFilter]);

  const loadLogs = async () => {
    setLoading(true);
    setError("");
    try {
      let res: any;
      if (selectedGem && selectedGem !== "all") {
        res = await fetchAuditLogsForGem(
          selectedGem,
          activeFilter || undefined,
        );
        setLogs(res?.data?.logs || []);
      } else {
        res = await fetchAllAuditLogs(activeFilter || undefined);
        setLogs(Array.isArray(res?.data) ? res.data : []);
      }
      if (!res?.success) setError(res?.message || "Failed to load audit logs.");
    } catch (e) {
      setError("Could not connect to the server.");
    } finally { setLoading(false); }
  };

  const handleSearch = () => {
    if (searchInput.trim()) setSelectedGem(searchInput.trim());
  };

  // Summary stat cards
  const statCards = summary
    ? [
        { label: "Total Changes",   value: summary.totalChanges      || 0, color: "#1B4F8A" },
        { label: "Stages Added",    value: summary.stagesAdded       || 0, color: "#166534" },
        { label: "Stages Updated",  value: summary.stagesUpdated     || 0, color: "#92400E" },
        { label: "Stages Deleted",  value: summary.stagesDeleted     || 0, color: "#991B1B" },
        { label: "Gems Registered", value: summary.gemsRegistered    || 0, color: "#1B4F8A" },
        { label: "Certificates",    value: summary.certificatesAdded || 0, color: "#5B21B6" },
      ]
    : [];

  return (
    <div className="p-8 space-y-6">

      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Audit Trail
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Complete history of every change made to any gem or stage in the system
        </p>
      </div>

      {/* Summary cards */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card border border-border rounded-xl p-4 text-center"
            >
              <div className="text-2xl font-bold" style={{ color: card.color }}>
                {card.value}
              </div>
              <div className="text-xs text-text-muted mt-1">{card.label}</div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Search + dropdown */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            placeholder="Type Gem ID to search history..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            className="w-full h-11 pl-11 pr-28 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-3 bg-primary text-primary-foreground rounded-lg text-xs font-semibold"
          >
            Search
          </button>
        </div>

        <div className="flex gap-2">
          <select
            value={selectedGem}
            onChange={e => {
              setSelectedGem(e.target.value);
              setSearchInput(e.target.value === "all" ? "" : e.target.value);
            }}
            disabled={loadingGems}
            className="flex-1 h-11 px-3 border border-border rounded-xl text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Gems — Full History</option>
            {allGems.map(g => (
              <option key={g.gemId} value={g.gemId}>
                {g.gemId} — {g.gemType || "Unknown"}
              </option>
            ))}
          </select>
          <button
            onClick={loadLogs}
            className="h-11 w-11 flex items-center justify-center border border-border rounded-xl bg-card hover:bg-surface-2 transition-colors"
            title="Refresh"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin text-primary" : "text-text-muted"}
            />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {ACTION_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`h-8 px-4 rounded-lg text-xs font-semibold border transition-all ${
              activeFilter === f.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-text-secondary hover:bg-surface-2"
            }`}
          >
            {f.label}
          </button>
        ))}
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
          Loading audit history...
        </div>
      )}

      {/* Empty state */}
      {!loading && logs.length === 0 && (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Clock size={36} className="text-text-muted mx-auto mb-3" />
          <p className="font-semibold text-text-primary">No audit records found</p>
          <p className="text-text-muted text-sm mt-1">
            Changes will appear here when gems or stages are modified.
          </p>
        </div>
      )}

      {/* Audit timeline */}
      {!loading && logs.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-text-muted">
            Showing {logs.length} record{logs.length !== 1 ? "s" : ""}
            {selectedGem !== "all" ? ` for ${selectedGem}` : ""}
          </p>

          <AnimatePresence>
            {logs.map((log: any, i: number) => {
              const isExpanded  = expandedLog === log.id;
              const isDeletion  = !!log.isDeletion;
              const isUpdate    = !!log.isUpdate;
              const isAddition  = !!log.isAddition;

              const borderColor = isDeletion ? "#991B1B"
                                : isUpdate   ? "#92400E"
                                : isAddition ? "#166534"
                                : "#1B4F8A";

              return (
                <motion.div
                  key={log.id ?? i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className="bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:bg-surface transition-colors"
                  style={{ borderLeft: `4px solid ${borderColor}` }}
                  onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                >
                  {/* Row */}
                  <div className="px-5 py-4 flex items-start gap-4">
                    {/* Icon bubble */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: log.actionColor     || "#F3F4F6",
                        color:      log.actionTextColor || "#374151",
                      }}
                    >
                      <ActionIcon action={log.action || ""} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <ActionBadge log={log} />
                        <span className="font-mono text-xs font-bold text-primary">
                          {log.gem_id}
                        </span>
                        {log.stage_number && (
                          <span className="text-xs text-text-muted">
                            Stage {log.stage_number}
                            {log.stage_type ? ` (${log.stage_type})` : ""}
                          </span>
                        )}
                        <span className="text-xs text-text-muted ml-auto">
                          {log.formattedDate || log.changed_at}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                        {log.description}
                      </p>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden border-t border-border"
                      >
                        <div className="px-5 py-4 space-y-3 bg-surface">

                          {/* Before / After */}
                          {(log.old_value || log.new_value) && (
                            <div className="grid md:grid-cols-2 gap-3">
                              {log.old_value && (
                                <div className="bg-card border border-border rounded-xl p-3">
                                  <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider mb-2">
                                    Before (Old Value)
                                  </p>
                                  <pre className="text-xs text-text-secondary font-mono whitespace-pre-wrap leading-relaxed">
                                    {log.old_value}
                                  </pre>
                                </div>
                              )}
                              {log.new_value && (
                                <div className="bg-card border border-border rounded-xl p-3">
                                  <p className="text-[11px] font-bold text-green-700 uppercase tracking-wider mb-2">
                                    After (New Value)
                                  </p>
                                  <pre className="text-xs text-text-secondary font-mono whitespace-pre-wrap leading-relaxed">
                                    {log.new_value}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Field changed */}
                          {log.field_changed && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-text-muted">Field changed:</span>
                              <code className="bg-surface-2 px-2 py-0.5 rounded text-xs font-mono text-text-primary">
                                {log.field_changed}
                              </code>
                            </div>
                          )}

                          {/* Meta */}
                          <div className="flex gap-6 text-xs text-text-muted pt-1 border-t border-border">
                            <span>ID: {log.id}</span>
                            <span>Gem: {log.gem_id}</span>
                            <span>Action: {log.action}</span>
                            <span>Time: {log.changed_at}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default AuditPage;