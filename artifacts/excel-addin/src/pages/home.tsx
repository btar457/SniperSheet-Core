import { useState } from "react";
import { Terminal, Grid3X3, Sparkles } from "lucide-react";
import { CommandsTab } from "@/components/commands-tab";
import { CellDimensionsTab } from "@/components/cell-dimensions-tab";
import { SmartHubTab } from "@/components/smart-hub-tab";

type Tab = "smart" | "commands" | "dimensions";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("smart");

  const tabs: { id: Tab; label: string; arLabel: string; icon: React.ReactNode }[] = [
    { id: "smart",      label: "Smart Hub",  arLabel: "المحرك الذكي", icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: "commands",   label: "Commands",   arLabel: "أوامر",        icon: <Terminal className="w-3.5 h-3.5" /> },
    { id: "dimensions", label: "Dimensions", arLabel: "أبعاد",        icon: <Grid3X3 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex flex-col w-full h-screen max-w-[400px] bg-background border-r border-border overflow-hidden m-0 shadow-xl">
      {/* Header */}
      <header className="flex-none bg-card border-b border-border px-3 py-2.5 flex items-center gap-2">
        <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center text-primary-foreground shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-card-foreground leading-tight tracking-tight">SniperSheet</h1>
          <p className="text-[10px] text-muted-foreground leading-tight">محرك المعادلات الذكي / Smart Logic Engine</p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex-none flex p-1.5 gap-1 bg-muted/30 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-[11px] font-medium transition-all ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            data-testid={`nav-${tab.id}`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.arLabel}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <main className="flex-1 min-h-0 overflow-hidden relative bg-background">
        {activeTab === "smart"      && <SmartHubTab />}
        {activeTab === "commands"   && <CommandsTab />}
        {activeTab === "dimensions" && <CellDimensionsTab />}
      </main>
    </div>
  );
}
