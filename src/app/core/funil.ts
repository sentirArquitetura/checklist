import { Injectable, computed, signal } from '@angular/core';
import { CANAIS } from './canais';
import { Resultado } from './checklist-pdf';
import { Lead } from './lead';
import { SENTIR, linkWhatsapp } from './config';

const CHAVE_LEAD = 'sentir.lead';
const CHAVE_MARCADOS = 'sentir.marcados';

/** Identificador do cadastro: é por ele que a planilha acha a linha para atualizar. */
function novoId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Estado do funil: quem já se identificou e o que marcou no diagnóstico.
 * Guarda no navegador para que um refresh não devolva o visitante ao início.
 */
@Injectable({ providedIn: 'root' })
export class Funil {
  private readonly _lead = signal<Lead | null>(this.lerLead());
  private readonly _marcados = signal<ReadonlySet<string>>(this.lerMarcados());
  private readonly _relatorioAberto = signal(false);

  readonly lead = this._lead.asReadonly();
  readonly marcados = this._marcados.asReadonly();

  /** O checklist só abre depois que o visitante se identifica. */
  readonly liberado = computed(() => this._lead() !== null);
  readonly total = computed(() => this._marcados().size);
  readonly comecouDiagnostico = computed(() => this.total() > 0);
  /** Três ou mais sinais indicam um ambiente fora de compasso com a empresa. */
  readonly alerta = computed(() => this.total() >= 3);

  /** Canais marcados, na ordem do checklist. */
  readonly canaisMarcados = computed(() => CANAIS.filter((c) => this._marcados().has(c.id)));

  /** A seção com o checklist respondido só aparece depois de "Visualizar Resultado". */
  readonly relatorioVisivel = computed(
    () => this._relatorioAberto() && this.liberado() && this.comecouDiagnostico(),
  );

  /** Tudo o que o PDF e a seção de resultado precisam. */
  readonly resultado = computed<Resultado | null>(() => {
    const lead = this._lead();
    if (!lead) return null;
    return { lead, marcados: this._marcados(), total: this.total(), alerta: this.alerta() };
  });

  /**
   * Link do WhatsApp da Sentir com os dados do visitante e o resultado já escritos.
   * O visitante vê a mensagem pronta e só toca em enviar — é assim que a Sentir
   * fica sabendo quem fez o checklist, sem servidor nenhum.
   */
  readonly linkConversa = computed(() => {
    const lead = this._lead();
    if (!lead) return linkWhatsapp();

    const linhas = [`*Nome:* ${lead.nome}`, `*WhatsApp:* ${lead.whatsapp}`];
    const email = lead.email?.trim();
    if (email) linhas.push(`*E-mail:* ${email}`);

    const marcados = this.canaisMarcados();
    if (marcados.length > 0) {
      const nomes = marcados.map((c) => c.nome);
      const lista =
        nomes.length === 1 ? nomes[0] : `${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}`;
      linhas.push('', `*Resultado:* ${marcados.length} de 10 sinais`, `Sinais marcados: ${lista}.`);
    }

    return linkWhatsapp(linhas.join('\n'));
  });

  marcado(id: string): boolean {
    return this._marcados().has(id);
  }

  alternar(id: string): void {
    const proximos = new Set(this._marcados());
    if (!proximos.delete(id)) {
      proximos.add(id);
    }
    this._marcados.set(proximos);
    this.gravar(CHAVE_MARCADOS, [...proximos]);
  }

  /** "Visualizar Resultado": abre a seção e registra o resultado na planilha. */
  abrirRelatorio(): void {
    this._relatorioAberto.set(true);
    this.enviarParaPlanilha('resultado');
  }

  reiniciarDiagnostico(): void {
    this._relatorioAberto.set(false);
    this._marcados.set(new Set());
    this.gravar(CHAVE_MARCADOS, []);
  }

  /** Registra o lead no navegador e, se houver planilha configurada, envia para lá. */
  registrar(dados: Omit<Lead, 'id' | 'enviadoEm' | 'origem'>): void {
    const lead: Lead = {
      ...dados,
      id: novoId(),
      enviadoEm: new Date().toISOString(),
      origem: this.origem(),
    };

    this._lead.set(lead);
    this.gravar(CHAVE_LEAD, lead);
    this.enviarParaPlanilha('cadastro');
  }

  /**
   * Manda os dados para a planilha da Sentir (servidor/planilha.gs), em segundo plano.
   * O visitante nunca espera nem vê erro: se a planilha falhar, o funil segue igual.
   *
   * O Google Apps Script não responde ao preflight de CORS, por isso o corpo vai
   * como texto simples e em modo no-cors — a resposta não é lida. O keepalive
   * garante o envio mesmo que o visitante saia da página logo em seguida.
   */
  private enviarParaPlanilha(etapa: 'cadastro' | 'resultado'): void {
    const lead = this._lead();
    if (!SENTIR.endpointLeads || !lead) return;

    const marcados = this.canaisMarcados();
    const corpo = {
      id: lead.id,
      etapa,
      nome: lead.nome,
      whatsapp: lead.whatsapp,
      email: lead.email ?? '',
      origem: lead.origem,
      cadastradoEm: lead.enviadoEm,
      total: etapa === 'resultado' ? marcados.length : null,
      sinais: etapa === 'resultado' ? marcados.map((c) => c.nome).join(', ') : '',
      alerta: etapa === 'resultado' ? this.alerta() : null,
    };

    fetch(SENTIR.endpointLeads, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(corpo),
    }).catch(() => {
      /* sem rede ou planilha fora do ar: o visitante segue normalmente */
    });
  }

  private origem(): string {
    if (typeof window === 'undefined') return 'direto';
    const params = new URLSearchParams(window.location.search);
    return params.get('utm_source') || document.referrer || 'direto';
  }

  private lerLead(): Lead | null {
    const bruto = this.ler(CHAVE_LEAD);
    if (!bruto) return null;

    // Cadastros feitos antes do id existir ganham um agora, para a planilha
    // conseguir atualizar a mesma linha.
    const lead = JSON.parse(bruto) as Lead;
    if (!lead.id) {
      lead.id = novoId();
      this.gravar(CHAVE_LEAD, lead);
    }
    return lead;
  }

  private lerMarcados(): ReadonlySet<string> {
    const bruto = this.ler(CHAVE_MARCADOS);
    return new Set<string>(bruto ? (JSON.parse(bruto) as string[]) : []);
  }

  private ler(chave: string): string | null {
    try {
      return localStorage.getItem(chave);
    } catch {
      return null;
    }
  }

  private gravar(chave: string, valor: unknown): void {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
    } catch {
      /* navegação privada ou storage bloqueado: seguimos só em memória */
    }
  }
}
