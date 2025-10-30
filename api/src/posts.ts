import { Hono } from "hono";
import { neon } from "@neondatabase/serverless";
import process from "node:process";
import console from "node:console";

// 環境変数チェック
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

export const postsRouter = new Hono();

// 全投稿取得
postsRouter.get("/", async (c) => {
  try {
    const posts = await sql`
      SELECT id, title, content, author, created_at, updated_at
      FROM posts 
      ORDER BY created_at DESC
    `;
    return c.json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch posts",
      },
      500
    );
  }
});

// 投稿詳細取得
postsRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const post = await sql`
      SELECT id, title, content, author, created_at, updated_at
      FROM posts 
      WHERE id = ${id}
    `;

    if (post.length === 0) {
      return c.json(
        {
          success: false,
          error: "Post not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      post: post[0],
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return c.json(
      {
        success: false,
        error: "Failed to fetch post",
      },
      500
    );
  }
});

// 投稿作成
postsRouter.post("/", async (c) => {
  try {
    const { title, content, author } = await c.req.json();

    // バリデーション
    if (!title || !content) {
      return c.json(
        {
          success: false,
          error: "Title and content are required",
        },
        400
      );
    }

    const newPost = await sql`
      INSERT INTO posts (title, content, author) 
      VALUES (${title}, ${content}, ${author || "Anonymous"}) 
      RETURNING id, title, content, author, created_at, updated_at
    `;

    return c.json(
      {
        success: true,
        message: "Post created successfully",
        post: newPost[0],
      },
      201
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return c.json(
      {
        success: false,
        error: "Failed to create post",
      },
      500
    );
  }
});

// 投稿更新
postsRouter.put("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const { title, content, author } = await c.req.json();

    const updated = await sql`
      UPDATE posts 
      SET 
        title = COALESCE(${title}, title),
        content = COALESCE(${content}, content),
        author = COALESCE(${author}, author),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, title, content, author, created_at, updated_at
    `;

    if (updated.length === 0) {
      return c.json(
        {
          success: false,
          error: "Post not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      message: "Post updated successfully",
      post: updated[0],
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return c.json(
      {
        success: false,
        error: "Failed to update post",
      },
      500
    );
  }
});

// 投稿削除
postsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const deleted = await sql`
      DELETE FROM posts 
      WHERE id = ${id}
      RETURNING id
    `;

    if (deleted.length === 0) {
      return c.json(
        {
          success: false,
          error: "Post not found",
        },
        404
      );
    }

    return c.json({
      success: true,
      message: "Post deleted successfully",
      deletedId: deleted[0].id,
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return c.json(
      {
        success: false,
        error: "Failed to delete post",
      },
      500
    );
  }
});
