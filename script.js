/* =====================================================
   Calotté — Complete Store Script
   Features: Admin Panel, Checkout, Discord Webhooks,
   Cashfree, Crypto Payments, Gemini AI Support
   ===================================================== */

'use strict';

/* ===== CONFIG (loaded from config.json) ===== */
let CONFIG = {
  store: { name: "Calotté", currency: "INR", currencySymbol: "₹" },
  discord: { loggingWebhookUrl: "", orderWebhookUrl: "", enabled: false },
  payments: {
    cashfree: { enabled: true, appId: "", mode: "sandbox" },
    crypto: { enabled: true, wallets: { btc: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", eth: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F", usdt: "TKBFejyWfj1H8aBRmKBgKDmGHzCWAkTHPN" } }
  },
  ai: { geminiApiKey: "", enabled: false },
  admin: { password: "calotte_admin_2026" }
};

// Load config
fetch('config.json').then(r => r.json()).then(c => {
  CONFIG = c;
  // Update AI button state
  if (CONFIG.ai.geminiApiKey && CONFIG.ai.geminiApiKey !== "YOUR_GEMINI_API_KEY_HERE") {
    CONFIG.ai.enabled = true;
  }
}).catch(() => {}); // Use defaults

/* ===== PRODUCT DATA ===== */
let PRODUCTS = JSON.parse(localStorage.getItem('calotte_products') || 'null') || [
  { id: 1, name: 'Olympic Barbell 20kg', category: 'strength', price: 2999, origPrice: 13999, rating: 4.8, reviews: 324, badge: 'bestseller', icon: '🏋️', desc: 'Commercial-grade 20kg Olympic barbell. 28mm shaft diameter, chrome finish, 1500kg static load capacity. Perfect for powerlifting, Olympic lifting, and heavy compound movements.', specs: [{ l: 'Weight', v: '20 kg' }, { l: 'Length', v: '2.2 m' }, { l: 'Shaft', v: '28mm' }, { l: 'Capacity', v: '680 kg' }], carousel: false },
  { id: 2, name: 'Adjustable Dumbbell Set', category: 'strength', price: 14999, origPrice: 21999, rating: 4.9, reviews: 512, badge: 'hot', icon: '💪', desc: 'Quick-lock adjustable dumbbells from 5–50kg. Replaces 9 pairs of dumbbells. High-strength steel with Urethane coating.', specs: [{ l: 'Range', v: '5-50 kg' }, { l: 'Increment', v: '2.5 kg' }, { l: 'Material', v: 'Urethane' }], carousel: false },
  { id: 3, name: 'Commercial Treadmill Pro', category: 'cardio', price: 79999, origPrice: 120000, rating: 4.7, reviews: 189, badge: 'sale', icon: '🏃', desc: '3.5 HP motor, 0–20 km/h speed, 15% incline, 7\" HD display. Whisper-quiet belt system. 12 preset programs, heart-rate monitoring.', specs: [{ l: 'Motor', v: '3.5 HP' }, { l: 'Speed', v: '0-20 km/h' }, { l: 'Incline', v: '0-15%' }], carousel: false },
  { id: 4, name: 'Creatine Monohydrate 500g', category: 'supplements', price: 799, origPrice: 1199, rating: 4.6, reviews: 980, badge: 'bestseller', icon: '💊', desc: 'Micronized Creatine Monohydrate for maximum absorption. 5g per serving, 100 servings. No fillers, no additives. Lab tested.', specs: [{ l: 'Servings', v: '100' }, { l: 'Per Serving', v: '5g' }], carousel: true },
  { id: 5, name: 'Whey Protein Gold 2kg', category: 'supplements', price: 3499, origPrice: 4999, rating: 4.9, reviews: 1240, badge: 'hot', icon: '🥛', desc: '24g protein per scoop. Cold-filtration whey protein with BCAA profile. Banned substance tested.', specs: [{ l: 'Per Scoop', v: '24g Protein' }, { l: 'BCAA', v: '5.5g' }, { l: 'Servings', v: '66' }], carousel: true },
  { id: 6, name: 'Power Rack with Pull-Up Bar', category: 'strength', price: 28999, origPrice: 39999, rating: 4.8, reviews: 231, badge: 'new', icon: '🔩', desc: 'Heavy-duty 11-gauge steel power rack with dual pull-up bars, J-hooks, and safety spotter arms. 453kg rated load.', specs: [{ l: 'Steel', v: '11-Gauge' }, { l: 'Capacity', v: '453 kg' }], carousel: false },
  { id: 7, name: 'Resistance Bands Set (5pc)', category: 'accessories', price: 1299, origPrice: 1999, rating: 4.5, reviews: 760, badge: 'sale', icon: '🧤', desc: '5 progressive-resistance latex bands (5–50kg resistance). Ideal for warm-up, stretching, pull-up assistance.', specs: [{ l: 'Pieces', v: '5' }, { l: 'Resistance', v: '5-50 kg' }], carousel: false },
  { id: 8, name: 'Foam Roller Pro', category: 'recovery', price: 1499, origPrice: 2199, rating: 4.6, reviews: 432, badge: 'new', icon: '🧘', desc: 'High-density EPP foam with textured surface for deep tissue massage. 90cm long, suitable for back, legs, and IT band.', specs: [{ l: 'Length', v: '90 cm' }, { l: 'Density', v: 'High' }], carousel: false },
  { id: 9, name: 'Air Assault Bike', category: 'cardio', price: 44999, origPrice: 59999, rating: 4.7, reviews: 143, badge: 'hot', icon: '🚴', desc: 'Fan-resistance air bike for unlimited resistance. Full-body workout with push-pull handlebars.', specs: [{ l: 'Resistance', v: 'Air (Infinite)' }], carousel: false },
  { id: 10, name: 'Weight Plates Set 100kg', category: 'strength', price: 19999, origPrice: 27999, rating: 4.8, reviews: 289, badge: 'sale', icon: '🔵', desc: 'Cast iron Olympic weight plates with chrome collars. Includes 2×25kg, 4×10kg, 4×5kg plates.', specs: [{ l: 'Total', v: '100 kg' }, { l: 'Material', v: 'Cast Iron' }], carousel: false },
  { id: 11, name: 'Gym Gloves Pro', category: 'accessories', price: 799, origPrice: 1299, rating: 4.4, reviews: 540, badge: '', icon: '🧤', desc: 'Premium leather palm grip gloves with wrist wrap support. Half-finger design for ventilation.', specs: [{ l: 'Material', v: 'Leather' }, { l: 'Sizes', v: 'S/M/L/XL' }], carousel: false },
  { id: 12, name: 'Pre-Workout Ignite 300g', category: 'supplements', price: 1999, origPrice: 2999, rating: 4.7, reviews: 670, badge: 'hot', icon: '⚡', desc: 'High-stim pre-workout with 300mg Caffeine, 6g Citrulline, 3.2g Beta-Alanine. Explosive energy.', specs: [{ l: 'Caffeine', v: '300mg' }, { l: 'Citrulline', v: '6g' }], carousel: true },
  { id: 13, name: 'ON Gold Standard Whey 2kg', category: 'supplements', price: 4499, origPrice: 5999, rating: 5.0, reviews: 2100, badge: 'bestseller', icon: '🥇', desc: 'The world\'s best-selling whey protein. 24g of blended protein per serving with ultra-pure whey protein isolates.', specs: [{ l: 'Per Scoop', v: '24g' }, { l: 'Calories', v: '120' }], carousel: true },
  { id: 14, name: 'BCAA 8:1:1 Powder 400g', category: 'supplements', price: 1499, origPrice: 2299, rating: 4.7, reviews: 756, badge: 'sale', icon: '⚡', desc: '8:1:1 ratio BCAA with 8g Leucine per serving for maximum muscle protein synthesis. Tropical flavour.', specs: [{ l: 'BCAA Ratio', v: '8:1:1' }, { l: 'Leucine', v: '8g' }], carousel: true },
  { id: 15, name: 'Ashwagandha KSM-66 600mg', category: 'supplements', price: 799, origPrice: 1299, rating: 4.8, reviews: 630, badge: 'hot', icon: '🌿', desc: 'Clinically studied KSM-66 Ashwagandha root extract. Reduces cortisol by 28%, increases testosterone.', specs: [{ l: 'Extract', v: 'KSM-66' }, { l: 'Per Cap', v: '600mg' }], carousel: true },
];

