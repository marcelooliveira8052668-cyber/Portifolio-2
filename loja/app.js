/* =========================================================
   LOJA DE CÓDIGOS — lógica da vitrine
   Marcelo Oliveira

   1. Configuração e utilidades
   2. Carregamento do catálogo
   3. Pacotes
   4. Filtros
   5. Grade de produtos
   6. Modal de detalhe
   7. Checkout Pix (Mercado Pago via API própria)
   8. Copiar / colar, status, download
   9. Modal, teclado e inicialização

   Para ADICIONAR um produto novo, edite apenas catalogo.json.
   ========================================================= */

'use strict';

/* ---------- 1. Configuração e utilidades ---------- */

const CATALOGO_URL = 'catalogo.json';

/** Troque pela URL real da sua API depois do deploy no Cloudflare. */
const API_PADRAO = 'https://loja-api.marcelooliveira8052668-cyber.workers.dev';

const dinheiro = valor =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const esc = texto => String(texto).replace(/[&<>"']/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

/** Remove acentos e baixa a letra — usado na busca. */
const normalizar = texto => String(texto)
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().trim();

const el = {};
let catalogo = null;
let apiBase = API_PADRAO;
let categoriaAtiva = 'Todos';
let busca = '';
let pedidoAtual = null;   // { produto, pixId, intervalo }
let ultimoFoco = null;

/* ---------- 2. Carregamento do catálogo ---------- */

async function carregarCatalogo() {
  try {
    const resposta = await fetch(CATALOGO_URL, { cache: 'no-store' });
    if (!resposta.ok) throw new Error('HTTP ' + resposta.status);
    catalogo = await resposta.json();
    if (catalogo.config && catalogo.config.apiBase) apiBase = catalogo.config.apiBase;
    return true;
  } catch (erro) {
    console.error('Falha ao carregar o catálogo:', erro);
    return false;
  }
}

/** Lista única: produtos avulsos + produtos dentro de pacotes. */
function todosOsProdutos() {
  if (!catalogo) return [];
  const dentro = [];
  (catalogo.pacotes || []).forEach(pacote => {
    (pacote.produtos || []).forEach(id => {
      const base = (catalogo.produtos || []).find(p => p.id === id);
      if (base) dentro.push(Object.assign({}, base, { _pacote: pacote.id, _viaPacote: true }));
    });
  });
  const avulsos = (catalogo.produtos || []).filter(p => !dentro.some(d => d.id === p.id));
  return avulsos.concat(dentro);
}

function acharProduto(id) {
  return (catalogo && catalogo.produtos || []).find(p => p.id === id) || null;
}

function acharPacote(id) {
  return (catalogo && catalogo.pacotes || []).find(p => p.id === id) || null;
}

/* ---------- 3. Pacotes ---------- */

function desenharPacotes() {
  if (!catalogo || !catalogo.pacotes) return;

  el.listaPacotes.innerHTML = catalogo.pacotes.map(pacote => {
    const itens = (pacote.produtos || [])
      .map(id => acharProduto(id))
      .filter(Boolean)
      .map(p => `<li>${esc(p.nome)}</li>`)
      .join('');

    return `
      <article class="pacote">
        <span class="pacote__faixa">MELHOR PREÇO</span>
        <h3>${esc(pacote.nome)}</h3>
        <p class="pacote__desc">${esc(pacote.descricao)}</p>
        <ul class="pacote__itens">${itens}</ul>
        <div class="pacote__rodape">
          <span class="pacote__preco">${dinheiro(pacote.preco)}</span>
          ${pacote.economia ? `<span class="pacote__nota">${esc(pacote.economia)}</span>` : ''}
        </div>
        <button class="botao botao--primario botao--cheio" data-comprar-pacote="${esc(pacote.id)}">
          Comprar pacote
        </button>
      </article>`;
  }).join('');
}

/* ---------- 4. Filtros ---------- */

function desenharFiltros() {
  const categorias = ['Todos'];
  catalogo.produtos.forEach(p => {
    if (!categorias.includes(p.categoria)) categorias.push(p.categoria);
  });

  el.filtros.innerHTML = categorias.map(cat => {
    const total = cat === 'Todos'
      ? catalogo.produtos.length
      : catalogo.produtos.filter(p => p.categoria === cat).length;
    return `<button class="filtro" role="tab" aria-selected="${cat === categoriaAtiva}"
      data-filtro="${esc(cat)}">${esc(cat)} <span aria-hidden="true">· ${total}</span></button>`;
  }).join('');
}

function filtrar() {
  const alvo = normalizar(busca);
  return catalogo.produtos.filter(p => {
    const okCat = categoriaAtiva === 'Todos' || p.categoria === categoriaAtiva;
    const texto = normalizar(p.nome + ' ' + p.tagline + ' ' + p.descricao + ' ' + (p.tags || []).join(' '));
    return okCat && (!alvo || texto.indexOf(alvo) !== -1);
  });
}

/* ---------- 5. Grade de produtos ---------- */

function desenharGrade() {
  const lista = filtrar();
  el.vazio.hidden = lista.length > 0;

  el.grade.innerHTML = lista.map(p => {
    const temPromo = p.precoDepois && p.precoDepois > p.preco;
    const desconto = temPromo ? Math.round((1 - p.preco / p.precoDepois) * 100) : 0;

    return `
      <article class="card">
        <div class="card__capa">
          <img src="${esc(p.capa)}" alt="${esc(p.nome)}" loading="lazy" width="800" height="500">
          <span class="card__cat">${esc(p.categoria)}</span>
          ${temPromo ? `<span class="card__promo">-${desconto}%</span>` : ''}
        </div>

        <div class="card__corpo">
          <h3 class="card__nome">${esc(p.nome)}</h3>
          <p class="card__frase">${esc(p.tagline)}</p>

          <div class="card__tags">
            ${(p.tags || []).slice(0, 3).map(t => `<span class="tag">${esc(t)}</span>`).join('')}
          </div>

          <div class="card__rodape">
            <div class="preco">
              <span class="preco__valor">${dinheiro(p.preco)}</span>
              ${temPromo ? `<span class="preco__de">${dinheiro(p.precoDepois)}</span>` : ''}
            </div>
            <div class="card__acoes">
              <button class="botao botao--secundario botao--p" data-detalhe="${esc(p.id)}">Detalhes</button>
              <button class="botao botao--primario botao--p" data-comprar="${esc(p.id)}">Comprar</button>
            </div>
          </div>
        </div>
      </article>`;
  }).join('');
}

/* ---------- 6. Modal de detalhe ---------- */

function abrirDetalhe(id) {
  const p = acharProduto(id);
  if (!p) return;

  const temPromo = p.precoDepois && p.precoDepois > p.preco;
  const viaPacote = p._viaPacote ? acharPacote(p._pacote) : null;

  el.modalCorpo.innerHTML = `
    <img class="detalhe__capa" src="${esc(p.capa)}" alt="${esc(p.nome)}" width="800" height="450">

    <span class="detalhe__cat">${esc(p.categoria)}</span>
    <h2 class="detalhe__nome" id="modalTitulo">${esc(p.nome)}</h2>
    <p class="detalhe__frase">${esc(p.tagline)}</p>

    <p class="detalhe__texto">${esc(p.descricao)}</p>

    <div class="detalhe__secao">
      <h3>O que vem incluído</h3>
      <ul class="detalhe__lista">
        ${(p.inclui || []).map(i => `<li>${esc(i)}</li>`).join('')}
      </ul>
    </div>

    ${viaPacote ? `<p class="detalhe__nota" style="color:var(--acento);font-size:.86rem;margin-bottom:18px">
      Também incluído no pacote <strong>${esc(viaPacote.nome)}</strong> por ${dinheiro(viaPacote.preco)}.
    </p>` : ''}

    <div class="detalhe__compra">
      <div class="preco">
        <span class="preco__valor">${dinheiro(p.preco)}</span>
        ${temPromo ? `<span class="preco__de">${dinheiro(p.precoDepois)}</span>` : ''}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${p.demo ? `<a class="botao botao--secundario" href="${esc(p.demo)}" target="_blank" rel="noopener">Ver ao vivo ↗</a>` : ''}
        <button class="botao botao--primario" data-comprar="${esc(p.id)}">Comprar com Pix</button>
      </div>
    </div>`;

  abrirModal(el.modal);
}

/* ---------- 7. Checkout Pix ---------- */

async function comprar(id, tipo) {
  const item = tipo === 'pacote' ? acharPacote(id) : acharProduto(id);
  if (!item) return;

  const preco = item.preco;
  const nome = item.nome;
  const email = (el.pixEmail && el.pixEmail.value.trim()) || '';
  const nomeCli = (el.pixNome && el.pixNome.value.trim()) || '';

  if (!email || !email.includes('@')) {
    el.pixErro.textContent = 'Informe um e-mail válido para receber o download.';
    el.pixErro.hidden = false;
    return;
  }
  el.pixErro.hidden = true;

  el.pixCorpo.innerHTML = `
    <div class="pix">
      <h2 id="pixTitulo">Gerando Pix…</h2>
      <p class="pix__sub">${esc(nome)} — ${dinheiro(preco)}</p>
      <div class="pix__status" id="pixStatus">
        <span class="girando" aria-hidden="true">◌</span>
        <span>Conectando ao Mercado Pago…</span>
      </div>
    </div>`;

  abrirModal(el.modalPix);

  try {
    const resposta = await fetch(apiBase + '/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: id,
        tipo: tipo,
        nome: nome,
        preco: preco,
        email: email,
        nomeComprador: nomeCli || nome
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok || dados.erro) {
      throw new Error(dados.erro || ('HTTP ' + resposta.status));
    }

    pedidoAtual = Object.assign({}, dados, { nome: nome });
    mostrarPix(dados);
    vigiarPagamento();

  } catch (erro) {
    el.pixCorpo.innerHTML = `
      <div class="pix">
        <h2 id="pixTitulo">Não consegui gerar o Pix</h2>
        <div class="pix__status" data-ok="erro">
          <span aria-hidden="true">✕</span>
          <span>${esc(erro.message || 'Erro desconhecido.')}</span>
        </div>
        <p class="pix__sub">
          Se a API ainda não foi publicada, ajuste <code>apiBase</code> no
          <code>catalogo.json</code> ou use o link de contato do portfólio.
        </p>
        <a class="botao botao--secundario botao--cheio" href="../index.html#contato">Falar com o desenvolvedor</a>
      </div>`;
  }
}

function mostrarPix(dados) {
  const qr = dados.qrCode || (dados.qrCodeBase64 ? 'data:image/png;base64,' + dados.qrCodeBase64 : '');

  el.pixCorpo.innerHTML = `
    <div class="pix">
      <h2 id="pixTitulo">Pague no Pix</h2>
      <p class="pix__sub">${esc(dados.nome || '')} — ${dinheiro(dados.valor || 0)}</p>

      ${qr ? `<div class="pix__qr"><img src="${qr}" alt="QR Code do Pix"></div>` : ''}

      <div class="pix__copia">
        <input id="pixCopiaECola" readonly value="${esc(dados.qrCode || '')}" aria-label="Código Pix copia e cola">
        <button class="botao botao--secundario" id="pixCopiar">Copiar</button>
      </div>

      <div class="pix__status" id="pixStatus">
        <span class="girando" aria-hidden="true">◌</span>
        <span>Aguardando confirmação do pagamento…</span>
      </div>

      <p class="pix__sub" style="font-size:.82rem">
        Assim que o Pix cair, o link de download chega no e-mail
        <strong>${esc(dados.email || '')}</strong> em poucos segundos.
      </p>
    </div>`;

  const botaoCopiar = document.getElementById('pixCopiar');
  if (botaoCopiar) {
    botaoCopiar.addEventListener('click', () => {
      const campo = document.getElementById('pixCopiaECola');
      if (!campo) return;
      campo.select();
      navigator.clipboard.writeText(campo.value)
        .then(() => { botaoCopiar.textContent = 'Copiado!'; })
        .catch(() => { document.execCommand('copy'); botaoCopiar.textContent = 'Copiado!'; });
    });
  }
}

/* ---------- 8. Status do pagamento ---------- */

function statusDe(texto, estado) {
  const caixa = document.getElementById('pixStatus');
  if (!caixa) return;
  caixa.innerHTML = `<span aria-hidden="true">${estado === 'ok' ? '✓' : estado === 'erro' ? '✕' : '◌'}</span><span>${esc(texto)}</span>`;
  if (estado) caixa.dataset.ok = estado;
}

function vigiarPagamento() {
  if (pedidoAtual && pedidoAtual.intervalo) clearInterval(pedidoAtual.intervalo);

  const intervalo = setInterval(async () => {
    if (!pedidoAtual || !pedidoAtual.pixId) return;
    try {
      const resposta = await fetch(apiBase + '/api/status/' + encodeURIComponent(pedidoAtual.pixId));
      if (!resposta.ok) return;
      const dados = await resposta.json();

      if (dados.status === 'aprovado' || dados.status === 'approved') {
        clearInterval(intervalo);
        pedidoAtual.intervalo = null;
        statusDe('Pagamento aprovado! O download está no seu e-mail.', 'ok');
        setTimeout(() => {
          el.pixCorpo.innerHTML = `
            <div class="pix">
              <h2 id="pixTitulo">Pagamento aprovado 🎉</h2>
              <p class="pix__sub">
                Enviamos o link de download para <strong>${esc(dados.email || '')}</strong>.
                O link fica disponível por ${esc(String(catalogo.config.prazoDownloadDias || 7))} dias.
              </p>
              <button class="botao botao--primario botao--cheio" id="pixFechar2">Fechar</button>
            </div>`;
          const fechar = document.getElementById('pixFechar2');
          if (fechar) fechar.addEventListener('click', fecharModalPix);
        }, 900);
      } else if (dados.status === 'recusado' || dados.status === 'rejected' ||
                 dados.status === 'cancelado' || dados.status === 'cancelled') {
        clearInterval(intervalo);
        pedidoAtual.intervalo = null;
        statusDe('Pagamento não concluído. Tente novamente.', 'erro');
      }
    } catch (e) {
      /* offline momentâneo: tenta de novo no próximo ciclo */
    }
  }, 5000);

  if (pedidoAtual) pedidoAtual.intervalo = intervalo;
}

/* ---------- 9. Modais e eventos ---------- */

function abrirModal(modal) {
  ultimoFoco = document.activeElement;
  el.fundoModal.hidden = false;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function fecharModal() {
  el.modal.hidden = true;
  el.fundoModal.hidden = true;
  document.body.style.overflow = '';
  if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
}

function fecharModalPix() {
  el.modalPix.hidden = true;
  el.fundoModal.hidden = true;
  document.body.style.overflow = '';
  if (pedidoAtual && pedidoAtual.intervalo) {
    clearInterval(pedidoAtual.intervalo);
    pedidoAtual.intervalo = null;
  }
}

function iniciar() {
  el.listaPacotes = document.getElementById('listaPacotes');
  el.grade       = document.getElementById('grade');
  el.filtros     = document.getElementById('filtros');
  el.vazio       = document.getElementById('vazio');
  el.modal       = document.getElementById('modal');
  el.modalCorpo  = document.getElementById('modalCorpo');
  el.modalPix    = document.getElementById('modalPix');
  el.pixCorpo    = document.getElementById('pixCorpo');
  el.fundoModal  = document.getElementById('fundoModal');

  const ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  if (!catalogo) return;

  desenharPacotes();
  desenharFiltros();
  desenharGrade();

  /* --- cliques por delegação --- */
  document.addEventListener('click', async ev => {
    const alvo = ev.target;

    const filtro = alvo.closest('[data-filtro]');
    if (filtro) {
      categoriaAtiva = filtro.dataset.filtro;
      desenharFiltros();
      desenharGrade();
      return;
    }

    const detalhe = alvo.closest('[data-detalhe]');
    if (detalhe) { abrirDetalhe(detalhe.dataset.detalhe); return; }

    const comprarBtn = alvo.closest('[data-comprar]');
    if (comprarBtn) { prepararCheckout(comprarBtn.dataset.comprar, 'produto'); return; }

    const pacoteBtn = alvo.closest('[data-comprar-pacote]');
    if (pacoteBtn) { prepararCheckout(pacoteBtn.dataset.comprarPacote, 'pacote'); return; }

    if (alvo.id === 'modalFechar') { fecharModal(); return; }
    if (alvo.id === 'pixFechar' || alvo.id === 'pixFechar2') { fecharModalPix(); return; }
    if (alvo === el.fundoModal) { fecharModal(); fecharModalPix(); }
  });

  /* --- busca --- */
  const campoBusca = document.getElementById('busca');
  if (campoBusca) {
    campoBusca.addEventListener('input', () => {
      busca = campoBusca.value;
      desenharGrade();
    });
  }

  /* --- Esc fecha --- */
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape') {
      if (!el.modalPix.hidden) fecharModalPix();
      else if (!el.modal.hidden) fecharModal();
    }
  });
}

