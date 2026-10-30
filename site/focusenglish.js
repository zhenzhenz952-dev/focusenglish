(() => {
  'use strict';

  // Learn is fed entirely by generated content files.  A blank shell keeps
  // navigation safe while the library is empty; it is never shown as a lesson.
  let MATERIAL = {id:'', title:'', source:''};
  const STORAGE_KEY = 'fe_focusenglish_beta05_state_v1';
  const LEGACY_STORAGE_KEYS = ['fe_focusenglish_state_v1', 'fe_alpha031_state_v1'];
  const MAX_EVENTS = 5000;
  const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30];
  let sentences = [];
  const PHRASE_CORE = window.FOCUS_ENGLISH_PHRASE_CORE?.entries || [];
  const dictionary = [...DATA.dictionary, ...PHRASE_CORE.filter(entry => !DATA.dictionary.some(existing => existing.type === 'phrase' && existing.headword.toLowerCase() === entry.headword.toLowerCase())).map(entry => ({...entry, type:'phrase', context:'', source_sentence:''}))];
  const BASE_DICTIONARY = window.FOCUS_ENGLISH_DICTIONARY || {entries:{}, forms:{}};
  const baseEntries = BASE_DICTIONARY.entries || {};
  const baseForms = BASE_DICTIONARY.forms || {};
  const EXAM_CATALOG = window.FOCUS_ENGLISH_EXAM_CATALOG?.exams || [];
  const PUBLISHED_EXAMS = window.FOCUS_ENGLISH_PUBLISHED_EXAMS?.exams || [];
  const TEXT_PRACTICE_EXAMS = window.FOCUS_ENGLISH_TEXT_PRACTICE_MODULES?.exams || [];
  const STRUCTURED_PRACTICE_EXAMS = window.FOCUS_ENGLISH_PRACTICE_CONTENT?.exams || [];
  const CONTRACTION_LEMMAS = {"don't":"do", "doesn't":"do", "didn't":"do", "won't":"will", "can't":"can", "couldn't":"can", "shouldn't":"should", "wouldn't":"would", "it's":"it", "that's":"that", "there's":"there", "i'm":"i", "you're":"you", "we're":"we", "they're":"they", "i've":"i", "we've":"we", "they've":"they", "isn't":"be", "aren't":"be", "wasn't":"be", "weren't":"be", "hasn't":"have", "haven't":"have", "hadn't":"have"};
  const TRANSLATIONS = {
    S01:'每年，在全球托运的超过 25 亿件行李中，有 2600 万件会丢失。',
    S02:'在这 2600 万件行李中，有 100 万件再也无法回到原主人手中。',
    S03:'恶劣天气和航班延误、目的地标签编码错误，以及有人忘记领取自己的一件行李，都是其中的一些原因。',
    S04:'但行李最终丢失的首要原因，是它没有身份标签，而航空公司不知道它属于谁。',
    S05:'把行李从值机柜台转运到出发登机口、再到抵达登机口和行李提取处，是一个对时间衔接要求很精细的过程。',
    S06:'如果系统运转得太慢，行李就赶不上转机航班。',
    S07:'如果系统运转得太快，行李可能赶上转机，但乘客却可能错过航班。',
    S08:'每个机场都有自己分配行李在转运途中所需时间的方式。',
    S09:'一些机场配备了先进的自动化系统，包括读取行李标签的扫描仪、无需停车便可装卸行李的目的地编码车辆，以及将行李分流到相应登机口的分拣机器。',
    S10:'即便如此，所有这些技术也未必能防止你的行李标签在传送带上被扯掉，使你成了一个无名行李的主人。',
    S11:'一旦行李丢失且乘客提出申报，承运航空公司就会将该行李认定为处理不当。',
    S12:'“处理不当”是指被延误、丢失、偷盗或损坏的行李。',
    S13:'大多数延误行李只比主人晚一个航班到达，并能在 24 小时内送达。',
    S14:'其余行李会由航空公司员工检查，以寻找关于其归属和目的地的线索。',
    S15:'如果谜团解开，这些行李会在四到五天内归还给主人。',
    S16:'没有目的地代码或身份标签的行李会被运往中央仓库，并在接下来的 90 天内接受全面的行李追踪流程。',
    S17:'航空公司会清点处理不当的行李，许多公司使用数据库将行李内容与失主的描述进行匹配。',
    S18:'一件行李从下落不明到彻底无法找回，大约需要三个月。',
    S19:'一旦到了那一步，行李会被捐给慈善机构、在拍卖会上出售，或被某家公司买下再卖给公众。',
    S20:'因此，切勿在托运行李中放入真正贵重的物品，并务必在行李上写上你的姓名和电话号码，以便工作人员联系你。'
  };
  const READING_PASSAGE = `Many see friendships as a comfort blanket: a shoulder to cry on, a reliable soul to confide in. However, more often than not, in our eagerness to seek individual success, we lose friends along the way and that has become part of the process.

The chaos and never-ending turmoil that accompanies everyday life is an aggressive obstacle in the pursuit of stable friendships. As students, we use this excuse to shrug off losing people who we once thought to be loved ones.

Instead of viewing our lives as a race, where everyone is on their own path to some form of success, we must relearn to value the connections we make along the track. We must reevaluate the harm of radical, individual freedom.

Radical individualism elevates the freedom of the individual over the collective. It argues, for instance, that universal healthcare, an example of collectivism, threatened the dream of many Americans.

Many of us have fallen victim to an individualistic culture. Society tends to celebrate personal achievement and commend it based on the assumption that winning or succeeding is a consequence of working harder than the next person.

As a society, we idolize the concept of “losing friends on the road to success.” We cannot be complacent with losing friendships because they are our anchors. Yes, pursue success. Challenge yourself. Push limits. But doing it alone does not make you more successful. Put effort into fostering healthy relationships and maintaining them through your busy schedule.`;
  const READING_QUESTIONS = [
    {id:'R46',number:46,prompt:'What often happens when people are eager to pursue individual success?',choices:{A:'They lack a shoulder to cry on.',B:'They have no soul to confide in.',C:'They cannot find reliable friends.',D:'They ignore their ties with friends.'},answer:'D',passageId:'reading_p1'},
    {id:'R47',number:47,prompt:'What does the author advise people to do in their pursuit of radical individualism?',choices:{A:'Reexamine its detrimental effects.',B:'Shrug off the loss of their loved ones.',C:'Avoid the chaos and turmoil involved.',D:'Remove aggressive obstacles in the way.'},answer:'A',passageId:'reading_p1'},
    {id:'R48',number:48,prompt:"What is American society's assumption of personal achievement?",choices:{A:'It is to be duly celebrated and highly commended.',B:"It is a sure way to fulfill a person's dream.",C:'It revolves around an individualistic culture.',D:"It reflects a person's exceptional endeavor."},answer:'D',passageId:'reading_p1'},
    {id:'R49',number:49,prompt:'What is preached in many success stories?',choices:{A:'Attaching importance to academic gains on the road to success.',B:'Investing one’s time in work instead of connecting with friends.',C:'Trying to strengthen friendships in one’s pursuit of personal success.',D:'Excelling in academic performance to get into a prestigious college.'},answer:'B',passageId:'reading_p1'},
    {id:'R50',number:50,prompt:'What can we infer from the passage regarding the pursuit of success?',choices:{A:'No one can succeed without pushing limits.',B:'No one can afford to neglect close friends.',C:'Collectivism is superior to individualism.',D:'Success experts often lead people to ruin.'},answer:'B',passageId:'reading_p1'}
  ];
  const mergePracticeModule = (...modules) => modules.filter(Boolean).reduce((merged, module) => {
    const result = {...merged, ...module};
    if (Object.hasOwn(module, 'task')) result.task = module.task;
    return result;
  }, {});
  const PRACTICE_EXAMS = EXAM_CATALOG.map(catalogExam => {
    const published = PUBLISHED_EXAMS.find(exam => exam.examId === catalogExam.examId);
    const textModules = TEXT_PRACTICE_EXAMS.find(exam => exam.examId === catalogExam.examId);
    const structured = STRUCTURED_PRACTICE_EXAMS.find(exam => exam.examId === catalogExam.examId);
    const keys = new Set([...Object.keys(published?.modules || {}), ...Object.keys(textModules?.modules || {}), ...Object.keys(structured?.modules || {})]);
    const publishedModules = window.FOCUS_ENGLISH_CONTENT_RELEASE
      ? {...structured?.modules}
      : Object.fromEntries([...keys].map(key => [key, mergePracticeModule(textModules?.modules?.[key], structured?.modules?.[key], published?.modules?.[key])]));
    return {...catalogExam, publishedModules};
  });
  const EXAM_TRANSLATION = {id:'T202512',source:'尊老是中华民族的传统美德，深深植根于中国人的思想和行为中，是人们普遍遵守的行为规范和社会准则。在当今的中国，这种美德得到广泛传承。社会各界积极营造敬老助老的社会氛围。为老年人提供便利服务已成为社会共识，例如社区专门开设长者食堂，公共场所配置优先座位。政府还出台了一系列政策，为老年人的权益提供有力保障。尊老是社会和谐与发展的重要基石，有助于培育良好的社会氛围，推动整个社会文明进步。',reference:'Respecting the elderly is a traditional virtue of the Chinese nation, deeply rooted in the thoughts and actions of Chinese people and widely observed as a behavioral norm and social principle. In contemporary China, this virtue continues to be widely passed down. All sectors of society actively foster a social atmosphere of valuing and supporting the elderly. Providing convenient services for older adults has become a social consensus; for instance, communities have established dedicated senior canteens, and priority seating is available in public spaces. The government has also implemented a series of policies to provide strong safeguards for the rights and interests of the elderly. Respecting the elderly serves as a crucial cornerstone for social harmony and development, contributing to the cultivation of a positive social atmosphere and promoting social progress and civilization.'};
  const EXAM_TRANSLATION_SEGMENTS = [
    {id:'TX01',zh:'尊老是中华民族的传统美德，深深植根于中国人的思想和行为中，是人们普遍遵守的行为规范和社会准则。',en:'Respecting the elderly is a traditional virtue of the Chinese nation, deeply rooted in the thoughts and actions of Chinese people and widely observed as a behavioral norm and social principle.'},
    {id:'TX02',zh:'在当今的中国，这种美德得到广泛传承。社会各界积极营造敬老助老的社会氛围。',en:'In contemporary China, this virtue continues to be widely passed down. All sectors of society actively foster a social atmosphere of valuing and supporting the elderly.'},
    {id:'TX03',zh:'为老年人提供便利服务已成为社会共识，例如社区专门开设长者食堂，公共场所配置优先座位。',en:'Providing convenient services for older adults has become a social consensus; for instance, communities have established dedicated senior canteens, and priority seating is available in public spaces.'},
    {id:'TX04',zh:'政府还出台了一系列政策，为老年人的权益提供有力保障。',en:'The government has also implemented a series of policies to provide strong safeguards for the rights and interests of the elderly.'},
    {id:'TX05',zh:'尊老是社会和谐与发展的重要基石，有助于培育良好的社会氛围，推动整个社会文明进步。',en:'Respecting the elderly serves as a crucial cornerstone for social harmony and development, contributing to the cultivation of a positive social atmosphere and promoting social progress and civilization.'}
  ];
  const WRITING_TASK = {id:'W202512',prompt:'Living in an increasingly competitive world, college students should better prepare themselves to confront various challenges.',reference:'Living in an increasingly competitive world, college students should better prepare themselves to confront various challenges. Whether it is fierce job competition, the demand for creative thinking in academic research, or the pressure of adapting to rapid social changes, these challenges require practical and comprehensive preparations to navigate successfully.\n\nFirst and foremost, mastering professional expertise is the foundation. College students should attach importance to not only their courses but also practical applications. Secondly, developing basic practical skills can improve competitiveness. Finally, keeping a positive attitude is very important. When facing difficulties such as failing exams or being rejected in job hunting, students should not give up easily. Instead, they should learn from failures and keep trying.'};
  const byId = id => document.getElementById(id);
  const now = () => new Date().toISOString();
  const sentenceKey = id => `${MATERIAL.id}:${id}`;
  const itemIdFor = d => `${d.type}:${encodeURIComponent(d.headword.trim().toLowerCase())}`;
  const encounterIdFor = (itemId, materialId, sentenceId) => `${itemId}|${materialId}|${sentenceId}`;
  const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const shortDate = value => value ? new Date(value).toLocaleDateString('zh-CN', {month:'2-digit',day:'2-digit'}) : '—';
  const fullDate = value => value ? new Date(value).toLocaleString('zh-CN', {hour12:false}) : '—';
  const statusLabel = value => ({encountered:'已接触',recognized:'已识别',activating:'激活中',activated:'已激活',stable:'稳定掌握',not_started:'未训练',understood:'完全理解',partial:'部分理解',unclear:'暂未理解'}[value] || '待验证');
  const statusClass = value => value === 'activating' || value === 'partial' ? 'act' : value === 'recognized' || value === 'activated' || value === 'stable' || value === 'understood' ? 'rec' : 'un';
  const lemmaFor = surface => { const key = String(surface || '').replace(/’/g, "'").toLowerCase(); return baseForms[key] || CONTRACTION_LEMMAS[key] || key; };

  function blankState() {
    const createdAt = now();
    return {schemaVersion:1, createdAt, updatedAt:createdAt, materialProgress:{}, sentenceProgress:{}, libraryItems:{}, encounters:{}, masteryStates:{}, trainingRecords:{}, translationProgress:{}, practiceProgress:{}, learningEvents:[], settings:{}};
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || LEGACY_STORAGE_KEYS.map(key => localStorage.getItem(key)).find(Boolean);
      const parsed = JSON.parse(raw);
      if (parsed?.schemaVersion === 1) return {...blankState(), ...parsed, translationProgress:{...blankState().translationProgress, ...parsed.translationProgress}, practiceProgress:{...blankState().practiceProgress, ...parsed.practiceProgress}, settings:{...blankState().settings, ...parsed.settings}};
    } catch (_) { /* Start fresh if a manually edited local record is invalid. */ }
    return blankState();
  }
  let state = loadState();
  function persist() { state.updatedAt = now(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function commit(fn) { const result = fn(); persist(); return result; }
  function addEvent(type, refs = {}, metadata = {}) {
    state.learningEvents.push({eventId:`evt_${Date.now()}_${Math.random().toString(36).slice(2,8)}`, type, timestamp:now(), materialId:refs.materialId, sentenceId:refs.sentenceId, itemId:refs.itemId, metadata});
    if (state.learningEvents.length > MAX_EVENTS) state.learningEvents.splice(0, state.learningEvents.length - MAX_EVENTS);
  }
  function getMaterialProgress() {
    return state.materialProgress[MATERIAL.id] || {currentSentenceId:'S01', lastOpenedAt:null};
  }
  function getSentenceProgress(sentenceId) {
    return state.sentenceProgress[sentenceKey(sentenceId)] || {materialId:MATERIAL.id, sentenceId, understandingStatus:null, transcriptVisible:false, saved:false, savedAt:null, updatedAt:null};
  }
  function ensureSentenceProgress(sentenceId) {
    const key = sentenceKey(sentenceId);
    if (!state.sentenceProgress[key]) state.sentenceProgress[key] = getSentenceProgress(sentenceId);
    return state.sentenceProgress[key];
  }
  function ensureItem(d) {
    const itemId = itemIdFor(d);
    if (!state.libraryItems[itemId]) {
      state.libraryItems[itemId] = {itemId, type:d.type, headword:d.headword, zh:d.zh, en:d.en, definitionStatus:d.definitionStatus || 'seed', saved:false, savedAt:null, priorKnowledge:null, createdAt:now(), updatedAt:now(), encounterIds:[]};
      state.masteryStates[itemId] = {itemId, reading:'encountered', listening:'not_started', activeUse:'not_started', updatedAt:now()};
    } else if ((d.definitionStatus || 'seed') !== 'missing') {
      const item = state.libraryItems[itemId];
      item.zh = d.zh; item.en = d.en; item.definitionStatus = d.definitionStatus || 'seed'; item.updatedAt = now();
    }
    return state.libraryItems[itemId];
  }
  function recalculateMastery(itemId) {
    const item = state.libraryItems[itemId];
    if (!item) return;
    const mastery = state.masteryStates[itemId] || {itemId, activeUse:'not_started'};
    const encounters = item.encounterIds.map(id => state.encounters[id]).filter(Boolean);
    mastery.reading = item.priorKnowledge === 'known' ? 'recognized' : 'encountered';
    const shouldActivateListening = item.priorKnowledge === 'known' && encounters.some(e => ['partial','unclear'].includes(e.understandingStatus));
    if (!['activated', 'stable'].includes(mastery.listening)) mastery.listening = shouldActivateListening ? 'activating' : 'not_started';
    mastery.activeUse ||= 'not_started';
    mastery.updatedAt = now();
    state.masteryStates[itemId] = mastery;
  }
  function recordTermView(d, sentence, source = {materialId:MATERIAL.id, materialTitle:MATERIAL.title, source:MATERIAL.source, canPlay:true}) {
    return commit(() => {
      const item = ensureItem(d);
      const id = encounterIdFor(item.itemId, source.materialId, sentence.id);
      const progress = source.materialId === MATERIAL.id ? getSentenceProgress(sentence.id) : {understandingStatus:null};
      let encounter = state.encounters[id];
      if (!encounter) {
        encounter = {encounterId:id, itemId:item.itemId, materialId:source.materialId, materialTitle:source.materialTitle, source:source.source, sentenceId:sentence.id, sourceText:sentence.text, context:d.context, firstSeenAt:now(), lastSeenAt:now(), viewCount:0, understandingStatus:progress.understandingStatus};
        state.encounters[id] = encounter;
        item.encounterIds.push(id);
      }
      encounter.lastSeenAt = now(); encounter.viewCount += 1; encounter.understandingStatus = progress.understandingStatus;
      item.updatedAt = now();
      addEvent('dictionary_view', {materialId:source.materialId, sentenceId:sentence.id, itemId:item.itemId}, {knownBefore:item.priorKnowledge, understandingStatus:progress.understandingStatus});
      recalculateMastery(item.itemId);
      return item.itemId;
    });
  }
  function setPriorKnowledge(itemId, value) {
    commit(() => {
      const item = state.libraryItems[itemId]; if (!item) return;
      item.priorKnowledge = value; item.updatedAt = now();
      recalculateMastery(itemId);
      addEvent('prior_knowledge_set', {itemId}, {knownBefore:value === 'known'});
    });
  }
  function setSentenceStatus(sentenceId, understandingStatus) {
    commit(() => {
      const progress = ensureSentenceProgress(sentenceId);
      progress.understandingStatus = understandingStatus; progress.updatedAt = now();
      const affected = new Set();
      Object.values(state.encounters).filter(e => e.materialId === MATERIAL.id && e.sentenceId === sentenceId).forEach(e => { e.understandingStatus = understandingStatus; affected.add(e.itemId); });
      affected.forEach(recalculateMastery);
      addEvent('sentence_understanding_set', {materialId:MATERIAL.id, sentenceId}, {understandingStatus});
    });
  }
  function setTranscriptVisible(sentenceId, visible) {
    const old = getSentenceProgress(sentenceId).transcriptVisible;
    commit(() => { const progress = ensureSentenceProgress(sentenceId); progress.transcriptVisible = visible; progress.updatedAt = now(); if (visible && !old) addEvent('transcript_revealed', {materialId:MATERIAL.id, sentenceId}); });
  }
  function toggleItemSaved(itemId) {
    return commit(() => {
      const item = state.libraryItems[itemId]; if (!item) return false;
      item.saved = !item.saved; item.savedAt = item.saved ? now() : null; item.updatedAt = now();
      addEvent(item.saved ? 'item_saved' : 'item_unsaved', {itemId});
      return item.saved;
    });
  }
  function toggleSentenceSaved(sentenceId) {
    return commit(() => {
      const progress = ensureSentenceProgress(sentenceId); progress.saved = !progress.saved; progress.savedAt = progress.saved ? now() : null; progress.updatedAt = now();
      addEvent(progress.saved ? 'sentence_saved' : 'sentence_unsaved', {materialId:MATERIAL.id, sentenceId});
      return progress.saved;
    });
  }
  function setCurrentSentence(sentenceId) {
    commit(() => { state.materialProgress[MATERIAL.id] = {currentSentenceId:sentenceId, lastOpenedAt:now()}; });
  }
  function exportState() {
    const payload = JSON.stringify(state, null, 2);
    const blob = new Blob([payload], {type:'application/json'});
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `FocusEnglish_backup_${new Date().toISOString().slice(0,10)}.json`; link.style.display = 'none'; document.body.appendChild(link); link.click(); setTimeout(() => { URL.revokeObjectURL(link.href); link.remove(); }, 0);
  }
  function replaceState(raw) {
    if (!raw || raw.schemaVersion !== 1 || !raw.libraryItems || !raw.encounters || !Array.isArray(raw.learningEvents)) throw new Error('unsupported');
    state = {...blankState(), ...raw, updatedAt:now()}; persist();
  }
  function newTrainingTrack() {
    return {lastTrainedAt:null, lastSuccessfulAt:null, nextReviewAt:null, reviewStage:0, correctCount:0, incorrectCount:0, lastResult:null};
  }
  function normaliseTrainingTrack(track) {
    const fallback = newTrainingTrack();
    const current = track || {};
    return {...fallback, ...current, correctCount:current.correctCount ?? current.correct ?? 0, incorrectCount:current.incorrectCount ?? current.incorrect ?? 0, lastTrainedAt:current.lastTrainedAt ?? current.lastAttemptAt ?? null};
  }
  function trainingRecord(itemId) {
    if (!state.trainingRecords) state.trainingRecords = {};
    if (!state.trainingRecords[itemId]) state.trainingRecords[itemId] = {itemId, listening:newTrainingTrack(), expression:newTrainingTrack()};
    const record = state.trainingRecords[itemId];
    record.listening = normaliseTrainingTrack(record.listening);
    record.expression = normaliseTrainingTrack(record.expression);
    return record;
  }
  function calendarDay(value) {
    const date = new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  function addReviewDays(from, days) {
    const date = new Date(from);
    date.setDate(date.getDate() + days);
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }
  function isDue(track, at = now()) { return !track.nextReviewAt || new Date(track.nextReviewAt).getTime() <= new Date(at).getTime(); }
  function reviewText(track) {
    if (!track?.nextReviewAt) return '尚未安排';
    const due = new Date(track.nextReviewAt); const current = new Date();
    return due.getTime() <= current.getTime() ? '今日待复习' : `${shortDate(track.nextReviewAt)} 复习`;
  }
  function recordTrainingAttempt(itemId, mode, correct, answer) {
    return commit(() => {
      const attemptedAt = now(); const record = trainingRecord(itemId); const track = record[mode];
      const wasDue = isDue(track, attemptedAt);
      const sameSuccessDay = track.lastSuccessfulAt && calendarDay(track.lastSuccessfulAt) === calendarDay(attemptedAt);
      track.lastTrainedAt = attemptedAt; track.lastResult = correct ? 'correct' : 'incorrect';
      const mastery = state.masteryStates[itemId] || {itemId, reading:'encountered', listening:'not_started', activeUse:'not_started'};
      const masteryKey = mode === 'listening' ? 'listening' : 'activeUse';
      if (correct) {
        track.correctCount += 1;
        if (!track.lastSuccessfulAt) {
          track.lastSuccessfulAt = attemptedAt;
          track.reviewStage = 0;
          track.nextReviewAt = addReviewDays(attemptedAt, REVIEW_INTERVAL_DAYS[0]);
          mastery[masteryKey] = 'activating';
        } else if (wasDue && !sameSuccessDay) {
          track.lastSuccessfulAt = attemptedAt;
          track.reviewStage = Math.min(track.reviewStage + 1, REVIEW_INTERVAL_DAYS.length - 1);
          track.nextReviewAt = addReviewDays(attemptedAt, REVIEW_INTERVAL_DAYS[track.reviewStage]);
          mastery[masteryKey] = 'activated';
        }
      } else {
        track.incorrectCount += 1;
        track.reviewStage = 0;
        track.nextReviewAt = addReviewDays(attemptedAt, REVIEW_INTERVAL_DAYS[0]);
        mastery[masteryKey] = 'activating';
      }
      mastery.updatedAt = attemptedAt; state.masteryStates[itemId] = mastery;
      addEvent('output_attempt', {itemId}, {mode, correct, answer, wasDue, sameSuccessDay:!!sameSuccessDay, reviewStage:track.reviewStage, nextReviewAt:track.nextReviewAt});
      return {...track, mastery};
    });
  }
  function translationProgress(sentenceId) {
    if (!state.translationProgress) state.translationProgress = {};
    return state.translationProgress[sentenceId] || {sentenceId, answer:'', submittedAt:null};
  }
  function practiceProgress(questionId) {
    if (!state.practiceProgress) state.practiceProgress = {};
    return state.practiceProgress[questionId] || {questionId, selected:null, submittedAt:null, isCorrect:null};
  }
  function savePractice(question, patch) {
    return commit(() => {
      if (!state.practiceProgress) state.practiceProgress = {};
      const next = {...practiceProgress(question.id), ...patch};
      state.practiceProgress[question.id] = next;
      if (patch.submittedAt) addEvent('practice_submitted', {materialId:MATERIAL.id, sentenceId:question.evidence_sentence_ids?.[0]}, {questionId:question.id, selected:next.selected, correct:next.isCorrect, kind:question.kind || 'choice'});
      return next;
    });
  }
  function saveTranslation(sentenceId, patch) {
    return commit(() => {
      if (!state.translationProgress) state.translationProgress = {};
      state.translationProgress[sentenceId] = {...translationProgress(sentenceId), ...patch};
      return state.translationProgress[sentenceId];
    });
  }

  let index = Math.max(0, sentences.findIndex(s => s.id === getMaterialProgress().currentSentenceId));
  let loop = false, segmentMode = true, currentEnd = null, currentDictionaryIndex = null;
  let libraryTab = 'word', selectedLibraryKey = null;
  let outputMode = 'listening', outputIndex = 0, outputResult = null, manualOutputItemId = null, translationIndex = 0, examTranslationIndex = 0, practiceIndex = 0, practiceMode = 'reading';
  let selectedPracticeExamId = localStorage.getItem('fe_selected_practice_exam_v1') || PUBLISHED_EXAMS[0]?.examId || PRACTICE_EXAMS[0]?.examId || null;
  const activePracticeExam = () => PRACTICE_EXAMS.find(exam => exam.examId === selectedPracticeExamId) || PRACTICE_EXAMS[0];
  const moduleStateKey = mode => mode === 'listening' ? 'listeningPractice' : mode === 'reading' ? 'readingC' : mode;
  const moduleStateFor = (exam, mode) => exam?.modules?.[moduleStateKey(mode)] || {status:'unavailable', reason:'该板块资料尚未导入'};
  const moduleDisplayed = (exam, mode) => !moduleStateFor(exam, mode).displayHidden;
  const moduleContentFor = (exam, mode) => moduleDisplayed(exam, mode) && moduleStateFor(exam, mode).status === 'ready' ? exam?.publishedModules?.[mode] || null : null;
  const hasUsableModuleContent = (exam, mode) => { const module = moduleContentFor(exam, mode); return Boolean(mode === 'writing' || mode === 'translation' ? module?.task : module?.questions?.length); };
  const displayedPracticeModes = () => ['listening','reading','readingA','readingB','translation','writing'].filter(mode => moduleDisplayed(activePracticeExam(), mode));
  const practiceExamOptions = () => practiceMode === 'listening' ? PRACTICE_EXAMS.filter(exam => moduleDisplayed(exam, 'listening')) : PRACTICE_EXAMS;
  const availablePracticeModes = () => displayedPracticeModes().filter(mode => moduleStateFor(activePracticeExam(), mode).status === 'ready' && hasUsableModuleContent(activePracticeExam(), mode));
  const ensurePracticeMode = () => {
    // An independent version can be visible while its questions are still
    // withheld. Keep that selection in Listening instead of switching to
    // Reading and reintroducing the all-exam picker.
    if (practiceMode === 'listening' && moduleDisplayed(activePracticeExam(), 'listening')) return;
    if (!availablePracticeModes().includes(practiceMode)) practiceMode = availablePracticeModes()[0] || 'reading';
  };
  const allPracticeQuestions = () => PRACTICE_EXAMS.flatMap(exam => ['listening','reading','readingA','readingB'].flatMap(mode => moduleContentFor(exam, mode)?.questions || []));
  const audio = byId('audio');
  const practiceAudioTimes = {};
  const playBtn = byId('playBtn');
  const replayBtn = byId('replayBtn');
  const loopBtn = byId('loopBtn');
  const speed = byId('speed');
  const showText = byId('showText');
  const sentenceText = byId('sentenceText');
  const sentenceHidden = byId('sentenceHidden');
  const counter = byId('counter');
  const evidence = byId('evidence');
  const hintText = byId('hintText');
  const toast = byId('toast');
  const msg = text => { toast.textContent = text; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 1600); };

  function renderSentenceText(text) {
    const phraseMatches = [];
    dictionary.filter(d => d.type === 'phrase').forEach(d => {
      const di = dictionary.indexOf(d); const forms = d.forms?.length ? d.forms : [d.headword];
      forms.forEach(form => {
        const phraseWords = form.split(/\s+/).map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const escaped = phraseWords.map((word, wordIndex) => wordIndex === 0 && !d.forms?.length && word.length > 2 ? `${word}(?:s|ed|ing)?` : word).join('\\s+');
        const re = new RegExp(`\\b${escaped}\\b`, 'ig'); let match;
        while ((match = re.exec(text)) !== null) phraseMatches.push({start:match.index, end:match.index + match[0].length, di, type:'phrase', known:true, surface:match[0]});
      });
    });
    phraseMatches.sort((a,b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
    const chosenPhrases = []; let phraseEnd = -1;
    phraseMatches.forEach(match => { if (match.start >= phraseEnd) { chosenPhrases.push(match); phraseEnd = match.end; } });
    const terms = [...chosenPhrases]; const wordMap = new Map(dictionary.filter(d => d.type === 'word').map(d => [d.headword.toLowerCase(), dictionary.indexOf(d)]));
    const wordRe = /\b[A-Za-z]+(?:['’][A-Za-z]+)?\b/g; let word;
    while ((word = wordRe.exec(text)) !== null) {
      const start = word.index, end = start + word[0].length;
      if (chosenPhrases.some(phrase => start < phrase.end && end > phrase.start)) continue;
      const surface = word[0]; const di = wordMap.get(surface.toLowerCase());
      const lemma = lemmaFor(surface);
      terms.push({start, end, di:di ?? -1, type:'word', known:Boolean(baseEntries[lemma] || di !== undefined), surface});
    }
    terms.sort((a,b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
    let output = '', position = 0;
    terms.forEach(term => { output += escapeHtml(text.slice(position, term.start)); output += `<span class="term ${term.known ? 'known' : 'unresolved'}" tabindex="0" role="button" data-di="${term.di}" data-type="${term.type}" data-surface="${escapeHtml(term.surface || text.slice(term.start, term.end))}">${escapeHtml(text.slice(term.start, term.end))}</span>`; position = term.end; });
    return output + escapeHtml(text.slice(position));
  }
  function renderLearn() {
    const sentence = sentences[index]; const progress = getSentenceProgress(sentence.id);
    counter.textContent = `${index + 1} / ${sentences.length}`;
    const showing = Boolean(progress.transcriptVisible);
    sentenceText.style.display = showing ? 'block' : 'none'; sentenceHidden.style.display = showing ? 'none' : 'grid';
    showText.textContent = showing ? '隐藏文本' : '显示文本';
    hintText.textContent = showing ? '点击任意单词；拖选两个或更多连续单词可查询词组。' : 'Hint 尚未展开';
    sentenceText.innerHTML = renderSentenceText(sentence.text);
    evidence.innerHTML = sentence.question_evidence.length ? `<span class="evidence">⚑ ${sentence.question_evidence.map(q => `Q${q}`).join(' / ')} Evidence</span>` : '';
    document.querySelectorAll('.state-btn').forEach(button => button.classList.toggle('selected', button.dataset.state === progress.understandingStatus));
    byId('saveSentence').textContent = progress.saved ? '★ 已收藏句子' : '♡ 收藏句子';
    playBtn.textContent = '▶';
    setCurrentSentence(sentence.id);
  }
  // `ready` was absent from the earliest generated library files.  Treat only
  // an explicit false as unavailable so verified legacy material stays usable.
  const EXTERNAL_LEARN_MATERIALS = Array.isArray(window.FOCUS_ENGLISH_LEARN_MATERIALS) ? window.FOCUS_ENGLISH_LEARN_MATERIALS.filter(item => item?.ready !== false && Array.isArray(item.sentences) && item.sentences.length) : [];
  const learnListeningMaterials = () => {
    const seen = new Set();
    return EXTERNAL_LEARN_MATERIALS.filter(item => {
      const exam = EXAM_CATALOG.find(exam => exam.examId === item.examId);
      if (exam?.modules?.listeningLearn?.displayHidden) return false;
      const key = item.audioHash && item.materialId ? `${item.audioHash}:${item.materialId}` : item.id;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
  };
  const listeningMaterialForId = id => learnListeningMaterials().find(item => item.id === id) || null;
  function activateListeningMaterial(material) {
    if (!material) return false;
    const changed = MATERIAL.id !== material.id;
    MATERIAL = {id:material.id, title:material.title, source:material.source};
    sentences = material.sentences;
    if (changed) { index = 0; audio.pause(); segmentMode = true; currentEnd = null; }
    if (material.audioSrc && audio.getAttribute('src') !== material.audioSrc) { audio.src = material.audioSrc; audio.load(); }
    byId('learnCrumb').textContent = `Learn · 精学 / ${MATERIAL.source.replace(' · Section C · Questions 16–18', '')} / ${MATERIAL.title.split(' · ')[0]}`;
    byId('learnMaterialTitle').textContent = MATERIAL.title;
    byId('learnMaterialSource').textContent = MATERIAL.source;
    return true;
  }
  function readingLearnMaterials() {
    return PRACTICE_EXAMS.flatMap(exam => (exam.publishedModules?.reading?.passages || []).filter(passage => exam.modules?.readingC?.status === 'ready' || exam.publishedModules?.reading?.status === 'ready').map(passage => ({
      examId:exam.examId, title:exam.title, year:exam.year, month:exam.month, set:exam.set,
      passage, materialId:`${exam.examId}:${passage.id}`, materialTitle:`${exam.title} · ${passage.label}`,
      source:`${exam.year}.${String(exam.month).padStart(2, '0')} CET-6 · Reading · ${passage.label}`, canPlay:false
    })));
  }
  function translationLearnMaterials() {
    return PRACTICE_EXAMS.flatMap(exam => {
      const task = exam.publishedModules?.translation?.task;
      return exam.modules?.translation?.status === 'ready' && task?.source ? [{exam, task}] : [];
    });
  }
  function cleanTranslationSource(source) {
    return String(source || '').replace(/\r/g, '').replace(/(未得到监考|请于正式|请用黑色|请认真填写|准考证号|错填).*$/s, '').replace(/\s+/g, ' ').trim();
  }
  function translationSentences(task) {
    const source = cleanTranslationSource(task.source);
    return (source.match(/[^。！？；]+[。！？；]?/g) || []).map(text => text.trim()).filter(text => /[\u4e00-\u9fff]/.test(text));
  }
  function renderLearnHub() {
    const listening = learnListeningMaterials();
    const listeningPending = EXAM_CATALOG.filter(exam => !exam.modules?.listeningLearn?.displayHidden && exam.modules?.listeningLearn?.status === 'needsReview');
    const readings = readingLearnMaterials();
    const translations = translationLearnMaterials();
    const list = (items, empty, render) => items.length ? `<div class="learn-material-list">${items.map(render).join('')}</div>` : `<div class="learn-hub-empty">${empty}</div>`;
    const groupedListening = () => {
      if (!listening.length) return '<div class="learn-hub-empty">暂时没有完成逐句资料的听力。</div>';
      const groups = new Map();
      listening.forEach(item => {
        const matched = String(item.id).match(/^cet6_(\d{4})_(\d{2})_set(\d+)_/);
        const key = matched ? `${matched[1]}.${matched[2]} · 第${matched[3]}套` : item.source;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(item);
      });
      return `<div class="learn-material-groups">${[...groups.entries()].sort(([a], [b]) => b.localeCompare(a)).map(([label, items]) => `<details class="learn-material-group" open><summary>${escapeHtml(label)} · ${items.length} 篇</summary><div class="learn-material-list">${items.map(item => `<button class="learn-material-btn" data-learn-listening="${escapeHtml(item.id)}">${escapeHtml(item.title)}<small>${escapeHtml(item.source)} · ${item.sentenceCount} 句</small></button>`).join('')}</div></details>`).join('')}</div>`;
    };
    byId('learnHubGrid').innerHTML = `
      <section class="card learn-hub-card"><div class="learn-hub-icon">🎧</div><h2>听力精学</h2><p>按年份和套数展开；任一材料完成原文与逐句时间轴核验后即刻开放，不等待整套试卷。</p>${groupedListening()}${listeningPending.length ? `<div class="pending-note">已发布 ${listening.length} 篇；另有 ${listeningPending.length} 套精听仍待整理或核验。</div>` : ''}</section>
      <section class="card learn-hub-card"><div class="learn-hub-icon">📖</div><h2>仔细阅读</h2><p>先开放已核验的 Reading Section C：全文阅读、点词/词组、建立 Encounter，并保留题目关联。</p>${list(readings, '尚无已核验的仔细阅读材料。', item => `<button class="learn-material-btn" data-learn-reading="${escapeHtml(item.examId)}|${escapeHtml(item.passage.id)}">${escapeHtml(item.title)} · ${escapeHtml(item.passage.label)}<small>${escapeHtml(item.passage.text.split(/\s+/).length)} words · ${escapeHtml(item.source)}</small></button>`)}</section>
      <section class="card learn-hub-card"><div class="learn-hub-icon">✍️</div><h2>翻译精学</h2><p>从真实的六级中文原文逐句写英文。参考译文只在完成核验导入后显示，绝不由系统臆造。</p>${list(translations, '尚无可用翻译原文。', item => `<button class="learn-material-btn" data-learn-translation="${escapeHtml(item.exam.examId)}">${escapeHtml(item.exam.title)} · Translation<small>${translationSentences(item.task).length} 句 · ${item.task.reference ? '含参考译文' : '参考译文待核验'}</small></button>`)}</section>`;
    byId('learnHubGrid').querySelectorAll('[data-learn-listening]').forEach(button => button.onclick = () => openListeningMaterial(button.dataset.learnListening, 'S01'));
    byId('learnHubGrid').querySelectorAll('[data-learn-reading]').forEach(button => button.onclick = () => { const [examId, passageId] = button.dataset.learnReading.split('|'); goToReadingLearn(examId, passageId); });
    byId('learnHubGrid').querySelectorAll('[data-learn-translation]').forEach(button => button.onclick = () => goToLearnTranslation(button.dataset.learnTranslation));
  }
  function renderReadingLearn() {
    const [examId, passageId] = (location.hash.replace(/^#learn-reading\/?/, '').split('/')).map(decodeURIComponent);
    const reading = readingLearnMaterials().find(item => item.examId === examId && item.passage.id === passageId) || readingLearnMaterials()[0];
    if (!reading) { byId('readingPassageText').innerHTML = '暂无已核验的仔细阅读材料。'; return; }
    const target = byId('readingPassageText');
    byId('readingLearnMeta').textContent = `${reading.title} · ${reading.passage.label} · 原文与题目已核验`;
    target.innerHTML = reading.passage.text.split(/\n\s*\n/).map((paragraph, paragraphIndex) => `<p data-reading-paragraph="${paragraphIndex + 1}">${renderSentenceText(paragraph)}</p>`).join('');
    target.onclick = async event => {
      const term = event.target.closest('.term'); if (!term) return;
      const paragraph = term.closest('[data-reading-paragraph]'); const paragraphId = `P${paragraph?.dataset.readingParagraph || '1'}`;
      const sourceSentence = {id:paragraphId, text:paragraph?.textContent || reading.passage.text};
      openTermDictionary(term, sourceSentence, reading);
    };
    target.onmouseup = () => {
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
        const range = selection.getRangeAt(0);
        if (!target.contains(range.commonAncestorContainer)) return;
        const selected = selection.toString().replace(/\s+/g, ' ').trim().replace(/^[^A-Za-z]+|[^A-Za-z'’]+$/g, '');
        if (!/^[A-Za-z][A-Za-z'’]*(?:\s+[A-Za-z][A-Za-z'’]*)+$/.test(selected)) return;
        const paragraph = range.startContainer.parentElement?.closest?.('[data-reading-paragraph]') || target.querySelector('[data-reading-paragraph]');
        const sourceSentence = {id:`P${paragraph?.dataset.readingParagraph || '1'}`, text:paragraph?.textContent || reading.passage.text};
        const knownPhrase = dictionary.find(entry => entry.type === 'phrase' && entry.headword.toLowerCase() === selected.toLowerCase());
        selection.removeAllRanges();
        showDictionary(knownPhrase ? {...knownPhrase, context:sourceSentence.text, source_sentence:sourceSentence.id, definitionStatus:'seed'} : missingEntry(selected, 'phrase', sourceSentence), reading);
      }, 0);
    };
    byId('backToReadingPractice').onclick = () => { selectedPracticeExamId = reading.examId; practiceMode = 'reading'; practiceIndex = 0; goToPractice(); };
  }
  function renderLearnTranslation() {
    const examId = decodeURIComponent(location.hash.replace(/^#learn-translation\/?/, '').split('/')[0] || '');
    const current = translationLearnMaterials().find(item => item.exam.examId === examId) || translationLearnMaterials()[0];
    if (!current) { byId('learnTranslationArea').innerHTML = '<div class="queue-empty">暂无可用翻译原文。</div>'; return; }
    const parts = translationSentences(current.task); const selectedIndex = Math.max(0, Math.min(Number(location.hash.split('/')[2] || 0), parts.length - 1));
    const segment = {id:`${current.task.id}:s${selectedIndex + 1}`, zh:parts[selectedIndex]}; const progress = translationProgress(segment.id); const submitted = Boolean(progress.submittedAt);
    const submittedCount = parts.filter((_, i) => translationProgress(`${current.task.id}:s${i + 1}`).submittedAt).length;
    byId('learnTranslationMeta').textContent = `${current.exam.title} · Translation · ${parts.length} 句${current.task.reference ? ' · 含参考译文' : ' · 参考译文待核验'}`;
    byId('learnTranslationQueue').innerHTML = `<div class="queue-line"><span>当前句</span><strong>${selectedIndex + 1} / ${parts.length}</strong></div><div class="queue-line"><span>已提交</span><strong>${submittedCount}</strong></div><div class="queue-line"><span>参考译文</span><strong>${current.task.reference ? '提交后显示' : '待核验'}</strong></div>`;
    const reference = submitted ? (current.task.reference ? `<div class="translation-label">参考译文</div><div class="translation-reference">${escapeHtml(current.task.reference)}</div>` : '<div class="translation-reference pending">本套原始资料目前没有经过核验的参考译文；你的本句答案已经保存。</div>') : '';
    byId('learnTranslationArea').innerHTML = `<div class="translation-counter">Sentence ${selectedIndex + 1} · ${escapeHtml(current.exam.title)} · Translation</div><div class="translation-label">中文</div><div class="learn-translation-source">${escapeHtml(segment.zh)}</div><div class="translation-label">你的英文</div><textarea class="translation-input" id="learnTranslationAnswer" placeholder="输入英文译文…" ${submitted ? 'readonly' : ''}>${escapeHtml(progress.answer || '')}</textarea>${reference}<div class="translation-actions"><span style="font-size:12px;color:var(--muted)">${submitted ? '已保存本句译文。' : '提交后保存你的答案。'}</span><div>${submitted ? '<button class="ghost-btn" id="retryLearnTranslation">重写本句</button>' : '<button class="primary-btn" id="submitLearnTranslation">保存本句</button>'} <button class="primary-btn" id="nextLearnTranslation">${selectedIndex < parts.length - 1 ? '下一句 →' : '回到第一句'}</button></div></div>`;
    if (!submitted) byId('submitLearnTranslation').onclick = () => { const answer = byId('learnTranslationAnswer').value.trim(); if (!answer) { msg('先输入英文译文'); return; } saveTranslation(segment.id, {answer, submittedAt:now()}); renderLearnTranslation(); };
    if (submitted) byId('retryLearnTranslation').onclick = () => { saveTranslation(segment.id, {submittedAt:null}); renderLearnTranslation(); };
    byId('nextLearnTranslation').onclick = () => goToLearnTranslation(current.exam.examId, selectedIndex < parts.length - 1 ? selectedIndex + 1 : 0);
  }
  function playCurrent() {
    const sentence = sentences[index]; segmentMode = true; currentEnd = sentence.audio_end_local_sec;
    audio.currentTime = Math.max(0, sentence.audio_start_local_sec); audio.playbackRate = Number(speed.value); audio.play().catch(() => { playBtn.textContent = '▶'; window.dispatchEvent(new CustomEvent('focus:audio-error')); }); playBtn.textContent = '❚❚';
  }
  function playSentence(sentenceId) {
    const targetIndex = sentences.findIndex(s => s.id === sentenceId); if (targetIndex < 0) return;
    index = targetIndex; playCurrent();
  }
  function playFull() {
    segmentMode = false;
    const first = sentences[0]; const last = sentences[sentences.length - 1];
    currentEnd = last.audio_end_local_sec;
    audio.currentTime = Math.max(0, first.audio_start_local_sec);
    audio.playbackRate = Number(speed.value); audio.play().catch(() => { playBtn.textContent = '▶'; window.dispatchEvent(new CustomEvent('focus:audio-error')); }); playBtn.textContent = '❚❚';
  }
  function missingEntry(headword, type, sentence) {
    const label = type === 'phrase' ? '词组' : '单词';
    return {type, headword, zh:`基础词典暂未收录该${label}`, en:'No offline definition is available for this item yet.', context:sentence.text, source_sentence:sentence.id, definitionStatus:'missing'};
  }
  function entryFromBaseDictionary(surface, sentence) {
    const sourceForm = String(surface || '').replace(/’/g, "'"); const lemmaKey = lemmaFor(sourceForm); const raw = baseEntries[lemmaKey];
    if (!raw) return null;
    return {type:'word', headword:raw.lemma || lemmaKey, zh:raw.zh || '暂无中文释义', en:raw.simpleEn || raw.en || 'No English definition is available yet.', ipa:raw.ipa || '', forms:Array.isArray(raw.forms) ? raw.forms : [], related:Array.isArray(raw.related) ? raw.related : [], examples:Array.isArray(raw.examples) ? raw.examples : [], queriedForm:sourceForm, context:sentence.text, source_sentence:sentence.id, definitionStatus:'base', sources:raw.sources || []};
  }
  async function entryFromTerm(term, sentence = sentences[index]) {
    if ((term.dataset.type || 'word') === 'word') await window.FocusDictionary.ensure(term.dataset.surface || term.textContent.trim());
    const di = Number(term.dataset.di);
    if ((term.dataset.type || 'word') === 'word') {
      const baseEntry = entryFromBaseDictionary(term.dataset.surface || term.textContent.trim(), sentence);
      if (baseEntry) return baseEntry;
    }
    if (di >= 0 && dictionary[di]) {
      const entry = dictionary[di];
      return {...entry, context:entry.context || sentence.text, source_sentence:entry.source_sentence || sentence.id, definitionStatus:'seed'};
    }
    return missingEntry(term.textContent.trim(), term.dataset.type || 'word', sentence);
  }
  let termLookupTicket = 0;
  async function openTermDictionary(term, sentence = sentences[index], source) {
    const ticket = ++termLookupTicket;
    try { const entry = await entryFromTerm(term, sentence); if (ticket === termLookupTicket) showDictionary(entry, source); }
    catch (error) { msg(error.message || '词典未下载，请联网重试'); }
  }
  function showDictionary(entry, source = {materialId:MATERIAL.id, materialTitle:MATERIAL.title, source:MATERIAL.source, canPlay:true}) {
    const sentence = {id:entry.source_sentence || sentences[index].id, text:entry.context || sentences[index].text}; const itemId = recordTermView(entry, sentence, source);
    const item = state.libraryItems[itemId]; const mastery = state.masteryStates[itemId];
    byId('dictEmpty').style.display = 'none'; const content = byId('dictContent'); content.style.display = 'block';
    const knowledge = item.priorKnowledge;
    const missing = entry.definitionStatus === 'missing'; const itemLabel = entry.type === 'phrase' ? '词组' : '词';
    const formNote = entry.queriedForm && entry.queriedForm.toLowerCase() !== entry.headword.toLowerCase() ? `当前形式：${escapeHtml(entry.queriedForm)} → <strong>${escapeHtml(entry.headword)}</strong>` : '';
    const formsNote = entry.forms?.length ? entry.forms.slice(0,8).map(form => escapeHtml(typeof form === 'string' ? form : form.form)).join(' · ') : '';
    const relatedNote = entry.related?.length ? entry.related.slice(0,8).map(escapeHtml).join(' · ') : '';
    const exampleNote = entry.examples?.[0] ? escapeHtml(entry.examples[0]) : '';
    content.innerHTML = `
      <div class="dict-head"><div><div class="dict-title">${escapeHtml(entry.headword)}</div><div class="dict-type">${escapeHtml(entry.type)}${entry.ipa ? ` · ${escapeHtml(entry.ipa)}` : ''}</div></div><button class="star ${item.saved ? 'saved' : ''}" id="starBtn">${item.saved ? '★' : '☆'}</button></div>
      ${formNote ? `<div style="font-size:12px;color:var(--muted);margin:-5px 0 12px">${formNote}</div>` : ''}
      <div class="section"><div class="label">${missing ? '本地词典' : '中文'}</div><div class="zh">${escapeHtml(entry.zh)}</div>${missing ? '<div style="color:var(--muted);font-size:12px;margin-top:7px">已创建个人语言库条目和 Encounter；后续可由基础词典或学习词典补充释义。</div>' : ''}</div>
      <div class="section"><div class="label">English Definition</div><div class="en">${escapeHtml(entry.en)}</div></div>
      ${formsNote ? `<div class="section"><div class="label">Forms</div><div class="en">${formsNote}</div></div>` : ''}
      ${relatedNote ? `<div class="section"><div class="label">Word Family / Related</div><div class="en">${relatedNote}</div></div>` : ''}
      ${exampleNote ? `<div class="section"><div class="label">Example</div><div class="context">${exampleNote}</div></div>` : ''}
      <div class="section"><div class="label">当前语境</div><div class="context">${escapeHtml(entry.context)}</div><div style="color:var(--muted);font-size:12px;margin-top:6px">来源 · ${escapeHtml(entry.source_sentence || sentence.id)} / ${escapeHtml(source.materialTitle)}</div></div>
      <div class="section"><div class="label">我的状态</div><div class="status-list"><div class="status"><span>👁 阅读识别</span><span class="badge ${statusClass(mastery.reading)}">${statusLabel(mastery.reading)}</span></div><div class="status"><span>👂 听力识别</span><span class="badge ${statusClass(mastery.listening)}">${statusLabel(mastery.listening)}</span></div><div class="status"><span>✍ 主动表达</span><span class="badge un">${statusLabel(mastery.activeUse)}</span></div></div>
      ${knowledge === null ? `<div class="known-check"><strong>这个${itemLabel}你原本认识吗？</strong><div class="known-actions"><button class="outline-btn" id="knownYes">认识</button><button class="outline-btn" id="knownNo">不熟悉</button></div></div>` : `<div class="known-check">原本判断：<strong>${knowledge === 'known' ? '认识' : '不熟悉'}</strong> <button class="ghost-btn" id="changeKnowledge">修改</button></div>`}</div>
      <div class="dict-actions">${source.canPlay ? '<button class="outline-btn" id="hearContext">▶ 播当前句</button>' : ''}<button class="primary-btn" id="saveTerm">${item.saved ? '已收藏' : '收藏'}</button></div>`;
    const refresh = () => showDictionary(entry, source);
    byId('starBtn').onclick = () => { const saved = toggleItemSaved(itemId); msg(saved ? '已收藏' : '已取消收藏；词条仍保留在 Library'); refresh(); };
    byId('saveTerm').onclick = () => { const saved = toggleItemSaved(itemId); msg(saved ? '已收藏并记录学习状态' : '已取消收藏；词条仍保留在 Library'); refresh(); };
    if (source.canPlay) byId('hearContext').onclick = playCurrent;
    if (knowledge === null) { byId('knownYes').onclick = () => { setPriorKnowledge(itemId, 'known'); msg('已记录：原本认识'); refresh(); }; byId('knownNo').onclick = () => { setPriorKnowledge(itemId, 'unfamiliar'); msg('已记录：词汇学习需要'); refresh(); }; }
    else byId('changeKnowledge').onclick = () => { setPriorKnowledge(itemId, knowledge === 'known' ? 'unfamiliar' : 'known'); msg('原本判断已更新'); refresh(); };
    window.dispatchEvent(new CustomEvent('focus:dictionary', {detail:{headword:entry.headword}}));
  }

  function visibleItems() {
    const query = byId('librarySearch').value.trim().toLowerCase(); const status = byId('statusFilter').value; const sort = byId('sortOrder').value;
    let items = Object.values(state.libraryItems).filter(item => item.type === libraryTab);
    if (query) items = items.filter(item => `${item.headword} ${item.zh} ${item.en}`.toLowerCase().includes(query));
    items = items.filter(item => {
      const mastery = state.masteryStates[item.itemId] || {};
      if (status === 'saved') return item.saved;
      const [axis, value] = status.split(':'); return status === 'all' || mastery[axis === 'active' ? 'activeUse' : axis] === value;
    });
    return items.sort((a,b) => sort === 'az' ? a.headword.localeCompare(b.headword) : sort === 'saved' ? (b.savedAt || '').localeCompare(a.savedAt || '') : lastEncounter(b).localeCompare(lastEncounter(a)));
  }
  function lastEncounter(item) { return item.encounterIds.map(id => state.encounters[id]?.lastSeenAt || '').sort().at(-1) || item.createdAt; }
  function renderOverview() {
    const items = Object.values(state.libraryItems); const sentencesSaved = Object.values(state.sentenceProgress).filter(s => s.materialId === MATERIAL.id && s.saved).length;
    const activating = items.filter(item => state.masteryStates[item.itemId]?.listening === 'activating').length; const saved = items.filter(item => item.saved).length;
    byId('overview').innerHTML = [['Words',items.filter(i => i.type === 'word').length],['Phrases',items.filter(i => i.type === 'phrase').length],['Sentences',sentencesSaved],['听力激活中',activating],['已收藏',saved]].map(([label,value]) => `<div class="card metric"><div class="metric-label">${label}</div><div class="metric-value">${value}</div></div>`).join('');
  }
  function renderFilters() {
    const items = Object.values(state.libraryItems).filter(item => item.type === libraryTab);
    const counts = {all:items.length, saved:items.filter(i => i.saved).length, 'listening:activating':items.filter(i => state.masteryStates[i.itemId]?.listening === 'activating').length, 'reading:recognized':items.filter(i => state.masteryStates[i.itemId]?.reading === 'recognized').length};
    byId('libraryFilter').innerHTML = `<div class="filter-title">筛选</div>${[['all','全部'],['saved','已收藏'],['listening:activating','听力激活中'],['reading:recognized','阅读已识别']].map(([value,label]) => `<button class="filter-btn ${byId('statusFilter').value === value ? 'active' : ''}" data-filter="${value}">${label}<span class="filter-count">${counts[value]}</span></button>`).join('')}`;
    byId('libraryFilter').querySelectorAll('[data-filter]').forEach(button => button.onclick = () => { byId('statusFilter').value = button.dataset.filter; renderLibrary(); });
  }
  function renderLibraryList() {
    const target = byId('libraryItems');
    if (libraryTab === 'mistakes') {
      const questions = allPracticeQuestions(); const mistakes = questions.filter(question => practiceProgress(question.id).submittedAt && practiceProgress(question.id).isCorrect === false);
      target.innerHTML = mistakes.length ? mistakes.map(question => `<button class="library-item ${selectedLibraryKey === `mistake:${question.id}` ? 'active' : ''}" data-mistake="${question.id}"><div class="item-row"><span class="item-name">${question.id} · ${question.id.startsWith('R') ? 'Reading' : 'Listening'}</span><span>×</span></div><div class="item-zh">${escapeHtml(question.prompt)}</div><div class="item-meta"><span class="mini-badge act">待复盘</span></div></button>`).join('') : '<div class="list-empty">还没有错题。<br>Practice 中答错的 Listening / Reading 题会自动出现在这里。</div>';
      target.querySelectorAll('[data-mistake]').forEach(button => button.onclick = () => { selectedLibraryKey = `mistake:${button.dataset.mistake}`; renderLibraryList(); renderLibraryDetail(); }); return;
    }
    if (libraryTab === 'sentence') {
      const entries = Object.values(state.sentenceProgress).filter(p => p.materialId === MATERIAL.id && p.saved).sort((a,b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
      target.innerHTML = entries.length ? entries.map(p => { const s = sentences.find(x => x.id === p.sentenceId); const active = selectedLibraryKey === sentenceKey(p.sentenceId); return `<button class="library-item ${active ? 'active' : ''}" data-sentence="${p.sentenceId}"><div class="item-row"><span class="item-name">${p.sentenceId} · Sentence ${s.order}</span><span>${s.question_evidence.length ? '⚑' : ''}</span></div><div class="item-zh">${escapeHtml(s.text)}</div><div class="item-meta"><span class="mini-badge">${statusLabel(p.understandingStatus || 'not_started')}</span><span>收藏 ${shortDate(p.savedAt)}</span></div></button>`; }).join('') : '<div class="list-empty">还没有收藏句子。<br>在 Learn 点击“收藏句子”后会出现在这里。</div>';
      target.querySelectorAll('[data-sentence]').forEach(button => button.onclick = () => { selectedLibraryKey = sentenceKey(button.dataset.sentence); renderLibraryList(); renderLibraryDetail(); }); return;
    }
    const items = visibleItems();
    target.innerHTML = items.length ? items.map(item => { const mastery = state.masteryStates[item.itemId] || {}; const active = selectedLibraryKey === item.itemId; return `<button class="library-item ${active ? 'active' : ''}" data-item="${escapeHtml(item.itemId)}"><div class="item-row"><span class="item-name">${escapeHtml(item.headword)}</span><span>${item.saved ? '★' : '☆'}</span></div><div class="item-zh">${escapeHtml(item.zh)}</div><div class="item-meta"><span class="mini-badge ${mastery.listening === 'activating' ? 'act' : ''}">👂 ${statusLabel(mastery.listening)}</span><span>最近 ${shortDate(lastEncounter(item))}</span></div></button>`; }).join('') : '<div class="list-empty">没有符合条件的内容。<br>在 Learn 中查看词义即可让内容进入 Library。</div>';
    target.querySelectorAll('[data-item]').forEach(button => button.onclick = () => { selectedLibraryKey = button.dataset.item; renderLibraryList(); renderLibraryDetail(); });
  }
  function renderLibraryDetail() {
    const detail = byId('libraryDetail');
    if (libraryTab === 'mistakes') {
      const id = String(selectedLibraryKey || '').replace('mistake:', ''); const question = [...DATA.questions, ...READING_QUESTIONS].find(item => item.id === id);
      if (!question) { detail.innerHTML = '<div class="detail-empty">选择一道错题，查看正确答案并回到对应精学材料。</div>'; return; }
      const answer = question.choices[question.answer]; const listening = question.evidence_sentence_ids?.[0];
      detail.innerHTML = `<div class="detail-top"><div><div class="detail-title">${question.id}</div><div class="detail-type">${listening ? 'Listening' : 'Reading'}</div></div></div><div class="detail-section"><div class="en">${escapeHtml(question.prompt)}</div></div><div class="detail-section"><div class="label">正确答案</div><div class="zh">${question.answer}. ${escapeHtml(answer)}</div></div><div class="detail-section"><button class="primary-btn" id="reviewMistake">↗ 回到 ${listening ? 'Learn 精听' : 'Learn 精读'}</button></div>`;
      byId('reviewMistake').onclick = () => listening ? goToLearn(listening) : goToReadingLearn(); return;
    }
    if (libraryTab === 'sentence') {
      const progress = Object.values(state.sentenceProgress).find(p => sentenceKey(p.sentenceId) === selectedLibraryKey);
      if (!progress) { detail.innerHTML = '<div class="detail-empty">选择一个收藏句子，查看理解状态、证据题与原句音频。</div>'; return; }
      const sentence = sentences.find(s => s.id === progress.sentenceId);
      detail.innerHTML = `<div class="detail-top"><div><div class="detail-title">${sentence.id}</div><div class="detail-type">${MATERIAL.source}</div></div><span>${sentence.question_evidence.length ? `⚑ ${sentence.question_evidence.map(q => `Q${q}`).join(' / ')}` : ''}</span></div><div class="detail-section"><div class="label">Sentence</div><div class="en">${escapeHtml(sentence.text)}</div></div><div class="detail-section"><div class="label">当时理解状态</div><span class="badge ${statusClass(progress.understandingStatus)}">${statusLabel(progress.understandingStatus || 'not_started')}</span><div style="font-size:12px;color:var(--muted);margin-top:8px">收藏于 ${fullDate(progress.savedAt)}</div></div><div class="detail-section"><div class="detail-actions"><button class="outline-btn" data-play-sentence="${sentence.id}">▶ 播放原句</button><button class="primary-btn" data-deep-link="${sentence.id}">↗ 回到精听</button></div></div>`;
    } else {
      const item = state.libraryItems[selectedLibraryKey];
      if (!item) { detail.innerHTML = '<div class="detail-empty">从中间列表选择一个 Word 或 Phrase。<br><br>详情会显示状态、来源语境与所有 Encounter。</div>'; return; }
      const mastery = state.masteryStates[item.itemId] || {}; const encounters = item.encounterIds.map(id => state.encounters[id]).filter(Boolean).sort((a,b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
      const listeningTrack = trainingRecord(item.itemId).listening; const expressionTrack = trainingRecord(item.itemId).expression;
      detail.innerHTML = `<div class="detail-top"><div><div class="detail-title">${escapeHtml(item.headword)}</div><div class="detail-type">${item.type} · ${item.saved ? '已收藏' : '未收藏'}</div></div><button class="star ${item.saved ? 'saved' : ''}" data-toggle-save="${escapeHtml(item.itemId)}">${item.saved ? '★' : '☆'}</button></div><div class="detail-section"><div class="label">中文</div><div class="zh">${escapeHtml(item.zh)}</div></div><div class="detail-section"><div class="label">English Definition</div><div class="en">${escapeHtml(item.en)}</div></div><div class="detail-section"><div class="label">My Status</div><div class="status-grid"><div class="status-row"><span>👁 Reading</span><span class="badge ${statusClass(mastery.reading)}">${statusLabel(mastery.reading)}</span></div><div class="status-row"><span>👂 Listening</span><span class="badge ${statusClass(mastery.listening)}">${statusLabel(mastery.listening)}</span></div><div class="status-row"><span>✍ Active Use</span><span class="badge ${statusClass(mastery.activeUse)}">${statusLabel(mastery.activeUse)}</span></div></div><div style="font-size:12px;color:var(--muted);margin-top:10px">听力：${reviewText(listeningTrack)} · 第 ${listeningTrack.reviewStage + 1} 阶段<br>表达：${reviewText(expressionTrack)} · 第 ${expressionTrack.reviewStage + 1} 阶段<br>原本判断：${item.priorKnowledge === 'known' ? '认识' : item.priorKnowledge === 'unfamiliar' ? '不熟悉' : '尚未判断'}</div></div><div class="detail-section"><div class="detail-actions"><button class="outline-btn" data-start-training="${escapeHtml(item.itemId)}" ${item.saved && item.definitionStatus !== 'missing' ? '' : 'disabled'}>开始训练</button><span style="font-size:12px;color:var(--muted)">${item.saved ? '已收藏内容可随时主动训练' : '收藏后可随时主动训练'}</span></div></div><div class="detail-section"><div class="label">Encounters (${encounters.length})</div>${encounters.map(e => `<div class="encounter"><div class="encounter-title">${escapeHtml(e.materialTitle || MATERIAL.title)} · ${escapeHtml(e.sentenceId)} · 最近 ${shortDate(e.lastSeenAt)}</div><div class="encounter-text">${escapeHtml(e.sourceText)}</div><div class="encounter-actions">${e.materialId === MATERIAL.id ? `<button class="small-btn" data-play-sentence="${e.sentenceId}">▶ 播放原句</button><button class="small-btn" data-deep-link="${e.sentenceId}">↗ 回到原句</button>` : '<button class="small-btn" data-reading-link="1">↗ 回到阅读原文</button>'}</div></div>`).join('')}</div>`;
    }
    detail.querySelectorAll('[data-play-sentence]').forEach(button => button.onclick = () => { playSentence(button.dataset.playSentence); msg(`正在播放 ${button.dataset.playSentence}`); });
    detail.querySelectorAll('[data-deep-link]').forEach(button => button.onclick = () => goToLearn(button.dataset.deepLink));
    detail.querySelectorAll('[data-reading-link]').forEach(button => button.onclick = goToReadingLearn);
    detail.querySelectorAll('[data-toggle-save]').forEach(button => button.onclick = () => { const saved = toggleItemSaved(button.dataset.toggleSave); msg(saved ? '已收藏' : '已取消收藏；词条仍留在 Library'); renderLibrary(); });
    detail.querySelectorAll('[data-start-training]').forEach(button => button.onclick = () => { if (!button.disabled) goToOutput(button.dataset.startTraining); });
  }
  function renderLibrary() { renderOverview(); renderFilters(); renderLibraryList(); renderLibraryDetail(); }
  function activateTab(tab) { libraryTab = tab; selectedLibraryKey = null; document.querySelectorAll('.library-tab').forEach(button => button.classList.toggle('active', button.dataset.tab === tab)); renderLibrary(); }

  function isFullyActivated(item) {
    const mastery = state.masteryStates[item.itemId] || {};
    return mastery.listening === 'activated' && mastery.activeUse === 'activated';
  }
  function canTrainMode(item, mode) {
    if (item.definitionStatus === 'missing') return false;
    if (!item.saved && isFullyActivated(item)) return false;
    const mastery = state.masteryStates[item.itemId] || {}; const track = trainingRecord(item.itemId)[mode];
    if (mode === 'listening') return mastery.listening === 'activating' || !!track.nextReviewAt;
    return (mastery.listening === 'activated' && mastery.activeUse !== 'activated') || mastery.activeUse === 'activating' || !!track.nextReviewAt;
  }
  function dueItems(mode) {
    return Object.values(state.libraryItems)
      .filter(item => canTrainMode(item, mode))
      .filter(item => isDue(trainingRecord(item.itemId)[mode]))
      .sort((a,b) => (trainingRecord(a.itemId)[mode].nextReviewAt || '').localeCompare(trainingRecord(b.itemId)[mode].nextReviewAt || '') || a.headword.localeCompare(b.headword));
  }
  function sourceForItem(item) {
    const encounter = item.encounterIds.map(id => state.encounters[id]).filter(Boolean).sort((a,b) => b.lastSeenAt.localeCompare(a.lastSeenAt))[0];
    return encounter || null;
  }
  function normaliseAnswer(value) { return String(value || '').toLowerCase().replace(/[’]/g, "'").replace(/[^a-z'\s]/g, '').replace(/\s+/g, ' ').trim(); }
  function blankContext(text, answer) {
    const escaped = answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escapeHtml(text).replace(new RegExp(`${escaped}(?:s)?`, 'ig'), '_____');
  }
  function renderOutputOverview(listeningDue, expressionDue) {
    const pending = Object.values(state.libraryItems).filter(item => item.definitionStatus === 'missing').length;
    byId('outputOverview').innerHTML = [['今日待复习',listeningDue.length + expressionDue.length],['👂 听力识别',listeningDue.length],['🧩 表达激活',expressionDue.length],['待释义自建 Phrase',pending]].map(([label,value]) => `<div class="card metric"><div class="metric-label">${label}</div><div class="metric-value">${value}</div></div>`).join('');
  }
  function renderOutput() {
    const listeningDue = dueItems('listening'); const expressionDue = dueItems('expression');
    const manualItem = manualOutputItemId ? state.libraryItems[manualOutputItemId] : null;
    const manualAllowed = manualItem && manualItem.saved && manualItem.definitionStatus !== 'missing';
    const items = manualAllowed ? [manualItem] : (outputMode === 'listening' ? listeningDue : expressionDue);
    renderOutputOverview(listeningDue, expressionDue);
    byId('outputQueueInfo').innerHTML = `<div class="queue-line"><span>${manualAllowed ? '主动训练' : '今日待复习'}</span><strong>${manualAllowed ? 1 : items.length}</strong></div><div class="queue-line"><span>👂 听力识别</span><strong>${listeningDue.length}</strong></div><div class="queue-line"><span>🧩 表达激活</span><strong>${expressionDue.length}</strong></div><div class="queue-line"><span>当前模式</span><strong>${outputMode === 'listening' ? '听力识别' : '表达激活'}</strong></div>`;
    document.querySelectorAll('.output-tab').forEach(button => button.classList.toggle('active', button.dataset.mode === outputMode));
    const area = byId('trainingArea');
    if (!items.length) { area.innerHTML = `<div class="queue-empty">${outputMode === 'listening' ? '今日没有到期的听力识别复习。' : '今日没有到期的表达激活复习。'}<br><br>已激活且未收藏的项目会退出默认队列；已收藏项目可在 Library 中随时主动训练。</div>`; return; }
    if (outputIndex >= items.length) outputIndex = 0;
    const item = items[outputIndex]; const source = sourceForItem(item); const record = trainingRecord(item.itemId)[outputMode];
    const prompt = outputMode === 'listening' ? '播放来源句后，写出你需要识别的目标词或词组。' : '根据中文释义，写出对应的英文词或词组。';
    const context = source?.sourceText || '该条目暂无可播放的来源句。';
    const exercise = outputMode === 'expression' ? `<div class="training-context">${blankContext(context, item.headword)}</div><div class="training-prompt">中文提示：<strong>${escapeHtml(item.zh)}</strong></div>` : `<div class="training-prompt">${prompt}</div><div class="training-context">来源：${source ? `${MATERIAL.title} · ${source.sentenceId}` : '无来源句'}</div>`;
    const result = outputResult?.itemId === item.itemId && outputResult?.mode === outputMode ? `<div class="result-box ${outputResult.correct ? 'good' : 'bad'}">${outputResult.correct ? '回答正确。' : '这次还不对。'} 正确答案：<strong>${escapeHtml(item.headword)}</strong><br><span style="font-size:12px">累计：${record.correctCount} 次正确，${record.incorrectCount} 次未通过 · ${reviewText(record)} · 第 ${record.reviewStage + 1} 阶段${outputResult.correct && record.reviewStage === 0 ? '。同日连续答对会记录成功，但不会提前升级。' : ''}</span></div>` : '';
    area.innerHTML = `<div class="training-kicker">${manualAllowed ? 'Manual training' : 'Today due'} · ${outputMode === 'listening' ? 'Listening recognition' : 'Expression activation'} · ${item.type}</div><div class="training-term">${outputMode === 'listening' ? '听音识别' : '中文 → 英文'}</div><div style="font-size:12px;color:var(--muted);margin:0 0 12px">下次复习：${reviewText(record)} · 第 ${record.reviewStage + 1} 阶段</div>${exercise}<div class="answer-row"><input class="answer-input" id="trainingAnswer" autocomplete="off" placeholder="输入英文答案"><button class="primary-btn" id="checkAnswer">检查答案</button></div>${result}<div class="training-actions"><button class="outline-btn" id="outputPlay" ${source ? '' : 'disabled'}>▶ 播放来源句</button><div><button class="ghost-btn" id="skipOutput">跳过</button><button class="primary-btn" id="nextOutput">${manualAllowed ? '返回今日队列' : '下一题 →'}</button></div></div>`;
    const check = () => { const input = byId('trainingAnswer'); const answer = input.value; const correct = normaliseAnswer(answer) === normaliseAnswer(item.headword); recordTrainingAttempt(item.itemId, outputMode, correct, answer); outputResult = {itemId:item.itemId,mode:outputMode,correct}; renderOutput(); };
    byId('checkAnswer').onclick = check; byId('trainingAnswer').onkeydown = event => { if (event.key === 'Enter') check(); };
    byId('outputPlay').onclick = () => { if (source) { playSentence(source.sentenceId); msg(`正在播放 ${source.sentenceId}`); } };
    byId('skipOutput').onclick = () => { outputIndex = (outputIndex + 1) % items.length; outputResult = null; renderOutput(); };
    byId('nextOutput').onclick = () => { if (manualAllowed) { goToOutput(); return; } outputIndex = (outputIndex + 1) % items.length; outputResult = null; renderOutput(); };
  }
  function activateOutputMode(mode) { outputMode = mode; outputIndex = 0; outputResult = null; renderOutput(); }

  function renderTranslationQueue() {
    const completed = Object.values(state.translationProgress || {}).filter(progress => progress.submittedAt).length;
    byId('translationQueue').innerHTML = `<div class="queue-line"><span>当前句</span><strong>${translationIndex + 1} / ${sentences.length}</strong></div><div class="queue-line"><span>已提交</span><strong>${completed}</strong></div><div class="queue-line"><span>参考译文</span><strong>提交后显示</strong></div>`;
  }
  function renderTranslation() {
    const sentence = sentences[translationIndex]; const progress = translationProgress(sentence.id); const submitted = Boolean(progress.submittedAt);
    renderTranslationQueue();
    const reference = submitted ? `<div class="translation-label">参考译文</div><div class="translation-reference">${escapeHtml(sentence.text)}</div>` : '';
    byId('translationArea').innerHTML = `<div class="translation-counter">Sentence ${sentence.order} · ${MATERIAL.title}</div><div class="translation-label">中文</div><div class="translation-zh">${escapeHtml(TRANSLATIONS[sentence.id])}</div><div class="translation-label">你的英文</div><textarea class="translation-input" id="translationAnswer" placeholder="输入英文译文…" ${submitted ? 'readonly' : ''}>${escapeHtml(progress.answer || '')}</textarea>${reference}<div class="translation-actions"><div><span style="font-size:12px;color:var(--muted)">${submitted ? '已保存本句译文。' : '提交后显示参考译文。'}</span></div><div>${submitted ? `<button class="ghost-btn" id="retryTranslation">重写本句</button>` : '<button class="primary-btn" id="submitTranslation">提交并查看参考答案</button>'} <button class="primary-btn" id="nextTranslation">${translationIndex < sentences.length - 1 ? '下一句 →' : '回到第一句'}</button></div></div>`;
    if (!submitted) {
      const submit = () => {
        const answer = byId('translationAnswer').value.trim();
        if (!answer) { msg('先输入英文译文'); return; }
        saveTranslation(sentence.id, {answer, submittedAt:now()});
        renderTranslation();
      };
      byId('submitTranslation').onclick = submit;
      byId('translationAnswer').onkeydown = event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') submit(); };
    }
    if (submitted) {
      byId('retryTranslation').onclick = () => { saveTranslation(sentence.id, {submittedAt:null}); renderTranslation(); };
    }
    byId('nextTranslation').onclick = () => { translationIndex = translationIndex < sentences.length - 1 ? translationIndex + 1 : 0; goToTranslation(sentences[translationIndex].id); };
  }
  function renderExamTranslationReview() {
    const segment = EXAM_TRANSLATION_SEGMENTS[examTranslationIndex]; const progress = translationProgress(segment.id); const submitted = Boolean(progress.submittedAt);
    byId('translationQueue').innerHTML = `<div class="queue-line"><span>2025.12 整段翻译</span><strong>${examTranslationIndex + 1} / ${EXAM_TRANSLATION_SEGMENTS.length}</strong></div><div class="queue-line"><span>参考译文</span><strong>提交后显示</strong></div>`;
    byId('translationArea').innerHTML = `<div class="translation-counter">2025.12 CET-6 · Translation 逐句复盘</div><div class="translation-label">中文</div><div class="translation-zh">${escapeHtml(segment.zh)}</div><div class="translation-label">你的英文</div><textarea class="translation-input" id="translationAnswer" placeholder="输入英文译文…" ${submitted ? 'readonly' : ''}>${escapeHtml(progress.answer || '')}</textarea>${submitted ? `<div class="translation-label">参考译文</div><div class="translation-reference">${escapeHtml(segment.en)}</div>` : ''}<div class="translation-actions"><span style="font-size:12px;color:var(--muted)">${submitted ? '已保存本句译文。' : '提交后显示参考译文。'}</span><div>${submitted ? '<button class="ghost-btn" id="retryTranslation">重写本句</button>' : '<button class="primary-btn" id="submitTranslation">提交并查看参考答案</button>'} <button class="primary-btn" id="nextTranslation">${examTranslationIndex < EXAM_TRANSLATION_SEGMENTS.length - 1 ? '下一句 →' : '回到第一句'}</button></div></div>`;
    if (!submitted) byId('submitTranslation').onclick = () => { const answer = byId('translationAnswer').value.trim(); if (!answer) { msg('先输入英文译文'); return; } saveTranslation(segment.id, {answer, submittedAt:now()}); renderExamTranslationReview(); };
    if (submitted) byId('retryTranslation').onclick = () => { saveTranslation(segment.id, {submittedAt:null}); renderExamTranslationReview(); };
    byId('nextTranslation').onclick = () => { examTranslationIndex = examTranslationIndex < EXAM_TRANSLATION_SEGMENTS.length - 1 ? examTranslationIndex + 1 : 0; goToTranslation('exam-2025'); };
  }
  function questionsForMode() {
    const module = moduleContentFor(activePracticeExam(), practiceMode);
    if (module?.questions) return module.questions;
    if (module?.task) return [module.task];
    return [];
  }
  function passageForQuestion(question) {
    return moduleContentFor(activePracticeExam(), practiceMode)?.passages?.find(passage => passage.id === question.passageId) || null;
  }
  function renderPracticeQueue() {
    ensurePracticeMode();
    const questions = questionsForMode(); const attempted = questions.filter(question => practiceProgress(question.id).submittedAt).length; const correct = questions.filter(question => practiceProgress(question.id).isCorrect === true).length;
    const exam = activePracticeExam(); const labels = {writing:'Writing',listeningPractice:'Listening',listeningLearn:'Listening 精听',readingA:'Reading A',readingB:'Reading B',readingC:'Reading C',translation:'Translation'};
    const statusText = {ready:'可做题',needsReview:'整理中',unavailable:'资料不足'};
    const versionNote = practiceMode === 'listening' ? `<div class="pending-note">本次考试：${practiceExamOptions().filter(item => item.year === exam.year && item.month === exam.month).length} 套独立听力</div>` : '';
    const moduleRows = Object.entries(labels).filter(([key]) => !exam.modules?.[key]?.displayHidden).map(([key,label]) => { const item = exam.modules?.[key] || {status:'unavailable',reason:'资料尚未导入'}; const marker = item.status === 'ready' ? '✓' : item.status === 'needsReview' ? '…' : '—'; return `<div class="queue-line" title="${escapeHtml(item.reason)}"><span>${escapeHtml(label)}</span><strong>${marker} ${statusText[item.status]}${item.status === 'ready' && item.coverage && !item.coverage.complete ? ` · ${item.coverage.available}/${item.coverage.expected}` : ''}</strong></div>`; }).join('');
    byId('practiceQueue').innerHTML = `<label class="label">${practiceMode === 'listening' ? '听力版本' : '真题年份'}</label><select class="filter-select" id="practiceYear">${practiceExamOptions().map(item => `<option value="${escapeHtml(item.examId)}" ${item.examId === exam.examId ? 'selected' : ''}>${escapeHtml(item.title)}</option>`).join('')}</select>${versionNote}<div class="filter-title" style="margin-top:18px">板块状态</div>${moduleRows}${questions.length ? `<div class="queue-line"><span>已完成</span><strong>${attempted} / ${questions.length}</strong></div><div class="queue-line"><span>答对</span><strong>${correct}</strong></div>` : ''}`;
    byId('practiceYear').onchange = event => { selectedPracticeExamId = event.target.value; localStorage.setItem('fe_selected_practice_exam_v1', selectedPracticeExamId); ensurePracticeMode(); practiceIndex = 0; goToPractice(); };
  }
  function renderPractice() {
    const previousAudio = byId('practiceAudio');
    if (previousAudio) practiceAudioTimes[previousAudio.dataset.exam] = previousAudio.currentTime;
    ensurePracticeMode();
    const questions = questionsForMode(); if (!questions.length) { renderPracticeQueue(); byId('practiceArea').innerHTML = `<div class="output-tabs">${displayedPracticeModes().map(mode => `<button class="output-tab ${practiceMode === mode ? 'active' : ''}" data-practice-mode="${mode}" ${availablePracticeModes().includes(mode) ? '' : 'disabled'}>${mode === 'listening' ? 'Listening' : mode.startsWith('reading') ? ({reading:'Reading C',readingA:'Reading A',readingB:'Reading B'}[mode]) : mode === 'translation' ? 'Translation' : 'Writing'}</button>`).join('')}</div><div class="queue-empty">该试卷的此模块仍在校验中，暂未发布。<br>Practice 只展示已核验内容。</div>`; byId('practiceArea').querySelectorAll('[data-practice-mode]').forEach(button => button.onclick = () => { practiceMode = button.dataset.practiceMode; practiceIndex = 0; goToPractice(); }); return; } if (practiceIndex >= questions.length) practiceIndex = 0;
    const question = questions[practiceIndex]; if (question.kind === 'writing' || question.kind === 'translation') { renderPublishedTextModule(question); return; } const progress = practiceProgress(question.id); const submitted = Boolean(progress.submittedAt); const correctChoice = question.choices[question.answer]; const readingPassage = practiceMode.startsWith('reading') ? passageForQuestion(question) : null;
    renderPracticeQueue();
    const choices = Object.entries(question.choices).map(([letter, text]) => {
      const selected = progress.selected === letter;
      const classes = ['choice-btn'];
      if (!submitted && selected) classes.push('selected');
      if (submitted && letter === question.answer) classes.push('correct');
      if (submitted && selected && letter !== question.answer) classes.push('wrong');
      return `<button class="${classes.join(' ')}" data-choice="${letter}" ${submitted ? 'disabled' : ''}><span class="choice-letter">${letter}</span><span>${escapeHtml(text)}</span></button>`;
    }).join('');
    const listeningEvidence = question.evidence_sentence_ids?.[0] ? sentences.find(sentence => sentence.id === question.evidence_sentence_ids[0]) : null;
    const canDeepLinkReading = Boolean(readingPassage) && practiceMode === 'reading';
    const review = listeningEvidence ? `<div class="practice-evidence"><div class="label">Evidence · ${listeningEvidence.id}</div><div>${escapeHtml(listeningEvidence.text)}</div><button class="outline-btn" id="goEvidence" style="margin-top:11px">↗ 回到 Learn 精听</button></div>` : `<div class="practice-evidence"><div class="label">Reading Material</div><div>${canDeepLinkReading ? `本题来自 ${escapeHtml(activePracticeExam().title)} · ${escapeHtml(readingPassage?.label || 'Reading')}。` : '本题原文已随该已发布试卷包保存；精读跳转将在对应材料导入 Learn 后启用。'}</div>${canDeepLinkReading ? '<button class="outline-btn" id="goEvidence" style="margin-top:11px">↗ 回到 Learn 精读</button>' : ''}</div>`;
    const result = submitted ? `<div class="practice-result ${progress.isCorrect ? 'good' : 'bad'}">${progress.isCorrect ? '回答正确。' : '这题不对。'} 正确答案：<strong>${question.answer}. ${escapeHtml(correctChoice)}</strong></div>${review}` : '';
    const action = submitted ? `<button class="primary-btn" id="nextPractice">${practiceIndex < questions.length - 1 ? '下一题 →' : '回到第一题'}</button>` : '<button class="primary-btn" id="submitPractice">提交答案</button>';
    const questionPanel = `<div class="question-number">${question.id} · CET-6 ${practiceMode}</div><div class="question-prompt">${escapeHtml(question.prompt)}</div><div class="choice-list">${choices}</div>${result}<div class="practice-actions"><button class="ghost-btn" id="practiceBack" ${practiceIndex === 0 ? 'disabled' : ''}>← 上一题</button>${action}</div>`;
    const readingWorkspace = readingPassage ? `<div class="reading-workspace"><article class="reading-passage"><div class="reading-passage-label">${escapeHtml(readingPassage.label)} · 阅读原文</div><div class="reading-passage-text">${escapeHtml(readingPassage.text)}</div></article><section class="reading-question"><div class="reading-source-note">请先阅读左侧原文，再作答本题。</div>${questionPanel}</section></div>` : questionPanel;
    byId('practiceArea').innerHTML = `<div class="output-tabs">${displayedPracticeModes().map(mode => `<button class="output-tab ${practiceMode === mode ? 'active' : ''}" data-practice-mode="${mode}" ${availablePracticeModes().includes(mode) ? '' : 'disabled'}>${mode === 'listening' ? 'Listening' : mode.startsWith('reading') ? ({reading:'Reading C',readingA:'Reading A',readingB:'Reading B'}[mode]) : mode === 'translation' ? 'Translation' : 'Writing'}</button>`).join('')}</div>${practiceMode === 'listening' && moduleContentFor(activePracticeExam(), 'listening')?.audioSrc ? `<audio id="practiceAudio" data-exam="${escapeHtml(activePracticeExam().examId)}" controls preload="metadata" src="${escapeHtml(moduleContentFor(activePracticeExam(), 'listening').audioSrc)}" style="width:100%;margin-bottom:16px"></audio>` : ''}${readingWorkspace}`;
    const practicePlayer = byId('practiceAudio'); if (practicePlayer) practicePlayer.onloadedmetadata = () => { practicePlayer.currentTime = practiceAudioTimes[activePracticeExam().examId] || 0; };
    if (!submitted) {
      byId('practiceArea').querySelectorAll('[data-choice]').forEach(button => button.onclick = () => { savePractice(question, {selected:button.dataset.choice}); renderPractice(); });
      byId('submitPractice').onclick = () => { const selected = practiceProgress(question.id).selected; if (!selected) { msg('请选择一个答案'); return; } savePractice(question, {submittedAt:now(), isCorrect:selected === question.answer}); renderPractice(); };
    }
    byId('practiceArea').querySelectorAll('[data-practice-mode]').forEach(button => button.onclick = () => { practiceMode = button.dataset.practiceMode; practiceIndex = 0; goToPractice(); });
    const evidenceButton = byId('goEvidence'); if (evidenceButton) evidenceButton.onclick = () => listeningEvidence ? goToLearn(listeningEvidence.id) : goToReadingLearn(activePracticeExam().examId, readingPassage?.id);
    byId('practiceBack').onclick = () => { if (practiceIndex > 0) { practiceIndex -= 1; goToPractice(questions[practiceIndex].id); } };
    const nextButton = byId('nextPractice'); if (nextButton) nextButton.onclick = () => { practiceIndex = practiceIndex < questions.length - 1 ? practiceIndex + 1 : 0; goToPractice(questions[practiceIndex].id); };
  }
  function renderPublishedTextModule(task) {
    const progress = practiceProgress(task.id); const submitted = Boolean(progress.submittedAt); const isTranslationTask = task.kind === 'translation';
    const taskMedia = !isTranslationTask ? (task.media || []).map(media => `<a href="${escapeHtml(media.src)}" target="_blank" rel="noopener"><img src="${escapeHtml(media.src)}" alt="${escapeHtml(media.alt || '原题图片')}" style="display:block;max-width:100%;height:auto;margin:16px 0"></a>`).join('') : '';
    renderPracticeQueue();
    const tabs = displayedPracticeModes().map(mode => `<button class="output-tab ${practiceMode === mode ? 'active' : ''}" data-practice-mode="${mode}" ${availablePracticeModes().includes(mode) ? '' : 'disabled'}>${mode === 'listening' ? 'Listening' : mode.startsWith('reading') ? ({reading:'Reading C',readingA:'Reading A',readingB:'Reading B'}[mode]) : mode === 'translation' ? 'Translation' : 'Writing'}</button>`).join('');
    const source = isTranslationTask ? `<div class="translation-label">中文原文</div><div class="translation-reference">${escapeHtml(task.source)}</div>` : `<div class="translation-label">作文题目</div><div class="translation-reference">${escapeHtml(task.prompt)}</div>`;
    const reference = submitted ? task.reference ? `<div class="translation-label">参考答案</div><div class="translation-reference">${escapeHtml(task.reference)}</div>` : `<div class="pending-note">本题已保存你的答案；当前资料未包含可发布的参考答案。</div>` : '';
    byId('practiceArea').innerHTML = `<div class="output-tabs">${tabs}</div><div class="question-number">${isTranslationTask ? 'Part IV · Translation' : 'Part I · Writing'}</div><div class="question-prompt">${isTranslationTask ? '将下列中文译成英语。' : '请按题目要求完成作文。'}</div>${source}${taskMedia}<div class="translation-label">你的英文答案</div><textarea class="translation-input" id="practiceTextAnswer" placeholder="输入英文答案…" ${submitted ? 'readonly' : ''}>${escapeHtml(progress.answer || '')}</textarea>${reference}<div class="practice-actions"><span style="font-size:12px;color:var(--muted)">${submitted ? '答案已保存在本地。' : '提交后保存你的答案。'}</span>${submitted ? '<button class="ghost-btn" id="retryPracticeText">重写</button>' : '<button class="primary-btn" id="submitPracticeText">保存答案</button>'}</div>`;
    byId('practiceArea').querySelectorAll('[data-practice-mode]').forEach(button => button.onclick = () => { practiceMode = button.dataset.practiceMode; practiceIndex = 0; goToPractice(); });
    if (!submitted) byId('submitPracticeText').onclick = () => { const answer = byId('practiceTextAnswer').value.trim(); if (!answer) { msg('先输入英文答案'); return; } savePractice(task, {answer, submittedAt:now(), isCorrect:null}); renderPublishedTextModule(task); };
    if (submitted) byId('retryPracticeText').onclick = () => { savePractice(task, {submittedAt:null}); renderPublishedTextModule(task); };
  }
  function renderPracticeWriting() {
    const task = practiceMode === 'translation' ? EXAM_TRANSLATION : WRITING_TASK; const progress = practiceProgress(task.id); const submitted = Boolean(progress.submittedAt);
    renderPracticeQueue();
    const intro = practiceMode === 'translation' ? `<div class="question-number">Part IV · Translation</div><div class="question-prompt">将下列段落译成英语。</div><div class="translation-reference">${escapeHtml(task.source)}</div>` : `<div class="question-number">Part I · Writing</div><div class="question-prompt">Write an essay of 150–200 words. Begin with the sentence below.</div><div class="translation-reference">${escapeHtml(task.prompt)}</div>`;
    const reference = submitted ? `<div class="translation-label">参考答案</div><div class="translation-reference">${escapeHtml(task.reference)}</div>${practiceMode === 'translation' ? '<button class="outline-btn" id="reviewTranslation" style="margin-top:12px">↗ 进入逐句复盘</button>' : ''}` : '';
    byId('practiceArea').innerHTML = `<div class="output-tabs"><button class="output-tab" data-practice-mode="listening">Listening</button><button class="output-tab" data-practice-mode="reading">Reading</button><button class="output-tab ${practiceMode === 'translation' ? 'active' : ''}" data-practice-mode="translation">Translation</button><button class="output-tab ${practiceMode === 'writing' ? 'active' : ''}" data-practice-mode="writing">Writing</button></div>${intro}<div class="translation-label">你的答案</div><textarea class="translation-input" id="practiceTextAnswer" placeholder="输入你的英文答案…" ${submitted ? 'readonly' : ''}>${escapeHtml(progress.answer || '')}</textarea>${reference}<div class="practice-actions"><span style="font-size:12px;color:var(--muted)">${submitted ? '答案已保存在本地。' : '提交后显示参考答案。'}</span>${submitted ? '<button class="ghost-btn" id="retryPracticeText">重写</button>' : '<button class="primary-btn" id="submitPracticeText">保存并查看参考答案</button>'}</div>`;
    byId('practiceArea').querySelectorAll('[data-practice-mode]').forEach(button => button.onclick = () => { practiceMode = button.dataset.practiceMode; practiceIndex = 0; goToPractice(); });
    if (!submitted) byId('submitPracticeText').onclick = () => { const answer = byId('practiceTextAnswer').value.trim(); if (!answer) { msg('先输入答案'); return; } savePractice(task, {answer, submittedAt:now(), isCorrect:null}); renderPracticeWriting(); };
    if (submitted) { byId('retryPracticeText').onclick = () => { savePractice(task, {submittedAt:null}); renderPracticeWriting(); }; const review = byId('reviewTranslation'); if (review) review.onclick = () => goToTranslation('exam-2025'); }
  }
  function metricRows(rows) { return rows.map(([label, value]) => `<div class="progress-row"><span>${escapeHtml(label)}</span><strong>${value}</strong></div>`).join(''); }
  function renderToday() {
    const listeningDue = dueItems('listening').length; const expressionDue = dueItems('expression').length;
    const allPractice = allPracticeQuestions();
    const remainingPractice = allPractice.filter(question => !practiceProgress(question.id).submittedAt).length;
    const unfinishedLearn = sentences.filter(sentence => getSentenceProgress(sentence.id).understandingStatus !== 'understood').length;
    const remainingTranslation = sentences.filter(sentence => !translationProgress(sentence.id).submittedAt).length;
    const currentSentence = getMaterialProgress().currentSentenceId || 'S01';
    const tasks = [
      {kicker:'自动复习', count:listeningDue + expressionDue, text:`听力识别 ${listeningDue} · 表达激活 ${expressionDue}`, label:'开始复习', action:() => goToOutput()},
      {kicker:'Practice 真题', count:remainingPractice, text:`Listening / Reading 还剩 ${remainingPractice} 题未提交`, label:'继续做题', action:() => goToPractice(allPractice.find(question => !practiceProgress(question.id).submittedAt)?.id || 'Q16')},
      {kicker:'精听与翻译', count:unfinishedLearn, text:`未完全理解 ${unfinishedLearn} 句 · 翻译待完成 ${remainingTranslation} 句`, label:'继续学习', action:() => goToLearn(currentSentence)},
      {kicker:'继续学习', count:'▶', text:`从 ${currentSentence} 回到当前材料`, label:'回到 Learn', action:() => goToLearn(currentSentence)}
    ];
    byId('todayGrid').innerHTML = tasks.map((task, index) => `<section class="card today-task"><div class="today-kicker">${task.kicker}</div><div class="today-count">${task.count}</div><div class="today-text">${task.text}</div><button class="${index === 0 ? 'primary-btn' : 'outline-btn'}" data-today-task="${index}">${task.label}</button></section>`).join('');
    byId('todayGrid').querySelectorAll('[data-today-task]').forEach(button => button.onclick = () => tasks[Number(button.dataset.todayTask)].action());
  }
  function renderProgress() {
    const sentenceStates = Object.values(state.sentenceProgress || {}).filter(progress => progress.materialId === MATERIAL.id);
    const items = Object.values(state.libraryItems || {}); const mastery = Object.values(state.masteryStates || {});
    const practice = allPracticeQuestions().map(question => practiceProgress(question.id));
    const listeningPractice = PRACTICE_EXAMS.flatMap(exam => moduleContentFor(exam, 'listening')?.questions || []).map(question => practiceProgress(question.id)); const readingPractice = PRACTICE_EXAMS.flatMap(exam => moduleContentFor(exam, 'reading')?.questions || []).map(question => practiceProgress(question.id)); const mistakes = practice.filter(progress => progress.submittedAt && progress.isCorrect === false).length;
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000; const recent = mastery.filter(item => item.updatedAt && new Date(item.updatedAt).getTime() >= cutoff);
    const cards = [
      {title:'Learn · 精听', rows:[['已标记理解',sentenceStates.filter(s => s.understandingStatus === 'understood').length],['部分理解',sentenceStates.filter(s => s.understandingStatus === 'partial').length],['暂未理解',sentenceStates.filter(s => s.understandingStatus === 'unclear').length],['收藏句子',sentenceStates.filter(s => s.saved).length]]},
      {title:'Library', rows:[['Words',items.filter(item => item.type === 'word').length],['Phrases',items.filter(item => item.type === 'phrase').length],['已收藏',items.filter(item => item.saved).length],['待释义自建 Phrase',items.filter(item => item.definitionStatus === 'missing').length]]},
      {title:'语言状态', rows:[['听力激活中',mastery.filter(m => m.listening === 'activating').length],['听力已激活',mastery.filter(m => m.listening === 'activated').length],['表达激活中',mastery.filter(m => m.activeUse === 'activating').length],['表达已激活',mastery.filter(m => m.activeUse === 'activated').length]]},
      {title:'Translate', rows:[['已提交',sentences.filter(sentence => translationProgress(sentence.id).submittedAt).length],['待完成',sentences.filter(sentence => !translationProgress(sentence.id).submittedAt).length]]},
      {title:'Practice', rows:[['Listening 正确率',`${listeningPractice.filter(p => p.submittedAt).length ? Math.round(listeningPractice.filter(p => p.isCorrect).length / listeningPractice.filter(p => p.submittedAt).length * 100) : 0}%`],['Reading 正确率',`${readingPractice.filter(p => p.submittedAt).length ? Math.round(readingPractice.filter(p => p.isCorrect).length / readingPractice.filter(p => p.submittedAt).length * 100) : 0}%`],['未解决错题',mistakes]]},
      {title:'最近 30 天', rows:[['听力已激活 +',recent.filter(m => m.listening === 'activated').length],['主动表达 +',recent.filter(m => m.activeUse === 'activated').length],['今日待复习',dueItems('listening').length + dueItems('expression').length]]}
    ];
    byId('progressGrid').innerHTML = cards.map(card => `<section class="card progress-card"><h3>${card.title}</h3>${metricRows(card.rows)}</section>`).join('');
  }

  function goToLibrary() { location.hash = '#library'; }
  function goToOutput(itemId = null) { location.hash = itemId ? `#output/${encodeURIComponent(itemId)}` : '#output'; }
  function goToTranslation() { practiceMode = 'translation'; goToPractice(); }
  function examForPracticeQuestion(exams, mode, questionId) {
    return exams.find(exam => {
      const body = exam.publishedModules?.[mode];
      return body?.task?.id === questionId || body?.questions?.some(question => question.id === questionId);
    }) || exams.find(exam => questionId.startsWith(`${exam.examId}_`));
  }
  function goToPractice(questionId = questionsForMode()[practiceIndex]?.id || '') { location.hash = `#practice/${practiceMode}/${encodeURIComponent(questionId)}`; }
  function goToLearnHub() { location.hash = '#learn'; }
  function goToReadingLearn(examId, passageId) { location.hash = `#learn-reading/${encodeURIComponent(examId || '')}/${encodeURIComponent(passageId || '')}`; }
  function goToLearnTranslation(examId, sentenceIndex = 0) { location.hash = `#learn-translation/${encodeURIComponent(examId)}/${sentenceIndex}`; }
  function goToToday() { location.hash = '#today'; }
  function goToProgress() { location.hash = '#progress'; }
  function goToLearn(sentenceId = sentences[index]?.id) { if (MATERIAL.id && sentenceId) location.hash = `#learn/${encodeURIComponent(MATERIAL.id)}/${encodeURIComponent(sentenceId)}`; else goToLearnHub(); }
  function openListeningMaterial(materialId, sentenceId = 'S01') { location.hash = `#learn/${encodeURIComponent(materialId)}/${encodeURIComponent(sentenceId)}`; }
  function applyRoute() {
    const parts = location.hash.replace(/^#/, '').split('/'); if (parts[0] === 'translation') { practiceMode = 'translation'; goToPractice(); return; } const isLibrary = parts[0] === 'library'; const isOutput = parts[0] === 'output'; const isTranslation = false; const isPractice = parts[0] === 'practice'; const isToday = parts[0] === 'today'; const isProgress = parts[0] === 'progress'; const isReadingLearn = parts[0] === 'learn-reading'; const isLearnTranslation = parts[0] === 'learn-translation'; const isListeningLearn = parts[0] === 'learn' && Boolean(parts[1]); const isLearnHub = (parts[0] === 'learn' && !parts[1]) || !parts[0];
    byId('learnHubView').classList.toggle('active', isLearnHub); byId('learnView').classList.toggle('hidden', !isListeningLearn); byId('libraryView').classList.toggle('active', isLibrary); byId('outputView').classList.toggle('active', isOutput); byId('translationView').classList.toggle('active', isTranslation); byId('practiceView').classList.toggle('active', isPractice); byId('todayView').classList.toggle('active', isToday); byId('progressView').classList.toggle('active', isProgress); byId('readingLearnView').classList.toggle('active', isReadingLearn); byId('learnTranslationView').classList.toggle('active', isLearnTranslation);
    const isAnyLearn = isLearnHub || isListeningLearn || isReadingLearn || isLearnTranslation; byId('navLearn').classList.toggle('active', isAnyLearn); byId('navLibrary').classList.toggle('active', isLibrary); byId('navOutput').classList.toggle('active', isOutput); byId('navTranslation').classList.toggle('active', isTranslation); byId('navPractice').classList.toggle('active', isPractice); byId('navToday').classList.toggle('active', isToday); byId('navProgress').classList.toggle('active', isProgress);
    if (isLibrary) { renderLibrary(); return; }
    if (isOutput) { manualOutputItemId = parts[1] ? decodeURIComponent(parts[1]) : null; outputIndex = 0; outputResult = null; renderOutput(); return; }
    if (isTranslation) { const id = decodeURIComponent(parts[1] || ''); if (id === 'exam-2025') { renderExamTranslationReview(); return; } const target = sentences.findIndex(s => s.id === id); if (target >= 0) translationIndex = target; renderTranslation(); return; }
    if (isPractice) {
      const modes = ['listening','reading','readingA','readingB','translation','writing'];
      const hasMode = modes.includes(parts[1]); if (hasMode) practiceMode = parts[1];
      const id = decodeURIComponent(hasMode ? (parts[2] || '') : (parts[1] || ''));
      const routedExam = id ? examForPracticeQuestion(PRACTICE_EXAMS, practiceMode, id) : null;
      if (routedExam) { selectedPracticeExamId = routedExam.examId; localStorage.setItem('fe_selected_practice_exam_v1', selectedPracticeExamId); }
      const target = questionsForMode().findIndex(question => question.id === id);
      if (id && target < 0) { renderPracticeQueue(); byId('practiceArea').innerHTML = '<div class="queue-empty">当前题目尚未通过发布检查。请从试卷选择中查看可用内容。</div>'; return; }
      ensurePracticeMode(); if (target >= 0) practiceIndex = target; renderPractice(); return;
    }
    if (isReadingLearn) { renderReadingLearn(); return; }
    if (isLearnTranslation) { renderLearnTranslation(); return; }
    if (isToday) { renderToday(); return; }
    if (isProgress) { renderProgress(); return; }
    if (isLearnHub) { renderLearnHub(); return; }
    const materialId = isListeningLearn ? decodeURIComponent(parts[1] || '') : '';
    if (isListeningLearn && !activateListeningMaterial(listeningMaterialForId(materialId))) { goToLearnHub(); return; }
    const sentenceId = isListeningLearn ? decodeURIComponent(parts[2] || '') : '';
    const target = sentences.findIndex(s => s.id === sentenceId); if (target >= 0) index = target;
    renderLearn();
  }

  audio.addEventListener('timeupdate', () => {
    if (currentEnd != null && audio.currentTime >= currentEnd) {
      if (loop && segmentMode) playCurrent(); else { audio.pause(); playBtn.textContent = '▶'; }
    }
  });
  audio.addEventListener('pause', () => { if (!loop) playBtn.textContent = '▶'; });
  playBtn.onclick = () => audio.paused ? playCurrent() : audio.pause();
  replayBtn.onclick = playCurrent; byId('fullPlay').onclick = playFull;
  speed.onchange = () => { audio.playbackRate = Number(speed.value); };
  loopBtn.onclick = () => { loop = !loop; loopBtn.textContent = loop ? 'Loop 开启' : 'Loop 关闭'; loopBtn.style.color = loop ? 'var(--primary)' : ''; };
  showText.onclick = () => { const sentence = sentences[index]; const next = !getSentenceProgress(sentence.id).transcriptVisible; setTranscriptVisible(sentence.id, next); renderLearn(); };
  document.querySelectorAll('.state-btn').forEach(button => button.onclick = () => { setSentenceStatus(sentences[index].id, button.dataset.state); renderLearn(); if (button.dataset.state === 'partial') hintText.textContent = '建议再听一次；需要时再展开文本。'; if (button.dataset.state === 'unclear') hintText.textContent = '先重听 → 再看文本 → 判断卡在词汇还是声音识别。'; if (button.dataset.state === 'understood') hintText.textContent = '已记录首次理解情况。'; });
  sentenceText.addEventListener('click', event => { const term = event.target.closest('.term'); if (term) openTermDictionary(term); });
  sentenceText.addEventListener('mouseup', () => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
      const range = selection.getRangeAt(0);
      if (!sentenceText.contains(range.commonAncestorContainer)) return;
      const selected = selection.toString().replace(/\s+/g, ' ').trim().replace(/^[^A-Za-z]+|[^A-Za-z'’]+$/g, '');
      if (!/^[A-Za-z][A-Za-z'’]*(?:\s+[A-Za-z][A-Za-z'’]*)+$/.test(selected)) return;
      const knownPhrase = dictionary.find(entry => entry.type === 'phrase' && entry.headword.toLowerCase() === selected.toLowerCase());
      selection.removeAllRanges();
      showDictionary(knownPhrase ? {...knownPhrase, definitionStatus:'seed'} : missingEntry(selected, 'phrase', sentences[index]));
    }, 0);
  });
  byId('saveSentence').onclick = () => { const saved = toggleSentenceSaved(sentences[index].id); renderLearn(); msg(saved ? '句子已收藏' : '已取消收藏句子'); };
  byId('prevBtn').onclick = () => { if (index > 0) { audio.pause(); index--; goToLearn(sentences[index].id); } };
  byId('nextBtn').onclick = () => { if (index < sentences.length - 1) { audio.pause(); index++; goToLearn(sentences[index].id); } else msg('Recording One 已完成'); };
  byId('navLearn').onclick = goToLearnHub;
  byId('navToday').onclick = goToToday;
  byId('navPractice').onclick = () => goToPractice();
  byId('navTranslation').onclick = () => goToTranslation();
  byId('navOutput').onclick = goToOutput;
  byId('navProgress').onclick = goToProgress;
  byId('libraryTabs').querySelectorAll('[data-tab]').forEach(button => button.onclick = () => activateTab(button.dataset.tab));
  byId('outputTabs').querySelectorAll('[data-mode]').forEach(button => button.onclick = () => activateOutputMode(button.dataset.mode));
  byId('librarySearch').oninput = () => renderLibrary(); byId('statusFilter').onchange = () => renderLibrary(); byId('sortOrder').onchange = () => renderLibrary();
  byId('exportData').onclick = exportState;
  byId('importData').onclick = () => byId('importFile').click();
  byId('importFile').onchange = event => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const imported = JSON.parse(reader.result); if (imported.schemaVersion !== 1) throw new Error('unsupported'); const preview = `备份时间：${fullDate(imported.updatedAt)}\nLibrary Item：${Object.keys(imported.libraryItems || {}).length}\nEncounter：${Object.keys(imported.encounters || {}).length}\nLearning Event：${(imported.learningEvents || []).length}\n\n用此备份替换当前学习数据？`; if (confirm(preview)) { replaceState(imported); selectedLibraryKey = null; currentDictionaryIndex = null; byId('dictContent').style.display = 'none'; byId('dictEmpty').style.display = 'flex'; applyRoute(); msg('学习数据已从备份恢复'); } } catch (_) { alert('该文件不是受支持的 FocusEnglish 学习备份。'); } finally { event.target.value = ''; } }; reader.readAsText(file, 'utf-8'); };
  byId('resetData').onclick = () => { if (!confirm('这会清空当前浏览器中的 FocusEnglish 学习数据。建议先导出备份。确定继续吗？')) return; state = blankState(); persist(); index = 0; selectedLibraryKey = null; currentDictionaryIndex = null; byId('dictContent').style.display = 'none'; byId('dictEmpty').style.display = 'flex'; applyRoute(); msg('当前学习数据已清空'); };
  window.addEventListener('hashchange', applyRoute);
  applyRoute();
})();
