# Trilha Corporativa — Plataforma de Capacitação

Projeto desenvolvido para apresentação de exercício do SENAI.

## 1. Objetivo

Criar uma plataforma corporativa de cursos para colaboradores, com acompanhamento de progresso, controle de cursos obrigatórios, presença em aulas presenciais e emissão de certificado.

Este projeto é um **protótipo front-end acadêmico**. Ele foi feito com HTML, CSS e JavaScript puro para facilitar a apresentação e a explicação do código em aula.

---

## 2. Requisitos atendidos

- [x] Tela de login
- [x] Cadastro de colaboradores
- [x] Cadastro somente com e-mail da empresa
- [x] Concordância com termos e condições / LGPD no cadastro
- [x] Catálogo com 2 cursos
- [x] Descrição dos cursos
- [x] Carga horária
- [x] Cursos com apenas 1 módulo
- [x] Curso presencial
- [x] Curso com aulas gravadas
- [x] Painel do colaborador
- [x] Progresso em porcentagem
- [x] Progresso dos vídeos gravados
- [x] Colaborador escolhe somente 1 curso até finalizar
- [x] Painel do gestor de RH
- [x] Lista de colaboradores
- [x] Acompanhamento de cumprimento dos cursos obrigatórios
- [x] Registro de presença da aula presencial pelo RH
- [x] Certificado liberado ao atingir 100%
- [x] Gestor de RH fixo para demonstração
- [x] Data e endereço no curso presencial
- [x] Sem material complementar
- [x] Logo do patrocinador em todas as páginas
- [x] Excalidraw incluído
- [x] README incluído
- [x] Código comentado

---

## 3. Estrutura da pasta

```text
Plataforma_Corporativa_SENAI/
│
├── index.html
├── style.css
├── app.js
├── README.md
├── fluxo-plataforma.excalidraw
│
└── assets/
    └── logo-patrocinador.svg
```

---

## 4. Como executar

### Opção A — VS Code

1. Abra a pasta `Plataforma_Corporativa_SENAI` no VS Code.
2. Abra o arquivo `index.html`.
3. Execute com Live Server, se estiver instalado.
4. O navegador abrirá a plataforma.

### Opção B — sem extensão

Também é possível abrir o `index.html` diretamente no navegador.

---

## 5. Usuários de demonstração

### Colaborador

E-mail:

```text
marcelo@empresa.com.br
```

Senha:

```text
123456
```

### Gestor de RH

E-mail:

```text
rh@empresa.com.br
```

Senha:

```text
123456
```

> Esses dados são apenas para demonstração. Não são credenciais adequadas para um sistema real.

---

## 6. Como demonstrar ao professor

### Fluxo 1 — Colaborador

1. Entrar como colaborador.
2. Mostrar o catálogo de dois cursos.
3. Escolher um curso.
4. Mostrar que o sistema bloqueia a escolha de outro curso enquanto o atual não estiver concluído.
5. Se escolher o curso gravado, marcar os vídeos como assistidos.
6. Mostrar o progresso mudando: 0%, 33%, 67%, 100%.
7. Ao chegar em 100%, clicar em `Gerar certificado`.
8. Mostrar a tela do certificado.
9. Usar `Imprimir / Salvar PDF` para demonstrar a emissão.

### Fluxo 2 — Curso presencial

1. Criar ou usar um colaborador.
2. Escolher `Segurança no Ambiente de Trabalho`.
3. Mostrar data, horário e endereço.
4. Sair.
5. Entrar como RH.
6. Registrar a presença do colaborador.
7. O progresso passa para 100%.
8. Voltar ao colaborador e mostrar o certificado liberado.

### Fluxo 3 — LGPD

1. Sair.
2. Clicar em `Criar conta`.
3. Tentar cadastrar um e-mail que não seja `@empresa.com.br`.
4. Mostrar que o sistema bloqueia.
5. Mostrar a caixa de concordância com termos e LGPD.
6. Cadastrar um e-mail corporativo.

---

## 7. Regras de negócio

### Regra 1 — E-mail corporativo

O cadastro aceita somente:

```text
@empresa.com.br
```

Em um sistema real, o domínio seria configurado de acordo com a empresa.

### Regra 2 — Um curso por vez

O colaborador pode escolher somente um curso enquanto o curso atual estiver em andamento.

Depois de atingir 100%, ele poderá escolher outro curso.

### Regra 3 — Certificado

O certificado só aparece quando:

```text
progresso === 100
```

### Regra 4 — Curso presencial

O colaborador não conclui sozinho o curso presencial.

O RH registra a presença.

