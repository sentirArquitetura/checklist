import { Injectable, computed, signal } from '@angular/core';
import { CANAIS } from './canais';
import { Lead } from './lead';
import { SENTIR } from './config';

const CHAVE_LEAD = 'sentir.lead';
const CHAVE_MARCADOS = 'sentir.marcados';

/**
 * Estado do funil: quem já se identificou e o que marcou no diagnóstico.
 * Guarda no navegador para que um refresh não devolva o visitante ao início.
 */
@Injectable({ providedIn: 'root' })
export class Funil {
  private readonly _lead = signal<Lead | null>(this.lerLead());
  private readonly _marcados = signal<ReadonlySet<string>>(this.lerMarcados());
  private readonly _enviando = signal(false);
  private readonly _erroEnvio = signal<string | null>(null);

  readonly lead = this._lead.asReadonly();
  readonly marcados = this._marcados.asReadonly();
  readonly enviando = this._enviando.asReadonly();
  readonly erroEnvio = this._erroEnvio.asReadonly();

  /** O checklist só abre depois que o visitante se identifica. */
  readonly liberado = computed(() => this._lead() !== null);
  readonly total = computed(() => this._marcados().size);
  readonly comecouDiagnostico = computed(() => this.total() > 0);
  /** Três ou mais sinais indicam um ambiente fora de compasso com a empresa. */
  readonly alerta = computed(() => this.total() >= 3);

  /** Canais marcados, na ordem do checklist. */
  readonly canaisMarcados = computed(() => CANAIS.filter((c) => this._marcados().has(c.id)));

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

  reiniciarDiagnostico(): void {
    this._marcados.set(new Set());
    this.gravar(CHAVE_MARCADOS, []);
  }

  /** Registra o lead e, se houver endpoint configurado, envia para lá. */
  async registrar(dados: Omit<Lead, 'enviadoEm' | 'origem'>): Promise<boolean> {
    this._enviando.set(true);
    this._erroEnvio.set(null);

    const lead: Lead = {
      ...dados,
      enviadoEm: new Date().toISOString(),
      origem: this.origem(),
    };

    try {
      if (SENTIR.endpointLeads) {
        const resposta = await fetch(SENTIR.endpointLeads, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(lead),
        });
        if (!resposta.ok) {
          throw new Error(`HTTP ${resposta.status}`);
        }
      }

      this._lead.set(lead);
      this.gravar(CHAVE_LEAD, lead);
      return true;
    } catch {
      this._erroEnvio.set(
        'Não foi possível registrar seus dados agora. Tente de novo em alguns segundos.',
      );
      return false;
    } finally {
      this._enviando.set(false);
    }
  }

  private origem(): string {
    if (typeof window === 'undefined') return 'direto';
    const params = new URLSearchParams(window.location.search);
    return params.get('utm_source') ?? document.referrer ?? 'direto';
  }

  private lerLead(): Lead | null {
    const bruto = this.ler(CHAVE_LEAD);
    return bruto ? (JSON.parse(bruto) as Lead) : null;
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
