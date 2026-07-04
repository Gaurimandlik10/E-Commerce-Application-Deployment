const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()

// ── Product Schema ──
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  stock: { type: Number, default: 100 },
  category: String,
  createdAt: { type: Date, default: Date.now }
})

const Product = mongoose.model('Product', productSchema)

// ── Seed dummy products if none exist ──
async function seedProducts() {
  const count = await Product.countDocuments()
  if (count === 0) {
    await Product.insertMany([
      {
        name: 'Laptop Pro',
        description: 'High performance laptop for developers',
        price: 999.99,
        stock: 50,
        category: 'Electronics'
      },
      {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse',
        price: 29.99,
        stock: 200,
        category: 'Accessories'
      },
      {
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard',
        price: 79.99,
        stock: 150,
        category: 'Accessories'
      },
      {
        name: 'Monitor 4K',
        description: '27 inch 4K display',
        price: 399.99,
        stock: 30,
        category: 'Electronics'
      },
      {
        name: 'USB Hub',
        description: '7 port USB 3.0 hub',
        price: 19.99,
        stock: 300,
        category: 'Accessories'
      },
      {
        name: 'Webcam HD',
        description: '1080p webcam with mic',
        price: 49.99,
        stock: 100,
        category: 'Electronics'
      }
    ])
    console.log('Products seeded!')
  }
}

// Seed on startup
setTimeout(seedProducts, 3000)

// ── GET all products ──
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ── GET single product ──
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ── POST create product ──
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body)
    await product.save()
    res.status(201).json(product)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = router