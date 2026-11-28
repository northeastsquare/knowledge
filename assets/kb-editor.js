/* 知识库页面公共编辑脚本：✎ 编辑 / 保存 / ⌘·Ctrl+S 写回原 HTML。
 * 用法（放在 nav.js 之前）：
 *   <script src="assets/kb-editor.js" data-repo="owner/name" data-commit="完整 SHA" data-db="页面唯一名"></script>
 * 页面里的代码芯片：<a class="cl" href="…#L行号" data-path="仓库内路径" data-line="行号">
 *   href 必须直接写在 HTML 里；本脚本只在编辑模式改了芯片后重算该芯片的 href。
 *   芯片可用 data-repo / data-commit 覆盖默认仓库（一页引用多个仓库时）。
 * 保存时去掉 nav.js 注入的元素（head 里新增的节点、.kb-root）、contenteditable、本脚本注入的工具栏。
 */
(function () {
  'use strict';
  var me = document.currentScript;
  var REPO = me && me.getAttribute('data-repo');
  var COMMIT = me && me.getAttribute('data-commit');
  var DB = (me && me.getAttribute('data-db')) || ('kb-' + location.pathname);
  var headSnap = new Set(Array.prototype.slice.call(document.head.children));
  var body = document.body, bodyClass = body.getAttribute('class');
  var doc = document.getElementById('doc') || body;
  var dirty = false, handle = null;

  /* ---------- 工具栏：页面没写就注入 ---------- */
  var tools = document.getElementById('kb-tools'), injected = false;
  if (!tools) {
    injected = true;
    tools = document.createElement('div');
    tools.className = 'kb-tools'; tools.id = 'kb-tools';
    tools.innerHTML = '<button type="button" id="btn-edit">✎ 编辑</button><button type="button" id="btn-save">保存</button><span class="st" id="kb-st"></span>';
    if (!document.querySelector('style[data-kb-editor]')) {
      var css = document.createElement('style'); css.setAttribute('data-kb-editor', '');
      css.textContent = '.kb-tools{position:fixed;right:18px;bottom:18px;z-index:50;display:flex;gap:8px;align-items:center;background:#fff;border:1px solid #ccc;border-radius:12px;padding:8px 10px;box-shadow:0 6px 20px rgba(0,0,0,.08);font-size:13px}.kb-tools button{font:inherit;border:1px solid #ccc;background:#fff;border-radius:8px;padding:4px 10px;cursor:pointer}.kb-tools button.on{background:#222;color:#fff}.kb-tools .st{color:#888;min-width:64px}body.editing #doc .nd,body.editing #doc .wl,body.editing #doc p,body.editing #doc td,body.editing #doc li{outline:1px dashed rgba(0,120,140,.38);outline-offset:1px}@media print{.kb-tools{display:none}}';
      document.head.appendChild(css);
    }
    body.appendChild(tools);
  }
  var btnEdit = document.getElementById('btn-edit'), st = document.getElementById('kb-st');

  function hrefOf(a) {
    var repo = a.getAttribute('data-repo') || REPO, commit = a.getAttribute('data-commit') || COMMIT;
    var p = a.getAttribute('data-path'), l = a.getAttribute('data-line') || '1';
    if (!repo || !commit || !p) return a.getAttribute('href');
    return 'https://github.com/' + repo + '/blob/' + commit + '/' + p + (/\.mdx?$/.test(p) ? '?plain=1' : '') + '#L' + l;
  }
  function mark() { dirty = true; st.textContent = '未保存'; }

  /* ---------- 编辑 ---------- */
  function setEdit(on) {
    body.classList.toggle('editing', on);
    btnEdit.classList.toggle('on', on);
    btnEdit.textContent = on ? '✓ 完成编辑' : '✎ 编辑';
    if (on) doc.setAttribute('contenteditable', 'true'); else doc.removeAttribute('contenteditable');
  }
  btnEdit.addEventListener('click', function () { setEdit(!body.classList.contains('editing')); });
  doc.addEventListener('input', mark);
  doc.addEventListener('click', function (e) {
    if (!body.classList.contains('editing')) return;
    var a = e.target.closest('a.cl,a.pl'); if (!a) return;
    e.preventDefault();
    if (a.classList.contains('cl')) {
      var cur = a.getAttribute('data-path') + ':' + a.getAttribute('data-line');
      var v = prompt('代码位置（仓库内路径:行号）', cur); if (!v || v === cur) return;
      var m = v.trim().match(/^(.+?):(\d+)$/); if (!m) { alert('格式应为 path/to/file.py:123'); return; }
      a.setAttribute('data-path', m[1]); a.setAttribute('data-line', m[2]); a.setAttribute('href', hrefOf(a));
    } else {
      var h = prompt('链接地址', a.getAttribute('href')); if (!h) return; a.setAttribute('href', h);
    }
    mark();
  });
  doc.addEventListener('paste', function (e) {
    if (!body.classList.contains('editing')) return;
    e.preventDefault();
    document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain'));
  });

  /* ---------- 保存 ---------- */
  function serialize() {
    var c = document.documentElement.cloneNode(true);
    var lh = document.head.children, ch = c.querySelector('head').children;
    for (var i = lh.length - 1; i >= 0; i--) { if (!headSnap.has(lh[i])) ch[i].remove(); }
    c.querySelectorAll('.kb-root').forEach(function (n) { n.remove(); });
    if (injected) { var t = c.querySelector('#kb-tools'); if (t) t.remove(); }
    var cb = c.querySelector('body');
    if (bodyClass === null) cb.removeAttribute('class'); else cb.setAttribute('class', bodyClass);
    c.querySelectorAll('[contenteditable]').forEach(function (n) { n.removeAttribute('contenteditable'); });
    var cs = c.querySelector('#kb-st'); if (cs) cs.textContent = '';
    var ce = c.querySelector('#btn-edit'); if (ce) { ce.textContent = '✎ 编辑'; ce.classList.remove('on'); }
    return '<!DOCTYPE html>\n' + c.outerHTML + '\n';
  }
  function idb(mode, val) {
    return new Promise(function (res) {
      try {
        var r = indexedDB.open(DB, 1);
        r.onupgradeneeded = function () { r.result.createObjectStore('h'); };
        r.onsuccess = function () {
          var s = r.result.transaction('h', mode).objectStore('h');
          var q = mode === 'readonly' ? s.get(location.pathname) : s.put(val, location.pathname);
          q.onsuccess = function () { res(q.result); }; q.onerror = function () { res(null); };
        };
        r.onerror = function () { res(null); };
      } catch (e) { res(null); }
    });
  }
  async function save() {
    var html = serialize(), name = decodeURIComponent(location.pathname.split('/').pop() || 'page.html');
    if (window.showSaveFilePicker) {
      try {
        if (!handle) handle = await idb('readonly');
        if (handle && handle.requestPermission) {
          var ok = await handle.queryPermission({ mode: 'readwrite' });
          if (ok !== 'granted') ok = await handle.requestPermission({ mode: 'readwrite' });
          if (ok !== 'granted') handle = null;
        }
        if (!handle) {
          handle = await window.showSaveFilePicker({ suggestedName: name, types: [{ description: 'HTML', accept: { 'text/html': ['.html'] } }] });
          idb('readwrite', handle);
        }
        var w = await handle.createWritable(); await w.write(html); await w.close();
        dirty = false; st.textContent = '已保存 ' + new Date().toLocaleTimeString(); return;
      } catch (e) { if (e && e.name === 'AbortError') { st.textContent = '已取消'; return; } console.warn(e); }
    }
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' })); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    dirty = false; st.textContent = '已下载，替换原文件即可';
  }
  document.getElementById('btn-save').addEventListener('click', save);
  document.addEventListener('keydown', function (e) { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); } });
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
})();