const TESTIMONIALS = [
  { name: 'Mr. Mohamad Zaid', role: 'Competitive Powerlifter', rating: 5, text: 'The Olympic barbell I bought from Calotté is absolutely insane quality. Knurl is perfect, spin is smooth. Highly recommend.', avatar: '💪', verified: true },
  { name: 'Abhishek Sharma', role: 'CrossFit Coach', rating: 5, text: 'The adjustable dumbbells are genius. Quality is excellent and delivery was lightning fast. Calotté is my go-to for all gym purchases.', avatar: '🏋️', verified: true },
  { name: 'Aman Shroti', role: 'Fitness Enthusiast', rating: 5, text: 'Ordered Whey and Creatine together. Products are 100% authentic. The AI advisor helped me pick exactly what I needed!', avatar: '⚡', verified: true },
  { name: 'Bhumi Kumari', role: 'Personal Trainer', rating: 4, text: 'The power rack is a beast. Assembly was easy with the instructions. Rock solid. My clients feel the quality difference immediately.', avatar: '🔥', verified: true },
  { name: 'Navdeep Nain', role: 'Marathon Runner', rating: 5, text: 'Bought the treadmill for home use. The whisper-quiet motor is no joke. Best investment I\'ve made for home fitness.', avatar: '🏃', verified: true },
  { name: 'Ayush Sharma', role: 'Yoga & Strength Coach', rating: 5, text: 'Love the foam roller and resistance bands. Paid with crypto — super easy 5% discount was a nice bonus!', avatar: '🧘', verified: true },
];

/* ===== STATE ===== */
let cart = JSON.parse(localStorage.getItem('calotte_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('calotte_wishlist') || '[]');
let orders = JSON.parse(localStorage.getItem('calotte_orders') || '[]');
let currentFilter = 'all';
let currentSort = 'default';
let visibleCount = 8;
let carouselIndex = 0;
let currentModalProduct = null;
let currentQty = 1;
let selectedPaymentMethod = null;
let selectedCrypto = 'btc';
let checkoutCustomer = {};
let editingProductId = null;
let aiChatOpen = false;

/* ===== UTILS ===== */
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
const fmt = n => '₹' + Number(n).toLocaleString('en-IN');
const stars = r => '★'.repeat(Math.floor(r)) + (r % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(r));
const disc = (p, o) => Math.round(((o - p) / o) * 100);
const genId = () => Date.now() + Math.floor(Math.random() * 1000);

function showToast(msg, type = 'success') {
  const t = $('#toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => { t.className = 'toast'; }, 3000);
}

function saveProducts() { localStorage.setItem('calotte_products', JSON.stringify(PRODUCTS)); }
function saveCart() { localStorage.setItem('calotte_cart', JSON.stringify(cart)); }
function saveWishlist() { localStorage.setItem('calotte_wishlist', JSON.stringify(wishlist)); }
function saveOrders() { localStorage.setItem('calotte_orders', JSON.stringify(orders)); }

function getBgColor(cat) {
  const map = { strength: 'linear-gradient(135deg,#0d1a00,#1a2f00)', cardio: 'linear-gradient(135deg,#000d1a,#001a2f)', supplements: 'linear-gradient(135deg,#1a000d,#2f0012)', accessories: 'linear-gradient(135deg,#0d0d1a,#1a1a2f)', recovery: 'linear-gradient(135deg,#1a0d00,#2f1400)' };
  return map[cat] || '#161616';
}

/* ===== LOADER ===== */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = $('#loader');
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 0.7s ease';
    setTimeout(() => { loader.style.display = 'none'; initAnimations(); }, 700);
  }, 2400);
});

/* ===== NAVBAR ===== */
const navbar = $('#navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  $('#scrollTop').classList.toggle('visible', window.scrollY > 400);
  $$('.nav-link').forEach(link => {
    const sec = link.getAttribute('href').slice(1);
    const el = document.getElementById(sec);
    if (el) { const b = el.getBoundingClientRect(); link.classList.toggle('active', b.top <= 80 && b.bottom > 80); }
  });
});

const ham = $('#hamburger'), mobileMenu = $('#mobileMenu');
ham.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  ham.classList.toggle('open', open);
  ham.setAttribute('aria-expanded', open);
});
$$('.mobile-link').forEach(l => l.addEventListener('click', () => { mobileMenu.classList.remove('open'); ham.classList.remove('open'); }));

/* Search */
const searchToggle = $('#searchToggle'), searchBar = $('#searchBar'), searchInput = $('#searchInput');
searchToggle.addEventListener('click', () => { searchBar.classList.toggle('open'); if (searchBar.classList.contains('open')) searchInput.focus(); });
$('#searchClear').addEventListener('click', () => { searchInput.value = ''; renderSearchResults(''); });
searchInput.addEventListener('input', e => renderSearchResults(e.target.value.trim()));

