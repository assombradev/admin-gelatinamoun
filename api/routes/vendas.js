const express = require('express')
const router = express.Router()
const connectDB = require('../db')
const mongoose = require('mongoose')

const VendaSchema = new mongoose.Schema({
  transacaoId: { type: String, unique: true, sparse: true },
  nome: String,
  email: String,
  telefone: String,
  valor: Number,
  produto: String,
  status: { type: String, default: 'aprovado' },
  metodoPagamento: String,
  criadoEm: { type: Date, default: Date.now }
})

const Venda = mongoose.models.Venda || mongoose.model('Venda', VendaSchema)

// POST /api/vendas/webhook — receber venda do gateway BRPIX
router.post('/webhook', async (req, res) => {
  try {
    await connectDB()

    const payload = req.body

    // Responde 200 imediatamente conforme boa prática do BRPIX
    res.json({ ok: true })

    // Só processa status relevantes
    const statusRelevantes = ['paid', 'refunded', 'chargedback', 'refused', 'canceled']
    if (!statusRelevantes.includes(payload?.data?.status)) return

    const data = payload.data
    const transacaoId = data.id

    // Idempotência — evita duplicar a mesma transação
    const jaExiste = await Venda.findOne({ transacaoId })
    if (jaExiste) {
      // Só atualiza o status se já existir
      await Venda.findOneAndUpdate({ transacaoId }, { $set: { status: data.status } })
      return
    }

    // Mapeia método de pagamento
    const metodo = data.paymentMethod === 'PIX' ? 'pix'
      : data.paymentMethod === 'CREDIT_CARD' ? 'cartao_credito'
      : data.paymentMethod === 'BOLETO' ? 'boleto'
      : data.paymentMethod?.toLowerCase() || 'outro'

    // Mapeia status
    const statusMap = {
      paid: 'aprovado',
      refunded: 'reembolsado',
      chargedback: 'chargeback',
      refused: 'recusado',
      canceled: 'cancelado'
    }

    // Monta o produto a partir dos items
    const produto = data.items?.map(i => i.title).join(', ') || 'Gelatina Mounjaro'

    await Venda.create({
      transacaoId,
      nome: data.customer?.name || '',
      email: data.customer?.email || '',
      telefone: data.customer?.phone || '',
      valor: (data.amount || 0) / 100, // BRPIX envia em centavos
      produto,
      status: statusMap[data.status] || data.status,
      metodoPagamento: metodo,
      criadoEm: data.paidAt ? new Date(data.paidAt) : new Date()
    })

  } catch (e) {
    console.error('Webhook error:', e.message)
    // Não retorna erro para o BRPIX — já respondemos 200
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
