import { useState, useEffect, useMemo } from 'react';
import { Database, Table, ChevronRight, ChevronDown, Terminal, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AppSidebarProps {
  onTableSelect: (schema: string, table: string) => void;
  onOpenQueryEditor: () => void;
  selectedTable?: { schema: string; table: string } | null;
}

export function AppSidebar({ onTableSelect, onOpenQueryEditor, selectedTable }: AppSidebarProps) {
  const [schemas, setSchemas] = useState<string[]>([]);
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(new Set(['public']));
  const [tablesBySchema, setTablesBySchema] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

    schemas.forEach(schema => {
      const tables = tablesBySchema[schema] || [];
      const matchingTables = tables.filter(t => t.toLowerCase().includes(searchLower));
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
      if (data.includes('public')) {
        loadTables('public');
      }
    } catch (error) {
      console.error('Failed to load schemas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTables = async (schema: string) => {
    if (tablesBySchema[schema]) return;
    try {
      const tables = await api.getTables(schema);
      setTablesBySchema(prev => ({ ...prev, [schema]: tables }));
    } catch (error) {
      console.error(`Failed to load tables for ${schema}:`, error);
    }
  };

  const toggleSchema = (schema: string) => {
    setExpandedSchemas(prev => {
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

  return (
    <div className="w-64 h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sidebar-foreground">DBManager</span>
        </div>
      </div>

      {/* New Query Button */}
      <div className="p-3 border-b border-sidebar-border">
        <Button
          variant="outline"
          className="w-full justify-start gap-2 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20"
          onClick={onOpenQueryEditor}
        >
          <Terminal className="h-4 w-4" />
          New Query
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-sidebar-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tables..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 bg-sidebar-accent/20 border-sidebar-border"
          />
        </div>
      </div>

      {/* Schema/Tables Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? (
            <div className="text-sm text-muted-foreground p-2">Loading...</div>
          ) : (
            filteredData.schemas.map(schema => (
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

                {(expandedSchemas.has(schema) || search) && filteredData.tablesBySchema[schema] && (
                  <div className="ml-4 mt-1 space-y-0.5">
                    {filteredData.tablesBySchema[schema].map(table => (
                      <button
                        key={table}
                        onClick={() => onTableSelect(schema, table)}
                        className={cn(
                          'flex items-center gap-2 w-full p-2 rounded-md text-sm transition-colors',
                          isSelected(schema, table)
                            ? 'bg-primary/10 border border-primary/30 text-primary'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/20'
                        )}
                      >
                        <Table className="h-4 w-4" />
                        <span>{table}</span>
                      </button>
                    ))}
                    {filteredData.tablesBySchema[schema].length === 0 && (
                      <div className="text-xs text-muted-foreground p-2">No tables</div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
