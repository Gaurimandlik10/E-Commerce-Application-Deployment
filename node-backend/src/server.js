const express = require('express')
const cors = require('cors')
const client = require('prom-client')
const connectDB = require('./db')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Connect to MongoDB
connectDB()

// ── Prometheus Metrics Setup ──
const register = new client.Registry()
client.collectDefaultMetrics({ register })

// Custom business metrics
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
})

const orderCreatedTotal = new client.Counter({
  name: 'order_created_total',
  help: 'Total orders created',
  registers: [register]
})

const orderFailedTotal = new client.Counter({
  name: 'order_failed_total',
  help: 'Total orders failed',
  registers: [register]
})

const cartAbandonedTotal = new client.Counter({
  name: 'cart_abandoned_total',
  help: 'Total carts abandoned',
  registers: [register]
})

// Make metrics available to routes
app.locals.metrics = {
  httpRequestsTotal,
  orderCreatedTotal,
  orderFailedTotal,
  cartAbandonedTotal
}

// ── Routes ──
app.use('/api/products', require('./routes/products'))
app.use('/api/cart', require('./routes/cart'))
app.use('/api/orders', require('./routes/orders'))

// ── Health Check ──
app.get('/health', async (req, res) => {
  const mongoose = require('mongoose')
  const dbStatus = mongoose.connection.readyState === 1
    ? 'connected' : 'disconnected'

  res.status(dbStatus === 'connected' ? 200 : 503).json({
    status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
    database: dbStatus,
    uptime: process.uptime()
  })
})

// ── Prometheus Metrics Endpoint ──
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType)
  res.send(await register.metrics())
})

// ── Start Server ──
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})