# Next.js App Router: Server/Client Component境界設計パターン

このドキュメントでは、Next.js App Routerにおける**Server ComponentとClient Componentの境界設計**について説明します。動的処理を専用のProviderコンポーネントに閉じ込めることで、アプリケーション全体の静的最適化を維持しながら、必要な部分だけを動的にする手法です。

## 核心概念：Provider パターン

### 問題

Next.jsのRoot Layoutなどで動的API（`cookies()`, `headers()`, `searchParams`など）を直接使用すると、**アプリケーション全体がdynamicレンダリングになってしまう**という問題があります。

```tsx
// ❌ 悪い例：Root Layoutが動的になり、すべてのページに影響
export default async function RootLayout({ children }) {
  const cookieStore = await cookies() // これでアプリ全体がdynamic
  const someValue = cookieStore.get('some-key')?.value

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

また、Client Componentで`useEffect`を使って動的データを取得すると、**レイアウトシフト**が発生します。

```tsx
// ❌ 悪い例：初回レンダリング後に状態が変わり、レイアウトシフトが発生
'use client'

export default function Component() {
  const [state, setState] = useState(defaultValue)

  useEffect(() => {
    const value = getCookie('some-key')
    setState(value) // 再レンダリングでレイアウトがずれる
  }, [])
}
```

### 解決方法：Provider パターンで境界を作る

**動的処理を専用のServer Component（Provider）に閉じ込め**、そこで取得したデータをClient Componentの初期値として渡します。

#### アーキテクチャ

```
Root Layout (Static)
  └─ Provider (Dynamic Server Component) ← ここだけがdynamic
      └─ Client Component (Static初期値を受け取る)
```

#### 実装パターン

**1. Provider（Server Component）を作成**

```tsx
// app/components/SomeProvider.tsx
import { cookies } from 'next/headers'
import ClientComponent from './ClientComponent'

export default async function SomeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // ここで動的データを取得
  const cookieStore = await cookies()
  const initialValue = cookieStore.get('some-key')?.value ?? 'default'

  // Client Componentにpropsとして渡す
  return (
    <ClientComponent initialValue={initialValue}>{children}</ClientComponent>
  )
}
```

**2. Client Component（受け取り側）**

```tsx
// app/components/ClientComponent.tsx
'use client'

import { useState } from 'react'

export default function ClientComponent({
  children,
  initialValue,
}: {
  children: React.ReactNode
  initialValue: string
}) {
  // サーバーから渡された値を初期値として使用
  const [value, setValue] = useState(initialValue)

  // useEffectは不要！レイアウトシフトなし

  return <div>{children}</div>
}
```

**3. Root Layoutで使用**

```tsx
// app/layout.tsx
import SomeProvider from './components/SomeProvider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SomeProvider>{children}</SomeProvider>
      </body>
    </html>
  )
}
```

### このパターンの利点

1. ✅ **影響範囲の最小化**: Providerだけがdynamicになり、Root Layoutや他のページは静的のまま
2. ✅ **レイアウトシフトの防止**: サーバーサイドで正しい初期値がレンダリングされる
3. ✅ **型安全**: TypeScriptでデータの流れを明確に型付け
4. ✅ **保守性**: 動的処理の場所が明確で、責任が分離されている

### 応用例

このパターンは様々な場面で応用できます：

#### Cookie以外の動的データ

```tsx
// ヘッダー情報を使う場合
import { headers } from 'next/headers'

export default async function ThemeProvider({ children }) {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent')
  const isMobile = /mobile/i.test(userAgent ?? '')

  return <ThemeClient isMobile={isMobile}>{children}</ThemeClient>
}
```

```tsx
// データベースクエリを使う場合
import { db } from '@/lib/db'

export default async function UserProvider({ children }) {
  const user = await db.user.findFirst()

  return <UserClient initialUser={user}>{children}</UserClient>
}
```

```tsx
// 検索パラメータを使う場合（Page限定）
export default async function SearchPage({ searchParams }) {
  const query = (await searchParams).q ?? ''

  return <SearchClient initialQuery={query} />
}
```

## 具体例：Cookieを使ったドロワー状態の永続化

上記のProviderパターンを使って、DaisyUIドロワーの開閉状態をCookieに永続化します。

### 1. DrawerProvider（Server Component）

```tsx
// app/components/DrawerProvider.tsx
import { cookies } from 'next/headers'
import DrawerLayout from './DrawerLayout'

export default async function DrawerProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const drawerOpen = cookieStore.get('drawer-open')?.value !== 'false'

  return <DrawerLayout defaultOpen={drawerOpen}>{children}</DrawerLayout>
}
```

### 2. DrawerLayout（Client Component）

```tsx
// app/components/DrawerLayout.tsx
'use client'

