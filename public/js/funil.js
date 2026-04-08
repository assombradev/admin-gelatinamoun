const API = window.location.hostname === 'localhost' ? 'http://localhost:3000' : ''

const TELAS = [
  'Tela 01 — Idade', 'Tela 02 — Biotipo', 'Tela 03 — Áreas',
  'Tela 04 — Famosas', 'Tela 05 — Nome', 'Tela 06 — Como afeta',
  'Tela 07 — Satisfação', 'Tela 08 — Barreiras', 'Tela 09 — Objetivos',
  'Tela 10 — Peso atual', 'Tela 11 — Altura', 'Tela 12 — Peso desejado',
  'Tela 13 — Loading', 'Tela 14 — Gestações', 'Tela 15 — Rotina',
  'Tela 16 — Sono', 'Tela 17 — Água', 'Tela 18 — Loading análise',
  'Tela 19 — VSL 1', 'Tela 20 — Resultado', 'Tela 21 — WhatsApp',
  'Tela 22 — Como usar', 'Tela 23 — Compromisso', 'Tela 24 — Loading 2',
  'Tela 25 — VSL 2', 'Tela 26 — Loading final', 'Tela 27 — Oferta'
]

async function carregarFunil() {
  try {
    const leads = await fetch(`${API}/api/leads`).then(r => r.json())
    if (!leads.length) {
      document.getElementById('funil-wrap').innerHTML =
        '<div class="empty"><div class="empty-icon">📊</div>Nenhum dado ainda — aguardando leads</div>'
      return
    }
    const total = leads.length
    const contagem = Array(27).fill(0)
    leads.forEach(l => {
      const tela = Math.min(l.telaParada || 1, 27)
      for (let i = 0; i < tela; i++) contagem[i]++
    })
    const html = TELAS.map((nome, i) => {
      const count = contagem[i]
      const pct = total > 0 ? (count / total * 100).toFixed(1) : 0
      const dropoff = i > 0 && contagem[i-1] > 0
        ? ((contagem[i-1] - count) / contagem[i-1] * 100).toFixed(1)
        : 0
      const cor = dropoff > 25 ? 'red' : dropoff > 15 ? 'amber' : ''
      return `<div class="funil-bar-wrap">
        <span class="funil-label">${nome}</span>
        <div class="funil-bar-bg">
          <div class="funil-bar-fill ${cor}" style="width:${pct}%"></div>
        </div>
        <span class="funil-count">${count}</span>
        <span class="funil-pct">${pct}%</span>
        ${i > 0 ? `<span class="funil-pct" style="color:${dropoff>25?'var(--red)':dropoff>15?'var(--amber)':'var(--text3)'}">-${dropoff}%</span>` : '<span class="funil-pct"></span>'}
      </div>`
    }).join('')
    document.getElementById('funil-wrap').innerHTML = html
  } catch(e) {
    document.getElementById('funil-wrap').innerHTML =
      '<div class="empty"><div class="empty-icon">⚠️</div>Erro ao carregar funil</div>'
  }
}

carregarFunil()
