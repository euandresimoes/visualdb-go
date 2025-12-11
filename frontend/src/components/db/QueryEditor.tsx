import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Copy, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function QueryEditor() {
  const [query, setQuery] = useState("SELECT * FROM users LIMIT 10;");
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    toast({ title: "Copied", description: "Query copied to clipboard" });
  };

  const handleRun = () => {
    toast({
      title: "Coming Soon",
      description: "SQL execution will be available in a future update",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card/30">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Query Editor</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setQuery("")}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleRun}
            className="bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20"
          >
            <Play className="h-4 w-4 mr-1" />
            Run
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-full min-h-64 p-4 rounded-lg bg-background border border-border font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Enter your SQL query here..."
          spellCheck={false}
        />
      </div>

      {/* Results Area */}
      <div className="border-t border-border bg-card/30 p-4">
        <div className="text-sm text-muted-foreground">
          Results will appear here after running a query.
        </div>
      </div>
    </div>
  );
}