function renderSearchResults(q) {
  const container = $('#searchResults');
  if (!q) { container.innerHTML = ''; return; }
  const res = PRODUCTS.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.category.includes(q.toLowerCase()));
  container.innerHTML = res.slice(0, 6).map(p => `
    <div class="search-result-item" onclick="openQuickView(${p.id})">
      <span>${p.icon}</span>
      <div><div>${p.name}</div><small style="color:var(--text-muted)">${fmt(p.price)} — ${p.category}</small></div>
    </div>`).join('') || '<div class="search-result-item">No results found</div>';
}

$('#scrollTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ===== COUNTER ANIMATION ===== */
function animateCounters() {
  $$('.stat-num').forEach(el => {
    const target = +el.dataset.target;
    let count = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      count = Math.min(count + step, target);
      el.textContent = count.toLocaleString('en-IN');
      if (count >= target) clearInterval(timer);
    }, 25);
  });
}

/* ===== REVEAL ===== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
function setupReveal() { $$('.reveal').forEach(el => revealObserver.observe(el)); }

/* ===== PARTICLES ===== */
function initParticles() {
  const canvas = $('#particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 60; i++) {
    particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, r: Math.random() * 1.5 + 0.3, dx: (Math.random() - 0.5) * 0.4, dy: (Math.random() - 0.5) * 0.4, o: Math.random() * 0.4 + 0.1 });
  }
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,240,0,${p.o})`; ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });
    requestAnimationFrame(animate);
  }
  animate();
}

/* ===== TYPED HERO ===== */
function initTypedHero() {
  const words = ['LEGEND', 'PHYSIQUE', 'STRENGTH', 'DESTINY', 'POTENTIAL'];
  let wi = 0, ci = 0, deleting = false;
  const el = $('#heroSpan');
  if (!el) return;
  function type() {
    const word = words[wi];
    el.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);
    if (!deleting && ci > word.length) { setTimeout(() => { deleting = true; type(); }, 2000); return; }
    if (deleting && ci < 0) { deleting = false; wi = (wi + 1) % words.length; ci = 0; }
    setTimeout(type, deleting ? 60 : 100);
  }
  type();
}

/* ===== CATEGORY COUNTS ===== */
function updateCategoryCounts() {
  const cats = ['strength', 'cardio', 'accessories', 'supplements', 'recovery'];
  cats.forEach(cat => {
    const el = $(`#cat-count-${cat}`);
    if (el) el.textContent = `${PRODUCTS.filter(p => p.category === cat).length} Products`;
  });
}

/* ===== PRODUCTS ===== */
function getFilteredProducts() {
  let list = currentFilter === 'all' ? [...PRODUCTS] : PRODUCTS.filter(p => p.category === currentFilter);
  switch (currentSort) {
    case 'price-asc': list.sort((a, b) => a.price - b.price); break;
    case 'price-desc': list.sort((a, b) => b.price - a.price); break;
    case 'rating': list.sort((a, b) => b.rating - a.rating); break;
    case 'newest': list.sort((a, b) => b.id - a.id); break;
  }
  return list;
}

function productCardHTML(p) {
  const inWish = wishlist.includes(p.id);
  return `
  <div class="product-card" data-id="${p.id}" data-category="${p.category}">
    <div class="product-img-wrap">
      <div class="product-img-placeholder" style="background:${getBgColor(p.category)}">${p.icon}</div>
      ${p.badge ? `<div class="product-badge badge-${p.badge}">${p.badge.toUpperCase()}</div>` : ''}
      <div class="product-actions">
        <button onclick="openQuickView(${p.id})">Quick View</button>
        <button class="wishlist-action ${inWish ? 'wishlisted' : ''}" onclick="toggleWishlist(${p.id}, this)">${inWish ? '♥' : '♡'}</button>
      </div>
    </div>
    <div class="product-info">
      <div class="product-category">${p.category.toUpperCase()}</div>
      <h3 class="product-name">${p.name}</h3>
      <div class="product-rating">
        <span class="stars">${stars(p.rating)}</span>
        <span class="rating-count">(${Number(p.reviews).toLocaleString()})</span>
      </div>
      <div class="product-price-row">
        <span class="product-price">${fmt(p.price)}</span>
        ${p.origPrice ? `<span class="product-orig-price">${fmt(p.origPrice)}</span><span class="product-discount">${disc(p.price, p.origPrice)}% off</span>` : ''}
      </div>
      <button class="product-add-btn" onclick="addToCart(${p.id})">+ ADD TO CART</button>
    </div>
  </div>`;
}

function renderProducts() {
  const grid = $('#productsGrid');
  const list = getFilteredProducts();
  const shown = list.slice(0, visibleCount);
  grid.innerHTML = shown.length ? shown.map(productCardHTML).join('') : '<div style="grid-column:1/-1;text-align:center;color:var(--text-dim);padding:60px">No products found</div>';
  const btn = $('#loadMoreBtn');
  if (btn) btn.style.display = list.length > visibleCount ? '' : 'none';
}

$$('.filter-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    $$('.filter-tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
    currentFilter = tab.dataset.filter; visibleCount = 8; renderProducts();
  });
});

$('#sortSelect').addEventListener('change', e => { currentSort = e.target.value; renderProducts(); });
$('#loadMoreBtn').addEventListener('click', () => { visibleCount += 4; renderProducts(); });
window.filterProducts = cat => {
  const tab = $(`.filter-tab[data-filter="${cat}"]`);
  if (tab) tab.click();
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
};

/* ===== CAROUSEL (supplements only) ===== */
function getCarouselProducts() { return PRODUCTS.filter(p => p.carousel); }

