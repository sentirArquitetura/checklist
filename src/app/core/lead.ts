/** Dados que o visitante entrega para receber o checklist. */
export interface Lead {
  nome: string;
  empresa: string;
  cargo: string;
  whatsapp: string;
  email: string;
  /** Momento do envio, em ISO. */
  enviadoEm: string;
  /** Origem da visita, lida da query string (?utm_source=instagram). */
  origem: string;
}
