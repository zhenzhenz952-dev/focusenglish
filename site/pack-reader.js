(() => {
  'use strict';

  const MAX_ENTRIES = 1024;
  const MAX_MEMBER = 25 * 1024 * 1024;
  const MAX_METADATA = 1024 * 1024;
  const MAX_DIRECTORY = 2 * 1024 * 1024;
  const META_NAME = 'focusenglish-pack.json';
  const HASH = /^[a-f0-9]{64}$/i;
  const utf8 = new TextDecoder('utf-8', {fatal:true});
  const crcTable = new Uint32Array(256);
  for (let index = 0; index < 256; index++) {
    let value = index;
    for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
    crcTable[index] = value >>> 0;
  }

  function abortIfNeeded(signal) {
    if (signal?.aborted) {
      if (signal.reason !== undefined) throw signal.reason;
      const error = new Error('离线包导入已暂停');
      error.name = 'AbortError';
      throw error;
    }
  }

  function fail(message) { throw new Error(message); }
  function view(bytes) { return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength); }
  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 255];
    return (crc ^ 0xffffffff) >>> 0;
  }

  function safeName(name) {
    if (typeof name !== 'string' || !name) fail('ZIP 资源路径为空或格式错误');
    let decoded;
    try { decoded = decodeURIComponent(name); }
    catch { fail('ZIP 资源路径编码错误'); }
    for (const candidate of [name, decoded]) {
      if (/^[\/]|^[a-z][a-z0-9+.-]*:|[\\\u0000-\u001f\u007f?#]/i.test(candidate) || candidate.split('/').some(part => part === '.' || part === '..')) {
        fail(`ZIP 包含不安全的资源路径：${name}`);
      }
    }
    return name;
  }

  function decodeName(bytes, flags) {
    if (!(flags & 0x800) && bytes.some(byte => byte > 127)) fail('ZIP 文件名称必须使用 UTF-8 编码');
    try { return safeName(utf8.decode(bytes)); }
    catch (error) {
      if (error instanceof TypeError) fail('ZIP 文件名称的 UTF-8 编码错误');
      throw error;
    }
  }

  async function read(file, start, length, signal) {
    abortIfNeeded(signal);
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(length) || start < 0 || length < 0 || start + length > file.size) fail('ZIP 数据截断或范围错误');
    const bytes = new Uint8Array(await file.slice(start, start + length).arrayBuffer());
    abortIfNeeded(signal);
    if (bytes.byteLength !== length) fail('ZIP 数据读取不完整');
    return bytes;
  }

  function checkFields(version, flags, method, compressed, uncompressed) {
    if (version > 20 || compressed === 0xffffffff || uncompressed === 0xffffffff) fail('不支持 ZIP64 或较新的 ZIP 格式');
    if (flags & 1 || flags & 0x40) fail('不支持加密的 ZIP 离线包');
    if (flags & 8) fail('不支持含数据描述符的 ZIP 离线包');
    if (flags & ~0x800) fail('ZIP 包含不支持的标志');
    if (method !== 0) fail('离线包必须使用 ZIP_STORED，不支持压缩成员');
    if (compressed !== uncompressed) fail('ZIP_STORED 成员的大小不一致');
    if (uncompressed > MAX_MEMBER) fail('ZIP 单个资源超过 25 MiB 上限');
  }

  function checkExtra(bytes) {
    const data = view(bytes);
    let offset = 0;
    while (offset < bytes.length) {
      if (offset + 4 > bytes.length) fail('ZIP 扩展头截断');
      const kind = data.getUint16(offset, true);
      const size = data.getUint16(offset + 2, true);
      if (kind === 1) fail('不支持 ZIP64 扩展头');
      offset += 4 + size;
      if (offset > bytes.length) fail('ZIP 扩展头长度错误');
    }
  }

  async function directory(file, signal) {
    if (!file || typeof file.slice !== 'function' || !Number.isSafeInteger(file.size) || file.size < 22 || file.size > 0xffffffff) fail('ZIP 文件大小或格式错误');
    const tailStart = Math.max(0, file.size - 65557);
    const tail = await read(file, tailStart, file.size - tailStart, signal);
    const tailView = view(tail);
    let end = -1;
    for (let index = tail.length - 22; index >= 0; index--) {
      if (tailView.getUint32(index, true) === 0x06054b50 && index + 22 + tailView.getUint16(index + 20, true) === tail.length) { end = index; break; }
    }
    if (end < 0) fail('ZIP 结束目录缺失，文件可能已截断');
    const count = tailView.getUint16(end + 10, true);
    const centralSize = tailView.getUint32(end + 12, true);
    const centralStart = tailView.getUint32(end + 16, true);
    if (count === 0xffff || centralSize === 0xffffffff || centralStart === 0xffffffff) fail('不支持 ZIP64 离线包');
    if (tailView.getUint16(end + 4, true) || tailView.getUint16(end + 6, true) || tailView.getUint16(end + 8, true) !== count) fail('不支持多磁盘 ZIP，或 ZIP 目录数量不一致');
    if (count > MAX_ENTRIES) fail('ZIP 成员数量超过 1024 上限');
    if (centralSize > MAX_DIRECTORY || centralStart + centralSize !== tailStart + end) fail('ZIP 中央目录大小或位置错误');
    const central = await read(file, centralStart, centralSize, signal);
    const data = view(central);
    const entries = new Map();
    let position = 0;
    for (let index = 0; index < count; index++) {
      if (position + 46 > central.length || data.getUint32(position, true) !== 0x02014b50) fail('ZIP 中央目录头错误或截断');
      const version = data.getUint16(position + 6, true);
      const flags = data.getUint16(position + 8, true);
      const method = data.getUint16(position + 10, true);
      const compressed = data.getUint32(position + 20, true);
      const size = data.getUint32(position + 24, true);
      const nameSize = data.getUint16(position + 28, true);
      const extraSize = data.getUint16(position + 30, true);
      const commentSize = data.getUint16(position + 32, true);
      const next = position + 46 + nameSize + extraSize + commentSize;
      checkFields(version, flags, method, compressed, size);
      if (next > central.length || data.getUint16(position + 34, true)) fail('ZIP 中央目录头长度或磁盘错误');
      const nameBytes = central.slice(position + 46, position + 46 + nameSize);
      const name = decodeName(nameBytes, flags);
      if (entries.has(name)) fail(`ZIP 包含重复资源名称：${name}`);
      checkExtra(central.subarray(position + 46 + nameSize, position + 46 + nameSize + extraSize));
      entries.set(name, {name, nameBytes, version, flags, method, size,
        crc:data.getUint32(position + 16, true), time:data.getUint32(position + 12, true),
        localOffset:data.getUint32(position + 42, true)});
      position = next;
    }
    if (position !== central.length) fail('ZIP 中央目录长度或成员数量不一致');

    // Validate every local header before the first cache write, including unused entries.
    const ranges = [];
    for (const entry of entries.values()) {
      if (entry.localOffset + 30 > centralStart) fail('ZIP 本地文件头位置错误');
      const header = view(await read(file, entry.localOffset, 30, signal));
      if (header.getUint32(0, true) !== 0x04034b50) fail('ZIP 本地文件头签名错误');
      if (header.getUint16(4, true) !== entry.version || header.getUint16(6, true) !== entry.flags || header.getUint16(8, true) !== entry.method ||
          header.getUint32(10, true) !== entry.time || header.getUint32(14, true) !== entry.crc || header.getUint32(18, true) !== entry.size || header.getUint32(22, true) !== entry.size) fail(`ZIP 本地头与中央目录不一致：${entry.name}`);
      const nameSize = header.getUint16(26, true);
      const extraSize = header.getUint16(28, true);
      entry.dataOffset = entry.localOffset + 30 + nameSize + extraSize;
      if (nameSize !== entry.nameBytes.length || entry.dataOffset + entry.size > centralStart) fail('ZIP 本地文件头长度或数据大小错误');
      const names = await read(file, entry.localOffset + 30, nameSize + extraSize, signal);
      if (entry.nameBytes.some((byte, index) => names[index] !== byte)) fail('ZIP 本地文件名称与中央目录不一致');
      checkExtra(names.subarray(nameSize));
      ranges.push({start:entry.localOffset, end:entry.dataOffset + entry.size});
    }
    ranges.sort((a, b) => a.start - b.start);
    for (let index = 1; index < ranges.length; index++) if (ranges[index].start < ranges[index - 1].end) fail('ZIP 本地文件头或数据范围重叠');
    return entries;
  }

  async function metadata(file, entries, signal) {
    const entry = entries.get(META_NAME);
    if (!entry) fail('缺少离线包元数据 focusenglish-pack.json');
    if (entry.size > MAX_METADATA) fail('离线包元数据超过 1 MiB 上限');
    const bytes = await read(file, entry.dataOffset, entry.size, signal);
    if (crc32(bytes) !== entry.crc) fail('离线包元数据 CRC 校验失败');
    let pack;
    try { pack = JSON.parse(utf8.decode(bytes)); }
    catch { fail('离线包元数据不是有效的 UTF-8 JSON'); }
    if (!pack || Array.isArray(pack) || pack.format !== 'FocusEnglishOfflinePack' || pack.schemaVersion !== 1 ||
        typeof pack.appVersion !== 'string' || !pack.appVersion || typeof pack.dictionaryVersion !== 'string' || !pack.dictionaryVersion ||
        !Array.isArray(pack.assets) || pack.assets.length > MAX_ENTRIES) fail('离线包格式或版本不兼容');
    const assets = new Map();
    for (const asset of pack.assets) {
      if (!asset || typeof asset !== 'object') fail('离线包元数据中的资源格式错误');
      safeName(asset.url);
      if (assets.has(asset.url)) fail('离线包元数据中包含重复资源');
      if (asset.bytes !== undefined && (!Number.isSafeInteger(asset.bytes) || asset.bytes < 0 || asset.bytes > MAX_MEMBER)) fail('离线包元数据中的资源大小错误');
      if (asset.sha256 !== undefined && (typeof asset.sha256 !== 'string' || !HASH.test(asset.sha256))) fail('离线包元数据中的校验值格式错误');
      assets.set(asset.url, asset);
    }
    return assets;
  }

  function expectedAssets(manifest, baseURL) {
    if (!manifest || typeof manifest.version !== 'string' || !manifest.version || typeof manifest.dictionaryVersion !== 'string' || !manifest.dictionaryVersion) fail('当前应用资源清单版本无效');
    const assets = [], urls = new Set();
    for (const group of ['shell', 'dictionary', 'audio']) {
      if (manifest[group] !== undefined && !Array.isArray(manifest[group])) fail('当前应用资源清单格式无效');
      for (const asset of manifest[group] || []) {
        if (!asset || !asset.sha256) continue; // The manifest cannot contain a hash of itself.
        safeName(asset.url);
        if (typeof asset.sha256 !== 'string' || !HASH.test(asset.sha256) || !Number.isSafeInteger(asset.bytes) || asset.bytes < 0 || asset.bytes > MAX_MEMBER) fail('当前应用资源清单的大小或校验值无效');
        let url;
        try { url = new URL(asset.url, baseURL).href; }
        catch { fail('当前应用资源清单的基础 URL 无效'); }
        if (urls.has(url)) fail('当前应用资源清单包含重复 URL');
        urls.add(url);
        const bucket = group === 'audio' ? 'focusenglish-media-v1' : group === 'dictionary' ? `focusenglish-dictionary-${manifest.dictionaryVersion}` : `focusenglish-shell-${manifest.version}`;
        assets.push({...asset, sha256:asset.sha256.toLowerCase(), key:url, bucket});
      }
    }
    if (assets.length > MAX_ENTRIES) fail('当前应用资源数量超过上限');
    return assets;
  }

  async function digest(bytes, signal) {
    abortIfNeeded(signal);
    if (!globalThis.crypto?.subtle) fail('浏览器无法进行 SHA-256 校验，请使用安全连接打开应用');
    const result = await crypto.subtle.digest('SHA-256', bytes);
    abortIfNeeded(signal);
    return [...new Uint8Array(result)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async function completeCached(response, asset, signal) {
    if (!response || response.status !== 200 || response.headers.get('Content-Range')) return false;
    const length = response.headers.get('Content-Length');
    if (length !== null && (!/^\d+$/.test(length) || Number(length) !== asset.bytes)) return false;
    const blob = await response.blob();
    abortIfNeeded(signal);
    return blob.size === asset.bytes && await digest(await blob.arrayBuffer(), signal) === asset.sha256;
  }

  function contentType(asset) {
    const extension = asset.url.split('.').pop().toLowerCase();
    const types = {html:'text/html; charset=utf-8', js:'application/javascript; charset=utf-8', css:'text/css; charset=utf-8', json:'application/json; charset=utf-8', webmanifest:'application/manifest+json; charset=utf-8', txt:'text/plain; charset=utf-8', svg:'image/svg+xml', png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', webp:'image/webp', ico:'image/x-icon', m4a:'audio/mp4', mp4:'audio/mp4', aac:'audio/aac', mp3:'audio/mpeg', ogg:'audio/ogg', wav:'audio/wav', dict:'application/octet-stream'};
    if (types[extension]) return types[extension];
    return {html:types.html, script:types.js, style:types.css, json:types.json, audio:'audio/mp4', text:types.txt}[asset.kind] || 'application/octet-stream';
  }

  async function importPack(file, options = {}) {
    const {manifest, signal, onProgress} = options;
    abortIfNeeded(signal);
    const assets = expectedAssets(manifest, options.baseURL || globalThis.location?.href);
    const entries = await directory(file, signal);
    const declared = await metadata(file, entries, signal);
    const cacheStorage = options.caches || globalThis.caches;
    if (!cacheStorage || typeof cacheStorage.open !== 'function') fail('浏览器不支持离线缓存');
    const progress = {completed:0, total:assets.length, bytes:0, totalBytes:assets.reduce((sum, asset) => sum + asset.bytes, 0), skipped:0};
    const missing = [], buckets = new Map();
    const report = current => onProgress?.({...progress, current});
    report('');
    for (const asset of assets) {
      abortIfNeeded(signal);
      if (!buckets.has(asset.bucket)) buckets.set(asset.bucket, await cacheStorage.open(asset.bucket));
      const cache = buckets.get(asset.bucket);
      if (await completeCached(await cache.match(asset.key), asset, signal)) {
        progress.completed++; progress.bytes += asset.bytes; progress.skipped++;
        report(asset.url);
        continue;
      }
      const entry = entries.get(asset.url);
      const declaration = declared.get(asset.url);
      // An older pack can declare a different revision. Only the runtime manifest grants writes.
      if (!entry || !declaration || declaration.bytes !== asset.bytes || declaration.sha256?.toLowerCase() !== asset.sha256) {
        missing.push(asset.url);
        report(asset.url);
        continue;
      }
      if (entry.size !== asset.bytes) fail(`资源大小校验失败：${asset.url}。请重新复制离线包。`);
      const bytes = await read(file, entry.dataOffset, entry.size, signal);
      if (crc32(bytes) !== entry.crc || await digest(bytes, signal) !== asset.sha256) fail(`资源 SHA-256 校验失败：${asset.url}。请重新复制离线包。`);
      abortIfNeeded(signal);
      await cache.put(asset.key, new Response(bytes, {status:200, headers:{'Content-Type':contentType(asset), 'Content-Length':String(bytes.length)}}));
      progress.completed++; progress.bytes += asset.bytes;
      report(asset.url);
    }
    abortIfNeeded(signal);
    return {...progress, missing};
  }

  globalThis.FocusPack = {importPack};
})();
