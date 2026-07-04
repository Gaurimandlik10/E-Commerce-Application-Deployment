async function renderCart(container) {
  container.innerHTML = '<h1>🛒 Cart</h1><p>Loading...</p>'

  try {
    const cart = await fetch('/api/cart').then(r => r.json())

    if (cart.length === 0) {
      container.innerHTML = `
        <h1>🛒 Cart</h1>
        <div class="card">
          <p>Your cart is empty!</p>
          <button onclick="navigate('products')">Shop Now</button>
        </div>
      `
      return
    }

    const total = cart.reduce((sum, item) =>
      sum + (item.price * item.quantity), 0)

    container.innerHTML = `
      <h1>🛒 Cart</h1>
      ${cart.map(item => `
        <div class="card">
          <h2>${item.name}</h2>
          <p>Price: $${item.price}</p>
          <p>Quantity: ${item.quantity}</p>
          <p class="price">Subtotal: $${(item.price * item.quantity).toFixed(2)}</p>
          <button class="btn-danger"
            onclick="removeFromCart('${item._id}')">
            Remove
          </button>
        </div>
      `).join('')}
      <div class="card">
        <h2>Total: $${total.toFixed(2)}</h2>
        <button class="btn-success" onclick="placeOrder()">
          Place Order
        </button>
      </div>
    `
  } catch (error) {
    container.innerHTML = `
      <h1>🛒 Cart</h1>
      <div class="card"><p>Error: ${error.message}</p></div>
    `
  }
}

async function removeFromCart(itemId) {
  await fetch(`/api/cart/${itemId}`, { method: 'DELETE' })
  renderApp()
}

async function placeOrder() {
  try {
    const cart = await fetch('/api/cart').then(r => r.json())

    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart })
    })

    // Clear cart
    await fetch('/api/cart', { method: 'DELETE' })

    alert('Order placed successfully!')
    navigate('orders')
  } catch (error) {
    alert('Error placing order: ' + error.message)
  }
}