const API = window.location.hostname === 'localhost' ? 'http://localhost:3000' : ''

async function carregarDashboard() {
  const hoje = new Date()
  document.getElementById('data-hoje').textContent =
    hoje.toLocaleDateString('pt-BR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })

  try {
    const [statsLeads, statsVendas] = await Promise.all([
      fetch(`${API}/api/leads/stats`).then(r => r.json()),
      fetch(`${API}/api/vendas/stats`).then(r => r.json())
    ])

    document.getElementById('kpi-leads').textContent = statsLeads.hoje_total ?? 0
    document.getElementById('kpi-leads-delta').textContent = `${statsLeads.total ?? 0} total`
    document.getElementById('kpi-total-leads').textContent = statsLeads.total ?? 0
    document.getElementById('kpi-conversao').textContent = `${statsLeads.conversao ?? 0}%`
    document.getElementById('kpi-conv-delta').textContent =
      statsLeads.conversao > 3 ? '▲ acima da média' : '▼ abaixo da média'

    document.getElementById('kpi-vendas').textContent = statsVendas.vendas_hoje ?? 0
    document.getElementById('kpi-faturamento').textContent =
      `R$ ${Number(statsVendas.faturamento_hoje ?? 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}`
    document.getElementById('kpi-ticket').textContent =
      `R$ ${Number(statsVendas.ticket_medio ?? 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}`

  } catch(e) {
    console.error('Erro ao carregar stats:', e)
  }

  try {
    const [vendas, leads] = await Promise.all([
      fetch(`${API}/api/vendas`).then(r => r.json()),
      fetch(`${API}/api/leads`).then(r => r.json())
    ])

    const elVendas = document.getElementById('ultimas-vendas')
    if (!vendas.length) {
      elVendas.innerHTML = '<div class="empty"><div class="empty-icon">💰</div>Nenhuma venda ainda</div>'
    } else {
      elVendas.innerHTML = `<div class="table-wrap"><table>
        <thead><tr><th>Nome</th><th>Valor</th><th>Status</th><th>Data</th></tr></thead>
        <tbody>${vendas.slice(0,8).map(v => `
          <tr>
            <td class="td-name">${v.nome || '—'}</td>
            <td class="td-mono">R$ ${Number(v.valor||0).toFixed(2)}</td>
            <td><span class="badge badge-${v.status==='aprovado'?'green':'amber'}">${v.status}</span></td>
            <td class="td-mono">${new Date(v.criadoEm).toLocaleDateString('pt-BR')}</td>
          </tr>`).join('')}
        </tbody></table></div>`
    }

    const elLeads = document.getElementById('ultimos-leads')
    if (!leads.length) {
      elLeads.innerHTML = '<div class="empty"><div class="empty-icon">👥</div>Nenhum lead ainda</div>'
    } else {
      elLeads.innerHTML = `<div class="table-wrap"><table>
        <thead><tr><th>Nome</th><th>WhatsApp</th><th>Status</th><th>Data</th></tr></thead>
        <tbody>${leads.slice(0,8).map(l => `
          <tr>
            <td class="td-name">${l.nome || '—'}</td>
            <td class="td-mono">${l.whatsapp || '—'}</td>
            <td><span class="badge badge-${l.comprou?'green':'gray'}">${l.comprou?'comprou':'lead'}</span></td>
            <td class="td-mono">${new Date(l.criadoEm).toLocaleDateString('pt-BR')}</td>
          </tr>`).join('')}
        </tbody></table></div>`
    }

  } catch(e) {
    console.error('Erro ao carregar listas:', e)
  }
}

carregarDashboard()
