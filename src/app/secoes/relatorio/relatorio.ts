import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CANAIS } from '../../core/canais';
import { identificacao, veredito } from '../../core/checklist-pdf';
import { SENTIR, whatsappLegivel } from '../../core/config';
import { Entrega } from '../../core/entrega';
import { Funil } from '../../core/funil';

/**
 * O checklist respondido na tela, com a mesma diagramação do PDF.
 * Aparece depois de "Visualizar Resultado" e reúne as duas saídas do funil:
 * baixar o PDF e mandar o resultado para a Sentir pelo WhatsApp.
 */
@Component({
  selector: 'app-relatorio',
  templateUrl: './relatorio.html',
  styleUrl: './relatorio.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Relatorio {
  protected readonly funil = inject(Funil);
  protected readonly entrega = inject(Entrega);
  protected readonly canais = CANAIS;
  protected readonly email = SENTIR.email;
  protected readonly telefone = whatsappLegivel();

  protected readonly identificacao = computed(() => {
    const lead = this.funil.lead();
    return lead ? identificacao(lead) : '';
  });

  protected readonly respondidoEm = computed(() => {
    const lead = this.funil.lead();
    return lead ? new Date(lead.enviadoEm).toLocaleDateString('pt-BR') : '';
  });

  protected readonly veredito = computed(() => veredito(this.funil.alerta()).join(' '));

  protected baixarPdf(): void {
    const resultado = this.funil.resultado();
    if (resultado) void this.entrega.baixar(resultado);
  }
}
