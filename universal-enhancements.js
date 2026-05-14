/* universal-enhancements.js
   Drop this on every sub-page.  Provides:
   · theme toggle (dark/light, persisted)
   · interactive dot-grid canvas
   · custom cursor
   · scroll reveal
   · active nav highlighting
   · lightbox for .gallery and .fig-grid figures
   · scroll-to-top button
   · reading progress bar
   · dropdown nav toggles
*/

(function () {
  /* ── 0. INJECT REQUIRED DOM ELEMENTS ────────────────────── */
  // Cursor dots
  if (!document.getElementById('cursor-dot')) {
    document.body.insertAdjacentHTML('afterbegin',
      '<div id="cursor-dot"></div><div id="cursor-ring"></div>');
  }
  // Canvas
  if (!document.getElementById('bg-canvas')) {
    const c = document.createElement('canvas');
    c.id = 'bg-canvas';
    document.body.insertAdjacentElement('afterbegin', c);
  }
  // Reading progress bar
  const bar = document.createElement('div');
  bar.className = 'reading-progress';
  document.body.prepend(bar);
  // Scroll-to-top btn
  const scrollBtn = document.createElement('button');
  scrollBtn.className = 'scroll-top-btn';
  scrollBtn.setAttribute('aria-label', 'Scroll to top');
  scrollBtn.innerHTML = '↑';
  document.body.appendChild(scrollBtn);

  /* ── 1. THEME ────────────────────────────────────────────── */
  const html   = document.documentElement;
  const saved  = localStorage.getItem('rv-theme') || 'dark';
  html.setAttribute('data-theme', saved);

  // Wire up toggle button — it may already exist in HTML or we create one
  function wireThemeToggle() {
    let btn = document.getElementById('themeToggle');
    if (!btn) {
      // Build one and inject into .nav-right (create .nav-right if missing)
      let navRight = document.querySelector('.nav-right');
      if (!navRight) {
        navRight = document.createElement('div');
        navRight.className = 'nav-right';
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.appendChild(navRight);
      }
      // Add resume CTA if missing
      if (!navRight.querySelector('.nav-cta')) {
        navRight.insertAdjacentHTML('beforeend',
          '<a href="Resume1 (2).pdf" target="_blank" class="nav-cta">Resume ↗</a>');
      }
      // Add toggle before CTA
      navRight.insertAdjacentHTML('afterbegin', `
        <button class="theme-toggle" id="themeToggle" aria-label="Toggle light/dark mode">
          <span class="toggle-icon icon-moon" aria-hidden="true">🌙</span>
          <span class="toggle-track"><span class="toggle-thumb"></span></span>
          <span class="toggle-icon icon-sun"  aria-hidden="true">☀️</span>
        </button>`);
      btn = document.getElementById('themeToggle');
    }
    btn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('rv-theme', next);
    });
  }
  wireThemeToggle();

  /* ── 2. CURSOR ───────────────────────────────────────────── */
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (dot && ring) {
    let mx=-200, my=-200, rx=-200, ry=-200;
    document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
    (function animCursor(){
      rx+=(mx-rx)*.18; ry+=(my-ry)*.18;
      dot.style.left=mx+'px';  dot.style.top=my+'px';
      ring.style.left=rx+'px'; ring.style.top=ry+'px';
      requestAnimationFrame(animCursor);
    })();
  }

  /* ── 3. CANVAS ───────────────────────────────────────────── */
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas ? canvas.getContext('2d') : null;
  if (ctx) {
    let W, H, dots = [], mouseX=-9999, mouseY=-9999;
    const SPACING=44, DOT_R=1.4, LINE_REACH=160, DOT_REACH=180;

    function buildGrid() {
      W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight;
      dots=[];
      for (let x=SPACING/2; x<W; x+=SPACING)
        for (let y=SPACING/2; y<H; y+=SPACING)
          dots.push({ ox:x, oy:y, x, y });
    }
    buildGrid();
    window.addEventListener('resize', buildGrid);
    document.addEventListener('mousemove', e=>{ mouseX=e.clientX; mouseY=e.clientY; });

    function drawBg() {
      ctx.clearRect(0,0,W,H);
      const isLight = html.getAttribute('data-theme')==='light';
      const dotBase=[79,142,247], lineColor=[79,142,247];
      const dotBaseA  = isLight ? 0.28 : 0.20;
      const dotForceA = isLight ? 0.75 : 0.80;
      const lineBaseA = isLight ? 0.32 : 0.28;

      dots.forEach(d=>{
        const dx=mouseX-d.ox, dy=mouseY-d.oy;
        const dist=Math.sqrt(dx*dx+dy*dy);
        const frc=Math.max(0,1-dist/DOT_REACH);
        d.x=d.ox-dx*frc*.22; d.y=d.oy-dy*frc*.22;
        const da=dotBaseA+frc*(dotForceA-dotBaseA);
        const ds=DOT_R+frc*2.2;
        ctx.beginPath(); ctx.arc(d.x,d.y,ds,0,Math.PI*2);
        ctx.fillStyle=`rgba(${dotBase[0]},${dotBase[1]},${dotBase[2]},${da})`; ctx.fill();
        if (dist<LINE_REACH) {
          const la=lineBaseA*(1-dist/LINE_REACH);
          const lw=0.6+(1-dist/LINE_REACH)*1.2;
          ctx.beginPath(); ctx.moveTo(d.x,d.y); ctx.lineTo(mouseX,mouseY);
          ctx.strokeStyle=`rgba(${lineColor[0]},${lineColor[1]},${lineColor[2]},${la})`;
          ctx.lineWidth=lw; ctx.stroke();
        }
      });
      if (mouseX>-100) {
        const r=isLight?80:100;
        const g=ctx.createRadialGradient(mouseX,mouseY,0,mouseX,mouseY,r);
        g.addColorStop(0,`rgba(79,142,247,${isLight?.10:.12})`);
        g.addColorStop(1,'rgba(79,142,247,0)');
        ctx.beginPath(); ctx.arc(mouseX,mouseY,r,0,Math.PI*2);
        ctx.fillStyle=g; ctx.fill();
      }
      requestAnimationFrame(drawBg);
    }
    drawBg();
  }

  /* ── 4. SCROLL REVEAL ────────────────────────────────────── */
  const revObs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold:0.1 });
  document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));

  /* ── 5. ACTIVE NAV ───────────────────────────────────────── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar a').forEach(a=>{
    const href = a.getAttribute('href');
    if (href && href === currentPage) a.classList.add('active');
    // also mark Home active on index
    if ((currentPage==='' || currentPage==='index.html') && href==='index.html') a.classList.add('active');
  });

  /* ── 6. READING PROGRESS ─────────────────────────────────── */
  window.addEventListener('scroll', ()=>{
    const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    bar.style.width = (scrolled*100) + '%';
  }, { passive:true });

  /* ── 7. SCROLL TO TOP ────────────────────────────────────── */
  window.addEventListener('scroll', ()=>{
    scrollBtn.classList.toggle('visible', window.scrollY > 300);
  }, { passive:true });
  scrollBtn.addEventListener('click', ()=> window.scrollTo({ top:0, behavior:'smooth' }));

  /* ── 8. DROPDOWN NAV TOGGLES ─────────────────────────────── */
  document.addEventListener('DOMContentLoaded', ()=>{
    [
      {wrapId:'projectsDrop', toggleId:'projectsToggle', menuId:'projectsMenu'},
      {wrapId:'researchDrop',  toggleId:'researchToggle',  menuId:'researchMenu'},
    ].forEach(({wrapId,toggleId,menuId})=>{
      const wrap=document.getElementById(wrapId);
      const tgl =document.getElementById(toggleId);
      const menu=document.getElementById(menuId);
      if (!wrap||!tgl||!menu) return;
      // In top-nav mode, dropdowns are hidden by CSS.
      // We keep the JS so middle-click still opens the page.
      tgl.addEventListener('auxclick', e=>{
        if (e.button===1) window.open(tgl.href,'_blank');
      });
    });
  });

  /* ── 9. LIGHTBOX ─────────────────────────────────────────── */
  // Build lightbox HTML once
  if (!document.getElementById('ue-lightbox')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="ue-lightbox">
        <div id="ue-lb-content">
          <button id="ue-lb-close">✕</button>
          <button class="ue-lb-nav ue-lb-prev">‹</button>
          <button class="ue-lb-nav ue-lb-next">›</button>
          <img   id="ue-lb-img" src="" alt="">
          <video id="ue-lb-vid" controls></video>
          <div   id="ue-lb-caption"></div>
          <div   id="ue-lb-counter"></div>
        </div>
      </div>`);

    const lb     = document.getElementById('ue-lightbox');
    const lbImg  = document.getElementById('ue-lb-img');
    const lbVid  = document.getElementById('ue-lb-vid');
    const lbCap  = document.getElementById('ue-lb-caption');
    const lbCnt  = document.getElementById('ue-lb-counter');
    const lbClose= document.getElementById('ue-lb-close');
    const lbPrev = document.querySelector('.ue-lb-prev');
    const lbNext = document.querySelector('.ue-lb-next');
    let items=[], idx=0;

    // Style the lightbox inline (matches index.html lightbox)
    Object.assign(lb.style, {
      display:'none', position:'fixed', inset:'0',
      background:'rgba(0,0,0,.97)', zIndex:'9999',
      alignItems:'center', justifyContent:'center',
      padding:'2rem', backdropFilter:'blur(10px)'
    });
    Object.assign(document.getElementById('ue-lb-content').style, {
      position:'relative', maxWidth:'90vw', maxHeight:'90vh'
    });
    [lbImg,lbVid].forEach(el=>{
      Object.assign(el.style, { maxWidth:'100%', maxHeight:'90vh', objectFit:'contain', borderRadius:'6px' });
    });
    const btnStyle = { position:'absolute', background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.2)', color:'rgba(255,255,255,.8)', borderRadius:'8px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.125rem', width:'40px', height:'40px' };
    Object.assign(lbClose.style, { ...btnStyle, top:'-3rem', right:'0' });
    Object.assign(lbPrev.style,  { ...btnStyle, fontSize:'1.5rem', width:'44px', height:'44px', top:'50%', left:'-4rem', transform:'translateY(-50%)' });
    Object.assign(lbNext.style,  { ...btnStyle, fontSize:'1.5rem', width:'44px', height:'44px', top:'50%', right:'-4rem', transform:'translateY(-50%)' });
    Object.assign(lbCap.style,   { position:'absolute', bottom:'-2.5rem', left:'0', right:'0', color:'rgba(255,255,255,.4)', textAlign:'center', fontSize:'.8125rem', fontFamily:'Inter,sans-serif' });
    Object.assign(lbCnt.style,   { position:'absolute', top:'-2.75rem', left:'0', color:'rgba(255,255,255,.35)', fontSize:'.75rem', fontFamily:'Inter,sans-serif' });

    function openLB(i) {
      idx=i;
      const fig=items[i];
      const img=fig.querySelector('img');
      const vid=fig.querySelector('video');
      const cap=fig.querySelector('figcaption');
      if (vid) {
        lbImg.style.display='none'; lbVid.style.display='block';
        const src=vid.querySelector('source');
        lbVid.src=src?src.src:vid.src; lbVid.load();
      } else {
        lbVid.style.display='none'; lbVid.pause();
        lbImg.style.display='block'; lbImg.src=img?img.src:'';
      }
      lbCap.textContent = cap?cap.textContent:'';
      lbCnt.textContent = `${i+1} / ${items.length}`;
      lbPrev.style.display = items.length>1?'flex':'none';
      lbNext.style.display = items.length>1?'flex':'none';
      lb.style.display='flex';
      document.body.style.overflow='hidden';
    }
    function closeLB() {
      lb.style.display='none'; lbVid.pause();
      document.body.style.overflow='';
    }
    function navLB(dir) { openLB((idx+dir+items.length)%items.length); }

    lbClose.addEventListener('click', closeLB);
    lb.addEventListener('click', e=>{ if(e.target===lb) closeLB(); });
    lbPrev.addEventListener('click', ()=>navLB(-1));
    lbNext.addEventListener('click', ()=>navLB(1));
    document.addEventListener('keydown', e=>{
      if (lb.style.display!=='flex') return;
      if (e.key==='Escape') closeLB();
      if (e.key==='ArrowLeft') navLB(-1);
      if (e.key==='ArrowRight') navLB(1);
    });

    // Initialise after DOM is fully loaded
    function initLB() {
      items = Array.from(document.querySelectorAll('.gallery figure, .fig-grid figure'));
      items.forEach((fig,i)=>{
        fig.style.cursor='pointer';
        // remove old listeners by cloning
        const fresh=fig.cloneNode(true);
        fig.parentNode.replaceChild(fresh,fig);
        items[i]=fresh;
        fresh.addEventListener('click', ()=>openLB(i));
      });
    }
    if (document.readyState==='loading') {
      document.addEventListener('DOMContentLoaded', initLB);
    } else {
      initLB();
    }
  }

  /* ── 10. PREFETCH ON HOVER ───────────────────────────────── */
  document.querySelectorAll('a[href$=".html"]').forEach(a=>{
    a.addEventListener('mouseenter', ()=>{
      const l=document.createElement('link');
      l.rel='prefetch'; l.href=a.href;
      document.head.appendChild(l);
    }, { once:true });
  });

})();