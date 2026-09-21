import { Directive, ElementRef, OnDestroy, afterNextRender, inject, input } from '@angular/core';

/**
 * Revela o elemento quando ele entra na tela.
 * Sem animação nenhuma quando o sistema pede menos movimento.
 */
@Directive({
  selector: '[appRevelar]',
  host: { class: 'revelar' },
})
export class Revelar implements OnDestroy {
  /** Atraso em milissegundos, para escalonar itens de uma mesma lista. */
  readonly atraso = input(0, {
    alias: 'appRevelar',
    transform: (valor: number | string) => Number(valor) || 0,
  });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private observador?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      const menosMovimento =
        typeof matchMedia === 'function' &&
        matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (menosMovimento || typeof IntersectionObserver === 'undefined') {
        this.host.classList.add('visivel');
        return;
      }

      this.host.style.transitionDelay = `${this.atraso()}ms`;
      this.observador = new IntersectionObserver(
        (entradas) => {
          for (const entrada of entradas) {
            if (entrada.isIntersecting) {
              this.host.classList.add('visivel');
              this.observador?.disconnect();
            }
          }
        },
        { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
      );
      this.observador.observe(this.host);
    });
  }

  ngOnDestroy(): void {
    this.observador?.disconnect();
  }
}
