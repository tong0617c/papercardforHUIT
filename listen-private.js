/* Mind private edition: local listening sessions using Mind's existing audio element. */
window.MindListen=(()=>{
 const $=id=>document.getElementById('lt-'+id),songList=()=>state.musicLibrary.songs,who=id=>state.dreams.find(d=>d.id===id);
 const current=()=>songList()[currentMusicIndex],title=s=>s?.title||s?.fileName||'不限歌曲';
 const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 let selection='',ready=false,timer=0,seen='',mounted=false;
 function data(){return state.musicLibrary.listenRoom||=( {active:'',pending:null,optOut:{},prefs:{},last:{},history:[],favs:{},mine:[]} );}
 function prefs(id){return data().prefs[id]||={allow:true,offers:true,picks:true};}
 function init(){
  const lib=state.musicLibrary;
  if(lib.listenDefaults===1){
   lib.songs=lib.songs.filter(song=>!(/^listen-builtin-[0-4]$/.test(song.id)&&song.dataUrl?.startsWith('listen-music/')));
   delete lib.listenDefaults;
   saveState();
  }
  ready=true;
  tick();
 } function open(id){selection=who(id)?.id||data().active||who(state.currentChatId)?.id||selection;navigateTo('pageMusic');}
 function msg(id,text,extra={}){if(!who(id))return;const a=state.chatSessions[id]||=[];a.push({from:'dream',text,time:Date.now(),...extra});if(state.currentChatId===id){loadChatMessages();renderChatMessages();}}
 function card(m,i){const p=data().pending,waiting=p?.key===m.listenKey&&p.kind==='in';return '<div class="lt-chat-card" data-msg-index="'+i+'"><small>♫ 一起听邀请</small><p>'+esc(m.text)+'</p>'+(waiting?'<button data-lt="yes">一起听</button> <button data-lt="no">先不了</button>':'<span>'+esc(m.listenStatus||'已送出')+'</span>')+'</div>';}
 function finishNote(p,status){const m=(state.chatSessions[p.id]||[]).find(x=>x.listenKey===p.key);if(m)m.listenStatus=status;if(state.currentChatId===p.id){loadChatMessages();renderChatMessages();}}
 function act(id,kind,track,recommendation){if(!who(id)||!prefs(id).allow||data().active||data().pending)return;
 const p={key:crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random(),id,kind,track:track||'',due:kind==='in'?0:Date.now()+6000+Math.random()*9000};if(recommendation)p.recommendation=recommendation;data().pending=p;const song=recommendation||songList().find(s=>s.id===track);
 msg(id,recommendation?'刚听到《'+title(song)+'》（'+song.artist+'），想和你一起听。':kind==='in'?(song?'把《'+title(song)+'》分你一只耳机，要一起听吗？':'耳机留给你一边，要一起听会儿吗？'):(song?'邀请 TA 一起听《'+title(song)+'》':'邀请 TA 一起听，歌曲不限'),{type:'listenInvite',listenKey:p.key,listenStatus:'等待回应',from:kind==='in'?'dream':'user'});saveState();tick();}
 function resolve(p,ok){if(!p||data().pending!==p)return;data().pending=null;finishNote(p,ok?'已加入':'已结束');if(ok&&who(p.id)&&prefs(p.id).allow){data().active=p.id;data().optOut[p.id]=false;seen='';msg(p.id,'我来了，分我一只耳机吧。');const idx=p.recommendation?OnlineMusic.addToLibrary(p.recommendation):songList().findIndex(s=>s.id===p.track);if(p.recommendation)renderMusicList();if(idx>=0&&(idx!==currentMusicIndex||musicPlayer.paused))playMusic(idx);else if(!musicPlayer.paused)playing();}else msg(p.id,p.kind==='in'?'好，那下次再一起听。':'这次想安静一会儿，下次再听吧。');saveState();draw();}
 function tick(){if(!ready)return;clearTimeout(timer);const d=data(),p=d.pending;if(!who(d.active))d.active='';if(p){if(!who(p.id)||!prefs(p.id).allow){d.pending=null;saveState();}else if(p.kind!=='in'){if(Date.now()<p.due)timer=setTimeout(tick,Math.max(20,p.due-Date.now()));else if(p.kind==='later')resolve(p,true);else {const r=Math.random();if(r<.7)resolve(p,true);else if(r<.9){p.kind='later';p.due=Date.now()+40000+Math.random()*40000;finishNote(p,'稍后加入');msg(p.id,'等我一会儿，我忙完就来。');saveState();tick();}else resolve(p,false);}}}draw();}
 let findingSong=false;
 function canOffer(id){
   const d=data();
   return who(id)&&!d.active&&!d.pending&&prefs(id).allow&&prefs(id).offers&&Date.now()-(d.last[id]||0)>=720000;
 }
 async function offer(id){
   if(findingSong||!canOffer(id)||Math.random()>=.05)return;
   const room=data();
   findingSong=true;
   try{
     const song=await OnlineMusic.recommend(room.lastTrack?.[id]);
     if(room!==data()||!canOffer(id))return;
     room.last[id]=Date.now();
     if(song){
       room.lastTrack||={};
       room.lastTrack[id]=song.id;
     }
     act(id,'in',song?.id,song);
   }finally{findingSong=false;}
 }
 function end(){const d=data();if(d.active){d.optOut[d.active]=true;msg(d.active,'这次就听到这里。');d.active='';}if(d.pending){const p=d.pending;d.pending=null;finishNote(p,'已取消');}clearTimeout(timer);seen='';saveState();draw();}
 function playing(){if(!ready||!current())return;const d=data(),id=state.currentChatId;if(!d.active&&!d.pending&&who(id)&&prefs(id).allow&&!d.optOut[id])d.active=id;
 const s=current(),key=[d.active,s.id].join(':');if(seen===key)return;seen=key;d.history.unshift({id:d.active,name:who(d.active)?.name||'自己',title:title(s),time:Date.now()});d.history=d.history.slice(0,200);saveState();draw();}
 function ended(){const d=data(),s=current(),id=d.active;if(!id||!who(id)||!prefs(id).picks||!s)return false;const fav=d.favs[id]||=[];if(Math.random()<.2&&!fav.includes(s.id)){fav.push(s.id);msg(id,'刚才的《'+title(s)+'》我收藏了。');saveState();}
 if(songList().length>1&&Math.random()<.15){const idx=(currentMusicIndex+1+Math.floor(Math.random()*(songList().length-1)))%songList().length;msg(id,'下一首想放《'+title(songList()[idx])+'》。');saveState();playMusic(idx);return true;}draw();return false;}
 function mount(){const room=document.getElementById('listen-room');room.innerHTML='<header><h3>一起听</h3><p id="lt-status" role="status"></p></header><div class="lt-fields"><label>和谁听<select id="lt-person"></select></label><label>邀请曲目<select id="lt-song"></select></label></div><div class="lt-actions"><button id="lt-invite">邀请 TA</button><button id="lt-accept">一起听</button><button id="lt-decline">先不了</button><button id="lt-end">结束一起听</button><button id="lt-fav">收藏当前歌曲</button></div><details><summary>陪听设置、收藏与记录</summary><label><input type="checkbox" id="lt-allow">允许这位梦角陪听</label><label><input type="checkbox" id="lt-offers">允许 TA 在聊天中邀我</label><label><input type="checkbox" id="lt-picks">允许 TA 在曲终选歌、收藏</label><p id="lt-favorites"></p><ol id="lt-history"></ol></details>';
 $('person').onchange=()=>{selection=$('person').value;draw();};$('invite').onclick=()=>act(selection,'out',$('song').value);$('accept').onclick=()=>resolve(data().pending,true);$('decline').onclick=()=>resolve(data().pending,false);$('end').onclick=end;
 for(const k of ['allow','offers','picks'])$(k).onchange=()=>{prefs(selection)[k]=$(k).checked;if(k==='allow'&&!$(k).checked&&(data().active===selection||data().pending?.id===selection))end();saveState();draw();};
 $('fav').onclick=()=>{const s=current();if(!s)return;const a=data().mine,i=a.indexOf(s.id);if(i<0)a.push(s.id);else a.splice(i,1);saveState();draw();};mounted=true;}
 function draw(){if(!ready)return;if(!mounted)mount();const d=data(),p=d.pending,sel=$('person'),songs=songList();if(!who(selection))selection=who(state.currentChatId)?.id||state.dreams[0]?.id||'';
 function options(el,items,value){const mark=JSON.stringify(items);if(el.dataset.items!==mark){el.replaceChildren(...items.map(([id,n])=>new Option(n,id)));el.dataset.items=mark;}el.value=items.some(x=>x[0]===value)?value:(items[0]?.[0]||'');}
 options(sel,state.dreams.map(x=>[x.id,x.name]),selection);options($('song'),[['','不限歌曲'],...songs.map(s=>[s.id,title(s)])],$('song').value);
 const name=who(p?.id||d.active)?.name;$('status').textContent=p?(p.kind==='in'?name+' 邀请你一起听':p.kind==='later'?name+' 稍后加入':'等 '+name+' 回应…'):d.active?'和 '+name+' 一起听 · '+(current()?title(current()):'选一首开始播放'):selection?'选一位梦角，分 TA 一只耳机。':'可以先听歌；添加梦角后即可邀请。';
 $('invite').hidden=!!(d.active||p);$('invite').disabled=!selection||!prefs(selection).allow;$('accept').hidden=$('decline').hidden=p?.kind!=='in';$('end').hidden=!d.active&&(!p||p.kind==='in');$('end').textContent=p?'取消邀请':'结束一起听';$('fav').disabled=!current();$('fav').textContent=d.mine.includes(current()?.id)?'取消收藏':'收藏当前歌曲';
 for(const k of ['allow','offers','picks']){$(k).disabled=!selection;$(k).checked=!!selection&&prefs(selection)[k];}
 const names=ids=>songs.filter(s=>ids.includes(s.id)).map(title).join('、')||'暂无';$('favorites').textContent='我的收藏：'+names(d.mine)+' ｜ TA 的收藏：'+names(d.favs[selection]||[]);$('history').replaceChildren(...d.history.filter(r=>!selection||r.id===selection).slice(0,20).map(r=>{const li=document.createElement('li');li.textContent=r.name+' · '+r.title+' · '+new Date(r.time).toLocaleDateString();return li;}));}
 document.addEventListener('click',e=>{const b=e.target.closest('[data-lt]');if(!b)return;const p=data().pending;if(p?.kind==='in'&&p.id===state.currentChatId)resolve(p,b.dataset.lt==='yes');});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick();});window.addEventListener('pageshow',tick);
 return {init,open,offer,card,draw,playing,ended,newTrack(){seen='';}};
})();
const callControls = document.getElementById('callButtons');
function labelCallControls() {
  const incoming = !!callControls.querySelector('.answer');
  for (const button of callControls.querySelectorAll('button')) {
    const action = button.getAttribute('onclick');
    const labels = {'answerCall()':'接听', 'minimizeCall()':'收起', 'cancelDial()':'取消', 'hangupCall()':incoming ? '拒接' : '挂断'};
    if (labels[action]) button.setAttribute('aria-label', labels[action]);
  }
}
new MutationObserver(labelCallControls).observe(callControls, {childList:true});
labelCallControls();