import { useState, useCallback } from 'react'
import Cookies from 'js-cookie'

export default function DrawerLayout({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev
      Cookies.set('drawer-open', String(newState), { expires: 365 })
      return newState
    })
  }, [])

  return (
    // ... JSX
  )
}
```

### 3. Root Layoutで使用

```tsx
// app/layout.tsx
import DrawerProvider from './components/DrawerProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <DrawerProvider>{children}</DrawerProvider>
      </body>
    </html>
  )
}
```

### 4. データフロー

```
1. ブラウザ → Cookie送信 → Next.jsサーバー
2. DrawerProvider（SC）→ cookies()でCookie読み込み
3. DrawerProvider → DrawerLayoutにdefaultOpenを渡す
4. DrawerLayout（CC）→ useState(defaultOpen)で初期化
5. ユーザー操作 → handleToggle → Cookies.set()で保存
6. 次回アクセス → 1に戻る
```

## 補足テクニック

### 1. useCallbackでのメモ化

#### 基本パターン

状態更新関数が安定した参照であることを利用して、ハンドラーをメモ化します。

```tsx
const handleToggle = useCallback(() => {
  setIsOpen((prev) => {
    const newState = !prev
    Cookies.set('drawer-open', String(newState), { expires: 365 })
    return newState
  })
}, []) // 依存配列は空
```

#### ポイント

1. **関数型更新を使用**: `setIsOpen((prev) => ...)` で現在の状態を取得
2. **依存配列は空**: `setIsOpen`は安定した参照なので、依存に含める必要なし
3. **副作用も含められる**: Cookie保存などの副作用も更新関数内で実行可能

#### メリット

- 関数が毎回再作成されず、パフォーマンスが向上
- 子コンポーネントに渡す場合、不要な再レンダリングを防止
- `isOpen`への依存がないため、クロージャの問題を回避

### 2. DaisyUIドロワーの最小化

DaisyUIのドロワーを完全に閉じるのではなく、最小化する実装です。

#### 基本的な考え方

`drawer-open`クラスを常に適用することで、「最小化モード」として動作させます。

#### 実装方法

```tsx
<div className="drawer drawer-open">
  <input
    id="my-drawer"
    type="checkbox"
    className="drawer-toggle"
    checked={isOpen}
    onChange={handleToggle}
  />
  <div className="drawer-content">{children}</div>
  <div className="drawer-side is-drawer-close:overflow-visible">
    <div className="is-drawer-close:w-14 is-drawer-open:w-64 bg-base-200 flex flex-col items-start min-h-full">
      {/* サイドバーコンテンツ */}
    </div>
  </div>
</div>
```

#### キーポイント

1. **`drawer drawer-open`を常に適用**: 最小化モードが有効になる
2. **`is-drawer-close:w-14`**: 閉じた時は幅14（アイコンのみ）
3. **`is-drawer-open:w-64`**: 開いた時は幅64（アイコン+テキスト）
4. **`is-drawer-close:overflow-visible`**: ツールチップが切れないように
5. **`is-drawer-close:hidden`**: テキストを閉じた時に非表示
6. **`is-drawer-close:tooltip`**: 閉じた時にツールチップを表示

#### アイテムの実装例

```tsx
<li>
  <button
    className="is-drawer-close:tooltip is-drawer-close:tooltip-right"
    data-tip="Homepage"
  >
    <svg>{/* アイコン */}</svg>
    <span className="is-drawer-close:hidden">Homepage</span>
  </button>
</li>
```

## まとめ

### コアパターン：SC/CC境界設計

**動的処理をProviderに閉じ込め、Server ComponentとClient Componentの境界を明確にする**ことで：

- ✅ アプリケーション全体の静的最適化を維持
- ✅ レイアウトシフトを防止
- ✅ パフォーマンスの最適化
- ✅ 保守性の向上

このパターンは、Cookie、ヘッダー、データベースクエリなど、あらゆる動的データ取得に応用できます。

### 重要な設計原則

1. **Root Layoutは可能な限り静的に保つ**
2. **動的処理は専用のProviderコンポーネントに分離**
3. **サーバーで取得したデータはpropsとしてクライアントに渡す**
4. **useEffectでのデータ取得は避ける（レイアウトシフトの原因）**

## 参考リンク

- [DaisyUI Drawer Documentation](https://daisyui.com/components/drawer/)
- [Next.js cookies() API](https://nextjs.org/docs/app/api-reference/functions/cookies)
- [React useCallback Hook](https://react.dev/reference/react/useCallback)
