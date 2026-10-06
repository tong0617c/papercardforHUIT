const selector=document.getElementById('trace-contact');
traceHost.contacts().forEach(d=>{const o=document.createElement('option');o.value=d.id;o.textContent=d.name;selector.appendChild(o);});
selector.value=traceCid;selector.onchange=()=>traceHost.switch(selector.value);
const stepper=document.getElementById('dcf-prob-checkin-ck');
function showProbability(){document.getElementById('dcf-prob-checkin-ck-val').value=window.dcfGet()+'%';}
stepper.querySelector('.stp-min').onclick=()=>{traceHost.set(traceCid,'checkin-prob',Math.max(0,window.dcfGet()-5));showProbability();};
stepper.querySelector('.stp-max').onclick=()=>{traceHost.set(traceCid,'checkin-prob',Math.min(100,window.dcfGet()+5));showProbability();};
showProbability();
document.getElementById('trace-notice').onclick=()=>window.open('trace-notice.html','_blank','noopener');
window.openCheckinPage();
document.dispatchEvent(new Event('mochi-restore-done'));
window.traceMode='full';
window.traceShow=function(mode){
  window.traceMode=mode;
  document.body.classList.toggle('trace-half',mode==='half');
  document.documentElement.classList.toggle('trace-half',mode==='half');
  traceHost.backdrop(mode==='half');
  document.getElementById('loc-panel').hidden=true;
  document.getElementById('ck-panel').hidden=true;
  if(mode==='half'){
    document.querySelectorAll('.page').forEach(p=>p.hidden=true);
    window.openCkPanel();
  } else window.openCheckinPage();
};
document.getElementById('ck-loc-entry').addEventListener('click',()=>{
  document.body.classList.remove('trace-half');document.documentElement.classList.remove('trace-half');traceHost.backdrop(false);
});
document.getElementById('loc-back').addEventListener('click',e=>{if(window.traceMode==='half'){e.stopPropagation();window.traceShow('half');}});
