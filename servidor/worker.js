/**
 * Cloudflare Worker que recebe o checklist respondido e manda o PDF por e-mail.
 * É o endpoint que vai em `endpointEnvio` no src/app/core/config.ts.
 *
 * Como colocar no ar:
 *   1. npm create cloudflare@latest sentir-envio   (escolha "Hello World Worker")
 *   2. substitua o src/index.js gerado por este arquivo
 *   3. npx wrangler secret put RESEND_API_KEY      (chave criada em resend.com)
 *   4. npx wrangler deploy
 *   5. copie a URL do worker para endpointEnvio e ajuste ORIGEM_PERMITIDA abaixo
 *
 * O mesmo formato de corpo funciona em n8n, Make ou uma rota Node/Spring:
 *   { lead, resultado, nomeArquivo, pdfBase64 }
 */

const ORIGEM_PERMITIDA = 'https://SEU-USUARIO.github.io';
const REMETENTE = 'Sentir Arquitetura <contato@sentirarquitetura.com.br>';
const COPIA_INTERNA = 'contato@sentirarquitetura.com.br';

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': ORIGEM_PERMITIDA,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: cors });
    }

    const { lead, resultado, nomeArquivo, pdfBase64 } = await request.json();

    if (!lead?.email || !pdfBase64) {
      return Response.json({ erro: 'Faltam dados do lead ou o PDF.' }, { status: 400, headers: cors });
    }

    const corpo = `
      <p>Olá, ${escapar(lead.nome)}.</p>
      <p>
        Segue em anexo o seu checklist respondido. Você marcou
        <strong>${resultado.total} de 10 sinais</strong>.
      </p>
      <p>
        ${
          resultado.alerta
            ? 'A partir de três sinais o ambiente já começa a atrapalhar a operação — cada ponto marcado tem solução de projeto.'
            : 'Seu escritório está inteiro na maior parte dos canais. Vale olhar de perto o que foi marcado.'
        }
      </p>
      <p>Quando quiser conversar sobre o projeto, é só responder este e-mail ou chamar no WhatsApp.</p>
      <p>Sentir Arquitetura</p>
    `;

    const resposta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: REMETENTE,
        to: [lead.email],
        bcc: [COPIA_INTERNA],
        subject: `${lead.nome}, seu checklist dos 10 sinais`,
        html: corpo,
        attachments: [{ filename: nomeArquivo, content: pdfBase64 }],
      }),
    });

    if (!resposta.ok) {
      return Response.json({ erro: await resposta.text() }, { status: 502, headers: cors });
    }

    return Response.json({ ok: true }, { headers: cors });
  },
};

function escapar(texto = '') {
  return texto.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]);
}
