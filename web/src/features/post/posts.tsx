import { usePosts } from "./usePosts.ts";


export function Posts() {
  const {posts } = usePosts()


  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id} className="mb-8 p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl">
          <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
          <p className="text-gray-300 mb-4">{post.content}</p>
          <div className="text-sm text-gray-400">
            <span>By {post.author}</span> |{' '}
            <span>Created at: {new Date(post.created_at).toLocaleString()}</span> |{' '}
            <span>Updated at: {new Date(post.updated_at).toLocaleString()}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}