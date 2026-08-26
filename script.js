// 1. Configuración y Datos Iniciales
const WHATSAPP_NUMBER = "50431531884"; // Número de WhatsApp sin '+' ni espacios

const products = [
  { id: 1, name: "Mango Enchilado Clásico", price: 65.00, img: "https://via.placeholder.com/300x200?text=Mango+Enchilado" },
  { id: 2, name: "Manzana Loca con Chile", price: 50.00, img: "https://via.placeholder.com/300x200?text=Manzana+Enchilada" },
  { id: 3, name: "Gominolas con Tajín", price: 40.00, img: "https://via.placeholder.com/300x200?text=Gominolas" },
  { id: 4, name: "Chips de Plátano con Chile", price: 35.00, img: "https://via.placeholder.com/300x200?text=Chips+Platano" },
  { id: 5, name: "Combo Dulce y Picadita", price: 120.00, img: "https://via.placeholder.com/300x200?text=Combo+Especial" }
];

// Carga el carrito guardado en localStorage o inicia vacío
let cart = JSON.parse(localStorage.getItem("dyp_cart")) || [];

// 2. Renderizado del Catálogo
function renderCatalog(itemsToRender = products) {
  const catalog = document.getElementById("catalog");
  if (!catalog) return;

  if (itemsToRender.length === 0) {
    catalog.innerHTML = `<p class="no-results">No se encontraron productos disponibles.</p>`;
    return;
  }

  catalog.innerHTML = itemsToRender.map(p => `
    <div class="product-card">
      <img src="${p.img}" alt="${p.name}" loading="lazy">
      <div class="product-info">
        <h3>${p.name}</h3>
        <p class="price">L. ${p.price.toFixed(2)}</p>
        <button class="btn-primary" onclick="addToCart(${p.id})">
          <i class="fa-solid fa-cart-plus"></i> Agregar al Carrito
        </button>
      </div>
    </div>
  `).join("");
}

// 3. Gestión del Carrito
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart();
  showToast(`${product.name} agregado al carrito`);
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }

  saveCart();
  renderCart();
}

function removeFromCart(id) {
  const item = cart.find(i => i.id === id);
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
  if (item) showToast(`${item.name} eliminado`);
}

function saveCart() {
  localStorage.setItem("dyp_cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartCountElem = document.getElementById("cart-count");
  if (cartCountElem) cartCountElem.textContent = totalCount;
}

function renderCart() {
  const container = document.getElementById("cart-items");
  const totalElem = document.getElementById("cart-total");

  if (!container || !totalElem) return;

  if (cart.length === 0) {
    container.innerHTML = "<p class='empty-cart'>Tu carrito está vacío.</p>";
    totalElem.textContent = "0.00";
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">L. ${(item.price * item.qty).toFixed(2)}</span>
        <div class="qty-controls">
          <button class="btn-qty" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-number">${item.qty}</span>
          <button class="btn-qty" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <button class="btn-remove" onclick="removeFromCart(${item.id})" aria-label="Eliminar producto">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>
  `).join("");

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  totalElem.textContent = total.toFixed(2);
}

// 4. Modales
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("hidden");
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("hidden");
}

// 5. Compra por WhatsApp
function handleCheckout(e) {
  if (e) e.preventDefault();

  if (cart.length === 0) {
    showToast("Tu carrito está vacío");
    return;
  }

  const name = document.getElementById("customer-name")?.value.trim();
  const phone = document.getElementById("customer-phone")?.value.trim();
  const address = document.getElementById("customer-address")?.value.trim();

  if (!name || !phone || !address) {
    showToast("Por favor completa todos tus datos de envío");
    return;
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const itemsText = cart.map(i => `• ${i.name} x${i.qty} - L.${(i.price * i.qty).toFixed(2)}`).join("\n");

  const message = `*¡Nuevo Pedido - Dulce y Picadita!* 🎉\n\n` +
                  `*Datos del Cliente:*\n` +
                  `👤 *Nombre:* ${name}\n` +
                  `📞 *Teléfono:* ${phone}\n` +
                  `📍 *Dirección:* ${address}\n\n` +
                  `*Detalle del Pedido:*\n${itemsText}\n\n` +
                  `*Total a pagar: L. ${total.toFixed(2)}*`;

  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank");

  // Limpiar carrito tras realizar pedido
  cart = [];
  saveCart();
  closeModal("cart-modal");
  
  // Limpiar formulario
  const form = document.getElementById("checkout-form");
  if (form) form.reset();
}

// 6. Notificaciones Toast
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.remove("hidden");
  
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2500);
}

// 7. Event Listeners e Inicialización
document.addEventListener("DOMContentLoaded", () => {
  renderCatalog();
  updateCartCount();

  // Búsqueda en tiempo real
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = products.filter(p => p.name.toLowerCase().includes(query));
      renderCatalog(filtered);
    });
  }

  // Apertura de Modales
  document.getElementById("cart-btn")?.addEventListener("click", () => {
    renderCart();
    openModal("cart-modal");
  });

  document.getElementById("about-btn")?.addEventListener("click", () => openModal("about-modal"));
  document.getElementById("contact-btn")?.addEventListener("click", () => openModal("contact-modal"));

  // Envío del Formulario
  const checkoutForm = document.getElementById("checkout-form");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", handleCheckout);
  } else {
    document.getElementById("buy-now-btn")?.addEventListener("click", handleCheckout);
  }
});
