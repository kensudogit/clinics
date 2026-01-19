# Railway デプロイガイド

このドキュメントでは、クリニック管理システムをRailwayに完全公開モードでデプロイする手順を説明します。

## 前提条件

1. Railwayアカウント（https://railway.app/ で作成）
2. Railway CLIのインストール（オプション、Web UIでも可能）
3. GitHubリポジトリへのプッシュ（推奨）

## デプロイ手順

### 方法1: Railway Web UIを使用（推奨）

#### ステップ1: プロジェクトの作成

1. [Railway Dashboard](https://railway.app/dashboard)にログイン
2. 「New Project」をクリック
3. 「Deploy from GitHub repo」を選択（GitHubリポジトリに接続済みの場合）
   - または「Empty Project」を選択して後でGitHubリポジトリを接続

#### ステップ2: サービスの追加

1. プロジェクト内で「+ New」をクリック
2. 「GitHub Repo」を選択してリポジトリを選択
   - または「Empty Service」を選択してDockerfileからデプロイ

#### ステップ3: データベースサービスの追加

1. 「+ New」をクリック
2. 「Database」→「MySQL」を選択
3. MySQLサービスが作成されます

#### ステップ4: Redisサービスの追加（オプション）

1. 「+ New」をクリック
2. 「Database」→「Redis」を選択
3. Redisサービスが作成されます

#### ステップ5: 環境変数の設定

メインサービス（アプリケーション）の「Variables」タブで以下の環境変数を設定：

**必須環境変数：**

```bash
# データベース設定（MySQLサービスの接続情報を使用）
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USERNAME=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}

# Redis設定（Redisサービスを使用する場合）
REDIS_URL=${{Redis.REDIS_URL}}

# アプリケーション設定
RAILS_ENV=production
RAILS_SERVE_STATIC_FILES=true
RAILS_LOG_TO_STDOUT=true
RAILS_MAX_THREADS=5

# セキュリティ設定（本番環境用の強力な秘密鍵を設定）
JWT_SECRET_KEY=your_secure_jwt_secret_key_here_min_32_chars
SECRET_KEY_BASE=your_rails_secret_key_base_here_min_32_chars

# ポート設定（Railwayが自動設定、通常は設定不要）
# PORT=${{PORT}}
```

**環境変数の生成方法：**

```bash
# JWT_SECRET_KEYを生成
rails secret
# または
openssl rand -hex 32

# SECRET_KEY_BASEを生成
rails secret
# または
openssl rand -hex 64
```

#### ステップ6: ドメインの設定（完全公開モード）

1. メインサービスの「Settings」タブを開く
2. 「Generate Domain」をクリックして自動ドメインを生成
   - または「Custom Domain」で独自ドメインを設定
3. 「Public」を有効にして完全公開モードに設定

#### ステップ7: デプロイの確認

1. 「Deployments」タブでデプロイ状況を確認
2. ログを確認してエラーがないかチェック
3. 生成されたドメインにアクセスして動作確認

### 方法2: Railway CLIを使用

#### ステップ1: CLIのインストール

```bash
# npmを使用
npm i -g @railway/cli

# またはHomebrew（macOS）
brew install railway

# またはScoop（Windows）
scoop bucket add railway https://github.com/railwayapp/homebrew-tap
scoop install railway
```

#### ステップ2: ログイン

```bash
railway login
```

#### ステップ3: プロジェクトの初期化

```bash
cd C:\devlop\clinics
railway init
```

#### ステップ4: 環境変数の設定

```bash
# データベース変数（MySQLサービス接続後）
railway variables set DB_HOST=${{MySQL.MYSQLHOST}}
railway variables set DB_PORT=${{MySQL.MYSQLPORT}}
railway variables set DB_USERNAME=${{MySQL.MYSQLUSER}}
railway variables set DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
railway variables set DB_NAME=${{MySQL.MYSQLDATABASE}}

# アプリケーション変数
railway variables set RAILS_ENV=production
railway variables set RAILS_SERVE_STATIC_FILES=true
railway variables set RAILS_LOG_TO_STDOUT=true
railway variables set JWT_SECRET_KEY=your_secure_jwt_secret_key
railway variables set SECRET_KEY_BASE=your_rails_secret_key_base
```

#### ステップ5: デプロイ

```bash
railway up
```

#### ステップ6: ドメインの生成

```bash
railway domain
```

## データベースマイグレーション

デプロイ後、データベースマイグレーションを実行：

### Web UIから実行

1. サービスの「Deployments」タブを開く
2. 最新のデプロイメントを選択
3. 「Shell」を開く
4. 以下のコマンドを実行：

```bash
bundle exec rails db:create
bundle exec rails db:migrate
bundle exec rails db:seed
```

### CLIから実行

```bash
railway run bundle exec rails db:create
railway run bundle exec rails db:migrate
railway run bundle exec rails db:seed
```

## フロントエンドのビルド

フロントエンドはDockerfile内でビルドされますが、事前にビルドする場合：

```bash
cd frontend
npm install
npm run build
```

ビルドされたファイルは`frontend/build`に出力され、Dockerfileで`backend/public`にコピーされます。

## ヘルスチェック

デプロイ後、以下のエンドポイントでヘルスチェックが可能：

```
https://your-domain.railway.app/api/v1/health
```

正常な応答例：

```json
{
  "status": "healthy",
  "timestamp": "2024-12-05T12:00:00Z"
}
```

## トラブルシューティング

### デプロイが失敗する場合

1. **ログを確認**
   - Railway Dashboardの「Deployments」タブでログを確認
   - エラーメッセージを確認

2. **環境変数の確認**
   - すべての必須環境変数が設定されているか確認
   - データベース接続情報が正しいか確認

3. **ポート設定の確認**
   - `api_server.rb`が`PORT`環境変数を使用しているか確認
   - Railwayは自動的に`PORT`環境変数を設定

4. **データベース接続の確認**
   - MySQLサービスが起動しているか確認
   - 接続情報が正しいか確認

### アプリケーションが起動しない場合

1. **ログを確認**
   ```bash
   railway logs
   ```

2. **シェルで直接確認**
   ```bash
   railway shell
   ruby api_server.rb
   ```

3. **依存関係の確認**
   - Gemfileの依存関係が正しくインストールされているか確認
   - `bundle install`が成功しているか確認

### データベース接続エラー

1. **SSL設定の確認**
   - Railway MySQLはSSL接続を要求する場合があります
   - `database.yml`のSSL設定を確認

2. **接続情報の確認**
   - Railway MySQLサービスの接続情報を使用しているか確認
   - 環境変数が正しく設定されているか確認

## セキュリティ設定

### 完全公開モードの設定

1. **CORS設定**
   - `api_server.rb`でCORSが設定されています
   - 本番環境では特定のドメインのみ許可することを推奨

2. **環境変数の保護**
   - 秘密鍵は強力なランダム文字列を使用
   - 環境変数はRailwayのVariablesで管理（Gitにコミットしない）

3. **HTTPSの強制**
   - Railwayは自動的にHTTPSを提供
   - `FORCE_SSL`環境変数でSSLを強制可能

## モニタリング

Railway Dashboardで以下を監視：

- **Metrics**: CPU、メモリ使用率
- **Logs**: アプリケーションログ
- **Deployments**: デプロイ履歴
- **Usage**: リソース使用量

## コスト管理

Railwayの無料プランでは：
- 月額$5のクレジット
- 512MB RAM
- 1GBストレージ

本番環境では適切なプランを選択してください。

## 参考リンク

- [Railway Documentation](https://docs.railway.app/)
- [Railway Pricing](https://railway.app/pricing)
- [Railway Discord](https://discord.gg/railway)

