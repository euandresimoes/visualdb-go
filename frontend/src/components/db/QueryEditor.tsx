import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  Copy,
  Trash2,
  CheckCircle2,
  XCircle,
  Download,
  FileUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { aura } from "@uiw/codemirror-theme-aura";
import { QueryResult } from "@/types";

interface QueryEditorProps {
  query: string;
  result: QueryResult | null;
  onQueryChange: (query: string) => void;
  onRun: (query: string) => Promise<QueryResult | null>;
}

export function QueryEditor({
  query,
  result,
  onQueryChange,
  onRun,
}: QueryEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    toast({ title: "Copied", description: "Query copied to clipboard" });
  };

  const handleLoadQueryFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".sql";

    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      query = text;
      onQueryChange(query);
    };

    input.click();
  };

  const handleQuerySave = () => {
    const blob = new Blob([query], { type: "text/plain" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    let date = new Date();
    const dateText =
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0") +
      "T" +
      String(date.getHours()).padStart(2, "0") +
      "-" +
      String(date.getMinutes()).padStart(2, "0") +
      "-" +
      String(date.getSeconds()).padStart(2, "0") +
      "-" +
      String(date.getMilliseconds()).padStart(3, "0");

    link.href = url;
    link.download = "query_" + dateText + ".sql";
    link.textContent = "Download query";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRun = async () => {
    try {
      setIsLoading(true);
      const result = await onRun(query);

      if (result) {
        if (result.status >= 400) {
          toast({
            title: "Error",
            description:
              result.message || "An error occurred while executing the query",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Query executed successfully",
          });
        }
      }
    } catch (error) {
      console.error("Error executing query:", error);
      toast({
        title: "Error",
        description:
          "Failed to execute query. Please check the console for more details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card/30">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">SQL Editor</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            title="Delete query"
            onClick={() => onQueryChange("")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            title="Copy query"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            title="Load query"
            onClick={handleLoadQueryFile}
          >
            <FileUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            title="Save query"
            onClick={handleQuerySave}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            title="Run query"
            onClick={handleRun}
            disabled={isLoading}
            className="bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-1" />
            ) : (
              <Play className="h-4 w-4 mr-1" />
            )}
            {isLoading ? "Running..." : "Run"}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="h-full w-full max-h-[45%] cm-wrapper">
        <CodeMirror
          value={query}
          onChange={onQueryChange}
          extensions={[aura, sql()]}
          height="100%"
          theme="none"
          placeholder="Enter your SQL query here... (CTRL + Enter to Run)"
          className="w-full h-full text-[1rem] overflow-hidden"
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === "Enter") {
              e.preventDefault();
              handleRun();
            }
          }}
        />
      </div>

      {/* Results Area */}
      <div className="border-t border-border bg-card/30 p-4 flex-1 overflow-auto">
        {result ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {result.status < 400 ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <h3 className="font-medium">
                {result.status < 400
                  ? "Query executed successfully"
                  : "Error executing query"}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                Status: {result.status}
              </span>
            </div>

            {result.data && (
              <div className="mt-2">
                <h4 className="text-sm font-medium mb-1">Result:</h4>
                <pre className="p-3 rounded-md bg-background border border-border text-sm overflow-x-auto">
                  {typeof result.data === "string"
                    ? result.data
                    : JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}

            {result.message && (
              <div className="mt-2">
                <h4 className="text-sm font-medium mb-1">Message:</h4>
                <div className="p-3 rounded-md bg-background/50 border border-border text-sm">
                  {result.message}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground h-full flex items-center justify-center">
            Results will appear here after running a query.
          </div>
        )}
      </div>
    </div>
  );
}
