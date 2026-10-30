(() => {
  'use strict';
  const dictionary = window.FOCUS_ENGLISH_DICTIONARY ||= {entries:{}, forms:{}};
  const pending = new Map();
  const loaded = new Set();
  const normalize = word => String(word || '').replace(/’/g,"'").toLowerCase();
  const bucket = word => /^[a-z]/.test(word) ? word[0] : 'other';
  async function load(key) {
    if (loaded.has(key)) return;
    if (!pending.has(key)) {
      pending.set(key, (async () => {
        const response = await fetch(`dictionary/shards/${key}.dict`, {credentials:'same-origin'});
        if (!response.ok || !/octet-stream/i.test(response.headers.get('Content-Type') || '')) throw new Error('词典尚未下载，请联网后重试');
        const packed=new Uint8Array(await response.arrayBuffer());
        const data=JSON.parse(new TextDecoder().decode(window.pako.ungzip(packed)));
        if (!data.entries || !data.forms) throw new Error('词典内容不完整，请重试');
        Object.assign(dictionary.entries,data.entries);
        Object.assign(dictionary.forms,data.forms);
        loaded.add(key);
      })().finally(() => pending.delete(key)));
    }
    return pending.get(key);
  }
  async function ensure(surface) {
    const word = normalize(surface);
    if (!word) return;
    let lemma = dictionary.forms[word] || word;
    if (dictionary.entries[lemma]) return;
    await load(bucket(word));
    lemma = dictionary.forms[word] || word;
    if (!dictionary.entries[lemma]) await load(bucket(lemma));
  }
  window.FocusDictionary = {ensure};
})();
