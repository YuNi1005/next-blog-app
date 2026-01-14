"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import DOMPurify from "isomorphic-dompurify";

type Category = { id: string; name: string };
type Post = {
  id: string;
  title: string;
  content?: string;
  createdAt?: string;
  coverImage?: { url: string; width: number; height: number };
  coverImageURL?: string;
  categories?: Category[];
};

const Page: React.FC = () => {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  type SelectableCategory = { id: string; name: string; isSelect: boolean };

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImageURL, setCoverImageURL] = useState("");
  const [categories, setCategories] = useState<SelectableCategory[] | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [postRes, categoriesRes] = await Promise.all([
          fetch(`/api/admin/posts/${id}`, { method: "GET", cache: "no-store" }),
          fetch(`/api/categories`, { method: "GET", cache: "no-store" }),
        ]);

        if (!postRes.ok)
          throw new Error(`投稿取得に失敗しました (${postRes.status})`);
        if (!categoriesRes.ok)
          throw new Error(
            `カテゴリ取得に失敗しました (${categoriesRes.status})`,
          );

        const post = (await postRes.json()) as Post;
        const cats = await categoriesRes.json();

        setTitle(post.title || "");
        setContent(post.content || "");
        setCoverImageURL(post.coverImage?.url || post.coverImageURL || "");

        setCategories(
          (cats as { id: string; name: string }[]).map((c) => ({
            id: c.id,
            name: c.name,
            isSelect: (post.categories || []).some(
              (pc: Category) => pc.id === c.id,
            ),
          })),
        );
      } catch (e) {
        setFetchError(e instanceof Error ? e.message : "予期せぬエラー");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id]);

  const switchCategoryState = (categoryId: string) => {
    if (!categories) return;
    setCategories(
      categories.map((c) =>
        c.id === categoryId ? { ...c, isSelect: !c.isSelect } : c,
      ),
    );
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const body = {
        title,
        content,
        coverImageURL,
        categoryIds: categories
          ? categories.filter((c) => c.isSelect).map((c) => c.id)
          : [],
      };
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`更新に失敗しました (${res.status})`);
      // 更新後は管理一覧へ戻る
      router.push("/admin/posts");
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`「${title}」を削除しますか？`)) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`削除に失敗しました (${res.status})`);
      router.push("/admin/posts");
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "削除に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (fetchError) return <div className="text-red-500">{fetchError}</div>;
  if (isLoading || categories === null)
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );

  return (
    <main>
      <div className="mb-6 text-3xl font-bold">投稿記事の編集・削除</div>

      <form onSubmit={handleUpdate} className="space-y-6">
        <div>
          <label className="mb-1 block font-bold">タイトル</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-bold">本文</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="h-56 w-full rounded-md border px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-bold">カバーイメージ (URL)</label>
          <input
            value={coverImageURL}
            onChange={(e) => setCoverImageURL(e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            type="url"
          />
        </div>

        <div>
          <div className="mb-2 font-bold">タグ</div>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {categories.map((c) => (
              <label key={c.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={c.isSelect}
                  onChange={() => switchCategoryState(c.id)}
                  className="mt-0.5"
                />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="submit"
            className="rounded-md bg-violet-600 px-4 py-2 text-white"
            disabled={isSubmitting}
          >
            記事を更新
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-md bg-red-500 px-4 py-2 text-white"
            disabled={isSubmitting}
          >
            削除
          </button>
        </div>
      </form>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex items-center rounded-lg bg-white px-8 py-4 shadow-lg">
            <FontAwesomeIcon
              icon={faSpinner}
              className="mr-2 animate-spin text-gray-500"
            />
            <div className="flex items-center text-gray-500">処理中...</div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Page;
