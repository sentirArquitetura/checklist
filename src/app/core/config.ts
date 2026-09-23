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
   * URL do app da web do Google Apps Script que grava os checklists na planilha
   * (termina em /exec). O script está em servidor/planilha.gs e o passo a passo
   * no README. Em branco: os dados ficam só no navegador do visitante.
   */
  endpointLeads: 'https://script.google.com/macros/s/AKfycbymQl2ZuuNpA3UBYgao7rMfMrHXfQ_dqmbhXpi3MzwMrzAPOLDD0kMFdSwGrC2YvdOAPw/exec', 
                    
} as const;

/** Monta o link do WhatsApp, opcionalmente com os dados e o resultado do checklist. */
export function linkWhatsapp(complemento?: string): string {
  const texto = complemento
    ? `${SENTIR.mensagemWhatsapp}\n\n${complemento}`
    : SENTIR.mensagemWhatsapp;
  return `https://wa.me/${SENTIR.whatsapp}?text=${encodeURIComponent(texto)}`;
}

/** WhatsApp formatado para leitura: +55 21 99643-5302 */
export function whatsappLegivel(): string {
  const d = SENTIR.whatsapp;
  return `+${d.slice(0, 2)} ${d.slice(2, 4)} ${d.slice(4, 9)}-${d.slice(9)}`;
}
