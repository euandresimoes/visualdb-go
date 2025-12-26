import { useEffect, useState } from "react";
import { Combobox, type ComboboxOption } from "./ui/combobox";
import { SchemaService } from "@/services/Schema";
import { TableService } from "@/services/Table";
import { dbStore, type Column } from "@/app/dbStore";
import { ColumnService } from "@/services/Column";

export function TopBar() {
  // Schemas
  const [schemas, setSchemas] = useState<ComboboxOption[]>([]);
  const [selectedSchema, setSelectedSchema] = useState("");
  // Tables
  const [tables, setTables] = useState<ComboboxOption[]>([]);
  const [selectedTable, setSelectedTable] = useState("");

  // Init (Fetch schemas)
  useEffect(() => {
    async function loadSchemas() {
      const data = await SchemaService.getSchemas();

      if (data == null) {
        setSchemas([]);
        return;
      }

      const options: ComboboxOption[] = data.map((schema) => ({
        label: schema,
        value: schema,
      }));

      setSchemas(options);
    }

    loadSchemas();
  }, []);

  // On schema select
  useEffect(() => {
    async function loadTables() {
      if (selectedSchema === "") {
        setTables([]);
        return;
      }

      const data = await TableService.getTables(selectedSchema);

      if (data === null) {
        setTables([]);
        return;
      }

      const options: ComboboxOption[] = data.map((table) => ({
        label: table,
        value: table,
      }));

      setTables(options);
    }
    loadTables();

    function saveSchema() {
      dbStore.setSchema(selectedSchema);
    }
    saveSchema();
  }, [selectedSchema]);

  // On table select
  useEffect(() => {
    async function loadColumns() {
      if (selectedTable === "") {
        return;
      }

      const data = await ColumnService.getColumns(
        selectedSchema,
        selectedTable
      );

      if (data === null) {
        return;
      }

      const columns: Column[] = data.map((column) => ({
        name: column.column_name,
        type: column.data_type,
        nullable: column.is_nullable,
        pk: column.is_primary_key,
        default: column.column_default,
      }));

      dbStore.setTable({
        name: selectedTable,
        columns: columns,
      });

      console.log(dbStore.getTable());
    }
    loadColumns();
  }, [selectedTable]);

  return (
    <div className="w-screen px-4 py-3 flex justify-between items-center bg-(--color-background)">
      <div className="flex justify-center items-center gap-10">
        <h1>Holo Studio</h1>

        <Combobox
          options={schemas}
          value={selectedSchema}
          onChange={setSelectedSchema}
          placeholder="Select schema"
          searchPlaceholder="Search schema..."
          emptyText="No schemas found"
        />

        <Combobox
          options={tables}
          value={selectedTable}
          onChange={setSelectedTable}
          placeholder="Select table"
          searchPlaceholder="Search table..."
          emptyText="No tables found"
        />
      </div>

      <div></div>
    </div>
  );
}
