// ── State ──
let currentPage = 'products'
let cartCount = 0

// ── Render navigation ──
function renderNav() {
  return `
    <nav>
      <span style="font-size:1.2rem">🛒 E-Store</span>
      <a onclick="navigate('products')">Products</a>
      <a onclick="navigate('cart')">
        Cart <span class="badge" id="cart-count">0</span>
      </a>
      <a onclick="navigate('orders')">Orders</a>
    </nav>
  `
}

// ── Navigation ──
function navigate(page) {
  currentPage = page
  renderApp()
}

// ── Main render ──
async function renderApp() {
  const root = document.getElementById('root')
  root.innerHTML = renderNav() + '<div class="container" id="page-content"></div>'

  const content = document.getElementById('page-content')

  if (currentPage === 'products') {
    await renderProducts(content)
  } else if (currentPage === 'cart') {
    await renderCart(content)
  } else if (currentPage === 'orders') {
    await renderOrders(content)
  }

  // Update cart count
  const cart = await fetch('/api/cart').then(r => r.json()).catch(() => [])
  document.getElementById('cart-count').textContent = cart.length || 0
}

// ── Start app ──
renderApp()