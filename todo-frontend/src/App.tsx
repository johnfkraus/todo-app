import { useCallback, useEffect, useState } from "react";
import { addItem, deleteItem, getItems, updateItem } from "./api";
import type { TodoItem } from "./types";

export default function App() {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await getItems());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    try {
      await addItem(title); // HTTP POST -> .NET -> SQL Server
      setNewTitle("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleToggle(item: TodoItem) {
    try {
      await updateItem({ ...item, isComplete: !item.isComplete });
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteItem(id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  function startEdit(item: TodoItem) {
    setEditingId(item.id);
    setEditTitle(item.title);
  }

  async function saveEdit(id: number) {
    const title = editTitle.trim();
    if (!title) return;
    const item = items.find((i) => i.id === id);
    if (!item) return;
    try {
      await updateItem({ ...item, title });
      setEditingId(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: "2rem auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>Todo List</h1>
      <p style={{ color: "#555" }}>
        React + Vite (HTTPS) &rarr; .NET API &rarr; SQL Server
      </p>

      <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New item..."
          style={{ flex: 1, padding: "0.5rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>
          Add (POST)
        </button>
      </form>

      {error && (
        <p style={{ color: "crimson" }}>
          {error}{" "}
          <button onClick={refresh} style={{ marginLeft: 8 }}>
            retry
          </button>
        </p>
      )}

      {loading && <p>Loading...</p>}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((item) => (
          <li key={item.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0" }}>
            <input
              type="checkbox"
              checked={item.isComplete}
              onChange={() => handleToggle(item)}
            />
            {editingId === item.id ? (
              <>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{ flex: 1, padding: "0.3rem" }}
                  autoFocus
                />
                <button onClick={() => saveEdit(item.id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span
                  style={{
                    flex: 1,
                    textDecoration: item.isComplete ? "line-through" : "none",
                  }}
                >
                  {item.title}
                </span>
                <button onClick={() => startEdit(item)}>Edit</button>
                <button onClick={() => handleDelete(item.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
