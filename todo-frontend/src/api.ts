import type { TodoItem } from "./types";

// Base URL of the .NET API. The front end is served over HTTPS,
// so it must call the API over HTTPS too (no mixed content).
const API_BASE = "https://localhost:5001/api/todoitems";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${text}`.trim());
  }
  return res.json() as Promise<T>;
}

export async function getItems(): Promise<TodoItem[]> {
  const res = await fetch(API_BASE);
  return handle<TodoItem[]>(res);
}

export async function addItem(title: string): Promise<TodoItem> {
  const res = await fetch(API_BASE, {
    method: "POST", // <-- the HTTP POST that adds items to the list
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: 0, title, isComplete: false }),
  });
  return handle<TodoItem>(res);
}

export async function updateItem(item: TodoItem): Promise<void> {
  const res = await fetch(`${API_BASE}/${item.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
}

export async function deleteItem(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
}
