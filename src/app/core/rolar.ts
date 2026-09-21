/** Leva o visitante até uma seção, respeitando quem prefere menos movimento. */
export function rolarPara(id: string): void {
  const alvo = document.getElementById(id);
  if (!alvo) return;

  const menosMovimento =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  alvo.scrollIntoView({ behavior: menosMovimento ? 'auto' : 'smooth', block: 'start' });
}
