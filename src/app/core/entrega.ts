import { Injectable, inject, signal } from '@angular/core';
import { ChecklistPdf, Resultado } from './checklist-pdf';

export type EstadoEntrega = 'parado' | 'gerando' | 'pronto' | 'erro';

/**
 * Entrega do checklist respondido: o PDF é montado no próprio navegador e
 * baixado na hora. Nenhum servidor envolvido — funciona no GitHub Pages.
 */
@Injectable({ providedIn: 'root' })
export class Entrega {
  private readonly pdf = inject(ChecklistPdf);

  private readonly _estado = signal<EstadoEntrega>('parado');
  private readonly _aviso = signal<string | null>(null);

  readonly estado = this._estado.asReadonly();
  readonly aviso = this._aviso.asReadonly();

  /** Gera o PDF e dispara o download no navegador. */
  async baixar(resultado: Resultado): Promise<void> {
    this._estado.set('gerando');
    this._aviso.set(null);

    try {
      const blob = await this.pdf.gerar(resultado);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = this.pdf.nomeArquivo(resultado.lead);
      link.click();
      URL.revokeObjectURL(url);
      this._estado.set('pronto');
    } catch {
      this._estado.set('erro');
      this._aviso.set('Não foi possível gerar o PDF agora. Tente de novo.');
    }
  }
}
