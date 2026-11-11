export const money = (v: unknown) => (v == null ? "—" : `$${Number(v).toLocaleString()}`);
export const dateTime = (v: unknown) => (v ? new Date(String(v)).toLocaleString() : "Never");
