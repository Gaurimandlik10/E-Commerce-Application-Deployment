const mongoose = require('mongoose')

const connectDB = async () => {
  const mongoURL = process.env.MONGO_URL ||
    'mongodb://mongo-0.mongo-headless:27017,mongo-1.mongo-headless:27017,mongo-2.mongo-headless:27017/ecommerce?replicaSet=rs0'

  try {
    await mongoose.connect(mongoURL)
    console.log('MongoDB connected!')
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  }
}

module.exports = connectDB