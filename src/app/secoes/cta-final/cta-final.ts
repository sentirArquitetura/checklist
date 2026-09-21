import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { linkWhatsapp } from '../../core/config';
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

  protected link(): string {
    const total = this.funil.total();
    return total > 0 ? linkWhatsapp(`Marquei ${total} de 10 sinais no checklist.`) : linkWhatsapp();
  }
}
