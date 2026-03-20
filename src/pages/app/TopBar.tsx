import React from "react";
import { Search } from "lucide-react";

const TopBar: React.FC<{ title: string }> = ({ title }) => (
  <div className="h-16 border-b border-border flex items-center justify-between px-8">
    <h1 className="font-display text-[22px] font-bold text-text-primary">{title}</h1>
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
      <input
        placeholder="Search gems..."
        className="w-[280px] h-9 pl-9 pr-4 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  </div>
);

export default TopBar;
