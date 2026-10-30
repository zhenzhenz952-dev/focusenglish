(() => {
  'use strict';
  const manifest = window.FOCUS_OFFLINE_MANIFEST;
  const $ = id => document.getElementById(id);
  const MEDIA='focusenglish-media-v1';
  const DICTIONARY=`focusenglish-dictionary-${manifest.dictionaryVersion}`;
  const SHELL=`focusenglish-shell-${manifest.version}`;
  const root = new URL('./',location.href);
  const assetURL = asset => new URL(asset.url,root).href;
  const absolute = asset => ({...asset,url:assetURL(asset)});
  const mb = bytes => `${(bytes/1024/1024).toFixed(1)} MB`;
  let registration, audioAbort, dictionaryAbort, bulkAbort, bulkProgress, cachedAudio=new Set(), refreshTimer;
  let bulkMessage='';
  let installationPhase='idle', installationError='';
  const offlineDialog=$('offlineDialog');
  const dictionaryDialog=$('dictionaryDialog');
  const dictPanel=$('dictPanel');
  const dictPlaceholder=document.createComment('dictionary desktop position');
  dictPanel.before(dictPlaceholder);
  const notify = message => {
    const toast=$('toast');toast.textContent=message;toast.classList.add('show');
    clearTimeout(toast._mobileTimer);toast._mobileTimer=setTimeout(()=>toast.classList.remove('show'),3500);
  };
  const openDialog = dialog => {if(!dialog.open)dialog.showModal();};
  $('closeOffline').onclick=()=>offlineDialog.close();
  $('closeDictionary').onclick=()=>dictionaryDialog.close();
  for(const dialog of [offlineDialog,dictionaryDialog]) dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dictionaryDialog.addEventListener('close',()=>{dictPlaceholder.after(dictPanel);});
  window.addEventListener('focus:dictionary',event=>{
    if(matchMedia('(max-width:720px)').matches || !$('learnView').offsetParent){
      $('dictionarySheetTitle').textContent=event.detail?.headword || '查词';
      $('dictionaryMount').append(dictPanel);openDialog(dictionaryDialog);
    }
  });
  window.addEventListener('hashchange',()=>{dictionaryDialog.close();window.scrollTo({top:0,behavior:'instant'});setTimeout(enhanceRoute,0);});

  function currentAudioAsset(){
    if(!location.hash.startsWith('#practice') && !location.hash.startsWith('#learn/'))return null;
    const element = location.hash.startsWith('#practice') ? $('practiceAudio') : $('audio');
    if(!element?.getAttribute('src'))return null;
    const pathname=new URL(element.getAttribute('src'),root).pathname;
    return manifest.audio.find(asset=>new URL(assetURL(asset)).pathname===pathname) || null;
  }
  async function updateStatus(){
    const online=navigator.onLine;
    $('connectionDot').className=`status-dot ${online?'ready':'offline'}`;
    $('connectionLabel').textContent=online?'离线与安装':'离线中';
    if(!('caches' in window))return;
    try{
      const keys=await caches.keys();
      const ready=keys.includes(SHELL) && registration?.active && (await (await caches.open(SHELL)).keys()).length>=manifest.shell.length;
      $('shellDot').className=`status-dot ${ready?'ready':''}`;
      $('shellStatus').textContent=ready ? (online?'题库已可离线。阅读、练习和题库词汇已保存；音频与完整词典的保存状态见下方。':'当前离线。题库可以继续使用，已保存的音频也能播放。') : installationPhase==='error' ? installationError : manifest.bootstrap ? '完整题库还未保存在本机。请点下方“回到面板，导入离线包”，选择电脑传入的 ZIP。' : !online ? '题库还未完整保存，请联网后点“重新检查”。' : installationPhase==='installing' ? '正在准备离线题库，请保持页面打开；完成后会在这里确认。' : '题库还未完整保存，请点“重新检查”开始准备。';
      if(keys.includes(MEDIA)){
        const cache=await caches.open(MEDIA);
        const urls=new Set((await cache.keys()).map(request=>request.url));
        cachedAudio=new Set(manifest.audio.filter(asset=>urls.has(assetURL(asset))).map(asset=>asset.url));
      }else cachedAudio=new Set();
      renderDownloads();
      const dictCache=keys.includes(DICTIONARY)?await caches.open(DICTIONARY):null;
      const dictURLs=new Set(dictCache?(await dictCache.keys()).map(request=>request.url):[]);
      const count=manifest.dictionary.filter(asset=>dictURLs.has(assetURL(asset))).length;
      if(!dictionaryAbort)$('dictionaryDownloadStatus').textContent=count===manifest.dictionary.length?'完整词典已保存，可以离线查询。':`完整词典：已保存 ${count}/${manifest.dictionary.length} 部分 · 共 ${mb(manifest.dictionaryBytes)}`;
      const allBytes=manifest.dictionaryBytes+manifest.audio.reduce((sum,asset)=>sum+asset.bytes,0);
      const savedBytes=manifest.audio.filter(asset=>cachedAudio.has(asset.url)).reduce((sum,asset)=>sum+asset.bytes,0)+manifest.dictionary.filter(asset=>dictURLs.has(assetURL(asset))).reduce((sum,asset)=>sum+asset.bytes,0);
      $('allDownloadSummary').textContent=`全部 ${manifest.audio.length} 份音频 + 完整词典 · 共 ${mb(allBytes)}。已保存音频 ${cachedAudio.size}/${manifest.audio.length}、词典 ${count}/${manifest.dictionary.length} 部分；还需约 ${mb(allBytes-savedBytes)}。`;
      if(navigator.storage?.estimate){const estimate=await navigator.storage.estimate();$('storageUsage').textContent=`此应用已用约 ${mb(estimate.usage||0)}`;}
    }catch(error){$('shellStatus').textContent='暂时无法检查离线存储。请使用普通 Safari 窗口，并重新打开页面。';}
  }
  function renderDownloads(){
    const select=$('audioDownloadSelect');
    const old=select.value;
    select.replaceChildren(...manifest.audio.map(asset=>{
      const option=document.createElement('option');option.value=asset.url;
      option.textContent=`${cachedAudio.has(asset.url)?'✓ ':''}${asset.title} · ${mb(asset.bytes)}`;return option;
    }));
    if(manifest.audio.some(a=>a.url===old))select.value=old;
    const list=$('downloadedAudio');list.replaceChildren();
    const saved=manifest.audio.filter(asset=>cachedAudio.has(asset.url));
    if(!saved.length){const p=document.createElement('p');p.textContent='还没有保存音频。';p.style.cssText='color:#6b7280;font-size:12px;margin:0';list.append(p);}
    for(const asset of saved){
      const row=document.createElement('div');row.className='download-row';
      const text=document.createElement('div');const title=document.createElement('strong');title.textContent=asset.title;
      const size=document.createElement('small');size.textContent=`已可离线 · ${mb(asset.bytes)}`;text.append(title,size);
      const remove=document.createElement('button');remove.textContent='移除下载';remove.setAttribute('aria-label',`移除 ${asset.title} 的离线音频`);
      remove.onclick=async()=>{if(audioAbort||dictionaryAbort||bulkAbort)return;await (await caches.open(MEDIA)).delete(assetURL(asset));await updateStatus();enhanceAudioButtons();};
      row.append(text,remove);list.append(row);
    }
    enhanceAudioButtons();
    updateDownloadControls();
  }
  async function saveAudio(asset){
    if(audioAbort||bulkAbort){notify('已有下载正在进行，请等待完成或先暂停。');return;}
    if(!navigator.onLine){notify('请联网后下载音频。已下载的内容仍然可以使用。');return;}
    audioAbort=new AbortController();updateDownloadControls();
    $('audioDownloadStatus').textContent=`正在保存 ${asset.title}（${mb(asset.bytes)}），请保持应用打开…`;
    try{
      const cache=await caches.open(MEDIA);
      await FocusOffline.cacheAsset(cache,absolute(asset),{signal:audioAbort.signal});
      $('audioDownloadStatus').textContent=`${asset.title} 已完整保存，可以离线播放。`;
      notify('音频已保存，可以离线学习。');
      navigator.storage?.persist?.().catch(()=>{});
    }catch(error){$('audioDownloadStatus').textContent=error.name==='AbortError'?'已取消。本次未完成的文件不会标记为已下载。':`${error.message || '下载失败'}；请重试。`;
    }finally{audioAbort=null;updateDownloadControls();await updateStatus();}
  }
  function updateDownloadControls(){
    const busy=!!(audioAbort||dictionaryAbort||bulkAbort);
    $('downloadAll').disabled=busy;
    $('downloadAll').textContent=bulkAbort?'正在下载全部…':bulkMessage?'继续下载剩余':'一键下载全部';
    $('pauseAllDownloads').hidden=!bulkAbort;
    $('downloadAudio').disabled=!!(audioAbort||bulkAbort);
    $('audioDownloadSelect').disabled=!!bulkAbort;
    $('cancelDownload').hidden=!audioAbort;
    $('downloadDictionary').disabled=!!bulkAbort;
    $('applyUpdate').disabled=busy;
    document.querySelectorAll('#downloadedAudio button, [data-mobile-audio]').forEach(button=>{
      button.disabled=busy||!!(button.dataset.mobileAudio && cachedAudio.has(button.dataset.mobileAudio));
    });
    waitingUpdate();
  }
  function renderAllProgress(state){
    bulkProgress=state;
    const bar=$('allDownloadProgress');bar.hidden=false;bar.max=Math.max(1,state.totalBytes);bar.value=state.bytes;
    $('allDownloadStatus').textContent=`已保存 ${state.completed}/${state.total} 个文件 · ${mb(state.bytes)} / ${mb(state.totalBytes)}（${Math.round(state.bytes/Math.max(1,state.totalBytes)*100)}%）。请保持应用在前台…`;
  }
  $('downloadAll').onclick=async()=>{
    if(audioAbort||dictionaryAbort||bulkAbort){notify('请先完成或暂停当前下载。');return;}
    bulkAbort=new AbortController();bulkProgress=null;bulkMessage='';updateDownloadControls();
    $('allDownloadStatus').textContent='正在检查已保存的内容，完整文件会自动跳过…';
    try{
      const media=await caches.open(MEDIA),dictionary=await caches.open(DICTIONARY);
      const items=[...manifest.audio.map(asset=>({cache:media,asset:absolute(asset)})),...manifest.dictionary.map(asset=>({cache:dictionary,asset:absolute(asset)}))];
      await FocusOffline.cacheAssets(items,{signal:bulkAbort.signal,onProgress:renderAllProgress});
      $('allDownloadStatus').textContent='全部音频与完整词典已保存。上方显示“题库已可离线”后，即可断网学习。';
      notify('全部音频与完整词典已保存。');navigator.storage?.persist?.().catch(()=>{});
    }catch(error){
      bulkMessage=error.name==='AbortError'?'已暂停':`下载中断：${error.name==='QuotaExceededError'?'设备存储不足，请腾出空间后继续':error.message||'请检查网络和登录状态'}`;
      const saved=bulkProgress?`已保存 ${bulkProgress.completed}/${bulkProgress.total} 个文件。`:'';
      $('allDownloadStatus').textContent=`${bulkMessage}。${saved}已完成的内容保留，点击“继续下载剩余”即可接着保存。`;
    }finally{bulkAbort=null;updateDownloadControls();await updateStatus();}
  };
  $('pauseAllDownloads').onclick=()=>{bulkAbort?.abort();$('allDownloadStatus').textContent='正在暂停，请稍候…';};
  $('downloadAudio').onclick=()=>{const asset=manifest.audio.find(a=>a.url===$('audioDownloadSelect').value);if(asset)saveAudio(asset);};
  $('cancelDownload').onclick=()=>audioAbort?.abort();
  $('downloadDictionary').onclick=async()=>{
    if(bulkAbort){notify('正在下载全部资源，请先暂停。');return;}
    if(dictionaryAbort){dictionaryAbort.abort();return;}
    if(!navigator.onLine){notify('请联网后保存完整词典。');return;}
    dictionaryAbort=new AbortController();$('downloadDictionary').textContent='取消词典下载';updateDownloadControls();
    const status=$('dictionaryDownloadStatus');
    try{
      const cache=await caches.open(DICTIONARY);let done=0;
      for(const asset of manifest.dictionary){
        if(dictionaryAbort.signal.aborted)throw new DOMException('Cancelled','AbortError');
        if(!await cache.match(assetURL(asset)))await FocusOffline.cacheAsset(cache,absolute(asset),{signal:dictionaryAbort.signal});
        done++;status.textContent=`已保存 ${done}/${manifest.dictionary.length} 部分。请保持应用在前台…`;
      }
      status.textContent='完整词典已保存，可以离线查询。';notify('完整离线词典已保存。');
      navigator.storage?.persist?.().catch(()=>{});
    }catch(error){status.textContent=error.name==='AbortError'?'已暂停，已完成部分保留；再次点击可继续。':`下载中断：${error.message}。已完成部分保留，可以重试。`;
    }finally{dictionaryAbort=null;$('downloadDictionary').textContent='保存完整词典';updateDownloadControls();await updateStatus();}
  };
  $('openOffline').onclick=async()=>{openDialog(offlineDialog);await updateStatus();const current=currentAudioAsset();if(current)$('audioDownloadSelect').value=current.url;};

  function exportBackup(){
    const raw=localStorage.getItem('fe_focusenglish_beta05_state_v1');
    if(!raw){notify('还没有学习记录。完成一次学习后即可导出。');return;}
    const name=`FocusEnglish_backup_${new Date().toISOString().slice(0,10)}.json`;
    const file=new File([raw],name,{type:'application/json'});
    if(navigator.canShare?.({files:[file]})){
      navigator.share({files:[file],title:'FocusEnglish 学习备份'}).catch(error=>{if(error.name!=='AbortError')downloadBackup(file,name);});
    }else downloadBackup(file,name);
  }
  function downloadBackup(file,name){
    const url=URL.createObjectURL(file);const link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  }
  $('mobileExport').onclick=exportBackup;$('exportData').onclick=exportBackup;
  $('mobileImport').onclick=()=>{offlineDialog.close();$('importFile').click();};

  function enhanceAudioButtons(){
    document.querySelectorAll('[data-mobile-audio]').forEach(button=>{
      const saved=cachedAudio.has(button.dataset.mobileAudio);button.textContent=saved?'✓ 音频已可离线':'↓ 保存这份音频';
      button.disabled=saved||!!(audioAbort||dictionaryAbort||bulkAbort);
    });
  }
  function enhanceRoute(){
    const asset=currentAudioAsset();
    const target=location.hash.startsWith('#practice')?$('practiceAudio'):$('learnView').querySelector('.study-card');
    document.querySelectorAll('.audio-download-inline').forEach(wrapper=>wrapper.remove());
    if(asset && target){
      const wrapper=document.createElement('div');wrapper.className='audio-download-inline';wrapper.dataset.mobile='true';
      const label=document.createElement('span');label.textContent=`${mb(asset.bytes)} · 听力音频`;
      const button=document.createElement('button');button.dataset.mobileAudio=asset.url;button.onclick=()=>saveAudio(asset);wrapper.append(label,button);
      if(target.tagName==='AUDIO')target.after(wrapper);else target.append(wrapper);enhanceAudioButtons();
    }
    restoreDrafts();
  }
  const draftsKey='fe_mobile_drafts_v1';
  function readDrafts(){try{return JSON.parse(localStorage.getItem(draftsKey)||'{}');}catch(_){return {};}}
  function restoreDrafts(){
    const drafts=readDrafts();
    document.querySelectorAll('textarea[id]').forEach(input=>{const saved=drafts[`${location.hash}:${input.id}`];if(!input.readOnly && !input.value && typeof saved==='string')input.value=saved;});
  }
  document.addEventListener('input',event=>{
    const input=event.target;if(input.tagName!=='TEXTAREA'||!input.id)return;
    try{const drafts=readDrafts();drafts[`${location.hash}:${input.id}`]=input.value;localStorage.setItem(draftsKey,JSON.stringify(drafts));}catch(_){notify('设备存储已满，请先导出备份并清理已下载音频。');}
  });
  new MutationObserver(records=>{
    if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1 && (node.matches('audio,textarea')||node.querySelector('audio,textarea')))))enhanceRoute();
  }).observe(document.querySelector('main'),{childList:true,subtree:true});
  document.addEventListener('keydown',event=>{if((event.key==='Enter'||event.key===' ')&&event.target.matches('.term')){event.preventDefault();event.target.click();}});
  document.addEventListener('touchend',event=>{
    const target=event.target.closest('#sentenceText,#readingPassageText');
    if(target)setTimeout(()=>{if(window.getSelection()?.toString().trim().includes(' '))target.dispatchEvent(new MouseEvent('mouseup'));},350);
  },{passive:true});
  document.addEventListener('error',event=>{if(event.target.tagName==='AUDIO')notify(navigator.onLine?'音频暂时无法播放，请重试或先保存这份音频。':'这份音频尚未下载，请联网后保存。');},true);
  let maxHeight=window.visualViewport?.height || innerHeight;
  window.visualViewport?.addEventListener('resize',()=>{const height=window.visualViewport.height;maxHeight=Math.max(maxHeight,height);document.body.classList.toggle('keyboard-open',height<maxHeight*.72 && /INPUT|TEXTAREA/.test(document.activeElement?.tagName||''));});
  document.addEventListener('focusout',()=>document.body.classList.remove('keyboard-open'));
  if(matchMedia('(display-mode:standalone)').matches || navigator.standalone){$('installSection').hidden=true;}
  else if(!/iPhone|iPad|iPod/.test(navigator.userAgent)){$('installHint').textContent='在 iPhone 上，用 Safari 打开相同网址即可安装。学习记录按设备分别保存。';}
  $('appVersion').textContent=`版本 ${manifest.version.slice(0,8)}`;

  function waitingUpdate(){
    $('applyUpdate').hidden=!registration?.waiting;
    if(registration?.waiting){$('applyUpdate').hidden=false;$('applyUpdate').textContent=audioAbort||dictionaryAbort||bulkAbort?'下载结束后可更新':'有新版本，点击更新';}
  }
  $('applyUpdate').onclick=()=>{
    if(audioAbort||dictionaryAbort||bulkAbort){notify('请先等待下载完成，或暂停本次下载。');return;}
    if(registration?.waiting){sessionStorage.setItem('fe_pwa_apply_update','1');registration.waiting.postMessage({type:'SKIP_WAITING'});}
  };
  async function register(){
    if(!('serviceWorker' in navigator) || !window.isSecureContext){installationPhase='error';installationError='离线功能需要 Safari 和安全网址（HTTPS）。请在 Safari 重新检查。';$('shellStatus').textContent=installationError;return;}
    installationPhase='installing';installationError='';
    try{
      registration=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});
      installationPhase=registration.installing?'installing':'idle';
      waitingUpdate();
      const observe=worker=>{
        if(!worker)return;
        const changed=()=>{
          if(worker.state==='redundant'){installationPhase='error';installationError='离线题库准备中断，请确认网络和登录状态，再点“重新检查”。';}
          else if(worker.state==='activated'||worker.state==='installed')installationPhase='idle';
          waitingUpdate();updateStatus();
        };
        worker.addEventListener('statechange',changed);changed();
      };
      registration.addEventListener('updatefound',()=>{
        installationPhase='installing';observe(registration.installing);
      });
      observe(registration.installing);
      navigator.serviceWorker.ready.then(()=>updateStatus());
      if(navigator.onLine)registration.update().catch(()=>{if(!registration.active){installationPhase='error';installationError='离线准备暂未完成，请确认网络和登录状态，再点“重新检查”。';updateStatus();}});
    }catch(error){installationPhase='error';installationError='离线准备暂未完成。请确认已登录并使用普通 Safari 窗口，再点“重新检查”。';}
    await updateStatus();
  }
  navigator.serviceWorker?.addEventListener('controllerchange',()=>{
    if(sessionStorage.getItem('fe_pwa_apply_update')){sessionStorage.removeItem('fe_pwa_apply_update');location.reload();}
    else updateStatus();
  });
  $('retryOffline').onclick=async()=>{await register();await updateStatus();};
  window.addEventListener('online',()=>{updateStatus();registration?.update().catch(()=>{});});
  window.addEventListener('offline',updateStatus);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateStatus();});
  enhanceRoute();register();
})();
