import { useState } from "react";
import { Terminal, Grid3X3, Settings2 } from "lucide-react";
import { CommandsTab } from "@/components/commands-tab";
import { CellDimensionsTab } from "@/components/cell-dimensions-tab";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"commands" | "dimensions">("commands");

  return (
    <div className="flex flex-col w-full h-screen max-w-[400px] bg-background border-r border-border overflow-hidden m-0 shadow-xl">
      {/* App Header / Task Pane Header */}
      <header className="flex-none bg-card border-b border-border p-3 flex items-center gap-2">
        <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-primary-foreground shadow-sm">
          <Grid3X3 className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-card-foreground leading-tight tracking-tight">Excel Assistant</h1>
          <p className="text-[10px] text-muted-foreground leading-tight">Pro Toolkit</p>
        </div>
        <button className="text-muted-foreground hover:text-foreground transition-colors p-1" data-testid="button-settings">
          <Settings2 className="w-4 h-4" />
        </button>
      </header>

      {/* Navigation / Tab Switcher */}
      <div className="flex-none flex p-2 gap-1 bg-muted/30 border-b border-border">
        <button
          onClick={() => setActiveTab("commands")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
            activeTab === "commands"
              ? "bg-background text-foreground shadow-sm border border-border/50"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          data-testid="nav-commands"
        >
          <Terminal className="w-3.5 h-3.5" />
          Commands
        </button>
        <button
          onClick={() => setActiveTab("dimensions")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
            activeTab === "dimensions"
              ? "bg-background text-foreground shadow-sm border border-border/50"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
          data-testid="nav-dimensions"
        >
          <Grid3X3 className="w-3.5 h-3.5" />
          Dimensions
        </button>
      </div>

      {/* Tab Content Area */}
      <main className="flex-1 min-h-0 overflow-hidden relative bg-background">
        {activeTab === "commands" ? <CommandsTab /> : <CellDimensionsTab />}
      </main>
    </div>
  );
}
