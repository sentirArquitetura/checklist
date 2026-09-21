import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SENTIR, linkWhatsapp, whatsappLegivel } from '../../core/config';

@Component({
  selector: 'app-rodape',
  templateUrl: './rodape.html',
  styleUrl: './rodape.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Rodape {
  protected readonly ano = new Date().getFullYear();
  protected readonly instagram = SENTIR.instagram;
  protected readonly whatsapp = linkWhatsapp();
  protected readonly telefone = whatsappLegivel();
}
