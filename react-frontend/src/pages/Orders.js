async function renderOrders(container) {
  container.innerHTML = '<h1>📦 Orders</h1><p>Loading...</p>'

  try {
    const orders = await fetch('/api/orders').then(r => r.json())

    if (orders.length === 0) {
      container.innerHTML = `
        <h1>📦 Orders</h1>
        <div class="card">
          <p>No orders yet!</p>
          <button onclick="navigate('products')">Start Shopping</button>
        </div>
      `
      return
    }

    container.innerHTML = `
      <h1>📦 Orders</h1>
      ${orders.map(order => `
        <div class="card">
          <h2>Order #${order._id.slice(-6).toUpperCase()}</h2>
          <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p>Status: <strong>${order.status}</strong></p>
          <p class="price">Total: $${order.total.toFixed(2)}</p>
          <p>Items:</p>
          <ul>
            ${order.items.map(item =>
              `<li>${item.name} x${item.quantity} - $${item.price}</li>`
            ).join('')}
          </ul>
        </div>
      `).join('')}
    `
  } catch (error) {
    container.innerHTML = `
      <h1>📦 Orders</h1>
      <div class="card"><p>Error: ${error.message}</p></div>
    `
  }
}