import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BarraAcao } from './secoes/barra-acao/barra-acao';
import { Captura } from './secoes/captura/captura';
import { CtaFinal } from './secoes/cta-final/cta-final';
import { Diagnostico } from './secoes/diagnostico/diagnostico';
import { Hero } from './secoes/hero/hero';
import { Rodape } from './secoes/rodape/rodape';
import { Sentir } from './secoes/sentir/sentir';

@Component({
  selector: 'app-root',
  imports: [Hero, Captura, Diagnostico, Sentir, CtaFinal, Rodape, BarraAcao],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
