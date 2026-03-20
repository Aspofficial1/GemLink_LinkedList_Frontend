import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Bell } from "lucide-react";
import LandingPage from "./LandingPage";
import AppPages from "./AppPages";

const GemIcon: React.FC<{ size?: number }> = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <polygon points="8,4 24,4 30,12 16,28 2,12" fill="#1B4F8A" />
    <polygon points="8,4 24,4 20,12 12,12" fill="#4A7FC1" />
    <polygon points="12,12 20,12 16,28" fill="#143D6B" />
    <line x1="2" y1="12" x2="30" y2="12" stroke="white" strokeOpacity="0.3" strokeWidth="0.5" />
    <polygon points="14,6 18,6 16,10" fill="white" fillOpacity="0.5" />
  </svg>
);

const navLinks = [
  { id: "landing", label: "Home" },
  { id: "track", label: "Track Gem" },
  { id: "register", label: "Register" },
  { id: "compare", label: "Compare" },
  { id: "alerts", label: "Alerts" },
  { id: "reports", label: "Reports" },
];

const Index: React.FC = () => {
  const [currentPage, setCurrentPage] = useState("landing");
  const [subPage, setSubPage] = useState("dashboard");
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 100], ["rgba(255,255,255,0.85)", "rgba(255,255,255,0.98)"]);
  const navShadow = useTransform(scrollY, [0, 100], ["0 0 0 transparent", "0 1px 12px rgba(0,0,0,0.08)"]);

  const alertCount = 2;

  const handleNav = (id: string) => {
    if (id === "landing") {
      setCurrentPage("landing");
    } else {
      setCurrentPage("app");
      setSubPage(id);
    }
    window.scrollTo(0, 0);
  };

  const isApp = currentPage === "app";
  const activeId = isApp ? subPage : "landing";

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <motion.nav style={{ backgroundColor: navBg, boxShadow: navShadow }}
        className="fixed top-0 left-0 right-0 h-16 z-[1000] border-b border-border flex items-center backdrop-blur-[20px]">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav("landing")}>
            <GemIcon size={32} />
            <span className="font-display text-xl font-bold text-text-primary">Ceylon</span>
            <span className="font-display text-xl font-bold text-gold">Gem</span>
            <span className="h-4 w-px bg-border mx-2" />
            <span className="text-xs font-medium text-text-muted">Origin Tracker</span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <button key={link.id} onClick={() => handleNav(link.id)}
                className="relative text-sm font-medium transition-colors py-5"
                style={{ color: activeId === link.id ? "#0A0A0A" : "#555555" }}>
                {link.label}
                {activeId === link.id && (
                  <motion.div layoutId="activeNavUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-1" onClick={() => handleNav("alerts")}>
              <Bell size={20} className="text-text-secondary" />
              {alertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-primary-foreground text-[10px] font-bold flex items-center justify-center">{alertCount}</span>
              )}
            </button>
            <button onClick={() => { setCurrentPage("app"); setSubPage("dashboard"); window.scrollTo(0, 0); }}
              className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-[13px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all">
              Launch App
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Page Content */}
      <main className={isApp ? "" : "pt-16"}>
        {currentPage === "landing" && <LandingPage />}
        {isApp && <AppPages subPage={subPage} setSubPage={setSubPage} />}
      </main>
    </div>
  );
};

export default Index;
