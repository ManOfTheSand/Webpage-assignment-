// Accessibility helpers
function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

function announce(el, msg){
  if(!el) return;
  el.textContent = msg;
  // make it visible for screen readers then hide again
  el.classList.remove('sr-only');
  setTimeout(() => el.classList.add('sr-only'), 1000);
}

// NAV toggle (mobile)
const navToggle = qs('#navToggle');
const navMenu = qs('#navMenu');
if (navToggle && navMenu){
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

// Cart dialog setup
const cartDialog = qs('#cartDialog');
const viewCartBtn = qs('#viewCartBtn');
const cartItemsEl = qs('#cartItems');
const clearCartBtn = qs('#clearCartBtn');
const processOrderBtn = qs('#processOrderBtn');
const closeCartBtn = qs('#closeCartBtn');

function getCart(){
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch(e){
    return [];
  }
}

function setCart(items){
  localStorage.setItem('cart', JSON.stringify(items));
}

function renderCart(){
  const items = getCart();
  if (cartItemsEl){
    cartItemsEl.innerHTML = '';
    if (items.length === 0){
      const p = document.createElement('p');
      p.textContent = 'Your cart is empty.';
      cartItemsEl.appendChild(p);
    } else {
      let total = 0;
      items.forEach((it, idx) => {
        total += Number(it.price) * (it.qty || 1);
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `<span>${it.name} x${it.qty || 1}</span><span>$${(Number(it.price) * (it.qty||1)).toFixed(2)}</span>`;
        cartItemsEl.appendChild(row);
      });
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `<strong>Total</strong><strong>$${total.toFixed(2)}</strong>`;
      cartItemsEl.appendChild(row);
    }
  }
}

function openCart(){
  if (cartDialog && !cartDialog.open){
    renderCart();
    cartDialog.showModal();
  }
}
function closeCart(){
  if (cartDialog && cartDialog.open){
    cartDialog.close();
  }
}

if (viewCartBtn){ viewCartBtn.addEventListener('click', openCart); }
if (closeCartBtn){ closeCartBtn.addEventListener('click', closeCart); }

if (clearCartBtn){
  clearCartBtn.addEventListener('click', () => {
    if (confirm('Clear all items?')){
      setCart([]);
      renderCart();
      alert('Cart cleared.');
    }
  });
}
if (processOrderBtn){
  processOrderBtn.addEventListener('click', () => {
    const items = getCart();
    if (items.length === 0){
      alert('Cart is empty.');
      return;
    }
    const ts = new Date().toISOString();
    sessionStorage.setItem('lastOrderTimestamp', ts);
    alert('Order processed! Thank you.');
  });
}

// Add-to-cart buttons
qsa('.add-to-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.id;
    const name = btn.dataset.name;
    const price = btn.dataset.price;
    const cart = getCart();
    const existing = cart.find(x => x.id === id);
    if (existing){ existing.qty = (existing.qty || 1) + 1; }
    else cart.push({ id, name, price, qty: 1 });
    setCart(cart);
    alert(`${name} added to cart.`);
  });
});

// Subscribe
const subscribeForm = qs('#subscribeForm');
if (subscribeForm){
  subscribeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = qs('#email').value.trim();
    const feedback = qs('#subscribeFeedback');
    if (!email || !/^\S+@\S+\.\S+$/.test(email)){
      announce(feedback, 'Please enter a valid email.');
      alert('Invalid email.');
      return;
    }
    const subs = JSON.parse(localStorage.getItem('subscribers') || '[]');
    subs.push({ email, at: new Date().toISOString() });
    localStorage.setItem('subscribers', JSON.stringify(subs));
    announce(feedback, 'Subscribed! Check your inbox for a welcome note.');
    alert('Subscribed!');
    subscribeForm.reset();
  });
}

// Contact form
const contactForm = qs('#contactForm');
if (contactForm){
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = qs('#name').value.trim();
    const phone = qs('#phone').value.trim();
    const message = qs('#message').value.trim();
    const wantsCustom = qs('#customOrder').value;

    if (!name || !phone || !message){
      alert('All fields are required.');
      return;
    }
    const msgs = JSON.parse(localStorage.getItem('messages') || '[]');
    msgs.push({ name, phone, message, wantsCustom, at: new Date().toISOString() });
    localStorage.setItem('messages', JSON.stringify(msgs));
    alert('Thanks for contacting us! We will reach out soon.');
    contactForm.reset();
  });
}

// Custom builder
const saveBuildBtn = qs('#saveBuildBtn');
const addBuildToCartBtn = qs('#addBuildToCartBtn');
function getCustomBuild(){
  try{
    return JSON.parse(sessionStorage.getItem('customBuild')) || {};
  }catch(e){ return {}; }
}
function setCustomBuild(obj){
  sessionStorage.setItem('customBuild', JSON.stringify(obj));
}

if (saveBuildBtn){
  saveBuildBtn.addEventListener('click', () => {
    const size = qs('#size').value;
    const plantType = qs('#plantType').value;
    const notes = qs('#notes').value;
    const priceMap = { small:15, medium:25, large:40 };
    const plantMap = { succulent:8, fern:10, palm:18 };
    const price = (priceMap[size] || 0) + (plantMap[plantType] || 0);
    const build = { size, plantType, notes, price };
    setCustomBuild(build);
    alert('Build saved to session.');
  });
}

if (addBuildToCartBtn){
  addBuildToCartBtn.addEventListener('click', () => {
    const build = getCustomBuild();
    if (!build.size || !build.plantType){
      alert('Please save a build first.');
      return;
    }
    const cart = getCart();
    cart.push({ id: 'custom_build_'+Date.now(), name: `Custom Package (${build.size}, ${build.plantType})`, price: String(build.price), qty: 1 });
    setCart(cart);
    alert('Custom build added to cart.');
  });
}
