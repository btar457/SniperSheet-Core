import { useState } from "react";
import { Grid3X3, Sparkles, Wrench, HelpCircle } from "lucide-react";
import { CellDimensionsTab } from "@/components/cell-dimensions-tab";
import { SmartHubTab } from "@/components/smart-hub-tab";
import { ToolsTab } from "@/components/tools-tab";

type Tab = "smart" | "dimensions" | "tools";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("smart");

  const tabs: { id: Tab; arLabel: string; enLabel: string; icon: React.ReactNode }[] = [
    { id: "smart",      arLabel: "الذكي",  enLabel: "Smart",  icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: "dimensions", arLabel: "أبعاد",  enLabel: "Dims",   icon: <Grid3X3 className="w-3.5 h-3.5" /> },
    { id: "tools",      arLabel: "أدوات",  enLabel: "Tools",  icon: <Wrench className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex flex-col w-full h-screen max-w-[400px] bg-background border-r border-border overflow-x-hidden m-0 shadow-xl">
      {/* Header */}
      <header className="flex-none bg-card border-b border-border px-3 py-2 flex items-center gap-2">
        <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center text-primary-foreground shadow-sm flex-none">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-card-foreground leading-tight tracking-tight">SniperSheet</h1>
          <p className="text-[10px] text-muted-foreground leading-tight truncate">محرك المعادلات الذكي / Smart Logic Engine</p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex-none flex border-b border-border bg-muted/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-all border-b-2 touch-manipulation select-none ${
              activeTab === tab.id
                ? "border-primary text-primary bg-background"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40 active:bg-muted/60"
            }`}
            data-testid={`nav-${tab.id}`}
          >
            {tab.icon}
            <span>{tab.arLabel}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative bg-background touch-pan-y sniper-scroll">
        {activeTab === "smart"      && <SmartHubTab />}
        {activeTab === "dimensions" && <CellDimensionsTab />}
        {activeTab === "tools"      && <ToolsTab />}
      </main>

      {/* Footer */}
      <footer className="flex-none border-t border-border bg-muted/20 px-3 py-1.5 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground truncate">Mustafa Alsahlany</span>
        <button
          onClick={() => window.open("/help", "_blank")}
          className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Help</span>
        </button>
      </footer>
    </div>
  );
}
