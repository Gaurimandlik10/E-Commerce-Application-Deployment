const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()

// ── Cart Schema ──
const cartSchema = new mongoose.Schema({
  productId: String,
  name: String,
  price: Number,
  quantity: { type: Number, default: 1 },
  addedAt: { type: Date, default: Date.now }
})

const Cart = mongoose.model('Cart', cartSchema)

// ── GET cart ──
router.get('/', async (req, res) => {
  try {
    const items = await Cart.find()
    res.json(items)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ── POST add to cart ──
router.post('/', async (req, res) => {
  try {
    const { productId, name, price, quantity } = req.body

    // Check if already in cart
    const existing = await Cart.findOne({ productId })
    if (existing) {
      existing.quantity += quantity || 1
      await existing.save()
      return res.json(existing)
    }

    const item = new Cart({ productId, name, price, quantity: quantity || 1 })
    await item.save()
    res.status(201).json(item)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// ── DELETE remove item ──
router.delete('/:id', async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id)
    res.json({ message: 'Item removed from cart' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ── DELETE clear cart ──
router.delete('/', async (req, res) => {
  try {
    await Cart.deleteMany({})
    res.json({ message: 'Cart cleared' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router