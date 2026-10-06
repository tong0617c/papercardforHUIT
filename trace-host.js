// Isolated Mochi UI; data lives inside Mind state so full backups include it.
window.MindTrace = (function () {
  var frame=null, contactId=null, saveTimer=null, desiredMode='full';
  function syncChatButton(){var b=document.getElementById('chatTraceButton');if(b)b.style.display=exists(state.currentChatId)&&(!state.mochiTrace||!state.mochiTrace[state.currentChatId]||state.mochiTrace[state.currentChatId]['checkin-en']!=='0')?'flex':'none';}
  function exists(id){return state.dreams.some(function(d){return d.id===id;});}
  function choose(id){return exists(id)?id:(state.dreams[0]||{}).id;}
  function persist(){clearTimeout(saveTimer);saveTimer=setTimeout(function(){saveState();},80);}
  function flush(){if(saveTimer){clearTimeout(saveTimer);saveTimer=null;saveState();}}
  window.addEventListener('pagehide',flush);
  function bucket(id){
    if(!exists(id))return null;
    if(!state.mochiTrace)state.mochiTrace={};
    if(!state.mochiTrace[id])state.mochiTrace[id]={};
    return state.mochiTrace[id];
  }
  function ensure(id,show){
    id=choose(id);if(!id){if(show)showToast('先在梦角信息里添加一位梦角');return;}
    if(!frame){frame=document.createElement('iframe');frame.id='mindTraceFrame';frame.title='寻踪 · Mochi';frame.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:0;z-index:90;background:#fff;display:none;';document.getElementById('app').appendChild(frame);}
    frame.onload=function(){if(frame.contentWindow.traceShow)frame.contentWindow.traceShow(desiredMode);};
    if(contactId!==id){flush();contactId=id;frame.src='trace.html?contact='+encodeURIComponent(id);}
    else if(show&&frame.contentWindow.traceShow)frame.contentWindow.traceShow(desiredMode);
    if(show)frame.style.display='block';
  }
  function add(id,text,from){
    if(!exists(id))return;
    var msg={from:from,text:escapeHtml(String(text)),time:Date.now(),trace:true};
    if(from==='user')msg.status='read';
    if(state.currentChatId===id){chatMessages.push(msg);state.chatSessions[id]=chatMessages.slice();}
    else {if(!state.chatSessions[id])state.chatSessions[id]=[];state.chatSessions[id].push(msg);}
    persist();
    if(state.currentChatId===id && document.getElementById('pagePrivateChat').classList.contains('active'))renderChatMessages();
    updateAppIconBadges();
  }
  return {
    ensure:ensure,
    boot:function(){if(!frame||!exists(contactId))ensure(state.currentChatId,false);},
    open:function(){desiredMode='full';ensure(choose(state.currentChatId),true);},
    half:function(){if(!exists(state.currentChatId))return;desiredMode='half';ensure(state.currentChatId,true);},
    backdrop:function(half){if(frame)frame.style.background=half?'transparent':'#fff';},
    glow:function(pos){
      if(frame&&frame.style.display!=='none')return;
      var el=document.getElementById('mindTraceGlow');
      if(!el){el=document.createElement('div');el.id='mindTraceGlow';document.getElementById('app').appendChild(el);}
      el.className='mind-trace-fx'+(pos.center?' mind-trace-fx-center':'');el.hidden=false;
      el.style.left=(pos.x*100)+'%';el.style.top=(pos.y*100)+'%';void el.offsetWidth;el.classList.add('mind-trace-fx-show');
      clearTimeout(el._timer);el._timer=setTimeout(function(){el.classList.remove('mind-trace-fx-show');},2000);
    },
    bubble:function(text){
      if(frame&&frame.style.display!=='none')return;
      var el=document.getElementById('mindTraceBubble');
      if(!el){el=document.createElement('div');el.id='mindTraceBubble';el.className='mind-trace-bubble';document.getElementById('app').appendChild(el);}
      el.textContent=text;el.classList.add('mind-trace-bubble-show');clearTimeout(el._timer);el._timer=setTimeout(function(){el.classList.remove('mind-trace-bubble-show');},3000);
    },
    syncChatButton:syncChatButton,
    close:function(){flush();if(frame)frame.style.display='none';},
    switch:function(id){if(exists(id)){desiredMode='full';ensure(id,true);}},
    contacts:function(){return state.dreams.map(function(d){return {id:d.id,name:d.name};});},
    get:function(id,key){var b=bucket(id);if(key==='lbl-partner')return (state.dreams.find(function(d){return d.id===id;})||{}).name||'TA';return b&&Object.prototype.hasOwnProperty.call(b,key)?b[key]:null;},
    set:function(id,key,value){var b=bucket(id);if(!b)return;b[key]=String(value);persist();if(key==='checkin-en')syncChatButton();},
    add:add,
    chat:function(id){if(!exists(id))return;this.close();openChat(id);},
    reset:function(){flush();if(frame){frame.remove();frame=null;}contactId=null;},
    flush:flush
  };
})();
