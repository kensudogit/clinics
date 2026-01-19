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
- Ruby 3.2.0+ (推奨: RubyInstaller for Windows)
- MSYS2 (ネイティブ拡張を含むgemのビルドに必要)
- Node.js 18+
- MySQL 8.0+
- Redis 6.0+

**MSYS2のインストール**:
```bash
# RubyInstallerに付属するridkコマンドを使用
ridk install
# プロンプトで [1,3] を選択してENTERを押す
```

### バックエンドセットアップ

#### Windows環境

**方法1: セットアップスクリプトを使用（推奨）**
```bash
cd backend
setup.bat
```

**方法2: 手動セットアップ**
```bash
cd backend
bundle install
bundle exec rails db:create
bundle exec rails db:migrate
bundle exec rails db:seed
bundle exec rails server -p 3001
```

**方法3: Railsコマンドラッパーを使用**
```bash
cd backend
rails_commands.bat db:create
rails_commands.bat db:migrate
rails_commands.bat db:seed
rails_commands.bat server
```

#### Linux/Mac環境
```bash
cd backend
bundle install
bundle exec rails db:create
bundle exec rails db:migrate
bundle exec rails db:seed
bundle exec rails server
```

**注意**: Windows環境では、`rails`コマンドの代わりに`bundle exec rails`または`rails_commands.bat`を使用してください。

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
