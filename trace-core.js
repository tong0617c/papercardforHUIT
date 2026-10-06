/* 寻踪功能移植自 Mochi 字卡 · 小红书 @言序（1842523578）。非商用，保留署名。
原项目：https://github.com/ling233330-star/mochi
适配：Mind 数据、导航与聊天接口。 */
(function(){
const store=window.activeStore();
const toast=window.toast;
function fmtTime(ts){return new Date(ts).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false});}
const DEF_PLACES = ['在家', '在公司', '在咖啡店', '在公园', '在图书馆', '在路上', '在朋友家', '在健身房', '在超市', '在电影院', '在便利店', '在书店', '在地铁上', '在阳台', '在河边', '在小区楼下', '在面包店', '在车站', '在自习室'];
const DEF_ACTIONS = ['刷手机', '看书', '发呆', '听歌', '写东西', '吃零食', '喝奶茶', '散步', '玩游戏', '想你', '看电影', '追剧', '刷视频', '等快递', '收拾房间', '洗衣服', '做饭', '泡茶', '吃水果', '拍照'];
const DEF_CHECK_MSGS = ['想你了', '记得按时吃饭', '今天也很喜欢你', '早点休息', '有空给我回消息', '别太累', '喝水了吗', '今天开心吗', '我今天有点累', '我今天很开心', '我今天有点想你', '我今天有点无聊', '今天过得怎么样', '记得多穿点', '路上注意安全', '晚安'];
const CK_DEF_KEY = 'checkin-cards-default';
function getCkDefault() {
const v = store.get(CK_DEF_KEY);
return v === null ? true : v === '1';
}
function ckList(k, def) {
try {
const v = JSON.parse(store.get('checkin-cards-' + k) || 'null');
if (Array.isArray(v) && v.length) return v;
} catch (e) {}
return def.slice();
}
function ckSaveList(k, list) {
if (window.xyBigWriteBlocked && window.xyBigWriteBlocked(store, 'checkin-cards-' + k, '寻踪字卡库')) return false;
store.set('checkin-cards-' + k, JSON.stringify(list));
return true;
}
function ckCustomList(k) {
try {
const v = JSON.parse(store.get('checkin-cards-' + k) || 'null');
if (Array.isArray(v)) return v;
} catch (e) {}
return [];
}
function ckItems(k) {
try {
const v = JSON.parse(store.get('checkin-cards-' + k) || 'null');
if (Array.isArray(v)) return v.map(x => typeof x === 'string' ? { t: x } : (x && typeof x === 'object' && x.t != null ? x : null)).filter(Boolean);
} catch (e) {}
return [];
}
function ckSaveItems(k, items) {
if (window.xyBigWriteBlocked && window.xyBigWriteBlocked(store, 'checkin-cards-' + k, '寻踪字卡库')) return false;
store.set('checkin-cards-' + k, JSON.stringify(items));
return true;
}
function ckGroups(k) {
try {
const v = JSON.parse(store.get('checkin-cards-groups-' + k) || 'null');
if (Array.isArray(v)) return v;
} catch (e) {}
return [];
}
function ckSaveGroups(k, groups) {
if (window.xyBigWriteBlocked && window.xyBigWriteBlocked(store, 'checkin-cards-groups-' + k, '寻踪字卡分组')) return false;
store.set('checkin-cards-groups-' + k, JSON.stringify(groups));
return true;
}
const CK_DEF_LIST = { place: DEF_PLACES, action: DEF_ACTIONS, msg: DEF_CHECK_MSGS };
function isCkCardOff(k, x) {
if (!CK_DEF_LIST[k]) return false; // #1520：k 不属于三类（防御：旧写法会静默拼出 ck-off-undefined 键）
if (CK_DEF_LIST[k].indexOf(x) < 0) return false; // #1519a：不是预设卡 ⇒ 预设开关一律不认
return store.get('ck-off-' + k + ':' + x) === '1' || !!(window.presetGroup && window.presetGroup.isOff('cck', k));
}
function setCkCardOff(k, x, off) { store.set('ck-off-' + k + ':' + x, off ? '1' : '0'); }
const CK_EN_KEY = 'checkin-en';
function ckEn() {
try {
const v = store.get(CK_EN_KEY);
return v === null ? true : v === '1';
} catch (e) { return true; }
}
window.checkinEnabled = ckEn;
window.checkinDeskOff = function () { return false; };
function ckMergeDef(custom, def) {
const seen = {};
return def.map(function (t) { return { t: t }; }).concat(custom).filter(function (x) {
if (x && x.t != null && !seen[x.t]) { seen[x.t] = 1; return true; }
return false;
});
}
function genCheckin() {
const useDefault = getCkDefault();
let places = ckItems('place');
let actions = ckItems('action');
let msgs = ckItems('msg');
if (!places.length) places = DEF_PLACES.map(t => ({ t }));
if (!actions.length) actions = DEF_ACTIONS.map(t => ({ t }));
if (!msgs.length) msgs = DEF_CHECK_MSGS.map(t => ({ t }));
if (useDefault) {
places = ckMergeDef(places, DEF_PLACES);
actions = ckMergeDef(actions, DEF_ACTIONS);
msgs = ckMergeDef(msgs, DEF_CHECK_MSGS);
}
const out = {};
let place = useDefault ? places.filter(p => !isCkCardOff('place', p.t)) : places.filter(p => DEF_PLACES.indexOf(p.t) < 0 && !isCkCardOff('place', p.t));
let action = useDefault ? actions.filter(a => !isCkCardOff('action', a.t)) : actions.filter(a => DEF_ACTIONS.indexOf(a.t) < 0 && !isCkCardOff('action', a.t));
let msg = useDefault ? msgs.filter(m => !isCkCardOff('msg', m.t)) : msgs.filter(m => DEF_CHECK_MSGS.indexOf(m.t) < 0 && !isCkCardOff('msg', m.t));
if (!place.length && !action.length && !msg.length) {
place = places.filter(p => !isCkCardOff('place', p.t));
action = actions.filter(a => !isCkCardOff('action', a.t));
msg = msgs.filter(m => !isCkCardOff('msg', m.t));
}
if (place.length) out.place = place[Math.floor(Math.random() * place.length)].t;
if (action.length) out.action = action[Math.floor(Math.random() * action.length)].t;
if (msg.length) out.msg = msg[Math.floor(Math.random() * msg.length)].t;
return out;
}
function ckHistRow(x, i) {
const parts = [x.t, x.place, x.action].filter(Boolean).map(escCk);
return '<div class="ck-location"><div class="ck-value" style="font-size:13px">' + window.mochiHistDel('i' + i, parts.join(' · ')) + parts.join(' · ') + '</div><div class="ck-label">' + escCk(x.msg || '') + '</div></div>';
}
function renderCheckinHistory() {
const histEl = document.getElementById('ck-history');
if (!histEl) return;
try {
let h = [];
try { h = JSON.parse(store.get('checkin-history') || '[]'); } catch (e) { h = []; }
const valid = (Array.isArray(h) ? h : []).map((x, i) => ({ x, i })).filter(o => o.x && (o.x.place || o.x.action));
histEl.innerHTML = window.mochiHistFold(valid.map(o => ({ ts: Number(o.x.ts) || 0, html: ckHistRow(o.x, o.i) })), {
key: 'checkin-hist',
empty: '<div class="div-result-empty">暂无寻踪记录</div>',
todayEmpty: '<div class="dc-h-day-empty">今天暂无寻踪记录</div>'
});
} catch (e) {}
}
function delCheckinHistory(key) { if (window.xyBigWriteBlocked && window.xyBigWriteBlocked(store, 'checkin-history', '寻踪记录')) return; // #1493 删除也是读改写：读不全先按住
let h = [];
try { h = JSON.parse(store.get('checkin-history') || '[]'); } catch (e) { return; }
const i = parseInt(String(key).replace(/^i/, ''), 10);
if (!(i >= 0) || !(i < h.length)) return;
h.splice(i, 1);
try {
store.set('checkin-history', JSON.stringify(h));
if (window.idbSet) window.idbSet(window.activePrefix() + ':checkin-history', JSON.stringify(h));
} catch (e) {}
renderCheckinHistory();
if (typeof window.toast === 'function') window.toast('已删除这条寻踪记录');
}
window.mochiHistDelBind(document.getElementById('ck-history'), { onDel: delCheckinHistory, title: '删除这条寻踪记录？' });
(function () {
if (window.idbGet) {
const myPrefix = window.activePrefix();
window.idbGet(myPrefix + ':checkin-history').then(v => {
if (window.activePrefix() !== myPrefix) return;
if (!v) return;
try {
const data = typeof v === 'string' ? JSON.parse(v) : v;
if (Array.isArray(data) && data.length && !store.get('checkin-history')) {
store.set('checkin-history', JSON.stringify(data));
}
} catch (e) {}
});
}
})();
const checkinApp = document.querySelector('.app[data-app="checkin"]');
const checkinPage = document.getElementById('page-checkin');
function applyCkDeskIcon() {
try {
if (!checkinApp) return;
let man = false;
try { man = (JSON.parse(store.get('hidden-icons') || '[]')).indexOf('checkin') >= 0; } catch (e) {}
checkinApp.style.display = man ? 'none' : '';
} catch (e) {}
}
function ckDisabledBanner() {
const card = document.getElementById('ck-card');
if (!card) return;
let el = document.getElementById('ck-off-tip');
if (!ckEn()) {
if (!el) {
el = document.createElement('div');
el.id = 'ck-off-tip';
el.setAttribute('style', 'margin:0 0 10px;padding:8px 10px;border-radius:10px;font-size:12.5px;line-height:1.55;border:1px solid rgba(128,128,128,.34);opacity:.82');
card.insertBefore(el, card.firstChild);
}
el.textContent = '已禁用：联系人无法再触发更新日常。下面是关闭前的最后一次日常；「TA在身边 · 位置感知」不受影响，照常可用。重新开启：设置 → 工具 → 寻踪（TA 的日常）。';
} else if (el) el.remove();
}
function syncCkSwitchUI() {
const on = ckEn();
const a = document.getElementById('sf-checkin-en');
if (a && a.checked !== on) a.checked = on;
const b = document.getElementById('ck-fe-en');
if (b && b.checked !== on) b.checked = on;
const sub = document.getElementById('sf-checkin-sub');
if (sub) sub.textContent = on ? 'TA 的日常随机刷新，桌面/聊天里都能寻踪' : '已禁用：联系人无法再触发更新日常（桌面【寻踪】仍可进入，页内「TA在身边 · 位置感知」照常用）';
ckDisabledBanner();
}
function ckToast(on) {
if (typeof window.toast !== 'function') return;
window.toast(on ? '寻踪已开启：日常继续更新、聊天入口恢复' : '已禁用：联系人无法再触发更新日常（桌面【寻踪】仍可进入，「TA在身边 · 位置感知」照常用）');
}
window.setCheckinEnabled = function (on) {
try { store.set(CK_EN_KEY, on ? '1' : '0'); } catch (e) {}
syncCkSwitchUI();
applyCkDeskIcon();
};
function bindCkSwitch(input) {
input.checked = ckEn();
input.addEventListener('change', function () {
window.setCheckinEnabled(input.checked);
ckToast(input.checked);
});
}
(function () {
if (document.getElementById('sf-checkin-row')) return;
const anchor = document.getElementById('row-open-divination');
if (!anchor || !anchor.parentNode) return;
const row = document.createElement('div');
row.className = 'set-row';
row.id = 'sf-checkin-row';
row.innerHTML =
'<div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="#111111" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/><path d="M11 8v3.4l2.4 1.4"/></svg></div>' +
'<div class="txt">寻踪（TA 的日常）<span class="sub" id="sf-checkin-sub"></span></div>' +
'<label class="toggle"><input type="checkbox" id="sf-checkin-en"><span class="tk"></span></label>';
anchor.parentNode.insertBefore(row, anchor);
bindCkSwitch(row.querySelector('#sf-checkin-en'));
})();
(function () {
if (document.getElementById('ck-fe-en')) return;
const box = document.getElementById('ck-prob-box');
if (!box || !box.parentNode) return;
const grp = document.createElement('div');
grp.className = 'set-group glass';
grp.setAttribute('style', 'margin:10px 12px 0');
grp.innerHTML =
'<div class="gs-row"><span>启用寻踪（TA 的日常）</span><label class="toggle"><input type="checkbox" id="ck-fe-en"><span class="tk"></span></label></div>' +
'<div class="gs-sub">关闭后日常不再自动更新、不再推送到聊天、不再写新记录，聊天「更多功能」里的寻踪与点 TA 头像的寻踪半框一并收起。桌面【寻踪】图标仍在（点进去看得到「已禁用」说明，页里的「TA在身边 · 位置感知」是独立功能、照常可用）。下面那个「发送到聊天」概率与已有寻踪记录都不受影响，重新开启即恢复。设置 → 工具 里有同一个开关。</div>';
box.parentNode.insertBefore(grp, box);
bindCkSwitch(document.getElementById('ck-fe-en'));
})();
applyCkDeskIcon();
syncCkSwitchUI();
document.addEventListener('contact-switched', function () { applyCkDeskIcon(); syncCkSwitchUI(); });
if (window.__mochiDataReady) { applyCkDeskIcon(); syncCkSwitchUI(); }
else document.addEventListener('mochi-restore-done', function () { applyCkDeskIcon(); syncCkSwitchUI(); });
document.addEventListener('decor-exited', applyCkDeskIcon);
function ckLast() { const v = parseInt(store.get('checkin-last'), 10); return isNaN(v) ? 0 : v; }
function ckNext() { const v = parseFloat(store.get('checkin-next')); return isNaN(v) ? 0 : v; }
function renderCheckinUI(ck) {
const place = document.getElementById('ck-place');
const action = document.getElementById('ck-action');
const msg = document.getElementById('ck-msg');
const status = document.getElementById('ck-status');
const name = store.get('lbl-partner') || 'TA';
if (place) place.textContent = ck.place || '';
if (action) action.textContent = ck.action || '';
if (msg) msg.textContent = ck.msg || '';
if (status) status.textContent = name + ' 的日常';
}
function recordCheckin(ck) { if (window.xyBigWriteHold && window.xyBigWriteHold(store, 'checkin-history')) return; // #1493 读不全先让路（#1403 已给这页折叠＋单删，这里补大键化后的顶库闸）
const entry = { t: fmtTime(Date.now()), place: ck.place, action: ck.action, msg: ck.msg, ts: Date.now() };
try {
const h = JSON.parse(store.get('checkin-history') || '[]');
h.push(entry);
store.set('checkin-history', JSON.stringify(h));
if (window.idbSet) window.idbSet(window.activePrefix() + ':checkin-history', JSON.stringify(h));
} catch (e) {}
renderCheckinHistory();
}
let ckBigPending = 0, ckBigSeq = 0, ckBigBypass = false;
function doCheckin() {
if (!ckEn()) return; // #823a 关闭即全静默：生成/推送/记录/重置计时一并停
const blind = ['place', 'action', 'msg'].filter(function (k) {
try { return typeof store.awaitingBigKey === 'function' && store.awaitingBigKey('checkin-cards-' + k); } catch (e) { return false; }
});
if (blind.length && !ckBigBypass) {
if (ckBigPending) return; // 已在等库：60 秒轮询/连点刷新不叠加第二发
ckBigPending = blind.length;
const seq = ++ckBigSeq;
blind.forEach(function (k) { try { store.requestBigKey('checkin-cards-' + k); } catch (e2) {} });
blind.forEach(function (k) {
let done = false;
try {
store.whenBigKeyBack('checkin-cards-' + k, function () {
if (seq !== ckBigSeq || done) return;
done = true;
if (--ckBigPending > 0) return;
doCheckin(); // 取齐了＝用完整池子生成（含开关开启时的合并与关闭时的只抽自定义）
});
} catch (e3) { if (!done) { done = true; ckBigPending--; } }
});
setTimeout(function () {
if (seq !== ckBigSeq || !ckBigPending) return;
ckBigSeq++; // 作废在途回调＝保底路径后不会再触发第二次生成
ckBigPending = 0;
ckBigBypass = true; // #1520：这一发按可读到的生成，且**不再重新武装一轮闸**——原先保底后
doCheckin(); // 4 秒保底：IDB 挂死也照旧按可读到的生成（宁可残缺不可静默停更）
}, 4000);
return;
}
ckBigBypass = false; // #1520：保底放行的这一发用掉即清，下一发觉回填落地后照常走闸
const ck = genCheckin();
if (!ck.place && !ck.action && !ck.msg) return;
store.set('checkin-current', JSON.stringify(ck));
renderCheckinUI(ck);
const name = store.get('lbl-partner') || 'TA';
let ckChatOn = true;
try { ckChatOn = Math.random() * 100 < (window.dcfGet ? window.dcfGet('checkin') : 100); } catch (e) {}
if (ckChatOn) {
if (window.chatAddSystem) {
window.chatAddSystem(name + ' 更新了一条日常');
}
if (window.chatAddIn) {
const line = [ck.place, ck.action, ck.msg].filter(Boolean).join(' · ');
if (line) window.chatAddIn(line);
}
if (Math.random() * 100 < 30) {
window.chatAddIn(name + ' 提醒你来寻踪.查岗');
}
}
recordCheckin(ck);
store.set('checkin-last', String(Date.now()));
store.set('checkin-next', String(1 + Math.random() * 7));
const p = document.getElementById('ck-p-place');
const a = document.getElementById('ck-p-action');
const m = document.getElementById('ck-p-msg');
if (p) p.textContent = ck.place || '';
if (a) a.textContent = ck.action || '';
if (m) m.textContent = ck.msg || '';
}
window.openCkPanel = function () {
if (!ckEn()) return; // #823b 关闭后点顶部 TA 头像不再弹寻踪半框（toggleCkPanel 同源）
const pc = document.getElementById('poke-card');
if (pc) pc.hidden = true;
const ep = document.getElementById('emoji-panel');
if (ep) ep.hidden = true;
if (window.closeAvlib) window.closeAvlib();
const panel = document.getElementById('ck-panel');
const nameEl = document.getElementById('ck-panel-name');
const name = store.get('lbl-partner') || 'TA';
if (nameEl) nameEl.textContent = name;
let cur = null;
try { cur = JSON.parse(store.get('checkin-current') || 'null'); } catch (e) {}
if (cur) {
const p = document.getElementById('ck-p-place');
const a = document.getElementById('ck-p-action');
const m = document.getElementById('ck-p-msg');
if (p) p.textContent = cur.place || '';
if (a) a.textContent = cur.action || '';
if (m) m.textContent = cur.msg || '';
} else {
doCheckin();
}
const upd = document.getElementById('ck-p-updated');
if (upd) {
const last = parseInt(store.get('checkin-last'), 10);
upd.textContent = last ? '更新于 ' + fmtTime(last) : '';
}
if (panel) panel.hidden = false;
};
function closeCkPanel() {
const p = document.getElementById('ck-panel');
if (p) p.hidden = true;
if (window.traceMode === 'half') parent.MindTrace.close();
}
window.closeCkPanel = closeCkPanel;
window.toggleCkPanel = function () {
const p = document.getElementById('ck-panel');
if (!p) return;
if (!p.hidden) { closeCkPanel(); return; }
window.openCkPanel();
};
document.addEventListener('click', (e) => {
const p = document.getElementById('ck-panel');
if (!p || p.hidden) return;
if (p.contains(e.target)) return; // 面板内部点击不关闭（含 ✕ / 「TA在身边」入口）
const av = document.getElementById('chat-partner-av');
if (av && (e.target === av || av.contains(e.target))) return;
closeCkPanel();
});
const ckPanelClose = document.getElementById('ck-panel-close');
if (ckPanelClose) ckPanelClose.addEventListener('click', () => { closeCkPanel(); });
let ckBootDone = false;
let ckWakeAt = 0;
document.addEventListener('visibilitychange', () => {
if (document.visibilityState === 'visible') ckWakeAt = Date.now() + 90000;
});
function checkAutoCheckin() {
if (document.hidden) return; // v3.5.127：后台不自动寻踪
if (Date.now() < ckWakeAt) return; // 回前台冷静期
if (!ckBootDone) return; // 首次：等数据就绪标志
try {
const now = Date.now();
let last = ckLast(), next = ckNext();
if (last > now || last < 0 || isNaN(last)) { last = 0; next = 0; }
if ((now - last) / 36e5 < next) return;
doCheckin();
} catch (e) {}
}
setInterval(function () { try { if (window.__mochiPhase) window.__mochiPhase('fish-tick'); } catch (e0) {} checkAutoCheckin(); }, 60000);
function bootCheckin() {
if (!window.__mochiDataReady) { setTimeout(bootCheckin, 500); return; }
ckBootDone = true;
checkAutoCheckin();
}
document.addEventListener('mochi-restore-done', bootCheckin);
setTimeout(bootCheckin, 3000);
window.openCheckinPage = function () {
if (!checkinPage) return;
document.querySelectorAll('.page').forEach(p => p.hidden = true);
checkinPage.hidden = false;
let cur = null;
try { cur = JSON.parse(store.get('checkin-current') || 'null'); } catch (e) {}
if (cur && cur.place) renderCheckinUI(cur);
else if (ckEn()) doCheckin();
ckDisabledBanner();
renderCheckinHistory();
};
if (checkinApp && checkinPage) {
checkinApp.addEventListener('click', () => {
const editing = Array.from(document.querySelectorAll('.app-grid')).some(g => g.classList.contains('editing'));
if (editing) return;
window.__ckFrom = '';
window.openCheckinPage();
});
}
const checkinBack = document.getElementById('checkin-back');
if (checkinBack) {
checkinBack.addEventListener('click', () => {
document.querySelectorAll('.page').forEach(p => p.hidden = true);
if (window.__ckFrom === 'chat') {
const chatPage = document.getElementById('page-chat');
if (chatPage) chatPage.hidden = false;
} else {
const home = document.getElementById('page-phone');
if (home) home.hidden = false;
}
window.__ckFrom = '';
parent.MindTrace.close();
});
}
const ckRefresh = document.getElementById('ck-refresh');
if (ckRefresh) {
let ckLastRefresh = 0;
ckRefresh.addEventListener('click', () => {
const now = Date.now();
if (now - ckLastRefresh < 5000) { toast('刷新太频繁，稍后再试'); return; }
ckLastRefresh = now;
if (!ckEn()) { toast('寻踪已禁用：设置 → 工具 → 寻踪 重新开启后才能刷新日常'); return; }
doCheckin();
});
}
const CK_DEFS = [
['place', DEF_PLACES],
['action', DEF_ACTIONS],
['msg', DEF_CHECK_MSGS]
];
const CK_LABEL = { place: '地点', action: '在做什么', msg: '说的话' };
(function cleanLegacyPresetInCk() {
try {
const MK = 'ck-mine-clean-v1';
if (store.get(MK) === '1') return;
const defMap = { place: DEF_PLACES, action: DEF_ACTIONS, msg: DEF_CHECK_MSGS };
Object.keys(defMap).forEach(k => {
let raw = null;
try { raw = JSON.parse(store.get('checkin-cards-' + k) || 'null'); } catch (e) { raw = null; }
if (!Array.isArray(raw)) return;
const cleaned = raw.filter(x => {
const t = x && typeof x === 'object' ? x.t : x;
return !(t != null && defMap[k].indexOf(String(t)) >= 0);
});
if (cleaned.length !== raw.length) ckSaveItems(k, cleaned);
});
store.set(MK, '1');
} catch (e) {}
})();
let ckTab = 'place';
function ckHasCustom(k) {
try {
const v = JSON.parse(store.get('checkin-cards-' + k) || 'null');
return Array.isArray(v) && v.length > 0;
} catch (e) { return false; }
}
let ckTab2 = 'sys';
function escCk(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function renderCkSysList() {
const listEl = document.getElementById('cck-sys-list');
const titleEl = document.getElementById('cck-sys-title');
if (titleEl) titleEl.textContent = CK_LABEL[ckTab] || '';
if (!listEl) return;
const useDefault = getCkDefault();
const def = { place: DEF_PLACES, action: DEF_ACTIONS, msg: DEF_CHECK_MSGS }[ckTab];
listEl.innerHTML = '';
if (!useDefault) {
const tip = document.createElement('div');
tip.className = 'ta-empty';
tip.textContent = '系统预设字卡已关闭（寻踪只从「我的添加」里抽取）。开启上方开关即可恢复使用。';
listEl.appendChild(tip);
return;
}
if (window.presetGroup) {
const barBox = document.createElement('div');
barBox.innerHTML = window.presetGroup.catBar('cck', ckTab, CK_LABEL[ckTab] || ckTab);
const bar = barBox.firstElementChild;
if (bar) {
listEl.appendChild(bar);
window.presetGroup.bindBar(bar, 'cck', ckTab, function () { renderCkSysList(); updateCkCount(); });
}
}
def.forEach(x => {
const off = isCkCardOff(ckTab, x);
const row = document.createElement('div');
row.className = 'tc-qrow' + (off ? ' off' : '');
row.innerHTML = '<div class="tc-qmain"><div class="tc-qtext">' + escCk(x) + ' <span class="tc-known">系统</span></div></div>';
const lab = document.createElement('label');
lab.className = 'toggle ccard-toggle';
lab.innerHTML = '<input type="checkbox"' + (off ? '' : ' checked') + '><span class="tk"></span>';
lab.querySelector('input').addEventListener('change', () => {
const nowOff = !lab.querySelector('input').checked;
setCkCardOff(ckTab, x, nowOff);
renderCkSysList();
updateCkCount();
toast((nowOff ? '已关闭：' : '已开启：') + (x.length > 18 ? x.slice(0, 18) + '…' : x));
});
row.appendChild(lab);
listEl.appendChild(row);
});
}
function renderCkMineList() {
const listEl = document.getElementById('cck-mine-list');
const titleEl = document.getElementById('cck-mine-title');
if (titleEl) titleEl.textContent = CK_LABEL[ckTab] || '';
if (!listEl) return;
const custom = ckItems(ckTab);
const groups = ckGroups(ckTab);
let html = '';
html += '<div class="mg-grp-row"><button class="cc-tool mg-grp-add"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;vertical-align:-2px;margin-right:4px"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>新建分组</button></div>';
if (!custom.length && !groups.length) {
let blindTab = false;
try { blindTab = typeof store.awaitingBigKey === 'function' && store.awaitingBigKey('checkin-cards-' + ckTab); } catch (e0) {}
if (blindTab) {
try { store.requestBigKey('checkin-cards-' + ckTab); } catch (e1) {}
try { store.whenBigKeyBack('checkin-cards-' + ckTab, function () { renderCheckinCards(); }); } catch (e2) {}
listEl.innerHTML = html + '<div class="ta-empty">字卡库正在取回（内容较多，几秒内自动出现）…</div>';
bindCkGroupOps();
return;
}
listEl.innerHTML = html + '<div class="ta-empty">暂未添加自定义字卡，可在上方批量输入（每行一个）。</div>';
bindCkGroupOps();
return;
}
groups.forEach(g => {
const arr = custom.filter(x => x.grp === g.id);
html += '<div class="cal-card glass mg-block" data-gid="' + escCk(g.id) + '">' +
'<div class="cal-card-title mg-title"><button class="mg-handle" data-gid="' + escCk(g.id) + '" title="拖动排序"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg></button>' +
'<span class="mg-name">' + escCk(g.name) + '</span><span class="mg-cnt">(' + arr.length + ')</span>' +
'<span class="mg-ops"><button class="mg-op" data-g="' + escCk(g.id) + '" data-op="rn" title="重命名">✎</button><button class="mg-op" data-g="' + escCk(g.id) + '" data-op="rm" title="删除分组">✕</button></span></div>' +
(arr.length ? arr.map(x => ckMineItemHtml(x, custom.indexOf(x))).join('') : '<div class="ta-empty">这个分组还没有内容</div>') +
'</div>';
});
const ungrouped = custom.filter(x => !x.grp);
html += '<div class="cal-card glass mg-block mg-ungrouped"><div class="cal-card-title mg-title"><span class="mg-name">未分组</span><span class="mg-cnt">(' + ungrouped.length + ')</span></div>';
if (!ungrouped.length) html += '<div class="ta-empty">暂无未分组字卡，可在上方批量输入</div>';
html += ungrouped.map(x => ckMineItemHtml(x, custom.indexOf(x))).join('');
html += '</div>';
listEl.innerHTML = html;
listEl.querySelectorAll('.ta-del').forEach(b => {
b.addEventListener('click', () => {
const l = ckItems(ckTab);
l.splice(Number(b.dataset.idx), 1);
if (ckSaveItems(ckTab, l) === false) return; // #1520：没读全＝这一发没落笔，别报成功
renderCkMineList();
updateCkCount();
toast('已删除');
});
});
listEl.querySelectorAll('.tc-qtext[data-edit]').forEach(el => {
el.addEventListener('click', () => {
const idx = Number(el.dataset.edit);
const l = ckItems(ckTab);
const item = l[idx];
if (!item || !window.openModal) return;
window.openModal('编辑字卡', item.t, (v) => {
const val = String(v == null ? '' : v).trim();
if (!val) { toast('内容不能为空'); return; }
if (val === item.t) return;
if (l.some((x, xi) => xi !== idx && x.t === val)) { toast('已有相同内容'); return; }
l[idx].t = val;
if (ckSaveItems(ckTab, l) === false) return; // #1520：同上
renderCkMineList();
toast('已更新');
});
});
});
listEl.querySelectorAll('.ta-mv').forEach(b => {
b.addEventListener('click', () => {
const idx = Number(b.dataset.idx);
const l = ckItems(ckTab);
const item = l[idx];
if (!item || !window.openModal) return;
const groups = ckGroups(ckTab);
const opts = [{ label: '未分组', value: '' }].concat(groups.map(g => ({ label: g.name, value: g.id })));
window.openModal('移动到分组', '', (v) => {
if (v == null) return;
l[idx].grp = v || '';
if (ckSaveItems(ckTab, l) === false) return; // #1520：同上
renderCkMineList();
const tgt = v ? (groups.find(g => g.id === v) || {}).name : '未分组';
toast('已移动到「' + tgt + '」');
}, { pills: opts, pill: item.grp || '', noInput: true });
});
});
bindCkGroupOps();
}
function ckMineItemHtml(x, idx) {
return '<div class="tc-qrow"><div class="tc-qmain"><div class="tc-qtext" data-edit="' + idx + '">' + escCk(x.t) + '</div></div>' +
'<button class="ta-mv" data-idx="' + idx + '" title="移动分组"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px"><path d="M3 7h13a4 4 0 014 4v0a4 4 0 01-4 4H7"/><path d="M7 11l-4 4 4 4"/></svg></button>' +
'<button class="ta-del" data-idx="' + idx + '">✕</button></div>';
}
function bindCkGroupOps() {
const wrap = document.getElementById('cck-mine-list');
if (!wrap) return;
wrap.querySelectorAll('.mg-grp-add').forEach(b => {
if (b.__bound) return;
b.__bound = true;
b.addEventListener('click', () => {
const groups = ckGroups(ckTab);
window.cardGroups.addFlow(groups, g => {
if (!g) return;
ckSaveGroups(ckTab, groups);
refreshCkGrpSelect();
renderCkMineList();
toast('已新建分组「' + g.name + '」');
});
});
});
wrap.querySelectorAll('.mg-op').forEach(b => {
if (b.__bound) return;
b.__bound = true;
b.addEventListener('click', () => {
const groups = ckGroups(ckTab);
const gid = b.dataset.g;
const g = groups.find(x => x.id === gid);
if (!g) return;
if (b.dataset.op === 'rn') {
window.cardGroups.renameFlow(g, groups, name => {
if (!name) return;
ckSaveGroups(ckTab, groups);
refreshCkGrpSelect();
renderCkMineList();
toast('分组已重命名');
});
} else if (b.dataset.op === 'rm') {
window.cardGroups.removeFlow(g.name, ok => {
if (!ok) return;
const l = ckItems(ckTab);
l.forEach(x => { if (x.grp === gid) x.grp = ''; });
ckSaveItems(ckTab, l);
ckSaveGroups(ckTab, groups.filter(x => x.id !== gid));
refreshCkGrpSelect();
renderCkMineList();
toast('已删除分组「' + g.name + '」');
});
}
});
});
wrap.querySelectorAll('.mg-handle').forEach(b => {
if (b.__bound) return;
b.__bound = true;
b.addEventListener('pointerdown', (e) => {
if (e.button !== 0 && e.pointerType === 'mouse') return;
const gid = b.dataset.gid;
const blocks0 = Array.from(wrap.querySelectorAll('.mg-block:not(.mg-ungrouped)'));
const block = blocks0.find(bl => bl.dataset.gid === gid);
if (!block) return;
const title = block.querySelector('.mg-title');
const rect = title.getBoundingClientRect();
const offsetY = e.clientY - rect.top;
const clone = title.cloneNode(true);
clone.classList.add('mg-drag-clone');
clone.style.position = 'fixed';
clone.style.left = rect.left + 'px';
clone.style.top = rect.top + 'px';
clone.style.width = rect.width + 'px';
clone.style.margin = '0';
clone.style.zIndex = '1000';
clone.style.pointerEvents = 'none';
document.body.appendChild(clone);
block.classList.add('mg-dragging');
let dropIdx = blocks0.indexOf(block);
const onMove = (ev) => {
ev.preventDefault();
clone.style.top = (ev.clientY - offsetY) + 'px';
const blocks2 = Array.from(wrap.querySelectorAll('.mg-block:not(.mg-ungrouped)'));
dropIdx = blocks2.length;
for (let i = 0; i < blocks2.length; i++) {
if (blocks2[i] === block) continue;
const r = blocks2[i].getBoundingClientRect();
if (ev.clientY < r.top + r.height / 2) { dropIdx = i; break; }
}
wrap.querySelectorAll('.mg-drop-line').forEach(el => el.remove());
const line = document.createElement('div');
line.className = 'mg-drop-line';
if (dropIdx >= blocks2.length) {
const last = blocks2[blocks2.length - 1];
if (last && last.nextSibling) wrap.insertBefore(line, last.nextSibling);
else wrap.appendChild(line);
} else {
wrap.insertBefore(line, blocks2[dropIdx]);
}
};
const onUp = () => {
document.removeEventListener('pointermove', onMove);
document.removeEventListener('pointerup', onUp);
document.removeEventListener('pointercancel', onUp);
clone.remove();
block.classList.remove('mg-dragging');
wrap.querySelectorAll('.mg-drop-line').forEach(el => el.remove());
const blocks2 = Array.from(wrap.querySelectorAll('.mg-block:not(.mg-ungrouped)'));
const curIdx = blocks2.findIndex(bl => bl.dataset.gid === gid);
if (curIdx < 0 || dropIdx === curIdx || dropIdx === curIdx + 1) return;
const groups = ckGroups(ckTab);
let target = dropIdx < curIdx ? dropIdx : dropIdx - 1;
if (target < 0) target = 0;
if (target > groups.length - 1) target = groups.length - 1;
if (target === curIdx) return;
const [moved] = groups.splice(curIdx, 1);
groups.splice(target, 0, moved);
ckSaveGroups(ckTab, groups);
renderCkMineList();
toast('分组已移动');
};
document.addEventListener('pointermove', onMove, { passive: false });
document.addEventListener('pointerup', onUp);
document.addEventListener('pointercancel', onUp);
e.preventDefault();
});
});
}
function refreshCkGrpSelect() {
const grpSel = document.getElementById('cck-batch-grp');
if (!grpSel) return;
const groups = ckGroups(ckTab);
grpSel.innerHTML = window.cardGroups.grpOnlyOptsHtml(groups, grpSel.value);
window.cardGroups.bindNewGrp(grpSel, groups, function () { ckSaveGroups(ckTab, groups); });
}
function updateCkCount() {
const useDefault = getCkDefault();
let sysTotal = 0, mineTotal = 0;
CK_DEFS.forEach(([k, def]) => {
mineTotal += ckCustomList(k).length;
if (useDefault) sysTotal += def.filter(x => !isCkCardOff(k, x)).length;
});
const cnt = document.getElementById('cc-checkin-count');
if (cnt) cnt.textContent = sysTotal;
const cntM = document.getElementById('cc-checkin-count-mine');
if (cntM) cntM.textContent = mineTotal;
}
window.ckCardsRefreshCounts = updateCkCount;
function switchCkTab2(tab) {
ckTab2 = tab;
const tabsWrap = document.getElementById('ck-tabs');
if (tabsWrap) tabsWrap.querySelectorAll('.cc-tab').forEach(t => t.classList.toggle('sel', t.dataset.tab === tab));
const sysPanel = document.getElementById('ck-sys-panel');
const minePanel = document.getElementById('ck-mine-panel');
if (sysPanel) sysPanel.hidden = tab !== 'sys';
if (minePanel) minePanel.hidden = tab !== 'mine';
if (tab === 'sys') renderCkSysList(); else renderCkMineList();
}
function renderCheckinCards() {
document.querySelectorAll('#page-checkin-cards .fav-tab').forEach(tab => {
tab.classList.toggle('sel', tab.dataset.cktab === ckTab);
});
const useDefault = getCkDefault();
const defEl = document.getElementById('ck-default');
if (defEl) defEl.checked = useDefault;
refreshCkGrpSelect(); // v3.7.x：切换分类时刷新该分类的分组下拉
switchCkTab2(ckTab2);
updateCkCount();
}
const ckDefaultEl = document.getElementById('ck-default');
if (ckDefaultEl) {
ckDefaultEl.addEventListener('change', () => {
store.set(CK_DEF_KEY, ckDefaultEl.checked ? '1' : '0');
renderCheckinCards();
toast(ckDefaultEl.checked ? '系统预设字卡已开启' : '系统预设字卡已关闭（仅用你添加的字卡）');
});
}
document.querySelectorAll('#page-checkin-cards .fav-tab').forEach(tab => {
tab.addEventListener('click', () => {
ckTab = tab.dataset.cktab;
renderCheckinCards();
});
});
const ckTabsWrap = document.getElementById('ck-tabs');
if (ckTabsWrap) {
ckTabsWrap.querySelectorAll('.cc-tab').forEach(tab => {
tab.addEventListener('click', () => { ckTab2 = tab.dataset.tab; switchCkTab2(ckTab2); });
});
}
const batchAdd = document.getElementById('cck-batch-add');
if (batchAdd) {
refreshCkGrpSelect();
batchAdd.addEventListener('click', () => {
const ta = document.getElementById('cck-batch');
const raw = ta ? ta.value : '';
const items = raw.split('\n').map(s => s.trim()).filter(Boolean);
if (!items.length) { toast('请输入内容，每行一个'); return; }
const grpSel = document.getElementById('cck-batch-grp');
const parsed = window.cardGroups.parseCatVal(grpSel ? grpSel.value : '');
if (!parsed) { toast('请先选择分组'); return; }
const list = ckItems(ckTab);
items.forEach(it => {
const x = { t: it };
if (parsed.grp) x.grp = parsed.grp;
list.push(x);
});
if (ckSaveItems(ckTab, list) === false) return; // #1520：拦下＝输入框原样保留，等库回填后再点一次
if (ta) ta.value = '';
renderCkMineList();
updateCkCount();
toast('已添加 ' + items.length + ' 条到「' + (CK_LABEL[ckTab] || ckTab) + '」');
});
}
const ckNewGrp = document.getElementById('ck-new-grp');
if (ckNewGrp) {
ckNewGrp.addEventListener('click', () => {
const groups = ckGroups(ckTab);
window.cardGroups.addFlow(groups, g => {
if (!g) return;
ckSaveGroups(ckTab, groups);
refreshCkGrpSelect();
if (ckTab2 === 'mine') renderCkMineList();
toast('已新建分组「' + g.name + '」');
});
});
}
const liCK = document.getElementById('li-checkin-cards');
const ckCardsPage = document.getElementById('page-checkin-cards');
if (liCK && ckCardsPage) {
liCK.addEventListener('click', () => {
document.querySelectorAll('.page').forEach(p => p.hidden = true);
ckCardsPage.hidden = false;
ckTab2 = 'sys';
const tw = document.getElementById('ck-tabs'); if (tw) tw.style.display = 'none';
renderCheckinCards();
});
}
const liCKMine = document.getElementById('li-checkin-cards-mine');
if (liCKMine && ckCardsPage) {
liCKMine.addEventListener('click', () => {
document.querySelectorAll('.page').forEach(p => p.hidden = true);
ckCardsPage.hidden = false;
ckTab2 = 'mine';
const tw = document.getElementById('ck-tabs'); if (tw) tw.style.display = 'none';
renderCheckinCards();
});
}
const ckCardsBack = document.getElementById('checkin-cards-back');
if (ckCardsBack) {
ckCardsBack.addEventListener('click', () => {
document.querySelectorAll('.page').forEach(p => p.hidden = true);
window.openCheckinPage();
});
}
renderCheckinCards();
window.__cardSearchFns = window.__cardSearchFns || [];
window.__cardSearchFns.push({ name: '寻踪日常字卡', fn: function (kw) {
const out = [];
try {
CK_DEFS.forEach(function (pair) {
const k = pair[0]; const def = pair[1]; const label = CK_LABEL[k] || k;
(def || []).forEach(function (x) { if (x && String(x).toLowerCase().indexOf(kw) >= 0) out.push({ t: String(x), cat: label + '·系统' }); });
(ckCustomList(k) || []).forEach(function (item) { const txt = item && item.t ? item.t : ''; if (txt && txt.toLowerCase().indexOf(kw) >= 0) out.push({ t: txt, cat: label + '·我的' }); });
});
} catch (e) {}
return out;
} });

window.traceDailyTick=checkAutoCheckin;
})();
(function () {
const store = window.activeStore();
const DIR_POS = {
'在你左边': { x: 0.08, y: 0.5 },
'在你右边': { x: 0.92, y: 0.5 },
'在你身后': { x: 0.5, y: 0.08 },
'在你前面': { x: 0.5, y: 0.92 },
'离你两步': { x: 0.5, y: 0.38 },
'抬头就能看到': { x: 0.5, y: 0.12 },
'在你看不到的地方偷看你': { x: 0.86, y: 0.16 },
'在你看不到的地方': { x: 0.72, y: 0.28 },
'隔着世界在你身边': { x: 0.5, y: 0.5, center: true },
'感觉到了吗': { x: 0.5, y: 0.5, center: true },
'能摸到我吗': { x: 0.5, y: 0.5, center: true },
'一直没走远': { x: 0.5, y: 0.45 },
'隐约在你身旁': { x: 0.55, y: 0.5 },
'在你心里': { x: 0.5, y: 0.5, center: true }
};
const DIST_ADJUST = { '再近一点': 0.15, '再远一点': -0.15, '就停这儿': 0, '马上到你身边': 0.3, '一直在原地等你': 0 };
function adjustTowardCenter(pos, amount) {
return { x: pos.x + (0.5 - pos.x) * amount, y: pos.y + (0.5 - pos.y) * amount, center: pos.center };
}
function lastDirText() {
const hist = loadHist();
for (const h of hist) {
if (h.type === 'dir') return h.text;
if (h.type === 'combo') return h.text.split(' ')[0];
}
return null;
}
function fxPos(text, type) {
if (DIR_POS[text]) return DIR_POS[text];
const dirText = lastDirText();
const base = dirText ? (DIR_POS[dirText] || { x: 0.5, y: 0.3 }) : { x: 0.5, y: 0.3 };
if (type === 'dist') {
const adj = DIST_ADJUST[text] || 0;
if (adj) return adjustTowardCenter(base, adj);
}
return base;
}
const EGG_COOLDOWN = 7 * 24 * 3600 * 1000;
function loadCur() { try { return JSON.parse(store.get('loc-current') || 'null'); } catch (e) { return null; } }
function saveCur(v) { store.set('loc-current', v ? JSON.stringify(v) : ''); }
function loadHist() { try { return JSON.parse(store.get('loc-history') || '[]'); } catch (e) { return []; } }
function saveHist(list) { if (window.xyBigWriteHold && window.xyBigWriteHold(store, 'loc-history')) return; // #1493 读不全先让路：这一格大键化后冷读空＝拿空账追加＝顶掉整本位置历史
const s = JSON.stringify(list);
store.set('loc-history', s);
try { if (window.idbSet) window.idbSet(window.activePrefix() + ':loc-history', s); } catch (e) {}
}
window.locAddHist = function (text, type, auto) {
try {
const hist = loadHist();
hist.unshift({ text: String(text == null ? '' : text), type: type || 'sense', ts: Date.now(), auto: !!auto });
saveHist(hist);
} catch (e) {}
};
window.locRefreshBody = function () { try { renderLocPanel(); } catch (e) {} };
function eggLastTs() { return parseInt(store.get('loc-egg-last') || '0', 10) || 0; }
function eggUsed() { return Date.now() - eggLastTs() < EGG_COOLDOWN; }
function loadCustom() { return window.locLibGetCustomCards ? window.locLibGetCustomCards() : []; }
function saveCustom(list) { if (window.locLibSaveCustom) window.locLibSaveCustom(list); }
function senseDesc(cur) {
if (!cur) return '还没感觉到 TA…';
const t = cur.text;
if (t.indexOf('看不到') >= 0 && t.indexOf('偷看') < 0) return 'TA 在你看不到的地方，但没走远';
if (t.indexOf('隔着世界') >= 0) return 'TA 隔着世界，隐约在你身旁';
if (t.indexOf('感觉到') >= 0) return '你感觉到了 TA，就在附近';
if (t.indexOf('能摸到') >= 0) return '你能摸到 TA，很近很安心';
if (t.indexOf('没走远') >= 0) return 'TA 一直没走远，就在身边';
if (t.indexOf('隐约') >= 0) return 'TA 隐约在你身旁，感觉到了吗';
if (t.indexOf('心里') >= 0) return 'TA 在你心里，最近的距离';
if (t.indexOf('身后') >= 0) return '你感觉到 TA 在你身后，很近';
if (t.indexOf('左边') >= 0) return '你感觉到 TA 在你左边';
if (t.indexOf('右边') >= 0) return '你感觉到 TA 在你右边';
if (t.indexOf('前面') >= 0) return '你感觉到 TA 在你前面';
if (t.indexOf('身边') >= 0) return 'TA 就在你身边，很安心';
if (t.indexOf('跟着') >= 0 || t.indexOf('陪你') >= 0) return 'TA 在陪你，感觉到了吗';
return '你感觉到 TA 在附近：' + t;
}
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function fmtT(ts) { if (!ts) return ''; const d = new Date(ts); const p = (n) => (n < 10 ? '0' + n : '' + n); return p(d.getHours()) + ':' + p(d.getMinutes()); }
function toast(s) { try { if (typeof window.toast === 'function') window.toast(s); } catch (e) {} }
function playLocFx(text, type) {
const fx = document.getElementById('loc-fx');
if (!fx) return;
const pos = fxPos(text, type);
parent.MindTrace.glow(pos);
fx.hidden = false;
fx.className = 'loc-fx' + (pos.center ? ' loc-fx-center' : '');
fx.style.left = (pos.x * 100) + '%';
fx.style.top = (pos.y * 100) + '%';
void fx.offsetWidth;
fx.classList.add('loc-fx-show');
clearTimeout(fx._t);
fx._t = setTimeout(() => {
fx.classList.remove('loc-fx-show');
fx._t = setTimeout(() => { fx.hidden = true; }, 500);
}, 2000);
}
function sendLocCard(text, type) {
const ts = Date.now();
if (type === 'egg' && eggUsed()) {
toast('彩蛋「在你心里」一周只能用一次');
return;
}
if (window.chatAddIn) window.chatAddIn(text, { rateAllow: true });
saveCur({ text: text, type: type, ts: ts });
const hist = loadHist();
hist.unshift({ text: text, type: type, ts: ts });
saveHist(hist);
if (type === 'egg') store.set('loc-egg-last', String(ts));
playLocFx(text, type);
locViewDate = dayStr(new Date());
renderLocPanel();
if (window.refreshSense) window.refreshSense();
}
function dayStr(d) { const p = (n) => (n < 10 ? '0' + n : '' + n); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
function dayLabel(s) {
const today = dayStr(new Date());
const y = new Date(); y.setDate(y.getDate() - 1);
if (s === today) return '今天';
if (s === dayStr(y)) return '昨天';
const parts = s.split('-');
return parts[1] + '月' + parts[2] + '日';
}
function uniqueDays(hist) {
const set = new Set();
hist.forEach(h => { try { set.add(dayStr(new Date(h.ts))); } catch (e) {} });
return Array.from(set).sort().reverse();
}
let locViewDate = '';
let comboMode = store.get('loc-combo') !== '0'; // 默认开，记住选择
let pendingDir = null;
function sendComboCard(dirText, distText) {
const ts = Date.now();
const text = dirText + ' ' + distText;
if (window.chatAddIn) window.chatAddIn(text, { rateAllow: true });
saveCur({ text: text, type: 'combo', ts: ts });
const hist = loadHist();
hist.unshift({ text: text, type: 'combo', ts: ts });
saveHist(hist);
playLocFx(dirText, 'dir');
pendingDir = null;
locViewDate = dayStr(new Date());
renderLocPanel();
if (window.refreshSense) window.refreshSense();
}
let asking = false;
function locLibGroup(k) {
try {
const sys = window.locLibGetSys ? window.locLibGetSys() : null;
if (sys && Array.isArray(sys[k])) return sys[k];
} catch (e) {}
return [];
}
function backToChatAfterAsk() {
closeLocPanel();
if (window.closeCkPanel) window.closeCkPanel();
parent.MindTrace.chat(traceCid);
return;
const chatPage = document.getElementById('page-chat');
if (!chatPage) return;
if (chatPage.hidden) { if (window.enterChat) window.enterChat(); return; }
const body = document.getElementById('chat-body');
if (body) body.scrollTop = body.scrollHeight;
}
function askWhere() {
if (asking) return;
asking = true;
if (window.chatSendMsg) window.chatSendMsg('你在哪？');
toast(window.taFit ? window.taFit('已问 TA 一声，等 TA 回位置…') : '已问 TA 一声，等 TA 回位置…');
backToChatAfterAsk();
setTimeout(() => {
asking = false;
const dirs = locLibGroup('dir');
const dists = locLibGroup('dist');
const d = (dirs.length ? dirs : ['在你左边'])[Math.floor(Math.random() * (dirs.length ? dirs.length : 1))];
const t = (dists.length ? dists : ['再近一点'])[Math.floor(Math.random() * (dists.length ? dists.length : 1))];
sendComboCard(d, t);
}, 2000 + Math.random() * 2000);
}
function showLocChangeBubble(text) {
if (store.get('loc-bubble') === '0') return; // 设置「换位提醒弹窗」关：TA 换位置不再弹黑色轻提示
let bub = document.getElementById('loc-change-bubble');
if (!bub) {
bub = document.createElement('div');
bub.id = 'loc-change-bubble';
bub.className = 'loc-change-bubble';
document.body.appendChild(bub);
}
bub.textContent = window.taFit ? window.taFit('你感觉到 TA 换了位置：' + text) : ('你感觉到 TA 换了位置：' + text);
parent.MindTrace.bubble(bub.textContent);
bub.classList.add('loc-bubble-show');
clearTimeout(bub._t);
bub._t = setTimeout(() => { bub.classList.remove('loc-bubble-show'); }, 3000);
}
function renderLocPanel() {
const body = document.getElementById('loc-body');
if (!body) return;
const cur = loadCur();
const allHist = loadHist();
const days = uniqueDays(allHist);
const today = dayStr(new Date());
if (!locViewDate || days.indexOf(locViewDate) < 0) {
locViewDate = days.indexOf(today) >= 0 ? today : (days[0] || today);
}
const dayHist = allHist.filter(h => { try { return dayStr(new Date(h.ts)) === locViewDate; } catch (e) { return false; } });
const dayIdx = days.indexOf(locViewDate);
let html = '';
const LOC_LABEL = window.locLibLabel || function (t) { return t; };
html += '<div class="loc-sense-box"><div class="loc-sense-head"><span class="loc-sense-dot"></span><span class="loc-sense-title">你感觉到的</span></div><div class="loc-sense-text">' + esc(senseDesc(cur)) + '</div></div>';
html += '<div class="loc-section"><div class="loc-sec-title">此刻的位置</div>';
if (cur) {
html += '<div class="loc-now"><span class="loc-now-pin"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/></svg></span><div class="loc-now-main"><div class="loc-sec-value">' + esc(cur.text) + '</div><div class="loc-sec-sub">' + (LOC_LABEL[cur.type] || (cur.type === 'combo' ? '组合' : '位置卡')) + ' · ' + fmtT(cur.ts) + '</div></div></div>';
} else {
html += '<div class="loc-sec-value loc-empty">— 还没有位置卡</div>';
}
html += '</div>';
html += '<div class="loc-section"><div class="loc-sec-title">位置时间线</div>';
html += '<div class="loc-day-switch"><button class="loc-day-btn" id="loc-day-prev"' + (dayIdx >= days.length - 1 ? ' disabled' : '') + '>‹</button><span class="loc-day-label">' + dayLabel(locViewDate) + '</span><button class="loc-day-btn" id="loc-day-next"' + (dayIdx <= 0 ? ' disabled' : '') + '>›</button></div>';
if (dayHist.length) {
html += '<div class="loc-timeline">' + dayHist.map(h => {
const tag = LOC_LABEL[h.type] || '';
const auto = h.auto ? '<span class="loc-tl-auto">TA</span>' : '';
return '<div class="loc-tl-item"><span class="loc-tl-time">' + fmtT(h.ts) + '</span><span class="loc-tl-text">' + esc(h.text) + '</span><span class="loc-tl-tag">' + esc(tag) + '</span>' + auto + window.mochiHistDel('k|' + (Number(h.ts) || 0) + '|' + esc(h.text), (LOC_LABEL[h.type] || '位置卡') + ' · ' + esc(h.text)) + '</div>'; // #1493 单条删除
}).join('') + '</div>';
html += '<div class="loc-day-count">共 ' + dayHist.length + ' 条</div>';
} else {
html += '<div class="loc-sec-value loc-empty">这天没有位置记录</div>';
}
html += '</div>';
html += '<div class="loc-sec-sub" style="padding:10px 2px 0;line-height:1.7">光点落在哪儿，就是 TA 在哪儿：方位卡落在画面对应方向；距离卡、状态卡跟着最近一张方位卡的方位走——「再近一点」朝屏幕中心靠、「再远一点」朝屏幕边缘退开（上一张说的是「在你右边」时，光点贴屏幕右侧属正常）。</div>';
html += '<div class="set-group glass" style="margin:14px 2px 0">'
+ '<div class="gs-row"><span>TA 自动换位</span><label class="toggle"><input type="checkbox" id="loc-auto-tg"' + (store.get('loc-auto') === '0' ? '' : ' checked') + '><span class="tk"></span></label></div>'
+ '<div class="gs-row"><span>换位提醒弹窗</span><label class="toggle"><input type="checkbox" id="loc-bubble-tg"' + (store.get('loc-bubble') === '0' ? '' : ' checked') + '><span class="tk"></span></label></div>'
+ '<div class="gs-row"><span>换位发到聊天</span><label class="toggle"><input type="checkbox" id="loc-chat-tg"' + (store.get('loc-chat') === '0' ? '' : ' checked') + '><span class="tk"></span></label></div>'
+ '</div>'
+ '<div class="gs-sub" style="padding:0 2px 10px">TA 自动换位：开启后每 2～6 小时随机换一次位置（关掉后到点也不换；「问 TA 一声」不受影响）。换位内容 70% 是陪伴卡（在你身边／一直没走远等），30% 从字卡库启用的位置卡里随机；每次换位都会记进「位置时间线」，换位内容与上一次不同时才算「换了位置」才弹提醒。<br>换位提醒弹窗：TA 自动换位置时顶部弹的黑色轻提示。<br>换位发到聊天：关掉后 TA 自动换位只记进「位置时间线」，不再发进聊天记录。<br>方位感知的【感知一下】：点了就先让 TA 当场换一次位置、再按新位置报方位，不用等那发 2～6 小时（不用打开任何开关，点了就是换）；它不受「TA 自动换位」总开关与夜间静默管（那两枚管的是 TA 自己到点来打扰），发进聊天与弹提醒仍照上面两枚开关。</div>';
html += '<button class="loc-ask-btn" id="loc-ask-btn">问 TA 一声「你在哪？」</button>';
body.innerHTML = html;
window.mochiHistDelBind(body, {
title: '删除这条位置记录？',
onDel: function (k) {
const p = String(k).split('|');
const ts = Number(p[1]) || 0, tx = p.slice(2).join('|');
const arr = loadHist();
const i = arr.findIndex(function (x) { return x && (Number(x.ts) || 0) === ts && String(x.text || '') === tx; });
if (i < 0) { if (typeof window.toast === 'function') window.toast('这条已经变了，没有删掉任何内容'); return; }
if (window.xyBigWriteBlocked && window.xyBigWriteBlocked(store, 'loc-history', '位置记录')) return;
arr.splice(i, 1);
saveHist(arr);
renderLocPanel();
if (typeof window.toast === 'function') window.toast('已删除这条位置记录');
}
});
const askBtn = document.getElementById('loc-ask-btn');
if (askBtn) askBtn.addEventListener('click', askWhere);
const bindLocTg = function (id, key) {
const tg = document.getElementById(id);
if (tg) tg.addEventListener('change', function () {
store.set(key, tg.checked ? '1' : '0');
if (key === 'loc-auto' && tg.checked) scheduleLocAuto();
});
};
bindLocTg('loc-auto-tg', 'loc-auto');
bindLocTg('loc-bubble-tg', 'loc-bubble');
bindLocTg('loc-chat-tg', 'loc-chat');
const prevBtn = document.getElementById('loc-day-prev');
if (prevBtn) prevBtn.addEventListener('click', () => { if (dayIdx < days.length - 1) { locViewDate = days[dayIdx + 1]; renderLocPanel(); } });
const nextBtn = document.getElementById('loc-day-next');
if (nextBtn) nextBtn.addEventListener('click', () => { if (dayIdx > 0) { locViewDate = days[dayIdx - 1]; renderLocPanel(); } });
}
function openLocPanel() {
const panel = document.getElementById('loc-panel');
const nameEl = document.getElementById('loc-name');
if (nameEl) nameEl.textContent = store.get('lbl-partner') || 'TA';
if (panel) panel.classList.add('loc-full');
if (window.refreshSense) window.refreshSense();
renderLocPanel();
if (panel) panel.hidden = false;
const ck = document.getElementById('ck-panel');
if (ck) ck.hidden = true;
}
function closeLocPanel() {
const panel = document.getElementById('loc-panel');
if (panel) { panel.hidden = true; panel.classList.remove('loc-full'); }
}
const entry = document.getElementById('ck-loc-entry');
if (entry) entry.addEventListener('click', () => openLocPanel());
const entryDesk = document.getElementById('ck-loc-entry-desk');
if (entryDesk) entryDesk.addEventListener('click', () => openLocPanel());
const locBack = document.getElementById('loc-back');
if (locBack) locBack.addEventListener('click', closeLocPanel);
try {
if (window.idbGet && !store.get('loc-history')) {
const myPrefix = window.activePrefix();
window.idbGet(myPrefix + ':loc-history').then(v => {
if (window.activePrefix() !== myPrefix) return;
if (v) { try { store.set('loc-history', typeof v === 'string' ? v : JSON.stringify(v)); } catch (e) {} }
});
}
} catch (e) {}
let locAutoTimer = null, locWakeAt = 0;
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') locWakeAt = Date.now() + 60000; });
function locTypeOf(text) {
if (window.locLibTypeOf) return window.locLibTypeOf(text);
return 'custom';
}
function doLocAuto() {
if (window.nightModeActive && window.nightModeActive()) return;
if (document.hidden || Date.now() < locWakeAt || !window.__mochiDataReady) return;
if (store.get('loc-auto') === '0') return; // 设置「TA 自动换位」关：到点也不发（拦设置后仍残留的当次定时器）
emitLocChange(null);
}
function emitLocChange(avoidText) {
const companion = ['在你身边', '一直没走远', '隔着世界在你身边', '隐约在你身旁', '在你看不到的地方']
.filter(function (t) { return !(window.locLibTextOff && window.locLibTextOff(t)); });
let text;
for (let retry = 0, tries = avoidText ? 3 : 1; retry < tries; retry++) {
if (companion.length && Math.random() < 0.7) {
text = companion[Math.floor(Math.random() * companion.length)];
} else {
const all = (window.locLibAllEnabled ? window.locLibAllEnabled() : []).slice();
if (!all.length) return false;
text = all[Math.floor(Math.random() * all.length)];
}
if (!avoidText || text !== avoidText) break;
}
if (!text) return false;
const type = locTypeOf(text);
const ts = Date.now();
const oldCur = loadCur();
if (store.get('loc-chat') !== '0' && window.chatAddIn) window.chatAddIn(text, { rateAllow: true });
saveCur({ text: text, type: type, ts: ts, auto: true });
const hist = loadHist();
hist.unshift({ text: text, type: type, ts: ts, auto: true });
saveHist(hist);
playLocFx(text, type);
locViewDate = dayStr(new Date());
renderLocPanel(); // #1436 换位落地必重画（旧写法＝只写库不重画，面板开着时「位置时间线」停在上一张＝用户看到「没记录」）
if (window.refreshSense) window.refreshSense();
if (oldCur && oldCur.text !== text) showLocChangeBubble(text);
return true;
}
window.locShiftNow = function () {
const c = loadCur();
return emitLocChange(c && c.text ? c.text : null);
};
function scheduleLocAuto() {
clearTimeout(locAutoTimer);
if (store.get('loc-auto') === '0') { locAutoTimer = setTimeout(scheduleLocAuto, 60000); return; }
locAutoTimer = setTimeout(() => { doLocAuto(); scheduleLocAuto(); }, (2 + Math.random() * 4) * 3600000);
}
function bootLocAuto() { if (!window.__mochiDataReady) { setTimeout(bootLocAuto, 500); return; } scheduleLocAuto(); }
document.addEventListener('mochi-restore-done', bootLocAuto);
setTimeout(bootLocAuto, 3000);
document.addEventListener('contact-switched', () => {
try { closeLocPanel(); locViewDate = ''; } catch (e) {}
});
window.playLocFx = playLocFx;
})();
(function () {
const store = window.activeStore();
const KEY = 'loc-sense';
const DIRS = [
{ k: '正前方', arrow: '↑', angle: -90 },
{ k: '右前方', arrow: '↗', angle: -45 },
{ k: '右侧',   arrow: '→', angle: 0 },
{ k: '右后方', arrow: '↘', angle: 45 },
{ k: '后方',   arrow: '↓', angle: 90 },
{ k: '左后方', arrow: '↙', angle: 135 },
{ k: '左侧',   arrow: '←', angle: 180 },
{ k: '左前方', arrow: '↖', angle: 225 }
];
const NEAR_WORDS = ['在你身边', '一直没走远', '隔着世界在你身边', '能摸到我吗', '陪你走着', '停下来等你', '抬头就能看到', '在你前面', '原地等你'];
const FAR_WORDS = ['在你看不到的地方', '在你看不到的地方偷看你', '再远一点', '就停这儿'];
function dirFromText(t) {
if (!t) return '';
if (t.indexOf('左边') >= 0) return '左侧';
if (t.indexOf('右边') >= 0) return '右侧';
if (t.indexOf('身后') >= 0 || t.indexOf('后面') >= 0) return '后方';
if (t.indexOf('前面') >= 0 || t.indexOf('抬头') >= 0) return '正前方';
return '';
}
function load() {
try {
const v = JSON.parse(store.get(KEY) || 'null');
if (v && typeof v === 'object') return v;
} catch (e) {}
return {};
}
function save(s) { store.set(KEY, JSON.stringify(s)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function esc(x) { return String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function senseWords(k) {
if (window.locLibSenseGroup) {
const w = window.locLibSenseGroup(k);
if (Array.isArray(w) && w.length) return w;
}
return { direct: ['无法判断'], rangef: ['无法判断'], power: ['若有若无'], touch: ['好像碰到了你的手'] }[k];
}
function isUndirected(d) { return d === '无法判断' || d === '身边'; }
function rollDir() {
const words = senseWords('direct');
const dir8 = DIRS.map(d => d.k).filter(k => words.indexOf(k) >= 0);
if (Math.random() >= 0.08) {
if (dir8.length) return pick(dir8);
const others = words.filter(w => !isUndirected(w));
return others.length ? pick(others) : '无法判断';
}
const pool = words.indexOf('身边') >= 0 ? ['无法判断', '无法判断', '无法判断', '身边'] : ['无法判断', '无法判断', '无法判断', '无法判断'];
return pick(pool);
}
function ensureDirInLib(d) {
const words = senseWords('direct');
if (words.indexOf(d) >= 0) return d;
return '无法判断';
}
function rollRangeAndPower() {
let hist = [];
try { hist = JSON.parse(store.get('loc-history') || '[]'); } catch (e) {}
let near = false, far = false;
for (let i = 0; i < hist.length && i < 5; i++) {
const t = hist[i].text || '';
if (NEAR_WORDS.some(w => t.indexOf(w) >= 0)) near = true;
if (FAR_WORDS.some(w => t.indexOf(w) >= 0)) far = true;
}
const rfWords = senseWords('rangef');
const pwWords = senseWords('power');
let rf, pw;
if (near && !far) {
const nearRf = rfWords.filter(w => w === '很近' || w === '近');
const nearPw = pwWords.filter(w => w === '明显');
rf = pick(nearRf.length ? nearRf : rfWords);
pw = pick(nearPw.length ? nearPw : pwWords);
} else if (far && !near) {
const farRf = rfWords.filter(w => w === '稍远' || w === '很远' || w === '无法判断');
const farPw = pwWords.filter(w => w === '微弱' || w === '若有若无');
rf = pick(farRf.length ? farRf : rfWords);
pw = pick(farPw.length ? farPw : pwWords);
} else {
rf = pick(rfWords);
pw = pick(pwWords);
}
return { rangef: rf, power: pw };
}
function getSense(force) {
const s = load();
const now = Date.now();
let dirty = false;
let cur = null;
try { cur = JSON.parse(store.get('loc-current') || 'null'); } catch (e) {}
const fixedDir = cur ? dirFromText(cur.text) : '';
if (fixedDir) {
if (s.dir !== fixedDir) {
s.dir = fixedDir;
s.nextDirAt = now + (15 + Math.floor(Math.random() * 31)) * 60000; // 15~45 分钟
dirty = true;
}
} else if (!s.dir || (s.nextDirAt && now >= s.nextDirAt) || force) {
s.dir = rollDir();
s.nextDirAt = now + (15 + Math.floor(Math.random() * 31)) * 60000; // 15~45 分钟
dirty = true;
} else {
s.dir = ensureDirInLib(s.dir);
}
if (!s.rangef || !s.power || force) {
const rp = rollRangeAndPower();
s.rangef = rp.rangef;
s.power = rp.power;
dirty = true;
}
if (dirty) save(s);
return s;
}
function maybeTouch(s) {
if (Math.random() >= 0.04) return null; // 4% 概率
const t = pick(senseWords('touch'));
s.touch = t;
s.touchAt = Date.now();
save(s);
if (window.playLocFx) window.playLocFx(t, 'touch');
return t;
}
function resultText(s, touched) {
const name = store.get('lbl-partner') || 'TA';
if (isUndirected(s.dir)) {
return '方位感知 · ' + name + '\n？ 暂时无法判断方向。\n但你似乎感觉到，有谁在附近。';
}
if (s.power === '消失') {
return '方位感知 · ' + name + '\n刚才似乎还在，现在已经感觉不到了。';
}
const arrows = DIRS.find(d => d.k === s.dir);
return '方位感知 · ' + name + '\n' + (arrows ? arrows.arrow + ' ' : '') + s.dir + '\n' + s.rangef + ' · ' + s.power +
(touched ? '\n……好像有什么轻轻碰了你一下。' : '');
}
function render() {
const s = getSense(false);
const circle = document.getElementById('fw-circle');
if (circle) {
circle.innerHTML = '';
const cx = 50, cy = 50, r = 36;
DIRS.forEach(d => {
const rad = d.angle * Math.PI / 180;
const x = cx + r * Math.cos(rad);
const y = cy + r * Math.sin(rad);
const b = document.createElement('button');
b.type = 'button';
b.className = 'fw-dir' + (s.dir === d.k ? ' on' : '');
b.textContent = d.arrow;
b.style.left = x + '%';
b.style.top = y + '%';
b.title = d.k;
circle.appendChild(b);
});
const me = document.createElement('div');
me.className = 'fw-me';
me.textContent = '你';
circle.appendChild(me);
const cur = document.createElement('div');
cur.id = 'fw-cur-dir';
cur.className = 'fw-cur-dir';
cur.textContent = s.dir || '无法判断';
circle.appendChild(cur);
}
const detail = document.getElementById('fw-detail');
if (detail) {
const arrows = DIRS.find(d => d.k === s.dir);
detail.innerHTML =
'<div class="fw-row"><span class="fw-row-label">方向</span><span class="fw-row-val">' + (arrows ? arrows.arrow + ' ' : '') + esc(s.dir) + '</span></div>' +
'<div class="fw-row"><span class="fw-row-label">距离感</span><span class="fw-row-val">' + esc(s.rangef) + '</span></div>' +
'<div class="fw-row"><span class="fw-row-label">感知强度</span><span class="fw-row-val">' + esc(s.power) + '</span></div>';
}
}
let perceiveCdUntil = 0;
function perceive() {
const btn = document.getElementById('fw-perceive');
const now = Date.now();
if (now < perceiveCdUntil) return;
perceiveCdUntil = now + 4000;
if (btn) { btn.classList.add('busy'); btn.disabled = true; }
if (window.locShiftNow) window.locShiftNow();
const s = getSense(true);
const touched = maybeTouch(s);
const result = document.getElementById('fw-result');
if (result) {
result.hidden = false;
result.innerHTML = '';
resultText(s, touched).split('\n').forEach(l => {
const p = document.createElement('p');
p.className = 'fw-p-line';
p.textContent = l;
result.appendChild(p);
});
}
render();
try {
const arrows2 = DIRS.find(d => d.k === s.dir);
let tlText;
if (isUndirected(s.dir)) {
tlText = '方位感知：暂时无法判断方向';
} else {
tlText = '方位感知：' + (arrows2 ? arrows2.arrow + ' ' : '') + s.dir + ' · ' + s.rangef + ' · ' + s.power;
}
if (touched) tlText += ' · 好像有什么轻轻碰了你一下';
if (window.locAddHist) window.locAddHist(tlText, 'sense', false);
if (window.locRefreshBody) window.locRefreshBody();
} catch (e) {}
setTimeout(() => {
if (btn) { btn.classList.remove('busy'); btn.disabled = false; }
}, 4000);
}
function passiveHint() {
const s = load();
const now = Date.now();
if (s.hintAt && now - s.hintAt < 3600000) return;
if (Math.random() >= 0.02) return; // 每次检查 2% 低概率
const gs = getSense(false);
if (isUndirected(gs.dir)) return;
const arrows = DIRS.find(d => d.k === gs.dir);
const name = store.get('lbl-partner') || 'TA';
if (window.toast) window.toast('……好像' + (arrows ? arrows.arrow + ' ' : '') + '有人在你' + gs.dir + '。');
s.hintAt = now;
save(s);
}
window.refreshSense = function () {
getSense(false);
render();
};
const perceiveBtn = document.getElementById('fw-perceive');
if (perceiveBtn) perceiveBtn.addEventListener('click', function (e) {
e.stopPropagation();
perceive();
});
let lastHintCheck = 0;
setInterval(function () {
const panel = document.getElementById('loc-panel');
if (panel && !panel.hidden) {
const s = load();
if (s.nextDirAt && Date.now() >= s.nextDirAt) { getSense(false); render(); }
}
if (Math.floor(Date.now() / 30000) !== lastHintCheck) {
lastHintCheck = Math.floor(Date.now() / 30000);
passiveHint();
}
}, 30000);
document.addEventListener('contact-switched', function () {
const panel = document.getElementById('loc-panel');
if (panel) panel.hidden = true;
});
})();
