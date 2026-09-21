/**
 * Ponto único de configuração da landing page.
 * Ajuste estes valores antes de publicar.
 */
export const SENTIR = {
  /** Número do WhatsApp comercial, só dígitos, com DDI e DDD. */
  whatsapp: '5521996435302',

  /** Mensagem que já vem escrita quando o visitante abre a conversa. */
  mensagemWhatsapp:
    'Olá, Sentir. Fiz o checklist dos 10 sinais e gostaria de conversar sobre um projeto corporativo para minha empresa.',

  instagram: 'https://www.instagram.com/sentir.arquitetura',

  /** E-mail que aparece no rodapé e no PDF. */
  email: 'fernanda@sentirarquitetura.com.br',

  /**
   * Endpoint que recebe os leads (Formspree, n8n, Make, Apps Script, API própria).
   * Deixe em branco para gravar apenas no navegador enquanto testa.
   */
  endpointLeads: '',

  /**
   * Endpoint que recebe o PDF e dispara o e-mail para o visitante.
   * Recebe { lead, resultado, pdfBase64, nomeArquivo }.
   * Veja o exemplo pronto de Cloudflare Worker no README.
   * Em branco: o botão de e-mail avisa que o envio ainda não foi configurado.
   */
  endpointEnvio: '',
} as const;

/** Monta o link do WhatsApp, opcionalmente com o resultado do checklist. */
export function linkWhatsapp(complemento?: string): string {
  const texto = complemento
    ? `${SENTIR.mensagemWhatsapp} ${complemento}`
    : SENTIR.mensagemWhatsapp;
  return `https://wa.me/${SENTIR.whatsapp}?text=${encodeURIComponent(texto)}`;
}

/** WhatsApp formatado para leitura: +55 21 99643-5302 */
export function whatsappLegivel(): string {
  const d = SENTIR.whatsapp;
  return `+${d.slice(0, 2)} ${d.slice(2, 4)} ${d.slice(4, 9)}-${d.slice(9)}`;
}
