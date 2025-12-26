import { api } from "@/lib/api";
import { useState } from "react";
import { Divisor } from "./Divisor";

export function Info() {
  const API_BASE = "/api";

  const [connected, setConnected] = useState<boolean>(false);
  const [DBHost, setDBHost] = useState("");
  const [DBName, setDBName] = useState("");
  const [DBPort, setDBPort] = useState("");
  const [DBType, setDBType] = useState("");
  const [DBUser, setDBUser] = useState("");

  useState(() => {
    async function checkConnection() {
      const req = await fetch(`${API_BASE}/health`);
      const res = await req.json();

      setDBHost(res.data.DBHost);
      setDBName(res.data.DBName);
      setDBPort(res.data.DBPort);
      setDBType(res.data.DBType);
      setDBUser(res.data.DBUser);

      if (req.status === 200) {
        setConnected(true);
      }
    }
    checkConnection();
  });

  return (
    <div className="flex justify-center items-center gap-3">
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

      <Divisor />

      <div className="flex justify-center items-center gap-1.5 text-[0.8rem] font-extrabold text-muted-foreground">
        <span className="text-[0.6rem] uppercase text-muted-foreground px-1 rounded bg-primary/5 text-primary/70 border border-primary/30 flex-shrink-0">
          Type
        </span>
        {DBType}
      </div>

      <Divisor />

      <div className="flex justify-center items-center gap-1.5 text-[0.8rem] font-extrabold text-muted-foreground">
        <span className="text-[0.6rem] uppercase text-muted-foreground px-1 rounded bg-primary/5 text-primary/70 border border-primary/30 flex-shrink-0">
          HOST
        </span>
        {DBHost}
      </div>

      <Divisor />

      <div className="flex justify-center items-center gap-1.5 text-[0.8rem] font-extrabold text-muted-foreground">
        <span className="text-[0.6rem] uppercase text-muted-foreground px-1 rounded bg-primary/5 text-primary/70 border border-primary/30 flex-shrink-0">
          Port
        </span>
        {DBPort}
      </div>

      <Divisor />

      <div className="flex justify-center items-center gap-1.5 text-[0.8rem] font-extrabold text-muted-foreground">
        <span className="text-[0.6rem] uppercase text-muted-foreground px-1 rounded bg-primary/5 text-primary/70 border border-primary/30 flex-shrink-0">
          Database
        </span>
        {DBName}
      </div>

      <Divisor />

      <div className="flex justify-center items-center gap-1.5 text-[0.8rem] font-extrabold text-muted-foreground mr-1">
        <span className="text-[0.6rem] uppercase text-muted-foreground px-1 rounded bg-primary/5 text-primary/70 border border-primary/30 flex-shrink-0">
          User
        </span>
        {DBUser}
      </div>
    </div>
  );
}
