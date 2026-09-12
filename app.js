let products = [
  { id: 1, name: 'Coca-Cola 1.5L', price: 1850, stock: 12, category: 'Bebidas', code: '7790895001234', icon: '◉' },
  { id: 2, name: 'Agua mineral 500ml', price: 950, stock: 24, category: 'Bebidas', code: '7790315009876', icon: '◌' },
  { id: 3, name: 'Papas clásicas', price: 1200, stock: 3, category: 'Snacks', code: '7790387002231', icon: '◈' },
  { id: 4, name: 'Alfajor de chocolate', price: 700, stock: 18, category: 'Snacks', code: '7790040112345', icon: '◆' },
  { id: 5, name: 'Yerba mate 500g', price: 3200, stock: 2, category: 'Almacén', code: '7790387011198', icon: '✣' },
  { id: 6, name: 'Galletitas surtidas', price: 1450, stock: 9, category: 'Almacén', code: '7790040223456', icon: '●' },
  { id: 7, name: 'Jugo en polvo', price: 550, stock: 31, category: 'Bebidas', code: '7791111222333', icon: '◇' },
  { id: 8, name: 'Chicles menta', price: 450, stock: 7, category: 'Snacks', code: '7792222333444', icon: '·' },
  { id: 9, name: 'Arroz largo fino', price: 1100, stock: 14, category: 'Almacén', code: '7793333444555', icon: '▦' }
];
const savedProducts = JSON.parse(localStorage.getItem('mostradorProducts') || 'null');
if (Array.isArray(savedProducts)) products = savedProducts;
let cart = [{ productId: 1, quantity: 1 }, { productId: 4, quantity: 2 }];
let currentCategory = 'Todos';
let inventoryCategory = 'Todas';
let paymentMethod = 'cash';
let isDayClosed = false;
let salesHistory = [
  { time: '08:42', detail: 'Coca-Cola 1.5L + 2 Alfajores', total: 3250, payment: 'Efectivo' },
  { time: '09:18', detail: 'Yerba mate 500g + Galletitas surtidas', total: 4650, payment: 'QR' },
  { time: '10:05', detail: 'Agua mineral 500ml + Papas clásicas', total: 2150, payment: 'Débito' },
  { time: '11:22', detail: 'Coca-Cola 1.5L + Alfajor de chocolate', total: 2550, payment: 'Efectivo' }
];
const savedSalesHistory = JSON.parse(localStorage.getItem('mostradorSales') || 'null');
if (Array.isArray(savedSalesHistory) && savedSalesHistory.length) salesHistory = savedSalesHistory;
let calendarCursor = new Date(2026, 8, 1);
let selectedDateKey = '2026-09-12';
let workCalendar = JSON.parse(localStorage.getItem('mostradorCalendar') || '{}');
let notifications = [
  { type: 'sale', title: 'Venta completada', detail: 'Coca-Cola 1.5L + 2 Alfajores', amount: '$ 3.250', time: 'Hace 4 min', unread: true },
  { type: 'sale', title: 'Venta completada', detail: 'Yerba mate 500g + Galletitas surtidas', amount: '$ 4.650', time: 'Hace 18 min', unread: true },
  { type: 'stock', title: 'Stock bajo', detail: 'Yerba mate 500g · quedan 2 unidades', time: 'Hace 32 min', unread: false }
];
const developerCredentials = { username: 'desarrollador', password: 'MostradorDev2026!' };
const money = value => `$ ${value.toLocaleString('es-AR')}`;
const productById = id => products.find(product => product.id === id);

function renderProducts() {
  const search = document.querySelector('#product-search').value.toLowerCase().trim();
  const filtered = products.filter(product => {
    const categoryMatch = currentCategory === 'Todos' || product.category === currentCategory;
    const searchMatch = `${product.name} ${product.code}`.toLowerCase().includes(search);
    return categoryMatch && searchMatch;
  });
  document.querySelector('#product-grid').innerHTML = filtered.map(product => `
    <button class="product-card" type="button" data-add-product="${product.id}">
      <span class="stock-pill ${product.stock <= 3 ? 'low' : ''}">${product.stock <= 3 ? `Quedan ${product.stock}` : `${product.stock} u.`}</span>
      <span class="product-visual">${product.icon}</span><span class="product-name">${product.name}</span><span class="product-price">${money(product.price)}</span>
    </button>`).join('');
  document.querySelector('#empty-search').hidden = filtered.length > 0;
}

