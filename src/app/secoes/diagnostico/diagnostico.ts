import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CANAIS } from '../../core/canais';
import { linkWhatsapp } from '../../core/config';
import { Entrega } from '../../core/entrega';
import { Funil } from '../../core/funil';
import { Revelar } from '../../core/revelar';
import { rolarPara } from '../../core/rolar';
import { MapaSensorial } from './mapa-sensorial';

@Component({
  selector: 'app-diagnostico',
  imports: [MapaSensorial, Revelar],
  templateUrl: './diagnostico.html',
  styleUrl: './diagnostico.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Diagnostico {
  protected readonly funil = inject(Funil);
  protected readonly entrega = inject(Entrega);
  protected readonly canais = CANAIS;

  protected readonly ocupado = computed(
    () => this.entrega.estado() === 'gerando' || this.entrega.estado() === 'enviando',
  );

  /** Leva o resultado do checklist junto para a conversa no WhatsApp. */
  protected readonly link = computed(() => {
    const marcados = this.funil.canaisMarcados();
    if (marcados.length === 0) return linkWhatsapp();

    const nomes = marcados.map((c) => c.nome.toLowerCase());
    const lista =
      nomes.length === 1 ? nomes[0] : `${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}`;
    return linkWhatsapp(`Marquei ${marcados.length} de 10 sinais: ${lista}.`);
  });

  protected alternar(id: string): void {
    this.funil.alternar(id);
  }

  protected baixarPdf(): void {
    const resultado = this.resultado();
    if (resultado) void this.entrega.baixar(resultado);
  }

  protected enviarPdf(): void {
    const resultado = this.resultado();
    if (resultado) void this.entrega.enviarPorEmail(resultado);
  }

  private resultado() {
    const lead = this.funil.lead();
    if (!lead) return null;
    return {
      lead,
      marcados: this.funil.marcados(),
      total: this.funil.total(),
      alerta: this.funil.alerta(),
    };
  }

  protected ir(id: string): void {
    rolarPara(id);
  }
}
