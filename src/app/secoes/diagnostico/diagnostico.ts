import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CANAIS } from '../../core/canais';
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
  protected readonly canais = CANAIS;

  protected alternar(id: string): void {
    this.funil.alternar(id);
  }

  /** Abre a seção com o checklist respondido e leva o visitante até ela. */
  protected visualizarResultado(): void {
    this.funil.abrirRelatorio();
    setTimeout(() => rolarPara('relatorio'), 120);
  }

  protected ir(id: string): void {
    rolarPara(id);
  }
}
