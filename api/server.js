require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const connectDB = require('./db')

const app = express()

app.use(cors({
  origin: [
    'https://mounjarogelatinaoficial.site',
    'https://www.mounjarogelatinaoficial.site',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PATCH'],
  credentials: true
}))
app.use(express.json())
app.use(express.static(path.join(__dirname, '../public')))

app.use('/api/leads', require('./routes/leads'))
app.use('/api/vendas', require('./routes/vendas'))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'))
})

const PORT = process.env.PORT || 3000

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))
})

module.exports = app
