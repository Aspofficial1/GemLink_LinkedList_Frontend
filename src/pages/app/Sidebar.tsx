import React from "react";
import { LayoutDashboard, Search, PlusCircle, GitCompare, AlertTriangle, FileText, Settings } from "lucide-react";

export interface AppLayoutProps {
  subPage: string;
  setSubPage: (p: string) => void;
}

const sidebarItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "track", icon: Search, label: "Track Gem" },
  { id: "register", icon: PlusCircle, label: "Register Gem" },
  { id: "compare", icon: GitCompare, label: "Compare Gems" },
  { id: "alerts", icon: AlertTriangle, label: "Fraud Alerts" },
  { id: "reports", icon: FileText, label: "Reports" },
  { id: "settings", icon: Settings, label: "Settings" },
];

const Sidebar: React.FC<AppLayoutProps> = ({ subPage, setSubPage }) => (
  <aside className="fixed left-0 top-0 bottom-0 w-60 bg-surface border-r border-border flex flex-col z-40">
    <div className="h-16 flex items-center px-4 gap-2 border-b border-border">
      <svg width={24} height={24} viewBox="0 0 32 32" fill="none">
        <polygon points="8,4 24,4 30,12 16,28 2,12" fill="#1B4F8A" />
        <polygon points="8,4 24,4 20,12 12,12" fill="#4A7FC1" />
      </svg>
      <span className="font-display text-lg font-bold text-text-primary">
        Ceylon<span className="text-gold">Gem</span>
      </span>
    </div>
    <nav className="flex-1 py-4 px-3 space-y-1">
      {sidebarItems.map(item => {
        const active = subPage === item.id;
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
            {item.label}
          </button>
        );
      })}
    </nav>
    <div className="p-3">
      <div className="bg-surface-2 rounded-[10px] p-4">
        <p className="text-xs font-semibold text-text-primary">Database Connected</p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-[11px] text-success font-medium">SQLite Active</span>
        </div>
      </div>
    </div>
  </aside>
);

export default Sidebar;
