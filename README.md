# クリニック管理システム

現代的な技術スタックで構築された包括的なクリニック管理システム。

## 技術スタック

### バックエンド
- **Ruby on Rails** - APIフレームワーク
- **Sidekiq** - バックグラウンドジョブ処理
- **MySQL** - プライマリデータベース
- **Redis** - キャッシュとジョブキュー

### フロントエンド
- **React** - UIフレームワーク
- **TypeScript** - 型安全性
- **Radix UI** - アクセシブルなUIコンポーネント
- **Tanstack Query** - データフェッチングとキャッシュ
- **React Hook Form** - フォーム管理
- **Zod** - スキーマバリデーション
- **Tailwind CSS** - スタイリング
- **Storybook** - コンポーネント開発

### インフラストラクチャ
- **Amazon Web Services**
  - ECS (Elastic Container Service)
  - Aurora MySQL
  - OpenSearch
  - ElastiCache
  - Lambda
- **Google Cloud**
  - Firebase
  - BigQuery
- **MongoDB Atlas**

### 監視・運用
- **Terraform** - Infrastructure as Code
- **SendGrid** - メールサービス
- **Datadog** - 監視とオブザーバビリティ
- **Sentry** - エラートラッキング
- **PagerDuty** - インシデント管理

### 開発ツール
- **Cursor** - AI搭載コードエディター
- **GitHub** - バージョン管理
- **GitHub Copilot** - AIペアプログラミング
- **Slack** - チームコミュニケーション
- **Docker** - コンテナ化
- **OrbStack** - Docker代替
- **MagicPod** - モバイルテスト
- **CircleCI** - 継続的インテグレーション
- **GitHub Actions** - CI/CD

## プロジェクト構造

```
clinics/
├── backend/                 # Ruby on Rails API
│   ├── app/
│   │   ├── api/           # APIコントローラー
│   │   ├── controllers/   # アプリケーションコントローラー
│   │   ├── models/        # データモデル
│   │   ├── serializers/   # JSONシリアライザー
│   │   ├── services/      # ビジネスロジック
│   │   └── workers/       # Sidekiqワーカー
│   ├── config/            # 設定ファイル
│   ├── db/                # データベースファイル
│   └── Gemfile            # Ruby依存関係
├── frontend/              # Reactアプリケーション
│   ├── src/
│   │   ├── components/    # Reactコンポーネント
│   │   ├── hooks/         # カスタムフック
│   │   ├── lib/           # ユーティリティ
│   │   ├── services/      # APIサービス
│   │   ├── types/         # TypeScript型定義
│   │   └── utils/         # ヘルパー関数
│   └── package.json       # Node依存関係
├── infrastructure/        # Terraform設定
├── monitoring/           # 監視設定
└── docs/                # ドキュメント
```

## はじめに

### 前提条件
- Ruby 3.2.0+
- Node.js 18+
- MySQL 8.0+
- Redis 6.0+

### バックエンドセットアップ
```bash
cd backend
bundle install
rails db:create
rails db:migrate
rails db:seed
rails server
```

### フロントエンドセットアップ
```bash
cd frontend
npm install
npm start
```

## 機能

- **クリニック管理** - 複数のクリニックを管理
- **医師管理** - 医師プロフィールと専門分野
- **患者管理** - 患者記録と履歴
- **予約スケジューリング** - 予約の予約と管理
- **診療記録** - デジタル診療記録
- **分析ダッシュボード** - インサイトとレポート
- **ユーザー認証** - セキュアなアクセス制御
- **リアルタイム更新** - ライブデータ同期

## APIドキュメント

バックエンドサーバーを実行しているときに、`/api-docs`でAPIドキュメントが利用可能です。

## 貢献

1. リポジトリをフォーク
2. フィーチャーブランチを作成
3. 変更を加える
4. テストを追加
5. プルリクエストを送信

## ライセンス

このプロジェクトはMITライセンスの下でライセンスされています。
"# clinics" 
