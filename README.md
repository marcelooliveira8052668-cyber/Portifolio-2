# Portfólio Profissional — Marcelo Oliveira

Portfólio web em HTML, CSS e JavaScript puro (sem frameworks), com tema escuro moderno,
totalmente responsivo e com foco em acessibilidade e performance.

## 📂 Estrutura

```
Portifolio-2/
├── index.html            ← página principal do portfólio
├── style.css             ← tema escuro, layout responsivo
├── app.js                ← projetos, filtros, menu e animações
├── assets/
│   └── favicon.svg
├── screenshots/          ← capas dos projetos
├── scanner-pdf-iphone/   ← site do Scanner de Documentos (PWA)
└── trilha-corporativa/   ← projeto acadêmico SENAI (Trilha Corporativa)
```

## ▶️ Como abrir

Basta abrir o `index.html` no navegador. Para servir em rede local (recomendado, para
testar no celular):

```bash
npx serve .
# ou
python -m http.server 8080
```

## ✨ Funcionalidades

- Tema escuro moderno com gradientes e cartão de código no hero
- 22 projetos selecionados com filtros por categoria
- Menu mobile com botão hambúrguer
- Animações de entrada ao rolar (IntersectionObserver)
- Contadores animados, link ativo no menu e navegação suave
- Acessibilidade: navegação por teclado, `prefers-reduced-motion`, foco visível,
  textos alternativos nas imagens e `lang="pt-BR"`
- Layout responsivo (desktop, tablet e celular)

## 🔗 Projetos incluídos

| Projeto | Categoria |
|---|---|
| Scanner de Documentos *(destaque)* | PWA |
| Loja Online Completa · Checkout Cyber Metal · Hamburgueria | E-commerce |
| Comanda Fácil · NF Control · SkillMatch Web · DevBook | Sistemas |
| História em Foco · GlobalTalk Lab · Tutor IA | Educação |
| Aurora Imóveis · Marcelo Photography · Salão de Beleza · Site para Advogado · Viagem Pro | Sites |
| Gerador de Sites · Calculadora iPhone · Currículo Futurista | Ferramentas |
| Pac-Man · Jogo da Velha | Jogos |
| Trilha Corporativa | SENAI |

Todos os links "Ver ao vivo" apontam para os GitHub Pages dos repositórios e
"Código" apontam para o repositório no GitHub.

## 🛠 Tecnologias

- HTML5 semântico
- CSS3 (variáveis, Grid, Flexbox, `clamp()`, backdrop-filter)
- JavaScript ES6+ (módulos via IIFE, IntersectionObserver, rAF)
- Google Fonts (Inter + JetBrains Mono)
