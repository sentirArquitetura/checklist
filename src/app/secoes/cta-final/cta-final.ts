import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Funil } from '../../core/funil';
import { Revelar } from '../../core/revelar';

@Component({
  selector: 'app-cta-final',
  imports: [Revelar],
  templateUrl: './cta-final.html',
  styleUrl: './cta-final.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtaFinal {
  private readonly funil = inject(Funil);

  protected readonly link = this.funil.linkConversa;
}
