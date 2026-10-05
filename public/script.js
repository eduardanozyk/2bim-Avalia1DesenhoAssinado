let googleIdToken = null;

// Recebe a resposta com o token do Google
window.handleCredentialResponse = function(response) {
  googleIdToken = response.credential;
  mostrarErro('');
};

const form = document.getElementById('form-desenho');
const erroDiv = document.getElementById('mensagem-erro');
const resultadoDiv = document.getElementById('resultado-svg');

function mostrarErro(msg) {
  if (msg) {
    erroDiv.innerText = msg;
    erroDiv.style.display = 'block';
  } else {
    erroDiv.innerText = '';
    erroDiv.style.display = 'none';
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  mostrarErro('');
  resultadoDiv.innerHTML = '';

  const numeroVal = parseInt(document.getElementById('numero').value, 10);

  if (!googleIdToken) {
    mostrarErro('Faça login com sua conta Google antes de gerar o desenho.');
    return;
  }

  try {
    const res = await fetch('/api/desenho', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${googleIdToken}`
      },
      body: JSON.stringify({ numero: numeroVal })
    });

    if (res.status === 400) {
      mostrarErro('Erro 400: Parâmetros inválidos.');
      return;
    }

    if (res.status === 401) {
      mostrarErro('Erro 401: Não autorizado (token inválido ou ausente).');
      return;
    }

    if (!res.ok) {
      mostrarErro(`Erro: ${res.status}`);
      return;
    }

    const svgTexto = await res.text();
    resultadoDiv.innerHTML = svgTexto;
  } catch (err) {
    mostrarErro('Erro de conexão ao servidor.');
  }
});