function renderCart() {
  const cartItems = document.querySelector('#cart-items');
  const empty = document.querySelector('#cart-empty');
  if (!cart.length) { cartItems.innerHTML = ''; empty.hidden = false; } else {
    empty.hidden = true;
    cartItems.innerHTML = cart.map(item => { const product = productById(item.productId); return `<div class="cart-row"><div><strong>${product.name}</strong><span class="row-price">${money(product.price)} c/u</span></div><div class="quantity"><button type="button" data-decrease="${product.id}">−</button><span>${item.quantity}</span><button type="button" data-increase="${product.id}">＋</button></div></div>`; }).join('');
  }
  const total = cart.reduce((sum, item) => sum + productById(item.productId).price * item.quantity, 0);
  document.querySelector('#cart-subtotal').textContent = money(total);
  document.querySelector('#cart-total').textContent = money(total);
  updatePaymentCalculator(total);
}

function receivedAmount() { return Number(document.querySelector('#cash-received').value) || 0; }
function updatePaymentCalculator(total = cart.reduce((sum, item) => sum + productById(item.productId).price * item.quantity, 0)) {
  const change = receivedAmount() - total;
  const changeAmount = document.querySelector('#change-amount');
  const changeLabel = document.querySelector('#change-label');
  const feedback = document.querySelector('#cash-feedback');
  changeAmount.classList.toggle('insufficient', change < 0);
  feedback.classList.toggle('insufficient', change < 0);
  if (!receivedAmount()) { changeLabel.textContent = 'Vuelto'; changeAmount.textContent = '$ 0'; feedback.textContent = 'Ingresá el billete que entrega el cliente'; return; }
  if (change < 0) { changeLabel.textContent = 'Falta'; changeAmount.textContent = money(Math.abs(change)); feedback.textContent = 'El billete no alcanza para cubrir el total'; return; }
  changeLabel.textContent = 'Vuelto'; changeAmount.textContent = money(change); feedback.textContent = 'Listo para cobrar';
}

function showToast(message) { const toast = document.querySelector('#toast'); toast.textContent = message; toast.classList.add('show'); window.clearTimeout(showToast.timer); showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2600); }
function printTicket() {
  if (!cart.length) { showToast('Agregá al menos un producto para imprimir'); return; }
  const total = cart.reduce((sum, item) => sum + productById(item.productId).price * item.quantity, 0);
  const paymentLabel = paymentMethod === 'cash' ? 'Efectivo' : paymentMethod === 'debit' ? 'Débito' : 'QR';
  const items = cart.map(item => { const product = productById(item.productId); return `<div class="item"><span>${item.quantity} x ${product.name}</span><strong>${money(product.price * item.quantity)}</strong></div>`; }).join('');
  const receiptWindow = window.open('', '_blank', 'width=420,height=650');
  if (!receiptWindow) { showToast('Permití las ventanas emergentes para imprimir'); return; }
  receiptWindow.document.write(`<!doctype html><html lang="es"><head><meta charset="UTF-8"><title>Ticket - Mostrador Web</title><style>body{font-family:Arial,sans-serif;color:#17332d;width:300px;margin:24px auto;font-size:13px}.header{text-align:center;border-bottom:1px dashed #9aa9a1;padding-bottom:14px;margin-bottom:14px}.header h1{font-size:18px;margin:0 0 5px}.header p{margin:0;color:#60746b;font-size:11px}.item{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid #e5ebe6}.item strong,.total strong{white-space:nowrap}.total{display:flex;justify-content:space-between;font-size:16px;font-weight:bold;padding-top:14px}.detail{color:#60746b;font-size:11px;margin-top:14px;line-height:1.6}.footer{text-align:center;border-top:1px dashed #9aa9a1;margin-top:20px;padding-top:14px;color:#60746b;font-size:10px}@media print{body{margin:0 auto}}</style></head><body><div class="header"><h1>Mostrador Web</h1><p>Ticket de venta</p><p>${new Date().toLocaleString('es-AR')}</p></div>${items}<div class="total"><span>Total</span><strong>${money(total)}</strong></div><div class="detail">Medio de pago: ${paymentLabel}${paymentMethod === 'cash' && receivedAmount() >= total ? `<br>Recibido: ${money(receivedAmount())}<br>Vuelto: ${money(receivedAmount() - total)}` : ''}</div><div class="footer">Gracias por tu compra</div><script>window.onload=()=>window.print();<\/script></body></html>`);
  receiptWindow.document.close();
}
function renderNotifications() { const unread = notifications.filter(notification => notification.unread).length; const count = document.querySelector('#notification-count'); count.textContent = unread; count.hidden = unread === 0; document.querySelector('#notification-list').innerHTML = notifications.length ? notifications.map(notification => `<div class="notification-item ${notification.unread ? 'unread' : ''}"><span class="notification-mark ${notification.type === 'stock' ? 'warning' : ''}">${notification.type === 'stock' ? '!' : '$'}</span><div class="notification-copy"><strong>${notification.title}</strong><span>${notification.detail}</span>${notification.amount ? `<span class="notification-amount">${notification.amount}</span>` : ''}<small>${notification.time}</small></div></div>`).join('') : '<div class="notification-empty">No hay actividad reciente.</div>'; }
function addSaleNotification(total, detail) { notifications.unshift({ type: 'sale', title: 'Venta completada', detail, amount: money(total), time: 'Ahora', unread: true }); notifications = notifications.slice(0, 8); renderNotifications(); }
function addToCart(id) { const product = productById(id); const item = cart.find(entry => entry.productId === id); if (item) item.quantity += 1; else cart.push({ productId: id, quantity: 1 }); renderCart(); showToast(`${product.name} agregado al ticket`); }
function changeQuantity(id, amount) { const item = cart.find(entry => entry.productId === id); if (!item) return; item.quantity += amount; if (item.quantity <= 0) cart = cart.filter(entry => entry.productId !== id); renderCart(); }

