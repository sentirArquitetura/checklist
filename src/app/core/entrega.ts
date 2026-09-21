import { Injectable, inject, signal } from '@angular/core';
import { ChecklistPdf, Resultado } from './checklist-pdf';
import { SENTIR } from './config';

export type EstadoEntrega = 'parado' | 'gerando' | 'enviando' | 'pronto' | 'enviado' | 'erro';

/**
 * Entrega do checklist respondido: baixar o PDF na hora e mandar por e-mail.
 *
 * O PDF é montado no próprio navegador. Para o e-mail, o arquivo vai em base64
 * para o endpoint configurado em config.ts, que é quem dispara a mensagem —
 * uma página estática não envia e-mail sozinha.
 */
@Injectable({ providedIn: 'root' })
export class Entrega {
  private readonly pdf = inject(ChecklistPdf);

  private readonly _estado = signal<EstadoEntrega>('parado');
  private readonly _aviso = signal<string | null>(null);

  readonly estado = this._estado.asReadonly();
  readonly aviso = this._aviso.asReadonly();

  readonly envioConfigurado = !!SENTIR.endpointEnvio;

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

  /** Gera o PDF e envia para o endpoint, que manda o e-mail. */
  async enviarPorEmail(resultado: Resultado): Promise<void> {
    if (!SENTIR.endpointEnvio) {
      this._estado.set('erro');
      this._aviso.set(
        'Envio por e-mail ainda não configurado: defina endpointEnvio em core/config.ts.',
      );
      return;
    }

    this._estado.set('gerando');
    this._aviso.set(null);

    try {
      const blob = await this.pdf.gerar(resultado);
      const pdfBase64 = await this.paraBase64(blob);

      this._estado.set('enviando');
      const resposta = await fetch(SENTIR.endpointEnvio, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          lead: resultado.lead,
          resultado: {
            total: resultado.total,
            alerta: resultado.alerta,
            marcados: [...resultado.marcados],
          },
          nomeArquivo: this.pdf.nomeArquivo(resultado.lead),
          pdfBase64,
        }),
      });

      if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

      this._estado.set('enviado');
      this._aviso.set(`Checklist enviado para ${resultado.lead.email}. Confira também o spam.`);
    } catch {
      this._estado.set('erro');
      this._aviso.set(
        'O envio falhou. Baixe o PDF agora e tente o e-mail de novo em alguns instantes.',
      );
    }
  }

  private paraBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => resolve(String(leitor.result).split(',')[1] ?? '');
      leitor.onerror = () => reject(new Error('falha ao ler o PDF'));
      leitor.readAsDataURL(blob);
    });
  }
}
