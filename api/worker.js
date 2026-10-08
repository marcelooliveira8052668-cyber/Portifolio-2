/* =========================================================
   API DA LOJA — Cloudflare Worker
   Marcelo Oliveira

   Recebe o pedido -> cria o Pix no Mercado Pago -> aguarda o
   webhook -> gera um link assinado -> envia o e-mail -> serve o .zip

   ROTAS
   POST /api/checkout      cria o pagamento Pix
   GET  /api/status/:id     consulta o status de um Pix
   POST /api/webhook       notificação do Mercado Pago
   GET  /api/download/:token  entrega o .zip (link protegido)
   GET  /api/saude         teste de configuração

   CONFIGURAÇÃO (ver README.md na mesma pasta)
   ========================================================= */

// ---------- Configuração ----------
const CFG = {
  MP_TOKEN:      '',   // Access Token de produção do Mercado Pago
  MP_WEBHOOK_SECRET: '', // assinatura secreta do webhook
  EMAIL_FROM:    'Loja <loja@seudominio.com.br>',
  EMAIL_API_KEY: '',   // chave da Resend
  LINK_SECRET:   '',   // texto longo e aleatório (ex.:openssl rand -hex 32)
  PRAZO_DIAS:    7,    // validade do link de download
  BASE_URL:      '',   // URL pública deste Worker
  R2_BUCKET:     'PRODUTOS' // nome do bucket R2 com os .zip
};

// ---------- Utilidades ----------
const json = (dados, status = 200) =>
  new Response(JSON.stringify(dados), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' }
  });

const erro = (mensagem, status = 400) => json({ erro: mensagem }, status);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const paraBase64Url = buffer =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const deBase64Url = texto =>
  Uint8Array.from(atob(texto.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

/** SHA-256 via Web Crypto (disponível nativamente nos Workers). */
async function sha256(texto) {
  const dados = new TextEncoder().encode(texto);
  const digest = await crypto.subtle.digest('SHA-256', dados);
  return paraBase64Url(digest);
}

/** HMAC-SHA-256 usando a chave secreta. */
async function assinar(conteudo) {
  const chave = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(CFG.LINK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const签 = await crypto.subtle.sign('HMAC', chave, new TextEncoder().encode(conteudo));
  return paraBase64Url(签);
}

/**
 * Gera um link protegido.
 * O token carrega os dados + assinatura, então não precisa de banco.
 */
async function gerarToken(itemId, email, pixId) {
  const payload = {
    i: itemId,                       // item comprado
    e: await sha256(email.toLowerCase()),  // e-mail com hash (privacidade)
    p: pixId,
    x: Date.now() + CFG.PRAZO_DIAS * 86400000  // expira em X dias
  };
  const corpo = paraBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const assinatura = await assinar(corpo);
  return corpo + '.' + assinatura;
}

/** Valida o token e devolve o payload, ou null se estiver inválido/vencido. */
async function lerToken(token) {
  if (!token || token.indexOf('.') === -1) return null;
  const [corpo, assinatura] = token.split('.');

  const esperada = await assinar(corpo);
  if (esperada !== assinatura) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(deBase64Url(corpo)));
    if (payload.x < Date.now()) return null;   // vencido
    return payload;
  } catch (e) {
    return null;
  }
}

/** Preço único de lançamento. Troque aqui se mudar no catalogo.json. */
const PRECO_UNITARIO = 199.99;

const PRECOS = {
  'scanner-de-documentos': { preco: PRECO_UNITARIO, nome: 'Scanner de Documentos' },
  'calculadora-cientifica': { preco: PRECO_UNITARIO, nome: 'Calculadora Científica iPhone' },
  'gerador-de-sites-dola': { preco: PRECO_UNITARIO, nome: 'Gerador de Sites Dola PRO' },
  'minha-loja-online': { preco: PRECO_UNITARIO, nome: 'Loja Online Completa' },
  'checkout-cyber-metal': { preco: PRECO_UNITARIO, nome: 'Checkout Cyber Metal' },
  'comanda-facil': { preco: PRECO_UNITARIO, nome: 'Comanda Fácil' },
  'nf-control': { preco: PRECO_UNITARIO, nome: 'NF Control' },
  'devbook': { preco: PRECO_UNITARIO, nome: 'DevBook' },
  'trilha-corporativa': { preco: PRECO_UNITARIO, nome: 'Trilha Corporativa SENAI' },
  'globaltalk-lab': { preco: PRECO_UNITARIO, nome: 'GlobalTalk Lab' },
  'lina-tutor-ia': { preco: PRECO_UNITARIO, nome: 'Lina — Tutor de Inglês com IA' },
  'skillmatch': { preco: PRECO_UNITARIO, nome: 'SkillMatch' },

  'pack-comercio': { preco: 599.99, nome: 'Pacote Comércio & Vendas' },
  'pack-educacao': { preco: 599.99, nome: 'Pacote Educação & Livros' },
  'pack-apps': { preco: 449.99, nome: 'Pacote Apps & Ferramentas' },
  'pack-tudo': { preco: 1499.99, nome: 'Pacote Completo (12 códigos)' }
};

/** Quais .zip vão junto em cada item (pacotes trazem vários). */
const CONTEUDO = {
  'pack-comercio': ['minha-loja-online', 'checkout-cyber-metal', 'comanda-facil', 'nf-control'],
  'pack-educacao': ['devbook', 'globaltalk-lab', 'lina-tutor-ia', 'trilha-corporativa'],
  'pack-apps': ['scanner-de-documentos', 'calculadora-cientifica', 'gerador-de-sites-dola'],
  'pack-tudo': [
    'scanner-de-documentos', 'calculadora-cientifica', 'gerador-de-sites-dola',
    'minha-loja-online', 'checkout-cyber-metal', 'comanda-facil', 'nf-control',
    'devbook', 'trilha-corporativa', 'globaltalk-lab', 'lina-tutor-ia', 'skillmatch'
  ]
};

const NOME_ARQUIVO = id => (id + '.zip');

// =========================================================
// ROTA 1 — criar o pagamento Pix
// =========================================================
async function criarCheckout(request, env) {
  let corpo;
  try {
    corpo = await request.json();
  } catch (e) {
    return erro('Corpo da requisição inválido.');
  }

  const itemId = String(corpo.itemId || '');
  const item = PRECOS[itemId];

  if (!item) return erro('Produto não encontrado: ' + itemId);

  const email = String(corpo.email || '').trim();
  if (!email.includes('@')) return erro('E-mail inválido.');

  if (!env.MP_TOKEN) return erro('API não configurada: falta MP_TOKEN.', 503);

  // Pagamento no Mercado Pago
  const pagamento = {
    transaction_amount: item.preco,
    description: item.nome,
    payment_method_id: 'pix',
    payer: {
      email: email,
      name: String(corpo.nomeComprador || 'Cliente').slice(0, 60)
    },
    external_reference: itemId,
    notification_url: (env.BASE_URL || 'https://SEU-WORKER') + '/api/webhook'
  };

  const resposta = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + env.MP_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(pagamento)
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    console.error('Mercado Pago recusou:', dados);
    return erro('O Mercado Pago recusou o pagamento: ' +
      (dados.message || 'erro desconhecido'), 502);
  }

  const pd = dados.point_of_interaction && dados.point_of_interaction.transaction_data;

  return json({
    pixId: dados.id,
    qrCode: pd ? pd.qr_code : '',
    qrCodeBase64: pd ? pd.qr_code_base64 : '',
    valor: item.preco,
    nome: item.nome,
    email: email,
    expira: dados.date_of_expiration
  });
}