function renderCarousel() {
  const supps = getCarouselProducts();
  const track = $('#carouselTrack');
  track.innerHTML = supps.map(p => `
    <div class="carousel-item">
      <div class="product-card" data-id="${p.id}">
        <div class="product-img-wrap">
          <div class="product-img-placeholder" style="background:${getBgColor(p.category)}">${p.icon}</div>
          ${p.badge ? `<div class="product-badge badge-${p.badge}">${p.badge.toUpperCase()}</div>` : ''}
          <div class="product-actions">
            <button onclick="openQuickView(${p.id})">Quick View</button>
            <button class="wishlist-action" onclick="toggleWishlist(${p.id}, this)">♡</button>
          </div>
        </div>
        <div class="product-info">
          <div class="product-category">${p.category.toUpperCase()}</div>
          <h3 class="product-name">${p.name}</h3>
          <div class="product-rating"><span class="stars">${stars(p.rating)}</span> <span class="rating-count">(${Number(p.reviews).toLocaleString()})</span></div>
          <div class="product-price-row">
            <span class="product-price">${fmt(p.price)}</span>
            ${p.origPrice ? `<span class="product-orig-price">${fmt(p.origPrice)}</span><span class="product-discount">${disc(p.price, p.origPrice)}% off</span>` : ''}
          </div>
          <button class="product-add-btn" onclick="addToCart(${p.id})">+ ADD TO CART</button>
        </div>
      </div>
    </div>`).join('');
  const dots = $('#carouselDots');
  dots.innerHTML = supps.map((_, i) => `<button class="dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})" role="tab" aria-label="Slide ${i + 1}"></button>`).join('');
}

function getItemsPerView() {
  if (window.innerWidth < 480) return 1;
  if (window.innerWidth < 768) return 2;
  if (window.innerWidth < 1024) return 3;
  return 4;
}

function goToSlide(i) {
  const perView = getItemsPerView();
  const supps = getCarouselProducts();
  const max = Math.max(0, supps.length - perView);
  carouselIndex = Math.max(0, Math.min(i, max));
  const itemW = ($('#carouselTrack').children[0]?.offsetWidth || 0) + 20;
  $('#carouselTrack').style.transform = `translateX(-${carouselIndex * itemW}px)`;
  $$('.dot').forEach((d, j) => d.classList.toggle('active', j === carouselIndex));
}
window.goToSlide = goToSlide;
$('#carouselPrev').addEventListener('click', () => goToSlide(carouselIndex - 1));
$('#carouselNext').addEventListener('click', () => goToSlide(carouselIndex + 1));
let carouselTimer = setInterval(() => { const perView = getItemsPerView(); const max = getCarouselProducts().length - perView; goToSlide(carouselIndex >= max ? 0 : carouselIndex + 1); }, 4500);
$('#carouselTrack').addEventListener('mouseenter', () => clearInterval(carouselTimer));
$('#carouselTrack').addEventListener('mouseleave', () => { carouselTimer = setInterval(() => { const perView = getItemsPerView(); const max = getCarouselProducts().length - perView; goToSlide(carouselIndex >= max ? 0 : carouselIndex + 1); }, 4500); });

/* ===== TESTIMONIALS ===== */
function renderTestimonials() {
  $('#testimonialsGrid').innerHTML = TESTIMONIALS.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-quote">"</div>
      <p class="testimonial-text">${t.text}</p>
      <div class="testimonial-author">
        <div class="author-avatar">${t.avatar}</div>
        <div>
          <div class="author-name">${t.name} ${t.verified ? '✅' : ''}</div>
          <div class="author-role">${t.role}</div>
          <div class="testimonial-stars">${'★'.repeat(t.rating)}</div>
        </div>
      </div>
    </div>`).join('');
}

/* ===== CART ===== */
function addToCart(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty++;
  else cart.push({ id: p.id, name: p.name, price: p.price, icon: p.icon, qty: 1, category: p.category });
  saveCart(); updateCartUI();
  showToast(`✅ ${p.name} added to cart!`);
}
window.addToCart = addToCart;

function removeFromCart(id) { cart = cart.filter(c => c.id !== id); saveCart(); updateCartUI(); renderCartItems(); }
function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else { saveCart(); updateCartUI(); renderCartItems(); }
}
window.removeFromCart = removeFromCart;
window.changeQty = changeQty;

function updateCartUI() {
  const count = cart.reduce((s, c) => s + c.qty, 0);
  const countEl = $('#cartCount'), countDrawer = $('#cartCountDrawer');
  countEl.textContent = count; countDrawer.textContent = count;
  countEl.style.display = count > 0 ? '' : 'none';
  renderCartItems();
}

function renderCartItems() {
  const container = $('#cartItems'), footer = $('#cartFooter');
  if (cart.length === 0) {
    container.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon">🛒</div><p>Your cart is empty</p><span>Add some elite gear!</span></div>';
    footer.style.display = 'none'; return;
  }
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">${item.icon}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${fmt(item.price)}</div>
        <div class="cart-item-qty">
          <button onclick="changeQty(${item.id}, -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${item.id}, +1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</button>
    </div>`).join('');
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  $('#cartTotal').textContent = fmt(total);
  footer.style.display = '';
}

$('#cartBtn').addEventListener('click', () => { $('#cartDrawer').classList.add('open'); $('#cartOverlay').classList.add('open'); });
function closeCart() { $('#cartDrawer').classList.remove('open'); $('#cartOverlay').classList.remove('open'); }
$('#closeCart').addEventListener('click', closeCart);
$('#cartOverlay').addEventListener('click', closeCart);
$('#clearCartBtn').addEventListener('click', () => { cart = []; saveCart(); updateCartUI(); showToast('Cart cleared!', 'error'); });

/* ===== WISHLIST ===== */
window.toggleWishlist = function(id, btn) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const idx = wishlist.indexOf(id);
  if (idx > -1) { wishlist.splice(idx, 1); if (btn) { btn.textContent = '♡'; btn.classList.remove('wishlisted'); } showToast('Removed from wishlist'); }
  else { wishlist.push(id); if (btn) { btn.textContent = '♥'; btn.classList.add('wishlisted'); } showToast(`❤️ ${p.name} wishlisted!`); }
  saveWishlist();
  const wc = $('#wishlistCount');
  wc.textContent = wishlist.length; wc.style.display = wishlist.length > 0 ? '' : 'none';
};

