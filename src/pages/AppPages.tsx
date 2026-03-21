import React from "react";
import Sidebar, { AppLayoutProps } from "./app/Sidebar";
import TopBar from "./app/TopBar";
import DashboardPage from "./app/DashboardPage";
import TrackPage from "./app/TrackPage";
import ComparePage from "./app/ComparePage";
import ReportsPage from "./app/ReportsPage";
import AlertsPage from "./app/AlertsPage";
import RegisterPage from "./app/RegisterPage";
import SettingsPage from "./app/SettingsPage";
import QRPage from "./app/QRPage";

const pageTitle: Record<string, string> = {
  dashboard: "Dashboard",
  track:     "Track Gem",
  register:  "Register Gem",
  compare:   "Compare Gems",
  alerts:    "Fraud Alerts",
  reports:   "Reports",
  qr:        "QR Codes",
  settings:  "Settings",
};

const AppPages: React.FC<AppLayoutProps> = ({ subPage, setSubPage }) => (
  <div className="flex min-h-screen">
    <Sidebar subPage={subPage} setSubPage={setSubPage} />
    <div className="ml-60 flex-1 min-h-screen bg-background">
      <TopBar title={pageTitle[subPage] || "Dashboard"} />
      {subPage === "dashboard" && <DashboardPage />}
      {subPage === "track"     && <TrackPage />}
      {subPage === "compare"   && <ComparePage />}
      {subPage === "reports"   && <ReportsPage />}
      {subPage === "alerts"    && <AlertsPage />}
      {subPage === "register"  && <RegisterPage />}
      {subPage === "qr"        && <QRPage />}
      {subPage === "settings"  && <SettingsPage />}
    </div>
  </div>
);

export default AppPages;