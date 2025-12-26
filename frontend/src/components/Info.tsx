import { api } from "@/lib/api";
import { useState } from "react";

export function Info() {
  const API_BASE = "/api";

  const [connected, setConnected] = useState<boolean>(false);

  useState(() => {
    async function checkConnection() {
      const req = await fetch(`http://localhost:23806/health`);

      if (req.status === 200 || 204) {
        setConnected(true);
      }
    }
    checkConnection();
  });

  return (
    <div className="flex justify-center items-center gap-2">
      <div
        className={`w-2.5 h-2.5 rounded-full border-2 shadow-lg ${
          connected
            ? "border-primary bg-primary shadow-primary"
            : "border-destructive bg-destructive shadow-destructive"
        }`}
      ></div>
      <p className="text-[0.7rem] font-bold text-muted-foreground">
        {connected ? "CONNECTED" : "NOT CONNECTED"}
      </p>
    </div>
  );
}