/* ===== QUICK VIEW ===== */
window.openQuickView = function(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  currentModalProduct = p; currentQty = 1;
  $('#qtyValue').textContent = 1;
  $('#modalCategory').textContent = p.category.toUpperCase();
  $('#modalTitle').textContent = p.name;
  $('#modalRating').innerHTML = `<span class="stars">${stars(p.rating)}</span> <span>${p.rating} (${Number(p.reviews).toLocaleString()} reviews)</span>`;
  $('#modalPrice').textContent = fmt(p.price);
  $('#modalOrigPrice').textContent = p.origPrice ? fmt(p.origPrice) : '';
  $('#modalDiscount').textContent = p.origPrice ? `${disc(p.price, p.origPrice)}% OFF` : '';
  $('#modalDesc').textContent = p.desc;
  $('#modalProductImg').textContent = p.icon;
  $('#modalProductImg').style.background = getBgColor(p.category);
  $('#modalBadges').innerHTML = p.badge ? `<div class="product-badge badge-${p.badge}">${p.badge.toUpperCase()}</div>` : '';
  $('#modalSpecs').innerHTML = (p.specs || []).map(s => `<div class="spec-item"><span class="spec-label">${s.l}</span><span class="spec-value">${s.v}</span></div>`).join('');
  const inWish = wishlist.includes(p.id);
  const wb = $('#modalWishlist');
  wb.textContent = inWish ? '♥' : '♡';
  wb.className = `btn-icon-lg${inWish ? ' wishlisted' : ''}`;
  $('#quickViewModal').classList.add('open');
  $('#modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
};

function closeModal() { $('#quickViewModal').classList.remove('open'); $('#modalOverlay').classList.remove('open'); document.body.style.overflow = ''; }
$('#closeModal').addEventListener('click', closeModal);
$('#modalOverlay').addEventListener('click', closeModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeCart(); closeCheckout(); closeAdmin(); } });
$('#qtyMinus').addEventListener('click', () => { if (currentQty > 1) { currentQty--; $('#qtyValue').textContent = currentQty; } });
$('#qtyPlus').addEventListener('click', () => { currentQty++; $('#qtyValue').textContent = currentQty; });
$('#modalAddCart').addEventListener('click', () => { if (!currentModalProduct) return; for (let i = 0; i < currentQty; i++) addToCart(currentModalProduct.id); closeModal(); });
$('#modalWishlist').addEventListener('click', function() { if (!currentModalProduct) return; toggleWishlist(currentModalProduct.id, this); });

/* ===== CHECKOUT ===== */
function openCheckout() {
  if (cart.length === 0) { showToast('Your cart is empty!', 'error'); return; }
  closeCart();
  goToStep(1);
  renderCheckoutSummary();
  $('#checkoutModal').classList.add('open');
  $('#checkoutOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
window.openCheckout = openCheckout;

function closeCheckout() {
  $('#checkoutModal').classList.remove('open');
  $('#checkoutOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
window.closeCheckout = closeCheckout;
$('#checkoutOverlay').addEventListener('click', closeCheckout);

function goToStep(n) {
  $$('.checkout-step').forEach(s => s.classList.remove('active'));
  $(`#checkoutStep${n}`).classList.add('active');
  $$('.step').forEach((s, i) => {
    s.classList.remove('active', 'done');
    if (i + 1 === n) s.classList.add('active');
    else if (i + 1 < n) s.classList.add('done');
  });
}
window.goToStep = goToStep;

function renderCheckoutSummary() {
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const el = $('#checkoutSummary');
  if (!el) return;
  el.innerHTML = `<h4>Order Summary</h4>
    ${cart.map(item => `<div class="summary-item"><span>${item.name} × ${item.qty}</span><span>${fmt(item.price * item.qty)}</span></div>`).join('')}
    <div class="summary-item"><span>Shipping</span><span style="color:var(--accent)">FREE</span></div>
    <div class="summary-item"><span>Total</span><span>${fmt(total)}</span></div>`;
}

function goToPayment() {
  const name = $('#co-name').value.trim();
  const email = $('#co-email').value.trim();
  const phone = $('#co-phone').value.trim();
  const addr1 = $('#co-addr1').value.trim();
  const city = $('#co-city').value.trim();
  const state = $('#co-state').value;
  const pincode = $('#co-pincode').value.trim();
  if (!name || !email || !phone || !addr1 || !city || !state || !pincode) { showToast('Please fill all required fields!', 'error'); return; }
  if (!/^\d{6}$/.test(pincode)) { showToast('Please enter a valid 6-digit pincode!', 'error'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Please enter a valid email!', 'error'); return; }
  checkoutCustomer = { name, email, phone, addr1, addr2: $('#co-addr2').value.trim(), city, state, pincode };
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  $('#cfTotal').textContent = fmt(total);
  goToStep(2);
  sendDiscordLog('🛒 Checkout Started', `**${name}** started checkout for ₹${total.toLocaleString()}`, 0xC8F000);
}
window.goToPayment = goToPayment;

function selectPayment(method) {
  selectedPaymentMethod = method;
  $$('.payment-option').forEach(o => o.classList.remove('selected'));
  $(`#pay-${method}`).classList.add('selected');
  $('#cashfreePanel').style.display = method === 'cashfree' ? '' : 'none';
  $('#cryptoPanel').style.display = method === 'crypto' ? '' : 'none';
  const payNowBtn = $('#payNowBtn');
  if (method === 'cashfree') { payNowBtn.style.display = ''; payNowBtn.textContent = 'Pay with Cashfree →'; }
  else { payNowBtn.style.display = 'none'; }
  if (method === 'crypto') updateCryptoDetails('btc');
}
window.selectPayment = selectPayment;

function selectCrypto(coin, btn) {
  selectedCrypto = coin;
  $$('.crypto-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  updateCryptoDetails(coin);
}
window.selectCrypto = selectCrypto;

function updateCryptoDetails(coin) {
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discounted = Math.round(total * 0.95);
  const rates = { btc: 7200000, eth: 270000, usdt: 84 };
  const symbols = { btc: 'BTC', eth: 'ETH', usdt: 'USDT' };
  const wallets = CONFIG.payments?.crypto?.wallets || { btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', eth: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', usdt: 'TKBFejyWfj1H8aBRmKBgKDmGHzCWAkTHPN' };
  const addr = wallets[coin] || 'Address not configured';
  const amount = (discounted / rates[coin]).toFixed(coin === 'usdt' ? 2 : 6);
  $('#cryptoAmount').textContent = `${amount} ${symbols[coin]}`;
  $('#cryptoAddress').textContent = addr;
  $('#cryptoINR').textContent = fmt(discounted);
  $('#cryptoQR .qr-inner').textContent = `${symbols[coin]} QR`;
}

function copyAddress() {
  const addr = $('#cryptoAddress').textContent;
  navigator.clipboard.writeText(addr).then(() => showToast('Address copied!'));
}
window.copyAddress = copyAddress;

function processPayment() {
  if (!selectedPaymentMethod) { showToast('Please select a payment method!', 'error'); return; }
  if (selectedPaymentMethod === 'cashfree') processCashfreePayment();
}
window.processPayment = processPayment;

function processCashfreePayment() {
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const orderId = 'CAL' + Date.now();
  showToast('Redirecting to Cashfree...', 'success');
  // Simulate Cashfree sandbox (in production, integrate actual Cashfree SDK)
  setTimeout(() => {
    const cfAppId = CONFIG.payments?.cashfree?.appId;
    if (cfAppId && cfAppId !== 'YOUR_CASHFREE_APP_ID') {
      // Real Cashfree integration would go here
      // window.Cashfree.init({ mode: CONFIG.payments.cashfree.mode })...
    }
    // Demo: show confirmation after 2s
    completeOrder(orderId, 'cashfree', total, 'paid');
  }, 2000);
}

function confirmCryptoPayment() {
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const discounted = Math.round(total * 0.95);
  const orderId = 'CAL' + Date.now();
  completeOrder(orderId, `crypto-${selectedCrypto.toUpperCase()}`, discounted, 'pending_crypto');
}
window.confirmCryptoPayment = confirmCryptoPayment;

function completeOrder(orderId, paymentMethod, total, status) {
  const order = {
    id: orderId,
    date: new Date().toISOString(),
    customer: checkoutCustomer,
    items: [...cart],
    total,
    paymentMethod,
    status
  };
  orders.unshift(order);
  saveOrders();

  // Discord webhooks
  sendDiscordOrderLog(order);
  sendDiscordLog('🔔 New Order Log', `Order **${orderId}** via ${paymentMethod}`, status === 'paid' ? 0x00FF00 : 0xFFB700);

  // Show confirmation
  const box = $('#orderDetailsBox');
  box.innerHTML = `
    <div class="order-detail-row"><span>Order ID</span><span>${orderId}</span></div>
    <div class="order-detail-row"><span>Customer</span><span>${checkoutCustomer.name}</span></div>
    <div class="order-detail-row"><span>Email</span><span>${checkoutCustomer.email}</span></div>
    <div class="order-detail-row"><span>Phone</span><span>${checkoutCustomer.phone}</span></div>
    <div class="order-detail-row"><span>Address</span><span>${checkoutCustomer.addr1}, ${checkoutCustomer.city}, ${checkoutCustomer.state} - ${checkoutCustomer.pincode}</span></div>
    <div class="order-detail-row"><span>Payment</span><span>${paymentMethod}</span></div>
    <div class="order-detail-row"><span>Status</span><span>${status === 'paid' ? '✅ Paid' : '⏳ Pending Confirmation'}</span></div>
    <div class="order-detail-row"><span>Total</span><span>${fmt(total)}</span></div>
  `;
  goToStep(3);
  cart = []; saveCart(); updateCartUI();
  showToast('🎉 Order placed successfully!');
}

/* ===== DISCORD WEBHOOKS ===== */
async function sendDiscordOrderLog(order) {
  const webhookUrl = CONFIG.discord?.orderWebhookUrl;
  if (!webhookUrl || webhookUrl.startsWith('YOUR_') || !CONFIG.discord?.enabled) return;
  const itemsList = order.items.map(i => `• ${i.name} × ${i.qty} — ${fmt(i.price * i.qty)}`).join('\n');
  const embed = {
    title: `🛍️ New Order — ${order.id}`,
    color: order.status === 'paid' ? 0x00C851 : 0xFFB700,
    fields: [
      { name: '👤 Customer', value: `**${order.customer.name}**\n${order.customer.email}\n${order.customer.phone}`, inline: true },
      { name: '📦 Delivery Address', value: `${order.customer.addr1}${order.customer.addr2 ? '\n' + order.customer.addr2 : ''}\n${order.customer.city}, ${order.customer.state}\n📮 ${order.customer.pincode}`, inline: true },
      { name: '🛒 Items Ordered', value: itemsList || 'N/A', inline: false },
      { name: '💳 Payment Method', value: order.paymentMethod, inline: true },
      { name: '💰 Order Total', value: `**₹${Number(order.total).toLocaleString()}**`, inline: true },
      { name: '📋 Status', value: order.status === 'paid' ? '✅ PAID' : '⏳ PENDING', inline: true },
    ],
    footer: { text: `Calotté Store • ${new Date(order.date).toLocaleString('en-IN')}` },
    timestamp: order.date
  };
  try { await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ embeds: [embed] }) }); } catch (e) {}
}

async function sendDiscordLog(title, description, color = 0xC8F000) {
  const webhookUrl = CONFIG.discord?.loggingWebhookUrl;
  if (!webhookUrl || webhookUrl.startsWith('YOUR_') || !CONFIG.discord?.enabled) return;
  const embed = { title, description, color, footer: { text: `Calotté Log • ${new Date().toLocaleString('en-IN')}` }, timestamp: new Date().toISOString() };
  try { await fetch(webhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ embeds: [embed] }) }); } catch (e) {}
}

