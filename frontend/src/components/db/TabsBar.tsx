import { X, Table, Terminal, Plus, GripVertical } from "lucide-react";
import { TabItem } from "@/types";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useState, useRef } from "react";
import { Button } from "../ui/button";

interface TabsBarProps {
  tabs: TabItem[];
  activeTabId: string | null;
  onTabSelect: (id: string) => void;
  onTabClose: (id: string) => void;
  onTabsReorder?: (tabs: TabItem[]) => void;
  onOpenQueryEditor: () => void;
}

export function TabsBar({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onTabsReorder,
  onOpenQueryEditor,
}: TabsBarProps) {
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const dragOverTabId = useRef<string | null>(null);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    tabId: string
  ) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", tabId);
    setDraggedTabId(tabId);
    // Add a small delay to allow the drag image to be set
    setTimeout(() => {
      e.currentTarget.classList.add("opacity-50");
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove("opacity-50");
    setDraggedTabId(null);
    dragOverTabId.current = null;
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    tabId: string
  ) => {
    e.preventDefault();
    if (tabId !== draggedTabId && tabId !== dragOverTabId.current) {
      dragOverTabId.current = tabId;
      const newTabs = [...tabs];
      const draggedIndex = newTabs.findIndex((tab) => tab.id === draggedTabId);
      const targetIndex = newTabs.findIndex((tab) => tab.id === tabId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [removed] = newTabs.splice(draggedIndex, 1);
        newTabs.splice(targetIndex, 0, removed);
        onTabsReorder?.(newTabs);
      }
    }
  };

  const handleDragLeave = () => {
    dragOverTabId.current = null;
  };
  return (
    <div className="h-12 border-b border-border flex items-center">
      <ScrollArea className="w-full">
        <div className="flex items-end h-10 px-3 py-1 gap-1.5">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              title="Double-click or middle-click to close"
              className={cn(
                "group flex items-center gap-2 h-full px-3 border border-transparent bg-primaryView rounded-sm cursor-default active:cursor-grabbing transition-all text-sm font-medium",
                "hover:bg-muted/40 border-border/60 tab-rounded",
                activeTabId === tab.id
                  ? "bg-primaryView text-foreground border border-border"
                  : "text-muted-foreground border-border/30",
                draggedTabId === tab.id ? "opacity-50" : "",
                dragOverTabId.current === tab.id
                  ? "border-dashed border-primary/50"
                  : ""
              )}
              draggable
              onDragStart={(e) => handleDragStart(e, tab.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, tab.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => e.preventDefault()}
              onMouseDown={(e) => {
                if (e.button === 1) {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              onClick={() => onTabSelect(tab.id)}
            >
              {tab.type === "query" ? (
                <Terminal className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Table className="h-3.5 w-3.5 text-primary/70" />
              )}
              <span className="max-w-32 truncate select-none">
                {tab.type === "query" ? "Query" : tab.table}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                className="ml-1 p-1 rounded hover:bg-destructive/20 hover:text-destructive cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={onOpenQueryEditor}
            className="px-2 h-full"
          >
            <Plus className="h-2 w-2" strokeWidth={1} />
          </Button>
        </div>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
