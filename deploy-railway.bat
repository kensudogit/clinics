@echo off
chcp 65001 >nul
echo ========================================
echo Railway デプロイ準備スクリプト
echo ========================================
echo.

echo このスクリプトは、Railwayにデプロイする前の準備を行います。
echo.
echo 注意: Railway CLIがインストールされている必要があります。
echo インストール方法: npm i -g @railway/cli
echo.

pause

echo.
echo [1/3] フロントエンドをビルドしています...
cd frontend
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ERROR: フロントエンドの依存関係のインストールに失敗しました
    pause
    exit /b 1
)

call npm run build
if %errorlevel% neq 0 (
    echo ERROR: フロントエンドのビルドに失敗しました
    pause
    exit /b 1
)
cd ..

echo.
echo [2/3] Railway CLIでログインしています...
railway login
if %errorlevel% neq 0 (
    echo ERROR: Railway CLIのログインに失敗しました
    pause
    exit /b 1
)

echo.
echo [3/3] Railwayプロジェクトを初期化しています...
railway init
if %errorlevel% neq 0 (
    echo ERROR: Railwayプロジェクトの初期化に失敗しました
    pause
    exit /b 1
)

echo.
echo ========================================
echo 準備完了！
echo ========================================
echo.
echo 次のステップ:
echo 1. Railway DashboardでMySQLサービスを追加
echo 2. 環境変数を設定（RAILWAY_ENV_VARS.mdを参照）
echo 3. railway up でデプロイ
echo.
echo 詳細は RAILWAY_QUICKSTART.md を参照してください。
echo.
pause
