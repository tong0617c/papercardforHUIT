/* Persist scheduled local replies across suspension and page reloads. */
window.MindReply = (function(){
  const key='mind-reply-checkpoint-v1';let timer=null,ready=false,running=false;
  function live(id){return id.startsWith('group_')?state.groups.some(g=>g.id===id):state.dreams.some(d=>d.id===id);}
  function queue(){return state.pendingReplies||(state.pendingReplies={});}
  function checkpoint(ids){
    state.replyCheckpointAt=Math.max(Date.now(),(state.replyCheckpointAt||0)+1);
    let old={};try{old=JSON.parse(localStorage.getItem(key)||'{}').tails||{};}catch(e){} const tails={};new Set(Object.keys(old).concat(Object.keys(queue()),ids||[])).forEach(id=>{if(live(id))tails[id]=(state.chatSessions[id]||[]).slice(-10);});
    try{localStorage.setItem(key,JSON.stringify({at:state.replyCheckpointAt,pending:queue(),tails}));}catch(e){console.warn('回复恢复快照保存失败，仍使用 IndexedDB',e);}
    saveState();
  }
  function init(){
    try{const c=JSON.parse(localStorage.getItem(key)||'null');if(c&&c.at>(state.replyCheckpointAt||0)){
      state.pendingReplies=c.pending||{};
      Object.entries(c.tails||{}).forEach(([id,tail])=>{if(!live(id))return;const list=state.chatSessions[id]||(state.chatSessions[id]=[]);tail.forEach(m=>{const old=list.find(x=>x.time===m.time&&x.from===m.from&&x.text===m.text&&x.type===m.type&&x.senderId===m.senderId);if(!old)list.push(m);else Object.assign(old,m);});});
      state.replyCheckpointAt=c.at;saveState();
    }}catch(e){console.warn('读取回复恢复快照失败',e);}
    ready=true;setTimeout(tick,0);
  }
  function schedule(){
    const id=state.currentChatId;if(!id||!live(id))return;
    let sender=null;
    if(id.startsWith('group_')){const g=state.groups.find(g=>g.id===id);checkExpiredMutes(g);const candidates=g.memberIds.filter(id=>String(id)!=='user'&&(!g.muteEndsAt||g.muteEndsAt[String(id)]===undefined));const d=state.dreams.find(d=>d.id===candidates[Math.floor(Math.random()*candidates.length)]);if(d)sender={id:d.id,name:d.name,avatar:d.avatar||''};}
    const settings=state.settings||{},now=Date.now();
    const min=Math.max(0,Number(settings.replyMinSec??3)||0),max=Math.max(min,Number(settings.replyMaxSec??7)||0);
    queue()[id]={dueAt:now+(min+Math.random()*(max-min))*1000,readAt:now+1500+Math.random()*2500,typingAt:now+1000+Math.random()*1000,sender,skip:!!(settings.readNoReply&&Math.random()<.1)};
    checkpoint([id]);tick();
  }
  function tick(){
    if(!ready||running)return;clearTimeout(timer);running=true;
    try{
      const now=Date.now();let changed=[];
      for(const [id,job] of Object.entries(queue())){
        if(!live(id)||!Number.isFinite(job.dueAt)){delete queue()[id];changed.push(id);continue;}
        if(job.readAt!==null&&job.readAt<=now){(state.chatSessions[id]||[]).forEach(m=>{if(m.from==='user')m.status='read';});job.readAt=null;changed.push(id);}
        if(job.skip&&job.readAt===null){delete queue()[id];changed.push(id);continue;}
        if(job.skip||job.dueAt>now)continue;
        const before={id:state.currentChatId,dream:state.dream,messages:chatMessages,sender:window.nextReplySender};
        delete queue()[id];
        try{
          state.currentChatId=id;const d=state.dreams.find(d=>d.id===id);if(d)state.dream=Object.assign({},d);
          chatMessages=(state.chatSessions[id]||[]).slice();window.nextReplySender=job.sender;
          dreamReply();saveChatMessages();
        }catch(e){console.error('回复处理失败',e);queue()[id]=Object.assign({},job,{dueAt:Date.now()+5000});}
        finally{state.currentChatId=before.id;state.dream=before.dream;chatMessages=before.messages;window.nextReplySender=before.sender;}
        changed.push(id);
      }
      if(changed.length){checkpoint(changed);loadChatMessages();renderChatMessages();try{updateAppIconBadges();}catch(e){}}
      hideTypingIndicator();const current=queue()[state.currentChatId];
      if(current&&!current.skip&&current.typingAt<=now){window.nextReplySender=current.sender;showTypingIndicator();}
      const times=[];Object.values(queue()).forEach(j=>{if(j.readAt!==null)times.push(j.readAt);if(!j.skip)times.push(j.dueAt);if(j.typingAt>now)times.push(j.typingAt);});
      if(times.length)timer=setTimeout(tick,Math.max(50,Math.min(2147483647,Math.min(...times)-Date.now())));
    }finally{running=false;}
  }
  function cancel(id){delete queue()[id];checkpoint([id]);tick();}
  document.addEventListener('visibilitychange',()=>{if(!ready)return;if(document.hidden)checkpoint();else tick();});
  window.addEventListener('pagehide',()=>{if(ready)checkpoint();});
  window.addEventListener('pageshow',()=>{if(ready)tick();});
  document.addEventListener('resume',()=>{if(ready)tick();});
  return {init,schedule,tick,cancel,clear:()=>{ready=false;clearTimeout(timer);localStorage.removeItem(key);state.pendingReplies={};state.replyCheckpointAt=0;}};
})();
