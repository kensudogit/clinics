# Railway クイックスタートガイド

このガイドでは、Railwayに5分でデプロイする手順を説明します。

## 前提条件

- GitHubアカウント
- Railwayアカウント（https://railway.app/ で無料登録）

## デプロイ手順（5分）

### ステップ1: GitHubにプッシュ（既に完了している場合はスキップ）

```bash
cd C:\devlop\clinics
git add .
git commit -m "Railwayデプロイ準備"
git push origin main
```

### ステップ2: Railwayでプロジェクトを作成

1. [Railway Dashboard](https://railway.app/dashboard)にログイン
2. 「New Project」をクリック
3. 「Deploy from GitHub repo」を選択
4. `kensudogit/clinics`リポジトリを選択

### ステップ3: MySQLデータベースを追加

1. プロジェクト内で「+ New」をクリック
2. 「Database」→「MySQL」を選択
3. MySQLサービスが作成されます

### ステップ4: 環境変数を設定

メインサービス（アプリケーション）の「Variables」タブで以下を設定：

**必須変数（コピー&ペースト）:**

```bash
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USERNAME=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
RAILS_ENV=production
RAILS_SERVE_STATIC_FILES=true
RAILS_LOG_TO_STDOUT=true
RAILS_MAX_THREADS=5
```

**秘密鍵の生成と設定:**

ターミナルで以下を実行して秘密鍵を生成：

```bash
# JWT_SECRET_KEYを生成
ruby -e "require 'securerandom'; puts SecureRandom.hex(32)"

# SECRET_KEY_BASEを生成
ruby -e "require 'securerandom'; puts SecureRandom.hex(64)"
```

生成された値をRailwayの環境変数に追加：

```bash
JWT_SECRET_KEY=<生成された32文字の値>
SECRET_KEY_BASE=<生成された64文字の値>
```

### ステップ5: ドメインを生成（完全公開モード）

1. メインサービスの「Settings」タブを開く
2. 「Generate Domain」をクリック
3. 生成されたドメインをコピー（例: `clinics-production.up.railway.app`）

### ステップ6: デプロイの確認

1. 「Deployments」タブでデプロイ状況を確認
2. 緑色のチェックマークが表示されたら完了
3. 生成されたドメインにアクセスして動作確認

### ステップ7: データベースマイグレーション（初回のみ）

1. サービスの「Deployments」タブを開く
2. 最新のデプロイメントを選択
3. 「Shell」を開く
4. 以下のコマンドを実行：

```bash
bundle exec rails db:create
bundle exec rails db:migrate
bundle exec rails db:seed
```

## 動作確認

### ヘルスチェック

ブラウザで以下にアクセス：

```
https://your-domain.railway.app/api/v1/health
```

正常な応答：

```json
{
  "status": "healthy",
  "timestamp": "2024-12-05T12:00:00Z"
}
```

### APIエンドポイントの確認

```
https://your-domain.railway.app/api/v1/clinics
https://your-domain.railway.app/api/v1/doctors
https://your-domain.railway.app/api/v1/patients
```

## トラブルシューティング

### デプロイが失敗する

1. **ログを確認**
   - 「Deployments」タブでログを確認
   - エラーメッセージを確認

2. **環境変数の確認**
   - すべての必須変数が設定されているか確認
   - 変数名にタイポがないか確認

3. **フロントエンドのビルド**
   - フロントエンドがビルドされているか確認
   - `frontend/build`ディレクトリが存在するか確認

### アプリケーションが起動しない

1. **ポート設定の確認**
   - `api_server.rb`が`PORT`環境変数を使用しているか確認
   - Railwayは自動的に`PORT`を設定

2. **データベース接続の確認**
   - MySQLサービスが起動しているか確認
   - 環境変数の接続情報が正しいか確認

### データベース接続エラー

1. **MySQLサービスの確認**
   - MySQLサービスが追加されているか確認
   - サービスが起動しているか確認

2. **環境変数の確認**
   - `${{MySQL.MYSQLHOST}}`などの参照が正しいか確認
   - サービス名が`MySQL`になっているか確認

## 次のステップ

- [詳細なデプロイガイド](RAILWAY_DEPLOY.md)を参照
- [環境変数の詳細設定](RAILWAY_ENV_VARS.md)を参照
- カスタムドメインの設定
- モニタリングとログの確認

## サポート

問題が発生した場合：

1. Railway Dashboardのログを確認
2. [Railway Documentation](https://docs.railway.app/)を参照
3. [Railway Discord](https://discord.gg/railway)でサポートを求める