function renderInventory() {
  const search = document.querySelector('#inventory-search').value.toLowerCase().trim();
  const filtered = products.filter(product => {
    const categoryMatch = inventoryCategory === 'Todas' || product.category === inventoryCategory;
    const searchMatch = `${product.name} ${product.code} ${product.category}`.toLowerCase().includes(search);
    return categoryMatch && searchMatch;
  });
  document.querySelector('#inventory-count').textContent = `${filtered.length} productos`;
  document.querySelector('#inventory-body').innerHTML = filtered.map(product => `<tr><td>${product.name}</td><td>${product.category}</td><td>${product.code}</td><td>${money(product.price)}</td><td><span class="table-stock ${product.stock <= 3 ? 'low' : ''}">${product.stock} unidades</span></td><td><button class="row-action delete-product" type="button" data-remove-product="${product.id}" aria-label="Eliminar ${product.name}">×</button></td></tr>`).join('');
}
function removeProduct(id) {
  const product = productById(id);
  if (!product || !window.confirm(`¿Querés quitar “${product.name}” del inventario?`)) return;
  products = products.filter(item => item.id !== id);
  cart = cart.filter(item => item.productId !== id);
  localStorage.setItem('mostradorProducts', JSON.stringify(products));
  renderProducts();
  renderInventory();
  renderTopProducts();
  renderCart();
  showToast(`${product.name} quitado del inventario`);
}
function renderTopProducts() { document.querySelector('#top-products-list').innerHTML = products.slice(0, 4).map((product, index) => `<div class="top-product-row"><span class="top-product-number">0${index + 1}</span><div><strong>${product.name}</strong><span>${34 - index * 5} unidades vendidas</span></div><span class="top-product-price">${money(product.price)}</span></div>`).join(''); }
function dateKey(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
function todaySalesTotal(key) { return key === '2026-09-12' ? salesHistory.reduce((sum, sale) => sum + sale.total, 0) : 0; }
function defaultDayRecord(key) { const day = Number(key.slice(-2)); const date = new Date(`${key}T12:00:00`); return { open: date.getDay() !== 0, billing: todaySalesTotal(key), manual: false, day }; }
function dayRecord(key) { return workCalendar[key] || defaultDayRecord(key); }
function renderSelectedDay() { const record = dayRecord(selectedDateKey); const date = new Date(`${selectedDateKey}T12:00:00`); document.querySelector('#selected-date-label').textContent = date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }); document.querySelector('#selected-day-status').textContent = record.open ? 'Abierto' : 'No abre'; document.querySelector('#selected-day-status-detail').textContent = record.open ? 'El comercio trabaja este día' : 'El comercio permanece cerrado'; document.querySelector('.day-status-card').classList.toggle('closed', !record.open); document.querySelector('#mark-open').classList.toggle('active', record.open); document.querySelector('#mark-closed').classList.toggle('active', !record.open); document.querySelector('#day-billing').value = record.billing || ''; }
function renderCalendar() { const year = calendarCursor.getFullYear(); const month = calendarCursor.getMonth(); document.querySelector('#calendar-month').textContent = calendarCursor.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }); const firstDay = (new Date(year, month, 1).getDay() + 6) % 7; const daysInMonth = new Date(year, month + 1, 0).getDate(); let markup = ''; for (let index = 0; index < firstDay; index += 1) markup += '<span class="calendar-day empty"></span>'; for (let day = 1; day <= daysInMonth; day += 1) { const date = new Date(year, month, day); const key = dateKey(date); const record = dayRecord(key); const isToday = key === '2026-09-12'; const selected = key === selectedDateKey; const billing = record.billing ? `<em class="day-billing-amount">${money(record.billing)}</em>` : ''; markup += `<button class="calendar-day ${record.open ? 'open' : 'closed'} ${selected ? 'selected' : ''} ${isToday ? 'today' : ''}" data-calendar-date="${key}" type="button"><span class="day-number">${day}</span><span class="day-state"><i></i>${record.open ? 'Abierto' : 'No abre'}${billing}</span></button>`; } document.querySelector('#calendar-grid').innerHTML = markup; renderSelectedDay(); }
function renderCloseout() { const total = salesHistory.reduce((sum, sale) => sum + sale.total, 0); const cashTotal = salesHistory.filter(sale => sale.payment === 'Efectivo').reduce((sum, sale) => sum + sale.total, 0); document.querySelector('#closeout-total').textContent = money(total); document.querySelector('#closeout-count').textContent = salesHistory.length; document.querySelector('#closeout-cash').textContent = money(cashTotal); document.querySelector('#closeout-sales').innerHTML = salesHistory.map(sale => `<div class="closeout-row"><span class="closeout-time">${sale.time}</span><div class="closeout-detail"><strong>Venta registrada</strong><span>${sale.detail}</span></div><span class="closeout-payment">${sale.payment}</span><span class="closeout-amount">${money(sale.total)}</span></div>`).join(''); const status = document.querySelector('#closeout-status'); const button = document.querySelector('#closeout-button'); const jumpButton = document.querySelector('#go-closeout'); status.textContent = isDayClosed ? 'Caja cerrada' : 'Caja abierta'; status.classList.toggle('closed', isDayClosed); button.disabled = isDayClosed; button.innerHTML = isDayClosed ? 'Cierre realizado <span>✓</span>' : 'Cerrar caja del día <span>→</span>'; jumpButton.textContent = isDayClosed ? 'Cierre realizado ✓' : '▥  Ir a cierre de caja'; jumpButton.classList.toggle('is-closed', isDayClosed); }
function openView(view) { document.querySelectorAll('.view').forEach(element => element.classList.remove('active-view')); document.querySelector(`#${view}-view`).classList.add('active-view'); document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === view)); const titles = { sales: 'Operaciones', payment: 'Calculadora de cobro', inventory: 'Inventario', scanner: 'Escanear producto', reports: 'Resumen del día', closeout: 'Cierre de caja', calendar: 'Calendario' }; document.querySelector('#page-title').textContent = titles[view]; document.querySelector('#go-closeout').hidden = view === 'closeout'; if (view === 'inventory') renderInventory(); if (view === 'closeout') renderCloseout(); if (view === 'payment') renderCart(); if (view === 'calendar') renderCalendar(); }
function openModal() { document.querySelector('#product-modal').hidden = false; document.querySelector('#product-form').querySelector('input').focus(); }
function closeModal() { document.querySelector('#product-modal').hidden = true; }