/* ===== ADMIN PANEL ===== */
$('#adminBtn').addEventListener('click', () => {
  const isLoggedIn = sessionStorage.getItem('calotte_admin_auth');
  if (isLoggedIn) { showAdminDash(); }
  else { $('#adminPanel').classList.add('open'); $('#adminOverlay').classList.add('open'); document.body.style.overflow = 'hidden'; }
});

function closeAdmin() { $('#adminPanel').classList.remove('open'); $('#adminOverlay').classList.remove('open'); document.body.style.overflow = ''; }
window.closeAdmin = closeAdmin;
$('#adminOverlay').addEventListener('click', closeAdmin);

function adminLogin() {
  const pwd = $('#adminPwd').value;
  const correct = CONFIG.admin?.password || 'calotte_admin_2026';
  if (pwd === correct) {
    sessionStorage.setItem('calotte_admin_auth', '1');
    showAdminDash();
    sendDiscordLog('🔐 Admin Login', 'Admin panel accessed', 0xFF8C00);
  } else { showToast('Incorrect password!', 'error'); }
}
window.adminLogin = adminLogin;
$('#adminPwd').addEventListener('keydown', e => { if (e.key === 'Enter') adminLogin(); });

function showAdminDash() {
  $('#adminLogin').style.display = 'none';
  $('#adminDash').style.display = 'block';
  $('#adminPanel').classList.add('open');
  $('#adminOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderAdminProducts();
  renderAdminOrders();
  loadAdminConfig();
}

function switchAdminTab(tab, btn) {
  $$('.admin-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  $$('.admin-tab-content').forEach(c => c.classList.remove('active'));
  $(`#admin${tab.charAt(0).toUpperCase() + tab.slice(1)}`).classList.add('active');
  $(`#adminProductForm`).style.display = 'none';
}
window.switchAdminTab = switchAdminTab;

function renderAdminProducts() {
  const list = $('#adminProductsList');
  list.innerHTML = PRODUCTS.map(p => `
    <div class="admin-product-row">
      <div class="admin-product-icon">${p.icon}</div>
      <div class="admin-product-info">
        <strong>${p.name}</strong>
        <span>${p.category} • ${p.badge ? p.badge.toUpperCase() : 'No badge'} • Rating: ${p.rating}</span>
      </div>
      <div class="admin-product-price">${fmt(p.price)}</div>
      <div class="admin-product-actions">
        <button class="admin-btn-edit" onclick="openEditProduct(${p.id})">✏️ Edit</button>
        <button class="admin-btn-del" onclick="deleteProduct(${p.id})">🗑️ Del</button>
      </div>
    </div>`).join('');
}

function openAddProduct() {
  editingProductId = null;
  $('#productFormTitle').textContent = 'Add New Product';
  ['name','category','icon','price','origprice','badge','rating','reviews','desc','specs'].forEach(f => {
    const el = $(`#ap-${f}`);
    if (el) el.value = f === 'category' ? 'strength' : f === 'badge' ? '' : '';
  });
  $('#ap-carousel').value = 'false';
  $('#adminProductsList').style.display = 'none';
  $('#adminProductForm').style.display = 'block';
  $('div.admin-section-header').style.display = 'none';
}
window.openAddProduct = openAddProduct;

function openEditProduct(id) {
  editingProductId = id;
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  $('#productFormTitle').textContent = 'Edit Product';
  $('#ap-name').value = p.name;
  $('#ap-category').value = p.category;
  $('#ap-icon').value = p.icon;
  $('#ap-price').value = p.price;
  $('#ap-origprice').value = p.origPrice || '';
  $('#ap-badge').value = p.badge || '';
  $('#ap-rating').value = p.rating;
  $('#ap-reviews').value = p.reviews;
  $('#ap-desc').value = p.desc;
  $('#ap-specs').value = (p.specs || []).map(s => `${s.l}:${s.v}`).join('\n');
  $('#ap-carousel').value = p.carousel ? 'true' : 'false';
  $('#adminProductsList').style.display = 'none';
  $('#adminProductForm').style.display = 'block';
  $('div.admin-section-header').style.display = 'none';
}
window.openEditProduct = openEditProduct;

function saveProduct() {
  const name = $('#ap-name').value.trim();
  const price = parseFloat($('#ap-price').value);
  if (!name || !price) { showToast('Name and price are required!', 'error'); return; }
  const specsRaw = $('#ap-specs').value.trim();
  const specs = specsRaw ? specsRaw.split('\n').map(line => { const [l, ...rest] = line.split(':'); return { l: l.trim(), v: rest.join(':').trim() }; }) : [];
  const product = {
    id: editingProductId || genId(),
    name,
    category: $('#ap-category').value,
    icon: $('#ap-icon').value || '📦',
    price,
    origPrice: parseFloat($('#ap-origprice').value) || null,
    badge: $('#ap-badge').value || '',
    rating: parseFloat($('#ap-rating').value) || 4.5,
    reviews: parseInt($('#ap-reviews').value) || 0,
    desc: $('#ap-desc').value.trim(),
    specs,
    carousel: $('#ap-carousel').value === 'true'
  };
  if (editingProductId) {
    const idx = PRODUCTS.findIndex(p => p.id === editingProductId);
    if (idx !== -1) PRODUCTS[idx] = product;
    showToast('Product updated!');
  } else {
    PRODUCTS.unshift(product);
    showToast('Product added!');
  }
  saveProducts();
  renderProducts();
  renderCarousel();
  updateCategoryCounts();
  cancelProductForm();
  sendDiscordLog('📦 Product ' + (editingProductId ? 'Updated' : 'Added'), `**${name}** — ${fmt(price)}`, 0x7FBF00);
}
window.saveProduct = saveProduct;

function deleteProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!confirm(`Delete "${p?.name}"?`)) return;
  PRODUCTS = PRODUCTS.filter(x => x.id !== id);
  saveProducts(); renderProducts(); renderCarousel(); renderAdminProducts(); updateCategoryCounts();
  showToast('Product deleted!', 'error');
  sendDiscordLog('🗑️ Product Deleted', `**${p?.name}** removed from store`, 0xFF4444);
}
window.deleteProduct = deleteProduct;

