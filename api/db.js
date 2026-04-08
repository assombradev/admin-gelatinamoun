const mongoose = require('mongoose')
require('dotenv').config()

let connected = false

async function connectDB() {
  if (connected) return
  await mongoose.connect(process.env.MONGODB_URI)
  connected = true
  console.log('MongoDB conectado')
}

module.exports = connectDB
