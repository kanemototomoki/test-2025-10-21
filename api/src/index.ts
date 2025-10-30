import { Hono } from "hono";
import { cors } from "hono/cors";
import { postsRouter } from "./posts";

const app = new Hono().basePath("/api");

app.use("*", cors());

// テスト用エンドポイント - 現在のタイムスタンプを返す
app.get("/now", (c) => {
  const now = new Date();
  return c.json({
    timestamp: now.toISOString(),
    unix: Math.floor(now.getTime() / 1000),
    milliseconds: now.getTime(),
  });
});

// postsルーターをマウント
app.route("/posts", postsRouter);

// Cloudflare Workers用のexport
export default {
  fetch: app.fetch,
};

// Node.jsサーバーとして実行する場合のコード（オプション）
// import { serve } from '@hono/node-server'
//
// const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
// console.log(`🚀 Server is starting on http://localhost:${port}`)
//
// serve({
//   fetch: app.fetch,
//   port
// })
