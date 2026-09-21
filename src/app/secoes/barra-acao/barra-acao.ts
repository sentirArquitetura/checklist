import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { linkWhatsapp } from '../../core/config';
import { Funil } from '../../core/funil';
import { rolarPara } from '../../core/rolar';

/**
 * Barra fixa que acompanha o visitante durante o checklist.
 * Mostra a contagem e troca a ação conforme onde ele está na página.
 */
@Component({
  selector: 'app-barra-acao',
  templateUrl: './barra-acao.html',
  styleUrl: './barra-acao.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarraAcao implements OnDestroy {
  protected readonly funil = inject(Funil);

  private readonly passouChecklist = signal(false);
  private readonly chegouNoFim = signal(false);
  protected readonly resultadoNaTela = signal(false);

  protected readonly visivel = computed(
    () =>
      this.funil.liberado() &&
      this.funil.comecouDiagnostico() &&
      this.passouChecklist() &&
      !this.chegouNoFim(),
  );

  protected readonly link = computed(() =>
    linkWhatsapp(`Marquei ${this.funil.total()} de 10 sinais no checklist.`),
  );

  private aoRolar = () => {};

  constructor() {
    afterNextRender(() => {
      let agendado = false;

      const medir = () => {
        agendado = false;
        const altura = window.innerHeight;

        const checklist = document.getElementById('diagnostico');
        this.passouChecklist.set(
          !!checklist && checklist.getBoundingClientRect().top < altura * 0.45,
        );

        const fim = document.getElementById('conversar');
        this.chegouNoFim.set(!!fim && fim.getBoundingClientRect().top < altura * 0.85);

        const resultado = document.getElementById('resultado');
        this.resultadoNaTela.set(
          !!resultado && resultado.getBoundingClientRect().top < altura * 0.75,
        );
      };

      this.aoRolar = () => {
        if (agendado) return;
        agendado = true;
        requestAnimationFrame(medir);
      };

      window.addEventListener('scroll', this.aoRolar, { passive: true });
      window.addEventListener('resize', this.aoRolar, { passive: true });
      medir();
    });
  }

  protected verResultado(): void {
    rolarPara('resultado');
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.aoRolar);
    window.removeEventListener('resize', this.aoRolar);
  }
}