function cancelProductForm() {
  $('#adminProductsList').style.display = '';
  $('#adminProductForm').style.display = 'none';
  const hdr = $('div.admin-section-header');
  if (hdr) hdr.style.display = '';
  renderAdminProducts();
}
window.cancelProductForm = cancelProductForm;

function renderAdminOrders() {
  const list = $('#adminOrdersList');
  if (!orders.length) { list.innerHTML = '<div style="color:var(--text-dim);text-align:center;padding:40px">No orders yet</div>'; return; }
  list.innerHTML = orders.map(o => `
    <div class="admin-order-card">
      <div class="admin-order-header">
        <div>
          <strong style="font-size:0.9rem;">#${o.id}</strong>
          <span style="color:var(--text-muted);margin-left:12px;font-size:0.78rem;">${new Date(o.date).toLocaleDateString('en-IN')}</span>
        </div>
        <span class="order-status-badge ${o.status === 'paid' ? 'status-paid' : 'status-pending'}">${o.status === 'paid' ? '✅ Paid' : '⏳ Pending'}</span>
      </div>
      <div style="color:var(--text-muted);font-size:0.82rem;margin-bottom:8px;">
        <strong style="color:var(--text)">${o.customer?.name}</strong> — ${o.customer?.email} — ${o.customer?.phone}
      </div>
      <div style="color:var(--text-dim);font-size:0.78rem;margin-bottom:8px;">
        📍 ${o.customer?.addr1}, ${o.customer?.city}, ${o.customer?.state} ${o.customer?.pincode}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="color:var(--text-muted);font-size:0.8rem;">${o.paymentMethod} • ${(o.items||[]).length} item(s)</span>
        <strong style="color:var(--accent);font-size:0.95rem;">${fmt(o.total)}</strong>
      </div>
    </div>`).join('');
}

function clearOrders() {
  if (!confirm('Clear all orders?')) return;
  orders = []; saveOrders(); renderAdminOrders();
  showToast('Orders cleared!', 'error');
}
window.clearOrders = clearOrders;

function loadAdminConfig() {
  $('#cfg-logging-webhook').value = CONFIG.discord?.loggingWebhookUrl || '';
  $('#cfg-order-webhook').value = CONFIG.discord?.orderWebhookUrl || '';
  $('#cfg-cf-appid').value = CONFIG.payments?.cashfree?.appId || '';
  $('#cfg-gemini').value = CONFIG.ai?.geminiApiKey || '';
  $('#cfg-btc').value = CONFIG.payments?.crypto?.wallets?.btc || '';
  $('#cfg-eth').value = CONFIG.payments?.crypto?.wallets?.eth || '';
  $('#cfg-usdt').value = CONFIG.payments?.crypto?.wallets?.usdt || '';
}

