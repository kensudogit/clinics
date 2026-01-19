# Railway "Not Found" エラー対応ガイド

## 問題
`https://clinics-production-8e9c.up.railway.app/` にアクセスすると「Not Found」エラーが表示される

## 確認手順

### 1. Railwayのログを確認

Railway Dashboard → 「Deployments」タブ → 最新のデプロイメント → 「Logs」を開く

以下のログを確認：
```
==================================================
Public folder path: /app/public
Public folder exists: true/false
Public folder contents: ...
Index.html path: /app/public/index.html
Index.html exists: true/false
==================================================
```

### 2. 考えられる原因と解決方法

#### 原因1: `public`ディレクトリに`index.html`が存在しない

**確認方法:**
- ログで `Index.html exists: false` と表示される
- ログで `Public folder contents:` が空または`index.html`が含まれていない

**解決方法:**
1. Railway Dashboardの「Deployments」タブで「Shell」を開く
2. 以下のコマンドを実行：
   ```bash
   ls -la /app/public
   ls -la /app/frontend-build/build
   ```

3. `index.html`が存在しない場合：
   - フロントエンドのビルドが失敗している可能性
   - Dockerfileのビルドログを確認

#### 原因2: フロントエンドのビルドが失敗している

**確認方法:**
- Dockerfileのビルドログで `Frontend build failed` と表示される
- `npm run build`が失敗している

**解決方法:**
1. ローカルでフロントエンドをビルドして確認：
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm run build
   ```

2. ビルドが成功する場合：
   - DockerfileのNode.jsバージョンを確認
   - `package.json`の依存関係を確認

#### 原因3: `public_folder`のパスが間違っている

**確認方法:**
- ログで `Public folder path:` が `/app/public` 以外を表示している

**解決方法:**
- `api_server.rb`の`public_folder`設定を確認
- 絶対パスを使用しているか確認

#### 原因4: ルーティングの順序が間違っている

**確認方法:**
- APIエンドポイント（`/api/v1/health`）は動作するが、ルートパス（`/`）が動作しない

**解決方法:**
- `api_server.rb`でAPIエンドポイントがSPAルーティングより前に定義されているか確認

## 緊急対応（一時的な解決方法）

### 方法1: Shellで`index.html`を確認

1. Railway Dashboard → 「Deployments」→ 「Shell」を開く
2. 以下のコマンドを実行：
   ```bash
   # publicディレクトリの確認
   ls -la /app/public
   
   # frontend-buildディレクトリの確認
   ls -la /app/frontend-build/build
   
   # index.htmlが存在する場合、手動でコピー
   cp -r /app/frontend-build/build/* /app/public/
   ```

### 方法2: フロントエンドを事前にビルド

1. ローカルでフロントエンドをビルド：
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm run build
   ```

2. `frontend/build`ディレクトリをGitにコミット（通常は推奨されませんが、一時的な解決方法として）

3. Dockerfileを修正して、事前にビルドされたファイルを使用：
   ```dockerfile
   # 事前にビルドされたファイルを使用
   COPY frontend/build ./public
   ```

## デバッグコマンド

Railway Shellで実行：

```bash
# 現在のディレクトリを確認
pwd

# publicディレクトリの確認
ls -la /app/public

# frontend-buildディレクトリの確認
ls -la /app/frontend-build

# index.htmlの存在確認
test -f /app/public/index.html && echo "index.html exists" || echo "index.html NOT found"

# アプリケーションの再起動
# Railway Dashboardで「Restart」をクリック
```

## 次のステップ

1. Railwayのログを確認して、上記のどの原因に該当するか特定
2. 該当する原因の解決方法を実行
3. 再デプロイして動作確認
