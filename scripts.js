// Tab switching without page reload
(function(){
  const tabBtns = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  function setActive(tab){
    tabBtns.forEach(b=>b.classList.toggle('active', b===tab));
    const target = tab.dataset.tab;
    contents.forEach(c=>c.classList.toggle('active', c.dataset.content===target));
    try{localStorage.setItem('heta-active-tab', target)}catch(e){}
    // update hash for deep-linking
    history.replaceState(null,'', '#'+target);
  }

  tabBtns.forEach(btn=>{
    btn.addEventListener('click', ()=> setActive(btn));
  });

  // Restore last tab or from hash
  const fromHash = location.hash.replace('#','');
  const saved = localStorage.getItem('heta-active-tab');
  const initial = Array.from(tabBtns).find(b => b.dataset.tab===fromHash) || Array.from(tabBtns).find(b => b.dataset.tab===saved) || document.querySelector('.tab-btn');
  if(initial) setActive(initial);
})();

// Reference image modal + upload handling
(function(){
  const thumb = document.getElementById('ref-thumb');
  if(!thumb) return;

  // create modal element
  const modal = document.createElement('div');
  modal.className = 'ref-modal';
  const img = document.createElement('img');
  modal.appendChild(img);
  document.body.appendChild(modal);

  function openModal(src){
    img.src = src;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    modal.classList.remove('open');
    document.body.style.overflow = '';
    img.src = '';
  }

  // click thumbnail to open
  thumb.addEventListener('click', ()=>{
    if(thumb.src) openModal(thumb.src);
  });

  // close when clicking outside img
  modal.addEventListener('click', (e)=>{
    if(e.target === modal) closeModal();
  });

  // close on Esc
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });
})();

// Load stamps from JSON file with fallback
(function(){
  const grid = document.getElementById('stamps-grid');
  if(!grid) return;

  const stampsPath = 'assets/stamps/';
  const listPath = 'assets/stamps/stamps-list.json';
  
  // Default fallback list (in case fetch fails with file:// protocol)
  const fallbackStamps = [
    "stamp0.png", "stamp1.png", "stamp2.png", "stamp3.png", "stamp4.png",
    "stamp5.png", "stamp6.jpg", "stamp7.gif", "stamp8.png", "stamp9.png",
    "stamp10.png", "stamp11.png", "stamp12.png", "stamp13.jpg", "stamp14.gif",
    "stamp15.png", "stamp16.png", "stamp17.png", "stamp18.jpg", "stamp19.gif",
    "stamp20.gif", "stamp21.png", "stamp22.png", "stamp23.png", "stamp24.png"
  ];
  
  function displayStamps(stamps) {
    grid.innerHTML = '';
    stamps.forEach(stamp => {
      const img = document.createElement('img');
      img.src = stampsPath + stamp;
      img.alt = stamp;
      grid.appendChild(img);
    });
  }
  
  // Try to fetch from JSON, fallback to embedded list
  fetch(listPath)
    .then(response => response.json())
    .then(stamps => displayStamps(stamps))
    .catch(() => displayStamps(fallbackStamps));
})();;

// Falling flower particle emitter using `assets/Poppy.png` (white base) with red-tint variant
(function(){
  const imgPath = 'assets/Poppy.png';
  const sprite = new Image();
  sprite.src = imgPath;

  // canvas overlay
  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  function resize(){
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, innerWidth * dpr);
    canvas.height = Math.max(1, innerHeight * dpr);
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener('resize', resize);
  resize();

  // tint cache (original and red)
  const tintCache = { orig: null, red: null };
  function makeTintedCanvas(color){
    const c = document.createElement('canvas');
    const w = sprite.naturalWidth || 64;
    const h = sprite.naturalHeight || 64;
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    g.clearRect(0,0,w,h);
    g.drawImage(sprite,0,0,w,h);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = color;
    g.fillRect(0,0,w,h);
    g.globalCompositeOperation = 'source-over';
    return c;
  }

  // Particle emitter that spawns across the entire viewport
  const particles = [];

  let lastSpawn = 0;
  const spawnInterval = 150; // ms between spawns (sparser)

  function ensureCaches(){
    if(!sprite.complete) return false;
    if(!tintCache.orig){
      const w = sprite.naturalWidth || 64;
      const h = sprite.naturalHeight || 64;
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(sprite,0,0,w,h);
      tintCache.orig = c;
      tintCache.red = makeTintedCanvas('#ff3b3b');
    }
    return true;
  }

  // animation loop: update particles, spawn continuously across screen, and draw
  function draw(){
    const now = performance.now();
    ensureCaches();
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // continuous spawn across the entire viewport
    if(now - lastSpawn >= spawnInterval){
      lastSpawn = now;
      // spawn particles randomly across the top
      const spawnX = Math.random() * innerWidth;
      const spawnY = -50; // start above the viewport
      // spawn petals sparsely
      const toSpawn = 1; // 1 particle per spawn
      for(let i=0;i<toSpawn;i++){
        // particles drift downward with jitter
        let size = ((Math.random()*0.6 + 0.6) * (sprite.naturalWidth || 24)) * (0.45 + Math.random()*0.6);
        size *= 1.3 + Math.random()*0.7; // overall bigger
        const isBloom = Math.random() < 0.4; // 40% chance for bloom variant
        // choose a speed category for variety (slower)
        let vyBase, ttl;
        const speedRoll = Math.random();
        if(speedRoll < 0.3) { // super slow
          vyBase = 0.02 + Math.random()*0.03;
          ttl = 60000 + Math.random()*20000; // much longer to reach bottom
        } else if(speedRoll < 0.6) { // normal
          vyBase = 0.05 + Math.random()*0.1;
          ttl = 40000 + Math.random()*15000;
        } else { // faster
          vyBase = 0.1 + Math.random()*0.1;
          ttl = 20000 + Math.random()*10000;
        }
        particles.push({
          x: spawnX + (Math.random()-0.5)*100, // spread out horizontally
          y: spawnY + (Math.random()-0.5)*20,
          vx: isBloom ? (0.3 + Math.random()*0.4) : (Math.random()-0.5)*0.25, // bloom moves right
          vy: isBloom ? (-0.1 - Math.random()*0.2) : vyBase,
          size,
          life: 0,
          ttl,
          rot: Math.random()*Math.PI*2,
          drot: (Math.random()-0.5)*0.12,
          tinted: Math.random() < 0.28
        });
      }
    }

    for(let i = particles.length - 1; i >= 0; i--){
      const p = particles[i];
      const dt = 16; // approx
      p.life += dt;
      if(p.y > innerHeight + 100 || p.life >= p.ttl){ particles.splice(i,1); continue; }
      // physics (constant speed, no acceleration)
      // p.vy += 0.04; // removed gravity for constant fall speed
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.drot;

      const alpha = 1 - (p.life / p.ttl);
      const size = p.size * (0.6 + 0.4*(1 - p.life / p.ttl));

      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      const drawCanvas = (p.tinted && tintCache.red) ? tintCache.red : (tintCache.orig || sprite);
      if(drawCanvas){
        const dw = size;
        const dh = size * ((drawCanvas.height || (sprite.naturalHeight||64)) / (drawCanvas.width || (sprite.naturalWidth||64)));
        ctx.drawImage(drawCanvas, -dw/2, -dh/2, dw, dh);
      }
      ctx.restore();
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);

  // cleanup
  function teardown(){
    window.removeEventListener('resize', resize);
    try{ canvas.remove(); }catch(e){}
  }
  window.addEventListener('pagehide', teardown);
  window.addEventListener('unload', teardown);
})();