### Regra 5 — Curso gravado

Cada vídeo pode ser marcado como assistido.

O percentual é calculado automaticamente conforme a quantidade de vídeos concluídos.

---

## 8. Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- LocalStorage
- SVG
- Excalidraw

Não foi utilizado framework para que o projeto fique mais fácil de explicar durante a apresentação.

---

## 9. Onde os dados ficam?

Neste protótipo, os dados ficam no `localStorage` do navegador.

Isso permite demonstrar:

- login;
- cadastro;
- progresso;
- presença;
- certificado;
- painel do RH.

### Importante

Isso **não é um banco de dados real**.

Para produção seria necessário um backend, autenticação segura e banco de dados.

---

## 10. LGPD — observação importante

O protótipo apresenta a etapa de consentimento e informa a finalidade do tratamento de dados.

Em produção, a empresa precisaria definir corretamente:

- controlador e operador dos dados;
- finalidade do tratamento;
- base legal aplicável;
- política de privacidade;
- retenção dos dados;
- segurança;
- direitos dos titulares;
- procedimento para solicitações dos titulares;
- controle de acesso;
- logs e auditoria.

Portanto, o checkbox de LGPD neste projeto representa uma **demonstração de requisito de interface e fluxo**, não uma implementação jurídica completa de conformidade com a LGPD.

---

## 11. Limitações do protótipo

Para uma apresentação de front-end, o projeto está funcional.

Para transformar em sistema real, os próximos passos seriam:

1. Backend.
2. Banco de dados.
3. Autenticação segura.
4. Hash de senha.
5. Controle real de permissões.
6. API.
7. Upload e armazenamento de vídeos.
8. Registro de presença com auditoria.
9. Geração de certificado em PDF no servidor.
10. Administração real de cursos.
11. Controle de empresas e domínios.
12. Adequação jurídica e técnica à LGPD.

---

## 12. Arquivo Excalidraw

O arquivo:

```text
fluxo-plataforma.excalidraw
```

contém uma visão visual da solução:

```text
LOGIN / CADASTRO
       |
       v
  COLABORADOR
       |
       v
CATÁLOGO DE CURSOS
       |
       +----------------------+
       |                      |
       v                      v
CURSO GRAVADO            PRESENCIAL
       |                      |
       v                      v
PROGRESSO %              DATA/ENDEREÇO
       |                      |
       |                      v
       |                 RH REGISTRA
       |                 PRESENÇA
       |                      |
       +----------+-----------+
                  |
                  v
                100%
                  |
                  v
             CERTIFICADO
```

Também há o painel separado do gestor de RH.

---

## 13. Perguntas que o professor pode fazer

### Por que usar LocalStorage?

Porque é um protótipo front-end. O LocalStorage permite persistir os dados no navegador sem criar um backend.

### Por que o RH tem outro painel?

Porque existe uma regra de negócio diferente. O colaborador acompanha o próprio curso; o RH acompanha os colaboradores e registra presença.

### Como o progresso é calculado?

No curso gravado:

```text
vídeos concluídos / total de vídeos × 100
```

No curso presencial:

```text
presença registrada = 100%
```

### Como o sistema impede dois cursos?

O usuário recebe um `cursoId`. Se já existe um curso diferente em andamento, o botão de escolha é bloqueado.

### O login é seguro?

Não. Este é um protótipo acadêmico. Em produção seria necessária autenticação real, backend, hash de senha e controle de sessão.

---

## 14. Sugestão de fala para apresentação

> "Meu projeto é uma plataforma corporativa de capacitação. O sistema possui dois perfis: colaborador e gestor de RH. O colaborador entra com o e-mail corporativo, aceita os termos no cadastro, escolhe um único curso e acompanha o progresso. Temos um curso gravado, em que o percentual depende dos vídeos concluídos, e um curso presencial, em que o RH registra a presença. Ao chegar a 100%, o sistema libera o certificado. O painel do RH permite acompanhar o cumprimento dos cursos obrigatórios. Para este protótipo utilizei HTML, CSS, JavaScript e LocalStorage. Em uma versão de produção, eu substituiria o armazenamento local por backend, banco de dados e autenticação segura."

---

## 15. Observação para o professor

O objetivo do projeto é demonstrar a aplicação de:

- estrutura HTML;
- estilização CSS;
- lógica JavaScript;
- eventos;
- funções;
- arrays e objetos;
- armazenamento local;
- manipulação do DOM;
- regras de negócio;
- navegação entre telas;
- cálculo de porcentagem;
- controle de estados;
- organização de um projeto front-end.
