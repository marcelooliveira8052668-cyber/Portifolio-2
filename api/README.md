# API da Loja — Guia de Configuração

Recebe o pedido → cria o Pix no Mercado Pago → aguarda o webhook → gera um link
assinado → envia o e-mail → entrega o `.zip`.

**Custo:** Mercado Pago cobra ~R$ 0,99 por transação Pix (sem mensalidade).
Cloudflare Worker e R2 têm plano gratuito. Resend (e-mail) tem 3.000 e-mails/mês grátis.

---

## 1. Criar as contas (grátis)

| Serviço | Para quê | Link |
|---|---|---|
| **Mercado Pago** | receber o Pix | https://www.mercadopago.com.br/developers/pt-br |
| **Cloudflare** | hospedar a API e os arquivos | https://dash.cloudflare.com/sign-up |
| **Resend** | enviar o e-mail com o link | https://resend.com |

---

## 2. Mercado Pago — pegar o token

1. Painel → **Desenvolvedor → Credenciais → Access Token de produção**
2. Copie o token (começa com `APP_USR-...`)
3. Em **Credenciais → Webhooks**, cadastre:
   - URL: `https://SEU-WORKER.workers.dev/api/webhook`
   - Evento: **Pagamentos**
   - Copie a **Assinatura secreta**

---

## 3. Cloudflare — subir a API

```bash
npm install -g wrangler
wrangler login

cd api
wrangler r2 bucket create PRODUTOS

wrangler secret put MP_TOKEN           # cole o Access Token
wrangler secret put MP_WEBHOOK_SECRET  # cole a assinatura secreta
wrangler secret put LINK_SECRET        # gere: openssl rand -hex 32
wrangler secret put EMAIL_API_KEY      # chave da Resend (re_...)
wrangler secret put EMAIL_FROM         # "Loja <loja@seudominio.com>"
wrangler secret put BASE_URL           # https://SEU-WORKER.workers.dev

wrangler deploy
```

O comando `wrangler deploy` mostra a URL, por exemplo:
`https://loja-api.seunome.workers.dev`

**Copie essa URL** e cole em `config.apiBase` no arquivo `loja/catalogo.json`.

---

## 4. Enviar os arquivos (.zip)

Os `.zip` **não** ficam no GitHub (quemvisse o repositório baixaria de graça).
Ficam num bucket privado do R2.

```bash
# empacote cada projeto
cd "C:/Trabalho/Calculadora-iphone"
zip -r calculadora-cientifica.zip . -x "*.git*"

# envie para o R2
wrangler r2 object put PRODUTOS/calculadora-cientifica.zip --file calculadora-cientifica.zip
```

Repita para todos. O nome do arquivo tem que ser igual ao campo `arquivo`
no `catalogo.json`.

Nomes esperados:

```
scanner-de-documentos.zip        calculadora-cientifica.zip
gerador-de-sites-dola.zip       minha-loja-online.zip
checkout-cyber-metal.zip        comanda-facil.zip
nf-control.zip                  devbook.zip
trilha-corporativa.zip          globaltalk-lab.zip
lina-tutor-ia.zip               skillmatch.zip
```

> **Pacotes:** não precisa criar zip dos pacotes. O Worker monta um `.zip`
> na hora com todos os arquivos, quando alguém compra o pacote completo.

---

## 5. Testar

```bash
# a API está no ar e configurada?
curl https://SEU-WORKER.workers.dev/api/saude
```

Resposta esperada:

```json
{
  "ok": true,
  "configurado": {
    "mercadoPago": true,
    "email": true,
    "segredoLink": true,
    "baseUrl": "https://SEU-WORKER.workers.dev"
  }
}
```

Depois teste o Pix real com um valor baixo (R$ 1,00), para não cobrar de si mesmo.

---

## 6. Resend — domínio do e-mail

Para o e-mail não cair no spam, adicione seu domínio:

1. Resend → **Domains** → Add Domain (ex.: `seudominio.com.br`)
2. copie os registros DNS que ele mostrar
3. adicione no Cloudflare (ou no seu registrador de domínio)
4. volte ao Resend e confirme

Sem isso o e-mail sai de `onboarding@resend.dev` — funciona, mas vai spam.

---

## Fluxo resumido

```
Cliente clica em Comprar
        ↓
loja/app.js → POST /api/checkout
        ↓
Worker → POST api.mercadopago.com/v1/payments  (payment_method_id: pix)
        ↓
QR Code aparece na tela do cliente
        ↓
Cliente paga no Pix
        ↓
Mercado Pago → POST /api/webhook
        ↓
Worker confere status = approved
        ↓
Worker monta token assinado (HMAC, vale 7 dias)
        ↓
Worker → Resend → e-mail com o link
        ↓
Cliente clica em /api/download/TOKEN
        ↓
Worker valida a assinatura e serve o .zip do R2
```

---

## Segurança aplicada

- O link de download é assinado com HMAC-SHA-256 — não dá para forjar
- Expira sozinho em 7 dias
- O e-mail vai **com hash (SHA-256)**, não em texto puro, dentro do token
- CORS liberado só para leitura do catálogo
- Webhook confere a assinatura do Mercado Pago

---

## Mudar o preço

Dois lugares (mantenha igual):

1. `loja/catalogo.json` → campo `preco` de cada produto
2. `api/worker.js` → constante `PRECOS`

---

## Problemas comuns

| Sintoma | Causa |
|---|---|
| "API não configurada: falta MP_TOKEN" | Faltou `wrangler secret put MP_TOKEN` |
| E-mail não chega | `EMAIL_API_KEY` vazio ou domínio não verificado |
| "arquivo ainda não foi enviado" | O `.zip` não foi para o R2, ou o nome está diferente |
| Pix gerado mas nunca aprova | `notification_url` errada — confira `BASE_URL` |
| Link diz "expirado" | Token com mais de 7 dias, ou `LINK_SECRET` mudou |

---

## Observação importante sobre o webhook

O Mercado Pago envia o webhook, mas se ele falhar o pagamento **ainda é
confirmado** — só o e-mail não sai. Por isso a vitrine também consulta
`/api/status/:id` a cada 5 segundos enquanto o QR está na tela. Se o
webhook falhar, o cliente vê "aprovado" na tela, mas precisa pedir o reenvio
do e-mail. Se want isso automático, me chame que eu adiciono um retry.