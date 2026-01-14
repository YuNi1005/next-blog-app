"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Filter from "@/app/_components/Filter";
import Pagination from "@/app/_components/Pagination";

type Category = { id: string; name: string };
type Post = {
  id: string;
  createdAt?: string;
  title: string;
  content?: string;
  categories?: Category[];
};

export default function Page() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/posts`);
      if (!res.ok) throw new Error("fetch failed");
      const data: Post[] = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setFilteredPosts(posts);
  }, [posts]);

  async function handleDelete(postId: string, title: string) {
    if (!confirm(`「${title}」を削除しますか？`)) return;
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("delete failed");
      await load();
    } catch (err) {
      console.error(err);
      alert("削除に失敗しました");
    }
  }

  function formatDate(iso?: string) {
    if (!iso) return "";
    return new Date(iso).toISOString().slice(0, 10);
  }

  return (
    <main style={{ padding: "32px 48px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: 32, margin: 0 }}>投稿記事の管理</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <Link
            href="/admin/posts/new"
            className="rounded-md bg-blue-500 px-4 py-2 text-white"
          >
            新規作成
          </Link>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        {loading ? (
          <div>読み込み中...</div>
        ) : posts.length === 0 ? (
          <div>投稿はありません</div>
        ) : (
          <>
            <Filter
              items={posts}
              keys={["title"] as (keyof Post)[]}
              onFiltered={setFilteredPosts}
              placeholder="タイトルを検索"
            />

            <Pagination
              items={filteredPosts}
              pageSize={10}
              render={(pageItems) => (
                <>
                  {pageItems.map((p) => (
                    <article
                      key={p.id}
                      style={{
                        border: "1px solid #d7dbe0",
                        borderRadius: 4,
                        padding: 20,
                        marginBottom: 20,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ maxWidth: "75%" }}>
                        <div style={{ color: "#666", marginBottom: 8 }}>
                          {formatDate(p.createdAt)}
                        </div>
                        <h2 style={{ margin: "4px 0 8px 0" }}>{p.title}</h2>
                        <div
                          style={{ color: "#333", lineHeight: 1.8 }}
                          dangerouslySetInnerHTML={{ __html: p.content || "" }}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            marginBottom: 8,
                            flexWrap: "wrap",
                            justifyContent: "flex-end",
                          }}
                        >
                          {p.categories?.map((c) => (
                            <span
                              key={c.id}
                              style={{
                                border: "1px solid #d1d5db",
                                padding: "6px 10px",
                                borderRadius: 9999,
                                background: "#fff",
                                color: "#374151",
                                fontSize: 13,
                              }}
                            >
                              {c.name}
                            </span>
                          ))}
                        </div>

                        <div style={{ display: "flex", gap: 12 }}>
                          <a
                            href={`/admin/posts/${p.id}`}
                            style={{
                              background: "#6c63ff",
                              color: "#fff",
                              padding: "8px 18px",
                              borderRadius: 8,
                              textDecoration: "none",
                            }}
                          >
                            編集
                          </a>
                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            style={{
                              background: "#ff4d4f",
                              color: "#fff",
                              border: "none",
                              padding: "8px 18px",
                              borderRadius: 8,
                              cursor: "pointer",
                            }}
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </>
              )}
            />
          </>
        )}
      </div>
    </main>
  );
}
