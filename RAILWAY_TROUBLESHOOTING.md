# Railway トラブルシューティングガイド

## Dockerfileが見つからないエラー

### エラーメッセージ
```
Dockerfile `Dockerfile` does not exist
```

### 解決方法

#### 1. `.dockerignore`の確認

`.dockerignore`ファイルに`Dockerfile`が含まれていないか確認してください。

**問題のある`.dockerignore`:**
```
Dockerfile  # ← これが含まれているとエラーになります
```

**正しい`.dockerignore`:**
```
# Dockerfile is needed for Railway deployment, so we don't ignore it
```

#### 2. Railwayの設定確認

Railway Dashboardで以下を確認：

1. **Settings** → **Source** タブ
   - **Root Directory** が空（ルートディレクトリ）になっているか確認
   - もしサブディレクトリが指定されている場合、`Dockerfile`のパスを調整

2. **Settings** → **Build** タブ
   - **Dockerfile Path** が `Dockerfile` になっているか確認
   - リポジトリルートからの相対パスを指定

#### 3. リポジトリの確認

GitHubリポジトリで以下を確認：

1. `Dockerfile`がリポジトリのルートに存在するか
2. `Dockerfile`が`.gitignore`で除外されていないか
3. 最新の変更がプッシュされているか

#### 4. 再デプロイ

変更をコミット・プッシュ後：

1. Railway Dashboardで **Redeploy** をクリック
2. または、GitHubにプッシュすると自動的に再デプロイされます

### 確認コマンド

```bash
# ローカルでDockerfileが存在するか確認
cd C:\devlop\clinics
dir Dockerfile

# .dockerignoreにDockerfileが含まれていないか確認
findstr /C:"Dockerfile" .dockerignore

# Gitの状態を確認
git status
git log --oneline -5
```

### よくある問題

1. **`.dockerignore`に`Dockerfile`が含まれている**
   - → `.dockerignore`から`Dockerfile`を削除

2. **RailwayのRoot Directoryが間違っている**
   - → Settings → Source で Root Directory を空にする

3. **変更がプッシュされていない**
   - → `git push`で変更をプッシュ

4. **Dockerfileのパスが間違っている**
   - → Settings → Build で Dockerfile Path を確認
