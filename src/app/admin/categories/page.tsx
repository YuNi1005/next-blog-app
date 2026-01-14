"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

type Category = { id: string; name: string; createdAt?: string };

const Page: React.FC = () => {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/categories`, {
        method: "GET",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("カテゴリの取得に失敗しました");
      const data = await res.json();
      setCategories(data as Category[]);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "予期せぬエラー");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (c: Category) => {
    if (!confirm(`カテゴリ「${c.name}」を削除しますか？`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${c.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`削除に失敗しました (${res.status})`);
      await fetchCategories();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  if (fetchError) return <div className="text-red-500">{fetchError}</div>;
  if (isLoading || !categories)
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );

  return (
    <main>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">カテゴリの管理</h1>
        <Link
          href="/admin/categories/new"
          className="rounded-md bg-blue-500 px-4 py-2 text-white"
        >
          新規作成
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="text-gray-500">
          （カテゴリは1個も作成されていません）
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-md border px-4 py-4"
            >
              <div className="text-lg font-medium">{c.name}</div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/categories/${c.id}`}
                  className="rounded-md bg-violet-500 px-4 py-2 text-white"
                >
                  編集
                </Link>
                <button
                  onClick={() => handleDelete(c)}
                  className="rounded-md bg-red-500 px-4 py-2 text-white"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Page;
