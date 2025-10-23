import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { QueryClient } from "@tanstack/react-query";
import { z } from "zod";

export const PostSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  author: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  posts: z.array(PostSchema),
});

export type Post = z.infer<typeof PostSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;

const API_BASE_URL = 'http://localhost:3000/api';
const queryClient = new QueryClient()

export const postsCollection = createCollection(
  queryCollectionOptions({
    queryKey: ['posts'],
    queryFn: async (): Promise<Post[]> => {
      const res = await fetch(`${API_BASE_URL}/posts`)
      if (!res.ok) throw new Error('Failed to fetch posts')
      const data: ApiResponse = await res.json()
      return data.posts
    },
    queryClient,
    getKey: (item) => item.id,
    schema: PostSchema,
    
    // 投稿作成ハンドラ
    onInsert: async ({ transaction }) => {
      const newPost = transaction.mutations[0].modified
      const res = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPost.title,
          content: newPost.content,
          author: newPost.author
        })
      })
      if (!res.ok) throw new Error('Failed to create post')
      return await res.json()
    },
    
    // 投稿更新ハンドラ
    onUpdate: async ({ transaction }) => {
      const { original, modified } = transaction.mutations[0]
      const res = await fetch(`${API_BASE_URL}/posts/${original.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: modified.title,
          content: modified.content,
          author: modified.author
        })
      })
      if (!res.ok) throw new Error('Failed to update post')
      return await res.json()
    },
    
    // 投稿削除ハンドラ
    onDelete: async ({ transaction }) => {
      const deleted = transaction.mutations[0].original
      const res = await fetch(`${API_BASE_URL}/posts/${deleted.id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete post')
    }
  })
)