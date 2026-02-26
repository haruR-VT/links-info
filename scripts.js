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

// Load stamps - embedded list works with file:// protocol too
(function(){
  const grid = document.getElementById('stamps-grid');
  if(!grid) return;

  const stampsPath = 'assets/stamps/';
  const stamps = [
    "stamp0.png",
    "stamp1.png",
    "stamp2.png",
    "stamp3.png",
    "stamp4.png",
    "stamp5.png",
    "stamp6.jpg",
    "stamp7.gif",
    "stamp8.png",
    "stamp9.png",
    "stamp10.png",
    "stamp11.png",
    "stamp12.png",
    "stamp13.jpg",
    "stamp14.gif",
    "stamp15.png",
    "stamp16.png",
    "stamp17.png",
    "stamp18.jpg",
    "stamp19.gif",
    "stamp20.gif"
  ];
  
  grid.innerHTML = '';
  stamps.forEach(stamp => {
    const img = document.createElement('img');
    img.src = stampsPath + stamp;
    img.alt = stamp;
    grid.appendChild(img);
  });
})();;