function saveConfig() {
  CONFIG.discord.loggingWebhookUrl = $('#cfg-logging-webhook').value.trim();
  CONFIG.discord.orderWebhookUrl = $('#cfg-order-webhook').value.trim();
  CONFIG.discord.enabled = !!(CONFIG.discord.loggingWebhookUrl || CONFIG.discord.orderWebhookUrl);
  CONFIG.payments.cashfree.appId = $('#cfg-cf-appid').value.trim();
  CONFIG.ai.geminiApiKey = $('#cfg-gemini').value.trim();
  CONFIG.ai.enabled = !!CONFIG.ai.geminiApiKey;
  CONFIG.payments.crypto.wallets.btc = $('#cfg-btc').value.trim();
  CONFIG.payments.crypto.wallets.eth = $('#cfg-eth').value.trim();
  CONFIG.payments.crypto.wallets.usdt = $('#cfg-usdt').value.trim();
  localStorage.setItem('calotte_config_override', JSON.stringify(CONFIG));
  showToast('Configuration saved!');
}
window.saveConfig = saveConfig;

// Load config overrides
const savedConfig = localStorage.getItem('calotte_config_override');
if (savedConfig) {
  try { const c = JSON.parse(savedConfig); Object.assign(CONFIG, c); } catch (e) {}
}

/* ===== GEMINI AI SUPPORT ===== */
let aiHistory = [];
const AI_SYSTEM = `You are Calotté AI, a friendly and knowledgeable fitness and gym equipment assistant for the Calotté store. You help customers with:
- Product recommendations based on their fitness goals
- Supplement advice and stacking
- Workout tips and training advice  
- Order and payment queries
- Store policies (free shipping above ₹2999, 30-day returns, crypto payments accepted)

Available products categories: Strength Training (barbells, dumbbells, power racks, weight plates), Cardio (treadmills, bikes), Accessories (gloves, resistance bands), Supplements (whey protein, creatine, pre-workout, BCAA, ashwagandha), Recovery (foam rollers).

Keep responses concise, friendly, and helpful. Use emojis sparingly. Always encourage healthy habits.`;

async function sendAIMessage() {
  const input = $('#aiInput');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  addAIMessage(msg, 'user');
  const typing = addAIMessage('Typing...', 'bot', true);
  const geminiKey = CONFIG.ai?.geminiApiKey;
  if (!geminiKey || geminiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    typing.remove();
    addAIMessage("I'm currently in demo mode! For full AI support, please add your Gemini API key in the Admin Panel > Config. In the meantime, I can tell you that we have amazing gym equipment and supplements — browse our catalog or contact support@calotte.in! 💪", 'bot');
    return;
  }
  aiHistory.push({ role: 'user', parts: [{ text: msg }] });
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: AI_SYSTEM }] },
        contents: aiHistory,
        generationConfig: { maxOutputTokens: 400, temperature: 0.7 }
      })
    });
    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I encountered an error. Please try again!';
    aiHistory.push({ role: 'model', parts: [{ text: reply }] });
    typing.remove();
    addAIMessage(reply, 'bot');
  } catch (err) {
    typing.remove();
    addAIMessage('Sorry, I had trouble connecting. Please check your Gemini API key or try again!', 'bot');
  }
}
window.sendAIMessage = sendAIMessage;

function addAIMessage(text, role, isTyping = false) {
  const container = $('#aiMessages');
  const div = document.createElement('div');
  div.className = `ai-msg ai-msg-${role}${isTyping ? ' ai-msg-typing' : ''}`;
  div.innerHTML = `<div class="ai-msg-content">${text}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function toggleAIChat() {
  aiChatOpen = !aiChatOpen;
  $('#aiChatBox').classList.toggle('open', aiChatOpen);
}
window.toggleAIChat = toggleAIChat;
$('#aiChatToggle').addEventListener('click', toggleAIChat);

$('#aiInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendAIMessage(); });

function sendQuickMsg(msg) {
  $('#aiInput').value = msg;
  sendAIMessage();
  if (!aiChatOpen) toggleAIChat();
}
window.sendQuickMsg = sendQuickMsg;

/* ===== NEWSLETTER ===== */
window.handleNewsletter = function() {
  const email = $('#newsletterEmail').value.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Please enter a valid email!', 'error'); return; }
  $('#newsletterForm').style.display = 'none';
  $('#newsletterSuccess').style.display = 'block';
  sendDiscordLog('📧 Newsletter Signup', `**${email}** subscribed to newsletter`, 0x7FBF00);
  showToast('🎉 Welcome to the Calotté family!');
};

/* ===== GSAP ANIMATIONS ===== */
function initAnimations() {
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('#heroText > *', { y: 50, opacity: 0, stagger: 0.15, duration: 1, ease: 'power3.out', delay: 0.2 });
    gsap.from('#heroVisual', { x: 60, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.4 });
    gsap.utils.toArray('.section-header').forEach(el => {
      gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 80%' }, y: 30, opacity: 0, duration: 0.7, ease: 'power2.out' });
    });
    gsap.utils.toArray('.category-card').forEach((el, i) => {
      gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 85%' }, y: 40, opacity: 0, duration: 0.6, delay: i * 0.08, ease: 'power2.out' });
    });
    gsap.utils.toArray('.why-card').forEach((el, i) => {
      gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 85%' }, y: 30, opacity: 0, duration: 0.5, delay: i * 0.1 });
    });
    ScrollTrigger.create({ trigger: '.hero-stats', start: 'top 90%', once: true, onEnter: animateCounters });
  } else {
    animateCounters();
  }
  setupReveal();
  initParticles();
  initTypedHero();
}

/* ===== SMOOTH SCROLL ===== */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.getElementById(a.getAttribute('href').slice(1));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  renderCarousel();
  renderTestimonials();
  updateCartUI();
  updateCategoryCounts();
  // Restore wishlist count
  const wc = $('#wishlistCount');
  if (wishlist.length > 0) { wc.textContent = wishlist.length; wc.style.display = ''; }
  // Restore config
  const savedCfg = localStorage.getItem('calotte_config_override');
  if (savedCfg) { try { Object.assign(CONFIG, JSON.parse(savedCfg)); } catch(e) {} }
});
