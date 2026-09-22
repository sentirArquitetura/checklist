import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Funil } from '../../core/funil';
import { Revelar } from '../../core/revelar';
import { rolarPara } from '../../core/rolar';

@Component({
  selector: 'app-captura',
  imports: [ReactiveFormsModule, Revelar],
  templateUrl: './captura.html',
  styleUrl: './captura.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Captura {
  protected readonly funil = inject(Funil);
  private readonly fb = inject(FormBuilder);

  protected readonly tentouEnviar = signal(false);

  protected readonly formulario = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    empresa: ['', ],
    cargo: ['', ],
    whatsapp: ['', [Validators.required, Validators.pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/)]],
    email: ['', ],
  });

  /** Mostra o erro só depois que o campo foi tocado ou o envio foi tentado. */
  protected invalido(campo: string): boolean {
    const controle = this.formulario.get(campo);
    return !!controle && controle.invalid && (controle.touched || this.tentouEnviar());
  }

  /** Formata o telefone enquanto a pessoa digita: (21) 99999-9999. */
  protected formatarWhatsapp(evento: Event): void {
    const alvo = evento.target as HTMLInputElement;
    const digitos = alvo.value.replace(/\D/g, '').slice(0, 11);

    let texto = digitos;
    if (digitos.length > 2) {
      const corpo = digitos.slice(2);
      const corte = digitos.length > 10 ? 5 : 4;
      texto = `(${digitos.slice(0, 2)}) ${corpo.slice(0, corte)}`;
      if (corpo.length > corte) {
        texto += `-${corpo.slice(corte)}`;
      }
    }

    this.formulario.controls.whatsapp.setValue(texto, { emitEvent: false });
    alvo.value = texto;
  }

  protected async enviar(): Promise<void> {
    this.tentouEnviar.set(true);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      const primeiro = document.querySelector<HTMLElement>('.campo__erro');
      primeiro?.closest('.campo')?.querySelector('input')?.focus();
      return;
    }

    const ok = await this.funil.registrar(this.formulario.getRawValue());
    if (ok) {
      setTimeout(() => rolarPara('diagnostico'), 120);
    }
  }

  protected ir(id: string): void {
    rolarPara(id);
  }
}
