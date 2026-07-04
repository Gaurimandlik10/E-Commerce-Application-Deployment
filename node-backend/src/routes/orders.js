const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()

// ── Order Schema ──
const orderSchema = new mongoose.Schema({
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  total: Number,
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
})

const Order = mongoose.model('Order', orderSchema)

// ── GET all orders ──
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ── POST create order ──
router.post('/', async (req, res) => {
  try {
    const { items } = req.body

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in order' })
    }

    // Calculate total
    const total = items.reduce((sum, item) =>
      sum + (item.price * item.quantity), 0)

    const order = new Order({ items, total })
    await order.save()

    // Track metric
    if (req.app.locals.metrics) {
      req.app.locals.metrics.orderCreatedTotal.inc()
    }

    res.status(201).json(order)
  } catch (error) {
    // Track failed order metric
    if (req.app.locals.metrics) {
      req.app.locals.metrics.orderFailedTotal.inc()
    }
    res.status(500).json({ error: error.message })
  }
})

// ── GET single order ──
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }
    res.json(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router