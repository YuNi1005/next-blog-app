"use client";
import { useEffect, useMemo, useState } from "react";

type PaginationProps<T> = {
  items: T[];
  pageSize?: number;
  initialPage?: number;
  onPageItems?: (items: T[]) => void;
  render?: (pageItems: T[]) => React.ReactNode;
  showControls?: boolean;
};

const Pagination = <T,>({
  items,
  pageSize = 10,
  initialPage = 1,
  onPageItems,
  render,
  showControls = true,
}: PaginationProps<T>) => {
  const [page, setPage] = useState(initialPage);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  useEffect(() => {
    onPageItems?.(pageItems);
  }, [pageItems, onPageItems]);

  return (
    <div className="mx-4 max-w-2xl md:mx-auto">
      <div className="">{render ? render(pageItems) : null}</div>

      {showControls && (
        <div className="mt-3 flex items-center gap-2">
          <button
            className="rounded bg-slate-700 px-3 py-1 text-white disabled:opacity-50"
            onClick={() => setPage(1)}
            disabled={page === 1}
            aria-label="最初"
          >
            最初
          </button>
          <button
            className="rounded border px-3 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="前"
          >
            前
          </button>
          <span className="text-sm">
            {page} / {totalPages}
          </span>
          <button
            className="rounded border px-3 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="次"
          >
            次
          </button>
          <button
            className="rounded bg-slate-700 px-3 py-1 text-white disabled:opacity-50"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            aria-label="最後"
          >
            最後
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
