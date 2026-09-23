/** Dados que o visitante entrega para receber o checklist. */
export interface Lead {
  /** Identifica o cadastro na planilha: a mesma linha é atualizada a cada envio. */
  id: string;
  nome: string;
  empresa: string;
  cargo: string;
  whatsapp: string;
  /** Opcional: fica vazio quando o visitante não informa. */
  email: string;
  /** Momento do envio, em ISO. */
  enviadoEm: string;
  /** Origem da visita, lida da query string (?utm_source=instagram). */
  origem: string;
}
