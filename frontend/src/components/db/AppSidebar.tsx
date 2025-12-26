import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Database,
  Table,
  ChevronRight,
  ChevronDown,
  Terminal,
  Search,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AppSidebarProps {
  onTableSelect: (schema: string, table: string) => void;
  selectedTable?: { schema: string; table: string } | null;
}

export function AppSidebar({ onTableSelect, selectedTable }: AppSidebarProps) {
  const [schemas, setSchemas] = useState<string[]>([]);
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(
    new Set(["public"])
  );
  const [tablesBySchema, setTablesBySchema] = useState<
    Record<string, string[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default width: 16rem = 256px
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    loadSchemas();
  }, []);

  const filteredData = useMemo(() => {
    if (!search.trim()) {
      return { schemas, tablesBySchema };
    }
    const searchLower = search.toLowerCase();
    const filtered: Record<string, string[]> = {};
    const matchingSchemas: string[] = [];

    schemas.forEach((schema) => {
      const tables = tablesBySchema[schema] || [];
      const matchingTables = tables.filter((t) =>
        t.toLowerCase().includes(searchLower)
      );
      const schemaMatches = schema.toLowerCase().includes(searchLower);

      if (matchingTables.length > 0 || schemaMatches) {
        matchingSchemas.push(schema);
        filtered[schema] = matchingTables.length > 0 ? matchingTables : tables;
      }
    });

    return { schemas: matchingSchemas, tablesBySchema: filtered };
  }, [schemas, tablesBySchema, search]);

  const loadSchemas = async () => {
    try {
      const data = await api.getSchemas();
      setSchemas(data);
      // Auto-load tables for public schema
      if (data.includes("public")) {
        loadTables("public");
      }
    } catch (error) {
      console.error("Failed to load schemas:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTables = async (schema: string) => {
    if (tablesBySchema[schema]) return;
    try {
      const tables = await api.getTables(schema);
      setTablesBySchema((prev) => ({ ...prev, [schema]: tables }));
    } catch (error) {
      console.error(`Failed to load tables for ${schema}:`, error);
    }
  };

  const toggleSchema = (schema: string) => {
    setExpandedSchemas((prev) => {
      const next = new Set(prev);
      if (next.has(schema)) {
        next.delete(schema);
      } else {
        next.add(schema);
        loadTables(schema);
      }
      return next;
    });
  };

  const isSelected = (schema: string, table: string) =>
    selectedTable?.schema === schema && selectedTable?.table === table;

  // Handle mouse down on resize handle
  const startResizing = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = sidebarWidth;
    },
    [sidebarWidth]
  );

  // Handle mouse move during resize
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = startWidthRef.current + (e.clientX - startXRef.current);
      // Set minimum and maximum width constraints
      setSidebarWidth(Math.min(Math.max(192, newWidth), 512)); // Min: 12rem (192px), Max: 32rem (512px)
    },
    [isResizing]
  );

  // Clean up event listeners
  const stopResizing = useCallback(() => {
    setIsResizing(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
  }, [handleMouseMove]);

  // Update event listeners when isResizing changes
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", stopResizing);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, handleMouseMove, stopResizing]);

  return (
    <div
      ref={sidebarRef}
      className="h-full flex flex-col bg-sidebar relative"
      style={{
        width: `${sidebarWidth}px`,
        minWidth: "292px",
        maxWidth: "512px",
      }}
    >
      {/* Resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 active:bg-primary transition-colors z-10"
        onMouseDown={startResizing}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          msUserSelect: "none",
          MozUserSelect: "none",
        }}
      />

      {/* Search */}
      <div className="pr-3 pl-3 mt-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-10 bg-sidebar-accent/20 border-sidebar-border"
          />
        </div>
      </div>

      {/* Schema/Tables Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? (
            <div className="text-sm text-muted-foreground p-2">Loading...</div>
          ) : (
            filteredData.schemas.map((schema) => (
              <div key={schema} className="mb-1">
                <button
                  onClick={() => toggleSchema(schema)}
                  className="flex items-center gap-1 w-full p-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/20 transition-colors"
                >
                  {expandedSchemas.has(schema) ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Database className="h-4 w-4 text-primary/70" />
                  <span>{schema}</span>
                </button>

                {(expandedSchemas.has(schema) || search) &&
                  filteredData.tablesBySchema[schema] && (
                    <div className="ml-4 mt-1 space-y-2 space-x-2.5 pr-3.5 relative">
                      <div className="w-px h-full absolute left-0 top-0 bg-border/40" />
                      {filteredData.tablesBySchema[schema].map((table) => (
                        <button
                          key={table}
                          onClick={() => onTableSelect(schema, table)}
                          className={cn(
                            "flex items-center gap-2 w-full p-2 border border-transparent rounded-md text-sm transition-colors",
                            isSelected(schema, table)
                              ? "bg-primary/10 border border-primary/30 text-primary"
                              : "text-sidebar-foreground hover:bg-sidebar-accent/20"
                          )}
                        >
                          <Table className="h-4 w-4" />
                          <span>{table}</span>
                        </button>
                      ))}
                      {filteredData.tablesBySchema[schema].length === 0 && (
                        <div className="text-xs text-muted-foreground p-2">
                          No tables
                        </div>
                      )}
                    </div>
                  )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      {isResizing && <div className="fixed inset-0 z-50 cursor-col-resize" />}
    </div>
  );
}
