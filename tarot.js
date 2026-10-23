/* Local, fictional tarot messages. No network requests or prediction service. */
window.MindTarot = (function () {
  const cards = [
    ['愚者','0','新的开始','想和你尝试一点没做过的小事，哪怕只是换条路散步。','不用急着迈出去，我们可以先把心里的不安说清楚。'],
    ['魔术师','I','主动表达','我想把喜欢变成行动，让你在小事里也能感受到。','有些话还没整理好，但我希望表达得真诚，而不是漂亮。'],
    ['女祭司','II','倾听内心','安静也可以是陪伴。你想说的时候，我愿意认真听。','猜来猜去会累，想知道的事，我们可以温柔地问出口。'],
    ['皇后','III','温柔照顾','想把柔软的日常分给你，也提醒你照顾好自己。','照顾别人之前，也留一点温柔给自己，好吗？'],
    ['皇帝','IV','稳定与边界','我想给你踏实的回应，让靠近不需要一直试探。','我也在学习放松，不用把每件事情都安排得完美。'],
    ['教皇','V','理解与约定','想慢慢了解你的习惯，找到我们都舒服的相处方式。','不必照着别人的样子相爱，我们可以有自己的节奏。'],
    ['恋人','VI','真诚选择','我想好好回应这份靠近，也认真听见你的选择。','有分歧时先别急着下结论，把真正想要的说给我听。'],
    ['战车','VII','向前一步','想向你靠近一点，今天就从一句主动的问候开始。','走得太快的时候，也可以停下来，等心情跟上脚步。'],
    ['力量','VIII','柔软的勇气','不用一直逞强，温柔地承认疲惫也是一种勇敢。','今天如果没什么力气，就允许自己休息，不用证明什么。'],
    ['隐者','IX','独处与思考','我需要一点安静整理心情，也愿意给你同样的空间。','独处久了，也想和你说说话，哪怕只有很短的一句。'],
    ['命运之轮','X','变化与时机','日子会有起伏，想陪你留意那些小小的好转。','计划暂时被打乱也没关系，我们可以重新安排。'],
    ['正义','XI','坦诚与平衡','我希望彼此的感受都被认真对待，不让一个人一直迁就。','也许我们看到的角度不同，可以先听完彼此的解释。'],
    ['倒吊人','XII','换个角度','慢一点也没关系，有些心意需要时间才能说清楚。','如果等待让你难受，就先把注意力还给自己的生活。'],
    ['死神','XIII','结束与更新','想放下那些消耗我们的旧习惯，给新的日常留点位置。','告别熟悉的方式可能不容易，不用逼自己立刻适应。'],
    ['节制','XIV','调和与耐心','想和你找到刚刚好的距离，靠近时安心，独处时也自在。','最近如果有点失衡，我们可以先调整节奏，再继续聊。'],
    ['恶魔','XV','依恋与自由','喜欢不必变成束缚，我也希望你保留自己的世界。','想把紧绷的心放松一点，给彼此更多选择的空间。'],
    ['高塔','XVI','看见真实','意料之外的变化会让人慌张，我们先照顾好当下的感受。','不必把不安一直藏起来，慢慢说出来也许会轻松一点。'],
    ['星星','XVII','希望与修复','想给你一点轻轻的鼓励，今天能做到一点点就很好。','暂时没找到方向也没关系，先从让自己舒服的小事开始。'],
    ['月亮','XVIII','感受与疑惑','有些情绪还模糊，想和你一起分清感受与猜测。','不确定的事情可以问清楚，不用一个人反复揣摩。'],
    ['太阳','XIX','明亮与分享','今天想把开心分给你，也想听听你遇见的小小快乐。','不需要每天都很快乐，平淡的一天也值得被好好度过。'],
    ['审判','XX','回望与回应','想认真回望我们说过的话，把遗漏的回应慢慢补上。','先别苛责过去的自己，能够重新理解，已经是一种进步。'],
    ['世界','XXI','完整与陪伴','喜欢与你分享生活，也希望我们各自都拥有充实的一天。','有些事情还没完成，不妨留个逗号，下次接着说。']
  ];
  const roles=['想对你说','心里的牵挂','此刻的回应'];
  let root, deck=[], picks=[], flipped=[], phase='idle', epoch=0, roundContext=null, saved=false;
  const $=id=>root.querySelector('#'+id);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function random(n){const a=new Uint32Array(1);crypto.getRandomValues(a);return Math.floor(a[0]/4294967296*n);}
  function history(){if(!Array.isArray(state.tarotHistory))state.tarotHistory=[];return state.tarotHistory;}
  function make(){
    root=document.createElement('section');root.id='pageTarot';root.className='page';
    root.innerHTML=`<div class="tr-head"><button id="tr-back" aria-label="返回主页">‹</button><span>塔罗传讯</span><button id="tr-history" aria-label="查看传讯记录">记录</button></div>
      <div class="tr-scroll"><div class="tr-intro"><span class="tr-eyebrow">A LITTLE WHISPER</span><h1>把心事，交给这一刻</h1><p>静下来，想一想你想收到的话。</p></div>
      <div class="tr-form"><label>传讯对象<select id="tr-person"></select></label><label>此刻的心事 <span>选填</span><input id="tr-question" maxlength="120" placeholder="今天，你有什么想对我说的吗？"></label></div>
      <div class="tr-stage"><div class="tr-orbit" aria-hidden="true"></div><div id="tr-deck" class="tr-deck" aria-label="待选的牌"></div><p id="tr-status" role="status" aria-live="polite">22 张大阿尔卡那 · 随机正逆位</p><button id="tr-shuffle" class="tr-primary">洗牌，开始传讯</button></div>
      <div id="tr-slots" class="tr-slots"></div><div id="tr-reading" aria-live="polite"></div>
      <button id="tr-again" class="tr-primary" hidden>再听一组心声</button><p class="tr-note">随机牌意与预设文案组成的虚构互动，仅供娱乐与自我表达。</p></div>
      <dialog id="tr-dialog"><header><h2>传讯记录</h2><button id="tr-close" aria-label="关闭记录">×</button></header><div id="tr-history-list"></div><p>仅保留最近 30 次 · 随完整备份保存</p></dialog>`;
    document.getElementById('app').appendChild(root);
    $('tr-back').onclick=()=>navigateTo('pageHome');
    $('tr-shuffle').onclick=shuffle;$('tr-again').onclick=reset;
    $('tr-history').onclick=showHistory;$('tr-close').onclick=()=>$('tr-dialog').close();
    $('tr-dialog').addEventListener('click',e=>{if(e.target===$('tr-dialog'))$('tr-dialog').close();});
    reset();
  }
  function people(){
    if(phase!=='idle')return;
    const old=$('tr-person').value;
    $('tr-person').innerHTML='<option value="">给此刻的自己</option>'+state.dreams.map(d=>`<option value="${esc(d.id)}">${esc(d.name)}</option>`).join('');
    const id=old||state.currentChatId;
    if(state.dreams.some(d=>d.id===id))$('tr-person').value=id;
  }
  function reset(){
    epoch++;phase='idle';picks=[];flipped=[];saved=false;roundContext=null;
    $('tr-person').disabled=false;$('tr-question').disabled=false;
    $('tr-reading').innerHTML='';$('tr-again').hidden=true;
    $('tr-shuffle').hidden=false;$('tr-shuffle').disabled=false;
    $('tr-status').textContent='22 张大阿尔卡那 · 随机正逆位';
    $('tr-deck').className='tr-deck';$('tr-deck').innerHTML='';
    for(let i=0;i<7;i++){
      const b=document.createElement('button');b.className='tr-back-card';b.type='button';b.disabled=true;b.style.setProperty('--i',i-3);b.setAttribute('aria-label','选择第 '+(i+1)+' 张牌');b.innerHTML='<span aria-hidden="true">✦</span>';b.onclick=()=>pick(i,b);$('tr-deck').appendChild(b);
    }
    $('tr-slots').innerHTML=roles.map((role,i)=>`<div class="tr-slot"><span>${role}</span><button class="tr-flip" id="tr-flip-${i}" disabled aria-label="${role}，等待选牌"><span class="tr-card-inner"><span class="tr-card-back">${i+1}</span><span class="tr-card-front"></span></span></button></div>`).join('');
    people();
  }
  function shuffle(){
    if(phase!=='idle')return;phase='shuffling';const token=++epoch;
    roundContext={personId:$('tr-person').value,name:$('tr-person').selectedOptions[0].textContent,question:$('tr-question').value.trim()};
    $('tr-person').disabled=true;$('tr-question').disabled=true;$('tr-shuffle').disabled=true;
    deck=cards.map((c,i)=>({id:i,reversed:random(2)===1}));
    for(let i=deck.length-1;i>0;i--){const j=random(i+1);[deck[i],deck[j]]=[deck[j],deck[i]];}
    $('tr-status').textContent='正在洗牌，让心慢慢安静下来…';$('tr-deck').classList.add('is-shuffling');
    setTimeout(()=>{if(token!==epoch)return;phase='choosing';$('tr-deck').classList.remove('is-shuffling');$('tr-deck').classList.add('is-ready');$('tr-shuffle').hidden=true;$('tr-status').textContent='凭直觉，选出三张牌（0 / 3）';$('tr-deck').querySelectorAll('button').forEach(b=>b.disabled=false);},matchMedia('(prefers-reduced-motion: reduce)').matches?0:1050);
  }
  function pick(i,button){
    if(phase!=='choosing'||button.disabled||picks.length===3)return;
    const n=picks.length;picks.push(deck[i]);button.disabled=true;button.classList.add('is-picked');
    const flip=$('tr-flip-'+n);flip.classList.add('has-card');
    const c=cards[deck[i].id];flip.querySelector('.tr-card-front').innerHTML=`<span class="tr-number">${c[1]}</span><span class="tr-sigil ${deck[i].reversed?'reversed':''}" aria-hidden="true">✧</span><strong>${c[0]}</strong><small>${deck[i].reversed?'逆位':'正位'}</small>`;
    $('tr-status').textContent=`凭直觉，选出三张牌（${picks.length} / 3）`;
    if(picks.length===3){phase='revealing';$('tr-deck').classList.add('is-complete');$('tr-deck').querySelectorAll('button').forEach(b=>b.disabled=true);$('tr-status').textContent='三张心声已就位，轻点下方牌面翻开';picks.forEach((_,j)=>{const f=$('tr-flip-'+j);f.disabled=false;f.setAttribute('aria-label','翻开'+roles[j]);f.onclick=()=>reveal(j);});}
  }
  function reveal(i){
    if(phase!=='revealing'||flipped.includes(i))return;flipped.push(i);
    const pick=picks[i],c=cards[pick.id],f=$('tr-flip-'+i);
    f.classList.add('is-flipped');f.disabled=true;f.setAttribute('aria-label',roles[i]+'：'+c[0]+'，'+(pick.reversed?'逆位':'正位'));
    const article=document.createElement('article');article.className='tr-message';article.dataset.slot=i;
    article.innerHTML=`<span>${roles[i]} · ${c[0]}${pick.reversed?'逆位':'正位'}</span><h3>${c[2]}</h3><p>${esc(c[pick.reversed?4:3])}</p>`;
    const next=Array.from($('tr-reading').children).find(el=>Number(el.dataset.slot)>i);$('tr-reading').insertBefore(article,next||null);
    if(flipped.length===3){phase='done';$('tr-status').textContent='这一次的心声，已经收好';$('tr-again').hidden=false;
      if(!saved){saved=true;history().unshift({...roundContext,time:Date.now(),cards:picks.map(p=>({...p}))});state.tarotHistory=history().slice(0,30);saveState();}
    }
  }
  function showHistory(){
    $('tr-history-list').innerHTML=history().map(r=>`<article><time>${esc(new Date(r.time).toLocaleString('zh-CN'))}</time><h3>${esc(r.name)}</h3>${r.question?'<p>'+esc(r.question)+'</p>':''}${r.cards.map((p,i)=>{const c=cards[p.id];return c?`<details><summary>${roles[i]} · ${c[0]}${p.reversed?'逆位':'正位'}</summary><p>${esc(c[p.reversed?4:3])}</p></details>`:'';}).join('')}</article>`).join('')||'<p class="tr-empty">还没有传讯记录。翻开三张牌后，会自动收在这里。</p>';
    $('tr-dialog').showModal();
  }
  return {prepare:function(){if(!root)make();people();}};
})();
