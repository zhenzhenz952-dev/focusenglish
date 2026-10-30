(() => {
  'use strict';
  const manifest=window.FOCUS_OFFLINE_MANIFEST;
  const baseURL=new URL('./',location.href).href;
  const SHELL=`focusenglish-shell-${manifest.version}`;
  const MEDIA='focusenglish-media-v1';
  const DICTIONARY=`focusenglish-dictionary-${manifest.dictionaryVersion}`;
  const $=id=>document.getElementById(id);
  const mb=bytes=>`${(bytes/1024/1024).toFixed(1)} MB`;
  let registration,importAbort,snapshot,controllerVersion;

  async function inspectOffline(){
    const names=await caches.keys();
    const entries=async name=>new Set(names.includes(name)?(await (await caches.open(name)).keys()).map(request=>request.url):[]);
    const [shell,audio,dictionary]=await Promise.all([entries(SHELL),entries(MEDIA),entries(DICTIONARY)]);
    const has=(set,asset)=>set.has(new URL(asset.url,baseURL).href);
    return {
      panelReady:(manifest.bootstrap||manifest.shell).every(asset=>has(shell,asset)),
      studyReady:manifest.shell.every(asset=>has(shell,asset)),
      audioSaved:manifest.audio.filter(asset=>has(audio,asset)).length,
      audioTotal:manifest.audio.length,
      dictionarySaved:manifest.dictionary.filter(asset=>has(dictionary,asset)).length,
      dictionaryTotal:manifest.dictionary.length
    };
  }
  function renderStatus(state){
    snapshot=state;
    const complete=state.studyReady&&state.audioSaved===state.audioTotal&&state.dictionarySaved===state.dictionaryTotal;
    const controlled=controllerVersion===manifest.version;
    const head=complete?(controlled?'完整资源已保存在本机':'资源已保存，请启用新版面板；首次启用仍需联网一次'):state.panelReady?'轻量面板已保存，联网可直接学习；离线资源可选导入':'联网即可学习，离线资源可从文件导入';
    $('offlineSummary').textContent=`${head} · 音频 ${state.audioSaved}/${state.audioTotal} · 词典 ${state.dictionarySaved}/${state.dictionaryTotal}`;
    window.dispatchEvent(new CustomEvent('focus:offline-status',{detail:state}));
    waitingUpdate();
  }
  async function refresh(){
    try{renderStatus(await inspectOffline());}
    catch(_){$('offlineSummary').textContent='请用普通 Safari 窗口打开本网址；轻量学习卡片仍可使用。';}
  }
  function workerVersion(worker){
    if(!worker)return Promise.resolve('');
    return new Promise(resolve=>{
      const channel=new MessageChannel();
      const finish=version=>{clearTimeout(timer);channel.port1.close();resolve(typeof version==='string'?version:'');};
      const timer=setTimeout(()=>finish(''),1500);
      channel.port1.onmessage=event=>finish(event.data?.version);
      try{worker.postMessage({type:'FOCUS_GET_VERSION'},[channel.port2]);}catch(_){finish('');}
    });
  }
  async function probeController(){controllerVersion=await workerVersion(navigator.serviceWorker?.controller);await refresh();}
  function openImport(){
    const dialog=$('importDialog');if(!dialog.open)dialog.showModal();
    refresh();
  }
  function waitingUpdate(){
    const button=$('panelAppUpdate');button.hidden=!registration?.waiting;button.disabled=!!importAbort;
    button.textContent=importAbort?'导入结束后可更新':'启用新版面板';
  }
  function applyUpdate(){
    if(importAbort||!registration?.waiting)return;
    sessionStorage.setItem('fe_panel_apply_update','1');registration.waiting.postMessage({type:'SKIP_WAITING'});
  }
  async function importFile(file){
    if(importAbort||!file)return;
    if(!window.isSecureContext||!('caches' in window)){
      $('packImportStatus').textContent='本地导入需要在 Safari 中打开本网站的 HTTPS 网址。';return;
    }
    importAbort=new AbortController();$('chooseOfflinePack').disabled=true;$('cancelPackImport').hidden=false;
    $('packFileName').textContent=file.name||'FocusEnglish_Offline.zip';
    $('packImportStatus').textContent='正在检查资源包。不会读取或替换学习记录…';
    waitingUpdate();let complete=false;
    try{
      const result=await FocusPack.importPack(file,{manifest,baseURL,caches,signal:importAbort.signal,onProgress:state=>{
        const bar=$('packImportProgress');bar.hidden=false;bar.max=Math.max(1,state.totalBytes);bar.value=state.bytes;
        $('packImportStatus').textContent=`已保存 ${state.completed}/${state.total} 个资源 · ${mb(state.bytes)} / ${mb(state.totalBytes)}。已保存的文件会跳过，请保持应用在前台。`;
      }});
      if(result.missing.length){
        $('packImportStatus').textContent=`匹配的资源已保存；资源包还缺少或不适配 ${result.missing.length} 个文件，请使用本次配套的完整 ZIP。已完成部分会保留。`;
      }else{
        complete=true;$('packImportStatus').textContent='完整资源已保存到手机。现在可以离线进入练习、精听和查词。';
        navigator.storage?.persist?.().catch(()=>{});
      }
    }catch(error){
      $('packImportStatus').textContent=error.name==='AbortError'?'已暂停导入，完成部分已保留。再次选择同一 ZIP 即可继续。':error.name==='QuotaExceededError'?'手机存储空间不足。完成部分已保留，腾出空间后再次导入。':`导入未完成：${error.message||'请重新选择完整的资源 ZIP'}。完成部分已保留，可以继续。`;
    }finally{
      importAbort=null;$('chooseOfflinePack').disabled=false;$('cancelPackImport').hidden=true;
      await refresh();waitingUpdate();
    }
    if(complete){
      await probeController();
      if(registration?.waiting && await workerVersion(registration.waiting)===manifest.version)applyUpdate();
      else if(controllerVersion===manifest.version)navigator.serviceWorker.controller.postMessage({type:'PACK_IMPORTED'});
      else $('packImportStatus').textContent='资源已保存在手机；还需联网完成一次离线面板启用，成功后就能断网学习。';
    }
  }
  async function register(){
    if(!('serviceWorker' in navigator)||!window.isSecureContext){await refresh();return;}
    try{
      registration=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none',scope:'./'});
      const observe=worker=>worker?.addEventListener('statechange',()=>{waitingUpdate();probeController();});
      observe(registration.installing);registration.addEventListener('updatefound',()=>observe(registration.installing));
      waitingUpdate();navigator.serviceWorker.ready.then(refresh).catch(()=>{});
      if(navigator.onLine&&!importAbort)registration.update().catch(()=>{});
    }catch(_){$('offlineSummary').textContent='面板可以使用；首次离线启用未完成，请联网重新打开。完整资源可先从本地 ZIP 导入。';}
    await probeController();
  }
  $('openImport').onclick=openImport;$('closeImport').onclick=()=>$('importDialog').close();
  $('chooseOfflinePack').onclick=()=>$('offlinePackFile').click();
  $('offlinePackFile').onchange=async event=>{const file=event.target.files?.[0];await importFile(file);event.target.value='';};
  $('cancelPackImport').onclick=()=>{importAbort?.abort();$('packImportStatus').textContent='正在暂停…';};
  $('panelAppUpdate').onclick=applyUpdate;
  document.addEventListener('click',event=>{
    const link=event.target.closest('[data-study]');
    if(link&&!navigator.onLine&&(!snapshot?.studyReady||controllerVersion!==manifest.version)){
      event.preventDefault();openImport();$('packImportStatus').textContent='完整学习资源尚未准备好，请先从文件导入离线 ZIP。';
    }
  });
  navigator.serviceWorker?.addEventListener('controllerchange',()=>{
    if(sessionStorage.getItem('fe_panel_apply_update')){sessionStorage.removeItem('fe_panel_apply_update');location.reload();}
    else probeController();
  });
  window.addEventListener('online',()=>{probeController();if(!importAbort)registration?.update().catch(()=>{});});
  window.addEventListener('offline',refresh);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
  window.FocusPanelOffline={refresh,importFile};
  if(location.hash==='#import')openImport();
  probeController();
  register();
})();
