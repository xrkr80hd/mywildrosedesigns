
// ============================================
// WILD ROSE DESIGN - ENHANCED INTERACTIONS
// ============================================

// Enhanced helpers
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeEnhancements();
    initializeAnimations();
    initializeNavigation();
    initializeScrollEffects();
});

// Enhanced Navigation with Active States
function initializeNavigation() {
    const links = $$('.nav a');
    const currentPage = location.pathname.split('/').pop() || 'index.php';
    
    links.forEach(a => {
        const href = a.getAttribute('href');
        if (href === currentPage || href.replace('.html', '.php') === currentPage) {
            a.classList.add('active');
        }
        
        // Add hover effects
        a.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        a.addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.transform = 'translateY(0)';
            }
        });
    });
}

// Smooth Scroll Effects and Reveal Animations
function initializeScrollEffects() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Add fade-in-up class to cards and animate them
    $$('.card, .product-card, .stat-card').forEach((el, index) => {
        el.classList.add('fade-in-up');
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
    
    // Parallax effect for hero section
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const parallaxElements = $$('.hero-img, .hero::before');
        
        parallaxElements.forEach(el => {
            const speed = el.dataset.speed || 0.5;
            el.style.transform = `translateY(${scrolled * speed}px)`;
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

// Enhanced Animations and Interactions
function initializeAnimations() {
    // Floating animation for pills
    $$('.pill').forEach((pill, index) => {
        pill.style.animationDelay = `${index * 0.5}s`;
    });
    
    // Enhanced button interactions
    $$('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
        
        btn.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(0) scale(0.98)';
        });
        
        btn.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
    });
    
    // Card hover effects with tilt
    $$('.card, .product-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) rotateY(5deg) rotateX(5deg)';
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotateY(0) rotateX(0)';
        });
        
        card.addEventListener('mousemove', function(e) {
            if (!this.matches(':hover')) return;
            
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `translateY(-8px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
        });
    });
}

// Enhanced Modal Functionality
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Close on backdrop click
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideModal(modalId);
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                hideModal(modalId);
            }
        });
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Enhanced Loading States
function showLoading(element) {
    if (element) {
        const originalText = element.textContent;
        element.innerHTML = '<span class="loading"></span> Loading...';
        element.disabled = true;
        
        return function hideLoading() {
            element.textContent = originalText;
            element.disabled = false;
        };
    }
}

// Enhanced Toast Notifications
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 2rem;
        border-radius: 1rem;
        color: white;
        font-weight: 500;
        z-index: 1100;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    `;
    
    // Set background based on type
    const backgrounds = {
        success: 'linear-gradient(135deg, #20C997, #17A2B8)',
        error: 'linear-gradient(135deg, #DC3545, #BD2130)',
        warning: 'linear-gradient(135deg, #FFC107, #E0A800)',
        info: 'linear-gradient(135deg, #17A2B8, #138496)'
    };
    
    toast.style.background = backgrounds[type] || backgrounds.info;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, duration);
}

// Enhanced Form Validation
function enhanceFormValidation() {
    $$('form').forEach(form => {
        const inputs = $$('input, textarea, select', form);
        
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });
        
        form.addEventListener('submit', function(e) {
            let isValid = true;
            
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showToast('Please fix the errors in the form', 'error');
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        isValid = false;
        message = 'Please enter a valid email address';
    }
    
    // Update field styling
    if (isValid) {
        field.classList.remove('error');
        removeFieldError(field);
    } else {
        field.classList.add('error');
        showFieldError(field, message);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    removeFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #DC3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        font-weight: 500;
    `;
    
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = '#DC3545';
}

function removeFieldError(field) {
    const error = field.parentNode.querySelector('.field-error');
    if (error) {
        error.remove();
    }
    field.style.borderColor = '';
}

// Initialize all enhancements
function initializeEnhancements() {
    enhanceFormValidation();
    
    // Add ripple effect to buttons
    $$('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Add ripple animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    .field-error {
        animation: shake 0.3s ease-in-out;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Carousel init
async function initCarousel(mountId, dataUrl){
  const mount = document.getElementById(mountId);
  if(!mount) return;
  let products = [];
  try{
    const res = await fetch(dataUrl);
    products = await res.json();
  }catch(e){
    console.warn('Could not load products.json', e);
  }
  if(!Array.isArray(products) || !products.length){
    mount.innerHTML = '<div class="card">No products yet. Add items to assets/data/products.json.</div>';
    return;
  }
  mount.innerHTML = `
    <div class="carousel" aria-roledescription="carousel">
      <div class="carousel-track" id="track"></div>
      <div class="c-controls">
        <button class="c-btn" id="prev" aria-label="Previous">‹</button>
        <button class="c-btn" id="next" aria-label="Next">›</button>
      </div>
    </div>
    <div class="c-dots" id="dots"></div>
  `;
  const track = $('#track', mount);
  const dots = $('#dots', mount);
  track.innerHTML = products.map(p => `
    <div class="slide">
      <img src="${p.image}" alt="${p.title}">
      <div class="c-meta">
        <span class="pill">${p.category}</span>
        <h3>${p.title}</h3>
        <div class="muted">${p.description || ''}</div>
        <div style="margin:8px 0">
          <span class="price">$${Number(p.price).toFixed(2)}</span>
        </div>
        <div class="cta">
          <a class="btn" href="shop.html">Add to Cart</a>
          <a class="btn alt" href="upload.html">Customize</a>
        </div>
      </div>
    </div>
  `).join('');

  dots.innerHTML = products.map((_,i)=> `<button class="c-dot" data-i="${i}" aria-label="Slide ${i+1}"></button>`).join('');
  let i = 0;
  const n = products.length;
  const update = ()=>{
    track.style.transform = `translateX(-${i*100}%)`;
    $$('.c-dot', dots).forEach((d,idx)=> d.classList.toggle('active', idx===i));
  };
  update();

  $('#prev', mount).addEventListener('click', ()=>{ i=(i-1+n)%n; update(); });
  $('#next', mount).addEventListener('click', ()=>{ i=(i+1)%n; update(); });
  $$('.c-dot', dots).forEach(d => d.addEventListener('click', ()=>{ i=Number(d.dataset.i)||0; update(); }));

  // Auto-advance
  setInterval(()=>{ i=(i+1)%n; update(); }, 6000);
}

// Auto-initialize any carousel mounts after the script loads
function _autoInitCarousels(){
  const mounts = Array.from(document.querySelectorAll('[data-carousel]'));
  mounts.forEach(m => {
    const src = m.dataset.src || 'assets/data/products.json';
    if(!m.id) m.id = 'carousel-' + Math.random().toString(36).slice(2,8);
    initCarousel(m.id, src);
  });
}

// Ticker: render a continuous scrolling strip from a manifest of images
async function initTicker(mount){
  if(!mount) return;
  const src = mount.dataset.src;
  let list = [];
  try{
    const res = await fetch(src);
    list = await res.json();
  }catch(e){ console.warn('Ticker manifest load failed', e); }
  if(!Array.isArray(list) || !list.length) return;
  // build images
  const base = src.replace(/manifest.json$/, '');
  const inner = document.createElement('div');
  inner.className = 'ticker-track';
  // create two loops for continuous scroll
  for(let round=0; round<2; round++){
    list.forEach(it => {
      const img = document.createElement('img');
      img.src = base + it.file;
      img.alt = it.file;
      img.loading = 'lazy';
      inner.appendChild(img);
    });
  }
  mount.innerHTML = '';
  mount.appendChild(inner);
}

// Auto-init tickers
function _autoInitTickers(){
  const mounts = Array.from(document.querySelectorAll('[data-ticker]'));
  mounts.forEach(m => initTicker(m));
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _autoInitTickers);
} else {
  _autoInitTickers();
}

// Ticker interactions: pause on touch, click to open modal
document.addEventListener('click', (e)=>{
  const img = e.target.closest('.hero-ticker img');
  if(!img) return;
  // open modal
  const modal = document.createElement('div');
  modal.className = 'media-modal';
  modal.innerHTML = `<div class="inner"><img src="${img.src}" alt="${img.alt}"/></div><button class="close" aria-label="Close">✕</button>`;
  document.body.appendChild(modal);
  modal.querySelector('.close').addEventListener('click', ()=> modal.remove());
  modal.addEventListener('click', (ev)=>{ if(ev.target===modal) modal.remove(); });
});

// Pause ticker on touchstart and resume on touchend
document.addEventListener('touchstart', (e)=>{
  const t = e.target.closest('.hero-ticker');
  if(t) t.classList.add('pause');
}, {passive:true});
document.addEventListener('touchend', (e)=>{
  const t = e.target.closest('.hero-ticker');
  if(t) t.classList.remove('pause');
}, {passive:true});

// Shop: expand category cards to show matching products
async function loadProducts(){
  try{
    const res = await fetch('assets/data/products.json');
    return await res.json();
  }catch(e){ return [] }
}

document.addEventListener('click', async (e)=>{
  const card = e.target.closest('.category');
  if(!card) return;
  const listEl = card.querySelector('.product-list');
  const cat = card.dataset.cat;
  if(!listEl) return;
  if(!listEl.classList.contains('hidden')){
    listEl.classList.add('hidden'); listEl.setAttribute('aria-hidden','true'); return;
  }
  const products = await loadProducts();
  const matches = products.filter(p => (p.category || '').toLowerCase().includes(cat.split(' ')[0].toLowerCase()));
  if(!matches.length){ listEl.innerHTML = '<div class="muted small">No products in this category yet.</div>'; }
  else{
    listEl.innerHTML = matches.map(p=>`
      <div class="card small mt-8 product-item">
        <div style="display:flex;gap:12px;align-items:center">
          <img src="${p.image}" alt="${p.title}" style="width:72px;height:72px;object-fit:cover;border-radius:8px"/>
          <div>
            <strong>${p.title}</strong>
            <div class="muted small">${p.description||''}</div>
            <div class="mt-8"><span class="pill">$${Number(p.price).toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    `).join('');
  }
  listEl.classList.remove('hidden'); listEl.setAttribute('aria-hidden','false');
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _autoInitCarousels);
} else {
  // script loaded after DOMContentLoaded — init immediately
  _autoInitCarousels();
}

// File loader preview on upload.html
(function(){
  const drop = document.getElementById('drop');
  const file = document.getElementById('file');
  const preview = document.getElementById('preview');
  const choose = document.getElementById('chooseBtn');
  if(!drop || !file) return;

  const openPicker = ()=> file.click();
  choose.addEventListener('click', openPicker);
  drop.addEventListener('click', openPicker);
  ['dragenter','dragover'].forEach(ev=> drop.addEventListener(ev, e=>{ e.preventDefault(); drop.classList.add('drag'); }));
  ['dragleave','drop'].forEach(ev=> drop.addEventListener(ev, e=>{ e.preventDefault(); drop.classList.remove('drag'); }));
  drop.addEventListener('drop', e=> handle(e.dataTransfer.files));
  file.addEventListener('change', e=> handle(e.target.files));

  function handle(files){
    if(!files || !files[0]) return;
    const f = files[0];
    if(f.type.startsWith('image/')){
      const url = URL.createObjectURL(f);
      preview.src = url; preview.style.display='block';
    } else {
      preview.style.display='none';
    }
  }
})();
