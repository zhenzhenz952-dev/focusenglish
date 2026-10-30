(() => {
  'use strict';
  async function rangeResponse(response, header) {
    const blob = await response.blob();
    const size = blob.size;
    const headers = new Headers(response.headers);
    headers.set('Accept-Ranges','bytes');
    if (!header) { headers.set('Content-Length',String(size)); return new Response(blob,{status:200,headers}); }
    const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
    let start = -1, end = -1;
    if (match && (match[1] || match[2]) && size) {
      if (match[1]) { start=Number(match[1]); end=match[2] ? Math.min(Number(match[2]),size-1) : size-1; }
      else if (Number(match[2]) > 0) { start=Math.max(0,size-Number(match[2]));end=size-1; }
    }
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start<0 || start>=size || end<start) {
      headers.set('Content-Range',`bytes */${size}`); headers.set('Content-Length','0');
      return new Response(null,{status:416,headers});
    }
    headers.set('Content-Range',`bytes ${start}-${end}/${size}`);
    headers.set('Content-Length',String(end-start+1));
    return new Response(blob.slice(start,end+1,blob.type),{status:206,headers});
  }
  function validType(kind, type) {
    const patterns = {audio:/^audio\//i,script:/javascript|ecmascript/i,style:/text\/css/i,json:/json/i,binary:/^application\/octet-stream/i,html:/text\/html/i,image:/^image\//i,text:/^text\//i};
    return !patterns[kind] || patterns[kind].test(type);
  }
  async function cacheAsset(cache, asset, options={}) {
    // Hosted document responses can redirect and gain per-request challenge
    // scripts. Download the byte-identical binary mirror, then serve it as HTML.
    const binaryHTML=asset.kind==='html' && typeof asset.fetchURL==='string' && /^[a-f0-9]{64}$/i.test(asset.sha256||'') && Number.isSafeInteger(asset.bytes) && asset.bytes>=0;
    if(asset.fetchURL!==undefined && !binaryHTML)throw new Error('离线页面缺少完整校验信息');
    let downloadURL=asset.url;
    if(binaryHTML){
      const original=new URL(asset.url),raw=new URL(asset.fetchURL,original);
      if(raw.origin!==original.origin || !raw.pathname.endsWith('.bin') || raw.username || raw.password || raw.hash)throw new Error('离线页面下载地址无效');
      downloadURL=raw.href;
    }
    const response = await fetch(downloadURL, {credentials:'same-origin',cache:'no-store',redirect:'error',signal:options.signal});
    if (response.status !== 200 || response.redirected || !validType(binaryHTML?'binary':asset.kind,response.headers.get('Content-Type') || '')) throw new Error('下载未完成，请确认网络和登录状态后重试');
    const blob = await response.blob();
    if (asset.bytes !== undefined && blob.size !== asset.bytes) throw new Error('文件下载不完整，请重试');
    if (asset.sha256) {
      const digest = await crypto.subtle.digest('SHA-256',await blob.arrayBuffer());
      const actual = [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
      if (actual !== asset.sha256) throw new Error('文件校验未通过，请重试');
    }
    const headers = new Headers(response.headers);
    if(binaryHTML)headers.set('Content-Type','text/html; charset=utf-8');
    headers.delete('Content-Encoding'); headers.delete('Content-Range'); headers.set('Content-Length',String(blob.size));
    options.signal?.throwIfAborted();
    await cache.put(asset.url,new Response(blob,{status:200,headers}));
  }
  async function cacheAssets(items, options={}) {
    const controller=new AbortController();
    const cancel=()=>controller.abort();
    options.signal?.addEventListener('abort',cancel,{once:true});
    if(options.signal?.aborted)controller.abort();
    const signal=controller.signal;
    const progress={completed:0,total:items.length,bytes:0,totalBytes:items.reduce((sum,item)=>sum+(item.asset.bytes||0),0)};
    const report=()=>options.onProgress?.({...progress});
    let next=0,failure;
    try{
      const pending=[];
      for(const item of items){
        signal.throwIfAborted();
        if(await item.cache.match(item.asset.url)){progress.completed++;progress.bytes+=item.asset.bytes||0;}
        else pending.push(item);
      }
      report();
      const worker=async()=>{
        while(next<pending.length && !signal.aborted){
          const {cache,asset}=pending[next++];
          try{
            await cacheAsset(cache,asset,{signal});
            progress.completed++;progress.bytes+=asset.bytes||0;report();
          }catch(error){if(!failure)failure=error;controller.abort();}
        }
      };
      await Promise.all(Array.from({length:Math.min(3,pending.length)},worker));
      if(failure)throw failure;
      signal.throwIfAborted();
      return {...progress};
    }finally{options.signal?.removeEventListener('abort',cancel);}
  }
  globalThis.FocusOffline = {rangeResponse,cacheAsset,cacheAssets};
})();
