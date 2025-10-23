import { useLiveQuery } from "@tanstack/react-db";
import { postsCollection } from "../../db-collections/post.ts";


export function usePosts() {
  const { data: posts, ...rest } = useLiveQuery((q) => {
    return q.from({ post: postsCollection }).select(({ post }) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      author: post.author,
      created_at: post.created_at,
      updated_at: post.updated_at,
    }))
  })

  return { posts, ...rest }
}