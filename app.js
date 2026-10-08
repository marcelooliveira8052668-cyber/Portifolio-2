/* =========================================================
   Portfólio profissional · Marcelo Oliveira
   Lista de projetos, filtros, menu e animações de entrada
   ========================================================= */

'use strict';

/* ---------------------------------------------------------
   Base de projetos (links reais apontando para o GitHub)
   --------------------------------------------------------- */
const GITHUB = 'https://github.com/marcelooliveira8052668-cyber';
const PAGES  = 'https://marcelooliveira8052668-cyber.github.io';

const projetos = [
  {
    nome: 'Minha Loja Online',
    cat: 'E-commerce',
    desc: 'E-commerce com 50 produtos, carrinho, cupons, formas de pagamento, entrega por Shopee/Mercado Livre e avaliações de clientes.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    img: 'screenshots/Codigo-Loja-Online.jpg',
    demo: PAGES + '/codigo-loja-online/',
    repo: GITHUB + '/codigo-loja-online'
  },
  {
    nome: 'Checkout Cyber Metal',
    cat: 'E-commerce',
    desc: 'Checkout completo em React + Vite, com carrinho, validação de pagamento e fluxo de finalização de pedido.',
    tags: ['React', 'Vite', 'JavaScript'],
    img: 'screenshots/checkout-cyber-metal.jpg',
    demo: PAGES + '/checkout-cyber-metal/',
    repo: GITHUB + '/checkout-cyber-metal'
  },
  {
    nome: 'Brasa Burger',
    cat: 'E-commerce',
    desc: 'Cardápio digital da hamburgueria Brasa Burger, com catálogo de lanches e bebidas, filtros e botão para montar o pedido no carrinho.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    img: 'screenshots/hamburgueria.jpg',
    demo: PAGES + '/hamburgueria/',
    repo: GITHUB + '/hamburgueria'
  },
  {
    nome: 'Trilha Corporativa',
    cat: 'SENAI',
    desc: 'Plataforma de capacitação corporativa do SENAI — "capacitação em um só lugar", com trilhas, painel do aluno e acompanhamento.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    img: 'screenshots/Plataforma_Corporativa_SENAI.jpg',
    demo: 'trilha-corporativa/',
    repo: null,
    local: true
  },
  {
    nome: 'Comanda Fácil',
    cat: 'Sistemas',
    desc: 'Sistema de comandas para bares e restaurantes: mesas, itens, cálculo automático e fechamento da conta.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    img: 'screenshots/comandas.jpg',
    demo: PAGES + '/comandas/',
    repo: GITHUB + '/comandas'
  },
  {
    nome: 'NF Control',
    cat: 'Sistemas',
    desc: 'Controle de notas fiscais com lançamentos, filtros, resumo mensal e exportação dos dados.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    img: 'screenshots/NF-Control.jpg',
    demo: PAGES + '/NF-Control/',
    repo: GITHUB + '/NF-Control'
  },
  {
    nome: 'SkillMatch',
    cat: 'Sistemas',
    desc: 'Plataforma que conecta vagas e candidatos por compatibilidade de habilidades, com análise em tempo real.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    img: 'screenshots/SkillMatch-web.jpg',
    demo: PAGES + '/SkillMatch-web/',
    repo: GITHUB + '/SkillMatch-web'
  },
  {
    nome: 'DevBook',
    cat: 'Sistemas',
    desc: 'Livro didático digital de programação com revisão espaçada — curso de Full Stack do zero ao deploy, em formato de livro.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    img: 'screenshots/devbook.jpg',
    demo: PAGES + '/devbook/',
    repo: GITHUB + '/devbook'
  },
  {
    nome: 'História em Foco',
    cat: 'Educação',
    desc: 'Livro digital interativo de história com capítulos, imagens e navegação paginada no navegador.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    img: 'screenshots/livro-digital-historia.jpg',
    demo: PAGES + '/livro-digital-historia/',
    repo: GITHUB + '/livro-digital-historia'
  },
  {
    nome: 'GlobalTalk Lab',
    cat: 'Educação',
    desc: 'Plataforma de inglês com lições, exercícios práticos e acompanhamento do progresso do aluno.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    img: 'screenshots/english-platform.jpg',
    demo: PAGES + '/english-platform/',
    repo: GITHUB + '/english-platform'
  },
  {
    nome: 'Lina — Tutor de Inglês',
    cat: 'Educação',
    desc: 'Lina, tutora virtual de inglês com inteligência artificial: explica conteúdo, corrige erros e monta exercícios personalizados.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    img: 'screenshots/tutor-IA.jpg',
    demo: PAGES + '/tutor-IA/',
    repo: GITHUB + '/tutor-IA'
  },
  {
    nome: 'Aurora Imóveis',
    cat: 'Sites',
    desc: 'Site imobiliário com vitrine de imóveis, filtros por tipo e valor, e contato direto pelo WhatsApp.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    img: 'screenshots/imobiliaria.jpg',
    demo: PAGES + '/imobiliaria/',
    repo: GITHUB + '/imobiliaria'
  },
  {
    nome: 'Marcelo Photography',
    cat: 'Sites',
    desc: 'Portfólio de fotografia de casamentos com galeria de trabalhos e formulário de orçamento.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    img: 'screenshots/casamentos.jpg',
    demo: PAGES + '/casamentos/',
    repo: GITHUB + '/casamentos'
  },
  {
    nome: 'Sylvia Studio de Beleza',
    cat: 'Sites',
    desc: 'Site do salão de beleza Sylvia Studio, com serviços, preços, galeria e agendamento de horários.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    img: 'screenshots/Salao-de-beleza.jpg',
    demo: PAGES + '/Salao-de-beleza/',
    repo: GITHUB + '/Salao-de-beleza'
  },
  {
    nome: 'Dr. João Silva · Advocacia',
    cat: 'Sites',
    desc: 'Landing page profissional para o escritório do Dr. João Silva, com áreas de atuação e atendimento.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    img: 'screenshots/Site-para-Advogado.jpg',
    demo: PAGES + '/Site-para-Advogado/',
    repo: GITHUB + '/Site-para-Advogado'
  },
  {
    nome: 'Travel Planner Pro',
    cat: 'Sites',
    desc: 'Planejador de viagens com roteiros, custos, checklist e organização do trajeto em um só painel.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    img: 'screenshots/viagem-pro.jpg',
    demo: PAGES + '/viagem-pro/',
    repo: GITHUB + '/viagem-pro'
  },
  {
    nome: 'Gerador de Sites Dola PRO',
    cat: 'Ferramentas',
    desc: 'Ferramenta que monta um site a partir das informações do usuário e devolve o código pronto para publicar.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    img: 'screenshots/gerador-de-sites.jpg',
    demo: PAGES + '/gerador-de-sites/',
    repo: GITHUB + '/gerador-de-sites'
  },
  {
    nome: 'Calculadora iPhone',
    cat: 'Ferramentas',
    desc: 'Réplica da calculadora do iPhone com visual fiel, teclado físico e histórico de operações.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    img: 'screenshots/Calculadora-iphone.jpg',
    demo: PAGES + '/Calculadora-iphone/',
    repo: GITHUB + '/Calculadora-iphone'
  },
  {
    nome: 'Currículo Futurista',
    cat: 'Ferramentas',
    desc: 'Currículo interativo com visual futurista, seções animadas e versão imprimível.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    img: 'screenshots/Curr-culo-futurista-.jpg',
    demo: PAGES + '/Curr-culo-futurista-/',
    repo: GITHUB + '/Curr-culo-futurista-'
  },
  {
    nome: 'Pac-Man',
    cat: 'Jogos',
    desc: 'Clone do Pac-Man em canvas, com labirinto, fantasmas, placar e controles pelo teclado e toque.',
    tags: ['JavaScript', 'Canvas'],
    img: 'screenshots/pacman.jpg',
    demo: PAGES + '/pacman/',
    repo: GITHUB + '/pacman'
  },
  {
    nome: 'Jogo da Velha',
    cat: 'Jogos',
    desc: 'Jogo da velha em duas modos (duo e vs. computador) com detecção automática de vencedor.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    img: 'screenshots/jogo-velha.jpg',
    demo: PAGES + '/jogo-velha/',
    repo: GITHUB + '/jogo-velha'
  }
];

