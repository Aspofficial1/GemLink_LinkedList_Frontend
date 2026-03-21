import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  GitCompare,
  AlertTriangle,
  FileText,
  Settings,
  QrCode,
} from "lucide-react";
import { getUnresolvedAlerts } from "../../api/api";

export interface AppLayoutProps {
  subPage: string;
  setSubPage: (p: string) => void;
}

const sidebarItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "track",     icon: Search,          label: "Track Gem" },
  { id: "register",  icon: PlusCircle,      label: "Register Gem" },
  { id: "compare",   icon: GitCompare,      label: "Compare Gems" },
  { id: "alerts",    icon: AlertTriangle,   label: "Fraud Alerts" },
  { id: "reports",   icon: FileText,        label: "Reports" },
  { id: "qr",        icon: QrCode,          label: "QR Codes" },
  { id: "settings",  icon: Settings,        label: "Settings" },
];

const Sidebar: React.FC<AppLayoutProps> = ({ subPage, setSubPage }) => {
  const [unresolvedCount, setUnresolvedCount] = useState(0);
  const [apiConnected, setApiConnected]       = useState(false);

  // Fetch unresolved alert count on mount and every 30 seconds
  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        const res = await getUnresolvedAlerts();
        if (res.success && res.data) {
          const data = res.data as any;
          setUnresolvedCount(data.count || 0);
          setApiConnected(true);
        }
      } catch (err) {
        console.error("Failed to load alert count:", err);
        setApiConnected(false);
      }
    };

    // Fetch immediately on mount
    fetchAlertCount();

    // Then refresh every 30 seconds
    const interval = setInterval(fetchAlertCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-surface border-r border-border flex flex-col z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 gap-2 border-b border-border">
        <svg width={24} height={24} viewBox="0 0 32 32" fill="none">
          <polygon points="8,4 24,4 30,12 16,28 2,12" fill="#1B4F8A" />
          <polygon points="8,4 24,4 20,12 12,12" fill="#4A7FC1" />
        </svg>
        <span className="font-display text-lg font-bold text-text-primary">
          Ceylon<span className="text-gold">Gem</span>
        </span>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {sidebarItems.map(item => {
          const active   = subPage === item.id;
          const isAlerts = item.id === "alerts";

          return (
            <button
              key={item.id}
              onClick={() => setSubPage(item.id)}
              className={`w-full h-11 flex items-center gap-3 px-4 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-primary text-primary-foreground border-l-[3px] border-gold"
                  : "text-text-secondary hover:bg-surface-2"
              }`}
            >
              <item.icon size={18} />
              <span className="flex-1 text-left">{item.label}</span>

              {/* Unresolved alert count badge */}
              {isAlerts && unresolvedCount > 0 && (
                <span
                  className="min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ background: "#991B1B", color: "white", lineHeight: 1 }}
                >
                  {unresolvedCount > 99 ? "99+" : unresolvedCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Database connection status */}
      <div className="p-3">
        <div className="bg-surface-2 rounded-[10px] p-4">
          <p className="text-xs font-semibold text-text-primary">
            Database Connected
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`w-2 h-2 rounded-full ${
                apiConnected ? "bg-success" : "bg-danger"
              }`}
            />
            <span
              className={`text-[11px] font-medium ${
                apiConnected ? "text-success" : "text-danger"
              }`}
            >
              {apiConnected ? "SQLite Active" : "API Disconnected"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;