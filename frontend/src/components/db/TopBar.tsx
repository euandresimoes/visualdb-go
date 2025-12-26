import { Terminal } from "lucide-react";
import { Button } from "../ui/button";
import { Info } from "../Info";
import { useState } from "react";

interface TopBarProps {
  onOpenQueryEditor: () => void;
}

export function TopBar({ onOpenQueryEditor }: TopBarProps) {
  const API_BASE = "/api";

  const [version, setVersion] = useState("");

  useState(() => {
    async function checkConnection() {
      const req = await fetch(`${API_BASE}/health`);
      const res = await req.json();

      setVersion(res.version);
    }
    checkConnection();
  });

  return (
    <div className="w-full px-4 py-3 flex bg-sidebar justify-between items-center">
      <div className="flex justify-center items-center">
        {/* Header */}
        <div className="w-[16.5rem] h-full flex justify-center items-center gap-1">
          <img src="/logo.jpg" alt="" className="h-8 w-8 mr-1 rounded-md" />
          <span className="font-bold text-[1.05rem] text-sidebar-foreground">
            Holo Studio
          </span>
          <span className="font-bold text-[0.7rem] text-muted-foreground">
            {version}
          </span>
        </div>

        {/* New Query Button */}
        <div className="ml-3">
          <Button
            variant="outline"
            className="w-full text-[0.8rem] justify-start gap-2 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20"
            onClick={onOpenQueryEditor}
            size="sm"
          >
            <Terminal className="h-4 w-4" />
            New Query
          </Button>
        </div>
      </div>

      <div className="flex justify-center mr-1.5 items-center gap-5">
        <div className="h-full">
          <Info />
        </div>
      </div>
    </div>
  );
}
