import { API } from "./api";

export const SchemaService = {
  async getSchemas(): Promise<string[]> {
    const req = await fetch(`${API}/schemas`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const res = await req.json();
    return res.data;
  },
};