document.addEventListener('click', event => {
  const addButton = event.target.closest('[data-add-product]'); if (addButton) addToCart(Number(addButton.dataset.addProduct));
  const removeButton = event.target.closest('[data-remove-product]'); if (removeButton) removeProduct(Number(removeButton.dataset.removeProduct));
  const increase = event.target.closest('[data-increase]'); if (increase) changeQuantity(Number(increase.dataset.increase), 1);
  const decrease = event.target.closest('[data-decrease]'); if (decrease) changeQuantity(Number(decrease.dataset.decrease), -1);
  const nav = event.target.closest('[data-view]'); if (nav) openView(nav.dataset.view);
  const viewTarget = event.target.closest('[data-view-target]'); if (viewTarget) openView(viewTarget.dataset.viewTarget);
  const action = event.target.closest('[data-action]'); if (action?.dataset.action === 'settings') { document.querySelector('#settings-modal').hidden = false; document.querySelector('#settings-status').textContent = 'Idioma actual: Español'; }
  const category = event.target.closest('[data-category]'); if (category) { currentCategory = category.dataset.category; document.querySelectorAll('.category-tab').forEach(tab => tab.classList.toggle('active', tab === category)); renderProducts(); }
});
document.querySelector('#product-search').addEventListener('input', renderProducts);
document.querySelector('#inventory-search').addEventListener('input', renderInventory);
document.querySelector('#inventory-category-filter').addEventListener('change', event => { inventoryCategory = event.target.value; renderInventory(); });
document.querySelector('#clear-cart').addEventListener('click', () => { cart = []; renderCart(); showToast('Ticket limpiado'); });
const printButton = document.createElement('button');
printButton.className = 'secondary-button print-button';
printButton.id = 'print-ticket';
printButton.type = 'button';
printButton.textContent = '▣ Imprimir ticket';
document.querySelector('#pay-button').parentElement.insertBefore(printButton, document.querySelector('#pay-button'));
printButton.addEventListener('click', printTicket);
document.querySelector('#cash-received').addEventListener('input', () => updatePaymentCalculator());
document.querySelectorAll('[data-cash]').forEach(button => button.addEventListener('click', () => { document.querySelector('#cash-received').value = button.dataset.cash; updatePaymentCalculator(); }));
document.querySelectorAll('[data-payment]').forEach(button => button.addEventListener('click', () => { paymentMethod = button.dataset.payment; document.querySelectorAll('.payment-method').forEach(method => method.classList.toggle('active', method === button)); document.querySelector('#cash-payment').hidden = paymentMethod !== 'cash'; document.querySelector('#pay-button').firstChild.textContent = paymentMethod === 'cash' ? 'Cobrar ' : 'Confirmar cobro '; }));
document.querySelector('#pay-button').addEventListener('click', () => { if (isDayClosed) { showToast('La caja está cerrada'); return; } if (!cart.length) { showToast('Agregá al menos un producto'); return; } const total = cart.reduce((sum, item) => sum + productById(item.productId).price * item.quantity, 0); if (paymentMethod === 'cash' && receivedAmount() < total) { showToast(`Faltan ${money(total - receivedAmount())}`); return; } const detail = cart.map(item => `${item.quantity} ${productById(item.productId).name}`).join(' + '); salesHistory.unshift({ time: 'Ahora', detail, total, payment: paymentMethod === 'cash' ? 'Efectivo' : paymentMethod === 'debit' ? 'Débito' : 'QR' }); localStorage.setItem('mostradorSales', JSON.stringify(salesHistory)); addSaleNotification(total, detail); renderCloseout(); document.querySelector('#operations-total').textContent = Number(document.querySelector('#operations-total').textContent) + 1; showToast('Venta registrada correctamente'); cart = []; document.querySelector('#cash-received').value = ''; renderCart(); });
document.querySelector('#closeout-button').addEventListener('click', () => { if (isDayClosed) return; isDayClosed = true; renderCloseout(); showToast(`Caja cerrada con ${salesHistory.length} ventas`); });
document.querySelector('#go-closeout').addEventListener('click', () => openView('closeout'));
document.querySelector('#calendar-grid').addEventListener('click', event => { const day = event.target.closest('[data-calendar-date]'); if (!day) return; selectedDateKey = day.dataset.calendarDate; renderCalendar(); });
document.querySelector('#previous-month').addEventListener('click', () => { calendarCursor.setMonth(calendarCursor.getMonth() - 1); renderCalendar(); });
document.querySelector('#next-month').addEventListener('click', () => { calendarCursor.setMonth(calendarCursor.getMonth() + 1); renderCalendar(); });
document.querySelector('#mark-open').addEventListener('click', () => { const record = dayRecord(selectedDateKey); workCalendar[selectedDateKey] = { ...record, open: true }; renderSelectedDay(); });
document.querySelector('#mark-closed').addEventListener('click', () => { const record = dayRecord(selectedDateKey); workCalendar[selectedDateKey] = { ...record, open: false }; renderSelectedDay(); });
document.querySelector('#save-day').addEventListener('click', () => { const record = dayRecord(selectedDateKey); workCalendar[selectedDateKey] = { ...record, billing: Number(document.querySelector('#day-billing').value) || 0, manual: true }; localStorage.setItem('mostradorCalendar', JSON.stringify(workCalendar)); renderCalendar(); document.querySelector('#day-saved').hidden = false; showToast('Día guardado en el calendario'); window.setTimeout(() => { document.querySelector('#day-saved').hidden = true; }, 2200); });
document.querySelector('#notification-button').addEventListener('click', () => { const panel = document.querySelector('#notification-panel'); panel.hidden = !panel.hidden; document.querySelector('#notification-button').setAttribute('aria-expanded', String(!panel.hidden)); });
document.querySelector('#mark-notifications').addEventListener('click', () => { notifications = notifications.map(notification => ({ ...notification, unread: false })); renderNotifications(); });
document.addEventListener('click', event => { if (!event.target.closest('.notification-wrap')) { document.querySelector('#notification-panel').hidden = true; document.querySelector('#notification-button').setAttribute('aria-expanded', 'false'); } });
document.querySelector('#store-button').addEventListener('click', () => { const menu = document.querySelector('#store-menu'); menu.hidden = !menu.hidden; document.querySelector('#store-button').setAttribute('aria-expanded', String(!menu.hidden)); });
document.querySelectorAll('[data-store]').forEach(option => option.addEventListener('click', () => { document.querySelectorAll('.store-option').forEach(item => item.classList.toggle('selected', item === option)); document.querySelector('#active-store-name').textContent = option.dataset.store; document.querySelector('#store-menu').hidden = true; document.querySelector('#store-button').setAttribute('aria-expanded', 'false'); showToast(`Comercio activo: ${option.dataset.store}`); }));
document.querySelector('#add-store-button').addEventListener('click', () => { document.querySelector('#store-menu').hidden = true; document.querySelector('#store-button').setAttribute('aria-expanded', 'false'); showToast('Podés agregar un nuevo comercio desde Configuración'); });
document.addEventListener('click', event => { if (!event.target.closest('.store-switcher')) { document.querySelector('#store-menu').hidden = true; document.querySelector('#store-button').setAttribute('aria-expanded', 'false'); } });
document.querySelectorAll('#add-product-top, #add-product-inventory').forEach(button => button.addEventListener('click', openModal));
document.querySelector('#close-modal').addEventListener('click', closeModal);
document.querySelector('#product-modal').addEventListener('click', event => { if (event.target.id === 'product-modal') closeModal(); });
document.querySelector('#close-settings').addEventListener('click', () => { document.querySelector('#settings-modal').hidden = true; });
document.querySelector('#settings-modal').addEventListener('click', event => { if (event.target.id === 'settings-modal') event.currentTarget.hidden = true; });
function openHelp() { document.querySelector('#settings-modal').hidden = true; document.querySelector('#help-modal').hidden = false; }
document.querySelector('#quick-help').addEventListener('click', openHelp);
document.querySelector('#settings-help').addEventListener('click', openHelp);
document.querySelector('#close-help').addEventListener('click', () => { document.querySelector('#help-modal').hidden = true; });
document.querySelector('#finish-help').addEventListener('click', () => { document.querySelector('#help-modal').hidden = true; });
document.querySelector('#help-modal').addEventListener('click', event => { if (event.target.id === 'help-modal') event.currentTarget.hidden = true; });
document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => { const language = button.dataset.language; document.querySelectorAll('.language-option').forEach(option => option.classList.toggle('active', option === button)); document.querySelector('#settings-status').textContent = language === 'es' ? 'Idioma actual: Español' : 'Language selected: English'; showToast(language === 'es' ? 'Idioma cambiado a Español' : 'English selected for the interface'); }));
function openLogoutConfirm() { document.querySelector('#settings-modal').hidden = true; document.querySelector('#logout-confirm-modal').hidden = false; }
function closeLogoutConfirm() { document.querySelector('#logout-confirm-modal').hidden = true; }
function performLogout() { closeLogoutConfirm(); localStorage.removeItem('mostradorSession'); document.querySelector('.app-shell').classList.remove('is-visible'); document.querySelector('#auth-screen').hidden = false; showAuthView('login'); }
document.querySelector('#logout-button').addEventListener('click', openLogoutConfirm);
document.querySelector('#settings-logout').addEventListener('click', openLogoutConfirm);
document.querySelector('#cancel-logout').addEventListener('click', closeLogoutConfirm);
document.querySelector('#confirm-logout').addEventListener('click', performLogout);
document.querySelector('#logout-confirm-modal').addEventListener('click', event => { if (event.target.id === 'logout-confirm-modal') closeLogoutConfirm(); });
document.querySelector('#product-form').addEventListener('submit', event => { event.preventDefault(); const data = new FormData(event.target); products.unshift({ id: Date.now(), name: data.get('name'), price: Number(data.get('price')), stock: Number(data.get('stock')), category: data.get('category'), code: data.get('code') || 'Sin código', icon: '✦' }); localStorage.setItem('mostradorProducts', JSON.stringify(products)); renderProducts(); renderInventory(); renderTopProducts(); closeModal(); event.target.reset(); showToast('Producto guardado en el inventario'); });
document.querySelector('#simulate-scan').addEventListener('click', () => { const product = products[Math.floor(Math.random() * products.length)]; document.querySelector('#last-scan-name').textContent = product.name; document.querySelector('#last-scan-detail').textContent = `${product.code} · ${money(product.price)} · ${product.stock} unidades disponibles`; showToast(`Código detectado: ${product.code}`); });
document.addEventListener('keydown', event => { if (event.key === 'F2') { event.preventDefault(); document.querySelector('#product-search').focus(); } if (event.key === 'Escape') closeModal(); });
function showAuthenticatedApp() { const session = JSON.parse(localStorage.getItem('mostradorSession') || '{}'); const isDeveloper = session.role === 'developer'; document.querySelector('#profile-avatar').textContent = isDeveloper ? 'DV' : 'JP'; document.querySelector('#profile-name').textContent = session.name || (isDeveloper ? 'Desarrollador' : 'Juan Pérez'); document.querySelector('#profile-role').textContent = isDeveloper ? 'Desarrollador' : 'Administrador'; document.querySelector('#auth-screen').hidden = true; document.querySelector('.app-shell').classList.add('is-visible'); }
function startSession(account) { localStorage.setItem('mostradorSession', JSON.stringify({ active: true, role: account.role || 'admin', name: account.name })); showAuthenticatedApp(); }
function showAuthView(view) { document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.authView === view)); document.querySelector('#register-form-wrap').hidden = view !== 'register'; document.querySelector('#login-form-wrap').hidden = view !== 'login'; }
document.querySelectorAll('[data-auth-view]').forEach(tab => tab.addEventListener('click', () => showAuthView(tab.dataset.authView)));
document.querySelectorAll('[data-auth-payment]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.auth-payment').forEach(method => method.classList.toggle('active', method === button)); document.querySelector('#auth-payment-value').value = button.dataset.authPayment; }));
document.querySelector('#register-form').addEventListener('submit', event => { event.preventDefault(); const data = new FormData(event.target); localStorage.setItem('mostradorAccount', JSON.stringify({ name: data.get('name'), store: data.get('store'), email: data.get('email'), password: data.get('password'), payment: data.get('payment') })); startSession({ name: data.get('name'), role: 'admin' }); showToast('Cuenta creada. Tu primer mes es gratis'); });
document.querySelector('#login-form').addEventListener('submit', event => { event.preventDefault(); const data = new FormData(event.target); const identifier = data.get('identifier'); const account = JSON.parse(localStorage.getItem('mostradorAccount') || 'null'); const error = document.querySelector('#auth-error'); const isDeveloper = identifier === developerCredentials.username && data.get('password') === developerCredentials.password; const isRegisteredUser = account && account.email === identifier && account.password === data.get('password'); if (!isDeveloper && !isRegisteredUser) { error.textContent = 'Usuario/email o contraseña incorrectos.'; error.hidden = false; return; } error.hidden = true; startSession(isDeveloper ? { name: 'Desarrollador', role: 'developer' } : { name: account.name, role: 'admin' }); showToast(isDeveloper ? 'Sesión de desarrollador iniciada' : 'Sesión iniciada correctamente'); });
renderProducts(); renderCart(); renderInventory(); renderTopProducts();
renderNotifications();
renderCloseout();
renderCalendar();
const savedSession = JSON.parse(localStorage.getItem('mostradorSession') || '{}');
if (savedSession.active) showAuthenticatedApp();