/* ---------------------------------------------------------
   Renderização da grade + filtros
   --------------------------------------------------------- */
const grade      = document.getElementById('grade-projetos');
const caixaVazia = document.getElementById('grade-vazio');
const barraFiltros = document.getElementById('filtros');
let categoriaAtiva = 'Todos';

function montarCard(p) {
  const artigo = document.createElement('article');
  artigo.className = 'projeto revelar';
  artigo.dataset.cat = p.cat;

  const links = [];
  if (p.demo) {
    links.push(
      `<a class="projeto__link" href="${p.demo}" target="_blank" rel="noopener">` +
      `${p.local ? 'Abrir projeto' : 'Ver ao vivo'} ↗</a>`
    );
  }
  if (p.repo) {
    links.push(`<a class="projeto__link projeto__link--codigo" href="${p.repo}" target="_blank" rel="noopener">Código</a>`);
  }

  artigo.innerHTML = `
    <div class="projeto__capa">
      <img src="${p.img}" alt="Captura de tela do projeto ${p.nome}" loading="lazy" decoding="async" width="480" height="300">
      <span class="projeto__categoria">${p.cat}</span>
    </div>
    <div class="projeto__corpo">
      <h3 class="projeto__titulo">${p.nome}</h3>
      <p class="projeto__descricao">${p.desc}</p>
      <div class="etiquetas">${p.tags.map(t => `<span>${t}</span>`).join('')}</div>
      <div class="projeto__rodape">${links.join('')}</div>
    </div>`;

  return artigo;
}

