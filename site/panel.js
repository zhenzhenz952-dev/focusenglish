(function (root, factory) {
  'use strict';
  const panel = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = panel;
  } else {
    root.FocusPanel = panel;
    const start = () => panel.init({document: root.document, window: root});
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start, {once: true});
    else start();
  }
})(typeof window === 'undefined' ? globalThis : window, function () {
  'use strict';

  const STATE_KEY = 'fe_focusenglish_beta05_state_v1';
  const WORD_KEY = 'fe_panel_word_v1';
  // A small, self-contained selection. The complete dictionary stays in the study app.
  const words = [
    {word: 'curious', sound: '/ˈkjʊəriəs/', type: 'adjective · 形容词', en: 'wanting to know or learn about something', zh: '好奇的；求知的', example: 'Be curious about the small things around you.'},
    {word: 'steady', sound: '/ˈstedi/', type: 'adjective · 形容词', en: 'continuing in a regular way without sudden changes', zh: '平稳的；持续的', example: 'Small steps can lead to steady progress.'},
    {word: 'notice', sound: '/ˈnəʊtɪs/', type: 'verb · 动词', en: 'to see or become aware of something', zh: '注意到；察觉到', example: 'Notice how the speaker connects the words.'},
    {word: 'clarify', sound: '/ˈklærɪfaɪ/', type: 'verb · 动词', en: 'to make something easier to understand', zh: '澄清；使更易理解', example: 'One example can help clarify the idea.'},
    {word: 'approach', sound: '/əˈprəʊtʃ/', type: 'noun · 名词', en: 'a way of dealing with a problem or task', zh: '方法；处理方式', example: 'Try a different approach to this question.'},
    {word: 'reflect', sound: '/rɪˈflekt/', type: 'verb · 动词', en: 'to think carefully about something', zh: '认真思考；反思', example: 'Take a moment to reflect on what you learned.'},
    {word: 'persist', sound: '/pəˈsɪst/', type: 'verb · 动词', en: 'to continue doing something despite difficulty', zh: '坚持；锲而不舍', example: 'It helps to persist when a task feels difficult.'},
    {word: 'adapt', sound: '/əˈdæpt/', type: 'verb · 动词', en: 'to change to suit a new situation', zh: '适应；使适合', example: 'We can adapt our plans as we learn more.'},
    {word: 'insight', sound: '/ˈɪnsaɪt/', type: 'noun · 名词', en: 'a clear understanding of something', zh: '洞察；深刻理解', example: 'The discussion gave me a new insight into the problem.'},
    {word: 'deliberate', sound: '/dɪˈlɪbərət/', type: 'adjective · 形容词', en: 'done on purpose rather than by accident', zh: '故意的；有意的', example: 'Leaving my phone outside was a deliberate choice.'}
  ];
  const sentences = [
    {en: 'A little practice today can make tomorrow feel easier.', zh: '今天多练习一点，明天就可能轻松一些。'},
    {en: 'You do not have to understand every word to follow the main idea.', zh: '你不必理解每一个词，也能把握主要意思。'},
    {en: 'Try saying the same idea in a different way.', zh: '试着换一种方式，表达同一个意思。'},
    {en: 'The words you notice today may become the words you use tomorrow.', zh: '你今天留意的词，或许明天就能用上。'},
    {en: 'When an idea feels unclear, start with a simple example.', zh: '当一个想法还不够清晰时，先从简单的例子开始。'},
    {en: 'Leave a little time to review what you learned yesterday.', zh: '留一点时间，复习昨天学到的内容。'},
    {en: 'Listen once for the story, then listen again for the details.', zh: '先听一遍了解大意，再听一遍关注细节。'}
  ];

  const isRecord = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));
  const recordValues = value => isRecord(value) ? Object.values(value).filter(isRecord) : [];
  const validDate = value => typeof value === 'string' && value.length > 0 && Number.isFinite(Date.parse(value));

  function readSavedSummary(storage) {
    const result = {savedWords: 0, savedPhrases: 0, submittedPractice: 0, resume: null};
    let state;
    try { state = JSON.parse(storage?.getItem(STATE_KEY) || 'null'); } catch (_) { return result; }
    if (!isRecord(state) || state.schemaVersion !== 1) return result;
    for (const item of recordValues(state.libraryItems)) {
      if (item.saved !== true) continue;
      if (item.type === 'word') result.savedWords += 1;
      if (item.type === 'phrase') result.savedPhrases += 1;
    }
    result.submittedPractice = recordValues(state.practiceProgress).filter(item => validDate(item.submittedAt)).length;
    let latestTime = -Infinity;
    for (const [materialId, progress] of Object.entries(isRecord(state.materialProgress) ? state.materialProgress : {})) {
      if (!materialId.trim() || !isRecord(progress) || !validDate(progress.lastOpenedAt) || typeof progress.currentSentenceId !== 'string' || !progress.currentSentenceId.trim()) continue;
      const opened = Date.parse(progress.lastOpenedAt);
      if (opened <= latestTime) continue;
      try {
        result.resume = {href: `study.html#learn/${encodeURIComponent(materialId)}/${encodeURIComponent(progress.currentSentenceId)}`, sentenceId: progress.currentSentenceId};
        latestTime = opened;
      } catch (_) { /* Ignore an invalid manually edited route segment. */ }
    }
    return result;
  }

  function init(options = {}) {
    const document = options.document;
    const window = options.window;
    if (!document) return;
    let storage = options.storage;
    if (!Object.prototype.hasOwnProperty.call(options, 'storage')) {
      try { storage = window?.localStorage; } catch (_) { /* Private or restricted storage. */ }
    }
    const now = options.now || (() => new Date());
    const element = id => document.getElementById(id);
    const text = (id, value) => { const node = element(id); if (node) node.textContent = String(value); };
    let day = '';
    let wordIndex = 0;

    function translation(id, buttonId, visible) {
      const content = element(id);
      const button = element(buttonId);
      if (content) content.hidden = !visible;
      if (button) {
        button.setAttribute('aria-expanded', String(visible));
        button.textContent = visible ? '收起中文' : '查看中文';
      }
    }

    function renderWord() {
      const item = words[wordIndex];
      text('fepWord', item.word);
      text('fepWordSound', item.sound);
      text('fepWordType', item.type);
      text('fepWordDefinition', item.en);
      text('fepWordTranslation', item.zh);
      text('fepWordExample', item.example);
      translation('fepWordTranslation', 'fepRevealWord', false);
    }

    function renderDaily() {
      const date = now();
      const localDay = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      text('fepDate', date.toLocaleDateString('zh-CN', {month: 'long', day: 'numeric', weekday: 'long'}));
      if (day === localDay) return;
      day = localDay;
      const ordinal = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
      wordIndex = ((ordinal % words.length) + words.length) % words.length;
      try {
        const preference = JSON.parse(storage?.getItem(WORD_KEY) || 'null');
        if (preference?.date === day && Number.isInteger(preference.index) && preference.index >= 0 && preference.index < words.length) wordIndex = preference.index;
      } catch (_) { /* The daily card works without a saved preference. */ }
      renderWord();
      const sentence = sentences[((ordinal % sentences.length) + sentences.length) % sentences.length];
      text('fepSentenceText', sentence.en);
      text('fepSentenceTranslation', sentence.zh);
      translation('fepSentenceTranslation', 'fepRevealSentence', false);
    }

    function renderSaved() {
      const summary = readSavedSummary(storage);
      text('fepSavedWords', summary.savedWords);
      text('fepSavedPhrases', summary.savedPhrases);
      text('fepSavedNote', summary.savedWords + summary.savedPhrases ? '你在这台设备收藏的词与短语。' : '遇到喜欢的词，把它收藏在学习页里。');
      text('fepPracticeNote', summary.submittedPractice ? `本机已提交 ${summary.submittedPractice} 题` : '看看自己的学习记录');
      element('fepContinueLink')?.setAttribute('href', summary.resume?.href || 'study.html#learn');
      text('fepContinueTitle', summary.resume ? '接着上次，继续听。' : '给英语，留一点时间。');
      text('fepContinueCopy', summary.resume ? '已找到这台设备上保存的句子位置。' : '选一份材料，从一个句子开始。');
      text('fepContinuePosition', summary.resume ? `上次学到 · ${summary.resume.sentenceId}` : '');
      const position = element('fepContinuePosition');
      if (position) position.hidden = !summary.resume;
    }

    element('fepNextWord')?.addEventListener('click', () => {
      renderDaily();
      wordIndex = (wordIndex + 1) % words.length;
      renderWord();
      try { storage?.setItem(WORD_KEY, JSON.stringify({date: day, index: wordIndex})); } catch (_) { /* Keep the current card usable if storage is full. */ }
    });
    element('fepRevealWord')?.addEventListener('click', () => translation('fepWordTranslation', 'fepRevealWord', element('fepWordTranslation').hidden));
    element('fepRevealSentence')?.addEventListener('click', () => translation('fepSentenceTranslation', 'fepRevealSentence', element('fepSentenceTranslation').hidden));
    const refresh = () => { renderDaily(); renderSaved(); };
    window?.addEventListener('pageshow', refresh);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
    refresh();
  }

  return {init, readSavedSummary};
});
