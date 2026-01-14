import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { Post } from "@/generated/prisma/client";

export const GET = async (req: NextRequest) => {
  try {
    const posts: Post[] = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿記事の一覧の取得に失敗しました" },
      { status: 500 },
    );
  }
};

type RequestBody = {
  title: string;
  content: string;
  coverImageURL: string;
  categoryIds: string[];
};

export const POST = async (req: NextRequest) => {
  try {
    const requestBody: RequestBody = await req.json();
    const { title, content, coverImageURL, categoryIds } = requestBody;

    // categoryIds の存在確認
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });
    if (categories.length !== categoryIds.length) {
      return NextResponse.json(
        { error: "指定されたカテゴリのいくつかが存在しません" },
        { status: 400 },
      );
    }

    // 投稿作成
    const post = await prisma.post.create({
      data: {
        title,
        content,
        coverImageURL,
      },
    });

    // 投稿-カテゴリ中間テーブル作成
    for (const categoryId of categoryIds) {
      await prisma.postCategory.create({
        data: { postId: post.id, categoryId },
      });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿記事の作成に失敗しました" },
      { status: 500 },
    );
  }
};
