const express = require('express')
const router = express.Router()
const connectDB = require('../db')
const mongoose = require('mongoose')

const LeadSchema = new mongoose.Schema({
  nome: String,
  whatsapp: String,
  respostas: Object,
  telaParada: Number,
  origem: String,
  comprou: { type: Boolean, default: false },
  criadoEm: { type: Date, default: Date.now }
})

const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema)

// POST /api/leads — salvar novo lead
router.post('/', async (req, res) => {
  try {
    await connectDB()
    const lead = await Lead.create(req.body)
    res.json({ ok: true, id: lead._id })
  } catch (e) {
    res.status(500).json({ ok: false, erro: e.message })
  }
})

// GET /api/leads — listar todos os leads
router.get('/', async (req, res) => {
  try {
    await connectDB()
    const leads = await Lead.find().sort({ criadoEm: -1 }).limit(500)
    res.json(leads)
  } catch (e) {
    res.status(500).json({ ok: false, erro: e.message })
  }
})

// GET /api/leads/stats — estatísticas gerais
router.get('/stats', async (req, res) => {
  try {
    await connectDB()
    const total = await Lead.countDocuments()
    const compraram = await Lead.countDocuments({ comprou: true })
    const hoje = new Date(); hoje.setHours(0,0,0,0)
    const hoje_total = await Lead.countDocuments({ criadoEm: { $gte: hoje } })
    res.json({ total, compraram, hoje_total, conversao: total > 0 ? (compraram/total*100).toFixed(1) : 0 })
  } catch (e) {
    res.status(500).json({ ok: false, erro: e.message })
  }
})

// PATCH /api/leads/:id — atualizar tela parada
router.patch('/:id', async (req, res) => {
  try {
    await connectDB()
    await Lead.findByIdAndUpdate(req.params.id, {
      $set: { telaParada: req.body.telaParada }
    })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false, erro: e.message })
  }
})

module.exports = router
