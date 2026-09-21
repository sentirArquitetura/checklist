import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Revelar } from '../../core/revelar';

@Component({
  selector: 'app-sentir',
  imports: [Revelar],
  templateUrl: './sentir.html',
  styleUrl: './sentir.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sentir {
  /** Enquanto a foto do projeto não estiver em public/imagens, mostramos a moldura vazia. */
  protected readonly semFoto = signal(false);
}
