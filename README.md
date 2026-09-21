# Sentir Arquitetura — Landing page do checklist

Página de captura de leads qualificados para projetos corporativos da Sentir Arquitetura.
O visitante chega pelo Instagram, deixa os dados, responde ao checklist dos 10 sinais e é
conduzido para uma conversa no WhatsApp.

Angular 22 · standalone components · signals · zoneless · uma única dependência
(`pdf-lib`, carregada sob demanda).

---

## Antes de publicar_

Tudo o que muda de cliente para cliente está em **`src/app/core/config.ts`**:

| Campo | O que é |
| --- | --- |
| `whatsapp` | Número comercial, só dígitos, com DDI e DDD (`5521999998888`) |
| `mensagemWhatsapp` | Texto que já vem escrito quando a conversa abre |
| `instagram` | Link do perfil, usado no rodapé |
| `email` | E-mail que aparece no rodapé e no PDF |
| `endpointLeads` | URL que recebe o POST dos leads. Vazio = grava só no navegador |
| `endpointEnvio` | URL que recebe o PDF e dispara o e-mail. Vazio = só o download funciona |

As perguntas, os nomes e as cores dos dez canais sensoriais estão em
**`src/app/core/canais.ts`**.

### Imagens

Já estão em `public/imagens/`:

- `logo-sentir.png` — logotipo com fundo transparente, usado no topo, no rodapé e no PDF
- `logo-sentir-claro.png` — mesma marca clareada, para fundos escuros

Ainda faltam:

- `projeto-sentir.jpg` — foto de projeto na seção "A Sentir" (4:3, ~1600px de largura)
- `og-sentir.jpg` — imagem de compartilhamento no WhatsApp e Instagram (1200×630)

Enquanto esses dois não existirem, a página mostra uma moldura vazia no lugar da foto.
Nada quebra.

O logotipo veio de um PNG de 149×71, que é pouco para telas retina. Se a Sentir tiver o
arquivo vetorial, troque por um SVG: o `<img>` funciona igual e fica nítido em qualquer
tamanho.

### Recebimento dos leads

O formulário faz `POST` de um JSON com `nome`, `empresa`, `cargo`, `whatsapp`, `email`,
`enviadoEm` e `origem` (lida de `?utm_source=` na URL — útil para medir a campanha do
Instagram). Serve qualquer endpoint que aceite JSON: Formspree, n8n, Make, Apps Script
ligado a uma planilha ou uma API própria.

Com `endpointLeads` vazio, o lead fica só no `localStorage` do navegador — bom para testar
o fluxo, mas nenhum dado chega até você.

### O PDF do checklist

Ao terminar o checklist o visitante tem dois botões: **baixar o PDF** e **receber por
e-mail**. O arquivo é montado no próprio navegador com `pdf-lib` — traz o logotipo, as dez
perguntas com as marcações, a contagem, o veredito e o contato da Sentir. Nada de servidor
para gerar: o download funciona mesmo sem backend nenhum.

O `pdf-lib` só é baixado quando alguém clica em um dos botões (import dinâmico), então ele
não pesa no carregamento inicial.

**O e-mail é a parte que precisa de servidor.** Uma página estática não envia e-mail. O
botão manda um POST para `endpointEnvio` com:

```json
{
  "lead": { "nome": "...", "empresa": "...", "cargo": "...", "whatsapp": "...", "email": "..." },
  "resultado": { "total": 4, "alerta": true, "marcados": ["luz", "som", "biofilia", "fluxo"] },
  "nomeArquivo": "checklist-sentir-acme.pdf",
  "pdfBase64": "JVBERi0xLjcK..."
}
```

Em `servidor/worker.js` tem um Cloudflare Worker pronto que recebe isso e envia pelo Resend,
com cópia oculta para a Sentir. Instruções de deploy estão no cabeçalho do arquivo. Serve
igual em n8n, Make ou uma rota sua em Node/Spring — o formato do corpo é o mesmo.

Enquanto `endpointEnvio` estiver vazio, o botão de e-mail avisa na tela que o envio não foi
configurado. O download continua funcionando normalmente.

---

## Rodando localmente

