import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CANAIS } from '../../core/canais';
import { Funil } from '../../core/funil';

/**
 * O corte sensorial: dez faixas empilhadas, uma por canal.
 * As marcadas avançam e ganham cor; as demais ficam curtas e neutras.
 * É o resumo visual do diagnóstico e a assinatura da página.
 */
@Component({
  selector: 'app-mapa-sensorial',
  templateUrl: './mapa-sensorial.html',
  styleUrl: './mapa-sensorial.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapaSensorial {
  protected readonly funil = inject(Funil);
  protected readonly canais = CANAIS;
}
