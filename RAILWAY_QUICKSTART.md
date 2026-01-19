# Railway クイックスタートガイド

このガイドでは、クリニック管理システムをRailwayに最短でデプロイする手順を説明します。

## 前提条件

1. Railwayアカウント（https://railway.app/ で作成）
2. GitHubリポジトリにコードがプッシュされていること

## デプロイ手順（5分で完了）

### ステップ1: Railwayプロジェクトの作成

1. [Railway Dashboard](https://railway.app/dashboard)にログイン
2. 「New Project」をクリック
3. 「Deploy from GitHub repo」を選択
4. リポジトリ `devlop/clinics` を選択

### ステップ2: MySQLデータベースの追加

1. プロジェクト内で「+ New」をクリック
2. 「Database」→「MySQL」を選択
3. MySQLサービスが自動的に作成されます

### ステップ3: 環境変数の設定

メインサービス（アプリケーション）の「Variables」タブで以下を設定：

```bash
# データベース設定（MySQLサービス参照）
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USERNAME=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}

# アプリケーション設定
RAILS_ENV=production
RAILS_SERVE_STATIC_FILES=true
RAILS_LOG_TO_STDOUT=true
RAILS_MAX_THREADS=5

# セキュリティ設定（以下のコマンドで生成）
# JWT_SECRET_KEY: rails secret または openssl rand -hex 32
# SECRET_KEY_BASE: rails secret または openssl rand -hex 64
JWT_SECRET_KEY=your_jwt_secret_key_here_min_32_chars
SECRET_KEY_BASE=your_secret_key_base_here_min_64_chars
```

**秘密鍵の生成方法**:
```bash
# Windows (PowerShell)
[System.Web.Security.Membership]::GeneratePassword(64, 0)

# または Ruby
ruby -e "require 'securerandom'; puts SecureRandom.hex(32)"
ruby -e "require 'securerandom'; puts SecureRandom.hex(64)"
```

### ステップ4: ドメインの生成

1. メインサービスの「Settings」タブを開く
2. 「Generate Domain」をクリック
3. 生成されたドメインをコピー（例: `clinics-production.up.railway.app`）

### ステップ5: データベースマイグレーション

デプロイ完了後、Railway Dashboardの「Deployments」タブから：

1. 最新のデプロイメントを選択
2. 「Shell」を開く
3. 以下のコマンドを実行：

```bash
bundle exec rails db:create
bundle exec rails db:migrate
bundle exec rails db:seed
```

### ステップ6: 動作確認

1. 生成されたドメインにアクセス（例: `https://clinics-production.up.railway.app`）
2. ヘルスチェックエンドポイントを確認: `https://your-domain.railway.app/api/v1/health`
3. フロントエンドが表示されることを確認

## トラブルシューティング

### デプロイが失敗する場合

1. **ログを確認**: Railway Dashboardの「Deployments」タブでログを確認
2. **環境変数の確認**: すべての必須環境変数が設定されているか確認
3. **データベース接続**: MySQLサービスが起動しているか確認

### アプリケーションが起動しない場合

1. **ポート設定**: `api_server.rb`が`PORT`環境変数を使用しているか確認
2. **依存関係**: `bundle install`が成功しているか確認
3. **ログ確認**: `railway logs`でエラーメッセージを確認

### データベース接続エラー

1. **環境変数の確認**: MySQLサービスの接続情報が正しく設定されているか確認
2. **SSL設定**: Railway MySQLでは通常SSL設定は不要です

## 次のステップ

- [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) - 詳細なデプロイガイド
- [RAILWAY_ENV_VARS.md](./RAILWAY_ENV_VARS.md) - 環境変数の詳細設定
- [README.md](./README.md) - プロジェクトの詳細情報

## 参考リンク

- [Railway Documentation](https://docs.railway.app/)
- [Railway Pricing](https://railway.app/pricing)
- [Railway Discord](https://discord.gg/railway)