/** Monta o formulário de e-mail antes de chamar a API. */
function prepararCheckout(id, tipo) {
  const item = tipo === 'pacote' ? acharPacote(id) : acharProduto(id);
  if (!item) return;

  el.pixCorpo.innerHTML = `
    <div class="pix">
      <h2 id="pixTitulo">Finalizar compra</h2>
      <p class="pix__sub">${esc(item.nome)} — ${dinheiro(item.preco)}</p>

      <div class="campo-form">
        <label for="pixEmail">Seu e-mail</label>
        <input type="email" id="pixEmail" placeholder="voce@email.com" autocomplete="email" required>
        <small>É para este endereço que o link de download será enviado.</small>
      </div>

      <div class="campo-form">
        <label for="pixNome">Seu nome (opcional)</label>
        <input type="text" id="pixNome" placeholder="Como podemos te chamar?" autocomplete="name">
      </div>

      <p class="erro-form" id="pixErro" hidden></p>

      <button class="botao botao--primario botao--cheio" id="pixGerar">Gerar QR Code do Pix</button>
      <p class="pix__sub" style="font-size:.8rem;margin-top:14px;text-align:center">
        Pagamento único · sem mensalidade · 7 dias para baixar
      </p>
    </div>`;

  abrirModal(el.modalPix);

  const erro = document.getElementById('pixErro');
  const botao = document.getElementById('pixGerar');

  botao.addEventListener('click', () => {
    const email = document.getElementById('pixEmail').value.trim();
    if (!email || !email.includes('@')) {
      erro.textContent = 'Informe um e-mail válido para receber o download.';
      erro.hidden = false;
      document.getElementById('pixEmail').focus();
      return;
    }
    erro.hidden = true;
    botao.disabled = true;
    comprar(id, tipo);
  });

  document.getElementById('pixEmail').focus();
}

/* ---------- 10. Início ---------- */

(async function comecar() {
  el.fundoModal = document.getElementById('fundoModal');
  const ok = await carregarCatalogo();
  if (!ok) {
    el.grade = document.getElementById('grade');
    el.grade.innerHTML =
      '<p class="vazio">Não consegui carregar o catálogo. Verifique se o arquivo <code>catalogo.json</code> está no servidor.</p>';
    return;
  }
  iniciar();
})();