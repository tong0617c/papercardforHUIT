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
  // Append only: existing major-arcana IDs in saved readings stay unchanged.
  const minorSuits = [
    ['权杖', [
      ['热情萌芽','忽然很想约你做一件新鲜的小事。','想靠近的念头还在，让我慢慢找到开始的方式。'],
      ['共同规划','想把你放进下一次出门的计划里，听听你的想法。','对下一步还有点犹豫，想先和你商量清楚。'],
      ['期待远方','期待我们一起看看更远的风景。','计划也许要晚一点，但可以先享受眼前的相处。'],
      ['安稳欢聚','想和你拥有一个能安心放松的小角落。','如果最近少了陪伴，我们找个时间重新聚一聚吧。'],
      ['磨合差异','意见不一样也想好好聊，找到彼此在意的地方。','不想再争输赢了，希望我们能把话说柔软一点。'],
      ['看见努力','你做的那些小努力，我想认真地夸一夸。','没有被及时肯定会失落，但你不必靠表现换取关注。'],
      ['守住立场','我愿意尊重你的坚持，也把自己的想法坦白告诉你。','一直撑着会累，需要的时候可以先放下防备。'],
      ['及时回应','今天很想主动找你，把攒下的话一口气说完。','消息和心情都有些乱，给我一点时间整理再回应。'],
      ['谨慎靠近','有些顾虑还没消失，但我愿意试着再向前一步。','不想带着疲惫硬撑，我们先照顾好自己。'],
      ['分担压力','最近肩上的事情有点多，想和你说说，而不是独自扛着。','想把不属于自己的负担放下来，轻松一点见你。'],
      ['好奇的问候','发现了有趣的事，第一个念头就是分享给你。','想说的话太多反而不知从哪句开始，先问声好吗。'],
      ['热烈行动','想把约定真的安排起来，带你去想去的地方。','热情来的时候容易着急，我会练习先听你的节奏。'],
      ['自在发光','喜欢你自在投入自己喜欢的事的样子。','今天也许缺一点底气，想给彼此温柔的鼓励。'],
      ['坚定投入','想认真推进我们说好的事，用行动回应期待。','不想把自己的安排强加给你，我们一起决定。']
    ]],
    ['圣杯', [
      ['情感流动','有一点柔软的心情，想慢慢分享给你。','感受还没整理清楚，先给心一点安静的空间。'],
      ['彼此回应','想认真听你的心声，也把我的感受交给你。','如果最近没能互相理解，我们从一句真心话重新开始。'],
      ['分享快乐','想和你庆祝生活里那些不起眼的小开心。','热闹过后，也想留一点只属于我们聊天的时间。'],
      ['停下来感受','今天心情有些安静，想慢慢辨认自己真正需要什么。','想试着抬起头，接住身边那些细小的善意。'],
      ['接住失落','有些遗憾还在心里，希望能被耐心听见。','想慢慢把目光从遗憾移开，珍惜还拥有的相处。'],
      ['温柔回忆','想起我们以前聊过的小事，心里会柔软一点。','回忆很珍贵，也想和现在的你创造新的片段。'],
      ['分清心愿','脑海里有好多想一起做的事，想挑一件真正开始。','想从想象里走出来，认真听听你实际需要的回应。'],
      ['寻找需要','想留一点时间想清楚，怎样相处才让我们都舒服。','有些舍不得，也有些犹豫，我想诚实面对自己的感受。'],
      ['知足时刻','和你安静待着的时候，就觉得今天很满足。','想要的再多，也不该忘了照顾眼前真实的心情。'],
      ['日常归属','期待普通的一天里，也有一起吃饭说笑的安心。','不必把生活过成完美的样子，真实相处就很好。'],
      ['柔软表达','有一句小小的喜欢，想有点害羞地告诉你。','不太会表达的时候，也希望能慢慢学着说清楚。'],
      ['浪漫邀请','想认真准备一次小小的邀约，让心意有个落脚处。','漂亮的话说过之后，更想学习把它落实在日常。'],
      ['细腻倾听','你不必急着整理好情绪，我愿意先听你说。','关心彼此的同时，也想给自己的感受留一点位置。'],
      ['平和陪伴','想用稳定的态度回应你，不让一时情绪淹没沟通。','情绪翻涌时我可能需要缓一缓，再温柔地接着聊。']
    ]],
    ['宝剑', [
      ['清晰坦诚','想把含糊的话说清楚，让我们少一点猜测。','还没想明白的事，不想仓促给你一个答案。'],
      ['面对选择','有件事让我犹豫，想听听你的看法再做决定。','不想再躲着难题了，可以陪我把它摊开聊聊吗。'],
      ['承认难过','如果有话让你受伤，我想认真听，而不是急着解释。','想给那些难过一点修复的时间，不催着自己释怀。'],
      ['休息片刻','今天想安静休息一下，等心里有余力再继续聊。','休息之后，想试着重新走进日常，和你说声早安。'],
      ['放下输赢','争执让我看见有些话需要更谨慎地说出口。','不想为了赢一句话失去理解你的机会，我们缓和一下吧。'],
      ['走向平静','想慢慢离开那些让人疲惫的争执，找回平静的相处。','有些旧心结还牵着我，可能需要多一点耐心。'],
      ['诚实与空间','有些想法还在自己整理，但重要的事我愿意坦诚讨论。','不想再绕着心事走，想试着直接说出真正的顾虑。'],
      ['松开束缚','最近像被自己的顾虑困住，想从一个小小的选择开始。','好像终于看见一点余地，想试着按自己的意愿向前走。'],
      ['安放担忧','有时会想太多，想把担心说出来，而不是反复猜测。','想慢慢放过自己，让今晚的心情比昨天轻一点。'],
      ['结束消耗','有些疲惫已经到了尽头，想停止那些反复伤人的方式。','想从难熬的心情里一点点恢复，不要求自己立刻振作。'],
      ['认真了解','对你的想法有很多好奇，想认真问，也认真听。','问得太急可能像试探，我想学习更温和地表达好奇。'],
      ['直率沟通','有些话想直接告诉你，也会留出听你回应的时间。','说话太快容易忽略感受，我想先停一下再开口。'],
      ['清楚的边界','想坦诚说明我的需要，也认真尊重你的边界。','不想用冷淡挡住所有情绪，可以慢慢说出柔软的部分。'],
      ['理性理解','想和你把问题梳理清楚，一起找到公平的办法。','道理说得再多，也需要先看见你的感受。']
    ]],
    ['星币', [
      ['踏实开始','想从一件实际的小事开始，把心意放进生活里。','计划还需要准备，不想随口许下做不到的承诺。'],
      ['安排时间','事情有点多，但想认真为我们的相处留出时间。','最近节奏有些乱，想重新安排，别让彼此一直等。'],
      ['一起经营','喜欢和你一起完成小事，有商有量地慢慢做好。','如果分工不太合适，我们可以重新讨论彼此的需要。'],
      ['安心与珍惜','很珍惜已经拥有的日常，也想守住舒服的节奏。','想松开一点紧张，不把珍惜变成过度控制。'],
      ['困难中的陪伴','状态不太好的时候，也希望能坦诚告诉你我需要什么。','想慢慢接住帮助，也记得生活里还有温暖的地方。'],
      ['互相给予','想让关心来来往往，而不是让一个人一直付出。','如果付出让谁感到勉强，就一起调整到舒服的位置。'],
      ['耐心等待','认真经营的事情需要时间，我愿意看看它慢慢生长。','也想停下来看看，这样的投入是否真的适合我们。'],
      ['日常用心','想一点点了解你的习惯，把关心做得更细致。','不必把相处当作一份必须做满分的作业，轻松一点吧。'],
      ['独立而亲近','喜欢我们各自充实，也愿意分享彼此的生活。','不用靠外在表现证明价值，你可以按自己的节奏生活。'],
      ['长久的日常','想象过踏实的日常，有共同的习惯，也有彼此的空间。','关于长久的期待也许不同，想听你说说真正重视什么。'],
      ['认真学习','想从小事学着更好地相处，慢慢积累了解。','光想还不够，想先完成一件我们说好的小事。'],
      ['稳定行动','不太擅长热闹的表达，但想把答应的事情一件件做好。','日常有点重复了，想为我们留一点小小的新鲜感。'],
      ['细心照料','想关心你有没有吃好、睡好，也分享舒服的小日常。','照顾别人太多会累，我们也记得照顾自己的需要。'],
      ['可靠的心意','想用持续的行动积累信任，让相处越来越踏实。','不想用安排一切来表达关心，也愿意听你的选择。']
    ]]
  ];
  const ranks=['王牌','二','三','四','五','六','七','八','九','十','侍从','骑士','王后','国王'];
  const rankMarks=['ACE','II','III','IV','V','VI','VII','VIII','IX','X','PAGE','KNIGHT','QUEEN','KING'];
  minorSuits.forEach(([suit, meanings]) => meanings.forEach((meaning,i) => cards.push([suit+ranks[i],rankMarks[i],...meaning])));
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
      <div class="tr-stage"><div class="tr-orbit" aria-hidden="true"></div><div id="tr-deck" class="tr-deck" aria-label="待选的牌"></div><p id="tr-status" role="status" aria-live="polite">78 张完整牌组 · 随机正逆位</p><button id="tr-shuffle" class="tr-primary">洗牌，开始传讯</button></div>
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
    $('tr-status').textContent='78 张完整牌组 · 随机正逆位';
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
