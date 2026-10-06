/* 寻踪功能移植自 Mochi 字卡 · 小红书 @言序（1842523578）。非商用，保留署名。
原项目：https://github.com/ling233330-star/mochi
适配：Mind 数据、导航与聊天接口。 */
(function(){
const ls=window.activeStore();
const grpToast=window.toast;
function escG(s){return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
window.cardGroups = {
genId: function () { return 'g' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36); },
toast: grpToast,
esc: escG,
dup: function (groups, name, ignoreId) { return groups.some(function (g) { return g.name === name && g.id !== ignoreId; }); },
addFlow: function (groups, cb) {
if (!window.openModal) { cb(null); return; }
window.openModal('新建分组', '', function (v) {
const name = String(v || '').trim();
if (!name) { cb(null); return; }
if (window.cardGroups.dup(groups, name)) { grpToast('分组「' + name + '」已存在'); cb(null); return; }
const g = { id: window.cardGroups.genId(), name: name };
groups.push(g);
cb(g);
});
},
renameFlow: function (g, groups, cb) {
if (!window.openModal) { cb(null); return; }
window.openModal('重命名分组', g.name, function (v) {
const name = String(v || '').trim();
if (!name) { cb(null); return; }
if (window.cardGroups.dup(groups, name, g.id)) { grpToast('分组「' + name + '」已存在'); cb(null); return; }
cb(name);
});
},
removeFlow: function (name, cb) {
if (!window.openModal) { cb(true); return; }
window.openModal('删除分组', '', function () { cb(true); }, { noInput: true, staticText: '删除分组「' + name + '」？组内字卡不会丢失，会回到「未分组」。' });
},
catOptsHtml: function (catList, groups, cur) {
let h = '';
catList.forEach(function (c) {
h += '<option value="' + c[0] + '"' + (cur === c[0] ? ' selected' : '') + '>' + escG(c[1]) + '</option>';
});
if (groups.length) {
h += '<optgroup label="我的分组">';
groups.forEach(function (g) { h += '<option value="grp:' + g.id + '"' + (cur === 'grp:' + g.id ? ' selected' : '') + '>' + escG(g.name) + '</option>'; });
h += '</optgroup>';
}
h += '<option value="__newgrp">＋ 新建分组…</option>';
return h;
},
grpOnlyOptsHtml: function (groups, cur) {
let h = '<option value="">未分组</option>';
groups.forEach(function (g) { h += '<option value="grp:' + g.id + '"' + (cur === 'grp:' + g.id ? ' selected' : '') + '>' + escG(g.name) + '</option>'; });
h += '<option value="__newgrp">＋ 新建分组…</option>';
return h;
},
parseCatVal: function (v) {
if (typeof v === 'string' && v.indexOf('grp:') === 0) return { cat: null, grp: v.slice(4) };
if (v === '__newgrp') return null;
return { cat: v || 'daily', grp: null };
},
bindNewGrp: function (sel, groups, onChanged) {
try { if (window.cardGroups) window.cardGroups.attachCustom(sel); } catch (e) {}
sel.__grpGroups = groups;
sel.__grpOnChanged = onChanged;
if (sel.__grpBound) return;
sel.__grpBound = true;
sel.addEventListener('change', function () {
if (sel.value !== '__newgrp') return;
window.cardGroups.addFlow(sel.__grpGroups || [], function (g) {
const first = sel.querySelector('option');
if (!g) { if (first) sel.value = first.value; return; }
if (sel.__grpOnChanged) sel.__grpOnChanged(g);
const opt = document.createElement('option');
opt.value = 'grp:' + g.id;
opt.textContent = g.name;
const nopt = sel.querySelector('option[value="__newgrp"]');
sel.insertBefore(opt, nopt);
sel.value = 'grp:' + g.id;
grpToast('已新建分组「' + g.name + '」');
});
});
},
attachCustom: function (sel) {
if (!sel || sel.nodeType !== 1 || sel.tagName !== 'SELECT' || sel.__mochiCsWrap) return;
sel.__mochiCsWrap = true;
const w = sel.offsetWidth || 0;
const wrap = document.createElement('span');
wrap.className = 'mochi-custom-select';
wrap.style.minWidth = (w || 96) + 'px';
wrap.style.width = w ? w + 'px' : 'auto';
const trig = document.createElement('button');
trig.type = 'button';
trig.className = 'mochi-custom-select-trig';
const label = document.createElement('span');
label.className = 'mochi-custom-select-label';
const caret = document.createElement('span');
caret.className = 'mochi-custom-select-caret';
caret.textContent = '▾';
trig.appendChild(label);
trig.appendChild(caret);
const list = document.createElement('div');
list.className = 'mochi-custom-select-list';
wrap.appendChild(trig);
wrap.appendChild(list);
sel.classList.add('mochi-custom-select-native'); // display:none 隐藏原生，value/change 仍可读写
sel.parentNode.insertBefore(wrap, sel);
let open = false;
let closeFns = [];
function setLabel() {
const cur = String(sel.value);
const opts = sel.querySelectorAll('option');
for (let i = 0; i < opts.length; i++) {
if (String(opts[i].value) === cur) { label.textContent = opts[i].textContent; return; }
}
const first = sel.querySelector('option');
label.textContent = first ? first.textContent : '请选择';
}
function closeAll() {
open = false;
wrap.classList.remove('open');
if (list.parentNode === document.body) {
try { list.style.display = 'none'; document.body.removeChild(list); } catch (err) {}
} else {
list.style.display = 'none';
}
closeFns.forEach(function (fn) { if (fn) fn(); });
closeFns = [];
}
function openList() {
const rect = trig.getBoundingClientRect();
const vw = window.innerWidth || document.documentElement.clientWidth;
const vh = window.innerHeight || document.documentElement.clientHeight;
const panelW = Math.max(rect.width, 120);
const availBelow = vh - rect.bottom - 8;
const dropH = Math.max(120, Math.min(34 * vh / 100, availBelow));
list.style.width = panelW + 'px';
list.style.maxHeight = (availBelow < 120 ? Math.max(120, vh - 16) : dropH) + 'px';
list.style.position = 'fixed';
list.style.zIndex = 9999;
let top = rect.bottom + 4;
if (top + dropH > vh - 8) top = Math.max(8, rect.top - 4 - Math.min(dropH, vh - 16));
top = Math.max(8, Math.min(top, vh - 8 - Math.min(parseInt(list.style.maxHeight, 10) || dropH, vh - 16)));
const left = Math.min(Math.max(4, rect.left), Math.max(4, vw - panelW - 4));
list.style.left = left + 'px';
list.style.top = top + 'px';
document.body.appendChild(list);
list.style.display = 'block';
open = true;
wrap.classList.add('open');
rebuild(); // 打开时刷新选中高亮/toLabel
const onScroll = function (e) { if (!e || !list.contains(e.target)) closeAll(); };
const onResize = function () { closeAll(); };
window.addEventListener('scroll', onScroll, true);
window.addEventListener('resize', onResize);
closeFns.push(function () {
window.removeEventListener('scroll', onScroll, true);
window.removeEventListener('resize', onResize);
});
}
function setOpen(v) { if (v) openList(); else closeAll(); }
function addOpt(opt) {
const b = document.createElement('button');
b.type = 'button';
b.className = 'mochi-cs-opt' + (String(opt.value) === String(sel.value) ? ' on' : '');
b.textContent = opt.textContent || '';
b.addEventListener('click', function (e) {
e.stopPropagation();
if (String(opt.value) === String(sel.value)) { setOpen(false); return; }
sel.value = opt.value;
try { sel.dispatchEvent(new Event('change', { bubbles: true })); } catch (err) {}
setLabel();
setOpen(false);
rebuild();
});
list.appendChild(b);
}
function rebuild() {
list.innerHTML = '';
Array.prototype.forEach.call(sel.children, function (ch) {
if (ch.tagName === 'OPTGROUP') {
const g = document.createElement('div');
g.className = 'mochi-cs-group';
g.textContent = ch.label || '';
list.appendChild(g);
Array.prototype.forEach.call(ch.querySelectorAll('option'), addOpt);
} else if (ch.tagName === 'OPTION') {
addOpt(ch);
}
});
setLabel();
}
trig.addEventListener('click', function (e) { e.stopPropagation(); if (open) closeAll(); else openList(); });
document.addEventListener('mousedown', function (e) {
if (!open) return;
if (list.contains(e.target) || trig.contains(e.target)) return;
closeAll();
}, true);
document.addEventListener('touchstart', function (e) {
if (!open) return;
if (list.contains(e.target) || trig.contains(e.target)) return;
closeAll();
}, true);
document.addEventListener('contact-switched', closeAll, false);
document.addEventListener('visibilitychange', function () { closeAll(); }, false);
if (typeof MutationObserver !== 'undefined') {
new MutationObserver(function () { if (wrap && list) rebuild(); })
.observe(sel, { childList: true, subtree: true });
}
rebuild();
},
ensureCustomSelects: function () {
var selSel = 'select.ta-type, select.tc-input, select.gm-input, select.ti-type';
document.querySelectorAll(selSel).forEach(function (s) { window.cardGroups.attachCustom(s); });
if (window.__mochiCsObserver || typeof MutationObserver === 'undefined') return;
window.__mochiCsObserver = true;
new MutationObserver(function (muts) {
muts.forEach(function (m) {
m.addedNodes.forEach(function (n) {
if (!n || n.nodeType !== 1) return;
if (n.matches && n.matches(selSel)) { window.cardGroups.attachCustom(n); return; }
if (n.childElementCount <= 60 && n.querySelectorAll) {
const f = n.querySelectorAll(selSel);
for (let i = 0; i < f.length; i++) window.cardGroups.attachCustom(f[i]);
}
});
});
}).observe(document.body, { childList: true, subtree: true });
}
};
const PG_KEY = 'pg-groups-off';
let pgRaw = null, pgObj = null;   // 单格缓存：原始值没变才复用解析结果（切桌面＝自动重解析）
function pgRecord(st) {
let raw = null;
try { raw = (st || ls).get(PG_KEY); } catch (e) { return null; }
if (raw === pgRaw) return pgObj;
let o = null;
try {
if (raw) { const p = JSON.parse(raw); if (p && typeof p === 'object' && !Array.isArray(p)) o = p; }
} catch (e) {}
pgRaw = raw; pgObj = o;
return o;
}
function pgIsOff(id, grp, st) {
const o = pgRecord(st);
const names = o && o[id];
return !!(names && names.indexOf(grp) >= 0);
}
function pgSet(id, grp, off) {
const cur = pgRecord(ls) || {};
const arr = (cur[id] || []).slice();
const i = arr.indexOf(grp);
if (off && i < 0) arr.push(grp);
if (!off && i >= 0) arr.splice(i, 1);
const next = {};
Object.keys(cur).forEach(k => { if (k !== id && Array.isArray(cur[k]) && cur[k].length) next[k] = cur[k].slice(); });
if (arr.length) next[id] = arr;
ls.set(PG_KEY, JSON.stringify(next));
}
function pgNames(id) {
const o = pgRecord(ls);
const names = o && o[id];
return Array.isArray(names) ? names.slice() : [];
}
function pgSwitchHTML(off) {
return '<label class="toggle ccard-toggle ccg-switch" title="' + (off ? '启用该分组' : '停用该分组') + '">' +
'<input type="checkbox"' + (off ? '' : ' checked') + '><span class="tk"></span></label>';
}
function pgOffTag(off) { return off ? '<em class="ccg-off-tag">已停用</em>' : ''; }
function pgWire(scopeEl, id, grp, onChange) {
if (!scopeEl) return;
const input = scopeEl.querySelector('.ccg-switch input');
if (!input) return;
input.addEventListener('change', () => {
const nowOff = !input.checked;
pgSet(id, grp, nowOff);
if (typeof onChange === 'function') onChange(nowOff, grp);
});
}
function pgCatBar(id, grp, label) {
const off = pgIsOff(id, grp);
return '<div class="set-group glass preset-cat-bar"><div class="gs-row"><span>整组停用「' + label + '」' +
pgOffTag(off) + '</span>' + pgSwitchHTML(off) + '</div></div>';
}
window.presetGroup = {
KEY: PG_KEY,
isOff: pgIsOff,
set: pgSet,
names: pgNames,
switchHTML: pgSwitchHTML,
offTag: pgOffTag,
bind: pgWire,
bindBar: pgWire,   // 分组头与整类停用条用的是同一形态（.ccg-switch），两个名字都给，调用方按语义读
catBar: pgCatBar,
headerHTML: function (id, grp, label, count, extra) {
const off = pgIsOff(id, grp);
return '<span class="ccg-name">' + label + pgOffTag(off) + '</span><span class="ccg-count">' + count + '</span>' +
(extra || '') + pgSwitchHTML(off);
}
};

const HIST_FOLD_OPEN = {};
function histFoldRemember(e) {
try {
const el = e.target;
if (!el || el.tagName !== 'DETAILS' || !el.getAttribute) return;
const fk = el.getAttribute('data-hist-fold');
if (!fk) return;
HIST_FOLD_OPEN[fk] = el.open ? 1 : 0;
} catch (err) {}
}
if (!window.__mochiHistFoldBound) {
window.__mochiHistFoldBound = 1;
try { document.addEventListener('toggle', histFoldRemember, true); } catch (err) {}
}
window.mochiHistFold = function (items, opts) {
const o = opts || {};
const list = (Array.isArray(items) ? items : []).filter(x => x && typeof x.html === 'string');
if (!list.length) return o.empty || '';
const dayKey = (t) => { const d = new Date(t); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
const today = dayKey(Date.now());
const todayItems = [], months = {}, monthKeys = [];
list.slice().sort((a, b) => (b.ts || 0) - (a.ts || 0)).forEach(x => {
const dk = x.ts ? dayKey(x.ts) : '';
if (dk === today) { todayItems.push(x); return; }
const d = x.ts ? new Date(x.ts) : null;
const mk = d ? d.getFullYear() + '-' + (d.getMonth() + 1) : 'none';
if (!months[mk]) { months[mk] = { label: d ? d.getFullYear() + '年' + (d.getMonth() + 1) + '月' : '更早', rank: d ? d.getFullYear() * 12 + d.getMonth() : -1, days: {}, dayKeys: [] }; monthKeys.push(mk); }
const m = months[mk], key = dk || 'none';
if (!m.days[key]) { m.days[key] = { label: d ? mochiHistDayLabel(d) : '更早', items: [] }; m.dayKeys.push(key); }
m.days[key].items.push(x);
});
monthKeys.sort((a, b) => months[b].rank - months[a].rank);
let html = todayItems.length ? todayItems.map(x => x.html).join('') : (o.todayEmpty || '');
const fkBase = (typeof o.key === 'string' && o.key) ? o.key : 'hist';
return html + monthKeys.map(mk => {
const m = months[mk];
const cnt = m.dayKeys.reduce((n, k) => n + m.days[k].items.length, 0);
const fk = fkBase + '|' + mk;
return '<details class="dc-h-more"' + (HIST_FOLD_OPEN[fk] ? ' open' : '') + ' data-hist-fold="' + fk + '"><summary class="dc-h-more-sum">' + m.label + '<span class="dc-h-more-cnt">' + cnt + ' 条</span></summary><div class="dc-h-more-body">' +
m.dayKeys.map(dk => '<div class="dc-h-day"><div class="dc-h-day-label">' + m.days[dk].label + '</div>' + m.days[dk].items.map(x => x.html).join('') + '</div>').join('') +
'</div></details>';
}).join('');
};
function mochiHistDayLabel(d) {
const now = new Date(), t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const one = 864e5, d0 = new Date(d.getFullYear(), d.getMonth(), d.getDate());
const diff = Math.round((t - d0) / one);
if (diff === 1) return '昨天';
if (diff === 2) return '前天';
const md = (d.getMonth() + 1) + '月' + d.getDate() + '日';
return d.getFullYear() === now.getFullYear() ? md : d.getFullYear() + '年' + md;
}
window.mochiHistDel = function (key, label) {
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
return '<button type="button" class="hist-del" data-hist-del="' + esc(key) + '" data-hist-label="' + esc(label) + '"' +
' style="float:right;margin:0 0 2px 8px;border:0;background:none;color:inherit;opacity:.42;font-size:11px;font-weight:400;padding:2px 2px;cursor:pointer">删除</button>';
};
window.mochiHistDelBind = function (el, opts) {
const o = opts || {};
if (!el || el.__mochiHistDelBound || typeof o.onDel !== 'function') return;
el.__mochiHistDelBound = 1;
el.addEventListener('click', function (e) {
const btn = e.target && e.target.closest ? e.target.closest('.hist-del') : null;
if (!btn || !el.contains(btn)) return;
e.preventDefault(); e.stopPropagation();
const key = btn.getAttribute('data-hist-del') || '';
const label = btn.getAttribute('data-hist-label') || '';
if (typeof window.mochiDataPending === 'function' && window.mochiDataPending()) {
try { if (typeof window.toast === 'function') window.toast('记录还在读取，稍等一下再删'); } catch (er) {}
return;
}
if (typeof window.openModal !== 'function') { try { o.onDel(key); } catch (er) {} return; }
window.openModal(o.title || '删除这条记录？', '', function (v) {
if (v === 'ok') { try { o.onDel(key); } catch (er) {} }
}, { noInput: true, staticText: label ? ('「' + label + '」') : (o.what || '这一条') });
}, true); // 捕获阶段：心意柜这类「整行本身可点开详情」的列表，必须抢在行自己的 click 之前拦下，
};

})();