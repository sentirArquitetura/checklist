import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CANAIS } from '../../core/canais';
import { rolarPara } from '../../core/rolar';

/** Alturas fixas do espectro: dá ritmo à faixa sem sugerir dado nenhum. */
const ALTURAS = [62, 44, 78, 52, 88, 40, 70, 58, 34, 66];

@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  protected readonly canais = CANAIS.map((canal, i) => ({ ...canal, altura: ALTURAS[i] }));

  protected ir(id: string): void {
    rolarPara(id);
  }
}
