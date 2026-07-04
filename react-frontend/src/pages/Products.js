async function renderProducts(container) {
  container.innerHTML = '<h1>🛍️ Products</h1><p>Loading...</p>'

  try {
    // Fetch products from Node.js API
    const products = await fetch('/api/products').then(r => r.json())

    container.innerHTML = `
      <h1>🛍️ Products</h1>
      <div class="grid">
        ${products.map(p => `
          <div class="card">
            <h2>${p.name}</h2>
            <p>${p.description}</p>
            <p class="price">$${p.price}</p>
            <p>Stock: ${p.stock}</p>
            <button onclick="addToCart('${p._id}', '${p.name}', ${p.price})">
              Add to Cart
            </button>
          </div>
        `).join('')}
      </div>
    `
  } catch (error) {
    container.innerHTML = `
      <h1>🛍️ Products</h1>
      <div class="card">
        <p>Error loading products. Is the API running?</p>
        <p>${error.message}</p>
      </div>
    `
  }
}

async function addToCart(productId, name, price) {
  try {
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, name, price, quantity: 1 })
    })
    alert(`${name} added to cart!`)

    // Update cart badge
    const cart = await fetch('/api/cart').then(r => r.json())
    document.getElementById('cart-count').textContent = cart.length
  } catch (error) {
    alert('Error adding to cart: ' + error.message)
  }
}