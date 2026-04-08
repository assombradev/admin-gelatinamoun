const express = require('express')
const router = express.Router()
const connectDB = require('../db')
const mongoose = require('mongoose')

const VendaSchema = new mongoose.Schema({
  leadId: String,
  nome: String,
  valor: Number,
  produto: String,
  status: { type: String, default: 'aprovado' },
  metodoPagamento: String,
  criadoEm: { type: Date, default: Date.now }
})

const Venda = mongoose.models.Venda || mongoose.model('Venda', VendaSchema)

// POST /api/vendas/webhook — receber venda do gateway
router.post('/webhook', async (req, res) => {
  try {
    await connectDB()
    const venda = await Venda.create(req.body)
    res.json({ ok: true, id: venda._id })
  } catch (e) {
    res.status(500).json({ ok: false, erro: e.message })
  }
})

// GET /api/vendas — listar vendas
router.get('/', async (req, res) => {
  try {
    await connectDB()
    const vendas = await Venda.find().sort({ criadoEm: -1 }).limit(500)
    res.json(vendas)
  } catch (e) {
    res.status(500).json({ ok: false, erro: e.message })
  }
})

// GET /api/vendas/stats — estatísticas financeiras
router.get('/stats', async (req, res) => {
  try {
    await connectDB()
    const hoje = new Date(); hoje.setHours(0,0,0,0)
    const vendas_hoje = await Venda.find({ criadoEm: { $gte: hoje }, status: 'aprovado' })
    const total_hoje = vendas_hoje.reduce((acc, v) => acc + v.valor, 0)
    const todas = await Venda.find({ status: 'aprovado' })
    const total_geral = todas.reduce((acc, v) => acc + v.valor, 0)
    res.json({
      vendas_hoje: vendas_hoje.length,
      faturamento_hoje: total_hoje,
      total_vendas: todas.length,
      faturamento_total: total_geral,
      ticket_medio: todas.length > 0 ? (total_geral / todas.length).toFixed(2) : 0
    })
  } catch (e) {
    res.status(500).json({ ok: false, erro: e.message })
  }
})

module.exports = router