function pintarGrade() {
  const lista = categoriaAtiva === 'Todos'
    ? projetos
    : projetos.filter(p => p.cat === categoriaAtiva);

  grade.innerHTML = '';
  const fragmento = document.createDocumentFragment();
  lista.forEach(p => fragmento.appendChild(montarCard(p)));
  grade.appendChild(fragmento);

  caixaVazia.hidden = lista.length > 0;
  observarReveal();
}

function montarFiltros() {
  const categorias = ['Todos', ...new Set(projetos.map(p => p.cat))];

  barraFiltros.innerHTML = categorias
    .map(c => `<button class="filtro${c === 'Todos' ? ' ativo' : ''}" data-cat="${c}" role="tab" aria-selected="${c === 'Todos'}">${c}</button>`)
    .join('');

  barraFiltros.addEventListener('click', e => {
    const botao = e.target.closest('.filtro');
    if (!botao) return;

    categoriaAtiva = botao.dataset.cat;
    barraFiltros.querySelectorAll('.filtro').forEach(b => {
      const ativo = b === botao;
      b.classList.toggle('ativo', ativo);
      b.setAttribute('aria-selected', ativo);
    });
    pintarGrade();
  });
}

/* ---------------------------------------------------------
   Menu mobile
   --------------------------------------------------------- */
function configurarMenu() {
  const botao = document.getElementById('botao-menu');
  const nav   = document.getElementById('nav');

  botao.addEventListener('click', () => {
    const aberto = nav.classList.toggle('aberta');
    botao.setAttribute('aria-expanded', aberto);
    botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  });

  nav.addEventListener('click', e => {
    if (e.target.matches('a')) {
      nav.classList.remove('aberta');
      botao.setAttribute('aria-expanded', 'false');
      botao.setAttribute('aria-label', 'Abrir menu');
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('aberta')) {
      nav.classList.remove('aberta');
      botao.setAttribute('aria-expanded', 'false');
      botao.focus();
    }
  });
}

/* ---------------------------------------------------------
   Revelar seções ao rolar + link ativo no menu
   --------------------------------------------------------- */
let observador = null;

function observarReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.revelar').forEach(el => el.classList.add('visivel'));
    return;
  }
  if (!observador) {
    observador = new IntersectionObserver((entradas, obs) => {
      entradas.forEach(ent => {
        if (ent.isIntersecting) {
          ent.target.classList.add('visivel');
          obs.unobserve(ent.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  }
  document.querySelectorAll('.revelar:not(.visivel)').forEach(el => observador.observe(el));
}

function configurarNavAtiva() {
  const secoes = ['projetos', 'sobre', 'contato']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if (!('IntersectionObserver' in window)) return;

  const obs = new IntersectionObserver(entradas => {
    entradas.forEach(ent => {
      if (!ent.isIntersecting) return;
      document.querySelectorAll('.nav__link').forEach(l => {
        l.classList.toggle('ativo', l.getAttribute('href') === '#' + ent.target.id);
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  secoes.forEach(s => obs.observe(s));
}

/* ---------------------------------------------------------
   Contadores do hero
   --------------------------------------------------------- */
function animarContadores() {
  const alvos = document.querySelectorAll('[data-contador]');
  if (!alvos.length) return;

  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  alvos.forEach(el => {
    const fim = parseInt(el.dataset.contador, 10) || 0;
    if (reduzir) { el.textContent = fim; return; }

    const duracao = 1100;
    const inicio = performance.now();

    function passo(agora) {
      const t = Math.min((agora - inicio) / duracao, 1);
      const suave = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(fim * suave);
      if (t < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  });
}

/* ---------------------------------------------------------
   Inicialização
   --------------------------------------------------------- */
function iniciar() {
  document.getElementById('ano-atual').textContent = new Date().getFullYear();

  montarFiltros();
  pintarGrade();
  configurarMenu();
  configurarNavAtiva();
  observarReveal();
  animarContadores();

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', ev => {
      const alvo = document.querySelector(a.getAttribute('href'));
      if (!alvo) return;
      ev.preventDefault();
      alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', a.getAttribute('href'));
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciar);
} else {
  iniciar();
}
