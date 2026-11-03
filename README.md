# Molecule Explorer | GitHubにXYZを追加するだけで分子が増える版

公開先: https://k-watanabe-chiba-u.github.io/molecule-explorer/
リポジトリ: https://github.com/k-watanabe-Chiba-U/molecule-explorer

## 最初に1回だけ行う作業

**既存のGitHub Pages（Settings → Pages: Deploy from a branch、main、/(root)）をそのまま利用します。** GitHub Actions、サーバー、GitHub APIの利用登録は必要ありません。

1. ZIPを解凍します。
2. リポジトリのトップページで `Add file` → `Upload files` を開きます。
3. `index.html`、`styles.css`、`app.js`、`molecule-catalog.json` の4ファイルを選んでアップロードします。**先頭3ファイルは既存の同名ファイルを上書きする更新です。**
4. GitHubのリポジトリに `molecules` フォルダを作ります。ブラウザから `Add file` → `Create new file` を使い、ファイル名に `molecules/README.md` と入力して本文に「XYZ files」などを記入し `Commit changes` すると作成できます。
5. `molecules` フォルダ内を開き、`Add file` → `Upload files` → サンプルの `hydrogen.xyz` をアップロードし `Commit changes` します。
6. GitHub Pagesの公開を待って、ページを更新してください。「GitHubに登録した分子」に「hydrogen」が現れます。

**補足**: Chromeなどで `molecules` フォルダをドラッグ＆ドロップしてアップロードしても構いません。その場合、手順4と5を一度に済ませられます。GitHubの表示が異なる場合は、フォルダ内でのアップロードを選んでください。

## 2回目以降：XYZを追加するだけ

1. https://github.com/k-watanabe-Chiba-U/molecule-explorer/tree/main/molecules を開きます。
2. `Add file` → `Upload files` で `.xyz` ファイルを追加します。
3. `Commit changes` を押します。
4. GitHub Pagesが公開を更新した後（通常数分、最大10分程度）、 https://k-watanabe-chiba-u.github.io/molecule-explorer/ を再読み込みし、必要なら「↻ 更新」を押します。

**以降、JavaScriptやHTMLの編集は不要です。** 分子名はXYZファイル名（拡張子除く）から自動生成され、化学式は選択時に座標から自動計算されます。ボタンの並びはファイル名順です。

## どう動いているか

- GitHub Pagesの標準Jekyllビルドが、`molecule-catalog.json` のLiquidテンプレートを解釈します。
- テンプレートが `molecules` フォルダの `.xyz` ファイルを検索し、公開時にJSONの一覧を生成します。
- Webサイトが生成済みJSONを読み、一覧ボタンを自動で追加します。選択されたときに分子のXYZを同じWebサイトから読み込みます。
- 端末からGitHub APIにアクセスしないため、公開授業で多くの端末が同時接続する場合にもAPIレート制限を受けません。

**重要**: GitHub PagesでJekyllを有効にするため、ルートに `.nojekyll` を作成しないでください。既存のPages設定が「GitHub Actions」に変更されている場合、この方式はそのままでは利用できません。Sourceを `Deploy from a branch`、`main`、`/(root)` に戻してください。

## 試験とトラブルシューティング

- `https://k-watanabe-chiba-u.github.io/molecule-explorer/molecule-catalog.json` をブラウザで開き、Liquidタグではなく `[{"name": ...}]` というJSONデータが表示されることを確認します。
- HTMLファイルをダブルクリックして `file://` で開いた場合、Jekyllが処理されず一覧は自動生成されません。GitHub Pages上で確認してください。
- 元の6種類の分子と、手元のXYZファイルを直接選択する機能は引き続き利用できます。
- 新しい分子が出ない場合は、GitHub Pagesの `Actions` のビルドが完了したか確認し、ページを再読込してください。
- 分子のXYZが壊れている、原子数が合わない等の場合は表示時にエラーになります。
- 20 MB以内、1フレーム1〜15,000原子、最大2,000フレーム。複数フレームXYZもサポートします。

## プライバシーと表示の注意

- GitHubのPublicリポジトリに追加するXYZ座標は**すべてインターネット上に公開**されます。未公開研究情報や個人情報は登録しないでください。
- 本サイトではブラウザ内でファイルの構造を計算して表示し、外部の生成AIサービスには送信しません。
- XYZでは結合次数・形式電荷・結晶の周期境界を十分に表現できません。結合は距離による推定で、化学的に確定した表示ではありません。
- 描画用3Dmol.jsは外部CDNから読み込みます。インターネット接続が必要です。

## ファイル構成

```
molecule-explorer/
├── index.html
├── styles.css
├── app.js
├── molecule-catalog.json    ← Jekyllが自動生成するJSONテンプレート
└── molecules/
    ├── README.md
    ├── hydrogen.xyz          ← 動作確認用
    └── （ここにXYZファイルを増やすだけ）
```