Requer Node 22.22.3+ ou 24.15+ (exigência do Angular CLI 22).

```bash
npm install
npm start          # http://localhost:4200
npm run build      # gera dist/sentir-landing/browser
```

---

## Deploy no GitHub Pages

### 1. Subir o projeto

```bash
git init
git add .
git commit -m "Landing page do checklist Sentir"
git branch -M main
git remote add origin https://github.com/juliokhichfy/sentir-landing.git
git push -u origin main
```

### 2. Ligar o Pages

No repositório: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

### 3. Pronto!

O workflow em `.github/workflows/deploy.yml` já está no projeto. A cada push na `master` ele
instala, buda com o `--base-href` certo para a subpasta do repositório, cria o `404.html`
de fallback e publica. O endereço final é:

```
https://juliokhichfy.github.io/sentir-landing/
```

Acompanhe em **Actions**. O primeiro deploy leva uns dois minutos.

### Domínio próprio

Se for usar `checklist.sentirarquitetura.com.br` ou parecido:

1. Crie o arquivo `public/CNAME` com o domínio dentro (uma linha, sem `https://`).
2. Aponte o DNS para o GitHub Pages.
3. Troque o build do workflow por `npx ng build --base-href "/"` — na raiz do domínio não
   existe subpasta.

### Alternativa sem Actions

```bash
npm run build -- --base-href "/sentir-landing/"
npx angular-cli-ghpages --dir=dist/sentir-landing/browser
```

---

## Como a página está organizada

```
src/app/
├── core/
│   ├── canais.ts         os 10 sinais: nome, pergunta e cor de cada canal
│   ├── checklist-pdf.ts  monta o PDF respondido no navegador
│   ├── config.ts         WhatsApp, Instagram, e-mail, endpoints
│   ├── entrega.ts        baixar o PDF e enviar por e-mail
│   ├── funil.ts          estado do funil em signals + persistência no navegador
│   ├── lead.ts           formato do lead
│   ├── revelar.ts        diretiva de reveal no scroll
│   └── rolar.ts          rolagem suave entre seções
└── secoes/
    ├── hero              primeira dobra: logotipo, título e espectro dos canais
    ├── captura           formulário (etapa 1)
    ├── diagnostico       checklist, resultado, corte sensorial e entrega do PDF
    ├── sentir            apresentação da Sentir
    ├── cta-final         chamada para o WhatsApp
    ├── rodape
    └── barra-acao        barra fixa com a contagem e o CTA contextual

servidor/
└── worker.js             exemplo de backend que envia o PDF por e-mail
```

### Decisões de design

Os dez sinais não são uma lista qualquer: cada um é um **canal sensorial** com nome e cor
próprios. Conforme o visitante marca, monta-se o **corte sensorial** — faixas empilhadas em
que os canais marcados avançam e ganham cor. É o elemento que a página é feita para deixar
na memória, e é ele que vai junto para o WhatsApp: a mensagem já sai com quantos e quais
sinais a pessoa marcou, então o primeiro contato começa com o diagnóstico na mão.

**Cores.** Coral `#F59494` e menta `#89C4C4` são as duas cores da marca. As dez cores dos
canais saem da mesma família pastel do logotipo — coral e menta são dois dos dez canais
(Identidade e Ar), e os outros oito acompanham a mesma saturação. Os tokens ficam todos no
`:root` de `src/styles.css`. 

**Tipografia.** Instrument Serif no display, com o itálico reservado para a palavra em
destaque de cada título — é o mesmo gesto do "Arquitetura" manuscrito do logotipo. Outfit
no corpo e DM Mono nas etiquetas técnicas.

**Sequência de fundos.** Papel quente no topo, menta no formulário, areia no checklist,
carvão no resultado e na apresentação, coral na chamada final. O coral aparece uma vez
só, na última tela antes do WhatsApp.

O checklist fica fechado até o cadastro. Quem já preencheu não precisa preencher de novo:
o lead e as marcações ficam no navegador.

### Acessibilidade

Foco visível no teclado, alvos de toque grandes, `aria-checked` nos sinais, contagem com
`aria-live`, link para pular ao conteúdo e `prefers-reduced-motion` respeitado em todas as
animações.  
