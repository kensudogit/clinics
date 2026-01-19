# MSYS2のインストール手順

## 問題
一部のRuby gem（特にネイティブ拡張を含むgem）をインストールするには、MSYS2が必要です。

## 解決方法

### 方法1: RubyInstaller DevKitを使用（推奨）

```bash
# RubyInstallerに付属するridkコマンドを使用
ridk install

# インストール後、bundle installを再実行
bundle install
```

### 方法2: MSYS2を手動でインストール

1. MSYS2をダウンロード: https://www.msys2.org/
2. インストールを実行
3. MSYS2のパスを環境変数に追加
4. `bundle install`を再実行

### 方法3: 必要なツールのみをインストール

```bash
# 開発ツールをインストール
ridk exec pacman -S --needed base-devel mingw-w64-x86_64-toolchain

# その後、bundle installを再実行
bundle install
```

## 確認方法

MSYS2が正しくインストールされているか確認:

```bash
ridk version
```

## 注意事項

- MSYS2のインストールには数分かかる場合があります
- インストール後、新しいターミナルを開く必要がある場合があります
- 一部のgemはMSYS2なしでも動作しますが、ネイティブ拡張が必要なgemは失敗します
