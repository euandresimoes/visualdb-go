import { useState, useEffect } from "react";
import { api, Column } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Key,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTableProps {
  schema: string;
  table: string;
}

const LIMIT_OPTIONS = [10, 25, 50, 100, 200];

const getInputType = (dataType: string): string => {
  const lower = dataType.toLowerCase();
  if (lower === "date") return "date";
  if (lower.includes("timestamp") || lower.includes("datetime"))
    return "datetime-local";
  if (lower.includes("time") && !lower.includes("timestamp")) return "time";
  return "text";
};

const formatDateForInput = (value: unknown, dataType: string): string => {
  if (!value) return "";
  const date = new Date(value as string);
  if (isNaN(date.getTime())) return String(value);
  const lowerType = dataType.toLowerCase();
  if (lowerType.includes("timestamp") || lowerType.includes("datetime")) {
    // Return the time part as-is without timezone conversion
    const pad = (num: number) => num.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  if (lowerType === "date") {
    return date.toISOString().split("T")[0];
  }
  if (lowerType === "time" && !lowerType.includes("timestamp")) {
    return date.toTimeString().split(" ")[0];
  }
  return String(value);
};

export function DataTable({ schema, table }: DataTableProps) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(true);
  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);
  const [isNewRow, setIsNewRow] = useState(false);
  const [deleteRow, setDeleteRow] = useState<Record<string, unknown> | null>(
    null
  );
  const [selectedRows, setSelectedRows] = useState<Set<unknown>>(new Set());
  const [deletingSelected, setDeletingSelected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    setSelectedRows(new Set());
  }, [schema, table, page, limit]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cols, rowData] = await Promise.all([
        api.getColumns(schema, table),
        api.getRows(schema, table, page, limit),
      ]);
      setColumns(cols);
      setRows(rowData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryKey = () => columns.find((c) => c.is_primary_key);

  const handleSave = async () => {
    if (!editRow) return;
    const pk = getPrimaryKey();
    try {
      if (isNewRow) {
        const dataToSend = { ...editRow };
        if (pk?.column_default?.includes("nextval")) {
          delete dataToSend[pk.column_name];
        }
        await api.createRow(schema, table, dataToSend);
        toast({ title: "Success", description: "Row created successfully" });
      } else if (pk) {
        const pkValue = editRow[pk.column_name];
        const dataToSend = { ...editRow };
        delete dataToSend[pk.column_name];
        await api.updateRow(schema, table, pk.column_name, pkValue, dataToSend);
        toast({ title: "Success", description: "Row updated successfully" });
      }
      setEditRow(null);
      setIsNewRow(false);
      loadData();
    } catch (error: any) {
      console.error("Save error:", error);

      let errorMessage = "An error occurred while saving the row";

      try {
        const errorResponse = await error.json();
        errorMessage = errorResponse.message || errorMessage;
      } catch (e) {
        if (error.message) {
          errorMessage = error.message;
        }
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteRow) return;
    const pk = getPrimaryKey();
    if (!pk) return;

    try {
      await api.deleteRow(
        schema,
        table,
        pk.column_name,
        deleteRow[pk.column_name]
      );
      toast({ title: "Success", description: "Row deleted successfully" });
      setDeleteRow(null);
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Delete failed",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSelected = async () => {
    const pk = getPrimaryKey();
    if (!pk || selectedRows.size === 0) return;

    setDeletingSelected(true);
    try {
      const deletePromises = Array.from(selectedRows).map((pkValue) =>
        api.deleteRow(schema, table, pk.column_name, pkValue)
      );
      await Promise.all(deletePromises);
      toast({
        title: "Success",
        description: `${selectedRows.size} rows deleted successfully`,
      });
      setSelectedRows(new Set());
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Some deletions failed",
        variant: "destructive",
      });
    } finally {
      setDeletingSelected(false);
    }
  };

  const toggleSelectRow = (pkValue: unknown) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(pkValue)) {
      newSelected.delete(pkValue);
    } else {
      newSelected.add(pkValue);
    }
    setSelectedRows(newSelected);
  };

  const toggleSelectAll = () => {
    const pk = getPrimaryKey();
    if (!pk) return;

    if (selectedRows.size === rows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(rows.map((row) => row[pk.column_name])));
    }
  };

  const openNewRow = () => {
    const emptyRow: Record<string, unknown> = {};
    columns.forEach((col) => {
      emptyRow[col.column_name] = "";
    });
    setEditRow(emptyRow);
    setIsNewRow(true);
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "NULL";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card/30">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{table}</h2>
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted/50">
            {schema}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          {selectedRows.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={deletingSelected}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete ({selectedRows.size})
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={openNewRow}
            className="bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Row
          </Button>
        </div>
      </div>

      {/* Table */}
      <ScrollArea className="flex-1">
        <div className="min-w-max">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="w-10 text-center">
                  <Checkbox
                    checked={
                      rows.length > 0 && selectedRows.size === rows.length
                    }
                    onCheckedChange={toggleSelectAll}
                    className="border-primary data-[state=checked]:bg-primary"
                  />
                </TableHead>
                <TableHead className="w-20 text-center">Actions</TableHead>
                {columns.map((col) => (
                  <TableHead key={col.column_name} className="min-w-32">
                    <div className="flex items-center gap-1">
                      {col.is_primary_key && (
                        <Key className="h-3 w-3 text-primary" />
                      )}
                      <span>{col.column_name}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        {col.data_type}
                      </span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 2}
                    className="text-center py-8"
                  >
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 2}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No data found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => {
                  const pk = getPrimaryKey();
                  const pkValue = pk ? row[pk.column_name] : idx;
                  const isSelected = selectedRows.has(pkValue);

                  return (
                    <TableRow
                      key={idx}
                      className={cn(
                        "border-border hover:bg-muted/30",
                        isSelected && "bg-primary/10"
                      )}
                    >
                      <TableCell className="text-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectRow(pkValue)}
                          className="border-primary data-[state=checked]:bg-primary"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              setEditRow(row);
                              setIsNewRow(false);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteRow(row)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                      {columns.map((col) => (
                        <TableCell
                          key={col.column_name}
                          className="font-mono text-sm"
                        >
                          <span
                            className={cn(
                              row[col.column_name] === null &&
                                "text-muted-foreground italic"
                            )}
                          >
                            {formatValue(row[col.column_name])}
                          </span>
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Pagination */}
      <div className="flex items-center justify-between p-3 border-t border-border bg-card/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Limit:</span>
            <Select
              value={String(limit)}
              onValueChange={(v) => {
                setLimit(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LIMIT_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={String(opt)}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-sm text-muted-foreground">
            Page {page} • {rows.length} rows
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={rows.length < limit}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editRow}
        onOpenChange={() => {
          setEditRow(null);
          setIsNewRow(false);
        }}
      >
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNewRow ? "Add Row" : "Edit Row"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {editRow &&
              columns.map((col) => {
                const isPk = col.is_primary_key;
                const hasDefault = col.column_default?.includes("nextval");
                const disabled = isPk && !isNewRow;
                const inputType = getInputType(col.data_type);

                return (
                  <div key={col.column_name} className="space-y-1">
                    <label className="text-sm flex items-center gap-2">
                      {isPk && <Key className="h-3 w-3 text-primary" />}
                      {col.column_name}
                      <span className="text-xs text-muted-foreground">
                        ({col.data_type})
                      </span>
                      {isNewRow && hasDefault && (
                        <span className="text-xs text-muted-foreground">
                          (auto)
                        </span>
                      )}
                    </label>
                    <Input
                      type={inputType}
                      value={formatDateForInput(
                        editRow[col.column_name],
                        col.data_type
                      )}
                      onChange={(e) => {
                        let value = e.target.value;
                        if (
                          col.data_type.toLowerCase().includes("timestamp") &&
                          value
                        ) {
                          // Keep the exact value without timezone conversion
                          setEditRow({
                            ...editRow,
                            [col.column_name]: value || null,
                          });
                        } else if (
                          col.data_type.toLowerCase() === "date" &&
                          value
                        ) {
                          setEditRow({
                            ...editRow,
                            [col.column_name]: value || null,
                          });
                        } else {
                          setEditRow({
                            ...editRow,
                            [col.column_name]: value || null,
                          });
                        }
                      }}
                      disabled={disabled || (isNewRow && hasDefault)}
                      placeholder={
                        col.is_nullable === "YES" ? "NULL" : "Required"
                      }
                    />
                  </div>
                );
              })}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditRow(null);
                setIsNewRow(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteRow} onOpenChange={() => setDeleteRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Row</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this row? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
