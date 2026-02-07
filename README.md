# HipFocus - お尻特化AVアフィリエイトサイト

お尻・ヒップに特化したAV作品の比較・レビューサイトです。

## 技術スタック

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **ORM**: Prisma
- **Database**: PostgreSQL (Neon)
- **Auth**: NextAuth.js
- **Deploy**: Vercel

## ローカル開発セットアップ

### 1. 依存関係インストール

```bash
npm install
```

### 2. PostgreSQL起動

```bash
docker-compose up -d
```

### 3. 環境変数設定

`.env` ファイルを確認・編集してください。

### 4. データベースマイグレーション

```bash
npx prisma migrate dev
```

### 5. シードデータ投入

```bash
npx prisma db seed
```

### 6. 開発サーバー起動

```bash
npm run dev
```

- フロントエンド: http://localhost:3000
- 管理画面: http://localhost:3000/admin

### デフォルト管理者アカウント

- Email: `admin@example.com`
- Password: `admin123`

> ⚠️ 本番環境では必ず変更してください

## Vercel + Neon デプロイ

### 1. GitHubリポジトリ作成

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/hip-focus-affiliate.git
git push -u origin main
```

### 2. Neonデータベース作成

1. [neon.tech](https://neon.tech) でプロジェクト作成
2. 接続文字列を取得

### 3. Vercelプロジェクト作成

1. [vercel.com](https://vercel.com) でGitHubリポジトリをインポート
2. 環境変数を設定:
   - `DATABASE_URL`: Neonの接続文字列
   - `DIRECT_URL`: Neonのダイレクト接続文字列
   - `NEXTAUTH_SECRET`: `openssl rand -base64 32` で生成
   - `NEXTAUTH_URL`: 本番URL
   - `ADMIN_EMAIL`: 管理者メール
   - `ADMIN_PASSWORD_HASH`: bcryptハッシュ
   - `DMM_API_ID`: DMM API ID
   - `DMM_AFFILIATE_ID`: DMM アフィリエイトID
   - `CRON_SECRET`: Cronジョブ認証用シークレット

### 4. マイグレーション実行

```bash
DATABASE_URL="your-neon-url" npx prisma migrate deploy
```

### 5. Vercel Cron設定

`vercel.json` でCronジョブが定義されています:
- `/api/cron/sync-works`: 毎日3:00 UTC
- `/api/cron/calc-rankings`: 毎週月曜4:00 UTC

## ディレクトリ構成

```
├── prisma/           # Prismaスキーマ、シード
├── src/
│   ├── app/          # Next.js App Router
│   │   ├── admin/    # 管理画面
│   │   ├── api/      # APIルート
│   │   ├── legal/    # 法的ページ
│   │   ├── ranking/  # ランキングページ
│   │   ├── tags/     # タグページ
│   │   └── works/    # 作品詳細
│   ├── components/   # Reactコンポーネント
│   ├── lib/          # ユーティリティ
│   └── types/        # TypeScript型定義
└── public/           # 静的ファイル
```

## 注意事項

- 18歳未満の利用は禁止です
- 画像は公式アフィリエイト素材のみ使用してください
- 法的ページは必要に応じて法的レビューを受けてください
- DMM API利用規約を遵守してください

## ライセンス

Private