// =========================================================
// ROTA 2 — consultar o status do Pix
// =========================================================
async function consultarStatus(id, env) {
  if (!env.MP_TOKEN) return erro('API não configurada.', 503);

  const resposta = await fetch(
    'https://api.mercadopago.com/v1/payments/' + encodeURIComponent(id),
    { headers: { 'Authorization': 'Bearer ' + env.MP_TOKEN } }
  );

  const dados = await resposta.json();
  if (!resposta.ok) return erro('Não consegui consultar o Pix.', 502);

  const statusBr = {
    approved: 'aprovado', rejected: 'recusado',
    cancelled: 'cancelado', pending: 'pendente', in_process: 'pendente'
  };

  return json({
    status: statusBr[dados.status] || dados.status,
    email: dados.payer && dados.payer.email,
    item: dados.external_reference
  });
}

// =========================================================
// ROTA 3 — webhook do Mercado Pago (dispara o e-mail)
// =========================================================
async function receberWebhook(request, env) {
  // O Mercado Pago envia este cabeçalho quando a assinatura é válida
  const assinatura = request.headers.get('x-signature') || '';
  const ts = request.headers.get('x-request-id') || '';

  if (env.MP_WEBHOOK_SECRET) {
    const esperada = await assinar(ts);
    if (assinatura !== esperada) {
      console.warn('Webhook com assinatura inválida.');
      return json({ ok: false }, 401);
    }
  }

  let corpo = {};
  try { corpo = await request.json(); } catch (e) { /* segue mesmo assim */ }

  // Notificações de pagamento trazem data.id; as de teste não
  const pagamentoId = corpo.data && corpo.data.id;
  const acao = corpo.action || '';

  console.log('Webhook recebido:', acao, pagamentoId || '(sem id)');

  if (!pagamentoId) {
    return json({ ok: true, mensagem: 'Webhook de teste recebido.' });
  }

  // Busca os detalhes para confirmar que foi realmente pago
  let pagamento;
  try {
    const resposta = await fetch(
      'https://api.mercadopago.com/v1/payments/' + encodeURIComponent(pagamentoId),
      { headers: { 'Authorization': 'Bearer ' + env.MP_TOKEN } }
    );
    pagamento = await resposta.json();
  } catch (e) {
    return json({ ok: false, erro: 'Falha ao buscar o pagamento.' }, 500);
  }

  if (pagamento.status !== 'approved') {
    console.log('Pagamento ainda não aprovado:', pagamento.status);
    return json({ ok: true, status: pagamento.status });
  }

  const email = pagamento.payer && pagamento.payer.email;
  const itemId = pagamento.external_reference;
  const item = PRECOS[itemId];

  if (!email || !item) return json({ ok: false }, 400);

  const token = await gerarToken(itemId, email, String(pagamentoId));
  const link = (env.BASE_URL || '') + '/api/download/' + token;

  await enviarEmail(env, {
    para: email,
    item: item,
    link: link,
    dias: env.PRAZO_DIAS || 7
  });

  console.log('E-mail enviado para', email, '-', item.nome);
  return json({ ok: true, status: 'aprovado', enviado: true });
}

