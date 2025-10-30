# Claude Code Project Context

このファイルは、Claude Codeがこのプロジェクトを理解するためのコンテキスト情報を提供します。

## プロジェクト概要

Next.js 15（App Router）を使用したWebアプリケーション開発プロジェクト。

## 技術スタック

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**:
  - DaisyUI (Tailwind CSS component library)
  - Tailwind CSS
- **State Management**: React hooks (useState, useCallback)
- **Cookie Management**: js-cookie

## プロジェクト構造

```
web-next-15/
├── src/
│   └── app/
│       ├── components/         # Reactコンポーネント
│       │   ├── DrawerProvider.tsx  # Server Component (動的処理)
│       │   └── DrawerLayout.tsx    # Client Component
│       ├── layout.tsx          # Root Layout (静的)
│       ├── page.tsx
│       └── globals.css
├── docs/                       # プロジェクトドキュメント
│   └── nextjs-sc-cc-boundary-pattern.md
└── CLAUDE.md                   # このファイル
```

## アーキテクチャ設計原則

### 1. Server/Client Component境界設計

**重要**: このプロジェクトでは、動的処理を専用のProviderコンポーネントに閉じ込め、アプリケーション全体の静的最適化を維持します。

```
Root Layout (Static)
  └─ Provider (Dynamic Server Component) ← ここだけがdynamic
      └─ Client Component (propsで初期値を受け取る)
```

#### ルール

1. **Root Layoutは静的に保つ**: `cookies()`, `headers()`などの動的APIを直接使用しない
2. **Providerパターンを使用**: 動的処理は専用のServer Componentに分離
3. **propsでデータを渡す**: サーバーで取得したデータはpropsとしてクライアントに渡す
4. **useEffectでのデータ取得を避ける**: レイアウトシフトの原因になるため

詳細: `docs/nextjs-sc-cc-boundary-pattern.md`

### 2. DaisyUI使用方針

- **最小化ドロワー**: `drawer-open`クラスを常に適用し、`is-drawer-close:`と`is-drawer-open:`ユーティリティで最小化モードを実装
- **ツールチップ**: 最小化時はアイコンのみ表示し、ホバーでツールチップを表示

### 3. パフォーマンス最適化

- **useCallback**: イベントハンドラーは`useCallback`でメモ化
- **関数型更新**: `setState((prev) => ...)`パターンを使用して依存を最小化

## コーディング規約

### TypeScript

- 厳格な型定義を使用
- propsの型は明示的に定義

### React

- Client Componentには`'use client'`ディレクティブを明示
- Server Componentには何も付けない（デフォルト）
- 関数型更新を優先

### スタイリング

- Tailwind CSSのユーティリティクラスを使用
- DaisyUIのコンポーネントクラスを活用
- カスタムCSSは最小限に

## 重要なファイル

### `app/components/DrawerProvider.tsx`

Server Componentとして、Cookieから初期状態を読み込みます。
このコンポーネントだけがdynamicレンダリングになります。

### `app/components/DrawerLayout.tsx`

Client Componentとして、ドロワーのUI/UXを管理します。
サーバーから渡された`defaultOpen`を初期値として使用します。

### `app/layout.tsx`

Root Layoutは静的に保たれています。
動的処理は`DrawerProvider`に委譲しています。

## 開発時の注意事項

1. **動的APIの使用**: Root Layoutで`cookies()`や`headers()`を使わない
2. **レイアウトシフト**: `useEffect`での状態初期化を避ける
3. **型安全性**: 必ず型を明示的に定義する
4. **パフォーマンス**: イベントハンドラーは`useCallback`でメモ化

## ドキュメント

プロジェクト固有の設計パターンやテクニックについては、`docs/`ディレクトリを参照してください。

- `docs/nextjs-sc-cc-boundary-pattern.md`: Server/Client Component境界設計の詳細ガイド

## 今後の拡張

新しい動的機能を追加する際は、以下のパターンに従ってください：

1. 専用のProviderを作成（Server Component）
2. 対応するClient Componentを作成
3. Providerでデータを取得し、propsで渡す
4. Root Layoutは静的のまま維持

これにより、アプリケーション全体のパフォーマンスを維持しながら、必要な部分だけを動的にできます。
