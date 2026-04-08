const API = window.location.hostname === 'localhost' ? 'http://localhost:3000' : ''
let todosLeads = []

async function carregarLeads() {
  try {
    const [stats, leads] = await Promise.all([
      fetch(`${API}/api/leads/stats`).then(r => r.json()),
      fetch(`${API}/api/leads`).then(r => r.json())
    ])
    todosLeads = leads
    document.getElementById('kpi-total').textContent = stats.total ?? 0
    document.getElementById('kpi-compraram').textContent = stats.compraram ?? 0
    document.getElementById('kpi-nao').textContent = (stats.total - stats.compraram) ?? 0
    document.getElementById('kpi-taxa').textContent = `${stats.conversao ?? 0}%`
    renderTabela(leads)
  } catch(e) {
    document.getElementById('tabela-leads').innerHTML =
      '<div class="empty"><div class="empty-icon">⚠️</div>Erro ao carregar leads</div>'
  }
}

function renderTabela(leads) {
  const el = document.getElementById('tabela-leads')
  document.getElementById('badge-total').textContent = `${leads.length} leads`
  if (!leads.length) {
    el.innerHTML = '<div class="empty"><div class="empty-icon">👥</div>Nenhum lead encontrado</div>'
    return
  }
  el.innerHTML = `<div class="table-wrap"><table>
    <thead><tr>
      <th>Nome</th><th>WhatsApp</th><th>Tela parada</th>
      <th>Status</th><th>Origem</th><th>Data</th>
    </tr></thead>
    <tbody>${leads.map(l => `
      <tr>
        <td class="td-name">${l.nome || '—'}</td>
        <td class="td-mono">${l.whatsapp || '—'}</td>
        <td class="td-mono">${l.telaParada ? `tela ${l.telaParada}` : '—'}</td>
        <td><span class="badge badge-${l.comprou ? 'green' : 'gray'}">${l.comprou ? 'comprou' : 'lead'}</span></td>
        <td class="td-mono" style="font-size:11px">${l.origem || '—'}</td>
        <td class="td-mono">${new Date(l.criadoEm).toLocaleDateString('pt-BR')}</td>
      </tr>`).join('')}
    </tbody></table></div>`
}

function filtrar() {
  const busca = document.getElementById('busca').value.toLowerCase()
  const status = document.getElementById('filtro-status').value
  let resultado = todosLeads.filter(l => {
    const matchBusca = !busca ||
      (l.nome || '').toLowerCase().includes(busca) ||
      (l.whatsapp || '').includes(busca)
    const matchStatus = !status ||
      (status === 'comprou' && l.comprou) ||
      (status === 'nao' && !l.comprou)
    return matchBusca && matchStatus
  })
  renderTabela(resultado)
}

carregarLeads()
