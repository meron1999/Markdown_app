document.addEventListener('DOMContentLoaded', () => {
  /**
   * HTMLエンティティをデコードするヘルパー関数
   * @param {string} text エンコードされたテキスト
   * @returns {string} デコードされたテキスト
   */
  const decodeHtmlEntities = (text) => {
    // DOMを介さずにデコードする安全な方法
    if (typeof text !== 'string') return '';
    return text.replace(/&quot;/g, '"')
               .replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&#39;/g, "'");
  };

  // markdown-itのインスタンスを初期化
  // window.markdownit はCDNから読み込まれたライブラリ
  if (typeof window.markdownit === 'undefined') {
    console.error('Error: markdown-it library is not loaded. Make sure the CDN link is correct and you have an internet connection.');
    return;
  }
  const md = window.markdownit({
    html: false, // XSS対策としてHTMLタグを無効化
    linkify: true, // URLを自動でリンク化
    typographer: true, // 引用符などを綺麗に表示
  });

  // --- ライブプレビュー機能 ---
  const markdownInput = document.getElementById('markdown-input');
  const markdownPreview = document.getElementById('markdown-preview');

  if (markdownInput && markdownPreview) {
    // テキストエリアで入力があるたびにプレビューを更新する関数
    const updatePreview = () => {
      const markdownText = markdownInput.value;
      markdownPreview.innerHTML = md.render(markdownText);
    };
    // イベントリスナーを設定
    markdownInput.addEventListener('input', updatePreview);
    // 初期表示時にも一度プレビューを更新
    updatePreview();
  } else {
    // 要素が見つからない場合、コンソールにエラーを出力
    if (!markdownInput) console.error('Error: Could not find element with id="markdown-input"');
    if (!markdownPreview) console.error('Error: Could not find element with id="markdown-preview"');
  }

  // --- 既存投稿のレンダリング機能 ---
  document.querySelectorAll('[data-markdown-content]').forEach(el => {
    const encodedMarkdown = el.getAttribute('data-markdown-content');
    const markdownText = decodeHtmlEntities(encodedMarkdown);
    el.innerHTML = md.render(markdownText);
  });
});