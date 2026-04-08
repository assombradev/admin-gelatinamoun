const API = window.location.hostname === 'localhost' ? 'http://localhost:3000' : ''
let todasVendas = []

async function carregarFinanceiro() {
  try {
    const [stats, vendas] = await Promise.all([
      fetch(`${API}/api/vendas/stats`).then(r => r.json()),
      fetch(`${API}/api/vendas`).then(r => r.json())
    ])
    todasVendas = vendas
    const fmt = v => `R$ ${Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`
    document.getElementById('kpi-hoje').textContent = fmt(stats.faturamento_hoje)
    document.getElementById('kpi-total').textContent = fmt(stats.faturamento_total)
    document.getElementById('kpi-qtd').textContent = stats.total_vendas ?? 0
    document.getElementById('kpi-ticket').textContent = fmt(stats.ticket_medio)
    renderTabela(vendas)
  } catch(e) {
    document.getElementById('tabela-vendas').innerHTML =
      '<div class="empty"><div class="empty-icon">⚠️</div>Erro ao carregar vendas</div>'
  }
}

function renderTabela(vendas) {
  const el = document.getElementById('tabela-vendas')
  document.getElementById('badge-total').textContent = `${vendas.length} vendas`
  if (!vendas.length) {
    el.innerHTML = '<div class="empty"><div class="empty-icon">💰</div>Nenhuma venda ainda</div>'
    return
  }
  el.innerHTML = `<div class="table-wrap"><table>
    <thead><tr>
      <th>Nome</th><th>Valor</th><th>Produto</th>
      <th>Pagamento</th><th>Status</th><th>Data</th>
    </tr></thead>
    <tbody>${vendas.map(v => `
      <tr>
        <td class="td-name">${v.nome || '—'}</td>
        <td class="td-mono">R$ ${Number(v.valor||0).toFixed(2)}</td>
        <td style="font-size:12px">${v.produto || '—'}</td>
        <td class="td-mono" style="font-size:11px">${v.metodoPagamento || '—'}</td>
        <td><span class="badge badge-${v.status==='aprovado'?'green':v.status==='reembolsado'?'red':'amber'}">${v.status||'—'}</span></td>
        <td class="td-mono">${new Date(v.criadoEm).toLocaleDateString('pt-BR')}</td>
      </tr>`).join('')}
    </tbody></table></div>`
}

function filtrar() {
  const busca = document.getElementById('busca').value.toLowerCase()
  const status = document.getElementById('filtro-status').value
  let resultado = todasVendas.filter(v => {
    const matchBusca = !busca || (v.nome||'').toLowerCase().includes(busca)
    const matchStatus = !status || v.status === status
    return matchBusca && matchStatus
  })
  renderTabela(resultado)
}

carregarFinanceiro()
