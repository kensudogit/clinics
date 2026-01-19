# Railway 環境変数設定ガイド

このドキュメントでは、Railwayにデプロイする際に必要な環境変数の設定方法を説明します。

## 環境変数の設定場所

Railway Dashboardで環境変数を設定する方法：

1. プロジェクトを開く
2. サービス（アプリケーション）を選択
3. 「Variables」タブを開く
4. 「+ New Variable」をクリックして変数を追加

## 必須環境変数

### データベース設定

Railway MySQLサービスを使用する場合、以下の変数は自動的に設定されます：

```bash
# MySQLサービス接続情報（自動設定）
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USERNAME=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
```

**注意**: `${{MySQL.MYSQLHOST}}`の形式は、Railwayのサービス参照構文です。MySQLサービスを追加すると、これらの変数が自動的に利用可能になります。

### Redis設定（オプション）

Redisサービスを使用する場合：

```bash
REDIS_URL=${{Redis.REDIS_URL}}
```

### アプリケーション設定

```bash
# Rails環境
RAILS_ENV=production

# 静的ファイル配信
RAILS_SERVE_STATIC_FILES=true

# ログ出力
RAILS_LOG_TO_STDOUT=true

# スレッド数
RAILS_MAX_THREADS=5
```

### セキュリティ設定

**重要**: 以下の秘密鍵は本番環境用の強力なランダム文字列を使用してください。

```bash
# JWT認証用の秘密鍵（最低32文字推奨）
JWT_SECRET_KEY=your_secure_jwt_secret_key_minimum_32_characters_long

# Rails秘密鍵（最低64文字推奨）
SECRET_KEY_BASE=your_rails_secret_key_base_minimum_64_characters_long
```

#### 秘密鍵の生成方法

**方法1: Railsコマンドを使用**

```bash
rails secret
```

**方法2: OpenSSLを使用**

```bash
# JWT_SECRET_KEY用（32文字）
openssl rand -hex 32

# SECRET_KEY_BASE用（64文字）
openssl rand -hex 64
```

**方法3: Rubyワンライナー**

```bash
# JWT_SECRET_KEY用
ruby -e "require 'securerandom'; puts SecureRandom.hex(32)"

# SECRET_KEY_BASE用
ruby -e "require 'securerandom'; puts SecureRandom.hex(64)"
```

### ポート設定

Railwayは自動的に`PORT`環境変数を設定するため、通常は設定不要です。

```bash
# 通常は設定不要（Railwayが自動設定）
# PORT=${{PORT}}
```

## オプション環境変数

### SSL設定

```bash
# SSL強制（Railwayは自動的にHTTPSを提供）
FORCE_SSL=true
```

### ログレベル

```bash
# ログレベル（デフォルト: info）
LOG_LEVEL=info
# または
LOG_LEVEL=warn
LOG_LEVEL=error
```

### Sidekiq設定（バックグラウンドジョブを使用する場合）

```bash
SIDEKIQ_CONCURRENCY=5
```

### データベースSSL設定（Railway MySQLの場合）

Railway MySQLはSSL接続をサポートしています。`database.yml`でSSL設定が必要な場合：

```bash
# SSL CA証明書（通常は不要、Railwayが自動設定）
DB_SSL_CA=

# SSL証明書（通常は不要）
DB_SSL_CERT=

# SSL鍵（通常は不要）
DB_SSL_KEY=
```

## 環境変数の設定例

### 完全な設定例

```bash
# データベース（MySQLサービス参照）
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USERNAME=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}

# Redis（Redisサービス参照、オプション）
REDIS_URL=${{Redis.REDIS_URL}}

# アプリケーション
RAILS_ENV=production
RAILS_SERVE_STATIC_FILES=true
RAILS_LOG_TO_STDOUT=true
RAILS_MAX_THREADS=5

# セキュリティ（実際の値に置き換える）
JWT_SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
SECRET_KEY_BASE=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2

# オプション
FORCE_SSL=true
LOG_LEVEL=info
SIDEKIQ_CONCURRENCY=5
```

## Railwayサービス参照構文

Railwayでは、他のサービス（MySQL、Redisなど）の接続情報を`${{ServiceName.VARIABLE}}`の形式で参照できます。

### MySQLサービス参照

```bash
${{MySQL.MYSQLHOST}}      # ホスト名
${{MySQL.MYSQLPORT}}      # ポート番号
${{MySQL.MYSQLUSER}}      # ユーザー名
${{MySQL.MYSQLPASSWORD}}  # パスワード
${{MySQL.MYSQLDATABASE}}  # データベース名
```

### Redisサービス参照

```bash
${{Redis.REDIS_URL}}      # Redis接続URL
```

## 環境変数の確認方法

### Railway Dashboardから確認

1. サービスを選択
2. 「Variables」タブを開く
3. 設定された変数を確認

### Railway CLIから確認

```bash
railway variables
```

### アプリケーション内で確認

デバッグ目的で環境変数を確認する場合（本番環境では非推奨）：

```ruby
# api_server.rbに一時的に追加
get '/api/v1/debug/env' do
  content_type :json
  {
    db_host: ENV['DB_HOST'],
    db_port: ENV['DB_PORT'],
    rails_env: ENV['RAILS_ENV'],
    port: ENV['PORT']
  }.to_json
end
```

## セキュリティベストプラクティス

1. **秘密鍵の管理**
   - 強力なランダム文字列を使用
   - 定期的にローテーション
   - Gitにコミットしない

2. **環境変数の分離**
   - 開発環境と本番環境で異なる値を使用
   - Railway Variablesで管理

3. **アクセス制御**
   - Railwayアカウントのアクセス権限を適切に設定
   - チームメンバーの権限を最小限に

4. **ログの注意**
   - 環境変数（特にパスワード）をログに出力しない
   - エラーメッセージに機密情報を含めない

## トラブルシューティング

### 環境変数が読み込まれない

1. **変数名の確認**
   - 大文字小文字を確認
   - タイポがないか確認

2. **サービス参照の確認**
   - MySQL/Redisサービスが追加されているか確認
   - サービス名が正しいか確認

3. **再デプロイ**
   - 環境変数を変更した後は再デプロイが必要な場合があります

### データベース接続エラー

1. **接続情報の確認**
   - MySQLサービスの接続情報が正しいか確認
   - 環境変数が正しく設定されているか確認

2. **SSL設定の確認**
   - Railway MySQLはSSL接続を要求する場合があります
   - `database.yml`のSSL設定を確認

## 参考リンク

- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Railway Service References](https://docs.railway.app/develop/variables#service-references)

