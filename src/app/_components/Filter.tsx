"use client";
import { useEffect, useState } from "react";

type FilterProps<T> = {
  items: T[];
  keys?: (keyof T)[];
  placeholder?: string;
  onFiltered: (items: T[]) => void;
  initialQuery?: string;
  debounceMs?: number;
};

const Filter = <T,>({
  items,
  keys,
  placeholder = "検索",
  onFiltered,
  initialQuery = "",
  debounceMs = 300,
}: FilterProps<T>) => {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    const id = setTimeout(() => {
      if (!q) {
        onFiltered(items);
        return;
      }
      const filtered = items.filter((item) => {
        if (keys && keys.length) {
          return keys.some((k) => {
            const v = item[k];
            return v != null && String(v).toLowerCase().includes(q);
          });
        }
        return JSON.stringify(item).toLowerCase().includes(q);
      });

      onFiltered(filtered);
    }, debounceMs);
    return () => clearTimeout(id);
  }, [items, query, keys, onFiltered, debounceMs]);

  return (
    <div className="mx-4 max-w-2xl py-2 md:mx-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="検索"
        className="w-full rounded border px-3 py-2"
      />
    </div>
  );
};

export default Filter;
