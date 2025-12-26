import { API } from "./api";

export const TableService = {
  async getTables(schema: string): Promise<string[]> {
    const req = await fetch(`${API}/tables?schema=${schema}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const res = await req.json();
    return res.data;
  },
};