// =========================================================
// ROTA 4 — entregar o .zip (link protegido)
// =========================================================
async function entregarZip(token, request, env) {
  const payload = await lerToken(token);

  if (!payload) {
    return new Response(
      'Link inválido ou expirado. Solicite um novo e-mail de acesso.',
      { status: 403, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  const ids = CONTEUDO[payload.i] || [payload.i];

  // Cliente aceita .zip único (produto) ou vários (pacote)
  let corpo = null;
  let nome = '';
  let tipo = 'application/zip';

  if (ids.length === 1) {
    const chave = NOME_ARQUIVO(ids[0]);
    const objeto = await env.PRODUTOS.get(chave);
    if (!objeto) return arquivoNaoEncontrado(ids[0]);
    corpo = await objeto.arrayBuffer();
    nome = chave;
  } else {
    // Pacote: monta um .zip na hora com todos os arquivos
    const partes = [];
    const central = [];
    let offset = 0;

    for (const id of ids) {
      const chave = NOME_ARQUIVO(id);
      const objeto = await env.PRODUTOS.get(chave);
      if (!objeto) continue;

      const bytes = new Uint8Array(await objeto.arrayBuffer());
      const nomeBytes = new TextEncoder().encode(chave);
      const crc = await crc32(bytes);

      const cabecalho = new Uint8Array(30 + nomeBytes.length);
      const dv = new DataView(cabecalho.buffer);
      dv.setUint32(0, 0x04034b50, true);
      dv.setUint16(4, 20, true);
      dv.setUint16(6, 0, true);
      dv.setUint16(8, 0, true);   // sem compressão (arquivos já são .zip)
      dv.setUint16(10, 0, true);
      dv.setUint16(12, 0, true);
      dv.setUint32(14, crc, true);
      dv.setUint32(18, bytes.length, true);
      dv.setUint32(22, bytes.length, true);
      dv.setUint16(26, nomeBytes.length, true);
      cabecalho.set(nomeBytes, 30);

      central.push({ cabecalho, bytes, nomeBytes, crc, tamanho: bytes.length, offset });

      partes.push(cabecalho, bytes);
      offset += cabecalho.length + bytes.length;
    }

    if (!partes.length) return arquivoNaoEncontrado(payload.i);

    // Diretório central
    let tamCentral = 0;
    central.forEach(c => { tamCentral += 46 + c.nomeBytes.length; });

    const centralBuf = new Uint8Array(tamCentral);
    const dvC = new DataView(centralBuf.buffer);
    let pos = 0;

    central.forEach(c => {
      dvC.setUint32(pos, 0x02014b50, true);
      dvC.setUint16(pos + 4, 20, true);
      dvC.setUint16(pos + 6, 20, true);
      dvC.setUint16(pos + 8, 0, true);
      dvC.setUint16(pos + 10, 0, true);
      dvC.setUint16(pos + 12, 0, true);
      dvC.setUint16(pos + 14, 0, true);
      dvC.setUint32(pos + 16, c.crc, true);
      dvC.setUint32(pos + 20, c.tamanho, true);
      dvC.setUint32(pos + 24, c.tamanho, true);
      dvC.setUint16(pos + 28, c.nomeBytes.length, true);
      dvC.setUint16(pos + 30, 0, true);
      dvC.setUint16(pos + 32, 0, true);
      dvC.setUint16(pos + 34, 0, true);
      dvC.setUint16(pos + 36, 0, true);
      dvC.setUint32(pos + 38, 0, true);
      dvC.setUint32(pos + 42, c.offset, true);
      centralBuf.set(c.nomeBytes, pos + 46);
      pos += 46 + c.nomeBytes.length;
    });

    // Fim do diretório central
    const fim = new Uint8Array(22);
    const dvF = new DataView(fim.buffer);
    dvF.setUint32(0, 0x06054b50, true);
    dvF.setUint16(8, central.length, true);
    dvF.setUint16(10, central.length, true);
    dvF.setUint32(12, tamCentral, true);
    dvF.setUint32(16, offset, true);

    nome = payload.i + '-pacote.zip';
    corpo = concat([...partes, centralBuf, fim]);
  }

  return new Response(corpo, {
    status: 200,
    headers: {
      'Content-Type': tipo,
      'Content-Disposition': 'attachment; filename="' + nome + '"',
      'Content-Length': String(corpo.byteLength || corpo.length),
      'Cache-Control': 'no-store'
    }
  });
}

function arquivoNaoEncontrado(id) {
  return new Response(
    'O arquivo "' + id + '.zip" ainda não foi enviado para o servidor.\n' +
    'Envie o .zip para o bucket R2 (veja o README).',
    { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
}

/** CRC-32 (necessário para montar o .zip dos pacotes). */
let tabelaCrc = null;
async function crc32(bytes) {
  if (!tabelaCrc) {
    tabelaCrc = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      tabelaCrc[i] = c >>> 0;
    }
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) {
    crc = tabelaCrc[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function concat(listas) {
  const total = listas.reduce((s, a) => s + a.length, 0);
  const saida = new Uint8Array(total);
  let pos = 0;
  listas.forEach(a => { saida.set(a, pos); pos += a.length; });
  return saida;
}

// =========================================================
// Envio do e-mail (Resend)
// =========================================================
async function enviarEmail(env, { para, item, link, dias }) {
  if (!env.EMAIL_API_KEY) {
    console.warn('EMAIL_API_KEY não configurado. Link para enviar:', link);
    return { ok: false, motivo: 'sem chave de e-mail' };
  }

  const corpo = `
    <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;color:#111">
      <h2 style="color:#0a84ff;margin-bottom:4px">Pagamento confirmado 🎉</h2>
      <p style="color:#555">Seu pedido foi recebido. Segue o link para baixar:</p>

      <div style="background:#f4f6fa;border-radius:12px;padding:18px;margin:22px 0">
        <p style="margin:0 0 6px;font-weight:700;font-size:17px">${item.nome}</p>
        <p style="margin:0;color:#666">Download válido por ${dias} dias.</p>
      </div>

      <p style="text-align:center;margin:26px 0">
        <a href="${link}"
           style="background:#0a84ff;color:#fff;text-decoration:none;font-weight:700;
                  padding:14px 32px;border-radius:999px;display:inline-block">
           Baixar código-fonte
        </a>
      </p>

      <p style="color:#888;font-size:13px">
        Se o botão não funcionar, copie este endereço no navegador:<br>
        <span style="word-break:break-all">${link}</span>
      </p>

      <hr style="border:none;border-top:1px solid #e3e6ec;margin:26px 0">
      <p style="color:#888;font-size:13px">
        Marcelo Oliveira · Desenvolvedor Front-End<br>
        Código pronto em HTML, CSS e JavaScript. Uso comercial liberado.
      </p>
    </div>`;

  const resposta = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + env.EMAIL_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM || 'Loja <loja@exemplo.com>',
      to: [para],
      subject: 'Pagamento confirmado — ' + item.nome + ' (download liberado)',
      html: corpo
    })
  });

  const dados = await resposta.json();
  if (!resposta.ok) console.error('Resend recusou:', dados);

  return { ok: resposta.ok, dados: dados };
}

// =========================================================
// Roteador principal
// =========================================================
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const caminho = url.pathname;

    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      // Teste de configuração
      if (caminho === '/api/saude') {
        return json({
          ok: true,
          configurado: {
            mercadoPago: !!env.MP_TOKEN,
            email: !!env.EMAIL_API_KEY,
            segredoLink: !!env.LINK_SECRET,
            baseUrl: env.BASE_URL || '(não configurada)'
          }
        });
      }

      // Criar Pix
      if (caminho === '/api/checkout' && request.method === 'POST') {
        return await criarCheckout(request, env);
      }

      // Consultar status
      if (caminho.startsWith('/api/status/')) {
        return await consultarStatus(caminho.replace('/api/status/', ''), env);
      }

      // Webhook do Mercado Pago
      if (caminho === '/api/webhook' && request.method === 'POST') {
        return await receberWebhook(request, env);
      }

      // Download protegido
      if (caminho.startsWith('/api/download/')) {
        const token = decodeURIComponent(caminho.replace('/api/download/', ''));
        return await entregarZip(token, request, env);
      }

      return erro('Rota não encontrada: ' + caminho, 404);

    } catch (e) {
      console.error('Erro na API:', e);
      return erro('Erro interno: ' + e.message, 500);
    }
  }
};