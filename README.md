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
| `endpointLeads` | URL `/exec` do Apps Script da planilha. Vazio = grava só no navegador |

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

### Como a Sentir fica sabendo de quem fez o checklist

O GitHub Pages só serve arquivos estáticos: não envia e-mail nem grava nada em servidor.
Os dados chegam à Sentir por dois caminhos, que funcionam juntos.

#### 1. Planilha do Google (automático)

Cada visitante vira uma linha na planilha, sem precisar fazer nada:

- ao **enviar o formulário**, a linha nasce com nome, WhatsApp e e-mail — etapa "Só
  cadastro";
- ao clicar em **Visualizar Resultado**, a mesma linha ganha os sinais marcados e o
  veredito — etapa "Viu o resultado". Se a pessoa refizer o checklist, a linha é
  atualizada, não duplicada.

Colunas: Cadastrado em · Atualizado em · Etapa · Nome · WhatsApp · E-mail · Sinais (de 10)
· Sinais marcados · Resultado · Origem · ID.

Quem recebe é um Google Apps Script ligado à planilha (`servidor/planilha.gs`). Grátis, sem
servidor para manter. Para ligar:

1. Com a conta Google da Sentir, crie uma planilha em branco (sheets.new), por exemplo
   "Checklists — landing page".
2. Na planilha: **Extensões → Apps Script**. Apague o que estiver no editor, cole todo o
   conteúdo de `servidor/planilha.gs` e salve (ícone de disquete).
3. *Opcional:* para receber um e-mail a cada resultado novo, preencha `EMAIL_AVISO` no topo
   do script com o endereço da Sentir e salve de novo.
4. **Implantar → Nova implantação**. Na engrenagem, escolha **App da Web**.
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
5. Clique em **Implantar** e autorize com a conta da Sentir. O Google avisa que o app "não
   foi verificado" — é o próprio script de vocês: **Avançado → Acessar (não seguro)** →
   **Permitir**.
6. Copie a **URL do app da Web** (termina em `/exec`) e cole em `endpointLeads`, em
   `src/app/core/config.ts`. Faça commit e push para publicar.
7. Para conferir: abra a URL `/exec` no navegador — deve aparecer
   `{"ok":true,"servico":"Checklist Sentir"}`. A aba "Checklists" é criada sozinha no
   primeiro cadastro.

Se alterar o script depois: **Implantar → Gerenciar implantações → lápis → Versão: Nova
versão → Implantar**. A URL continua a mesma.

A URL `/exec` fica visível no código da página, então qualquer pessoa que a encontre
consegue mandar linhas para a planilha. O script aceita só os campos esperados, limita o
tamanho dos textos e impede que um valor vire fórmula; o pior caso é uma linha falsa, que
se apaga à mão.

Com `endpointLeads` vazio, nada é enviado: os dados ficam só no `localStorage` do
navegador do visitante.

#### 2. WhatsApp (o visitante envia)

Todos os botões "Conversar com a Sentir" abrem o WhatsApp comercial (`whatsapp` em
`config.ts`) com a mensagem já escrita, trazendo os dados e o resultado:

```
Olá, Sentir. Fiz o checklist dos 10 sinais e gostaria de conversar sobre um projeto
corporativo para minha empresa.

*Nome:* Ana
*WhatsApp:* (21) 98888-7777
*E-mail:* ana@empresa.com.br        ← só se o visitante informou

*Resultado:* 3 de 10 sinais
Sinais marcados: Luz, Som e Biofilia.
```

O visitante confere e toca em enviar. Nada sai sem essa ação dele — nenhum site consegue
mandar WhatsApp em nome de alguém.

O formulário pede nome e WhatsApp; o e-mail é **opcional**. A origem da visita vem de
`?utm_source=` na URL (útil para medir a campanha do Instagram) ou, sem ele, do site de
onde a pessoa veio.

### O resultado e o PDF

Ao marcar os sinais, o visitante vê o botão **Visualizar Resultado** (menta clara). Ele
abre uma nova seção logo abaixo do checklist com o checklist respondido na mesma
diagramação do PDF — logotipo, as dez perguntas com as marcações, a contagem, o veredito e
o contato da Sentir — e, embaixo, **Conversar com a Sentir** e **Baixar o PDF**.

O PDF é montado no próprio navegador com `pdf-lib`, sem servidor. A biblioteca só é
baixada quando alguém clica em "Baixar o PDF" (import dinâmico), então não pesa no
carregamento inicial.

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
git remote add origin https://github.com/sentirArquitetura/checklist.git
git push -u origin main
```

### 2. Ligar o Pages

No repositório: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

### 3. Pronto!

O workflow em `.github/workflows/deploy.yml` já está no projeto. A cada push na `master` ele
instala, buda com o `--base-href` certo para a subpasta do repositório, cria o `404.html`
de fallback e publica. O endereço final é:

```
https://sentirarquitetura.github.io/checklist/
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
npm run build -- --base-href "/checklist/"
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
│   ├── entrega.ts        baixar o PDF
│   ├── funil.ts          estado do funil em signals, persistência e mensagem do WhatsApp
│   ├── lead.ts           formato do lead
│   ├── revelar.ts        diretiva de reveal no scroll
│   └── rolar.ts          rolagem suave entre seções
└── secoes/
    ├── hero              primeira dobra: logotipo, título e espectro dos canais
    ├── captura           formulário (etapa 1)
    ├── diagnostico       checklist, resultado e corte sensorial
    ├── relatorio         checklist respondido na tela (igual ao PDF), WhatsApp e PDF
    ├── sentir            apresentação da Sentir
    ├── cta-final         chamada para o WhatsApp
    ├── rodape
    └── barra-acao        barra fixa com a contagem e o CTA contextual

servidor/
└── planilha.gs           Google Apps Script que grava os checklists na planilha
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
