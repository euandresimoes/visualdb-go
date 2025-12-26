import { API } from "./api";

type Column = {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string;
  is_primary_key: boolean;
};

export const ColumnService = {
  async getColumns(schema: string, table: string): Promise<Column[]> {
    const req = await fetch(`${API}/columns?schema=${schema}&table=${table}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const res = await req.json();
    return res.data;
  },
};
