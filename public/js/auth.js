const ADMIN_USER = 'admin'
const ADMIN_PASS = 'gm@2025'

function fazerLogin() {
  const user = document.getElementById('username').value.trim()
  const pass = document.getElementById('password').value.trim()
  const erro = document.getElementById('login-error')
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    localStorage.setItem('gm_admin', '1')
    window.location.href = 'dashboard.html'
  } else {
    erro.style.display = 'block'
    erro.textContent = 'Usuário ou senha incorretos'
  }
}

function verificarAuth() {
  if (!localStorage.getItem('gm_admin')) {
    window.location.href = 'index.html'
  }
}

function sair() {
  localStorage.removeItem('gm_admin')
  window.location.href = 'index.html'
}

if (document.getElementById('username') === null) {
  verificarAuth()
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('username')) fazerLogin()
})
