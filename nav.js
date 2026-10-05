/* 知识库全局导航 —— 每个页面末尾引入 <script src="nav.js"></script> 即可 */
(function () {
  'use strict';

  /* ---------- 单一数据源：分类与页面 ---------- */
  var HOME = { title: '机器人学习知识库', href: 'index.html' };
  var CATS = [
    {
      id: 'MAP', name: 'VLA 总览', items: [
        { t: 'VLA 发展史｜从模块化到闭环具身', h: 'VLA-发展历程.html' },
        { t: 'Google / DeepMind 的 VLA 发展史', h: 'Google-VLA-发展历程.html' }
      ]
    },
    {
      id: '00', name: '专题 · 方法对比', items: [
        { t: '为什么要取 log？（交互推导）', h: '为什么取log.html' },
        { t: '主干 A / 主干 B：两台机器拆开看', h: '两条主干-拆机手册.html' },
        { t: 'RLinf RL 方法：原理视角对比', h: 'RLinf-RL原理对比.html' },
        { t: 'RLinf 里的 RL 方法详细对比', h: 'RLinf-RL方法对比.html' },
        { t: 'VLA 强化学习方法全景对比', h: 'VLA-RL-方法全景对比.html' },
        { t: 'OpenVLA vs π 系列：动作怎么生成', h: 'OpenVLA-vs-pi系列-对比.html' }
      ]
    },
    {
      id: '01', name: 'π 系列 VLA', items: [
        { t: 'π0', h: 'pi0-论文解读.html' },
        { t: 'π0.5', h: 'pi0.5_论文测验_精美版.html' },
        { t: 'π0.6', h: 'pi0.6-论文解读.html' },
        { t: 'π0.7', h: 'pi0.7_问答学习卡.html' }
      ]
    },
    {
      id: '02', name: 'VLA 与强化学习', items: [
        { t: 'RL Token', h: 'RL-Token-论文解读.html' },
        { t: 'RL Token · 漫画分镜版', h: 'RLToken-漫画分镜解读.html' },
        { t: 'πRL', h: 'piRL-论文解读.html' },
        { t: 'Object-Centric Residual RL', h: 'ObjectCentric-RL-论文解读.html' },
        { t: 'DynamicVLA', h: 'DynamicVLA-论文解读.html' },
        { t: 'PUMA', h: 'PUMA-论文解读.html' },
        { t: 'Qwen-VLA', h: 'Qwen-VLA-论文解读.html' },
        { t: 'Realtime-VLA FLASH', h: 'Realtime-VLA-论文解读.html' }
      ]
    },
    {
      id: '03', name: '数据与 3D 视觉', items: [
        { t: 'InternData-A1', h: 'InternData-A1-论文解读.html' },
        { t: 'D4RT', h: 'D4RT_study_cards.html' }
      ]
    }
  ];

  var cur = '';
  try { cur = decodeURIComponent((location.pathname.split('/').pop() || '')); } catch (e) { cur = ''; }
  var isHome = cur === '' || cur === 'index.html';

  /* ---------- 样式（自包含，深色 chrome，不依赖页面主题变量） ---------- */
  var css = [
    '.kb-navbar{position:fixed;top:0;left:0;right:0;height:48px;z-index:99990;display:flex;align-items:center;gap:14px;padding:0 16px;background:#0f1c26;border-bottom:1px solid rgba(255,255,255,.09);box-shadow:0 1px 0 rgba(0,0,0,.25);font-family:"IBM Plex Sans",-apple-system,"Segoe UI","Microsoft YaHei","PingFang SC",sans-serif;}',
    '.kb-brand{display:inline-flex;align-items:center;gap:9px;text-decoration:none;color:#e7eef4;font-family:"IBM Plex Mono",ui-monospace,Consolas,monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;}',
    '.kb-brand b{color:#3fb0d0;font-weight:600;}',
    '.kb-brand:hover b{color:#8fd3e6;}',
    '.kb-cur{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#9db0bd;font-size:12.5px;letter-spacing:.02em;}',
    '.kb-concepts{color:#8fd3e6;text-decoration:none;white-space:nowrap;font-size:13px;}',
    '.kb-concepts:hover,.kb-concepts:focus-visible{text-decoration:underline;text-underline-offset:4px;}',
    '@media(max-width:560px){.kb-brand-label{display:none}.kb-navbar{gap:10px;padding:0 12px}.kb-menu,.kb-concepts{flex-shrink:0}}',
    '.kb-menu{display:inline-flex;align-items:center;gap:8px;background:transparent;color:#c7d4de;border:1px solid rgba(255,255,255,.22);border-radius:999px;padding:6px 13px;cursor:pointer;font-family:"IBM Plex Mono",ui-monospace,Consolas,monospace;font-size:12px;letter-spacing:.06em;transition:border-color .15s ease,color .15s ease,background .15s ease;}',
    '.kb-menu:hover{border-color:#3fb0d0;color:#fff;background:rgba(63,176,208,.12);}',
    '.kb-menu svg{width:14px;height:14px;flex:none;}',
    '.kb-backdrop{position:fixed;inset:0;z-index:99995;background:rgba(5,10,15,.55);backdrop-filter:blur(2px);opacity:0;pointer-events:none;transition:opacity .2s ease;}',
    '.kb-open .kb-backdrop{opacity:1;pointer-events:auto;}',
    '.kb-drawer{position:fixed;top:0;left:0;bottom:0;width:min(340px,88vw);z-index:99999;background:#0e1a24;border-right:1px solid rgba(255,255,255,.09);transform:translateX(-102%);transition:transform .24s cubic-bezier(.2,.7,.2,1);display:flex;flex-direction:column;box-shadow:12px 0 40px rgba(0,0,0,.4);}',
    '.kb-open .kb-drawer{transform:translateX(0);}',
    '.kb-drawer-head{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.09);}',
    '.kb-drawer-head .t{color:#e7eef4;font-family:"IBM Plex Serif","Noto Serif SC","Songti SC",serif;font-size:16px;font-weight:600;}',
    '.kb-drawer-head .close{background:transparent;border:1px solid rgba(255,255,255,.22);color:#c7d4de;border-radius:8px;width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;line-height:1;}',
    '.kb-drawer-head .close:hover{color:#fff;border-color:#3fb0d0;}',
    '.kb-scroll{flex:1;overflow-y:auto;padding:10px 0 24px;}',
    '.kb-home{display:block;margin:6px 12px 4px;padding:10px 14px;border-radius:8px;text-decoration:none;color:#3fb0d0;font-weight:600;font-size:14px;}',
    '.kb-home:hover{background:rgba(63,176,208,.1);}',
    '.kb-cat{margin:14px 12px 2px;}',
    '.kb-cat .lab{display:flex;align-items:baseline;gap:9px;color:#9db0bd;font-family:"IBM Plex Mono",ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;padding:0 6px 6px;}',
    '.kb-cat .lab .no{color:#3fb0d0;font-weight:600;}',
    '.kb-item{position:relative;display:block;margin:1px 12px;padding:8px 14px 8px 30px;border-radius:8px;text-decoration:none;color:#c7d4de;font-size:13.5px;line-height:1.5;}',
    '.kb-item:hover{background:rgba(255,255,255,.06);color:#fff;}',
    '.kb-item.on{background:rgba(63,176,208,.14);color:#eaf6fa;font-weight:600;}',
    '.kb-item.on::before{content:"";position:absolute;left:12px;top:50%;transform:translateY(-50%);width:7px;height:7px;border-radius:50%;background:#3fb0d0;}',
    '.kb-item .ar{position:absolute;right:12px;top:50%;transform:translateY(-50%);opacity:0;color:#3fb0d0;font-family:"IBM Plex Mono",monospace;transition:opacity .15s ease;}',
    '.kb-item:hover .ar{opacity:1;}',
    'body.kb-locked{overflow:hidden;}',
    'body{padding-top:48px;}'
  ].join('\n');

  function mount() {
    if (document.querySelector('.kb-navbar')) return;

    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var root = document.createElement('div');
    root.className = 'kb-root';

    var itemsHtml = CATS.map(function (cat) {
      var lis = cat.items.map(function (it) {
        var on = (cur === it.h) ? ' on' : '';
        return '<a class="kb-item' + on + '" href="' + it.h + '"><span>' + it.t + '</span><span class="ar">→</span></a>';
      }).join('');
      return '<div class="kb-cat"><div class="lab"><span class="no">' + cat.id + '</span>' + cat.name + '</div>' + lis + '</div>';
    }).join('');

    root.innerHTML =
      '<nav class="kb-navbar">' +
        '<a class="kb-brand" href="' + HOME.href + '" aria-label="机器人学习知识库首页"><b>KB</b><span class="kb-brand-label">/ ROBOTIC LEARNING</span></a>' +
        '<span class="kb-cur">' + (isHome ? HOME.title : (cur === 'concepts.html' ? '关键概念索引' : '研读档案')) + '</span>' +
        '<a class="kb-concepts" href="concepts.html">概念索引</a>' +
        '<button class="kb-menu" type="button" aria-label="打开目录">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>目录' +
        '</button>' +
      '</nav>' +
      '<div class="kb-backdrop"></div>' +
      '<aside class="kb-drawer">' +
        '<div class="kb-drawer-head"><span class="t">知识库目录</span><button class="close" type="button" aria-label="关闭">×</button></div>' +
        '<div class="kb-scroll">' +
          '<a class="kb-home' + (isHome ? ' on' : '') + '" href="' + HOME.href + '">← 返回首页</a>' +
          '<a class="kb-home' + (cur === 'concepts.html' ? ' on' : '') + '" href="concepts.html">按概念串读 →</a>' +
          itemsHtml +
        '</div>' +
      '</aside>';

    document.body.appendChild(root);

    function setOpen(v) {
      root.classList.toggle('kb-open', v);
      document.body.classList.toggle('kb-locked', v);
    }
    var menu = root.querySelector('.kb-menu');
    var close = root.querySelector('.kb-drawer-head .close');
    var backdrop = root.querySelector('.kb-backdrop');
    menu.addEventListener('click', function () { setOpen(true); });
    close.addEventListener('click', function () { setOpen(false); });
    backdrop.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('kb-open')) setOpen(false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
