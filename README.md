# MediKataru for pet — Landing Page

「動物病院の説明を、家族の言葉に。」MediKataru for pet の紹介用シングルページLPです。

- `index.html` … ページ本体
- `css/style.css` … スタイル（暖色系・Zen Maru Gothic）
- `js/main.js` … スクロール演出、モバイルメニュー、Before/Afterタブ、数値カウントアップ、FAQ

ビルド不要。`index.html` をブラウザで開くか、GitHub Pages 等の静的ホスティングにそのまま配置できます。

アプリ本体: https://medikataru-for-pet.onrender.com/

## 更新時の注意（キャッシュ対策）
CSS / JS を変更したら、`index.html` 内の `?v=YYYYMMDD` を新しい日付に書き換えてください。
古いCSSが残ったまま新しいHTMLが表示されて、レイアウトが崩れるのを防ぎます。
